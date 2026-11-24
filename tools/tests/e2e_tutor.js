// A tutor's app with the tutor-scoped rules, on the emulators (functions, firestore, auth – the build uses the fake AI):
// 1. the tutor of Ben sees Ben only (kids, practice sets, progress) – a phone that kept the whole family from before
//    drops the rest; the app never asks for anything the rules refuse (no permission errors);
// 2. the tutor builds a practice set for Ben (fake AI) – it reaches the parent;
// 3. a tutor invited before the tutor view existed: a clear message, until the parent opens the app once;
// 4. the parent removes the tutor → the tutor's view goes too. OUT=dir for screenshots (Hebrew + English).
const { chromium } = require('playwright');
const APP = 'http://localhost:8765/', OUT = process.env.OUT || require('os').tmpdir();
const FS = 'http://127.0.0.1:8080', PROJ = 'study-for-fun-7b03c', DOCS = `${FS}/v1/projects/${PROJ}/databases/(default)/documents`;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) process.exitCode = 1; };
const enc = x => typeof x === 'string' ? { stringValue: x } : typeof x === 'number' ? { integerValue: String(x) } : Array.isArray(x) ? { arrayValue: { values: x.map(enc) } } : typeof x === 'boolean' ? { booleanValue: x } : { mapValue: { fields: Object.fromEntries(Object.entries(x).map(([k, v]) => [k, enc(v)])) } };
const put = (path, obj) => fetch(`${DOCS}/${path}`, { method: 'PATCH', headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: enc(obj).mapValue.fields }) });
const exists = path => fetch(`${DOCS}/${path}`, { headers: { Authorization: 'Bearer owner' } }).then(r => r.ok);
(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const errs = [], denied = [];
  const open = async (who, url = APP, lang = 'he', seed) => {
    const c = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); const p = await c.newPage();
    p.on('pageerror', e => errs.push(who + ': ' + e.message));
    p.on('console', m => { const t = m.text(); if (/permission|insufficient/i.test(t)) denied.push(who + ': ' + t.slice(0, 160)); });
    await p.addInitScript(([g, l, sd]) => { window.SFF_REST_EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' }; window.SFF_TEST_GOOGLE = g; window.SFF_FAKE_AI = true; window.SFF_AI_ENABLED = true;
      localStorage.setItem('sff_lang', l); if (sd && !sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); for (const [k, v] of Object.entries(sd)) localStorage.setItem(k, v); } },
      [{ sub: who, email: who + '@test.local', email_verified: true, name: { owner: 'טליה', tutor: 'דנה המורה', old: 'מורה ותיק' }[who] || who }, lang, seed || null]);
    await p.goto(url, { waitUntil: 'load' }); await p.waitForTimeout(2500);
    if (await p.$('#fbGo')) await p.click('#fbGo');
    await p.waitForFunction(() => window.SFF_ROLE, null, { timeout: 20000 }); await p.waitForTimeout(2500);
    await p.evaluate(() => document.getElementById('intro')?.remove());
    return { c, p };
  };

  console.log('1. the parent: Noa and Ben, a practice set each; a tutor for Ben');
  const O = await open('owner');
  await O.p.evaluate(async () => {
    kids.push({ id: 'k1', name: 'נועה', grade: 6, color: '#FF5C8A' }, { id: 'k2', name: 'בן', grade: 6, color: '#2F6BFF' }); saveKids();
    applyImport(await loadShare('en7-nov26'), kidById('k1')); applyImport(await loadShare('en7-nov26'), kidById('k2'));
  });
  await O.p.waitForTimeout(3000);
  const fam = await O.p.evaluate(() => window.__sffFamily.famId);
  const inv = await O.p.evaluate(() => window.__sffFamily.invite('tutor', 'דנה', ['k2']));
  const code = inv.split('.').pop();
  ok(await exists(`families/${fam}/tutorView/${code}`), 'the invitation comes with the tutor\'s view');

  console.log('2. the tutor (a phone that kept the whole family from an older version)');
  const old = await O.p.evaluate(() => ({ sff_kids: localStorage.getItem('sff_kids'), sff_sets: localStorage.getItem('sff_sets'), sff_history: localStorage.getItem('sff_history') }));
  const T = await open('tutor', inv);
  await T.p.evaluate(() => { window.__sffFamily.switchTo(window.__sffFamily.famId); });   // keeps the active family; reload below brings the old cache in
  await T.p.waitForTimeout(500);
  await T.p.evaluate(o => { for (const [k, v] of Object.entries(o)) if (v) localStorage.setItem(k, v); localStorage.setItem('sff_data_fam', localStorage.getItem('sff_active_teach') || localStorage.getItem('sff_active_fam')); }, old);   // the invitation opened the teachers' app
  await T.p.reload({ waitUntil: 'load' }); await T.p.waitForFunction(() => window.SFF_ROLE, null, { timeout: 20000 }); await T.p.waitForTimeout(4000);
  const st = await T.p.evaluate(() => ({ role: window.SFF_ROLE, kids: kids.map(k => k.name).join(), sets: sets.filter(s => !s.demo).map(s => s.kidId).join(), hist: history.filter(h => h.kidId !== 'k2').length, wait: !!window.SFF_TUTOR_WAIT }));
  ok(st.role === 'tutor' && st.kids === 'בן' && st.sets === 'k2' && !st.hist && !st.wait, 'sees Ben only – his kids, sets and progress: ' + JSON.stringify(st));
  await T.p.evaluate(() => go('kids')); await T.p.waitForTimeout(600); await T.p.screenshot({ path: `${OUT}/tutor_home_he.png` });
  await T.p.evaluate(() => { curSet = sets.find(s => !s.demo); renderReview(curSet); show('vReview'); }); await T.p.waitForTimeout(600); await T.p.screenshot({ path: `${OUT}/tutor_set_he.png` });
  await T.p.evaluate(() => go('stats')); await T.p.waitForTimeout(800); await T.p.screenshot({ path: `${OUT}/tutor_stats_he.png` });
  await T.p.evaluate(() => go('family')); await T.p.waitForTimeout(800); await T.p.screenshot({ path: `${OUT}/tutor_family_he.png` });
  ok(await T.p.evaluate(() => !/לשלוח ל/.test(document.getElementById('vFamily').innerText)), 'no "send the link" on the family screen for a tutor');
  await T.p.evaluate(() => openKidLink('k2')); await T.p.waitForTimeout(800);
  ok(await T.p.evaluate(() => !document.getElementById('klUrl').value && document.getElementById('klNew').classList.contains('hidden')), 'no kid link and no "new link" for a tutor');
  await T.p.evaluate(() => document.getElementById('linkDlg').classList.add('hidden'));

  console.log('3. the tutor builds a practice set for Ben (fake AI)');
  await T.p.evaluate(() => { openWizard('k2'); W.subject = 'אנגלית'; $('fTopics').value = 'Colors\nAnimals'; W.step = 4; wizRender(); build(); });
  await T.p.waitForFunction(() => sets.filter(s => s.kidId === 'k2' && !s.src).length >= 1, null, { timeout: 120000 }); await T.p.waitForTimeout(3000);
  const built = await T.p.evaluate(() => sets.find(s => s.kidId === 'k2' && !s.src).id);
  await O.p.reload({ waitUntil: 'load' }); await O.p.waitForFunction(() => window.SFF_ROLE, null, { timeout: 20000 }); await O.p.waitForTimeout(3000);
  ok(await O.p.evaluate(id => !!getSet(id), built), 'the tutor\'s new practice set reached the parent');

  console.log('4. English');
  const TE = await open('tutor', APP, 'en', { sff_active_fam: fam });
  ok(await TE.p.evaluate(() => window.SFF_ROLE === 'tutor' && kids.map(k => k.name).join() === 'בן'), 'English: the tutor view');
  await TE.p.evaluate(() => go('kids')); await TE.p.waitForTimeout(800); await TE.p.screenshot({ path: `${OUT}/tutor_home_en.png` });
  await TE.p.evaluate(() => go('stats')); await TE.p.waitForTimeout(800); await TE.p.screenshot({ path: `${OUT}/tutor_stats_en.png` });
  await TE.c.close();

  console.log('5. a tutor invited before the tutor view existed');
  const X = await open('old');
  const xuid = await X.p.evaluate(() => window.SFF_UID);
  await put(`families/${fam}/members/${xuid}`, { role: 'tutor', name: 'מורה ותיק', kids: ['k1'], invite: 'OLDCODE', at: Date.now() });
  await put(`users/${xuid}`, { fams: [fam] });
  await X.p.evaluate(f => window.__sffFamily.switchTo(f), fam); await X.p.waitForFunction(() => window.SFF_ROLE === 'tutor', null, { timeout: 20000 }); await X.p.waitForTimeout(3000);
  const msg = await X.p.evaluate(() => document.getElementById('kidCar').innerText);
  ok(/ההורה צריך\/ה לפתוח את האפליקציה פעם אחת/.test(msg) && await X.p.evaluate(() => !kids.length), 'a clear message, no kids, no broken screen');
  await X.p.screenshot({ path: `${OUT}/tutor_wait_he.png` });
  await O.p.reload({ waitUntil: 'load' }); await O.p.waitForFunction(() => window.SFF_ROLE, null, { timeout: 20000 }); await O.p.waitForTimeout(5000);
  ok(await exists(`families/${fam}/tutorView/OLDCODE`), 'the parent opens the app → the tutor\'s view is made');
  await X.p.waitForTimeout(1500);
  ok(await X.p.evaluate(() => kids.map(k => k.name).join()) === 'נועה', 'the old tutor now sees Noa (no reload needed)');

  console.log('6. the parent removes the tutor');
  const tuid = await T.p.evaluate(() => window.SFF_UID);
  await O.p.evaluate(u => window.__sffFamily.remove(u), tuid); await O.p.waitForTimeout(1000);
  ok(!(await exists(`families/${fam}/tutorView/${code}`)), 'the tutor\'s view is removed with the tutor');

  ok(!denied.length, 'the app never asked for something the rules refuse ' + JSON.stringify(denied.slice(0, 4)));
  ok(!errs.length, 'no page errors ' + JSON.stringify(errs));
  await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
