// Side menu, ⋯ practice menu and carousels (local emulators). OUT=dir
const { chromium } = require('playwright');
const OUT = process.env.OUT;
(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const p = await (await b.newContext({ viewport: { width: 360, height: 720 }, deviceScaleFactor: 2 })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.SFF_REST_EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' };
    window.SFF_TEST_GOOGLE = { sub: 'mn', email: 'mom@t.local', email_verified: true, name: 'טליה' }; localStorage.setItem('sff_lang', 'he'); });
  await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(2500); if (await p.$('#fbGo')) await p.click('#fbGo');
  await p.waitForFunction(() => window.SFF_ROLE, null, { timeout: 20000 }); await p.waitForTimeout(1200);
  await p.evaluate(async () => { kids.push({ id: 'k1', name: 'בן', grade: 6, color: '#2F6BFF' }, { id: 'k2', name: 'עדי', grade: 3, color: '#FF5C8A' }); saveKids();
    applyImport(await loadShare('en7-nov26'), kidById('k1')); await new Promise(r => setTimeout(r, 20)); applyImport(await loadShare('math7-nov26'), kidById('k1')); await new Promise(r => setTimeout(r, 20));
    applyImport(await loadShare('en4-nov26'), kidById('k2')); go('kids'); });
  await p.waitForTimeout(1500);
  const shot = async n => { await p.waitForTimeout(600); await p.screenshot({ path: `${OUT}/mn_${n}.png` }); };
  await shot(0);
  await p.click('#menuBtn'); await shot(1); await p.evaluate(() => closeMenu());
  await p.evaluate(() => { curSet = sets.find(s => s.subject === 'מתמטיקה'); renderReview(curSet); show('vReview'); }); await shot(2);
  await p.click('.rhead [aria-label="אפשרויות"]'); await shot(3); await p.evaluate(() => closeMore());
  await p.evaluate(() => { activeKid = 'k1'; go('kid'); }); await shot(4);
  console.log(JSON.stringify({ errs })); await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
