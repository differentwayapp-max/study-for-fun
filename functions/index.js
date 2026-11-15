// Study for fun – the only server code: a callable function that sends the app's
// prompts (and photos of worksheets) to Claude and returns parsed JSON.
// The Anthropic API key stays here as a secret and never reaches the browser.
//
//   firebase functions:secrets:set ANTHROPIC_API_KEY
//
const { onCall: onCallRaw, HttpsError } = require('firebase-functions/v2/https');
// every call logs one short line: which function, ok or which error (no prompt text, no personal data)
const onCall = (opts, fn) => onCallRaw(opts, async (req) => {
  const t = Date.now(), name = (fn.name || 'call');
  try { const r = await fn(req); console.log(`${name} ok ${Date.now() - t}ms`); return r; }
  catch (e) {
    console.warn(`${name} failed: ${e.code || ''} ${e.message || e} ${Date.now() - t}ms`);
    const fam = req.data && req.data.famId;
    if (typeof fam === 'string' && /^[A-Za-z0-9_-]{6,128}$/.test(fam) && e.code !== 'resource-exhausted') {
      try { await getFirestore().collection(`families/${fam}/errlog`).add({ at: Date.now(), where: 'server:' + name, code: String(e.code || e.name || 'error'),
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
const PRICE = {                               // USD per 1M tokens: [input, output]
  'claude-haiku-5-5': [0.10, 0.50], 'claude-sonnet-5-5': [2, 10], 'claude-opus-5-5': [4, 20]
};
const ADMIN_EMAILS = defineString('ADMIN_EMAILS', { default: '' });   // comma-separated, no family limits

function monthKey(d = new Date()) {           // Israel time, e.g. "2026-11"
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem', year: 'numeric', month: '2-digit' }).format(d).slice(0, 7);
}
function isAdminUser(auth) {
  const list = ADMIN_EMAILS.value().split(',').map(x => x.trim().toLowerCase()).filter(Boolean);
  return !!auth.token.email && auth.token.email_verified !== false && list.includes(auth.token.email.toLowerCase());
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
async function addSpend(model, usage) {
  const [pi, po] = PRICE[model] || PRICE['claude-sonnet-5-5'];
  const inTok = (usage?.input_tokens || 0) + (usage?.cache_creation_input_tokens || 0) * 1.25 + (usage?.cache_read_input_tokens || 0) * 0.1;
  const usd = (inTok * pi + (usage?.output_tokens || 0) * po) / 1e6;
  await db.doc(`meta/ai_spend_${monthKey()}`).set({ usd: FieldValue.increment(usd), calls: FieldValue.increment(1) }, { merge: true });
  return usd;
}

// Start a new practice set: uses one of this month's free builds, or one paid credit.
exports.startBuild = onCall({ region: 'europe-west1', invoker: 'public', maxInstances: 10 }, async function startBuild(request) {
  const auth = parentOnly(request);
  const { famId, subject = '' } = request.data || {};
  await checkFamily(auth.uid, famId);
  await checkBudget();
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

// End a build. A build that failed before it really started (≤ 3 AI calls) gives its free build / credit back.
exports.endBuild = onCall({ region: 'europe-west1', invoker: 'public', maxInstances: 10 }, async function endBuild(request) {
  const auth = parentOnly(request);
  const { famId, buildId, ok } = request.data || {};
  await checkFamily(auth.uid, famId);
  if (typeof buildId !== 'string' || !buildId) throw new HttpsError('invalid-argument', 'Missing build.');
  const buildRef = db.doc(`families/${famId}/builds/${buildId}`);
  return db.runTransaction(async (tx) => {
    const bd = await tx.get(buildRef);
    if (!bd.exists || bd.data().status !== 'running') return { refunded: false };
    const d = bd.data(), refund = !ok && d.calls <= 3;
    tx.update(buildRef, { status: ok ? 'done' : 'failed', endedAt: Date.now(), refunded: refund });
    if (refund && d.kind === 'free') tx.set(db.doc(`families/${famId}/usage/${d.month}`), { builds: FieldValue.increment(-1) }, { merge: true });
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

    const { prompt, images = [], tier = 'default', famId, buildId } = request.data || {};
    if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 60000) {
      throw new HttpsError('invalid-argument', 'Missing or oversized prompt.');
    }
    if (!Array.isArray(images) || images.length > MAX_IMAGES) {
      throw new HttpsError('invalid-argument', `Up to ${MAX_IMAGES} images.`);
    }

    await checkBudget();
    await claimCall(auth, famId, buildId);

    const content = [];
    for (const img of images) {
      if (!img || typeof img.data !== 'string' || img.data.length > MAX_IMAGE_B64) {
        throw new HttpsError('invalid-argument', 'Image too large.');
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
        max_tokens: 16000,
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
    await addSpend(msg.model || model, msg.usage).catch(e => console.error('spend log', e));
    if (msg.stop_reason === 'refusal') throw new HttpsError('failed-precondition', 'refusal', { reason: 'refusal' });
    if (msg.stop_reason === 'max_tokens') throw new HttpsError('resource-exhausted', 'too_long', { reason: 'too_long' });
    const text = (msg.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
    return { json: extractJson(text) };
  }
);
