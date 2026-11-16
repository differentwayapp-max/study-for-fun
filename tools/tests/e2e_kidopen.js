// Parent with two kids: go to the second kid, tap one of its practice sets → that set opens (not the first kid's),
// and closing it returns to the second kid.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await ctx.addInitScript(() => { window.SFF_REST_EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' };
    window.SFF_TEST_GOOGLE = { sub: 'ko1', email: 'ko@t.local', email_verified: true, name: 'טליה' }; localStorage.setItem('sff_lang', 'he'); });
  const boot = async () => { await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(2500); if (await p.$('#fbGo')) await p.click('#fbGo');
    await p.waitForFunction(() => window.SFF_ROLE, null, { timeout: 20000 }); await p.waitForTimeout(2000); };
  await boot();
  await p.evaluate(async () => { kids.push({ id: 'k1', name: 'עדי', grade: 3, color: '#FF5C8A' }, { id: 'k2', name: 'בן', grade: 6, color: '#2F6BFF' }); saveKids();
    applyImport(await loadShare('en4-nov26'), kidById('k1')); await new Promise(r => setTimeout(r, 20));
    applyImport(await loadShare('sci7-materials'), kidById('k2')); await new Promise(r => setTimeout(r, 20));
    applyImport(await loadShare('math7-nov26'), kidById('k2')); go('kids'); });
  await p.waitForTimeout(2500);
  await boot();                                   // like opening the app again
  const out = [];
  await p.click('#kidCarDots .cartab >> nth=1'); await p.waitForTimeout(1500);
  for (let round = 0; round < 2; round++) {
    const target = await p.evaluate(() => { const card = document.querySelectorAll('#kidCar .kidhero')[1]; const row = card.querySelectorAll('.prow')[1] || card.querySelector('.prow');
      const r = row.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, t: row.textContent.trim().slice(0, 24), inView: r.x >= 0 && r.right <= innerWidth }; });
    await p.mouse.click(target.x, target.y); await p.waitForTimeout(900);
    const opened = await p.evaluate(() => curSet ? kidById(curSet.kidId)?.name + ' · ' + curSet.subject : null);
    await p.screenshot({ path: (process.env.OUT || '/tmp') + `/kidopen_${round}.png` });
    await p.evaluate(() => closeReview()); await p.waitForTimeout(1200);
    const back = await p.evaluate(() => [...document.querySelectorAll('#kidCar .kidhero')].map(el => [el.querySelector('h2')?.textContent, Math.round(el.getBoundingClientRect().x)]));
    out.push({ target, opened, back });
  }
  // the kid screen opened from the 1st kid's practice ("▶ לשחק") must be that kid's, even after visiting the 2nd kid's screen
  const kidScreen = await p.evaluate(() => { activeKid = 'k2'; go('kid');
    const s1 = sets.find(s => s.kidId === 'k1'); curSet = s1; renderReview(s1); show('vReview'); openModes(s1);
    const a = kidById(activeKid).name; openRoad(s1.id); return { modes: a, road: kidById(activeKid).name }; });
  out.push({ kidScreen }); if (kidScreen.modes !== 'עדי' || kidScreen.road !== 'עדי') errs.push('kid screen follows the set');
  if (out.some(o => o.opened && !o.opened.startsWith('בן'))) errs.push('opened the wrong kid');
  console.log(JSON.stringify(out, null, 1), JSON.stringify({ errs })); await b.close(); process.exit(errs.length ? 1 : 0);
})().catch(e => { console.error('FAIL', e); process.exit(1); });
