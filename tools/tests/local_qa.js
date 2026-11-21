// The check of new questions (qaSet in public/index.html) with a scripted AI: the rules a program can check are caught
// without AI (an answer over 3 words, the answer inside the question, the same question twice, the same value in two
// forms); the set is solved blind once, every chapter reviewed with its answers; ready questions and the questions
// already in the chapter are "locked" – shown to the reviewer, never solved or changed; a fixed question is solved again
// AND reviewed again with its chapter, and dropped if the new review flags it. Local only (no emulators).
const { chromium } = require('playwright');
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) process.exitCode = 1; };
(async () => {
  const b = await chromium.launch(), p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(1500);
  const r = await p.evaluate(async () => {
    const Q = (question, opts, ch = 0, extra = {}) => ({ topic: 't', question, options: opts, answer: 0, explanation: 'כי', emoji: '🍎', scene: [{ e: '🍎', x: 50, y: 50, s: 30 }], ch, ...extra });
    const qs = [
      Q('כמה רגליים לכלב?', ['4', '2', '6', '8']),                         // 0 fine
      Q('מה צבע השמיים?', ['כחול בהיר מאוד היום', 'ירוק', 'אדום', 'שחור']),   // 1 answer over 3 words
      Q('האם הכלב הוא כלב?', ['כלב', 'חתול', 'סוס', 'פרה']),               // 2 the answer inside the question
      Q('כמה רגליים לכלב?', ['4', '3', '5', '7']),                          // 3 the same question twice
      Q('כמה עולה העט?', ['20 ₪', '10 ₪', '30 ₪', '5 ₪']),                 // 4 fine
      Q('מחיר המחברת בשקלים?', ['20', '10', '30', '5']),                    // 5 the same value as 4 in another form
      Q('ready one', ['a1', 'b1', 'c1', 'd1'], 0, { srcq: 'en4:abc' }),       // 6 a ready question – locked
      Q('flag me', ['x', 'y', 'z', 'w'], 1),                               // 7 the reviewer flags it; its fix is flagged again
      Q('solve wrong', ['p', 'q', 'r', 's'], 1),                           // 8 the blind solver picks another option; fixed fine
    ];
    const context = [Q('old question', ['o1', 'o2', 'o3', 'o4'], 1)];
    const seen = { solve: [], review: [], fix: [] }; let reviewRound = 0;
    const fake = async (step, d) => {
      if (step === 'solve') { seen.solve.push(d.questions.map(x => x.question)); return { results: d.questions.map(x => ({ i: x.i, pick: x.question === 'solve wrong' ? 1 : 0, multiple_correct: false, problem: '' })) }; }
      if (step === 'review') { seen.review.push(d.questions.map(x => [x.question, !!x.locked])); reviewRound++;
        return { flags: d.questions.filter(x => !x.locked && (x.question === 'flag me' || x.question === 'fixed 7')).map(x => ({ i: x.i, kind: 'clash', note: 'התנגשות' })) }; }
      if (step === 'fix') { seen.fix.push(d.items.map(x => x.i)); return { items: d.items.map(x => ({ i: x.i, action: 'fix', question: { ...Q('fixed ' + x.i, ['f' + x.i, 'g' + x.i, 'h' + x.i, 'k' + x.i]), core: false } })) }; }
      return {};
    };
    const out = await qaSet(qs, { gi: 1, grade: "ב'", subject: 'מתמטיקה', topics: ['t'] }, fake, { context });
    return { seen, out: out.questions.map(q => q.question), qa: { checked: out.checked, passed: out.passed, fixed: out.fixed, dropped: out.dropped }, log: out.log.map(l => l.why + ' → ' + l.result) };
  });
  console.log(JSON.stringify(r.qa), '\n ', r.log.join('\n  '));
  const fixedIdx = r.seen.fix.flat();
  ok([1, 2, 3, 5].every(i => fixedIdx.includes(i)), 'caught in code: answer over 3 words, answer in the question, same question twice, same value in two forms');
  ok(r.seen.solve.length === 2 && r.seen.solve[0].length === 8 && !r.seen.solve.flat().includes('ready one') && !r.seen.solve.flat().includes('old question'), 'one blind solve for the whole list (a second only for the fixes); locked questions are not solved');
  ok(r.seen.review.some(l => l.some(([q, lk]) => q === 'ready one' && lk)) && r.seen.review.some(l => l.some(([q, lk]) => q === 'old question' && lk)), 'the reviewer sees the ready question and the chapter\'s old question as locked');
  ok(!fixedIdx.includes(6) && r.out.includes('ready one'), 'a ready question is never changed');
  ok(fixedIdx.includes(8) && r.out.includes('fixed 8'), 'a question the blind solver got wrong is fixed and kept');
  ok(!r.out.includes('fixed 7') && !r.out.includes('flag me') && r.log.some(l => /לא עבר בדיקה חוזרת/.test(l)), 'a fix that the second review flags is dropped');
  ok(r.qa.checked === 9 && r.qa.fixed + r.qa.dropped === fixedIdx.length, 'the counts add up');
  ok(!errs.length, 'no page errors ' + JSON.stringify(errs));
  await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
