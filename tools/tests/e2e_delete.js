// Deleting a practice set from a kid: gone at once, and still gone after a reload (local emulators).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const ctx = await b.newContext({ viewport: { width: 360, height: 720 } }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await ctx.addInitScript(() => { window.SFF_REST_EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' };
    window.SFF_TEST_GOOGLE = { sub: 'del1', email: 'del@t.local', email_verified: true, name: 'טליה' }; localStorage.setItem('sff_lang', 'he'); });
  const boot = async () => { await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(2500); if (await p.$('#fbGo')) await p.click('#fbGo');
    await p.waitForFunction(() => window.SFF_ROLE, null, { timeout: 20000 }); await p.waitForTimeout(2000); };
  await boot();
  await p.evaluate(async () => { kids.push({ id: 'k1', name: 'בן', grade: 6, color: '#2F6BFF' }); saveKids();
    applyImport(await loadShare('math7-nov26'), kidById('k1')); await new Promise(r => setTimeout(r, 20)); applyImport(await loadShare('sci7-materials'), kidById('k1')); go('kids'); });
  await p.waitForTimeout(3000);
  await boot();   // a fresh session: the sets now come from the cloud
  const before = await p.evaluate(() => sets.filter(s => s.kidId === 'k1').map(s => s.subject));
  await p.evaluate(() => { curSet = sets.find(s => s.subject === 'מדעים'); renderReview(curSet); show('vReview'); });
  await p.click('.rhead [aria-label="אפשרויות"]'); await p.waitForTimeout(400);
  const delVisible = await p.isVisible('#rDel');
  if (delVisible) { await p.click('#rDel'); await p.waitForTimeout(500); await p.click('#sureYes').catch(e => errs.push('no confirm button: ' + e.message)); }
  await p.waitForTimeout(3000);
  const after = await p.evaluate(() => sets.filter(s => s.kidId === 'k1').map(s => s.subject));
  await boot();
  const reload = await p.evaluate(() => sets.filter(s => s.kidId === 'k1').map(s => s.subject));
  console.log(JSON.stringify({ role: await p.evaluate(() => window.SFF_ROLE), delVisible, before, after, reload, errs }));
  await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
