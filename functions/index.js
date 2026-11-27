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
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
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
const REFUNDS_PER_MONTH = 2;                  // failed-at-the-start builds given back per family per month
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
// the caller must be the family's founder or an adult member of it
async function checkFamily(uid, famId) {
  if (typeof famId !== 'string' || !/^[A-Za-z0-9_-]{6,128}$/.test(famId)) throw new HttpsError('invalid-argument', 'Missing family.');
  if (uid === famId) return;
  const m = await db.doc(`families/${famId}/members/${uid}`).get();
  if (!m.exists) throw new HttpsError('permission-denied', 'Not a member of this family.');
}
async function checkBudget() {
  const g = await db.doc(`meta/ai_spend_${monthKey()}`).get();
  const day = await db.doc(`meta/ai_day_${dayKey()}`).get();
  if ((g.data()?.usd || 0) >= MONTHLY_CAP_USD || (day.data()?.usd || 0) >= DAILY_CAP_USD) throw new HttpsError('resource-exhausted', 'budget', { reason: 'budget' });
}
// this family's share of the month's AI spend (checked after checkFamily, so famId is valid)
async function checkFamilyBudget(auth, famId) {
  if (isAdminUser(auth)) return;
  const u = await db.doc(`families/${famId}/usage/${monthKey()}`).get();
  if ((u.data()?.usd || 0) >= FAMILY_CAP_USD) throw new HttpsError('resource-exhausted', 'family_budget', { reason: 'family_budget', cap: FAMILY_CAP_USD });
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
  if (famOk(famId)) refs.push([db.doc(`families/${famId}/usage/${monthKey()}`), admin ? Infinity : FAMILY_CAP_USD, 'family_budget']);
  await db.runTransaction(async t => {
    const snaps = await Promise.all(refs.map(([r]) => t.get(r)));
    const live = snaps.map((sn, k) => { const d = sn.data() || {}, L = liveRes(d);
      if ((d.usd || 0) + L.sum + usd > refs[k][1]) throw new HttpsError('resource-exhausted', refs[k][2], { reason: refs[k][2], ...(refs[k][2] === 'family_budget' ? { cap: FAMILY_CAP_USD } : {}) });
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
  if (famOk(famId)) {
    w.push(db.doc(`families/${famId}/usage/${monthKey()}`).update({ [`res.${id}`]: del, ...(ran ? { usd: inc(usd) } : {}), month: monthKey() }));
    if (ran && typeof buildId === 'string' && /^[A-Za-z0-9]{1,40}$/.test(buildId)) w.push(db.doc(`families/${famId}/builds/${buildId}`).update({ usd: inc(usd), ...per }));
  }
  await Promise.all(w.map(p => p.catch(e => console.error('settle', e.message))));
  await spendAlert().catch(() => {});
}

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
      const ref = db.doc(`families/${famId}/usage/${monthKey()}`), u = await tx.get(ref);
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

/* ---------- backups (app admins only) ----------
   Three layers: Firestore's own point-in-time recovery (any minute of the last 7 days) and its managed backups (daily,
   kept 14 days; weekly, kept 12 weeks) – both set up once with gcloud – plus a weekly export of Firestore AND of the
   sign-in accounts (Firestore backups don't hold them) to the bucket <project>-backups (another EU region; its files are
   deleted after 90 days – the privacy policy says so). Each export is a document in backups/{id} (only app admins read
   it); a failure → serverLog (the red dot on ☰).
   adminBackup (☰ → 🗄️ גיבויים): the setup as it really is (read from Google, nothing assumed), the exports, "back up
   now", and restoring ONE family's content as it was at a minute of the last 7 days. */
const BACKUP_EVERY_DAYS = 7;
const projectId = () => process.env.GCLOUD_PROJECT || JSON.parse(process.env.FIREBASE_CONFIG || '{}').projectId;
const backupBucket = () => process.env.BACKUP_BUCKET || `${projectId()}-backups`;
const dbPath = () => `projects/${projectId()}/databases/(default)`;
let fsAdminC; const fsAdmin = () => fsAdminC || (fsAdminC = new (require('@google-cloud/firestore').v1.FirestoreAdminClient)());
const tsMs = t => t ? Number(t.seconds || 0) * 1000 + Math.round((t.nanos || 0) / 1e6) : 0;
const errMsg = e => String((e && e.message) || e).slice(0, 300);
const stampOf = (t = new Date()) => t.toISOString().replace(/[:.]/g, '-').slice(0, 19);      // 2026-11-27T01-30-00

// one export: the whole Firestore (runs on in the background – refreshBackups follows it) + the sign-in accounts (a file)
async function runBackup(kind, by) {
  const id = stampOf(), ref = db.doc(`backups/${id}`), bucket = backupBucket(), out = {};
  await ref.set({ at: Date.now(), kind, by: by || '', state: 'running', bucket });
  try {
    const [op] = await fsAdmin().exportDocuments({ name: dbPath(), outputUriPrefix: `gs://${bucket}/firestore/${id}`, collectionIds: [] });
    out.op = op.name;
  } catch (e) { out.fsErr = errMsg(e); }
  try {
    const { getAuth } = require('firebase-admin/auth'), users = []; let token;
    do {
      const page = await getAuth().listUsers(1000, token); token = page.pageToken;
      for (const u of page.users) users.push({ uid: u.uid, email: u.email || null, emailVerified: !!u.emailVerified, displayName: u.displayName || null,
        disabled: !!u.disabled, providers: u.providerData.map(p => ({ providerId: p.providerId, uid: p.uid, email: p.email || null, displayName: p.displayName || null })),
        created: u.metadata.creationTime, lastSignIn: u.metadata.lastSignInTime, claims: u.customClaims || null });
    } while (token);
    const body = require('zlib').gzipSync(JSON.stringify({ at: Date.now(), project: projectId(), users }));
    await require('firebase-admin/storage').getStorage().bucket(bucket).file(`auth/${id}.json.gz`).save(body, { contentType: 'application/gzip', resumable: false });
    out.authUsers = users.length; out.authBytes = body.length;
  } catch (e) { out.authErr = errMsg(e); }
  out.state = out.fsErr ? 'failed' : 'running';                     // the Firestore export finishes later (refreshBackups)
  await ref.set(out, { merge: true });
  if (out.fsErr || out.authErr) await serverLog({ fn: 'backup', kind: 'error', code: out.fsErr ? 'firestore_export' : 'auth_export', msg: out.fsErr || out.authErr, ms: 0 });
  return { id, ...out };
}
// follows the exports still running: done / failed (→ serverLog); one not done after 12 hours is failed
async function refreshBackups() {
  const q = await db.collection('backups').where('state', '==', 'running').limit(20).get();
  for (const d of q.docs) {
    const b = d.data(), upd = {};
    try {
      if (!b.op) { if (Date.now() - (b.at || 0) > 600e3) Object.assign(upd, { state: 'failed', fsErr: 'no export was started' }); }
      else {
        const op = await fsAdmin().checkExportDocumentsProgress(b.op), m = op.metadata || {};
        if (op.done) {
          upd.end = tsMs(m.endTime) || Date.now();
          upd.docs = Number((m.progressDocuments || {}).completedWork || 0); upd.bytes = Number((m.progressBytes || {}).completedWork || 0);
          if (op.error) upd.fsErr = errMsg(op.error.message || JSON.stringify(op.error));
          upd.state = (upd.fsErr || b.authErr) ? 'failed' : 'done';
        } else if (Date.now() - (b.at || 0) > 12 * 36e5) Object.assign(upd, { state: 'failed', fsErr: 'the export did not finish in 12 hours' });
      }
    } catch (e) { if (Date.now() - (b.at || 0) > 12 * 36e5) Object.assign(upd, { state: 'failed', fsErr: errMsg(e) }); }
    if (!upd.state) continue;
    await d.ref.set(upd, { merge: true });
    if (upd.state === 'failed' && upd.fsErr) await serverLog({ fn: 'backup', kind: 'error', code: 'firestore_export', msg: upd.fsErr, ms: 0 });
  }
}
// every night (Israel time): follow the running exports; a new export when the last good one is BACKUP_EVERY_DAYS old
exports.backupData = require('firebase-functions/v2/scheduler').onSchedule(
  { schedule: '20 3 * * *', timeZone: 'Asia/Jerusalem', region: 'europe-west1', retryCount: 0, timeoutSeconds: 540, memory: '512MiB' },
  async () => {
    await refreshBackups();
    const last = (await db.collection('backups').orderBy('at', 'desc').limit(20).get()).docs.map(d => d.data()).find(b => b.state !== 'failed');
    if (!last || Date.now() - (last.at || 0) > (BACKUP_EVERY_DAYS - 0.5) * 864e5) await runBackup('auto');
  });

// the setup as Google reports it: point-in-time recovery, delete protection, the managed backup schedules and backups, the bucket
async function backupSetup() {
  const s = {}, c = fsAdmin();
  try { const [g] = await c.getDatabase({ name: dbPath() });
    Object.assign(s, { location: g.locationId, pitr: g.pointInTimeRecoveryEnablement === 'POINT_IN_TIME_RECOVERY_ENABLED', earliest: tsMs(g.earliestVersionTime),
      deleteProtection: g.deleteProtectionState === 'DELETE_PROTECTION_ENABLED' }); } catch (e) { s.dbErr = errMsg(e); }
  try { const [list] = await c.listBackupSchedules({ parent: dbPath() });
    s.schedules = list.map(x => ({ daily: !!x.dailyRecurrence, weekday: x.weeklyRecurrence ? x.weeklyRecurrence.day : null,
      days: Math.round(Number((x.retention || {}).seconds || 0) / 86400) })); } catch (e) { s.schedErr = errMsg(e); }
  try { const [list] = await c.listBackups({ parent: `projects/${projectId()}/locations/-` });
    s.backups = list.filter(x => /\/databases\/\(default\)$/.test(x.database || '')).map(x => ({ state: x.state, snapshot: tsMs(x.snapshotTime), expire: tsMs(x.expireTime) }))
      .sort((a, b) => b.snapshot - a.snapshot).slice(0, 10); } catch (e) { s.backupsErr = errMsg(e); }
  try { const b = require('firebase-admin/storage').getStorage().bucket(backupBucket()), [m] = await b.getMetadata();
    const del = ((m.lifecycle || {}).rule || []).find(r => r.action && r.action.type === 'Delete' && r.condition && r.condition.age);
    s.bucket = { name: m.name, location: m.location, deleteAfterDays: del ? Number(del.condition.age) : 0,
      publicBlocked: (m.iamConfiguration || {}).publicAccessPrevention === 'enforced' }; } catch (e) { s.bucketErr = errMsg(e); }
  return s;
}

// Restoring one family (its owner's email or its id) as it was at a minute of the last 7 days (point-in-time recovery).
// Only the content: the family document, fam (the kids: fam/kids), sets, progress. Never who has access – members, devices,
// invitations, tutorView and the kid links (kidTokens) stay as they are now, so a removed adult or a revoked kid link
// never comes back – and never usage, billing or builds. A deleted account is never restored (the privacy policy).
// Then fam/restore is marked: every open app of the family drops the copy it keeps on the phone and loads the restored
// data (an app merges into its own copy otherwise, and would write the old data back). Undo: restore again to `undoAt`.
const RESTORE_SUBS = ['fam', 'sets', 'progress'];
const RESTORE_KEEP = ['kidTokens'];
async function restoreFamily(d, by) {
  const { getAuth } = require('firebase-admin/auth');
  let famId = String(d.fam || '').trim();
  if (famId.includes('@')) { try { famId = (await getAuth().getUserByEmail(famId)).uid; } catch (_) { throw new HttpsError('not-found', 'no_account', { reason: 'no_account' }); } }
  if (!/^[A-Za-z0-9_-]{6,128}$/.test(famId)) throw new HttpsError('invalid-argument', 'bad_family', { reason: 'bad_family' });
  try { await getAuth().getUser(famId); } catch (_) { throw new HttpsError('failed-precondition', 'account_deleted', { reason: 'account_deleted' }); }
  const at = Math.floor(Number(d.at) / 60000) * 60000;               // older than an hour, the past is read at whole minutes
  if (!(at > Date.now() - 7 * 864e5 + 10 * 60000 && at <= Date.now() - 60000)) throw new HttpsError('invalid-argument', 'out_of_window', { reason: 'out_of_window' });
  const fam = db.doc(`families/${famId}`), mark = db.doc(`families/${famId}/fam/restore`);   // the mark: every open app of the family drops its own copy
  const readAll = async get => { const out = new Map(), f = await get(fam); if (f.exists) out.set(fam.path, f.data());
    for (const s of RESTORE_SUBS) (await get(fam.collection(s))).docs.forEach(x => { if (x.ref.path !== mark.path) out.set(x.ref.path, x.data()); }); return out; };
  const { Timestamp } = require('firebase-admin/firestore');
  const then = await db.runTransaction(t => readAll(r => t.get(r)), { readOnly: true, readTime: Timestamp.fromMillis(at) });
  if (!then.has(fam.path)) throw new HttpsError('failed-precondition', 'no_family_then', { reason: 'no_family_then' });
  const start = Date.now(), now = await readAll(r => r.get());
  const same = (a, b) => JSON.stringify(a, Object.keys(a || {}).sort()) === JSON.stringify(b, Object.keys(b || {}).sort());
  const count = m => ({ kids: ((m.get(`${fam.path}/fam/kids`) || {}).list || []).length, sets: [...m.keys()].filter(p => p.includes('/sets/')).length,
    progress: [...m.keys()].filter(p => p.includes('/progress/')).length });
  const famThen = { ...then.get(fam.path) }, famNow = now.get(fam.path) || {};
  for (const k of RESTORE_KEEP) { if (k in famNow) famThen[k] = famNow[k]; else delete famThen[k]; }
  then.set(fam.path, famThen);
  const write = [...then.keys()].filter(p => !now.has(p) || !same(then.get(p), now.get(p))), del = [...now.keys()].filter(p => !then.has(p));
  const res = { famId, at, then: count(then), now: count(now), write: write.length, del: del.length };
  if (!d.confirm) return res;
  const bw = db.bulkWriter(); let failed = 0; bw.onWriteError(e => { if (e.failedAttempts < 3) return true; failed++; return false; });
  write.forEach(p => bw.set(db.doc(p), then.get(p)));
  del.forEach(p => bw.delete(db.doc(p)));
  await bw.close();
  await mark.set({ at: Date.now(), to: at });                          // the apps (parents' and kids' phones) take the restored data, never push their old copy back
  await serverLog({ fn: 'adminBackup', kind: 'restore', code: failed ? 'partial' : 'ok',
    msg: `family …${famId.slice(-4)} restored to ${new Date(at).toISOString().slice(0, 16)}Z by ${by}: ${write.length} written, ${del.length} deleted${failed ? `, ${failed} failed` : ''}`, ms: Date.now() - start });
  return { ...res, done: true, failed, undoAt: Math.floor(start / 60000) * 60000 };
}

exports.adminBackup = onCall({ region: 'europe-west1', invoker: 'public', maxInstances: 2, timeoutSeconds: 540, memory: '512MiB' }, async function adminBackup(request) {
  const auth = parentOnly(request);
  if (!isAdminUser(auth)) throw new HttpsError('permission-denied', 'Admins only.');
  const d = request.data || {};
  if (d.action === 'status') {
    try { await refreshBackups(); } catch (_) {}
    const runs = (await db.collection('backups').orderBy('at', 'desc').limit(15).get()).docs.map(x => ({ id: x.id, ...x.data() }));
    return { setup: await backupSetup(), runs, everyDays: BACKUP_EVERY_DAYS };
  }
  if (d.action === 'now') {
    const last = (await db.collection('backups').orderBy('at', 'desc').limit(1).get()).docs[0];
    if (last && last.data().state === 'running' && Date.now() - (last.data().at || 0) < 15 * 60000) throw new HttpsError('failed-precondition', 'running', { reason: 'running' });
    return runBackup('manual', auth.token.email);
  }
  if (d.action === 'restore') return restoreFamily(d, auth.token.email);
  throw new HttpsError('invalid-argument', 'Unknown action.');
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
  const { content, pages } = filesContent(images, step.images);
  let text;
  try { text = step.build(data, { images: images.length }); }
  catch (e) { if (e instanceof Bad) throw new HttpsError('invalid-argument', 'bad_input: ' + e.message, { reason: 'bad_input', field: e.message }); throw e; }
  content.push({ type: 'text', text });

  if (!admin && uid) await checkFamily(uid, famId);

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
    // what the pool must not give this kid (the phone knows: its ready sets, the ready questions it got, what it answered correctly)
    skip: { have: list(sk.have, 200, 60, 'skip'), used: list(sk.used, 4000, 80, 'skip'), solved: list(sk.solved, 6000, 16, 'skip') } };
}

// a new build: one of this month's free builds, or one paid credit (startBuild – the older app – and submitBuild)
async function openBuild(auth, famId, subject, extra = {}) {
  const month = monthKey(), adminUser = isAdminUser(auth);
  const usageRef = db.doc(`families/${famId}/usage/${month}`), billRef = db.doc(`families/${famId}/billing/main`);
  const ref = db.collection(`families/${famId}/builds`).doc();
  return db.runTransaction(async (tx) => {
    const [u, b] = await Promise.all([tx.get(usageRef), tx.get(billRef)]);
    const used = u.data()?.builds || 0, credits = b.data()?.credits || 0;
    let kind;
    if (adminUser) kind = 'admin';
    else if (used < FREE_BUILDS) kind = 'free';
    else if (credits > 0) kind = 'paid';
    else throw new HttpsError('resource-exhausted', 'quota', { reason: 'quota', used, free: FREE_BUILDS, credits, price: PRICE_ILS });
    tx.set(usageRef, { builds: FieldValue.increment(kind === 'admin' ? 0 : 1), month }, { merge: true });
    if (kind === 'paid') tx.set(billRef, { credits: FieldValue.increment(-1) }, { merge: true });
    tx.set(ref, { by: auth.uid, at: Date.now(), kind, calls: 0, status: 'running', subject: String(subject).slice(0, 60), month, ...extra });
    return { buildId: ref.id, kind, used: used + (kind === 'admin' ? 0 : 1), free: FREE_BUILDS, credits: credits - (kind === 'paid' ? 1 : 0), price: PRICE_ILS };
  });
}
// End a running build (done / failed / cancelled). One that ended before it really started (≤ 3 AI calls, not done) gives its
// free build / credit back – at most REFUNDS_PER_MONTH times a month, so "start, call, fail on purpose" cannot repeat for free.
async function closeBuild(famId, buildId, status, extra = {}) {
  const ref = buildRef(famId, buildId);
  return db.runTransaction(async (tx) => {
    const bd = await tx.get(ref);
    if (!bd.exists || bd.data().status !== 'running') return { refunded: false, closed: false };
    const d = bd.data(), usageRef = db.doc(`families/${famId}/usage/${d.month}`);
    const refunds = (await tx.get(usageRef)).data()?.refunds || 0;
    const refund = status !== 'done' && d.calls <= 3 && d.kind !== 'admin' && refunds < REFUNDS_PER_MONTH;
    tx.update(ref, { status, endedAt: Date.now(), refunded: refund, ...extra, ...(refund ? { resumable: false } : {}) });
    if (refund) tx.set(usageRef, { refunds: FieldValue.increment(1), ...(d.kind === 'free' ? { builds: FieldValue.increment(-1) } : {}) }, { merge: true });
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
    const name = { error: 'תקלות', slow: 'קריאות איטיות', fallback: 'מודל חלופי', budget: 'הוצאות AI', restore: 'שחזור משפחה' };
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
