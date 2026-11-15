// Store screenshots v2 (all core subjects, feedback, family, test-day map). Local emulators only.
// firebase emulators:exec --only firestore,auth --project study-for-fun-7b03c "node tools/tests/store_shots2.js"
const { chromium } = require('playwright');
const OUT = __dirname + '/../../store/raw/';
const EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' };
// screenshot-only sample sets (not published)
const q = (topic, question, options, answer, explanation, sc, ch) => ({ topic, question, options, answer, explanation, emoji: sc[0][0],
  scene: sc.map(([e, x, y, s]) => ({ e, x, y, s })), ch });
const SAMPLES = [
  { src: 'shot-heb', subject: 'עברית / לשון', grade: 3, topics: ['חלקי דיבר'], chapters: [{ title: 'שם עצם ופועל', topics: ['חלקי דיבר'], count: 2 }],
    qs: [q('חלקי דיבר', 'איזו מילה היא פועל?', ['רץ', 'שולחן', 'יפה', 'כחול'], 0, 'רץ = פעולה, לכן פועל', [['🏃', 50, 52, 56]], 0),
         q('חלקי דיבר', 'איזו מילה היא שם עצם?', ['כלב', 'קופץ', 'גדול', 'מהר'], 0, 'כלב = שם של דבר', [['🐕', 50, 52, 56]], 0)] },
  { src: 'shot-sci', subject: 'מדעים', grade: 3, topics: ['מצבי צבירה'], chapters: [{ title: 'מצבי צבירה', topics: ['מצבי צבירה'], count: 2 }],
    qs: [q('מצבי צבירה', 'קרח הוא מים במצב…', ['מוצק', 'נוזל', 'גז', 'חם'], 0, 'קרח קשה ושומר על צורה = מוצק', [['🧊', 50, 52, 56]], 0),
         q('מצבי צבירה', 'מה קורה לקרח בשמש?', ['נמס', 'קופא', 'גדל', 'נעלם'], 0, 'חום הופך מוצק לנוזל', [['🧊', 40, 60, 40], ['☀️', 72, 26, 34]], 0)] },
];
(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const open = async (who, name, url = 'http://localhost:8765/') => {
    const c = await b.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3 }); const p = await c.newPage();
    p.on('pageerror', e => console.log('pageerror', who, e.message));
    await p.addInitScript(([g, emu]) => { window.SFF_REST_EMU = emu; window.SFF_TEST_GOOGLE = g; localStorage.setItem('sff_lang', 'he'); },
      [{ sub: who, email: who + '@test.local', email_verified: true, name }, EMU]);
    await p.goto(url, { waitUntil: 'load' }); await p.waitForTimeout(2500);
    if (await p.$('#fbGo')) await p.click('#fbGo');
    await p.waitForFunction(() => window.SFF_ROLE, null, { timeout: 20000 }); await p.waitForTimeout(1500);
    return p;
  };
  const p = await open('mom', 'אמא של נועה');
  await p.evaluate(async (S) => {
    kids.push({ id: 'k1', name: 'נועה', grade: 6, color: '#FF5C8A' }, { id: 'k2', name: 'איתי', grade: 2, color: '#2F6BFF' }); saveKids();
    for (const x of S) { applyImport({ ...x, examDate: '', dailyGoal: 2 }, kidById('k1')); await new Promise(r => setTimeout(r, 20)); }   // ids are time-based
    applyImport(await loadShare('en4-nov26'), kidById('k1')); await new Promise(r => setTimeout(r, 20));
    applyImport(await loadShare('math7-nov26'), kidById('k1'));
  }, SAMPLES);
  await p.waitForTimeout(2500);
  await p.evaluate(() => { const s = sets.find(x => x.subject === 'מתמטיקה' && !x.demo);
    s.examDate = new Date(Date.now() + 6 * 864e5).toISOString().slice(0, 10); store.save();
    const now = Date.now();
    [[0, 11, 12], [1, 12, 13], [2, 9, 12], [3, 5, 12]].forEach(([ch, r, n], i) => history.unshift({ at: now - (5 - i) * 36e5, kidId: 'k1', kid: 'נועה', subject: s.subject, grade: s.grade, setId: s.id, ch, right: r, n, score: r * 10, mode: 'choice',
      qr: s.questions.map((q, j) => [q, j]).filter(([q]) => q.ch === ch).slice(0, n).map(([q, j], m) => j + '.' + (m < r ? 1 : 0)), topics: {} }));
    saveHistoryLocal(); });
  // family: grandma joins, tutor invited (pending)
  const inv = await p.evaluate(() => window.__sffFamily.invite('helper', 'סבתא רותי', []));
  await p.evaluate(() => window.__sffFamily.invite('tutor', 'דנה המורה', ['k1']));
  const g = await open('grandma', 'סבתא רותי', inv); await g.context().close();
  const shot = async (name, wait = 1200) => { await p.waitForTimeout(wait); await p.screenshot({ path: OUT + name + '.png' }); console.log('shot', name); };
  const sid = sub => p.evaluate(s => sets.find(x => x.subject === s && !x.demo).id, sub);
  for (const [name, sub] of [['s_math', 'מתמטיקה'], ['s_heb', 'עברית / לשון'], ['s_sci', 'מדעים'], ['s_eng', 'אנגלית']]) {
    const id = await sid(sub);
    await p.evaluate(([id, ch]) => { go('kid'); startGame(getSet(id), null, 'choice', ch); }, [id, sub === 'אנגלית' ? 4 : 0]); await shot(name);
  }
  await p.evaluate(() => go('kid')); await shot('s_home');
  await p.evaluate(id => openRoad(id), await sid('מתמטיקה')); await shot('s_map', 1500);
  await p.evaluate(() => { go('kid'); activeKid = 'k1'; openMe(); }); await shot('s_me', 1500);
  await p.evaluate(() => go('stats')); await shot('s_parent', 1500);
  await p.reload({ waitUntil: 'load' }); await p.waitForFunction(() => window.SFF_ROLE); await p.waitForTimeout(2500);
  await p.evaluate(() => go('family')); await shot('s_family', 2500);
  await p.evaluate(() => { go('kids'); openAddDialog('math7-nov26', 'k1'); }); await shot('s_add', 2000);
  await p.evaluate(() => { document.querySelectorAll('dialog[open]').forEach(d => d.close()); openCatalog('k1'); }); await shot('s_catalog', 2500);
  await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
