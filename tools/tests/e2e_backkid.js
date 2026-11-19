// Leaving a practice set returns to the kid it belongs to (not another kid's card).
const { chromium } = require('playwright'); const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) process.exitCode = 1; };
(async () => { const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const p = await (await b.newContext({ viewport: { width: 360, height: 760 } })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.SFF_REST_EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' }; window.SFF_TEST_GOOGLE = { sub: 'bk', email: 'bk@t.local', email_verified: true, name: 'טליה' }; localStorage.setItem('sff_lang', 'he'); });
  await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(2500); if (await p.$('#fbGo')) await p.click('#fbGo');
  await p.waitForFunction(() => window.SFF_ROLE, null, { timeout: 20000 }); await p.waitForTimeout(1000);
  await p.evaluate(async () => { kids.push({ id: 'k1', name: 'בן', grade: 6, color: '#2F6BFF' }, { id: 'k2', name: 'עדי', grade: 3, color: '#FF5C8A' }, { id: 'k3', name: 'אימוש', grade: 1, color: '#9B8CFF' }); saveKids();
    applyImport(await loadShare('en7-nov26'), kidById('k1')); await new Promise(r => setTimeout(r, 20)); applyImport(await loadShare('en4-nov26'), kidById('k2')); go('kids'); });
  await p.waitForTimeout(1200);
  const who = () => p.evaluate(() => visibleKids()[carIndex('kidCar')]?.name);
  for (const [via, start] of [['tab', 1], ['row', 1], ['tab', 0]]) {
    await p.evaluate(i => carGo('kidCar', i), start); await p.waitForTimeout(700); const before = await who();
    await p.evaluate(() => { const card = document.querySelectorAll('#kidCar .slide')[carIndex('kidCar')]; card.querySelector('.prow')?.click(); }); await p.waitForTimeout(900);
    const inSet = await p.evaluate(() => curSet && kidById(curSet.kidId)?.name);
    await p.click('#topBack'); await p.waitForTimeout(900); const after = await who();
    ok(after === before && inSet === before, `opened ${inSet}'s practice from ${before}'s card → back on ${after}'s card`);
  }
  // after an edit (saved to the cloud) – the case that was reported
  await p.evaluate(() => carGo('kidCar', 1)); await p.waitForTimeout(700);
  await p.evaluate(() => { document.querySelectorAll('#kidCar .slide')[1].querySelector('.prow').click(); }); await p.waitForTimeout(800);
  await p.evaluate(() => toggleEdit(true)); await p.evaluate(() => { REV_OPEN[curSet.id] = 0; renderReview(curSet); });
  const del = p.evaluate(() => delChapter(0)); await p.waitForTimeout(300); await p.click('#sureYes'); await del; await p.waitForTimeout(3500);
  const view1 = await p.evaluate(() => ({ review: !document.getElementById('vReview').classList.contains('hidden'), kid: kidById(curSet.kidId)?.name }));
  await p.click('#topBack'); await p.waitForTimeout(2500);
  const view2 = await p.evaluate(() => ({ kids: !document.getElementById('vKids').classList.contains('hidden'), review: !document.getElementById('vReview').classList.contains('hidden'), card: visibleKids()[carIndex('kidCar')]?.name, cur: curSet && kidById(curSet.kidId)?.name }));
  ok(view1.review && view1.kid === 'עדי', 'edited עדי\'s practice (still on it after the cloud save)');
  ok(view2.kids && !view2.review && view2.card === 'עדי', `after editing → exit → ${view2.kids ? 'kids screen' : 'NOT kids screen'}, card: ${view2.card}`);
  // a cloud sync redraws the kids screen while it is hidden (that used to jump to the first kid)
  await p.evaluate(() => carGo('kidCar', 1)); await p.waitForTimeout(700);
  await p.evaluate(() => { document.querySelectorAll('#kidCar .slide')[1].querySelector('.prow').click(); }); await p.waitForTimeout(600);
  await p.evaluate(() => renderKids()); await p.waitForTimeout(300); await p.click('#topBack'); await p.waitForTimeout(900);
  ok(await who() === 'עדי', 'redrawn while hidden → still back on עדי\'s card');
  console.log(JSON.stringify({ view1, view2, errs })); await b.close(); })().catch(e => { console.error('FAIL', e); process.exit(1); });
