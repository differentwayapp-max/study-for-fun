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
    out.samples = { yes: ['Which is correct?', 'Which sentence about her is correct?', 'Which word is NOT an animal?', 'מה נכון?', 'מה מהבאים שביר?', 'איזה מזון יוצא דופן?'].filter(t).length,
      no: ['Which word rhymes with cat?', "You ___ use phones. It's not allowed.", 'My parents ___ in Haifa.', 'כמה ילדים בחרו בננה?', 'מה זה?'].filter(t).length };
    return out;
  });
  console.log(JSON.stringify(r));
  if (r.leaks.length || r.samples.yes !== 6 || r.samples.no !== 0) errs.push('options questions');
  console.log(JSON.stringify({ errs })); await b.close(); process.exit(errs.length ? 1 : 0);
})().catch(e => { console.error('FAIL', e); process.exit(1); });
