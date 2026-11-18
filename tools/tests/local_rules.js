// The build-practice-set / review-practice-set skills inside the app's AI building: every prompt that writes questions
// carries BUILD_RULES, the answer check adds a reviewer that sees the whole chapter with its answers (match-game clashes,
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
    const prompts = [];
    const fake = async (prompt) => {
      prompts.push(prompt);
      if (prompt.startsWith('You are an independent checker')) return { results: qs.map((q, i) => ({ i, pick: 0, multiple_correct: false, problem: '' })) };
      if (prompt.startsWith('You review practice questions')) return { flags: [{ i: 2, kind: 'clash', note: 'גם scarf מתאים' }] };
      if (prompt.includes('An independent checker flagged')) { const m = [...prompt.matchAll(/"i":(\d+),"why"/g)].map(x => +x[1]);
        return { items: m.map(i => ({ i, action: 'drop' })) }; }
      return {};
    };
    const out = await runQA(qs, 'ctx', 'Hebrew', fake);
    const flagged = out.log.map(l => l.why);
    return {
      kept: out.questions.map(q => q.question), dropped: out.dropped, flagged,
      reviewerCalled: prompts.some(x => x.startsWith('You review practice questions')),
      fixHasRules: prompts.filter(x => x.includes('An independent checker flagged')).every(x => x.includes('MATCH GAME') && x.includes('PICTURE')),
      newEmoji: cleanScene([{ e: '🧊', x: 50, y: 50, s: 40 }, { e: '🍎', x: 30, y: 50, s: 40 }]).map(x => x.e),
      onlyNew: cleanScene([{ e: '🧃', x: 50, y: 50, s: 40 }])
    };
  });
  // the source of the app: BUILD_RULES in every prompt that writes questions
  const src = require('fs').readFileSync(require('path').join(__dirname, '../../public/index.html'), 'utf8');
  const uses = (src.match(/\$\{BUILD_RULES\}/g) || []).length;
  console.log(JSON.stringify({ ...r, uses }));
  const ok = r.reviewerCalled && r.fixHasRules && r.dropped === 3 && r.kept.length === 3
    && r.flagged.some(w => /אותו ערך/.test(w)) && r.flagged.some(w => /פעמיים/.test(w)) && r.flagged.some(w => /scarf/.test(w))
    && JSON.stringify(r.newEmoji) === '["🍎"]' && r.onlyNew === null && uses >= 5;
  if (!ok) errs.push('skill rules in the AI building');
  console.log(JSON.stringify({ errs })); await b.close(); process.exit(errs.length ? 1 : 0);
})().catch(e => { console.error('FAIL', e); process.exit(1); });
