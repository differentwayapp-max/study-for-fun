// Family switch: one reload, a spinner over the screen (no white logo screen). Local emulators.
const { chromium } = require('playwright');
const S = process.env.OUT;
(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const open = async (who, name, url = 'http://localhost:8765/') => {
    const c = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 }); const p = await c.newPage();
    p.on('pageerror', e => console.log('pageerror', e.message));
    await p.addInitScript(g => { window.SFF_REST_EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' }; window.SFF_TEST_GOOGLE = g; localStorage.setItem('sff_lang', 'he'); },
      { sub: who, email: who + '@t.local', email_verified: true, name });
    await p.goto(url, { waitUntil: 'load' }); await p.waitForTimeout(2500); if (await p.$('#fbGo')) await p.click('#fbGo');
    await p.waitForFunction(() => window.SFF_ROLE, null, { timeout: 20000 }); await p.waitForTimeout(1500); return p;
  };
  const O = await open('owner', 'טליה');
  await O.evaluate(() => { kids.push({ id: 'k1', name: 'בן', grade: 6, color: '#2F6BFF' }); saveKids(); }); await O.waitForTimeout(1500);
  const inv = await O.evaluate(() => window.__sffFamily.invite('admin', 'רן', []));
  const P = await open('dad', 'רן', inv);
  let loads = 0; P.on('load', () => loads++);
  await P.evaluate(() => go('family')); await P.waitForTimeout(800);
  const other = await P.evaluate(() => window.SFF_FAMS.find(f => f.id !== window.__sffFamily.famId).id);
  await P.evaluate(id => window.__sffFamily.switchTo(id), other);
  await P.waitForTimeout(60); await P.screenshot({ path: S + '/sw_0.png' });
  for (let i = 1; i <= 4; i++) { await P.waitForTimeout(600); await P.screenshot({ path: S + `/sw_${i}.png` }); }
  await P.waitForTimeout(4000);
  console.log({ loads, fam: await P.evaluate(() => window.__sffFamily.famId), own: await P.evaluate(() => window.SFF_UID),
    spinnerGone: await P.evaluate(() => !document.documentElement.classList.contains('soft')), splashShown: await P.evaluate(() => !!document.getElementById('splash') && getComputedStyle(document.getElementById('splash')).display !== 'none') });
  await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
