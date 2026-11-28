// What shows while the app opens (the owner's report, 27.11: "screens that have nothing to do with it pop up and vanish").
// Records what is on the screen every 100 ms from the first paint until the app settles, for: a teacher opening the teachers'
// app again, a teacher signing in, a parent opening the family app again, a parent signing in. A frame is described by the
// main thing visible (the view, its title, the bottom tabs, any overlay). OUT=dir: a strip of frames per case.
const { chromium } = require('playwright');
const APP = 'http://localhost:8765/', OUT = process.env.OUT || require('os').tmpdir();
const DOCS = 'http://127.0.0.1:8080/v1/projects/study-for-fun-7b03c/databases/(default)/documents';
const enc = v => v === null || v === undefined ? { nullValue: null } : typeof v === 'boolean' ? { booleanValue: v } : typeof v === 'number' ? (Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v })
  : typeof v === 'string' ? { stringValue: v } : Array.isArray(v) ? { arrayValue: { values: v.map(enc) } } : { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, enc(x)])) } };
const put = (path, obj) => fetch(`${DOCS}/${path}`, { method: 'PATCH', headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, enc(v)])) }) });
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) process.exitCode = 1; };
(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  // SLOW=1: a phone – the processor ×4 slower and every request 400 ms away (the owner still saw screens jump, 28.11)
  const slow = async p => { if (!process.env.SLOW) return; const c = await p.context().newCDPSession(p); await c.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await c.send('Network.enable'); await c.send('Network.emulateNetworkConditions', { offline: false, latency: 400, downloadThroughput: 1.5e6 / 8 * 10, uploadThroughput: 750e3 / 8 * 10 }); };
  const ctx = async (who, name, onb) => { const c = await b.newContext({ viewport: { width: 360, height: 740 } }); c.on('page', p => slow(p).catch(() => {}));
    await c.addInitScript(([g, o]) => { window.SFF_REST_EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' }; window.SFF_TEST_GOOGLE = g; window.SFF_TEACH_LINKS = true;   /* the teacher's way between the two apps (off in the store version) */ if (o) window.SFF_TEST_ONB = true; localStorage.setItem('sff_lang', 'he'); },
      [{ sub: who, email: who + '@t.local', email_verified: true, name }, !!onb]); return c; };
  // what the screen shows now – a short label of each visible part
  const frame = p => p.evaluate(() => { const vis = el => { if (!el || !el.isConnected) return false; for (let e = el; e; e = e.parentElement) { const c = getComputedStyle(e); if (c.display === 'none' || c.visibility === 'hidden' || +c.opacity === 0) return false; } return el.getBoundingClientRect().height > 0; };
    const out = []; const sp = document.getElementById('splash'); if (sp && vis(sp)) out.push('SPLASH');
    const load = document.getElementById('sffLoad'); if (load && vis(load)) out.push('LOAD:' + (load.innerText || '').trim().slice(0, 20));
    if (document.documentElement.classList.contains('soft')) out.push('SOFT');
    const lg = document.getElementById('fbLogin'); if (lg && vis(lg)) out.push('LOGIN:' + (lg.querySelector('.fbq')?.textContent || lg.className));
    const it = document.getElementById('intro'); if (it) out.push('INTRO:' + (it.dataset.key || ''));
    for (const v of ['vPlaces', 'vKids', 'vStats', 'vFamily', 'vTStud', 'vTAsg', 'vTLes', 'vKid', 'vCat', 'vReview']) { const e = document.getElementById(v); if (e && !e.classList.contains('hidden') && vis(e)) out.push(v); }
    const kc = document.getElementById('kidCar'); if (kc && vis(kc)) { const c = kc.querySelector('.thhome') ? (kc.querySelector('.thstep') ? 'home:new' : kc.querySelector('.thdots') ? 'home:school' : 'home:private') : kc.querySelector('.thome') ? 'home:oldteacher' : kc.innerText.trim() ? 'kids:' + kc.innerText.trim().split('\n')[0].slice(0, 18) : 'kids:empty'; out.push(c); }
    const t = document.getElementById('topTitle'); if (t && vis(t)) out.push('T:' + t.innerText.trim().slice(0, 18));
    const nav = document.getElementById('bNav'); if (nav && vis(nav)) out.push('NAV:' + [...nav.querySelectorAll('button')].filter(vis).map(x => x.innerText.replace(/\s+/g, '')).join('|'));
    const dl = [...document.querySelectorAll('.dlgwrap:not(.hidden), #tDlg:not(.hidden)')].filter(vis); if (dl.length) out.push('DLG');
    const toast = [...document.querySelectorAll('.toast')].filter(vis); if (toast.length) out.push('TOAST:' + toast[0].innerText.slice(0, 20));
    return out.join(' ; '); });
  const record = async (p, url, label, until, act) => {
    const seen = []; let last = ''; const t0 = Date.now();
    const nav = p.goto(url, { waitUntil: 'commit' });
    await nav.catch(() => {});
    for (let i = 0; i < 160; i++) { let f = ''; try { f = await frame(p); } catch (e) { f = '(navigating)'; }
      if (f !== last) { seen.push(`${String(Date.now() - t0).padStart(5)} ms  ${f}`); last = f; if (process.env.OUT) await p.screenshot({ path: `${OUT}/boot_${label}_${seen.length}.png` }).catch(() => {}); }
      if (act) await act(p).catch(() => {});
      if (until && await p.evaluate(until).catch(() => false) && i > 25) break;
      await p.waitForTimeout(100); }
    console.log(`\n${label}:\n` + seen.map(x => '    ' + x).join('\n')); return seen; };

  // a teacher: sign in once (a group), then the steps the owner sees
  const tc = await ctx('bootT', 'דנה לוי'), T = await tc.newPage();
  await T.goto(APP + 'teach'); await T.waitForSelector('#fbGo'); await T.click('#fbGo'); await T.waitForSelector('#tsClass'); await T.click('#tsClass');
  await T.fill('#tsName', "ד'2"); await T.click('#tsGo'); await T.waitForFunction(() => window.SFF_KIND === 'class' && window.SFF_ROLE, null, { timeout: 30000 }); await T.waitForTimeout(1500);
  // the group has students and an assignment (as a teacher's real group)
  const cid = await T.evaluate(() => window.__sffFamily.famId);
  const ks = [['a1', 'נועה'], ['a2', 'יונתן'], ['a3', 'מאיה']];
  await put(`families/${cid}/fam/kids`, { list: ks.map(([id, name]) => ({ id, name, grade: 2, color: '#2F6BFF' })) });
  for (const [id, name] of ks) { await put(`families/${cid}/consents/${id}`, { status: 'digital', letterV: '0.91', at: Date.now(), parentName: 'הורה' }); await put(`families/${cid}/kidpub/${id}`, { list: [{ id, name, grade: 2 }] }); }
  const set = await T.evaluate(async () => { const t = (await (await fetch('/share/en3-0e3c80.txt')).text()).trim().slice(5); const S = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(t), c => c.charCodeAt(0))));
    const q = S.questions.filter(x => x.ch === 0).slice(0, 8).map(x => ({ ...x, ch: 0 })); const due = new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10);
    return { ...S, id: 'asg1', questions: q, chapters: [S.chapters[0]], grp: 1, to: 'all', due, examDate: due, ass: { by: 'x', at: Date.now() }, title: 'Letters', cloud: true }; });
  delete set.qa; delete set.v; await put(`families/${cid}/sets/asg1`, { set });
  await T.waitForFunction(() => trStudents().length === 3 && sets.some(isAsg), null, { timeout: 30000 }).catch(() => {}); await T.waitForTimeout(1000); await T.close();
  const T2 = await tc.newPage(); const s1 = await record(T2, APP + 'teach', 'teacher_reopen', () => window.SFF_ROLE && document.querySelector('.thhome'));
  await T2.close();
  const T3 = await tc.newPage(); const s1b = await record(T3, APP + 'teach', 'teacher_reload_same_tab', () => window.SFF_ROLE && document.querySelector('.thhome'));
  await T3.reload({ waitUntil: 'commit' }); const s1c = await record(T3, T3.url(), 'teacher_reload2', () => window.SFF_ROLE && document.querySelector('.thhome'));
  // a parent: a family, then open again
  const pc = await ctx('bootP', 'טליה'), P = await pc.newPage();
  await P.goto(APP); await P.waitForSelector('#fbGo'); await P.click('#fbGo'); await P.waitForFunction(() => window.SFF_ROLE, null, { timeout: 30000 }); await P.waitForTimeout(1500);
  await P.evaluate(() => document.getElementById('intro')?.remove()); await P.evaluate(() => { kids.push({ id: 'k1', name: 'נועה', grade: 3, color: '#FF5C8A' }); saveKids(); }); await P.waitForTimeout(2000); await P.close();
  const P2 = await pc.newPage(); const s2 = await record(P2, APP, 'parent_reopen', () => window.SFF_ROLE && !document.getElementById('vKids').classList.contains('hidden') && /נועה/.test(document.getElementById('kidCar').innerText));
  // a fresh sign-in at the teachers' app (a new phone)
  const nc = await ctx('bootT', 'דנה לוי'), N = await nc.newPage();
  const s3 = await record(N, APP + 'teach', 'teacher_signin', () => window.SFF_ROLE && document.querySelector('.thhome'), async p => { if (await p.$('#fbLogin #fbGo')) await p.click('#fbLogin #fbGo'); });
  // the same teacher opens the family app, then back to the teachers' app (one browser – the two apps share it)
  const B1 = await tc.newPage(); const s4 = await record(B1, APP, 'teacher_opens_family_app', () => !!document.getElementById('fcTeach') || window.SFF_ROLE);
  await B1.close(); const B2 = await tc.newPage(); const s5 = await record(B2, APP + 'teach', 'teacher_back_to_teach', () => window.SFF_ROLE && document.querySelector('.thhome'));
  // a parent signs in (an iPhone, the owner's report 28.11): the loading screen, then the explanation screens – no cartoon cover, no kids before them
  const fc = await ctx('bootP', 'טליה', true), F = await fc.newPage();
  const s6 = await record(F, APP, 'parent_signin_intro', () => !!document.getElementById('intro'), async p => { if (await p.$('#fbLogin #fbGo')) await p.click('#fbLogin #fbGo'); });
  await F.waitForSelector('#intro', { timeout: 15000 }).catch(() => {});
  const bad = (seen, okRe) => seen.filter(x => !okRe.test(x.replace(/^\s*\d+ ms\s+/, '')));
  // a teacher signing in with the explanation screens on (as on a real phone – the owner's report 28.11: stuck on a cover, then a half-made app)
  const tn = await ctx('bootNewT', 'רונית', true), TN = await tn.newPage(); TN.on('pageerror', e => console.log('    page error:', e.message));
  // a slow sign-in (25 s on the sign-in screen) – the loading screen still covers the app after it
  const sl = await ctx('bootSlowT', 'דנה לוי'), SL = await sl.newPage(); await SL.goto(APP + 'teach'); await SL.waitForSelector('#fbLogin #fbGo'); await SL.waitForTimeout(25000);
  await SL.click('#fbLogin #fbGo'); await SL.waitForTimeout(150);
  ok(await SL.evaluate(() => !!document.getElementById('fbLogin') || document.documentElement.classList.contains('booting')), 'after 25 s on the sign-in screen: the next screen or "רגע…" – never the app half-made');
  await SL.close();
  const s7 = await record(TN, APP + 'teach', 'new_teacher_signin_onb', () => !!document.querySelector('#fbLogin #tsClass'), async p => { if (await p.$('#fbLogin #fbGo')) await p.click('#fbLogin #fbGo'); });
  await TN.click('#tsClass').catch(() => {}); await TN.waitForSelector('#intro', { timeout: 15000 }).catch(() => {});
  const s7b = await frame(TN); console.log('    after "מורה בבית ספר":', s7b);
  ok(/INTRO:s1/.test(s7b), 'a new teacher: "class teacher" → the class teacher\'s explanation screens (' + s7b + ')');
  await TN.evaluate(() => document.querySelector('#intro .iskip')?.click()); await TN.waitForSelector('#tsName', { timeout: 10000 }).catch(() => {});
  ok(await TN.evaluate(() => !!document.getElementById('tsName')), '…then the group\'s form');
  await TN.fill('#tsName', 'ג׳1'); await TN.click('#tsGo');
  await TN.waitForFunction(() => window.SFF_ROLE && document.querySelector('.thhome') && !document.documentElement.classList.contains('booting'), null, { timeout: 30000 }).catch(() => {});
  const s7c = await frame(TN); console.log('    then:', s7c);
  ok(/home:new/.test(s7c) && /NAV:🏠היום/.test(s7c) && !/LOAD|INTRO/.test(s7c), 'a new teacher: the new group\'s home, the teachers\' tabs');
  const to = await ctx('bootT', 'דנה לוי', true), TO = await to.newPage(); TO.on('pageerror', e => console.log('    page error:', e.message));
  const s8 = await record(TO, APP + 'teach', 'teacher_signin_onb', () => !!document.getElementById('intro'), async p => { if (await p.$('#fbLogin #fbGo')) await p.click('#fbLogin #fbGo'); });
  ok(s8.some(x => /INTRO:s1/.test(x)) && !bad(s8, /^(|\(navigating\)|SPLASH.*|LOAD:.*|LOGIN:.*|INTRO:.*)$/).length, 'a teacher signing in: the loading screen, then the explanation screens');
  await TO.evaluate(() => document.querySelector('#intro .iskip')?.click());
  await TO.waitForFunction(() => !document.getElementById('intro') && !document.documentElement.classList.contains('booting'), null, { timeout: 30000 }).catch(() => {}); await TO.waitForTimeout(800);
  const s8c = await frame(TO); console.log('    after the screens:', s8c);
  ok(/home:school/.test(s8c) && /NAV:🏠היום/.test(s8c), '…then the group\'s home');
  const T_OK = /^(|\(navigating\)|SPLASH.*|LOAD:.*|SOFT.*|LOGIN:.*|vKids ; home:school ; T:ד'2 · אנגלית ▾ ; NAV:.*)$/;   /* the loading screen, the sign-in, then only the teacher's full home */
  for (const [lab, s] of [['teacher_reopen', s1], ['teacher_reload_same_tab', s1b], ['teacher_reload2', s1c], ['teacher_signin', s3], ['teacher_back_to_teach', s5]]) {
    const b2 = bad(s, T_OK); ok(!b2.length, `${lab}: only the loading screen, then the teacher's home ${b2.length ? '– also: ' + b2.slice(0, 4).join(' | ') : ''}`); }
  const b4 = bad(s4, /^(|\(navigating\)|SPLASH.*|LOAD:.*|LOGIN:האפליקציה למשפחות.*)$/); ok(!b4.length, `teacher_opens_family_app: the loading screen, then the choice ${b4.length ? '– also: ' + b4.slice(0, 4).join(' | ') : ''}`);
  const b6 = bad(s6, /^(|\(navigating\)|SPLASH.*|LOAD:.*|LOGIN:.*|INTRO:.*)$/); ok(!b6.length && s6.some(x => /INTRO:/.test(x)) && !s6.some(x => /onbWait/.test(x)), `parent_signin_intro: the loading screen, then the explanation screens ${b6.length ? '– also: ' + b6.slice(0, 4).join(' | ') : ''}`);
  const b3 = bad(s2, /^(|\(navigating\)|SPLASH.*|LOAD:.*|SOFT.*|.*kids:נועה.*)$/); ok(!b3.length, `parent_reopen: only the loading screen, then the kids ${b3.length ? '– also: ' + b3.slice(0, 4).join(' | ') : ''}`);
  await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
