// Questions that only make sense next to their options ("Which is correct?", "מה נכון?", "מה מהבאים…") stay in multiple
// choice: never in the match / memory / riddle / spell games, where the options are not shown.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => localStorage.setItem('sff_lang', 'he'));
  await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(1800); await p.evaluate(() => document.getElementById('fbLogin')?.remove());
  const r = await p.evaluate(async () => {
    const out = { leaks: [], kept: 0, matchCh: 0, chapters: 0 };
    const cat = await (await fetch('/share/catalog.json')).json();
    for (const e of cat.sets) {
      const s = await loadShare(e.id); s.questions = s.qs; s.id = 'c' + e.id;
      for (const m of ['match', 'memory', 'riddle', 'spell']) for (const q of modePool(s, m)) if (needOpts(q)) out.leaks.push(e.id + ': ' + q.question);
      out.kept += s.questions.filter(needOpts).length;
      const C = getChapters(s); out.chapters += C.length; out.matchCh += C.filter((c, i) => modePool({ questions: c.qs, chapters: s.chapters }, 'match').length === c.qs.length).length;
    }
    const t = q => needOpts({ question: q });
    out.samples = { yes: ['Which is correct?', 'Which sentence about her is correct?', 'Which word is NOT an animal?', 'מה נכון?', 'מה מהבאים שביר?', 'איזה מזון יוצא דופן?',
        'אֵיזֶה מֵהֶם פְּרִי?', 'איזו מילה יוצאת דופן?', 'איזו מילה כתובה נכון?', 'מה אינו חלק מהצמח?', 'Choose the correct word.', 'מָה מֵהֶם לֹא שַׁיָּךְ לַקְּבוּצָה?'].filter(t).length,
      no: ['Which word rhymes with cat?', "You ___ use phones. It's not allowed.", 'My parents ___ in Haifa.', 'כמה ילדים בחרו בננה?', 'מה זה?'].filter(t).length };
    // one-letter answers keep their case in the match game: "D" is not "d"
    const L = (q, a) => ({ topic: 't', question: q, options: [a, 'x1', 'x2', 'x3'], answer: 0, explanation: '', ch: 0 });
    const ls = { id: 'lt', kidId: 'k1', name: 'עדי', grade: 3, subject: 'אנגלית', topics: ['t'], chapters: [{ title: 'a', topics: ['t'], count: 3 }],
      questions: [L('האות הגדולה של d?', 'D'), L('האות הקטנה של D?', 'd'), L('cat', 'חתול')], examDate: '', dailyGoal: 1, perRound: 10, qa: {}, created: Date.now() };
    kids.push({ id: 'k1', name: 'עדי', grade: 3, color: '#FF5C8A' }); sets.push(ls); startGame(ls, null, 'match', 0);
    const big = G.m.slice.findIndex(q => q.options[0] === 'D'), small = G.m.slice.findIndex(q => q.options[0] === 'd');
    matchSel(big); matchTo(small); out.caseWrong = !G.m.done[big];
    matchSel(big); matchTo(big); out.caseRight = !!G.m.done[big];
    out.perSet = {}; for (const e of cat.sets) { const s = await loadShare(e.id); s.questions = s.qs; const C = getChapters(s);
      out.perSet[e.id] = C.filter(c => modePool({ questions: c.qs, chapters: s.chapters }, 'match').length === c.qs.length && c.qs.length >= 3).length + '/' + C.length; }
    return out;
  });
  console.log(JSON.stringify(r));
  if (r.leaks.length || r.samples.yes !== 12 || !r.caseWrong || !r.caseRight || r.samples.no !== 0) errs.push('options questions');
  console.log(JSON.stringify({ errs })); await b.close(); process.exit(errs.length ? 1 : 0);
})().catch(e => { console.error('FAIL', e); process.exit(1); });
