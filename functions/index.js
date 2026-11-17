// Study for fun – the only server code: a callable function that sends the app's
// prompts (and photos of worksheets) to Claude and returns parsed JSON.
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
const SLOW_MS = 7 * 60 * 1000;
const onCall = (opts, fn) => onCallRaw(opts, async (req) => {
  const t = Date.now(), name = (fn.name || 'call');
  try { const r = await fn(req); const ms = Date.now() - t; console.log(`${name} ok ${ms}ms`);
    if (ms > SLOW_MS) await serverLog({ fn: name, kind: 'slow', code: 'ok', msg: 'slow call – close to the 9-minute limit', ms });
    return r; }
  catch (e) {
    console.warn(`${name} failed: ${e.code || ''} ${e.message || e} ${Date.now() - t}ms`);
    await serverLog({ fn: name, kind: 'error', code: String(e.code || e.name || 'error').slice(0, 60), msg: String(e.message || e).slice(0, 300), ms: Date.now() - t });
    const fam = req.data && req.data.famId, uid = req.auth && req.auth.uid;
    const google = req.auth && req.auth.token && req.auth.token.firebase && req.auth.token.firebase.sign_in_provider === 'google.com';
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

// The app asks for a tier; we map it to a model.
const MODELS = {
  quick: 'claude-haiku-5-5',
  default: 'claude-sonnet-5-5',
  complex: 'claude-opus-5-5'
};

// ---- limits ------------------------------------------------------------------------------
// Every family gets FREE_BUILDS new practice sets a month. More need a paid credit (PRICE_ILS each),
// added to families/{f}/billing/main.credits by the payment provider's webhook once payments open.
// Small AI edits outside a build (fix a question, add pictures) are capped by LIGHT_CALLS a month.
// The whole app stops calling the AI once this month's estimated spend reaches MONTHLY_CAP_USD.
const FREE_BUILDS = 3;
const PRICE_ILS = 5;
const LIGHT_CALLS = 40;
const BUILD_CALLS = 60;                       // AI calls one build may make (a 10-chapter set needs ~25)
const BUILD_HOURS = 3;                        // a build token is valid this long
const MONTHLY_CAP_USD = 40;
// One family may use at most this much of the month's AI budget (3 normal builds cost far less),
// so a single account can never use up the whole app's budget. Admins have no family limit.
const FAMILY_CAP_USD = 8;
const REFUNDS_PER_MONTH = 2;                  // failed-at-the-start builds given back per family per month
const PRICE = {                               // USD per 1M tokens: [input, output]
  'claude-haiku-5-5': [0.10, 0.50], 'claude-sonnet-5-5': [2, 10], 'claude-opus-5-5': [4, 20]
};
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
  if (!auth || auth.token.firebase?.sign_in_provider === 'anonymous') {
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
  if ((g.data()?.usd || 0) >= MONTHLY_CAP_USD) throw new HttpsError('resource-exhausted', 'budget', { reason: 'budget' });
}
// this family's share of the month's AI spend (checked after checkFamily, so famId is valid)
async function checkFamilyBudget(auth, famId) {
  if (isAdminUser(auth)) return;
  const u = await db.doc(`families/${famId}/usage/${monthKey()}`).get();
  if ((u.data()?.usd || 0) >= FAMILY_CAP_USD) throw new HttpsError('resource-exhausted', 'family_budget', { reason: 'family_budget', cap: FAMILY_CAP_USD });
}
// once a month, when the AI spend passes 80% of the monthly cap: a line in the server log (red dot for the app admins, and the alert email)
async function spendAlert() {
  const ref = db.doc(`meta/ai_spend_${monthKey()}`);
  const hit = await db.runTransaction(async t => { const d = (await t.get(ref)).data() || {};
    if ((d.usd || 0) < MONTHLY_CAP_USD * 0.8 || d.alert80) return 0; t.set(ref, { alert80: Date.now() }, { merge: true }); return d.usd; });
  if (hit) await serverLog({ fn: 'ask', kind: 'budget', code: '80%', msg: `AI spend this month: $${hit.toFixed(2)} of the $${MONTHLY_CAP_USD} cap`, ms: 0 });
}
async function addSpend(model, usage, famId) {
  const [pi, po] = PRICE[model] || PRICE['claude-sonnet-5-5'];
  const inTok = (usage?.input_tokens || 0) + (usage?.cache_creation_input_tokens || 0) * 1.25 + (usage?.cache_read_input_tokens || 0) * 0.1;
  const usd = (inTok * pi + (usage?.output_tokens || 0) * po) / 1e6;
  await db.doc(`meta/ai_spend_${monthKey()}`).set({ usd: FieldValue.increment(usd), calls: FieldValue.increment(1) }, { merge: true });
  await spendAlert().catch(() => {});
  if (typeof famId === 'string' && /^[A-Za-z0-9_-]{6,128}$/.test(famId))
    await db.doc(`families/${famId}/usage/${monthKey()}`).set({ usd: FieldValue.increment(usd), month: monthKey() }, { merge: true });
  return usd;
}

// Start a new practice set: uses one of this month's free builds, or one paid credit.
exports.startBuild = onCall({ region: 'europe-west1', invoker: 'public', maxInstances: 10 }, async function startBuild(request) {
  const auth = parentOnly(request);
  const { famId, subject = '' } = request.data || {};
  await checkFamily(auth.uid, famId);
  await checkBudget();
  await checkFamilyBudget(auth, famId);
  const month = monthKey(), adminUser = isAdminUser(auth);
  const usageRef = db.doc(`families/${famId}/usage/${month}`), billRef = db.doc(`families/${famId}/billing/main`);
  const buildRef = db.collection(`families/${famId}/builds`).doc();
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
    tx.set(buildRef, { by: auth.uid, at: Date.now(), kind, calls: 0, status: 'running', subject: String(subject).slice(0, 60), month });
    return { buildId: buildRef.id, kind, used: used + (kind === 'admin' ? 0 : 1), free: FREE_BUILDS, credits: credits - (kind === 'paid' ? 1 : 0), price: PRICE_ILS };
  });
});

// End a build. A build that failed before it really started (≤ 3 AI calls) gives its free build / credit back
// – at most REFUNDS_PER_MONTH times a month, so "start, call, fail on purpose" cannot repeat for free.
exports.endBuild = onCall({ region: 'europe-west1', invoker: 'public', maxInstances: 10 }, async function endBuild(request) {
  const auth = parentOnly(request);
  const { famId, buildId, ok } = request.data || {};
  await checkFamily(auth.uid, famId);
  if (typeof buildId !== 'string' || !buildId) throw new HttpsError('invalid-argument', 'Missing build.');
  const buildRef = db.doc(`families/${famId}/builds/${buildId}`);
  return db.runTransaction(async (tx) => {
    const bd = await tx.get(buildRef);
    if (!bd.exists || bd.data().status !== 'running') return { refunded: false };
    const d = bd.data(), usageRef = db.doc(`families/${famId}/usage/${d.month}`);
    const refunds = (await tx.get(usageRef)).data()?.refunds || 0;
    const refund = !ok && d.calls <= 3 && d.kind !== 'admin' && refunds < REFUNDS_PER_MONTH;
    tx.update(buildRef, { status: ok ? 'done' : 'failed', endedAt: Date.now(), refunded: refund });
    if (refund) tx.set(usageRef, { refunds: FieldValue.increment(1), ...(d.kind === 'free' ? { builds: FieldValue.increment(-1) } : {}) }, { merge: true });
    if (refund && d.kind === 'paid') tx.set(db.doc(`families/${famId}/billing/main`), { credits: FieldValue.increment(1) }, { merge: true });
    return { refunded: refund };
  });
});

// Every AI call is part of a build (buildId) or a small edit counted in the monthly "light" calls.
async function claimCall(auth, famId, buildId) {
  if (isAdminUser(auth)) return;
  await checkFamily(auth.uid, famId);
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
    // Only signed-in parents (Google) may spend AI credit; kid devices are anonymous.
    const auth = parentOnly(request);

    // the app's reachability check after a network failure (logFail): answers at once, not an error, nothing logged
    if (request.data && request.data.ping === true) return { json: { pong: true } };
    const { prompt, images = [], tier = 'default', famId, buildId } = request.data || {};
    if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 300000) {
      throw new HttpsError('invalid-argument', `Missing or oversized prompt (${typeof prompt === 'string' ? prompt.length : typeof prompt} chars).`);
    }
    if (!Array.isArray(images) || images.length > MAX_IMAGES) {
      throw new HttpsError('invalid-argument', `Up to ${MAX_IMAGES} images.`);
    }

    await checkBudget();
    if (!isAdminUser(auth)) await checkFamily(auth.uid, famId);
    await checkFamilyBudget(auth, famId);
    await claimCall(auth, famId, buildId);

    const content = [];
    for (const img of images) {
      if (!img || typeof img.data !== 'string' || img.data.length > (img.type === 'application/pdf' ? MAX_PDF_B64 : MAX_IMAGE_B64)) {
        throw new HttpsError('invalid-argument', 'Image too large.');
      }
      if (img.type === 'application/pdf') {                         // a worksheet or a class presentation as a PDF
        if (img.data.length > MAX_PDF_B64) throw new HttpsError('invalid-argument', 'PDF too large.');
        content.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: img.data } });
        continue;
      }
      const media = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(img.type) ? img.type : 'image/jpeg';
      content.push({ type: 'image', source: { type: 'base64', media_type: media, data: img.data } });
    }
    content.push({ type: 'text', text: prompt });

    const model = MODELS[tier] || MODELS.default;
    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY.value().trim() });
    let msg;
    try {
      // fallbacks: if the model declines a request, the API re-runs it on a fallback model in the same call
      msg = await client.beta.messages.create({
        model,
        max_tokens: tier === 'complex' ? 8000 : 16000,   // the answer check returns short JSON – a lower cap keeps it far from the 540 s limit
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        system: 'You build exam practice for Israeli school children. Reply with valid JSON only: no prose, no code fences.',
        messages: [{ role: 'user', content }]
      });
    } catch (e) {
      if (e instanceof Anthropic.RateLimitError) throw new HttpsError('resource-exhausted', 'rate_limited');
      if (e instanceof Anthropic.AuthenticationError) { console.error('Anthropic key rejected'); throw new HttpsError('internal', 'AI request failed (401).'); }
      if (e instanceof Anthropic.APIError) { console.error('Anthropic API error', e.status, String(e.message).slice(0, 300)); throw new HttpsError('internal', `AI request failed (${e.status}).`); }
      throw e;
    }
    await addSpend(msg.model || model, msg.usage, famId).catch(e => console.error('spend log', e));
    if (msg.model && msg.model !== model) {   // the API answered on a fallback model
      await db.doc(`meta/ai_spend_${monthKey()}`).set({ fallbacks: FieldValue.increment(1) }, { merge: true }).catch(() => {});
      await serverLog({ fn: 'ask', kind: 'fallback', code: String(msg.model).slice(0, 60), msg: `asked ${model}, answered by ${msg.model}`, ms: 0 });
    }
    if (msg.stop_reason === 'refusal') throw new HttpsError('failed-precondition', 'refusal', { reason: 'refusal' });
    if (msg.stop_reason === 'max_tokens') throw new HttpsError('resource-exhausted', 'too_long', { reason: 'too_long' });
    const text = (msg.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
    return { json: extractJson(text) };
  }
);

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
