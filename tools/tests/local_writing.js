// Which chapter of each practice set gets the (single) writing game, and that no other station picks a writing game.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(3000);
  for (const id of ['en4-nov26', 'en7-nov26', 'math7-nov26']) {
    const r = await p.evaluate(async id => { const pl = await loadShare(id);
      const set = { id: 'x' + id, name: 'ט', grade: pl.grade, subject: pl.subject, topics: pl.topics, questions: pl.qs, chapters: pl.chapters, kidId: null };
      const C = getChapters(set), w = writingChapter(set);
      const modes = C.map((c, i) => pickMode(set, i));
      const wr = modes.map((m, i) => (m === 'spell' || m === 'riddle') ? i : -1).filter(i => i >= 0);
      return { writing: w >= 0 ? C[w].title + ' (' + C[w].qs.slice(0, 6).map(q => q.options[q.answer]).join(', ') + ')' : 'none', stationsWithWriting: wr, modes: modes.join(',') };
    }, id);
    console.log(id, JSON.stringify(r));
  }
  console.log('errs', errs); await b.close();
})();
