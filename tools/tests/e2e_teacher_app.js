// The teachers' app (/teach – the same code, server and accounts, only teachers' places), on the emulators (firestore, auth, functions):
// 1. a new teacher at /teach: one sign-in card, the first group, no family made; its own manifest; ☰ = my groups + the family app;
// 2. the same teacher in the family app: ☰ links to the teachers' app;
// 3. a parent's invitation to a private tutor opens the teachers' app – the tutor's place, no group asked for;
// 4. a parent who opens /teach: asked for a first group (or back to the family app) – the family and its open place untouched.
// Serve with `python3 tools/serve.py 8765` (it answers /teach like the hosting). OUT=dir for screenshots (Hebrew + English).
const { chromium } = require('playwright');
const APP = 'http://localhost:8765/', OUT = process.env.OUT || require('os').tmpdir();
const FS = 'http://127.0.0.1:8080', PROJ = 'study-for-fun-7b03c', DOCS = `${FS}/v1/projects/${PROJ}/databases/(default)/documents`;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) process.exitCode = 1; };
const exists = path => fetch(`${DOCS}/${path}`, { headers: { Authorization: 'Bearer owner' } }).then(r => r.ok);
(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const errs = [];
  const ctx = async (who, name, lang = 'he') => { const c = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    await c.addInitScript(([g, l]) => { window.SFF_REST_EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' }; window.SFF_TEST_GOOGLE = g; localStorage.setItem('sff_lang', l); },
      [{ sub: who, email: who + '@test.local', email_verified: true, name }, lang]); return c; };
  const page = async (c, url) => { const p = await c.newPage(); p.on('pageerror', e => errs.push(e.message)); await p.goto(url, { waitUntil: 'load' }); return p; };
  const ready = (p, f = () => window.SFF_ROLE) => p.waitForFunction(f, null, { timeout: 25000 }).then(() => p.waitForTimeout(2500));
  const menu = async p => { await p.evaluate(() => { document.getElementById('intro')?.remove(); openMenu(); }); await p.waitForTimeout(400);
    return p.evaluate(() => { const vis = id => { const e = document.getElementById(id); return !!e && e.offsetParent !== null; }, panel = document.querySelector('#sideMenu .dpanel');
      const order = [...panel.children].filter(e => e.offsetParent !== null).map(e => e.id || e.className.split(' ')[0]);
      return { text: document.getElementById('dFams').innerText, all: panel.innerText, sub: document.getElementById('dSub').innerText, hidden: document.getElementById('dFams').classList.contains('hidden'),
        other: document.getElementById('dOtherApp')?.getAttribute('href') || '', otherIn: document.getElementById('dOtherApp')?.closest('.dgrp')?.id || '', order,
        fam: vis('dGrpFam'), sound: vis('dSound'), howIn: document.getElementById('dHow').closest('.dgrp').id, langIn: document.getElementById('dLang').closest('.dgrp').id }; }); };
  const shotMenu = async (p, file) => { await p.setViewportSize({ width: 390, height: 1300 }); await p.waitForTimeout(300); await p.screenshot({ path: `${OUT}/${file}` }); await p.setViewportSize({ width: 390, height: 844 }); };

  console.log('1. a new teacher at /teach');
  const tc = await ctx('teachA', 'רונית המורה'), T = await page(tc, APP + 'teach');
  await T.waitForSelector('#fbLogin #fbGo', { timeout: 20000 });
  const L = await T.evaluate(() => { const v = x => { const e = document.querySelector(x); return !!e && e.offsetParent !== null; };
    return { kid: v('#fbKid'), teach: v('#fbTeach'), go: v('#fbGo'), goTxt: document.getElementById('fbGo').innerText, q: document.querySelector('#fbLogin .fbq').textContent, back: document.querySelector('#fbLogin .fbother')?.getAttribute('href'),
      app: window.SFF_APP, man: document.querySelector('link[rel="manifest"]')?.getAttribute('href'), title: document.title }; });
  ok(L.app === 'teach' && L.man === '/teach.webmanifest' && /מורים/.test(L.title), `the teachers' app: its own manifest and title (${L.man}, ${L.title})`);
  ok(!L.kid && !L.teach && L.go && /Google/.test(L.goTxt) && L.q === 'כניסה למורים' && L.back === '/', 'sign-in: one card (no kid, no parent), "כניסה למורים", a link back to the family app');
  await T.screenshot({ path: `${OUT}/ta_login_he.png` });
  const man = await (await fetch(APP + 'teach.webmanifest')).json();
  ok(man.start_url === '/teach' && man.scope === '/teach' && man.id === '/teach' && /מורים/.test(man.name), 'teach.webmanifest: start /teach, its own id');
  await T.click('#fbGo'); await T.waitForSelector('#tsClass', { timeout: 20000 });
  ok(await T.evaluate(() => document.getElementById('tsFam')?.getAttribute('href') === '/'), 'the first-group screen: "a parent? to the family app"');
  await T.screenshot({ path: `${OUT}/ta_setup_he.png` });
  await T.click('#tsClass'); await T.fill('#tsName', "ה'1 – מדעים"); await T.click('#tsGo');
  await ready(T, () => window.SFF_KIND === 'class' && window.SFF_ROLE);
  const tuid = await T.evaluate(() => window.SFF_UID);
  ok(await T.evaluate(() => window.SFF_APP === 'teach' && window.SFF_TEACHER && window.SFF_FAMS.length === 1 && window.SFF_FAMS[0].kind === 'class'), 'the group opens – the only place in the teachers\' app');
  ok(!(await exists(`families/${tuid}`)), 'no family made for the teacher');
  ok(await T.evaluate(() => !!localStorage.getItem('sff_active_teach') && !localStorage.getItem('sff_active_fam')), 'the open place is kept for the teachers\' app only (sff_active_teach)');
  let M = await menu(T);
  ok(!M.hidden && /🏫 בית הספר/.test(M.text) && /מדעים/.test(M.text) && /כיתה חדשה/.test(M.text) && !/👩‍🏫 תלמידים פרטיים/.test(M.text) && /להוסיף גם תלמידים פרטיים/.test(M.text) && !/משפחה משלי/.test(M.all),
    '☰: the school world (the class, "a new class"), "add private students too" – no private world yet, no "my own family"');
  ok(M.order.join() === 'dtop,dwho,dFams,dGrpHelp,dGrpAcc,dVer', '☰ in order: who you are, my groups and students, help, account – ' + M.order.join());
  ok(!M.fam && !M.sound && M.howIn === 'dGrpHelp' && M.langIn === 'dGrpAcc' && M.otherIn === 'dGrpAcc' && M.other === '/', 'no family items and no sound check; "how it works" under help; language and "to the families app" under account');
  ok(/מורה בבית ספר/.test(M.sub) && !/פרטי/.test(M.sub), 'who you are: ' + M.sub.replace(/\s+/g, ' '));
  ok(await T.evaluate(() => !document.documentElement.classList.contains('wpriv')), 'the school world: blue (not the private purple)');
  await shotMenu(T, 'ta_menu_he.png');
  // a new class: straight to its form – never "which kind?" again
  await T.evaluate(() => [...document.querySelectorAll('#dFams .ditem')].find(b => /כיתה חדשה/.test(b.textContent)).click()); await T.waitForSelector('#tsName', { timeout: 10000 });
  ok(await T.evaluate(() => !document.getElementById('tsClass') && !document.getElementById('tsPriv') && !!document.getElementById('tsCancel')), '"כיתה חדשה": straight to the class\'s form (no "school or private?")');
  await T.click('#tsCancel'); await T.waitForTimeout(400);
  // the private world, added from the menu: its own group, purple, both worlds in the menu
  await menu(T); await T.evaluate(() => [...document.querySelectorAll('#dFams .ditem')].find(b => /להוסיף גם תלמידים פרטיים/.test(b.textContent)).click());
  await T.waitForSelector('#tsName', { timeout: 10000 });
  ok(await T.evaluate(() => !document.getElementById('tsClass')), '"add private students too": straight to the private group\'s form');
  await T.fill('#tsName', 'השיעורים של יום ג׳'); await T.click('#tsGo');
  await T.waitForFunction(() => (window.SFF_CLASS || {}).teach === 'private', null, { timeout: 25000 }); await T.waitForTimeout(2500);
  M = await menu(T);
  ok(await T.evaluate(() => document.documentElement.classList.contains('wpriv') && window.SFF_WORLD === 'private'), 'the private group opens – purple');
  ok(/🏫 בית הספר/.test(M.text) && /👩‍🏫 תלמידים פרטיים/.test(M.text) && /יום ג/.test(M.text) && /קבוצה פרטית/.test(M.text) && /קבוצה פרטית חדשה/.test(M.text) && !/להוסיף גם/.test(M.text)
    && M.text.indexOf('מדעים') < M.text.indexOf('תלמידים פרטיים') && M.text.indexOf('תלמידים פרטיים') < M.text.indexOf('יום ג'), '☰: both worlds apart – the class under school, the private group under private');
  ok(/מורה בבית ספר · מורה פרטי\/ת/.test(M.sub), 'who you are: both worlds – ' + M.sub.replace(/\s+/g, ' '));
  await shotMenu(T, 'ta_menu2_he.png');
  await T.evaluate(() => { closeMenu(); go('kids'); }); await T.waitForTimeout(800); await T.screenshot({ path: `${OUT}/ta_home_private.png` });
  ok(await T.evaluate(async () => (await window.__sffRoot.get('users', window.SFF_UID))?.worlds?.sort().join() === 'private,school'), 'the account keeps both worlds (users/{uid}.worlds, by the server)');
  await T.evaluate(() => window.__sffFamily.switchTo(window.SFF_FAMS.find(f => f.teach !== 'private').id)); await T.waitForFunction(() => (window.SFF_CLASS || {}).teach === 'class', null, { timeout: 25000 }); await T.waitForTimeout(1500);
  ok(await T.evaluate(() => !document.documentElement.classList.contains('wpriv')), 'back to the class: blue again');
  // the group tab's own "new" button: the world open now – never "which kind?"
  await T.evaluate(() => go('family')); await T.waitForSelector('#grpNew', { timeout: 10000 });
  ok(/כיתה חדשה/.test(await T.textContent('#grpNew')), 'the group tab: "＋ כיתה חדשה" (in a class)');
  await T.click('#grpNew'); await T.waitForSelector('#tsName', { timeout: 10000 });
  ok(await T.evaluate(() => !document.getElementById('tsClass') && !document.getElementById('tsPriv')), '…straight to the class\'s form (no "school or private?")');
  await T.click('#tsCancel'); await T.waitForTimeout(400);
  ok(await T.evaluate(() => { newClass(); const r = !document.getElementById('tsClass') && !!document.getElementById('tsName'); document.getElementById('tsCancel')?.click(); return r; }), 'any "new group" with no world given: the world open now');
  // the main screen: choosing the class (the owner's decision, 25.11)
  await T.evaluate(() => go('kids')); await T.waitForTimeout(300);
  const bk = await T.evaluate(() => ({ vis: !document.getElementById('topBack').classList.contains('hidden'), t: document.getElementById('topBack').textContent }));
  ok(bk.vis && /הקבוצות/.test(bk.t), 'in a group: "‹ הקבוצות" at the top – ' + bk.t);
  await T.click('#topBack'); await T.waitForSelector('#vPlaces:not(.hidden) .plcard .pln', { timeout: 10000 });
  const PL = await T.evaluate(() => ({ text: document.getElementById('vPlaces').innerText, cards: document.querySelectorAll('#vPlaces .plcard').length, nav: getComputedStyle(document.getElementById('bNav')).display }));
  ok(PL.cards === 2 && /בית הספר/.test(PL.text) && /תלמידים פרטיים/.test(PL.text) && /מדעים/.test(PL.text) && /יום ג/.test(PL.text) && /כיתה חדשה/.test(PL.text) && /קבוצה פרטית חדשה/.test(PL.text) && PL.nav === 'none',
    '…the class picker: both worlds, a card each, "new" in each; no bottom tabs');
  ok(/באיזו קבוצה עובדים עכשיו/.test(PL.text) && /עוד אין תלמידים|\d+ תלמידים|תלמיד\/ה אחד\/ת/.test(PL.text), 'the picker says what to do, and how many students each class has');
  await T.screenshot({ path: `${OUT}/ta_places_he.png` });
  const T3 = await page(tc, APP + 'teach'); await T3.waitForFunction(() => window.SFF_ROLE, null, { timeout: 25000 }); await T3.waitForSelector('#vPlaces:not(.hidden) .plcard', { timeout: 15000 });
  ok(await T3.evaluate(() => !document.getElementById('vPlaces').classList.contains('hidden') && document.getElementById('vKids').classList.contains('hidden')), 'opening the teachers\' app: the class picker first');
  await T3.evaluate(() => [...document.querySelectorAll('#vPlaces .plcard')].find(b => /יום ג/.test(b.textContent)).click());
  await T3.waitForFunction(() => (window.SFF_CLASS || {}).teach === 'private' && !document.getElementById('vKids').classList.contains('hidden'), null, { timeout: 25000 });
  ok(true, 'tap a card: into that group (its home)');
  await T3.close();
  // back, everywhere (the owner's request): the phone's back button and a back on every screen and dialog
  await T.evaluate(() => enterPlace(window.__sffFamily.famId)); await T.waitForTimeout(500);
  await T.goBack(); await T.waitForTimeout(600);
  ok(await T.evaluate(() => !document.getElementById('vPlaces').classList.contains('hidden') && location.pathname === '/teach'), 'the phone\'s back in a group: to the class picker (not out of the app)');
  await T.evaluate(() => enterPlace(window.__sffFamily.famId)); await T.waitForTimeout(400);
  await T.evaluate(() => openMenu()); await T.waitForTimeout(300); await T.goBack(); await T.waitForTimeout(500);
  ok(await T.evaluate(() => document.getElementById('sideMenu').classList.contains('hidden') && !document.getElementById('vKids').classList.contains('hidden')), 'the phone\'s back with ☰ open: closes the menu only');
  await T.evaluate(() => { asgOpen(); }); await T.waitForSelector('#tDlg:not(.hidden) .tback', { timeout: 8000 });
  ok(await T.evaluate(() => /חזרה/.test(document.querySelector('#tDlg .tback').textContent)), 'the new assignment: "› חזרה" at its top');
  await T.click('#tDlg .tback'); await T.waitForTimeout(300);
  ok(await T.evaluate(() => document.getElementById('tDlg').classList.contains('hidden')), '…on its first step it closes the dialog');
  // a dialog with its own "back a step": the top back does that step (not close)
  await T.evaluate(() => { window.__stepBack = 0; tDialog('<p>שלב 2</p><button class="linkbtn" onclick="window.__stepBack=1">› חזרה</button>'); }); await T.click('#tDlg .tback'); await T.waitForTimeout(200);
  ok(await T.evaluate(() => window.__stepBack === 1 && !document.getElementById('tDlg').classList.contains('hidden')), 'a dialog with steps: the top "› חזרה" goes one step back');
  await T.evaluate(() => tDialog('<p>כרטיס תלמיד</p>')); await T.goBack(); await T.waitForTimeout(500);
  ok(await T.evaluate(() => document.getElementById('tDlg').classList.contains('hidden') && !document.getElementById('vKids').classList.contains('hidden')), 'the phone\'s back on a dialog (no steps): closes it');
  await T.evaluate(() => { go('stats'); TR.topic = 'x'; renderTeacherStats(); }); await T.waitForTimeout(300);
  const tb = await T.evaluate(() => document.getElementById('topBack').textContent);
  await T.evaluate(() => goBack()); await T.waitForTimeout(300);
  ok(/חזרה/.test(tb) && await T.evaluate(() => TR.topic === null && !document.getElementById('vStats').classList.contains('hidden')), 'a topic\'s page in the report: the top "‹ חזרה" goes to the topics (' + tb + ')');
  await T.evaluate(() => go('kids')); await T.waitForTimeout(800); await T.screenshot({ path: `${OUT}/ta_home_school.png` });

  console.log('2. the same teacher in the family app');
  const T2 = await page(tc, APP); await ready(T2);
  M = await menu(T2);
  ok(await T2.evaluate(() => window.SFF_APP === 'family') && M.other === '/teach' && M.otherIn === 'dGrpAcc' && /לאפליקציה למורים/.test(M.all), '☰ in the family app: "to the teachers\' app" (under account)');
  await shotMenu(T2, 'ta_fam_menu_he.png');
  await T2.close();

  console.log("3. a parent invites a private tutor – the link opens the teachers' app");
  const oc = await ctx('parentA', 'טליה'), O = await page(oc, APP);
  await O.waitForSelector('#fbGo', { timeout: 20000 }); await O.click('#fbGo'); await ready(O);
  await O.evaluate(async () => { document.getElementById('intro')?.remove(); kids.push({ id: 'k1', name: 'נועה', grade: 6, color: '#FF5C8A' }, { id: 'k2', name: 'בן', grade: 5, color: '#2F6BFF' }); saveKids();
    applyImport(await loadShare('en7-nov26'), kidById('k2')); });
  await O.waitForTimeout(3000);
  const ouid = await O.evaluate(() => window.SFF_UID);
  const inv = await O.evaluate(() => window.__sffFamily.invite('tutor', 'דנה', ['k2']));
  const help = await O.evaluate(() => window.__sffFamily.invite('helper', 'סבתא', []));
  ok(/\/teach\?invite=/.test(inv) && !/\/teach/.test(help), 'the tutor\'s link: /teach?invite=… (a helper\'s stays in the family app)');
  const uc = await ctx('tutorA', 'דנה המורה'), U = await page(uc, inv);
  await U.waitForSelector('#fbGo', { timeout: 20000 }); await U.click('#fbGo');
  await ready(U, () => window.SFF_ROLE === 'tutor');
  const us = await U.evaluate(() => ({ app: window.SFF_APP, role: window.SFF_ROLE, kids: kids.map(k => k.name).join(), setup: !!document.getElementById('tsClass'), fams: window.SFF_FAMS.length }));
  ok(us.app === 'teach' && us.role === 'tutor' && us.kids === 'בן' && !us.setup && us.fams === 1, 'the tutor: the teachers\' app, Ben only, no group asked for – ' + JSON.stringify(us));
  M = await menu(U);
  ok(/👩‍🏫 תלמידים פרטיים/.test(M.text) && /בהזמנת המשפחה/.test(M.text) && /קבוצה פרטית חדשה/.test(M.text) && /להוסיף גם כיתות בבית ספר/.test(M.text) && !/🏫 בית הספר/.test(M.text) && /מורה פרטי/.test(M.sub)
    && await U.evaluate(() => document.documentElement.classList.contains('wpriv')) && !/המשפחה והמבוגרים/.test(M.all) && /בן/.test(M.text) && /מחיקת חשבון/.test(M.all) && !/יציאה מהמשפחה/.test(M.all), '☰: the tutor\'s place – the student (בן), "private tutor for a family", "delete account", a new group of their own; no family items');
  await shotMenu(U, 'ta_tutor_menu_he.png');

  console.log('4. a parent who opens /teach');
  const P = await page(oc, APP + 'teach'); await P.waitForSelector('#fbGo, #tsClass', { timeout: 20000 });
  if (await P.$('#fbGo:visible')) await P.click('#fbGo');
  await P.waitForSelector('#tsClass', { timeout: 20000 });
  ok(await P.evaluate(() => !!document.getElementById('tsFam')), 'asked for a first group – with a way back to the family app');
  ok(await exists(`families/${ouid}`), 'the family is still there');
  await P.click('#tsFam'); await P.waitForFunction(() => window.SFF_ROLE, null, { timeout: 25000 }); await P.waitForTimeout(2000);
  const back = await P.evaluate(() => ({ app: window.SFF_APP, role: window.SFF_ROLE, fam: window.__sffFamily.famId, kids: kids.length, teacher: !!window.SFF_TEACHER }));
  ok(back.app === 'family' && back.role === 'owner' && back.fam === ouid && back.kids === 2 && !back.teacher, 'back in the family app: the parent\'s own family, both kids, not marked a teacher – ' + JSON.stringify(back));
  await P.close();

  console.log('5. English');
  const ec = await ctx('teachE', 'Ronit', 'en'), E = await page(ec, APP + 'teach');
  await E.waitForSelector('#fbLogin #fbGo', { timeout: 20000 }); await E.waitForTimeout(600);
  const heb = s => (s.match(/[^\s]*[֐-׿][^\s]*/g) || []).filter(w => !/מורים|^עב$/.test(w));   // the title and the language button
  const et = await E.evaluate(() => document.getElementById('fbLogin').innerText);
  ok(!heb(et).length, 'sign-in in English: no Hebrew left ' + heb(et).join(' '));
  await E.screenshot({ path: `${OUT}/ta_login_en.png` });
  await E.click('#fbGo'); await E.waitForSelector('#tsPriv', { timeout: 20000 }); await E.waitForTimeout(400);
  const st = await E.evaluate(() => document.getElementById('fbLogin').innerText);
  ok(!heb(st).length, 'the first-group screen in English ' + heb(st).join(' '));
  await E.click('#tsPriv'); await E.click('#tsGo'); await ready(E, () => window.SFF_KIND === 'class' && window.SFF_ROLE);
  M = await menu(E);
  ok(!heb(M.all).filter(w => !/התלמידים|שלי|^עב$/.test(w)).length && /Private students/.test(M.text) && /New private group/.test(M.text) && /Add school classes too/.test(M.text) && /families app/.test(M.all) && /Private tutor/.test(M.sub), '☰ in English: no Hebrew left (but the group\'s name) ' + heb(M.all).join(' '));
  await shotMenu(E, 'ta_menu_en.png');
  await E.evaluate(() => { closeMenu(); openPlaces(); }); await E.waitForTimeout(1500);
  const pe = await E.evaluate(() => document.getElementById('vPlaces').innerText);
  ok(/Which group/.test(pe) && /Private students/.test(pe) && !heb(pe).filter(w => !/התלמידים|שלי|^עב$/.test(w)).length, 'the picker in English: ' + heb(pe).join(' '));
  await E.screenshot({ path: `${OUT}/ta_places_en.png` });

  ok(!errs.length, 'no page errors ' + errs.slice(0, 3).join(' | '));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
