// No game-type screen: "▶ לשחק" opens the map, a chapter starts its game right away. The parent can switch game types off
// per practice set (multiple choice always stays); switched-off games never appear, and no memory bonus when it is off.
const { chromium } = require('playwright');
const OUT = process.env.OUT;
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => localStorage.setItem('sff_lang', 'he'));
  await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(1800); await p.evaluate(() => document.getElementById('fbLogin')?.remove());
  const r = await p.evaluate(async () => {
    const s = await loadShare('en4-nov26'); s.id = 't1'; s.questions = s.qs; kids.push({ id: 'k1', name: 'עדי', grade: 3, color: '#FF5C8A' }); s.kidId = 'k1'; sets.push(s);
    const vis = id => !document.getElementById(id).classList.contains('hidden');
    curSet = s; renderReview(s); show('vReview');
    openModes(s); const afterPlay = { road: vis('vRoad'), modes: vis('vModes') };
    openModes(s, 0); const afterCh = { game: vis('vGame'), modes: vis('vModes'), mode: G.mode };
    const C = getChapters(s), before = C.map((_, i) => pickMode(s, i));
    curSet = s; renderReview(s); show('vReview');
    return { afterPlay, afterCh, before, boxes: document.querySelectorAll('#rGames .pick').length };
  });
  await p.evaluate(() => document.getElementById('rGames').open = true);
  if (OUT) await p.screenshot({ path: `${OUT}/games.png`, fullPage: true });
  await p.click('#rGames .pick >> nth=1'); await p.click('#rGames .pick >> nth=2'); await p.click('#rGames .pick >> nth=3'); await p.waitForTimeout(200);
  const r2 = await p.evaluate(() => { const s = curSet, C = getChapters(s); const after = C.map((_, i) => pickMode(s, i));
    startGame(s, null, 'choice', 0); G.res = G.qs.map(q => ({ q, ok: true })); endGame();
    return { noGames: s.noGames, after, bonus: !document.getElementById('eBonus').classList.contains('hidden') }; });
  console.log(JSON.stringify({ r, r2 }));
  const ok = r.afterPlay.road && !r.afterPlay.modes && r.afterCh.game && !r.afterCh.modes && r.boxes === 4 && r.before.some(m => m !== 'choice')
    && r2.after.every(m => m === 'choice') && !r2.bonus && r2.noGames.length === 3;
  if (!ok) errs.push('games');
  console.log(JSON.stringify({ errs })); await b.close(); process.exit(errs.length ? 1 : 0);
})().catch(e => { console.error('FAIL', e); process.exit(1); });
