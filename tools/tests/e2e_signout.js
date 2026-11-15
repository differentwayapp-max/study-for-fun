// The door button asks before signing out (Cancel keeps you in, Sign out signs out).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.SFF_REST_EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' };
    window.SFF_TEST_GOOGLE = { sub: 'so', email: 'so@t.local', email_verified: true, name: 'הורה' }; localStorage.setItem('sff_lang', 'he'); });
  await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(2500); if (await p.$('#fbGo')) await p.click('#fbGo');
  await p.waitForFunction(() => window.SFF_ROLE, null, { timeout: 20000 }); await p.waitForTimeout(1500);
  await p.click('#fbOut'); await p.waitForTimeout(400); await p.screenshot({ path: process.env.OUT + '/signout.png' });
  const shown = await p.evaluate(() => !document.getElementById('sureDlg').classList.contains('hidden'));
  await p.click('#sureNo'); await p.waitForTimeout(800);
  const stillIn = await p.evaluate(() => !!window.SFF_UID && document.getElementById('sureDlg').classList.contains('hidden'));
  await p.click('#fbOut'); await p.waitForTimeout(300);
  await Promise.all([p.waitForEvent('load'), p.click('#sureYes')]); await p.waitForTimeout(2500);
  const out = await p.evaluate(() => !!document.getElementById('fbGo') && !document.getElementById('fbGo').closest('.hidden'));
  console.log(JSON.stringify({ shown, stillIn, signedOut: out, errs })); await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
