// Core facts (q.core) come back as 2–3 review questions at the end of a later station: only facts already met in another
// station, not today, not in the same kind of game as last time, mistakes first; never in match / memory; the station's own
// result (passing it) does not count them; the memory bonus does not use them. OUT=dir for a screenshot.
const { chromium } = require('playwright');
const OUT = process.env.OUT || require('os').tmpdir();   // screenshots never land in the repo
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => localStorage.setItem('sff_lang', 'he'));
  await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(1800); await p.evaluate(() => document.getElementById('fbLogin')?.remove());
  const r = await p.evaluate(async () => {
    const s = await loadShare('math3'); s.id = 'c1'; s.questions = s.qs; s.kidId = 'k1'; kids.push({ id: 'k1', name: 'נועה', grade: 2, color: '#FF5C8A' }); sets.push(s);
    const C = getChapters(s), idx = q => s.questions.indexOf(q);
    const a = C[0].qs.slice(0, 3), bq = C[1].qs.slice(0, 2), c = C[2].qs[0];          // core facts in chapters 1–3
    [...a, ...bq, c].forEach(q => q.core = true);
    const day = 864e5, now = Date.now();
    history.unshift({ at: now - 3 * day, kidId: 'k1', setId: 'c1', ch: 0, right: 9, n: 10, mode: 'match', qr: [`${idx(a[0])}.1`, `${idx(a[1])}.0.1`, `${idx(a[2])}.1`], topics: {} });
    history.unshift({ at: now - 2 * day, kidId: 'k1', setId: 'c1', ch: 1, right: 10, n: 10, mode: 'choice', qr: bq.map(q => `${idx(q)}.1`), topics: {} });
    history.unshift({ at: now - 1000, kidId: 'k1', setId: 'c1', ch: 2, right: 10, n: 10, mode: 'riddle', qr: [`${idx(c)}.1`], topics: {} });   // today
    const pick = (ch, mode) => reviewQs(s, ch, mode).map(q => idx(q));
    const out = {
      choice: pick(5, 'choice'),            // a* last seen in match (ok), bq last seen in choice (same game → no), c seen today (no); 3 candidates → 2
      riddle: pick(5, 'riddle'),            // a* and bq (riddle ≠ match/choice), not c (today); 5 candidates → 2
      match: pick(5, 'match'), memory: pick(5, 'memory'),
      own: pick(0, 'choice'),               // the station's own core facts are not "review"
      mistakeFirst: pick(5, 'choice')[0] === idx(a[1]),
      expectChoice: a.map(idx)
    };
    // a station in multiple choice: the review questions come at the end, with a tag; the station result does not count them
    startGame(s, null, 'choice', 5);
    const n0 = C[5].qs.length; out.total = G.qs.length; out.n0 = n0; out.tail = G.qs.slice(n0).map(idx);
    G.i = n0; choiceRender(); out.tag = !!document.querySelector('#gPlay .revtag');
    G.res = G.qs.map((q, k) => ({ q, ok: k < n0 })); endGame();
    const h = history[0]; out.rec = { right: h.right, n: h.n, rv: h.rv, qr: h.qr.length };
    out.bonusRev = (bonusQs() || []).some(q => G.rev.has(q));
    return out;
  });
  if (OUT) { await p.evaluate(() => { const s = sets.find(x => x.id === 'c1'); startGame(s, null, 'choice', 6); G.i = G.qs.length - 1; choiceRender(); }); await p.waitForTimeout(300); await p.screenshot({ path: `${OUT}/core_review.png` }); }
  console.log(JSON.stringify(r));
  const ok = r.choice.length === 2 && r.choice.every(i => r.expectChoice.includes(i)) && r.riddle.length === 2 && r.match.length === 0 && r.memory.length === 0 && r.own.length === 0
    && r.mistakeFirst && r.total === r.n0 + r.tail.length && r.tail.length >= 2 && r.tag && r.rec.n === r.n0 && r.rec.right === r.n0 && r.rec.rv && r.rec.rv[1] === r.tail.length && r.rec.qr === r.total && !r.bonusRev;
  if (!ok) errs.push('core review');
  console.log(JSON.stringify({ errs })); await b.close(); process.exit(errs.length ? 1 : 0);
})().catch(e => { console.error('FAIL', e); process.exit(1); });
