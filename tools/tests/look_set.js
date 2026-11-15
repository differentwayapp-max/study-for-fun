// Look at a practice set in the app (local emulators). SET=<share name> CH=0,3,5 node ...
const { chromium } = require('playwright');
const SET = process.env.SET, CHS = (process.env.CH || '0').split(',').map(Number), OUT = process.env.OUT;
(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const c = await b.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 1 }); const p = await c.newPage();
  p.on('pageerror', e => console.log('pageerror', e.message));
  await p.addInitScript(() => { window.SFF_REST_EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' };
    window.SFF_TEST_GOOGLE = { sub: 'look', email: 'look@test.local', email_verified: true, name: 'בדיקה' }; localStorage.setItem('sff_lang', 'he'); });
  await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(2500);
  if (await p.$('#fbGo')) await p.click('#fbGo');
  await p.waitForFunction(() => window.SFF_ROLE, null, { timeout: 20000 }); await p.waitForTimeout(1200);
  const id = await p.evaluate(async s => { kids.push({ id: 'k1', name: 'נועה', grade: 6, color: '#FF5C8A' }); saveKids();
    const r = applyImport(await loadShare(s), kidById('k1')); return r.set.id; }, SET);
  let n = 0;
  for (const ch of CHS) for (const mode of (process.env.MODES || 'choice').split(',')) {
    await p.evaluate(([id, ch, m]) => { go('kid'); startGame(getSet(id), null, m, ch); }, [id, ch, mode]); await p.waitForTimeout(900);
    await p.screenshot({ path: `${OUT}/look_${n++}.png` });
  }
  await p.evaluate(id => { go('kid'); openRoad(id); }, id); await p.waitForTimeout(1200); await p.screenshot({ path: `${OUT}/look_${n++}.png` });
  await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
