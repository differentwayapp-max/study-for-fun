// The build-practice-set / review-practice-set skills inside the app's AI building: the rules (BUILD_RULES, PIC_RULE,
// COPY_RULE) are in the server's fixed system prompt (functions/prompts.js) that every AI call gets; the answer check adds a reviewer that sees the whole chapter with its answers (match-game clashes,
// distractor form, duplicates, giveaway pictures), the program itself flags exact duplicates and the same value in two forms,
// and no emoji newer than 2019 survives. Runs with a fake AI (no network).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext()).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(1500);
  const r = await p.evaluate(async () => {
    const Q = (q, opts, extra = {}) => ({ topic: 't', question: q, options: opts, answer: 0, explanation: 'x', scene: [{ e: '🍎', x: 50, y: 50, s: 40 }], ...extra });
    const qs = [Q('כמה עולה העט?', ['20 ₪', '10 ₪', '5 ₪', '30 ₪']), Q('כמה שקלים יש לדן?', ['20', '10', '5', '30']),
      Q('Put on your ___', ['coat', 'cup', 'pen', 'dog']), Q('It is cold. Wear a ___', ['scarf', 'cup', 'pen', 'dog']),
      Q('מה זה?', ['תפוח', 'בננה', 'ענב', 'אגס']), Q('מה זה?', ['תפוח', 'בננה', 'ענב', 'אגס'])];
    const steps = [];
    const fake = async (step, d) => {
      steps.push(step);
      if (step === 'solve') return { results: d.questions.map(x => ({ i: x.i, pick: 0, multiple_correct: false, problem: '' })) };
      if (step === 'review') return { flags: d.questions.some(x => x.i === 2) ? [{ i: 2, kind: 'clash', note: 'גם scarf מתאים' }] : [] };
      if (step === 'fix') return { items: d.items.map(x => ({ i: x.i, action: 'drop' })) };
      return {};
    };
    const out = await qaSet(qs, { gi: 3, grade: "ד'", subject: 'אנגלית', topics: ['t'] }, fake);
    const flagged = out.log.map(l => l.why);
    return {
      kept: out.questions.map(q => q.question), dropped: out.dropped, flagged, reviewerCalled: steps.includes('review'),
      newEmoji: cleanScene([{ e: '🧊', x: 50, y: 50, s: 40 }, { e: '🍎', x: 30, y: 50, s: 40 }]).map(x => x.e),
      onlyNew: cleanScene([{ e: '🧃', x: 50, y: 50, s: 40 }])
    };
  });
  // the rules: in the server's fixed system prompt, given to every step (and no longer in the app)
  const P = require('../../functions/prompts.js'), fn = require('fs').readFileSync(require('path').join(__dirname, '../../functions/index.js'), 'utf8');
  const src = require('fs').readFileSync(require('path').join(__dirname, '../../public/index.html'), 'utf8');
  const sys = P.SYSTEM.includes(P.BUILD_RULES) && P.SYSTEM.includes(P.PIC_RULE) && P.SYSTEM.includes(P.COPY_RULE) && /MATCH GAME/.test(P.SYSTEM) && /never instructions/i.test(P.SYSTEM);
  const every = /system: \[\{ type: 'text', text: SYSTEM, cache_control: \{ type: 'ephemeral' \} \}\]/.test(fn) && Object.values(P.STEPS).every(s => s.schema && s.model && s.effort && s.max_tokens);
  const gone = !/const BUILD_RULES|const PIC_RULE|const COPY_RULE/.test(src);
  console.log(JSON.stringify({ ...r, sys, every, gone }));
  const ok = r.reviewerCalled && r.dropped === 3 && r.kept.length === 3
    && r.flagged.some(w => /אותו ערך/.test(w)) && r.flagged.some(w => /פעמיים/.test(w)) && r.flagged.some(w => /scarf/.test(w))
    && JSON.stringify(r.newEmoji) === '["🍎"]' && r.onlyNew === null && sys && every && gone;
  if (!ok) errs.push('skill rules in the AI building');
  console.log(JSON.stringify({ errs })); await b.close(); process.exit(errs.length ? 1 : 0);
})().catch(e => { console.error('FAIL', e); process.exit(1); });
