// The teachers' intro screens, on the emulators (functions, firestore, auth) with the real rules:
// 1. a class teacher: "אני מורה" → "מורה לכיתה" → the School series (before the group's form); every button ≥ 44 px, fits 320 and 360;
//    "דלג" → the form; kept in users/{uid}.introTeacher (the parent's `intro` untouched); never again (a new group, a reload);
//    ☰ → איך זה עובד: the last screen ("לפתוח קבוצה");
// 2. a private teacher: the same screens in a private teacher's words, purple; no "כל הכיתה" / "קבוצת חיזוק"; the last
//    screen's "לפתוח קבוצה" goes on to the group's form;
// 3. an invited tutor: the Tutor series with the student's name and the family, the first time only (users/{uid}.introTutor);
//    "לכרטיס של בן" opens the students' screen; ☰ → איך זה עובד: the last screen;
// 4. a parent: the parent's screens only – none of the teachers'. English: no Hebrew left. Screenshots (OUT): he/en, 360/320.
const { chromium } = require('playwright');
const APP = 'http://localhost:8765/', OUT = process.env.OUT || require('os').tmpdir();
const FS = 'http://127.0.0.1:8080', PROJ = 'study-for-fun-7b03c', DOCS = `${FS}/v1/projects/${PROJ}/databases/(default)/documents`;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) process.exitCode = 1; };
const val = v => v == null ? null : 'integerValue' in v ? +v.integerValue : 'doubleValue' in v ? v.doubleValue : 'stringValue' in v ? v.stringValue : 'booleanValue' in v ? v.booleanValue : 'mapValue' in v ? Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, val(x)])) : 'arrayValue' in v ? (v.arrayValue.values || []).map(val) : null;
const get = async path => { const r = await fetch(`${DOCS}/${path}`, { headers: { Authorization: 'Bearer owner' } }); if (!r.ok) return null; const d = await r.json(); return Object.fromEntries(Object.entries(d.fields || {}).map(([k, x]) => [k, val(x)])); };
const EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' };
(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const errs = [];
  const ctx = async (sub, o = {}) => { const c = await b.newContext({ viewport: { width: o.w || 360, height: o.h || 740 }, hasTouch: true });
    await c.addInitScript(([s, l, E, nm]) => { window.SFF_REST_EMU = E; window.SFF_TEST_ONB = 1; window.SFF_TEST_GOOGLE = { sub: s, email: s + '@t.local', email_verified: true, name: nm }; localStorage.setItem('sff_lang', l); },
      [sub, o.lang || 'he', EMU, o.name || 'מורה']); return c; };
  const page = async (c, url = APP) => { const p = await c.newPage(); p.on('pageerror', e => errs.push(e.message)); await p.goto(url, { waitUntil: 'load' }); return p; };
  const shown = p => p.evaluate(() => { const el = document.getElementById('intro'); return el ? { key: el.dataset.key, n: el.querySelectorAll('.idots button').length || 1, text: el.innerText } : null; });
  const small = p => p.evaluate(() => [...document.querySelectorAll('#intro button')].filter(x => { const r = x.getBoundingClientRect(); return r.height < 44 || r.width < 24; }).map(x => x.outerHTML.slice(0, 50)));
  const over = p => p.evaluate(() => { const st = document.querySelector('#intro .istage'), c = document.querySelector('#intro .icard0'); return Math.round(c.getBoundingClientRect().width - st.clientWidth); });
  // walk a series to its end: each screen – buttons, width, a screenshot
  const walk = async (p, tag) => { const keys = [], bad = []; let s = await shown(p);
    for (let i = 0; s && i < 8; i++) { keys.push(s.key); const sm = await small(p); if (sm.length) bad.push(s.key + ':' + sm.join('|')); if (await over(p) > 1) bad.push(s.key + ': wider than the screen');
      if (tag) await p.screenshot({ path: `${OUT}/${tag}_${i + 1}.png` });
      if (await p.$('#intro .icta2')) break; await p.click('#intro .inext'); await p.waitForTimeout(280); s = await shown(p); }
    return { keys, bad }; };

  console.log('1. a class teacher');
  const c1 = await ctx('introT1', { name: 'דנה לוי' }), p1 = await page(c1);
  await p1.waitForSelector('#fbTeach', { timeout: 20000 }); await p1.click('#fbTeach'); await p1.waitForSelector('#tsClass', { timeout: 20000 }); await p1.click('#tsClass');
  await p1.waitForSelector('#intro', { timeout: 8000 }).catch(() => {});
  let s = await shown(p1);
  ok(s && s.key === 's1' && s.n === 5 && /למורה בבית הספר/.test(s.text) && /כל הכיתה מתרגלת/.test(s.text), 'after "מורה לכיתה": the School series, 5 screens (homework – with stage 4): ' + JSON.stringify(s && { key: s.key, n: s.n }));
  const w1 = await walk(p1, 'it_class_he360');
  ok(w1.keys.join() === 's1,s2,s4,s5,s6' && !w1.bad.length, 'the screens: ' + w1.keys.join() + ' – every button ≥ 44 px, nothing wider than 360 ' + (w1.bad.join(' ; ') || ''));
  const t6 = await shown(p1);
  ok(/הכיתה הראשונה/.test(t6.text) && /לפתוח קבוצה/.test(t6.text) && /אחר כך/.test(t6.text) && /מהקטלוג/.test(t6.text) && !/מהחומר שלכם/.test(t6.text), 'the last: "הכיתה הראשונה ב-3 צעדים", "לפתוח קבוצה" / "אחר כך" – the catalog only (no AI for teachers yet)');
  const all1 = await p1.evaluate(() => IN.list.map(k => introCard(k).html).join(' '));
  ok(!/טפסים מודפסים|לשיעור הבא:|דוח להורים של|מצילום החומר|תרגלו היום/.test(all1), 'nothing that is not built: no paper forms, no "next lesson" conclusion, no report to parents, no AI from a photo, no "practised today"');
  await p1.evaluate(() => introGo(0)); await p1.waitForTimeout(200); await p1.click('#intro .iskip'); await p1.waitForSelector('#tsName', { timeout: 5000 }).catch(() => {});
  ok(!!(await p1.$('#tsName')) && !(await p1.$('#intro')), '"דלג" → the group\'s form');
  await p1.fill('#tsName', "ד'2 – אנגלית"); await p1.click('#tsGo'); await p1.waitForFunction(() => window.SFF_KIND === 'class', null, { timeout: 25000 }); await p1.waitForTimeout(1500);
  const uid1 = await p1.evaluate(() => window.SFF_UID), u1 = await get(`users/${uid1}`);
  ok(u1 && u1.introTeacher > 0 && !('intro' in u1) && !('introTutor' in u1), 'kept in users/{uid}.introTeacher – the parent\'s "intro" untouched: ' + JSON.stringify(Object.keys(u1 || {})));
  ok(!(await p1.$('#intro')), 'no intro over the group');
  await p1.evaluate(() => { newClass(); }); await p1.waitForSelector('#tsClass', { timeout: 8000 }); await p1.click('#tsClass'); await p1.waitForTimeout(600);
  ok(!(await p1.$('#intro')) && !!(await p1.$('#tsName')), 'a second group: straight to the form, no intro');
  await p1.click('#tsCancel').catch(() => {}); await p1.waitForTimeout(300);
  const p1b = await page(c1); await p1b.waitForTimeout(2500); if (await p1b.$('#fbTeach')) await p1b.click('#fbTeach');
  await p1b.waitForFunction(() => window.SFF_KIND === 'class', null, { timeout: 25000 }); await p1b.waitForTimeout(2500);
  ok(!(await p1b.$('#intro')), 'opened again: no intro');
  await p1b.evaluate(() => { openHowItWorks(); }); await p1b.waitForTimeout(400); s = await shown(p1b);
  ok(s && s.key === 's6' && s.n === 1 && /לפתוח קבוצה/.test(s.text), '☰ → איך זה עובד: the last screen, "לפתוח קבוצה"');
  await p1b.click('#intro .icta2'); await p1b.waitForSelector('#tsClass', { timeout: 8000 }).catch(() => {});
  ok(!!(await p1b.$('#tsClass')), '…its button opens a new group (the first choice, then the form)');
  await c1.close();
  // 320 wide + English
  for (const [w, lang, sub] of [[320, 'he', 'introT1b'], [360, 'en', 'introT1c']]) {
    const c = await ctx(sub, { w, h: w === 320 ? 640 : 740, lang }), p = await page(c);
    await p.waitForSelector('#fbTeach', { timeout: 20000 }); await p.click('#fbTeach'); await p.waitForSelector('#tsClass', { timeout: 20000 }); await p.click('#tsClass'); await p.waitForSelector('#intro', { timeout: 8000 }).catch(() => {});
    const r = await walk(p, `it_class_${lang}${w}`);
    ok(r.keys.length === 5 && !r.bad.length, `${lang} ${w}: 5 screens, buttons ≥ 44 px, nothing wider than the screen ${r.bad.join(' ; ')}`);
    if (lang === 'en') { let heb = []; const N = await p.evaluate(() => IN.list.length); for (let i = 0; i < N; i++) { await p.evaluate(i => introGo(i), i); await p.waitForTimeout(400); heb.push(...await p.evaluate(() => document.getElementById('intro').innerText.split('\n').filter(l => /[\u0590-\u05FF]/.test(l)))); }
      ok(!heb.length, 'English: no Hebrew left ' + heb.slice(0, 4).join(' | ')); }
    await c.close();
  }

  console.log('2. a private teacher');
  const c2 = await ctx('introT2', { name: 'רון' }), p2 = await page(c2);
  await p2.waitForSelector('#fbTeach', { timeout: 20000 }); await p2.click('#fbTeach'); await p2.waitForSelector('#tsPriv', { timeout: 20000 }); await p2.click('#tsPriv'); await p2.waitForSelector('#intro', { timeout: 8000 }).catch(() => {});
  s = await shown(p2);
  ok(s && s.key === 's1' && /למורה הפרטי/.test(s.text) && /כל התלמידים שלך מתרגלים/.test(s.text), 'after "מורה פרטי/ת": the private words – ' + (s && s.text.split('\n').slice(1, 4).join(' / ')));
  ok(await p2.evaluate(() => getComputedStyle(document.getElementById('intro')).backgroundColor) === 'rgb(42, 32, 104)', 'purple, like the tutor\'s screens');
  const w2 = await walk(p2, 'it_private_he360');
  const all2 = await p2.evaluate(() => IN.list.map(k => introCard(k).html).join(' '));
  ok(w2.keys.join() === 's1,s2,s4,s5,s6' && !w2.bad.length && !/כל הכיתה|קבוצת חיזוק|קבוצת ההורים/.test(all2) && /התלמידים שלי/.test(all2), 'the same 5 screens – "התלמידים שלי", the link to each parent: no "כל הכיתה", "קבוצת חיזוק" or the parents\' group');
  await p2.click('#intro .icta2'); await p2.waitForSelector('#tsName', { timeout: 5000 }).catch(() => {});
  ok(!!(await p2.$('#tsName')) && await p2.inputValue('#tsName') === 'התלמידים שלי', '"לפתוח קבוצה" → the private group\'s form');
  await p2.click('#tsGo'); await p2.waitForFunction(() => window.SFF_KIND === 'class', null, { timeout: 25000 }); await p2.waitForTimeout(1200);
  const u2 = await get(`users/${await p2.evaluate(() => window.SFF_UID)}`);
  ok(u2 && u2.introTeacher > 0 && !('intro' in u2), 'kept: introTeacher');
  await p2.evaluate(() => { openHowItWorks(); }); await p2.waitForTimeout(400); s = await shown(p2);
  ok(s && s.key === 's6' && /הקבוצה הראשונה/.test(s.text), '☰ → איך זה עובד: the private last screen');
  await p2.screenshot({ path: `${OUT}/it_private_menu.png` });
  await c2.close();

  console.log('3. an invited tutor');
  const co = await ctx('introOwner', { name: 'טליה' }), po = await page(co);
  await po.waitForTimeout(2500); if (await po.$('#fbGo')) await po.click('#fbGo'); await po.waitForFunction(() => window.SFF_ROLE, null, { timeout: 20000 }); await po.waitForTimeout(1500);
  ok((await shown(po) || {}).key === 'main', 'the parent: the parent\'s series (screen 1)');
  await po.click('#intro .iskip'); await po.waitForTimeout(800);
  await po.evaluate(async () => { kids.push({ id: 'k1', name: 'נועה', grade: 6, color: '#FF5C8A' }, { id: 'k2', name: 'בן', grade: 4, color: '#2F6BFF' }); saveKids();
    applyImport(await loadShare('en7-nov26'), kidById('k2')); });
  await po.waitForTimeout(3000);
  const inv = await po.evaluate(() => window.__sffFamily.invite('tutor', 'דנה', ['k2']));
  const uo = await get(`users/${await po.evaluate(() => window.SFF_UID)}`);
  ok(uo && uo.intro > 0 && !('introTutor' in uo) && !('introTeacher' in uo), 'the parent\'s "intro" only');
  const ct = await ctx('introTutor', { name: 'דנה המורה' }), pt = await page(ct, inv);
  await pt.waitForTimeout(2500); if (await pt.$('#fbGo')) await pt.click('#fbGo'); await pt.waitForFunction(() => window.SFF_ROLE === 'tutor', null, { timeout: 25000 });
  await pt.waitForSelector('#intro', { timeout: 15000 }).catch(() => {});
  s = await shown(pt);
  ok(s && s.key === 't1' && s.n === 5 && /בן/.test(s.text) && /המשפחה של בן הזמינה אותך/.test(s.text) && /כיתה ה'/.test(s.text) && !/נועה/.test(s.text), 'the Tutor series, with the student (בן, grade ה׳) – not the other kid: ' + (s && s.text.split('\n').slice(2, 4).join(' / ')));
  const wt = await walk(pt, 'it_tutor_he360');
  ok(wt.keys.join() === 't1,t2,t3,t4,t5' && !wt.bad.length, 'the screens: ' + wt.keys.join() + ' ' + wt.bad.join(' ; '));
  ok(/לכרטיס של בן/.test(await pt.textContent('#intro .icta2')), 'the last button: "לכרטיס של בן"');
  await pt.click('#intro .icta2'); await pt.waitForTimeout(800);
  ok(!(await pt.$('#intro')) && await pt.evaluate(() => !document.getElementById('vKids').classList.contains('hidden')), '…opens the students\' screen');
  const ut = await get(`users/${await pt.evaluate(() => window.SFF_UID)}`);
  ok(ut && ut.introTutor > 0 && !('intro' in ut) && !('introTeacher' in ut), 'kept in users/{uid}.introTutor');
  const pt2 = await page(ct); await pt2.waitForTimeout(2500); if (await pt2.$('#fbGo')) await pt2.click('#fbGo'); await pt2.waitForFunction(() => window.SFF_ROLE === 'tutor', null, { timeout: 25000 }); await pt2.waitForTimeout(4000);
  ok(!(await pt2.$('#intro')), 'opened again: no intro');
  await pt2.evaluate(() => { openHowItWorks(); }); await pt2.waitForTimeout(400); s = await shown(pt2);
  ok(s && s.key === 't5' && s.n === 1, '☰ → איך זה עובד: the tutor\'s last screen');
  await pt2.screenshot({ path: `${OUT}/it_tutor_menu.png` });
  await ct.close();
  // the same tutor intro in English and at 320 (a fresh tutor each time)
  for (const [w, lang, sub] of [[360, 'en', 'introTutorE'], [320, 'he', 'introTutorS']]) {
    const inv2 = await po.evaluate(() => window.__sffFamily.invite('tutor', 'מורה', ['k2']));
    const c = await ctx(sub, { w, h: w === 320 ? 640 : 740, lang }), p = await page(c, inv2);
    await p.waitForTimeout(2500); if (await p.$('#fbGo')) await p.click('#fbGo'); await p.waitForFunction(() => window.SFF_ROLE === 'tutor', null, { timeout: 25000 }); await p.waitForSelector('#intro', { timeout: 15000 }).catch(() => {});
    const r = await walk(p, `it_tutor_${lang}${w}`);
    ok(r.keys.length === 5 && !r.bad.length, `tutor ${lang} ${w}: 5 screens, buttons ≥ 44 px, nothing wider ${r.bad.join(' ; ')}`);
    if (lang === 'en') { let heb = []; const N = await p.evaluate(() => IN.list.length); for (let i = 0; i < N; i++) { await p.evaluate(i => introGo(i), i); await p.waitForTimeout(400); heb.push(...await p.evaluate(() => document.getElementById('intro').innerText.split('\n').filter(l => /[\u0590-\u05FF]/.test(l.replace(/בן|טליה|^.$/g, ''))))); }
      ok(!heb.length, 'English: no Hebrew left (but the student\'s name) ' + heb.slice(0, 4).join(' | ')); }
    await c.close();
  }

  console.log('4. a parent never sees the teachers\' screens');
  const cp = await ctx('introParent2', { name: 'הורה' }), pp = await page(cp);
  await pp.waitForTimeout(2500); if (await pp.$('#fbGo')) await pp.click('#fbGo'); await pp.waitForFunction(() => window.SFF_ROLE, null, { timeout: 20000 }); await pp.waitForTimeout(1500);
  const keysP = []; for (let i = 0; i < 6; i++) { const x = await shown(pp); if (!x) break; keysP.push(x.key); if (i < 5) { await pp.click('#intro .inext'); await pp.waitForTimeout(250); } }
  ok(keysP.join() === 'main,build,testday,progress,share,safe', "the parent's 6 screens only: " + keysP.join());
  await pp.click('#intro .inext'); await pp.waitForTimeout(600);
  await pp.evaluate(() => { openHowItWorks(); }); await pp.waitForTimeout(300); s = await shown(pp);
  ok(s && s.key === 'main' && s.n === 6, '☰ → איך זה עובד: the parent\'s series, as before');
  ok(!errs.length, 'no page errors ' + errs.slice(0, 3).join(' | '));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
