// Study for fun – the only server code. `ask` runs one STEP of building / checking a practice set with Claude: the app
// sends the step's name (a closed list) and structured data; the prompts, the rules, the model, effort and limits of each
// step live on the server (functions/prompts.js), so the app cannot use the AI for anything else.
// The Anthropic API key stays here as a secret and never reaches the browser.
//
//   firebase functions:secrets:set ANTHROPIC_API_KEY
//
const { onCall: onCallRaw, HttpsError } = require('firebase-functions/v2/https');
// every call logs one short line: which function, ok or which error (no prompt text, no personal data)
// The app admins' server log (serverLog, read in the app: ☰ → ניהול האפליקציה → יומן שרת): failures, slow calls
// (a timeout at 540 s cannot write anything – a call over 7 minutes is the warning) and model fallbacks.
// No prompt text and no personal data; at most 500 entries a day, so nobody can flood it.
async function serverLog(entry) {
  try {
    const d = getFirestore(), cnt = d.doc(`meta/serverlog_${new Date().toISOString().slice(0, 10)}`);
    const ok = await d.runTransaction(async t => { const c = await t.get(cnt), n = (c.exists && c.data().n) || 0; if (n >= 500) return false; t.set(cnt, { n: n + 1 }, { merge: true }); return true; });
    if (ok) await d.collection('serverLog').add({ at: Date.now(), ...entry });
  } catch (_) {}
}
const SLOW_MS = 5 * 60 * 1000;                // a call this slow is noted in the server log
const AI_TIMEOUT_MS = 7 * 60 * 1000;          // one AI request at most (the function itself is killed at 9 minutes)
const onCall = (opts, fn) => onCallRaw(opts, async (req) => {
  const t = Date.now(), name = (fn.name || 'call');
  try { const r = await fn(req); const ms = Date.now() - t; console.log(`${name} ok ${ms}ms`);
    if (ms > SLOW_MS) await serverLog({ fn: name, kind: 'slow', code: 'ok', msg: 'slow call – over 5 minutes (an AI request stops at 7)', ms });
    return r; }
  catch (e) {
    console.warn(`${name} failed: ${e.code || ''} ${e.message || e} ${Date.now() - t}ms`);
    await serverLog({ fn: name, kind: 'error', code: String(e.code || e.name || 'error').slice(0, 60), msg: String(e.message || e).slice(0, 300), ms: Date.now() - t });
    const fam = req.data && req.data.famId, uid = req.auth && req.auth.uid;
    const google = req.auth && req.auth.token && req.auth.token.firebase && (req.auth.token.firebase.sign_in_provider === 'google.com' || (req.auth.token.firebase.sign_in_provider !== 'anonymous' && req.auth.token.email_verified === true));   // a parent (Google or a verified email link)
    if (typeof fam === 'string' && /^[A-Za-z0-9_-]{6,128}$/.test(fam) && e.code !== 'resource-exhausted' && uid && google) {
      try {
        // only into the caller's own family: the owner, or a member (a stranger's famId writes nothing)
        const member = fam === uid || (await getFirestore().doc(`families/${fam}/members/${uid}`).get()).exists;
        if (member) await getFirestore().collection(`families/${fam}/errlog`).add({ at: Date.now(), where: 'server:' + name, code: String(e.code || e.name || 'error'),
        msg: String(e.message || e).slice(0, 300), subject: '', ver: 'server', by: '' }); } catch (_) {}
    }
    throw e;
  }
});
const { defineSecret, defineString } = require('firebase-functions/params');
const admin = require('firebase-admin');
const Anthropic = require('@anthropic-ai/sdk').default;
admin.initializeApp();
const { getFirestore, FieldValue, FieldPath } = require('firebase-admin/firestore');
const db = getFirestore();

const ANTHROPIC_API_KEY = defineSecret('ANTHROPIC_API_KEY');

const { SYSTEM, STEPS, Bad } = require('./prompts');

// ---- limits ------------------------------------------------------------------------------
// Every family gets FREE_BUILDS new practice sets a month. More need a paid credit (PRICE_ILS each),
// added to families/{f}/billing/main.credits by the payment provider's webhook once payments open.
// Small AI edits outside a build (fix a question, add pictures) are capped by LIGHT_CALLS a month.
// The whole app stops calling the AI for the day once the day's estimated spend reaches DAILY_CAP_USD (no monthly cap for now:
// MONTHLY_CAP_USD = Infinity; the month is still recorded in meta/ai_spend_<month>).
const FREE_BUILDS = 3;
const PRICE_ILS = 5;
const LIGHT_CALLS = 40;
// AI calls one build may make – counted for the largest build the wizard allows: 10 chapters (defChapters: 5-10) × 20
// questions (the chapter stepper: 5-20) = 200 questions, at most 30 topics (the wizard and prompts.js refuse more).
//   scan 1 + match 1 + select 1 + write 10 (one per chapter) + coverage ≤ 30 (one per topic left with no question;
//   every topic has a chapter, so normally 0) + pictures ≤ 2 rounds × ⌈200/12⌉ = 34 + blind solve ⌈200/40⌉ = 5
//   + review 10 (one per chapter) + fix 10 + re-solve of the fixed 10 + re-review with their chapter 10
//   = 1+1+1+10+30+34+5+10+10+10+10 = 122. A typical build (6 chapters × 10 questions) makes ~30 calls.
const BUILD_CALLS = 125;
const BUILD_HOURS = 3;                        // a build token is valid this long
const MONTHLY_CAP_USD = Infinity;            // no monthly cap for now (the owner's decision); the daily cap protects
const DAILY_CAP_USD = 100;                    // the whole app, per day (Israel time)
// One family may use at most this much of the month's AI budget (3 normal builds cost far less),
// so a single account can never use up the whole app's budget. Admins have no family limit.
const FAMILY_CAP_USD = 8;
const REFUNDS_PER_MONTH = 2;
// A teacher's quota is the teacher's – for all their groups together (teachers/{uid}/usage/{month}), never per group, and
// apart from any family of their own. The first build is free to try; after that only with MIN_STUDENTS approved students.
const TEACHER_FREE_BUILDS = 5;
const TEACHER_CAP_USD = 12;
const MIN_STUDENTS = 3;                  // failed-at-the-start builds given back per family per month
// USD per 1M tokens: [input, output] – the models the steps use AND the models the API may fall back to on a refusal,
// so a fallback is never counted at a cheaper rate. An unknown model is counted at the most expensive rate here.
const PRICE = {
  'claude-haiku-5-5': [0.10, 0.50], 'claude-haiku-4-5': [1, 5],
  'claude-sonnet-5-5': [2, 10], 'claude-sonnet-5': [2, 10], 'claude-sonnet-4-6': [3, 15],
  'claude-opus-5-5': [4, 20], 'claude-opus-5': [5, 25], 'claude-opus-4-8': [5, 25], 'claude-opus-4-7': [5, 25], 'claude-opus-4-6': [5, 25],
  'claude-fable-5-2': [8, 40]
};
const PRICE_TOP = Object.values(PRICE).reduce((a, p) => p[1] > a[1] ? p : a);
const FALLBACK_TO = { 'claude-opus-5-5': ['claude-opus-5', 'claude-opus-4-8'], 'claude-sonnet-5-5': ['claude-sonnet-5'] };   // fallbacks: 'default'
const priceOf = m => PRICE[m] || PRICE_TOP;
const ADMIN_EMAILS = defineString('ADMIN_EMAILS', { default: '' });   // comma-separated, no family limits

function monthKey(d = new Date()) {           // Israel time, e.g. "2026-11"
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem', year: 'numeric', month: '2-digit' }).format(d).slice(0, 7);
}
function isAdminUser(auth) {
  const list = ADMIN_EMAILS.value().split(',').map(x => x.trim().toLowerCase()).filter(Boolean);
  const google = auth.token.firebase?.sign_in_provider === 'google.com';   // Google accounts' emails are Google's own
  return !!auth.token.email && (google || auth.token.email_verified === true) && list.includes(auth.token.email.toLowerCase());
}
function parentOnly(request) {
  const auth = request.auth;
  // a parent: Google, or an email sign-in link (verified address); never a kid device (anonymous) or an unverified email
  if (!auth || auth.token.firebase?.sign_in_provider === 'anonymous'
      || (auth.token.firebase?.sign_in_provider !== 'google.com' && auth.token.email_verified !== true)) {
    throw new HttpsError('permission-denied', 'Only a signed-in parent can build practices.');
  }
  return auth;
}
// the caller must be the family's founder or an adult member of it – or the teacher of a group (kind 'class', ownerUid)
async function checkFamily(uid, famId) {
  if (typeof famId !== 'string' || !/^[A-Za-z0-9_-]{6,128}$/.test(famId)) throw new HttpsError('invalid-argument', 'Missing family.');
  if (uid === famId) return;
  const m = await db.doc(`families/${famId}/members/${uid}`).get();
  if (m.exists) return;
  const f = await db.doc(`families/${famId}`).get();
  if (f.exists && f.data().kind === 'class' && f.data().ownerUid === uid) return;
  throw new HttpsError('permission-denied', 'Not a member of this family.');
}
async function checkBudget() {
  const g = await db.doc(`meta/ai_spend_${monthKey()}`).get();
  const day = await db.doc(`meta/ai_day_${dayKey()}`).get();
  if ((g.data()?.usd || 0) >= MONTHLY_CAP_USD || (day.data()?.usd || 0) >= DAILY_CAP_USD) throw new HttpsError('resource-exhausted', 'budget', { reason: 'budget' });
}
// this family's share of the month's AI spend (checked after checkFamily, so famId is valid)
async function checkFamilyBudget(auth, famId) {
  if (isAdminUser(auth)) return;
  const sc = await scopeOf(famId), u = await sc.usage().get();
  if ((u.data()?.usd || 0) >= sc.cap) throw new HttpsError('resource-exhausted', sc.capReason, { reason: sc.capReason, cap: sc.cap });
}
// once a day, when the AI spend passes 80% of the daily cap: a line in the server log (red dot for the app admins, and the alert email)
async function spendAlert() {
  const ref = db.doc(`meta/ai_day_${dayKey()}`);
  const hit = await db.runTransaction(async t => { const d = (await t.get(ref)).data() || {};
    if ((d.usd || 0) < DAILY_CAP_USD * 0.8 || d.alert80) return 0; t.set(ref, { alert80: Date.now() }, { merge: true }); return d.usd; });
  if (hit) await serverLog({ fn: 'ask', kind: 'budget', code: '80%', msg: `AI spend today: $${hit.toFixed(2)} of the $${DAILY_CAP_USD} daily cap`, ms: 0 });
}
function dayKey(d = new Date()) {             // Israel time, e.g. "2026-11-20"
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}
const famOk = f => typeof f === 'string' && /^[A-Za-z0-9_-]{6,128}$/.test(f);
// Whose quota a family id counts against: a family's own (families/{f}/usage), or a group's teacher (teachers/{owner}/usage).
// kind and ownerUid never change (rules + the server), so the answer is kept for the life of the instance.
const SCOPES = new Map();
async function scopeOf(famId) {
  if (!famOk(famId)) return null;
  let s = SCOPES.get(famId);
  if (!s) { const f = await db.doc(`families/${famId}`).get(), d = f.exists ? f.data() : {};
    s = d.kind === 'class' && typeof d.ownerUid === 'string' ? { cls: true, owner: d.ownerUid, priv: d.teach === 'private' } : { cls: false };
    if (f.exists) SCOPES.set(famId, s); }
  return s.cls
    /* a teacher's two worlds keep apart: the school's classes (usage/{month}) and the private students (usage/{month}-private) */
    ? { ...s, usage: (m = monthKey()) => db.doc(`teachers/${s.owner}/usage/${m}${s.priv ? '-private' : ''}`), free: TEACHER_FREE_BUILDS, cap: TEACHER_CAP_USD, capReason: 'teacher_budget' }
    : { ...s, usage: (m = monthKey()) => db.doc(`families/${famId}/usage/${m}`), free: FREE_BUILDS, cap: FAMILY_CAP_USD, capReason: 'family_budget' };
}
// the price of one answer: every attempt (usage.iterations when the API fell back) at the dearer of the asked and the served model
function usdOf(model, u) {
  const [pi, po] = priceOf(model);
  const inTok = (u.input_tokens || 0) + (u.cache_creation_input_tokens || 0) * 1.25 + (u.cache_read_input_tokens || 0) * 0.1;
  return (inTok * pi + (u.output_tokens || 0) * po) / 1e6;
}
function costOf(asked, msg) {
  // each attempt names its model (usage.iterations); without one, the dearer of the asked and the served model
  const served = msg.model || asked, m = priceOf(served)[1] > priceOf(asked)[1] ? served : asked;
  const its = Array.isArray(msg.usage?.iterations) && msg.usage.iterations.length ? msg.usage.iterations : [msg.usage || {}];
  return its.reduce((a, u) => a + usdOf((u && u.model) || m, u || {}), 0);
}
// Reserve the most a call can cost (its input estimate + max_tokens, at the dearest model it may run on) BEFORE the call,
// so calls running in parallel can never pass a cap together; settle the real cost after. A reservation is kept in a
// map on the month / day / family documents; one older than RES_TTL (a call that never returned) no longer counts.
const RES_TTL = 15 * 60 * 1000;
function liveRes(d) { let sum = 0; const stale = [], now = Date.now();
  for (const [k, v] of Object.entries((d && d.res) || {})) { if (v && now - (+v.at || 0) < RES_TTL) sum += +v.usd || 0; else stale.push(k); }
  return { sum, stale }; }
async function reserve(admin, famId, usd, id) {
  const refs = [[db.doc(`meta/ai_spend_${monthKey()}`), MONTHLY_CAP_USD, 'budget'], [db.doc(`meta/ai_day_${dayKey()}`), DAILY_CAP_USD, 'budget']];
  const sc = await scopeOf(famId);
  if (sc) refs.push([sc.usage(), admin ? Infinity : sc.cap, sc.capReason]);
  await db.runTransaction(async t => {
    const snaps = await Promise.all(refs.map(([r]) => t.get(r)));
    const live = snaps.map((sn, k) => { const d = sn.data() || {}, L = liveRes(d);
      if ((d.usd || 0) + L.sum + usd > refs[k][1]) throw new HttpsError('resource-exhausted', refs[k][2], { reason: refs[k][2], ...(k === 2 ? { cap: sc.cap } : {}) });
      return L; });
    snaps.forEach((sn, k) => { const r = refs[k][0], mine = { usd, at: Date.now() };
      if (sn.exists) t.update(r, { [`res.${id}`]: mine, ...Object.fromEntries(live[k].stale.filter(x => /^[A-Za-z0-9]+$/.test(x)).map(x => [`res.${x}`, FieldValue.delete()])) });
      else t.set(r, { res: { [id]: mine }, ...(k === 2 ? { month: monthKey() } : {}) }, { merge: true }); });
  });
}
// the real cost: the month (total, calls, per step), the day, the family, the build (total and per step)
async function settle(famId, id, step, buildId, usd, ran = true) {   // ran = false: the call never happened – only the reservation goes
  const inc = FieldValue.increment, del = FieldValue.delete();
  const per = ran ? { [`steps.${step}.usd`]: inc(usd), [`steps.${step}.calls`]: inc(1) } : {}, n = ran ? { usd: inc(usd), calls: inc(1) } : {};
  const w = [db.doc(`meta/ai_spend_${monthKey()}`).update({ [`res.${id}`]: del, ...n, ...per }),
    db.doc(`meta/ai_day_${dayKey()}`).update({ [`res.${id}`]: del, ...n })];
  const sc = await scopeOf(famId).catch(() => null);
  if (sc) {
    w.push(sc.usage().update({ [`res.${id}`]: del, ...(ran ? { usd: inc(usd) } : {}), month: monthKey() }));
    if (ran && typeof buildId === 'string' && /^[A-Za-z0-9]{1,40}$/.test(buildId)) w.push(db.doc(`families/${famId}/builds/${buildId}`).update({ usd: inc(usd), ...per }));
  }
  await Promise.all(w.map(p => p.catch(e => console.error('settle', e.message))));
  await spendAlert().catch(() => {});
}

// A teacher's new group: families/{random 20-character id} with kind 'class' and ownerUid – made here only, so the id is never
// someone's uid and a teacher has at most MAX_CLASSES groups (counted in teachers/{uid}, which no client can write).
const MAX_CLASSES = 10;
exports.createClass = onCall({ region: 'europe-west1', invoker: 'public', maxInstances: 5 }, async function createClass(request) {
  const auth = parentOnly(request);
  const d = request.data || {};
  const teach = d.teach === 'private' ? 'private' : d.teach === 'class' ? 'class' : null;
  const name = typeof d.name === 'string' ? d.name.replace(/[<>]/g, '').trim().slice(0, 40) : '';
  const grade = Number.isInteger(d.grade) && d.grade >= 0 && d.grade <= 11 ? d.grade : null;
  const subject = typeof d.subject === 'string' ? d.subject.replace(/[<>]/g, '').trim().slice(0, 40) : '';
  if (!teach || !name || grade === null) throw new HttpsError('invalid-argument', 'bad_input');
  const tref = db.doc(`teachers/${auth.uid}`), cref = db.collection('families').doc();      // a random 20-character id
  const tok = () => require('crypto').randomBytes(18).toString('hex');
  await db.runTransaction(async tx => {
    const t = await tx.get(tref), have = (t.exists && Array.isArray(t.data().classes)) ? t.data().classes : [];
    if (have.length >= MAX_CLASSES) throw new HttpsError('resource-exhausted', 'class_limit', { reason: 'class_limit', max: MAX_CLASSES });
    // the teacher's name is shown to the parents on the consent page; fam/info is all a student's phone reads of the group
    const teacherName = String(auth.token.name || (auth.token.email || '').split('@')[0] || '').replace(/[<>]/g, '').slice(0, 60);
    tx.set(cref, { kind: 'class', ownerUid: auth.uid, teacherName, teach, name, grade, subject, inviteToken: tok(), kidTokens: {}, createdAt: Date.now() });
    tx.set(db.doc(`families/${cref.id}/fam/info`), { kind: 'class', teacher: teacherName, name, grade, subject });
    tx.set(tref, { classes: FieldValue.arrayUnion(cref.id), at: Date.now() }, { merge: true });
    tx.set(db.doc(`users/${auth.uid}`), { classes: FieldValue.arrayUnion(cref.id), roles: FieldValue.arrayUnion('teacher'), teach, worlds: FieldValue.arrayUnion(teach === 'private' ? 'private' : 'school') }, { merge: true });
  });
  return { classId: cref.id };
});

// A teacher's group goes: everything in it (students, progress, consents, requests, sets), and it leaves the teacher's
// count (teachers/{uid}) and list (users/{uid}.classes) – only here, so the count of 10 always comes down with it.
// the kid phones of a family or a group: their anonymous sign-in accounts (devices/{uid} – the document id is the phone's uid)
async function deviceUids(famPath) { return (await db.collection(`${famPath}/devices`).select().get()).docs.map(d => d.id); }
async function deleteAuthUsers(uids) {
  const { getAuth } = require('firebase-admin/auth'); let failed = 0;
  for (let i = 0; i < uids.length; i += 1000) { const r = await getAuth().deleteUsers(uids.slice(i, i + 1000)); failed += r.failureCount; }
  if (failed) throw new Error(`auth users not deleted: ${failed}`);
}
// a whole group goes (deleteClass, deleteAccount): its documents, its students' phones' accounts, and it leaves the teacher's
// count (teachers/{uid}) and list (users/{uid}.classes) – the one place for it, so the count of 10 always comes down with it
async function wipeClass(id, ownerUid) {
  const ref = db.doc(`families/${id}`), phones = await deviceUids(ref.path);
  await db.recursiveDelete(ref);
  await deleteAuthUsers(phones);
  await db.doc(`teachers/${ownerUid}`).set({ classes: FieldValue.arrayRemove(id), at: Date.now() }, { merge: true });
  await db.doc(`users/${ownerUid}`).set({ classes: FieldValue.arrayRemove(id) }, { merge: true });
  return phones.length;
}
exports.deleteClass = onCall({ region: 'europe-west1', invoker: 'public', maxInstances: 5 }, async function deleteClass(request) {
  const auth = parentOnly(request);
  const id = request.data && request.data.classId;
  if (typeof id !== 'string' || !/^[A-Za-z0-9]{20}$/.test(id)) throw new HttpsError('invalid-argument', 'Missing group.');
  const ref = db.doc(`families/${id}`), f = await ref.get();
  if (!f.exists || f.data().kind !== 'class' || f.data().ownerUid !== auth.uid) throw new HttpsError('permission-denied', 'Not your group.');
  await wipeClass(id, auth.uid);
  return { ok: true };
});

/* Deleting an account – everything of this adult, on the server (the phone may not delete most of it): the own family with
   all in it (kids, sets, progress, phones, invitations, builds, usage, billing…) and its kids' phones' sign-in accounts; every
   group this adult teaches (as deleteClass); the teacher's record and quota; the account's own document; the memberships in
   other families (as a helper / a private tutor); the limits; bug reports and catalog suggestions they sent. Only when all of
   that went is the sign-in account deleted – a failure stops here and says so, nothing is left orphaned behind a deleted login.
   The sign-in must be recent (RECENT_LOGIN_MIN): the phone signs in again first. */
const RECENT_LOGIN_MIN = 10;
async function deleteWhere(col, field, val) {
  let n = 0;
  for (;;) { const q = await db.collection(col).where(field, '==', val).limit(300).get(); if (q.empty) return n;
    const b = db.batch(); q.docs.forEach(d => b.delete(d.ref)); await b.commit(); n += q.size; }
}
exports.deleteAccount = onCall({ region: 'europe-west1', invoker: 'public', timeoutSeconds: 540, maxInstances: 5 }, async function deleteAccount(request) {
  const auth = parentOnly(request), uid = auth.uid;
  if (!(Date.now() / 1000 - (auth.token.auth_time || 0) < RECENT_LOGIN_MIN * 60)) throw new HttpsError('failed-precondition', 'recent_login', { reason: 'recent_login' });
  const n = { classes: 0, phones: 0, memberships: 0, reports: 0 };
  // 1. the groups this adult teaches (by the group's own ownerUid – also one missing from users/{uid}.classes)
  for (const c of (await db.collection('families').where('ownerUid', '==', uid).get()).docs) { n.phones += await wipeClass(c.id, uid); n.classes++; }
  // 2. the own family (its id is the uid) and its kids' phones
  const own = db.doc(`families/${uid}`), ownPhones = await deviceUids(own.path);
  await db.recursiveDelete(own);
  await deleteAuthUsers(ownPhones); n.phones += ownPhones.length;
  // 3. memberships in other families: the account's list of families, and every invitation this account used
  const u = await db.doc(`users/${uid}`).get(), fams = new Set(((u.exists && u.data().fams) || []).filter(x => typeof x === 'string' && /^[A-Za-z0-9_-]{6,128}$/.test(x)));
  (await db.collectionGroup('invites').where('usedBy', '==', uid).get()).docs.forEach(d => fams.add(d.ref.parent.parent.id));
  fams.delete(uid);
  for (const f of fams) { const m = db.doc(`families/${f}/members/${uid}`); if ((await m.get()).exists) { await m.delete(); n.memberships++; } }
  // 4. the teacher's record and quota, the account's document, the limits, what they sent the app's team
  await db.recursiveDelete(db.doc(`teachers/${uid}`));
  await db.recursiveDelete(db.doc(`users/${uid}`));
  await Promise.all([db.doc(`bugLimits/${uid}`).delete(), db.doc(`joinLimits/${uid}`).delete()]);
  n.reports = await deleteWhere('bugReports', 'by', uid) + await deleteWhere('catalogSuggestions', 'by', uid);
  // 5. last: the sign-in account
  const { getAuth } = require('firebase-admin/auth');
  await getAuth().deleteUser(uid);
  await serverLog({ fn: 'deleteAccount', kind: 'info', code: 'ok', msg: `groups ${n.classes} · phones ${n.phones} · memberships ${n.memberships} · reports ${n.reports}` });
  return { ok: true, ...n };
});

/* ---------- parents' consent for a teacher's group (stage 2) ----------
   The teacher sends ONE link for the group (/?join=<classId>.<code>, 30 days, can be closed or replaced). A parent opens it
   with no account (anonymous sign-in), reads the letter, fills the form and signs with a finger → requestJoin keeps a
   pending request (families/{c}/joinReqs/{id}) and gives back a secret status key (the parent's own link
   /?req=<classId>.<id>.<key>; only its hash is kept). Only the teacher's approval (approveJoin) makes a student
   (fam/kids + kidpub/{kid}), the consent (consents/{kid}, status 'digital') and the kid's link (kidTokens[kid]) – the
   teacher never types in a student list, and there are no paper forms. Without such a consent no kid phone can join
   (firestore.rules). The parent or the teacher can withdraw it (revokeConsent): the student's progress,
   phones and link go. Everything here is written by the server only. */
const JOIN_DAYS = 30, MAX_STUDENTS = 40, MAX_PENDING = 60, REQ_PER_HOUR = 5;
const KID_COLORS = ['#2F6BFF', '#FF5C8A', '#24C78E', '#F2A63B', '#B9A7FF', '#14A774', '#E5484D'];
const hex = n => require('crypto').randomBytes(n).toString('hex');
const sha = s => require('crypto').createHash('sha256').update(String(s)).digest('hex');
const txt = (v, n) => typeof v === 'string' ? v.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, n) : '';
const classIdOk = id => typeof id === 'string' && /^[A-Za-z0-9]{20}$/.test(id);
const kidIdOk = id => typeof id === 'string' && /^[A-Za-z0-9_-]{2,40}$/.test(id);
function signedIn(request) { if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in first.'); return request.auth; }
async function teacherOf(auth, classId) {
  if (!classIdOk(classId)) throw new HttpsError('invalid-argument', 'Missing group.');
  const ref = db.doc(`families/${classId}`), f = await ref.get();
  if (!f.exists || f.data().kind !== 'class' || (f.data().ownerUid !== auth.uid && !isAdminUser(auth))) throw new HttpsError('permission-denied', 'Not your group.');
  return { ref, d: f.data() };
}
async function groupByLink(classId, code) {
  if (!classIdOk(classId) || typeof code !== 'string' || !/^[a-f0-9]{8,40}$/.test(code)) throw new HttpsError('failed-precondition', 'link_bad', { reason: 'link_bad' });
  const [f, l] = await Promise.all([db.doc(`families/${classId}`).get(), db.doc(`families/${classId}/joinLink/main`).get()]);
  if (!f.exists || f.data().kind !== 'class' || !l.exists || l.data().code !== code) throw new HttpsError('failed-precondition', 'link_bad', { reason: 'link_bad' });
  if (!l.data().open) throw new HttpsError('failed-precondition', 'link_closed', { reason: 'link_closed' });
  if (l.data().exp < Date.now()) throw new HttpsError('failed-precondition', 'link_expired', { reason: 'link_expired' });
  return f.data();
}
// a signature: a small PNG (≤ ~20KB) drawn on a transparent canvas – a blank one (every pixel transparent) is refused
function sigOk(sig) {
  if (typeof sig !== 'string' || !sig.startsWith('data:image/png;base64,') || sig.length > 28000) return false;
  try {
    const b = Buffer.from(sig.slice(22), 'base64');
    if (b.readUInt32BE(12) !== 0x49484452) return false;                      // IHDR
    const w = b.readUInt32BE(16), h = b.readUInt32BE(20), depth = b[24], type = b[25];
    if (w < 50 || h < 20 || w > 1200 || h > 600 || depth !== 8 || type !== 6) return false;   // 8-bit RGBA
    const parts = []; let o = 8;
    while (o + 8 <= b.length) { const len = b.readUInt32BE(o), kind = b.toString('ascii', o + 4, o + 8); if (kind === 'IDAT') parts.push(b.subarray(o + 8, o + 8 + len)); o += 12 + len; }
    const raw = require('zlib').inflateSync(Buffer.concat(parts)), row = 1 + w * 4;
    let ink = 0;
    for (let y = 0; y < h && ink < 30; y++) for (let x = 1; x < row; x++) if (raw[y * row + x]) { ink++; if (ink >= 30) break; }
    return ink >= 30;
  } catch (_) { return false; }
}
function letterVOk(v) { return typeof v === 'string' && /^[0-9]{1,2}\.[0-9]{1,2}$/.test(v); }
async function newStudent(tx, ref, d, kidName, consent) {
  const kidsRef = db.doc(`${ref.path}/fam/kids`), ks = await tx.get(kidsRef), list = (ks.exists && Array.isArray(ks.data().list)) ? ks.data().list : [];
  if (list.length >= MAX_STUDENTS) throw new HttpsError('resource-exhausted', 'class_full', { reason: 'class_full', max: MAX_STUDENTS });
  const id = 'k' + hex(5), kid = { id, name: txt(kidName, 30), grade: Number.isInteger(d.grade) ? d.grade : 0, color: KID_COLORS[list.length % KID_COLORS.length] };
  return { id, kid, list, kidsRef, consent };
}
function writeStudent(tx, ref, s, withLink) {
  tx.set(s.kidsRef, { list: [...s.list, s.kid] });
  tx.set(db.doc(`${ref.path}/kidpub/${s.id}`), { list: [s.kid] });
  tx.set(db.doc(`${ref.path}/consents/${s.id}`), s.consent);
  if (withLink) tx.update(ref, new FieldPath('kidTokens', s.id), hex(16));
}

// the teacher's group link: get (made the first time), new (the old one stops working), close, open
exports.joinLink = onCall({ region: 'europe-west1', invoker: 'public', maxInstances: 5 }, async function joinLink(request) {
  const auth = parentOnly(request); const { classId, action = 'get' } = request.data || {};
  const { ref } = await teacherOf(auth, classId);
  const lref = db.doc(`${ref.path}/joinLink/main`);
  return db.runTransaction(async tx => {
    const l = await tx.get(lref), now = Date.now(); let d = l.exists ? l.data() : null;
    const fresh = () => ({ code: hex(8), exp: now + JOIN_DAYS * 864e5, open: true, at: now });
    if (!d || action === 'new' || (action === 'open' && d.exp < now)) d = fresh();
    else if (action === 'close') d = { ...d, open: false };
    else if (action === 'open') d = { ...d, open: true };
    tx.set(lref, d);
    return { code: d.code, exp: d.exp, open: d.open };
  });
});

// what a parent sees before signing: the teacher, the group (a closed / old / wrong link: refused)
exports.joinInfo = onCall({ region: 'europe-west1', invoker: 'public', maxInstances: 10 }, async function joinInfo(request) {
  signedIn(request); const { classId, code } = request.data || {};
  const d = await groupByLink(classId, code);
  return { teacher: d.teacherName || '', name: d.name || '', grade: d.grade, subject: d.subject || '', teach: d.teach };
});

// a parent's request: the letter's version, the parent's and the kid's names, a way to reach them (optional), the signature
exports.requestJoin = onCall({ region: 'europe-west1', invoker: 'public', maxInstances: 10 }, async function requestJoin(request) {
  const auth = signedIn(request); const r = request.data || {};
  const d = await groupByLink(r.classId, r.code);
  const parentName = txt(r.parentName, 60), kidName = txt(r.kidName, 30), contact = txt(r.contact, 80);
  if (parentName.length < 2 || kidName.length < 2 || r.agree !== true || !letterVOk(r.letterV)) throw new HttpsError('invalid-argument', 'bad_input', { reason: 'bad_input' });
  if (!sigOk(r.sig)) throw new HttpsError('invalid-argument', 'no_signature', { reason: 'no_signature' });
  // at most REQ_PER_HOUR requests an hour from one phone, and MAX_PENDING waiting in a group
  const lim = db.doc(`joinLimits/${auth.uid}`);
  await db.runTransaction(async tx => { const l = await tx.get(lim), now = Date.now(), t = ((l.exists && l.data().t) || []).filter(x => now - x < 36e5);
    if (t.length >= REQ_PER_HOUR) throw new HttpsError('resource-exhausted', 'too_many', { reason: 'too_many' });
    tx.set(lim, { t: [...t, now] }); });
  const reqs = db.collection(`families/${r.classId}/joinReqs`);
  const waiting = (await reqs.where('status', '==', 'pending').count().get()).data().count;
  if (waiting >= MAX_PENDING) throw new HttpsError('resource-exhausted', 'too_many_waiting', { reason: 'too_many_waiting' });
  const key = hex(18), ref = reqs.doc();
  await ref.set({ parentName, kidName, contact, sig: r.sig, letterV: r.letterV, at: Date.now(), status: 'pending', keyHash: sha(key), by: auth.uid });
  return { reqId: ref.id, statusKey: key, teacher: d.teacherName || '', name: d.name || '' };
});

// the parent's own status page (with the secret key): waiting / approved (+ the kid's link) / rejected (+ why) / withdrawn
exports.joinStatus = onCall({ region: 'europe-west1', invoker: 'public', maxInstances: 10 }, async function joinStatus(request) {
  signedIn(request); const { classId, reqId, statusKey } = request.data || {};
  const nf = () => new HttpsError('not-found', 'not_found', { reason: 'not_found' });
  if (!classIdOk(classId) || typeof reqId !== 'string' || !/^[A-Za-z0-9]{20}$/.test(reqId) || typeof statusKey !== 'string') throw nf();
  const [q, f] = await Promise.all([db.doc(`families/${classId}/joinReqs/${reqId}`).get(), db.doc(`families/${classId}`).get()]);
  if (!q.exists || !f.exists || q.data().keyHash !== sha(statusKey)) throw nf();
  const R = q.data(), F = f.data(), out = { status: R.status, kidName: R.kidName, parentName: R.parentName, teacher: F.teacherName || '', name: F.name || '', at: R.at, letterV: R.letterV };
  if (R.status === 'rejected') out.reason = R.reason || '';
  if (R.status === 'approved' && R.kidId) { const tok = (F.kidTokens || {})[R.kidId]; if (tok) { out.kidId = R.kidId; out.token = tok; } }
  return out;
});

// the teacher approves: a new student (with the consent and the kid's link) – or one more parent of a student already there
exports.approveJoin = onCall({ region: 'europe-west1', invoker: 'public', maxInstances: 5 }, async function approveJoin(request) {
  const auth = parentOnly(request); const { classId, reqId, attachTo } = request.data || {};
  const { ref } = await teacherOf(auth, classId);
  if (typeof reqId !== 'string' || !/^[A-Za-z0-9]{20}$/.test(reqId)) throw new HttpsError('invalid-argument', 'Missing request.');
  const qref = db.doc(`${ref.path}/joinReqs/${reqId}`);
  return db.runTransaction(async tx => {
    const [q, f] = await Promise.all([tx.get(qref), tx.get(ref)]);
    if (!q.exists || q.data().status !== 'pending') throw new HttpsError('failed-precondition', 'not_pending', { reason: 'not_pending' });
    const R = q.data(), now = Date.now(), parent = { parentName: R.parentName, contact: R.contact || '', sig: R.sig, letterV: R.letterV, at: R.at, reqId, approvedAt: now };
    let kidId;
    if (attachTo) {                                            // a second parent of the same student
      if (!kidIdOk(attachTo)) throw new HttpsError('invalid-argument', 'Missing student.');
      const cref = db.doc(`${ref.path}/consents/${attachTo}`), c = await tx.get(cref);
      if (!c.exists || c.data().status !== 'digital') throw new HttpsError('failed-precondition', 'no_student', { reason: 'no_student' });
      tx.update(cref, { parents: FieldValue.arrayUnion(parent) }); kidId = attachTo;
    } else {
      const s = await newStudent(tx, ref, f.data(), R.kidName, { status: 'digital', letterV: R.letterV, at: R.at, parentName: R.parentName, contact: R.contact || '', sig: R.sig, reqId, approvedBy: auth.uid, approvedAt: now, parents: [parent] });
      writeStudent(tx, ref, s, true); kidId = s.id;
    }
    tx.update(qref, { status: 'approved', kidId, sig: FieldValue.delete(), doneAt: now });   // the signature stays with the consent only
    return { kidId };
  });
});

exports.rejectJoin = onCall({ region: 'europe-west1', invoker: 'public', maxInstances: 5 }, async function rejectJoin(request) {
  const auth = parentOnly(request); const { classId, reqId, reason } = request.data || {};
  const { ref } = await teacherOf(auth, classId);
  if (typeof reqId !== 'string' || !/^[A-Za-z0-9]{20}$/.test(reqId)) throw new HttpsError('invalid-argument', 'Missing request.');
  const qref = db.doc(`${ref.path}/joinReqs/${reqId}`), q = await qref.get();
  if (!q.exists || q.data().status !== 'pending') throw new HttpsError('failed-precondition', 'not_pending', { reason: 'not_pending' });
  await qref.update({ status: 'rejected', reason: txt(reason, 200), sig: FieldValue.delete(), doneAt: Date.now() });   // a rejected signature is not kept
  return { ok: true };
});

// withdrawn – by the parent (the status key) or the teacher: the student's progress, phones and link go; a waiting request
// is simply withdrawn. The consent record keeps who and when, not the signatures.
async function dropStudent(classId, kidId, by) {
  const ref = db.doc(`families/${classId}`), now = Date.now();
  const devs = await db.collection(`${ref.path}/devices`).where('kid', '==', kidId).get();
  const reqs = await db.collection(`${ref.path}/joinReqs`).where('kidId', '==', kidId).get();
  const sets = await db.collection(`${ref.path}/sets`).where('set.kidId', '==', kidId).get();   // the student's practice sets carry the name
  await db.runTransaction(async tx => {
    const kidsRef = db.doc(`${ref.path}/fam/kids`), ks = await tx.get(kidsRef);
    const list = ((ks.exists && ks.data().list) || []).filter(k => k && k.id !== kidId);
    tx.set(kidsRef, { list });
    tx.delete(db.doc(`${ref.path}/kidpub/${kidId}`));
    tx.delete(db.doc(`${ref.path}/progress/${kidId}`));
    tx.delete(db.doc(`${ref.path}/notes/${kidId}`));               // the teacher's private notes
    tx.delete(db.doc(`${ref.path}/sched/${kidId}`));               // the private group's fixed lessons
    devs.docs.forEach(d => tx.delete(d.ref));
    sets.docs.forEach(d => tx.delete(d.ref));
    reqs.docs.forEach(d => tx.update(d.ref, { status: 'revoked', doneAt: now }));
    tx.update(ref, new FieldPath('kidTokens', kidId), FieldValue.delete());
    tx.set(db.doc(`${ref.path}/consents/${kidId}`), { status: 'revoked', revokedBy: by, revokedAt: now });
  });
}
exports.revokeConsent = onCall({ region: 'europe-west1', invoker: 'public', maxInstances: 5 }, async function revokeConsent(request) {
  const auth = signedIn(request); const { classId, kidId, reqId, statusKey } = request.data || {};
  if (statusKey) {                                             // the parent, from the status page
    if (!classIdOk(classId) || typeof reqId !== 'string' || !/^[A-Za-z0-9]{20}$/.test(reqId)) throw new HttpsError('not-found', 'not_found', { reason: 'not_found' });
    const qref = db.doc(`families/${classId}/joinReqs/${reqId}`), q = await qref.get();
    if (!q.exists || q.data().keyHash !== sha(statusKey)) throw new HttpsError('not-found', 'not_found', { reason: 'not_found' });
    const R = q.data();
    if (R.status === 'pending') { await qref.update({ status: 'withdrawn', sig: FieldValue.delete(), doneAt: Date.now() }); return { ok: true }; }
    if (R.status !== 'approved' || !R.kidId) return { ok: true };
    await dropStudent(classId, R.kidId, 'parent');
    return { ok: true };
  }
  const a = parentOnly(request); await teacherOf(a, classId);   // the teacher takes a student out of the group
  if (!kidIdOk(kidId)) throw new HttpsError('invalid-argument', 'Missing student.');
  await dropStudent(classId, kidId, 'teacher');
  return { ok: true };
});

// Every AI call is part of a build (buildId) or a small edit counted in the monthly "light" calls.
async function claimCall(admin, uid, famId, buildId) {
  if (admin) return;
  if (uid) await checkFamily(uid, famId);
  await db.runTransaction(async (tx) => {
    if (buildId) {
      const ref = db.doc(`families/${famId}/builds/${buildId}`), bd = await tx.get(ref);
      const d = bd.data();
      if (!bd.exists || d.status !== 'running' || Date.now() - d.at > BUILD_HOURS * 36e5) throw new HttpsError('failed-precondition', 'build_closed', { reason: 'build_closed' });
      if (d.calls >= BUILD_CALLS) throw new HttpsError('resource-exhausted', 'build_calls', { reason: 'build_calls' });
      tx.update(ref, { calls: FieldValue.increment(1) });
    } else {
      const ref = (await scopeOf(famId)).usage(), u = await tx.get(ref);
      if ((u.data()?.light || 0) >= LIGHT_CALLS) throw new HttpsError('resource-exhausted', 'light', { reason: 'light', limit: LIGHT_CALLS });
      tx.set(ref, { light: FieldValue.increment(1), month: monthKey() }, { merge: true });
    }
  });
}

// Admin: the registered accounts – name, email, dates, sign-in type. No kids, no practice sets, no progress.
exports.adminUsers = onCall({ region: 'europe-west1', invoker: 'public', maxInstances: 3 }, async function adminUsers(request) {
  const auth = parentOnly(request);
  if (!isAdminUser(auth)) throw new HttpsError('permission-denied', 'Admins only.');
  const { getAuth } = require('firebase-admin/auth');
  const parents = [], month = monthKey(); let kidDevices = 0, token;
  do {
    const page = await getAuth().listUsers(1000, token); token = page.pageToken;
    for (const u of page.users) {
      const prov = (u.providerData[0] || {}).providerId || 'anonymous';
      if (prov === 'anonymous' || !u.email) { kidDevices++; continue; }      // a kid's phone (joined with a kid link)
      parents.push({ uid: u.uid, name: u.displayName || '', email: u.email, created: Date.parse(u.metadata.creationTime) || 0,
        last: Date.parse(u.metadata.lastRefreshTime || u.metadata.lastSignInTime) || 0 });
    }
  } while (token && parents.length < 5000);
  // how many new practice sets each account built this month (a number only)
  await Promise.all(parents.map(async p => { try { p.builds = (await db.doc(`families/${p.uid}/usage/${month}`).get()).data()?.builds || 0; } catch (_) { p.builds = 0; } }));
  parents.sort((a, b) => b.last - a.last);
  return { parents: parents.map(({ uid, ...p }) => p), kidDevices, month };
});

// For the payment webhook (not exposed yet): add paid practice sets to a family.
async function grantCredits(famId, n, ref) {
  await db.runTransaction(async (tx) => {
    const pay = db.doc(`families/${famId}/billing/main/payments/${ref}`);
    if ((await tx.get(pay)).exists) return;                       // the same payment twice → once
    tx.set(pay, { n, at: Date.now() });
    tx.set(db.doc(`families/${famId}/billing/main`), { credits: FieldValue.increment(n) }, { merge: true });
  });
}
void grantCredits;   // called by the payment webhook once payments open

const MAX_IMAGES = 6;
const MAX_IMAGE_B64 = 5 * 1024 * 1024; // ~3.7 MB per image after base64
const MAX_PDF_B64 = 8.2 * 1024 * 1024;  // a 6 MB PDF after base64 (callable requests are limited to 10 MB)
const MAX_PDF_PAGES = 20;               // pages in all the PDFs of one call
const pdfPages = b64 => (Buffer.from(b64, 'base64').toString('latin1').match(/\/Type\s*\/Page(?![s\w])/g) || []).length;

function extractJson(text) {
  const t = String(text || '').replace(/```(?:json)?/gi, '').trim();
  try { return JSON.parse(t); } catch (e) { /* fall through */ }
  const start = t.search(/[\[{]/);
  const end = Math.max(t.lastIndexOf('}'), t.lastIndexOf(']'));
  if (start >= 0 && end > start) {
    try { return JSON.parse(t.slice(start, end + 1)); } catch (e) { /* fall through */ }
  }
  throw new HttpsError('internal', 'The model did not return valid JSON.');
}

// Tests only (the Firebase emulator, and only when the test asks): a stand-in for Claude that answers every step in its
// schema, so the whole build can be tested without a key and without spending. Never reachable in production.
const FAKE_OK = () => process.env.FUNCTIONS_EMULATOR === 'true';
function fakeAnswer(step, d) {
  const ctx = d.ctx || {}, topics = (ctx.topics || []).map(String);
  const q = (topic, k, tag) => ({ topic, question: `${tag} ${k + 1}`, options: [`נכון ${k + 1}`, `לא ${k + 1}א`, `לא ${k + 1}ב`, `לא ${k + 1}ג`], answer: 0,
    explanation: 'כי זה נכון', core: false, emoji: '🍎', scene: [{ e: '🍎', x: 50, y: 50, s: 30 }] });
  if (step === 'scan') return { detected_topics: topics, styles: 'שאלות בחירה קצרות', difficulty: 'רגיל', missing_from_parent_list: [] };
  if (step === 'gen') { const out = []; let k = Number(d.seed) || 0;
    for (const [t, n] of Object.entries(d.quota || {})) for (let j = 0; j < n; j++, k++) out.push(q(t, k, `${String(t).slice(0, 20)} · שאלה`));
    return { title: d.nameIt ? 'מדפי העבודה' : '', questions: out }; }
  if (step === 'pics') return { items: (d.items || []).map(x => ({ i: x.i, scene: [{ e: '🍐', x: 50, y: 50, s: 30 }], question: x.question, options: x.options, explanation: 'כי זה נכון' })) };
  if (step === 'solve') return { results: (d.questions || []).map(x => ({ i: x.i, pick: (x.options || []).findIndex(o => /^נכון/.test(o) || /✓$/.test(o)), multiple_correct: false, problem: /!bad/.test(x.question) ? 'שאלה לא ברורה' : '' })) };
  if (step === 'review') return { flags: (d.questions || []).filter(x => /!flag/.test(x.question) && !x.locked).map(x => ({ i: x.i, kind: 'clash', note: 'התנגשות' })) };
  if (step === 'fix') return { items: (d.items || []).map((x, k) => ({ i: x.i, action: 'fix', question: { ...q(x.topic, k, 'תוקנה'), question: `תוקנה ${x.i}` } })) };
  if (step === 'report') return { is_error: false, feedback: 'השאלה תקינה', category: 'none', corrected: null };
  if (step === 'match') { const words = t => String(t).toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(w => w.length > 2);
    return { map: (d.want || []).map(t => ({ topic: t, refs: (d.pool || []).filter(p => [p.title, ...(p.topics || [])].some(x => words(x).some(w => words(t).includes(w)))).map(p => p.ref) })) }; }
  if (step === 'select') return { picks: (d.groups || []).map(g => ({ topic: g.topic, i: (g.questions || []).map((x, k) => x.i ?? k) })) };
  return {};
}

// the files sent with a step (photos, PDFs of worksheets) → the model's content blocks; every size limit checked here
function filesContent(images, allowed) {
  if (!Array.isArray(images) || images.length > MAX_IMAGES || (images.length && !allowed)) {
    throw new HttpsError('invalid-argument', allowed ? `Up to ${MAX_IMAGES} files.` : 'This step takes no files.');
  }
  const content = []; let pages = 0;
  for (const img of images) {
    if (!img || typeof img.data !== 'string' || img.data.length > (img.type === 'application/pdf' ? MAX_PDF_B64 : MAX_IMAGE_B64)) {
      throw new HttpsError('invalid-argument', 'Image too large.');
    }
    if (img.type === 'application/pdf') {                         // a worksheet or a class presentation as a PDF
      pages += pdfPages(img.data);
      if (pages > MAX_PDF_PAGES) throw new HttpsError('invalid-argument', 'pdf_pages', { reason: 'pdf_pages', max: MAX_PDF_PAGES });
      content.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: img.data } });
      continue;
    }
    const media = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(img.type) ? img.type : 'image/jpeg';
    content.push({ type: 'image', source: { type: 'base64', media_type: media, data: img.data } });
  }
  return { content, pages };
}

// One AI step: the step's checks, its most possible cost reserved, the call (or the emulator's fake), the real cost settled.
// admin: no family limits · uid: the parent asking (null when the server's build runner asks – the build was checked when sent)
async function runStep({ admin, uid, famId, buildId, name, data = {}, images = [], fake = false }) {
  const step = Object.prototype.hasOwnProperty.call(STEPS, name) ? STEPS[name] : null;
  if (!step) throw new HttpsError('invalid-argument', 'Unknown step.');
  if (!data || typeof data !== 'object') throw new HttpsError('invalid-argument', 'Missing data.');
  if (!admin && uid) await checkFamily(uid, famId);              // whose family / group first – before anything about the data
  const { content, pages } = filesContent(images, step.images);
  let text;
  try { text = step.build(data, { images: images.length }); }
  catch (e) { if (e instanceof Bad) throw new HttpsError('invalid-argument', 'bad_input: ' + e.message, { reason: 'bad_input', field: e.message }); throw e; }
  content.push({ type: 'text', text });

  // the most this call can cost: input (system + data + files, estimated high) and max_tokens, at the dearest model it may run on
  const model = step.model, dear = [model, ...(FALLBACK_TO[model] || [])].map(priceOf).reduce((a, p) => p[1] > a[1] ? p : a);
  const inTok = (SYSTEM.length + text.length) / 2 + images.filter(i => i.type !== 'application/pdf').length * 1800 + pages * 3000 + 500;
  const maxUsd = (inTok * 1.25 * dear[0] + step.max_tokens * dear[1]) / 1e6;
  const callId = db.collection('_').doc().id;
  await reserve(admin, famId, maxUsd, callId);                     // over a cap → refused before anything is counted
  try { await claimCall(admin, uid, famId, buildId); } catch (e) { await settle(famId, callId, name, null, 0, false); throw e; }

  let msg;
  try {
    if (fake && FAKE_OK()) msg = { model, stop_reason: 'end_turn', usage: { input_tokens: 2000, output_tokens: 800 }, content: [{ type: 'text', text: JSON.stringify(fakeAnswer(name, data)) }] };
    else {
      // the SDK's own limit (10 minutes, 2 retries by default) is longer than the 9-minute callable – then a slow call was
      // killed with no error and no log. AI_TIMEOUT_MS, no retry: a slow call ends here as an error, logged.
      const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY.value().trim(), timeout: AI_TIMEOUT_MS, maxRetries: 0 });
      const params = {
        model,
        max_tokens: step.max_tokens,
        // the rules: one fixed system prompt, cached (every step of a build reuses it on the same model)
        system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content }],
        output_config: { effort: step.effort, format: { type: 'json_schema', schema: step.schema } }
      };
      // fallbacks: if the model declines a request, the API re-runs it on a fallback model in the same call (Haiku has none)
      if (FALLBACK_TO[model]) { params.betas = ['server-side-fallback-2026-07-01']; params.fallbacks = 'default'; }
      // the whole answer, streamed, within AI_TIMEOUT_MS (the SDK's timeout alone may cover only the start of a stream)
      const ac = new AbortController(), tm = setTimeout(() => ac.abort(), AI_TIMEOUT_MS);
      try { msg = await client.beta.messages.stream(params, { signal: ac.signal }).finalMessage(); }
      catch (e) { if (ac.signal.aborted) { const t = new Error('ai_slow'); t.aiSlow = true; throw t; } throw e; }
      finally { clearTimeout(tm); }
    }
  } catch (e) {
    // an API error before an answer is not billed; a request stopped for slowness may have been – counted at its most
    if (e && e.aiSlow) await settle(famId, callId, name, buildId, maxUsd); else await settle(famId, callId, name, buildId, 0, false);
    if (e && e.aiSlow || e instanceof Anthropic.APIConnectionTimeoutError) { console.error('Anthropic timeout', name); throw new HttpsError('deadline-exceeded', 'ai_slow', { reason: 'ai_slow', step: name }); }
    if (e instanceof Anthropic.RateLimitError) throw new HttpsError('resource-exhausted', 'rate_limited');
    if (e instanceof Anthropic.AuthenticationError) { console.error('Anthropic key rejected'); throw new HttpsError('internal', 'AI request failed (401).'); }
    if (e instanceof Anthropic.APIError) { console.error('Anthropic API error', e.status, String(e.message).slice(0, 300)); throw new HttpsError('internal', `AI request failed (${e.status}).`); }
    throw e;
  }
  await settle(famId, callId, name, buildId, costOf(model, msg));
  { const u = msg.usage || {}; console.log(`ask ${name} ${msg.model || model} in=${u.input_tokens || 0} out=${u.output_tokens || 0} cw=${u.cache_creation_input_tokens || 0} cr=${u.cache_read_input_tokens || 0} usd=${costOf(model, msg).toFixed(4)} ${msg.stop_reason}`); }
  if (msg.model && msg.model !== model) {   // the API answered on a fallback model
    await db.doc(`meta/ai_spend_${monthKey()}`).set({ fallbacks: FieldValue.increment(1) }, { merge: true }).catch(() => {});
    await serverLog({ fn: 'ask', kind: 'fallback', code: String(msg.model).slice(0, 60), msg: `${name}: asked ${model}, answered by ${msg.model}`, ms: 0 });
  }
  if (msg.stop_reason === 'refusal') throw new HttpsError('failed-precondition', 'refusal', { reason: 'refusal' });
  if (msg.stop_reason === 'max_tokens') throw new HttpsError('resource-exhausted', 'too_long', { reason: 'too_long' });
  const out = (msg.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
  return extractJson(out);
}

exports.ask = onCall(
  {
    region: 'europe-west1',
    invoker: 'public',            // callable from the app (who may call is checked inside: signed-in parent, family, quota)
    secrets: [ANTHROPIC_API_KEY],
    timeoutSeconds: 540,
    memory: '512MiB',
    maxInstances: 10
  },
  async function ask(request) {
    // Only signed-in parents (Google or a verified email link) may spend AI credit; kid devices are anonymous.
    const auth = parentOnly(request);
    // the app's reachability check after a network failure (logFail): answers at once, not an error, nothing logged
    if (request.data && request.data.ping === true) return { json: { pong: true } };
    const { step: name, data = {}, images = [], famId, buildId } = request.data || {};
    const json = await runStep({ admin: isAdminUser(auth), uid: auth.uid, famId, buildId, name, data, images, fake: request.data.fake === true });
    return { json };
  }
);

/* ---------- a new practice set, built on the server ----------
   The phone sends the parent's form and the files once (submitBuild); the files are read right then (the scan step) and
   never kept. The rest runs here, in a task queue (runBuild), one AI step after another, with the same code the app uses
   (public/build-core.js: buildSet) – the parent may close the phone, even turn the screen off. Every answer goes into the
   build's log (builds/{id}/log/{n}); a task that runs out of time hands over to the next one, and a failed task is tried
   again (Cloud Tasks) – both replay the log, so nothing done is asked (or paid for) twice. The phone shows the build's
   progress (builds/{id}.prog), and the finished set is written to the family (families/{f}/sets), with the progress
   of the build, the log and the form deleted. A build that still fails can go on from its log (resumeBuild). */
const core = (() => { try { return require('../public/build-core.js'); } catch (_) { return require('./build-core.js'); } })();
const { onTaskDispatched } = require('firebase-functions/v2/tasks');
const SITE_URL = defineString('SITE_URL', { default: 'https://study-for-fun-7b03c.web.app' });   // the catalog (ready practice sets)
const RUN_QUEUE = 'locations/europe-west1/functions/runBuild';
const RUN_ATTEMPTS = 4;                 // a task that fails is tried this many times (backoff 30 s → 5 min), then the build stops
const YIELD_MS = 17 * 60 * 1000;
const MAX_RUNS = BUILD_CALLS + 10;      // at least one new step per task – a build can never hand over for ever        // a task makes no new AI call after this – the next task goes on (tasks live 30 minutes)
// errors that come back the same for the same data: written into the log (a replay gives the same answer), never retried by itself
const SAME_AGAIN = new Set(['bad_input', 'refusal', 'too_long']);
// errors that stop the build at once (no automatic retry); the parent may still try to go on unless it is closed for good
const STOP_NOW = new Set(['budget', 'family_budget', 'build_calls', 'build_closed', 'replay_mismatch', 'bad_input', 'refusal', 'too_long']);
const NOT_RESUMABLE = new Set(['build_calls', 'build_closed', 'replay_mismatch', 'bad_input']);
const reasonOf = e => String((e && e.details && e.details.reason) || (e && /^[a-z_]{3,30}$/.test(e.message || '') ? e.message : (e && e.code) || 'error'));
const ctl = (code, e) => Object.assign(new Error((e && e.message) || code), { code, ctl: true });   // not swallowed by buildSet
const buildRef = (famId, buildId) => db.doc(`families/${famId}/builds/${buildId}`);
const idOk = id => typeof id === 'string' && /^[A-Za-z0-9]{1,40}$/.test(id);

// the parent's form, checked and cut to its limits (the same limits the wizard has)
function cleanInput(x) {
  const bad = f => { throw new HttpsError('invalid-argument', 'bad_input: ' + f, { reason: 'bad_input', field: f }); };
  if (!x || typeof x !== 'object') bad('input');
  const str = (v, n, f, need) => { if (v == null || v === '') { if (need) bad(f); return ''; } if (typeof v !== 'string') bad(f); const t = v.trim().slice(0, n); if (need && !t) bad(f); return t; };
  const int = (v, lo, hi, f) => { v = +v; if (!Number.isInteger(v) || v < lo || v > hi) bad(f); return v; };
  const list = (v, max, n, f) => { if (v == null) return []; if (!Array.isArray(v)) bad(f); return v.filter(t => typeof t === 'string' && t.length <= n).slice(-max); };
  if (!Array.isArray(x.topics)) bad('topics');
  const topics = [...new Set(x.topics.map(t => str(t, 120, 'topics')).filter(Boolean))];
  if (!topics.length || topics.length > 30) bad('topics');
  if (!Array.isArray(x.chapters) || !x.chapters.length || x.chapters.length > 10) bad('chapters');
  const chapters = x.chapters.map(c => { if (!c || typeof c !== 'object' || !Array.isArray(c.topics)) bad('chapters');
    const tp = c.topics.map(t => str(t, 120, 'chapters')).filter(Boolean).slice(0, 30); if (!tp.length) bad('chapters');
    return { title: str(c.title, 80, 'chapters'), topics: tp, count: int(c.count, 5, 20, 'chapters') }; });
  const kidId = str(x.kidId, 40, 'kidId', true); if (!/^[A-Za-z0-9_-]+$/.test(kidId)) bad('kidId');
  const examDate = str(x.examDate, 10, 'examDate'); if (examDate && !/^\d{4}-\d{2}-\d{2}$/.test(examDate)) bad('examDate');
  const sk = x.skip && typeof x.skip === 'object' ? x.skip : {};
  return { name: str(x.name, 40, 'name') || 'הילד/ה', reinf: str(x.reinf, 60, 'reinf') || null, gi: int(x.gi, 0, 11, 'gi'), subject: str(x.subject, 60, 'subject', true),
    topics, perRound: int(x.perRound, 5, 20, 'perRound'), kidId, chapters, text: str(x.text, 8000, 'text'), link: str(x.link, 300, 'link'),
    pages: str(x.pages, 200, 'pages'), examDate, dailyGoal: int(x.dailyGoal, 1, 10, 'dailyGoal'),
    // a focused build (reinf): the source set's own questions of the weak topics – the only words / facts it may ask about
    mat: list(x.mat, 150, 200, 'mat'),
    // what the pool must not give this kid (the phone knows: its ready sets, the ready questions it got, what it answered correctly)
    skip: { have: list(sk.have, 200, 60, 'skip'), used: list(sk.used, 4000, 80, 'skip'), solved: list(sk.solved, 6000, 16, 'skip') } };
}

// a new build: one of this month's free builds, or one paid credit (startBuild – the older app – and submitBuild)
async function openBuild(auth, famId, subject, extra = {}) {
  const month = monthKey(), adminUser = isAdminUser(auth), sc = await scopeOf(famId);
  const usageRef = sc.usage(month), billRef = sc.cls ? null : db.doc(`families/${famId}/billing/main`);
  const tRef = sc.cls ? db.doc(`teachers/${sc.owner}`) : null;
  // a teacher: one build to try with no students; from the second on, at least MIN_STUDENTS approved students in their groups
  const students = sc.cls && !adminUser ? await approvedStudents(sc.owner, sc.priv) : 0;
  const EVER = sc.priv ? 'buildsPriv' : 'builds';                     /* the first build to try: once in each world */
  const ref = db.collection(`families/${famId}/builds`).doc();
  return db.runTransaction(async (tx) => {
    const [u, b, t] = await Promise.all([tx.get(usageRef), billRef ? tx.get(billRef) : null, tRef ? tx.get(tRef) : null]);
    const used = u.data()?.builds || 0, credits = (b && b.data()?.credits) || 0, ever = (t && t.data()?.[EVER]) || 0;
    let kind;
    if (adminUser) kind = 'admin';
    else if (sc.cls && ever >= 1 && students < MIN_STUDENTS) throw new HttpsError('failed-precondition', 'need_students', { reason: 'need_students', min: MIN_STUDENTS, students });
    else if (used < sc.free) kind = 'free';
    else if (credits > 0) kind = 'paid';
    else throw new HttpsError('resource-exhausted', 'quota', { reason: 'quota', used, free: sc.free, credits, price: PRICE_ILS, ...(sc.cls ? { teacher: true } : {}) });
    tx.set(usageRef, { builds: FieldValue.increment(kind === 'admin' ? 0 : 1), month }, { merge: true });
    if (tRef && kind !== 'admin') tx.set(tRef, { [EVER]: FieldValue.increment(1) }, { merge: true });
    if (kind === 'paid') tx.set(billRef, { credits: FieldValue.increment(-1) }, { merge: true });
    tx.set(ref, { by: auth.uid, at: Date.now(), kind, calls: 0, status: 'running', subject: String(subject).slice(0, 60), month, ...extra });
    return { buildId: ref.id, kind, used: used + (kind === 'admin' ? 0 : 1), free: sc.free, credits: credits - (kind === 'paid' ? 1 : 0), price: PRICE_ILS, ...(sc.cls ? { teacher: true } : {}) };
  });
}
// a teacher's approved students, in all their groups (a parent signed, the teacher approved)
async function approvedStudents(owner, priv) {      /* in the same world only (the school's classes / the private groups) */
  const t = await db.doc(`teachers/${owner}`).get(), all = (t.exists && Array.isArray(t.data().classes)) ? t.data().classes : [];
  const ids = (await Promise.all(all.map(c => scopeOf(c).then(x => x && x.cls && !!x.priv === !!priv ? c : null).catch(() => null)))).filter(Boolean);
  const n = await Promise.all(ids.map(c => db.collection(`families/${c}/consents`).where('status', '==', 'digital').count().get().then(r => r.data().count).catch(() => 0)));
  return n.reduce((a, b) => a + b, 0);
}
// End a running build (done / failed / cancelled). One that ended before it really started (≤ 3 AI calls, not done) gives its
// free build / credit back – at most REFUNDS_PER_MONTH times a month, so "start, call, fail on purpose" cannot repeat for free.
async function closeBuild(famId, buildId, status, extra = {}) {
  const ref = buildRef(famId, buildId);
  return db.runTransaction(async (tx) => {
    const bd = await tx.get(ref);
    if (!bd.exists || bd.data().status !== 'running') return { refunded: false, closed: false };
    const d = bd.data(), sc = await scopeOf(famId), usageRef = sc.usage(d.month);
    const refunds = (await tx.get(usageRef)).data()?.refunds || 0;
    const refund = status !== 'done' && d.calls <= 3 && d.kind !== 'admin' && refunds < REFUNDS_PER_MONTH;
    tx.update(ref, { status, endedAt: Date.now(), refunded: refund, ...extra, ...(refund ? { resumable: false } : {}) });
    if (refund) tx.set(usageRef, { refunds: FieldValue.increment(1), ...(d.kind === 'free' ? { builds: FieldValue.increment(-1) } : {}) }, { merge: true });
    if (refund && sc.cls && d.kind === 'free') tx.set(db.doc(`teachers/${sc.owner}`), { [sc.priv ? 'buildsPriv' : 'builds']: FieldValue.increment(-1) }, { merge: true });
    if (refund && d.kind === 'paid') tx.set(db.doc(`families/${famId}/billing/main`), { credits: FieldValue.increment(1) }, { merge: true });
    return { refunded: refund, closed: true };
  });
}
// the form and the log of a build that is over (they hold the parent's pasted text and the questions on their way)
async function cleanBuild(ref) {
  for (const sub of ['log', 'state']) {
    const docs = (await ref.collection(sub).listDocuments().catch(() => []));
    for (let k = 0; k < docs.length; k += 400) { const b = db.batch(); docs.slice(k, k + 400).forEach(d => b.delete(d)); await b.commit().catch(() => {}); }
  }
}
const logSet = (ref, n, step, v, err) => ref.collection('log').doc(String(n).padStart(4, '0')).set(err ? { n, step, err } : { n, step, v: JSON.stringify(v) });
async function runQueue(famId, buildId, run) {
  const emu = process.env.CLOUD_TASKS_EMULATOR_HOST;
  if (FAKE_OK() && emu) {                  // the emulator: straight to its Cloud Tasks (the Admin SDK wants Google credentials even there)
    const proj = process.env.GCLOUD_PROJECT || JSON.parse(process.env.FIREBASE_CONFIG || '{}').projectId;
    const r = await fetch(`http://${emu}/projects/${proj}/locations/europe-west1/queues/runBuild/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task: { httpRequest: { url: '', oidcToken: { serviceAccountEmail: 'emulated@example.com' }, headers: { 'Content-Type': 'application/json' },
        body: Buffer.from(JSON.stringify({ data: { famId, buildId, run } })).toString('base64') } } }) });
    if (!r.ok) throw new Error('enqueue ' + r.status + ' ' + (await r.text()).slice(0, 200));
    return;
  }
  const { getFunctions } = require('firebase-admin/functions');
  await getFunctions().taskQueue(RUN_QUEUE).enqueue({ famId, buildId, run }, { dispatchDeadlineSeconds: 1800 });
}
// a line in the family's failure log (the parent's ☰ → דיווחים, and the app admins) – no prompt text
async function famErr(famId, where, code, msg) {
  try { await db.collection(`families/${famId}/errlog`).add({ at: Date.now(), where, code: String(code).slice(0, 60), msg: String(msg || '').slice(0, 300), subject: '', ver: 'server', by: '' }); } catch (_) {}
}

// Start a new practice set (the older app, which runs the build itself): uses one of this month's free builds, or one paid credit.
exports.startBuild = onCall({ region: 'europe-west1', invoker: 'public', maxInstances: 10 }, async function startBuild(request) {
  const auth = parentOnly(request);
  const { famId, subject = '' } = request.data || {};
  await checkFamily(auth.uid, famId);
  await checkBudget();
  await checkFamilyBudget(auth, famId);
  return openBuild(auth, famId, subject);
});

// End a build: ok / failed (the older app), cancel (the parent cancelled), dismiss (a stopped build off the kid's card).
exports.endBuild = onCall({ region: 'europe-west1', invoker: 'public', maxInstances: 10 }, async function endBuild(request) {
  const auth = parentOnly(request);
  const { famId, buildId, ok, cancel, dismiss } = request.data || {};
  await checkFamily(auth.uid, famId);
  if (!idOk(buildId)) throw new HttpsError('invalid-argument', 'Missing build.');
  const ref = buildRef(famId, buildId), d = (await ref.get()).data();
  if (!d) return { refunded: false };
  if (dismiss) { if (d.status !== 'running') { await ref.update({ hidden: true }); if (d.srv) await cleanBuild(ref); } return { refunded: false }; }
  const r = await closeBuild(famId, buildId, cancel ? 'cancelled' : ok ? 'done' : 'failed');
  if (d.srv && cancel) await cleanBuild(ref);
  return { refunded: r.refunded };
});

// The phone sends a new build: the form and the files. The files are read now (the scan step) – the rest runs in runBuild.
exports.submitBuild = onCall({ region: 'europe-west1', invoker: 'public', secrets: [ANTHROPIC_API_KEY], timeoutSeconds: 540, memory: '512MiB', maxInstances: 10 },
  async function submitBuild(request) {
    const auth = parentOnly(request);
    const { famId, input, images = [], fake, test } = request.data || {};
    await checkFamily(auth.uid, famId);
    const I = cleanInput(input);
    if (auth.uid !== famId && !isAdminUser(auth)) {                 // a tutor builds only for the kids of its invitation
      const m = (await db.doc(`families/${famId}/members/${auth.uid}`).get()).data() || {};
      if (m.role === 'tutor' && !(Array.isArray(m.kids) && m.kids.includes(I.kidId))) throw new HttpsError('permission-denied', 'Not this tutor\'s kid.');
    }
    filesContent(images, true);                                      // the files' limits, before anything is counted
    await checkBudget();
    await checkFamilyBudget(auth, famId);
    const isFake = FAKE_OK() && fake === true;
    I.files = images.length;
    const t = await openBuild(auth, famId, I.subject, { srv: true, kidId: I.kidId, run: 1, prog: {},
      ...(isFake ? { fake: true, test: test && typeof test === 'object' ? JSON.parse(JSON.stringify(test)) : null } : {}) });
    const ref = buildRef(famId, t.buildId);
    try {
      await ref.collection('state').doc('input').set({ I: JSON.stringify(I) });
      if (I.text || images.length) {
        const v = await runStep({ admin: t.kind === 'admin', uid: null, famId, buildId: t.buildId, name: 'scan', images, fake: isFake,
          data: { ctx: core.aiCtx(I.gi, I.subject, I.topics, { pages: I.pages, link: I.link }), text: I.text } });
        await logSet(ref, 0, 'scan', v);
      }
      await runQueue(famId, t.buildId, 1);
    } catch (e) {
      await closeBuild(famId, t.buildId, 'failed', { err: reasonOf(e), resumable: false });
      await cleanBuild(ref);
      throw e;
    }
    return { ...t, prog: { scan: { s: 'run', d: '' } } };
  });

// A build that stopped goes on from its log (the parent: "▶ להמשיך"), on the same build – within its 3 hours.
exports.resumeBuild = onCall({ region: 'europe-west1', invoker: 'public', maxInstances: 10 }, async function resumeBuild(request) {
  const auth = parentOnly(request);
  const { famId, buildId } = request.data || {};
  await checkFamily(auth.uid, famId);
  if (!idOk(buildId)) throw new HttpsError('invalid-argument', 'Missing build.');
  const ref = buildRef(famId, buildId);
  const run = await db.runTransaction(async tx => {
    const d = (await tx.get(ref)).data();
    if (!d || !d.srv || d.status !== 'failed' || !d.resumable || d.refunded || Date.now() - d.at > BUILD_HOURS * 36e5 - 10 * 60e3) {
      throw new HttpsError('failed-precondition', 'build_closed', { reason: 'build_closed' });
    }
    tx.update(ref, { status: 'running', run: (d.run || 1) + 1, err: FieldValue.delete(), resumable: FieldValue.delete(), endedAt: FieldValue.delete() });
    return (d.run || 1) + 1;
  });
  // the step that stopped the build is asked again (an answer that "came back the same" may come back fine this time)
  const last = await ref.collection('log').orderBy('n', 'desc').limit(1).get();
  if (!last.empty && last.docs[0].data().err) await last.docs[0].ref.delete();
  await runQueue(famId, buildId, run);
  return { ok: true };
});

// the ready chapters of the catalog that may fill a chapter of this build (public/share – the same files the app reads)
async function readyChapters(I, gi, subject) {
  const site = SITE_URL.value().replace(/\/$/, '');
  let L = [];
  try { const r = await fetch(`${site}/share/catalog.json`); L = r.ok ? ((await r.json()).sets || []) : []; } catch (_) { return []; }
  const base = String(subject).replace(/^🎯\s*/, ''), have = new Set(I.skip.have), used = new Set(I.skip.used), solved = new Set(I.skip.solved), out = [];
  for (const x of L.filter(x => x.status === 'ready' && x.grade === gi && x.subject === base && !have.has(x.id)).slice(0, 4)) {
    let p;
    try { const r = await fetch(`${site}/share/${encodeURIComponent(x.id)}.txt`); const raw = r.ok ? (await r.text()).trim() : '';
      if (!raw.startsWith('SFF1:')) continue;
      p = JSON.parse(Buffer.from(raw.slice(5), 'base64').toString('utf8')); p.qs = core.clean(p.questions, p.topics); if (!p.qs.length) continue; }
    catch (_) { continue; }
    (p.chapters || []).forEach((c, ci) => { if (c && typeof c.text === 'string' && c.text.trim()) return;          // reading passages need their text
      const qs = p.qs.filter(q => q.ch === ci).map(q => ({ ...q, srcq: x.id + ':' + core.tkey(q.question) })).filter(q => !used.has(q.srcq) && !solved.has(core.tkey(q.question)));
      if (qs.length >= 2) out.push({ ref: x.id + '#' + ci, title: String(c.title || '').slice(0, 120), topics: (c.topics || []).slice(0, 20), qs }); });
  }
  let r = out.slice(0, 150);
  while (r.length && JSON.stringify(r).length > 800e3) r = r.slice(0, Math.floor(r.length * 0.8));   // one log entry < 1 MB
  return r;
}
// the same random choices every time a build is replayed
function seeded(s) { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  return () => { h = (h + 0x6D2B79F5) >>> 0; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
// what the build screen shows: the four steps (state + a short detail), written at most every 1.5 s, in order
function progressWriter(ref, start) {
  let prog = { ...(start || {}) }, last = 0, chain = Promise.resolve(), dirty = false;
  const write = () => { if (!dirty) return chain; dirty = false; last = Date.now(); const p = prog; chain = chain.then(() => ref.update({ prog: p })).catch(() => {}); return chain; };
  const f = (id, s, d) => { prog = { ...prog, [id]: { s, d: d ? String(d).slice(0, 200) : '' } }; dirty = true; if (Date.now() - last > 1500) write(); };
  f.flush = () => { dirty = true; return write(); };
  return f;
}
// the kid now has these ready questions (the pool never gives them again – also after the set is deleted)
async function rememberPool(famId, kidId, qs) {
  const add = qs.map(q => q.srcq).filter(Boolean); if (!add.length) return;
  const ref = db.doc(`families/${famId}/fam/kids`);
  await db.runTransaction(async tx => { const d = (await tx.get(ref)).data(); if (!d || !Array.isArray(d.list)) return;
    const list = d.list.map(k => k && k.id === kidId ? { ...k, cq: [...new Set([...(Array.isArray(k.cq) ? k.cq : []), ...add])].slice(-3000) } : k);
    tx.update(ref, { list }); }).catch(e => console.warn('rememberPool', e.message));
}

// One run of a build: the log is replayed, new steps are asked until the set is done or this task's time is up.
exports.runBuild = onTaskDispatched({ region: 'europe-west1', secrets: [ANTHROPIC_API_KEY], timeoutSeconds: 1800, memory: '512MiB', maxInstances: 20,
  retryConfig: { maxAttempts: RUN_ATTEMPTS, minBackoffSeconds: 30, maxBackoffSeconds: 300 }, rateLimits: { maxConcurrentDispatches: 20 } },
  async function runBuild(req) {
    const { famId, buildId, run } = req.data || {};
    if (!famOk(famId) || !idOk(buildId)) return;
    const ref = buildRef(famId, buildId), b = (await ref.get()).data();
    if (!b || !b.srv) return;
    if (b.status === 'cancelled') { await cleanBuild(ref); return; }
    if (b.status !== 'running' || b.run !== run) return;          // done, stopped, or an older task of this build
    if (run > MAX_RUNS) { await closeBuild(famId, buildId, 'failed', { err: 'build_calls', resumable: false }); return; }
    const t0 = Date.now(), lastTry = (req.retryCount || 0) >= RUN_ATTEMPTS - 1;
    const test = (b.fake && FAKE_OK() && b.test) || {};
    const yieldMs = test.yieldMs || YIELD_MS;
    const progress = progressWriter(ref, b.prog);
    try {
      const input = (await ref.collection('state').doc('input').get()).data();
      if (!input) throw ctl('replay_mismatch');
      const I = JSON.parse(input.I);
      const log = (await ref.collection('log').orderBy('n').get()).docs.map(d => d.data());
      let n = 0, made = 0;
      // one entry of the log: given back as it was (a replay), or made now and written
      const next = async (step, make) => {
        const k = n++;
        if (k < log.length) { const e = log[k]; if (e.step !== step) throw ctl('replay_mismatch'); if (e.err) throw Object.assign(new Error(e.err), { code: e.err }); return JSON.parse(e.v); }
        if (made && Date.now() - t0 > yieldMs) throw ctl('yield');           // every task makes at least one new step
        made++;
        let v;
        try { v = await make(); }
        catch (e) { const code = reasonOf(e);
          if (SAME_AGAIN.has(code)) { await logSet(ref, k, step, null, code); throw Object.assign(new Error(code), { code }); }
          throw ctl(code, e); }
        await logSet(ref, k, step, v);
        return v;
      };
      const askB = (step, data) => next(step, async () => {
        // tests only (the emulator's fake AI): a step that fails once – a network error, or one that stops the build
        if (test.failAt === step && !b.testFailed) { b.testFailed = true; await ref.update({ testFailed: true }); throw new HttpsError('internal', 'test: network'); }
        if (test.stopAt === step && !b.testStopped) { b.testStopped = true; await ref.update({ testStopped: true }); throw new HttpsError('failed-precondition', 'refusal', { reason: 'refusal' }); }
        return runStep({ admin: b.kind === 'admin', uid: null, famId, buildId, name: step, data, fake: !!b.fake });
      });
      const set = await core.buildSet(I, askB, { progress, rand: seeded(buildId), pool: (kidId, gi, subject) => next('~pool', () => readyChapters(I, gi, subject)) });
      await progress.flush();
      if ((await ref.get()).data()?.status !== 'running') { await cleanBuild(ref); return; }     // cancelled at the last moment
      const setId = 's' + b.at;
      if ((await scopeOf(famId)).cls) { delete set.kidId; delete set.name; set.grp = 1; }   // a group's: one shared set, given out as an assignment
      await db.doc(`families/${famId}/sets/${setId}`).set({ set: JSON.parse(JSON.stringify({ id: setId, ...set, created: Date.now() })) });
      await rememberPool(famId, I.kidId, set.questions);
      await closeBuild(famId, buildId, 'done', { setId });
      await cleanBuild(ref);
    } catch (e) {
      await progress.flush();
      if (e.code === 'yield') { await ref.update({ run: run + 1 }); await runQueue(famId, buildId, run + 1); return; }
      const now = (await ref.get()).data() || {};
      if (now.status !== 'running') { if (now.status === 'cancelled') await cleanBuild(ref); return; }     // cancelled meanwhile
      const code = reasonOf(e);
      if (!STOP_NOW.has(code) && !lastTry) { console.warn(`runBuild ${buildId} try ${(req.retryCount || 0) + 1}: ${code} ${e.message}`); throw e; }   // tried again
      console.warn(`runBuild ${buildId} stopped: ${code} ${e.message}`);
      await serverLog({ fn: 'runBuild', kind: 'error', code: code.slice(0, 60), msg: String(e.message || e).slice(0, 300), ms: Date.now() - t0 });
      await famErr(famId, 'server:build', code, e.message);
      await closeBuild(famId, buildId, 'failed', { err: code, resumable: !NOT_RESUMABLE.has(code) });
    }
  });

// Every 6 hours: the form and the log of a build that is over are deleted (a stopped build the parent never went back to,
// or one past its 3 hours); a build still "running" after its 3 hours (its task chain was lost) is stopped.
exports.cleanBuilds = require('firebase-functions/v2/scheduler').onSchedule({ schedule: 'every 6 hours', region: 'europe-west1', retryCount: 0 },
  async () => {
    const q = await db.collectionGroup('state').limit(500).get(), seen = new Set();
    for (const d of q.docs) {
      const ref = d.ref.parent.parent;                                // only families/{f}/builds/{id}/state – never anything else
      if (!ref || ref.parent.id !== 'builds' || !/^families\/[^/]+\/builds\/[^/]+$/.test(ref.path) || seen.has(ref.path)) continue; seen.add(ref.path);
      const b = (await ref.get()).data(), famId = ref.parent.parent && ref.parent.parent.id;
      const old = !b || Date.now() - (b.at || 0) > BUILD_HOURS * 36e5;
      if (b && b.status === 'running' && !old) continue;
      if (b && b.status === 'running' && famId) await closeBuild(famId, ref.id, 'failed', { err: 'build_closed', resumable: false });
      if (!b || b.status !== 'failed' || old) await cleanBuild(ref);
    }
  });

/* ---------- a user's bug report / idea → an email to the D-WAY team ----------
   The addresses live in adminConfig/main (only the app admins can read or write it, from the admin screen in the app);
   the Gmail app password is a secret (GMAIL_APP_PASSWORD in Secret Manager) – never in the code or in Firestore.
   The email is plain text, at most 60 a day; a report is marked so it is never mailed twice. */
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const MAIL_RE = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[a-z]{2,}$/i;
// Off until the mailbox and the GMAIL_APP_PASSWORD secret exist: then add ENABLE_BUG_MAIL=1 to functions/.env and deploy.
// the secret is declared only when on – otherwise deploys would ask for a password that does not exist yet
const GMAIL_APP_PASSWORD = process.env.ENABLE_BUG_MAIL === '1' ? defineSecret('GMAIL_APP_PASSWORD') : null;
if (GMAIL_APP_PASSWORD) exports.mailBugReport = onDocumentCreated({ document: 'bugReports/{id}', region: 'europe-west1', secrets: [GMAIL_APP_PASSWORD], maxInstances: 2, retry: false },
  async (event) => {
    const snap = event.data; if (!snap) return;
    const r = snap.data() || {};
    const cfg = (await db.doc('adminConfig/main').get()).data() || {};
    const to = String(cfg.reportMail || '').trim(), from = String(cfg.senderMail || to).trim();
    if (!MAIL_RE.test(to) || !MAIL_RE.test(from)) { console.log('mailBugReport: no address set'); return; }
    const day = new Date().toISOString().slice(0, 10), cnt = db.doc(`meta/bugmail_${day}`);
    const ok = await db.runTransaction(async t => { const c = await t.get(cnt), n = (c.exists && c.data().n) || 0; if (n >= 60) return false; t.set(cnt, { n: n + 1 }, { merge: true }); return true; });
    if (!ok) { console.log('mailBugReport: daily limit'); return; }
    const clean = (v, n) => String(v || '').replace(/[\r\n]+/g, ' ').slice(0, n);
    const kind = { bug: 'תקלה', idea: 'רעיון', q: 'שאלה' }[r.kind] || 'דיווח';
    const nodemailer = require('nodemailer');
    const tr = nodemailer.createTransport({ service: 'gmail', auth: { user: from, pass: GMAIL_APP_PASSWORD.value().replace(/\s+/g, '') } });
    await tr.sendMail({ from: `Study for fun <${from}>`, to,
      subject: `Study for fun – ${kind}${r.byName ? ' מ' + clean(r.byName, 40) : ''}`,
      text: `${String(r.text || '').slice(0, 3000)}\n\n—\nסוג: ${kind}\nמסך: ${clean(r.where, 120)}\nגרסה: ${clean(r.ver, 20)}\nתפקיד: ${clean(r.role, 20)}\nמכשיר: ${clean(r.ua, 160)}\nזמן: ${new Date(r.at || Date.now()).toISOString()}` });
    await snap.ref.update({ mailed: Date.now() });
    console.log('mailBugReport: sent');
  });

/* ---------- unusual events → at most one email an hour to the app admins ----------
   Every hour: anything new in the server log (errors, slow calls, model fallbacks, AI spend past 80%) goes out as one
   plain-text email – a count per kind and the lines themselves (function, code, short message: the log never holds
   prompt text or personal data). Nothing new → no email. Same mailbox and switch (ENABLE_BUG_MAIL) as the bug reports. */
if (GMAIL_APP_PASSWORD) exports.mailServerAlerts = require('firebase-functions/v2/scheduler').onSchedule(
  { schedule: 'every 60 minutes', region: 'europe-west1', secrets: [GMAIL_APP_PASSWORD], retryCount: 0 },
  async () => {
    const mark = db.doc('meta/alertmail'), since = ((await mark.get()).data() || {}).last || (Date.now() - 3600e3);
    const q = await db.collection('serverLog').where('at', '>', since).orderBy('at').limit(200).get();
    if (q.empty) return;
    const rows = q.docs.map(d => d.data()), last = rows[rows.length - 1].at;
    const cfg = (await db.doc('adminConfig/main').get()).data() || {};
    const to = String(cfg.reportMail || '').trim(), from = String(cfg.senderMail || to).trim();
    if (!MAIL_RE.test(to) || !MAIL_RE.test(from)) { console.log('mailServerAlerts: no address set'); return; }
    const clean = (v, n) => String(v || '').replace(/[\r\n]+/g, ' ').slice(0, n);
    const name = { error: 'תקלות', slow: 'קריאות איטיות', fallback: 'מודל חלופי', budget: 'הוצאות AI' };
    const count = {}; rows.forEach(r => { count[r.kind] = (count[r.kind] || 0) + 1; });
    const lines = rows.slice(-60).map(r => `${new Date(r.at).toISOString().slice(0, 16).replace('T', ' ')}  ${clean(r.kind, 10)}  ${clean(r.fn, 20)}  ${clean(r.code, 40)}  ${clean(r.msg, 200)}`);
    const nodemailer = require('nodemailer');
    const tr = nodemailer.createTransport({ service: 'gmail', auth: { user: from, pass: GMAIL_APP_PASSWORD.value().replace(/\s+/g, '') } });
    await tr.sendMail({ from: `Study for fun <${from}>`, to,
      subject: `Study for fun – ${rows.length} אירועים ביומן השרת`,
      text: Object.entries(count).map(([k, n]) => `${name[k] || k}: ${n}`).join('\n')
        + `\n\n${lines.join('\n')}\n\n—\nהיומן המלא באפליקציה: ☰ ← יומן שרת (השעות ב-UTC)` });
    await mark.set({ last }, { merge: true });
    console.log('mailServerAlerts: sent', rows.length);
  });
