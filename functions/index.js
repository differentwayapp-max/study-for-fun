// Study for fun – the only server code: a callable function that sends the app's
// prompts (and photos of worksheets) to Claude and returns parsed JSON.
// The Anthropic API key stays here as a secret and never reaches the browser.
//
//   firebase functions:secrets:set ANTHROPIC_API_KEY
//
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');

const ANTHROPIC_API_KEY = defineSecret('ANTHROPIC_API_KEY');

// The app asks for a tier; we map it to a model.
const MODELS = {
  quick: 'claude-haiku-5-5',
  default: 'claude-sonnet-5-5',
  complex: 'claude-opus-5-5'
};

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
    secrets: [ANTHROPIC_API_KEY],
    timeoutSeconds: 300,
    memory: '512MiB',
    maxInstances: 10
  },
  async (request) => {
    // Only signed-in parents (Google) may spend AI credit; kid devices are anonymous.
    const auth = request.auth;
    if (!auth || auth.token.firebase?.sign_in_provider === 'anonymous') {
      throw new HttpsError('permission-denied', 'Only a signed-in parent can build practices.');
    }

    const { prompt, images = [], tier = 'default' } = request.data || {};
    if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 60000) {
      throw new HttpsError('invalid-argument', 'Missing or oversized prompt.');
    }
    if (!Array.isArray(images) || images.length > MAX_IMAGES) {
      throw new HttpsError('invalid-argument', `Up to ${MAX_IMAGES} images.`);
    }

    const content = [];
    for (const img of images) {
      if (!img || typeof img.data !== 'string' || img.data.length > MAX_IMAGE_B64) {
        throw new HttpsError('invalid-argument', 'Image too large.');
      }
      const media = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(img.type) ? img.type : 'image/jpeg';
      content.push({ type: 'image', source: { type: 'base64', media_type: media, data: img.data } });
    }
    content.push({ type: 'text', text: prompt });

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY.value(),
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: MODELS[tier] || MODELS.default,
        max_tokens: 8000,
        system: 'You build exam practice for Israeli school children. Reply with valid JSON only: no prose, no code fences.',
        messages: [{ role: 'user', content }]
      })
    });

    if (res.status === 429) throw new HttpsError('resource-exhausted', 'rate_limited');
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error('Anthropic API error', res.status, body.slice(0, 500));
      throw new HttpsError('internal', `AI request failed (${res.status}).`);
    }

    const msg = await res.json();
    const text = (msg.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
    return { json: extractJson(text) };
  }
);
