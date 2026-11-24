// The teacher area, stage 1 – signing in as a teacher and groups, on the emulators (functions, firestore, auth):
// 1. "I'm a teacher" → class teacher / private tutor → a group (made by the server: a random 20-character id, kind 'class',
//    ownerUid); no empty family for a teacher; the teacher's home ("no students yet" + invite students); no parents' intro;
// 2. a second group from ☰; a reload stays in the group; switching groups from ☰;
// 3. a teacher who is also a parent: the family app shows no classes – "to the teachers' app" or "open a family" (the owner's decision, 26.11);
// 4. a parent with a family who signs in to the teachers' app: a first group – the family is not touched (kids, sets), and the family app still opens it;
// 5. English. OUT=dir for screenshots.
const { chromium } = require('playwright');
const APP = 'http://localhost:8765/', OUT = process.env.OUT || require('os').tmpdir();
const DOCS = 'http://127.0.0.1:8080/v1/projects/study-for-fun-7b03c/databases/(default)/documents';
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) process.exitCode = 1; };
const doc = path => fetch(`${DOCS}/${path}`, { headers: { Authorization: 'Bearer owner' } }).then(r => r.ok ? r.json() : null);
(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const errs = [];
  const ctx = async (who, lang = 'he') => { const c = await b.newContext({ viewport: { width: 390, height: 844 } });
    await c.addInitScript(([g, l]) => { window.SFF_REST_EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' }; window.SFF_TEST_GOOGLE = g; localStorage.setItem('sff_lang', l); },
      [{ sub: who, email: who + '@t.local', email_verified: true, name: who === 'mom' ? 'אמא' : 'מורה' }, lang]); return c; };
  const page = async (c, url = APP + 'teach') => { const p = await c.newPage(); p.on('pageerror', e => errs.push(e.message)); await p.goto(url, { waitUntil: 'load' }); return p; };
  const ready = p => p.waitForFunction(() => window.SFF_ROLE, null, { timeout: 25000 }).then(() => p.waitForTimeout(1500));
  const setup = async (p, kind, name, shot) => {
    await p.waitForSelector('#fbLogin.tsetup #tsClass', { timeout: 20000 }); if (shot) await p.screenshot({ path: `${OUT}/${shot}_choose.png` });
    await p.click(kind === 'class' ? '#tsClass' : '#tsPriv'); await p.fill('#tsName', name); await p.selectOption('#tsSubj', { index: 1 });
    if (shot) await p.screenshot({ path: `${OUT}/${shot}_form.png` }); await p.click('#tsGo'); };

  console.log('1. a new teacher');
  const c1 = await ctx('teacher1'), p1 = await page(c1);
  await p1.waitForSelector('#fbGo', { timeout: 15000 }); await p1.screenshot({ path: `${OUT}/t_login_he.png` });
  await p1.click('#fbGo');
  await setup(p1, 'class', "ד'2 – חשבון", 't_setup_he');
  await ready(p1);
  const s1 = await p1.evaluate(() => ({ kind: window.SFF_KIND, fam: window.__sffFamily.famId, uid: window.SFF_UID, role: window.SFF_ROLE, home: document.getElementById('kidCar').innerText, intro: !!document.getElementById('intro') }));
  ok(s1.kind === 'class' && /^[A-Za-z0-9]{20}$/.test(s1.fam) && s1.role === 'owner', 'a group with a random 20-character id: ' + s1.fam);
  const cd = await doc(`families/${s1.fam}`);
  ok(cd && cd.fields.kind.stringValue === 'class' && cd.fields.ownerUid.stringValue === s1.uid && cd.fields.teach.stringValue === 'class', 'the group document: kind class, ownerUid = the teacher');
  ok(!(await doc(`families/${s1.uid}`)), 'no empty family for a teacher');
  const ud = await doc(`users/${s1.uid}`);
  ok(ud && (ud.fields.roles.arrayValue.values || []).some(v => v.stringValue === 'teacher') && (ud.fields.classes.arrayValue.values || []).length === 1, 'the account: roles teacher, classes [1]');
  ok(/פתחת את הקבוצה/.test(s1.home) && /מזמינים את ההורים/.test(s1.home) && !s1.intro, "the teacher's home (a new group): the 3 steps – opened, invite the parents; no parents' intro");
  await p1.screenshot({ path: `${OUT}/t_home_he.png` });

  console.log('2. a second group, reload, switching');
  // the private world added (the owner's decision, 25.11: a new group knows its world – no "which kind?")
  await p1.evaluate(() => { newClass('private'); }); await p1.waitForSelector('#tsName', { timeout: 20000 });
  ok(!(await p1.$('#tsClass')), 'a new private group: straight to its form'); await p1.fill('#tsName', 'התלמידים שלי'); await p1.selectOption('#tsSubj', { index: 1 }); await p1.click('#tsGo');
  await p1.waitForFunction(() => window.SFF_ROLE && window.SFF_CLASS && window.SFF_CLASS.teach === 'private', null, { timeout: 25000 }); await p1.waitForTimeout(1500);
  const s2 = await p1.evaluate(() => ({ fam: window.__sffFamily.famId, n: (window.SFF_FAMS || []).length, name: window.SFF_CLASS.name }));
  ok(s2.fam !== s1.fam && s2.n === 2 && s2.name === 'התלמידים שלי', 'a second group (private), now active; 2 groups');
  await p1.reload({ waitUntil: 'load' }); await ready(p1);
  ok(await p1.evaluate(() => window.__sffFamily.famId) === s2.fam, 'a reload stays in the same group');
  await p1.evaluate(() => openMenu()); await p1.waitForTimeout(400); await p1.screenshot({ path: `${OUT}/t_menu_he.png` });
  await p1.click(`#dFams .ditem:not(.on)`); await p1.waitForFunction(f => window.__sffFamily && window.__sffFamily.famId === f && window.SFF_ROLE, s1.fam, { timeout: 25000 });
  ok(true, 'switching groups from ☰');

  console.log('3. a teacher who is also a parent');
  const pf = await page(c1, APP); await pf.waitForSelector('#fcTeach', { timeout: 25000 });
  ok(await pf.evaluate(() => !!document.getElementById('fcFam') && !window.SFF_ROLE), 'the family app, for a teacher with no family: "to the teachers\' app" or "open a family" – no classes in it');
  await pf.screenshot({ path: `${OUT}/t_famchoice_he.png` });
  await pf.click('#fcFam'); await pf.waitForFunction(() => window.SFF_KIND === 'family' && window.SFF_ROLE, null, { timeout: 25000 }); await pf.waitForTimeout(1500);
  ok(await pf.evaluate(() => window.__sffFamily.famId === window.SFF_UID && window.SFF_FAMS.length === 1 && window.SFF_APP === 'family'), '"open a family": made and opened – the only place in the family app');
  await pf.evaluate(() => openMenu()); await pf.waitForTimeout(300);
  ok(await pf.evaluate(() => document.getElementById('dFams').classList.contains('hidden') && document.getElementById('dOtherApp')?.getAttribute('href') === '/teach'), 'its ☰: no classes – "to the teachers\' app" under the account');
  await pf.close();
  const pt = await page(c1); await pt.waitForFunction(() => window.SFF_ROLE, null, { timeout: 25000 });
  ok(await pt.evaluate(() => window.SFF_FAMS.length === 2 && window.SFF_FAMS.every(f => f.kind === 'class')), 'the teachers\' app: still the two groups (the family not among them)');
  await pt.close();
  const pl = await page(await ctx('someone'), APP); await pl.waitForSelector('#fbTeach', { timeout: 15000 }); await pl.click('#fbTeach');
  await pl.waitForURL(/\/teach$/, { timeout: 10000 }).catch(() => {});
  ok(/\/teach$/.test(pl.url()), 'the family app\'s "I\'m a teacher": to the teachers\' app (' + pl.url().replace(APP, '/') + ')');

  console.log('4. a parent with a family signs in as a teacher');
  const cm = await ctx('mom'), pm = await page(cm, APP);
  await pm.click('#fbGo'); await ready(pm);
  await pm.evaluate(async () => { kids.push({ id: 'k1', name: 'נועה', grade: 3, color: '#FF5C8A' }); saveKids(); applyImport(await loadShare('en4'), kidById('k1')); });
  await pm.waitForTimeout(3000);
  const momUid = await pm.evaluate(() => window.SFF_UID);
  const before = await doc(`families/${momUid}/fam/kids`);
  const cm2 = await ctx('mom'), pm2 = await page(cm2);       // another phone: the sign-in screen again – "I'm a teacher"
  await pm2.waitForSelector('#fbGo', { timeout: 15000 }); await pm2.click('#fbGo'); await setup(pm2, 'class', "ה'1 – אנגלית"); await ready(pm2);
  ok(await pm2.evaluate(() => window.SFF_KIND === 'class' && window.SFF_FAMS.length === 1), 'the teachers\' app: a first group (the family stays in the family app)');
  const after = await doc(`families/${momUid}/fam/kids`);
  ok(JSON.stringify(before) === JSON.stringify(after), "the family's kids did not change");
  const pm3 = await page(cm2, APP);
  await pm3.waitForFunction(() => window.SFF_KIND === 'family' && window.SFF_ROLE, null, { timeout: 25000 }); await pm3.waitForTimeout(2500);
  ok(await pm3.evaluate(() => window.__sffFamily.famId === window.SFF_UID && kids.length === 1 && sets.filter(s => !s.demo).length === 1 && window.SFF_FAMS.length === 1), 'the family app: her family, her kid and practice set (no class in it)');

  console.log('5. English');
  const ce = await ctx('teacher-en', 'en'), pe = await page(ce);
  await pe.waitForSelector('#fbGo'); await pe.screenshot({ path: `${OUT}/t_login_en.png` });
  await pe.click('#fbGo'); await setup(pe, 'class', 'Grade 4, class 2 – Math', 't_setup_en'); await ready(pe);
  await pe.screenshot({ path: `${OUT}/t_home_en.png` });
  const heb = await pe.evaluate(() => (document.getElementById('kidCar').innerText + document.getElementById('bNav').innerText).match(/[֐-׿][^\n]*/g) || []);
  ok(!heb.length, 'English: the teacher home is translated ' + JSON.stringify(heb));
  await pe.evaluate(() => openMenu()); await pe.waitForTimeout(400); await pe.screenshot({ path: `${OUT}/t_menu_en.png` });

  ok(!errs.length, 'no page errors ' + JSON.stringify(errs));
  await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
