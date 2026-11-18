// Parent's practice screen: openable chapters + answer check. SET=<share> LANG=he|en OUT=dir
const { chromium } = require('playwright');
const { SET, OUT } = process.env, LANG = process.env.LANG2 || 'he';
(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const p = await (await b.newContext({ viewport: { width: 360, height: 740 }, deviceScaleFactor: 1 })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(l => { window.SFF_REST_EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' };
    window.SFF_TEST_GOOGLE = { sub: 'rv', email: 'rv@t.local', email_verified: true, name: 'הורה' }; localStorage.setItem('sff_lang', l); }, LANG);
  await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(2500); if (await p.$('#fbGo')) await p.click('#fbGo');
  await p.waitForFunction(() => window.SFF_ROLE, null, { timeout: 20000 }); await p.waitForTimeout(1200);
  await p.evaluate(async s => { kids.push({ id: 'k1', name: 'נועה', grade: 6, color: '#FF5C8A' }); saveKids();
    curSet = applyImport(await loadShare(s), kidById('k1')).set; go('kids'); renderReview(curSet); show('vReview'); }, SET);
  await p.waitForTimeout(900); await p.screenshot({ path: `${OUT}/rv_0.png` });
  await p.click('#chb0 > .chrow'); await p.waitForTimeout(900); await p.screenshot({ path: `${OUT}/rv_1.png` });
  await p.click('#chb0 .rq summary'); await p.waitForTimeout(300); await p.screenshot({ path: `${OUT}/rv_2.png` });
  await p.click('#chb0 .chnav .btn:last-child'); await p.waitForTimeout(900);
  const st = await p.evaluate(() => ({ open: [...document.querySelectorAll('.chbox.open')].map(x => x.id), top: Math.round(document.getElementById('chb1').getBoundingClientRect().top) }));
  await p.screenshot({ path: `${OUT}/rv_3.png` });
  await p.evaluate(() => { const d = document.getElementById('rQA').closest('details'); d.open = true; d.scrollIntoView(); /* the answer check lives in the ⋯ practice menu */ }); await p.waitForTimeout(500);
  await p.screenshot({ path: `${OUT}/rv_4.png` });
  console.log(JSON.stringify({ st, errs })); await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
