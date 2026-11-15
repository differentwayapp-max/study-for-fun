// Store screenshots on local emulators. Run:
// firebase emulators:exec --only firestore,auth --project study-for-fun-7b03c "node tools/tests/store_shots.js"
const { chromium } = require('playwright');
const OUT = __dirname + '/../../store/raw/';
(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const c = await b.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3 }); const p = await c.newPage();
  p.on('pageerror', e => console.log('pageerror', e.message));
  await p.addInitScript(() => { window.SFF_REST_EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' };
    window.SFF_TEST_GOOGLE = { sub: 'shots', email: 'shots@test.local', email_verified: true, name: 'אמא' }; localStorage.setItem('sff_lang', 'he'); });
  await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(2500);
  if (await p.$('#fbGo')) await p.click('#fbGo');
  await p.waitForFunction(() => window.SFF_ROLE, null, { timeout: 20000 }); await p.waitForTimeout(1500);
  await p.evaluate(async () => {
    kids.push({ id: 'k1', name: 'נועה', grade: 4, color: '#FF5C8A' }); saveKids();
    const pl = await loadShare('en4-nov26'); applyImport(pl, kidById('k1'));
  });
  await p.waitForTimeout(2500);
  await p.evaluate(() => { const s = sets.find(x => !x.demo);
    s.examDate = new Date(Date.now() + 6 * 864e5).toISOString().slice(0, 10); store.save();
    const now = Date.now();
    [[0, 11, 12], [1, 12, 13], [2, 9, 12], [3, 5, 12]].forEach(([ch, r, n], i) => history.unshift({ at: now - (5 - i) * 36e5, kidId: 'k1', kid: 'נועה', subject: s.subject, grade: s.grade, setId: s.id, ch, right: r, n, score: r * 10, mode: 'choice',
      qr: s.questions.map((q, j) => [q, j]).filter(([q]) => q.ch === ch).slice(0, n).map(([q, j], m) => j + '.' + (m < r ? 1 : 0)), topics: {} }));
    saveHistoryLocal(); });
  const shot = async (name, wait = 900) => { await p.waitForTimeout(wait); await p.screenshot({ path: OUT + name + '.png' }); console.log('shot', name); };
  await p.evaluate(() => go('kid')); await shot('1_home');
  await p.evaluate(() => openRoad(sets.find(x => !x.demo).id)); await shot('2_map', 1500);
  const sid = await p.evaluate(() => sets.find(x => !x.demo).id);
  for (const [name, mode, ch] of [['3_choice', 'choice', 4], ['4_memory', 'memory', 8], ['5_spell', 'spell', 9], ['6_match', 'match', 7]]) {
    await p.evaluate(([id, m, ch]) => startGame(getSet(id), null, m, ch), [sid, mode, ch]); await shot(name, 1500);
  }
  await p.evaluate(() => { go('kid'); openMe(); }); await shot('7_me', 1500);
  await p.evaluate(() => go('stats')); await shot('8_parent', 1500);
  await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
