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
  ok(!M.hidden && /הקבוצות והתלמידים שלי/.test(M.text) && /מדעים/.test(M.text) && /כיתה/.test(M.text) && /קבוצה חדשה/.test(M.text) && !/משפחה משלי/.test(M.all), '☰: my groups and students (the group, "כיתה"), a new group – no "my own family"');
  ok(M.order.join() === 'dtop,dwho,dFams,dGrpHelp,dGrpAcc,dVer', '☰ in order: who you are, my groups and students, help, account – ' + M.order.join());
  ok(!M.fam && !M.sound && M.howIn === 'dGrpHelp' && M.langIn === 'dGrpAcc' && M.otherIn === 'dGrpAcc' && M.other === '/', 'no family items and no sound check; "how it works" under help; language and "to the families app" under account');
  ok(/חשבון מורה · קבוצה אחת/.test(M.sub), 'who you are: ' + M.sub.replace(/\s+/g, ' '));
  await shotMenu(T, 'ta_menu_he.png');

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
  ok(/מורה פרטי למשפחה/.test(M.text) && /קבוצה חדשה/.test(M.text) && /מורה פרטי למשפחה אחת/.test(M.sub) && !/המשפחה והמבוגרים/.test(M.all) && /בן/.test(M.text) && /מחיקת חשבון/.test(M.all) && !/יציאה מהמשפחה/.test(M.all), '☰: the tutor\'s place – the student (בן), "private tutor for a family", "delete account", a new group of their own; no family items');
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
  ok(!heb(M.all).filter(w => !/התלמידים|שלי|^עב$/.test(w)).length && /My groups and students/.test(M.text) && /families app/.test(M.all) && /Teacher account/.test(M.sub), '☰ in English: no Hebrew left (but the group\'s name) ' + heb(M.all).join(' '));
  await shotMenu(E, 'ta_menu_en.png');

  ok(!errs.length, 'no page errors ' + errs.slice(0, 3).join(' | '));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
