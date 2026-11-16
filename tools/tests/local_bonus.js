// The memory game is a bonus: offered after a station, never a station itself, and not counted in progress.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 360, height: 720 } })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => localStorage.setItem('sff_lang', 'he'));
  await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(2000); await p.evaluate(() => document.getElementById('fbLogin')?.remove());
  const r = await p.evaluate(async () => {
    const s = await loadShare('en4-nov26'); s.id = 't1'; s.questions = s.qs; kids.push({ id: 'k1', name: 'עדי', grade: 3, color: '#FF5C8A' }); s.kidId = 'k1'; sets.push(s);
    const C = getChapters(s), stations = C.map((_, i) => pickMode(s, i));
    const ci = C.findIndex(c => modePool({ questions: c.qs, chapters: s.chapters }, 'memory').length >= 3);
    const h0 = history.length;
    startGame(s, null, 'choice', ci); G.res = G.qs.map(q => ({ q, ok: true })); endGame();
    const bonusShown = !document.getElementById('eBonus').classList.contains('hidden'), h1 = history.length;
    startBonus(); const mode = G.mode; G.res = G.qs.map(q => ({ q, ok: false })); endGame();
    return { stations, noMemoryStation: !stations.includes('memory'), bonusShown, recorded: h1 - h0, afterBonus: history.length - h1, mode, title: document.getElementById('eTitle').textContent };
  });
  console.log(JSON.stringify(r));
  if (!r.noMemoryStation || !r.bonusShown || r.recorded !== 1 || r.afterBonus !== 0 || r.mode !== 'memory') errs.push('bonus');
  console.log(JSON.stringify({ errs })); await b.close(); process.exit(errs.length ? 1 : 0);
})().catch(e => { console.error('FAIL', e); process.exit(1); });
