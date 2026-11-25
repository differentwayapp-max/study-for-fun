// The first-run intro screens, on the emulators (firestore, auth) with the real rules:
// 1. a new parent (after the sign-in and the terms) gets 4 screens – the opening, "your material, up to test day", "see what's solid – and
//    strengthen it" (focused practice), "start in 3 steps"; the store keeps its 8 (INTRO_ALL); swipe goes on; every button ≥ 44 px;
//    "דלג" closes it and it does not come back after a reload (kept in users/{uid}.intro) – a new sign-in (another phone) shows it again;
//    ☰ → איך זה עובד opens it again; English: no Hebrew left on it;
// 2. a kid phone, the first time from its link: only screens 2 and 6 – no parent text, no "להורה" tags; "יאללה למפה" ends it;
//    the next time: not again;
// 3. a kid phone in Lockdown Mode (no storage, no WebAssembly): no intro and no error. OUT=dir for screenshots.
const { chromium } = require('playwright');
const OUT = process.env.OUT || require('os').tmpdir();
const FS = 'http://127.0.0.1:8080', PROJ = 'study-for-fun-7b03c', DOCS = `${FS}/v1/projects/${PROJ}/databases/(default)/documents`;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) process.exitCode = 1; };
const enc = x => typeof x === 'string' ? { stringValue: x } : typeof x === 'number' ? { integerValue: String(x) } : Array.isArray(x) ? { arrayValue: { values: x.map(enc) } } : { mapValue: { fields: Object.fromEntries(Object.entries(x).map(([k, v]) => [k, enc(v)])) } };
const put = (path, obj) => fetch(`${DOCS}/${path}`, { method: 'PATCH', headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: enc(obj).mapValue.fields }) }).then(r => { if (!r.ok) throw new Error(path + ' ' + r.status); });
const EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' };
(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const errs = [];
  const parent = async (lang = 'he', sub = 'intro1') => { const c = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
    await c.addInitScript(([l, s, E]) => { window.SFF_REST_EMU = E; window.SFF_TEST_ONB = 1;
      window.SFF_TEST_GOOGLE = { sub: s, email: s + '@t.local', email_verified: true, name: 'הורה' }; localStorage.setItem('sff_lang', l); }, [lang, sub, EMU]); return c; };
  const open = async c => { const p = await c.newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(2500); if (await p.$('#fbGo')) await p.click('#fbGo');
    await p.waitForFunction(() => window.SFF_ROLE, null, { timeout: 20000 }); await p.waitForTimeout(1500); return p; };
  const shown = p => p.evaluate(() => { const el = document.getElementById('intro'); return el ? { key: el.dataset.key, n: el.querySelectorAll('.idots i').length, text: el.innerText } : null; });

  console.log('1. a new parent');
  const c1 = await parent(), p1 = await open(c1);
  let s = await shown(p1);
  ok(s && s.key === 'main' && s.n === 4, 'the intro opens on screen 1, with 4 screens: ' + JSON.stringify(s && { key: s.key, n: s.n }));
  const small = await p1.evaluate(() => [...document.querySelectorAll('#intro button')].filter(x => x.offsetParent !== null).filter(x => { const r = x.getBoundingClientRect(); return r.height < 44 || r.width < 44; }).map(x => x.outerHTML.slice(0, 60)));
  ok(!small.length, 'every button is at least 44 × 44 px ' + JSON.stringify(small));
  await p1.screenshot({ path: `${OUT}/intro_parent_1.png` });
  const keys = ['main'];
  for (let i = 0; i < 3; i++) { await p1.click('#intro .inext'); await p1.waitForTimeout(300); keys.push((await shown(p1)).key); }
  ok(keys.join() === 'main,material,track,start', 'the parent screens: ' + keys.join());
  const [txt, FL] = await p1.evaluate(() => [IN.list.map(k => introCard(k).html).join(' '), FOCUS_LINE]);
  ok(/החומר שלכם<br>עד יום המבחן/.test(txt) && /או בוחרים תרגול מוכן מהקטלוג – בלי לחכות/.test(txt) && txt.includes(FL) && /תרגול ממוקד · 3 מילים/.test(txt) && /אחר כך תראו מה תוקן ✓/.test(txt)
    && /מוסיפים ילד/.test(txt) && /שולחים לילד קישור/.test(txt) && /בלי פרסומות/.test(txt) && /בלי רכישות לילד/.test(txt) && /סבתא או מורה/.test(txt), 'the texts of the new screens (FOCUS_LINE on "רואים מה יושב")');
  ok(!/[\u{1F300}-\u{1FAFF}]/u.test(txt.replace(/IC\./g, '')), 'no emoji on the parent\'s screens (line icons)');
  const store = await p1.evaluate(() => INTRO_ALL.join() + '|' + ['build', 'testday', 'progress', 'focus', 'share', 'safe'].every(k => typeof INTRO[k] === 'function'));
  ok(store === 'main,play,build,focus,progress,testday,compete,share|true', 'the store keeps its 8 screens: ' + store);
  ok(/מתחילים/.test(await p1.textContent('#intro .inext')) && !(await p1.$('#intro .iskip')), 'the last screen: "מתחילים" (no "דלג")');
  // swipe (Hebrew: a swipe to the right goes on, to the left goes back)
  const swipe = dx => p1.evaluate(dx => { const el = document.getElementById('intro'), t = (x) => [new Touch({ identifier: 1, target: el, clientX: x, clientY: 400 })];
    el.dispatchEvent(new TouchEvent('touchstart', { touches: t(200), changedTouches: t(200) })); el.dispatchEvent(new TouchEvent('touchend', { touches: [], changedTouches: t(200 + dx) })); }, dx);
  await p1.click('#intro .iback'); await p1.waitForTimeout(300); const bk = (await shown(p1)).key; await p1.click('#intro .inext'); await p1.waitForTimeout(300);
  ok(bk === 'track', 'the back arrow at the top: the screen before (' + bk + ')');
  await swipe(-120); await p1.waitForTimeout(300); const back = (await shown(p1)).key;
  await swipe(120); await p1.waitForTimeout(300); const fwd = (await shown(p1)).key;
  ok(back === 'track' && fwd === 'start', `swipe: left goes back (${back}), right goes on (${fwd})`);
  await p1.evaluate(() => introGo(0)); await p1.waitForTimeout(200);
  await p1.click('#intro .iskip'); await p1.waitForTimeout(800);
  ok(!(await shown(p1)), '"דלג" closes it');
  const saved = await p1.evaluate(async () => (await window.__sffRoot.get('users', window.SFF_UID))?.intro || 0);
  ok(saved > 0, 'seen: kept with the account (users/{uid}.intro)');
  await p1.reload({ waitUntil: 'load' }); await p1.waitForFunction(() => window.SFF_ROLE, null, { timeout: 20000 }); await p1.waitForTimeout(2000);
  ok(!(await shown(p1)), 'after a reload: not again');
  const c2 = await parent(), p2 = await open(c2);
  // (the owner's decision, 24.11: every sign-in shows the screens again – another phone is a new sign-in)
  s = await shown(p2); ok(s && s.key === 'main', 'another phone, same account (a new sign-in): the screens again');
  await p2.click('#intro .iskip').catch(() => {}); await p2.waitForTimeout(600);
  await p2.evaluate(() => openMenu()); await p2.waitForTimeout(300);
  await p2.click('#sideMenu .ditem:has-text("איך זה עובד")'); await p2.waitForTimeout(400);
  s = await shown(p2); ok(s && s.key === 'main' && s.n === 4, '☰ → איך זה עובד opens the same 4 screens');
  const c3 = await parent('en', 'intro-en'), p3 = await open(c3);
  const heb = [];
  for (let i = 0; i < 4; i++) { heb.push(...await p3.evaluate(() => (document.getElementById('intro').innerText.match(/[֐-׿][^\n]*/g) || []))); if (i < 3) { await p3.click('#intro .inext'); await p3.waitForTimeout(250); } }
  ok(!heb.length, 'English: every screen translated ' + JSON.stringify(heb));
  await p3.screenshot({ path: `${OUT}/intro_parent_en_last.png` });

  console.log('2. a kid phone');
  await put('families/FAMI', { inviteToken: 'X', kidTokens: { k1: 'TOKI' }, createdAt: Date.now() });
  await put('families/FAMI/fam/kids', { list: [{ id: 'k1', name: 'בן', grade: 3, color: '#2F6BFF' }] });
  const kid = async (lockdown) => { const c = await b.newContext({ viewport: { width: 390, height: 844 } }); const p = await c.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
    await p.addInitScript(([E, L]) => { window.SFF_REST_EMU = E; window.SFF_TEST_ONB = 1; if (!L) localStorage.setItem('sff_lang', 'he');
      if (L) { delete window.WebAssembly; for (const n of ['localStorage', 'sessionStorage']) Object.defineProperty(window, n, { get() { throw new DOMException('denied', 'SecurityError'); }, configurable: true }); } }, [EMU, lockdown]);   // (on window itself: Chrome's own storage is not on the prototype)
    if (lockdown) await p.route('http://localhost:8765/?**', async r => { const res = await r.fetch(); r.fulfill({ response: res, body: (await res.text()).replace('<script type="module">', '<script type="text/x-blocked">') }); });
    await p.goto('http://localhost:8765/?f=FAMI&t=TOKI&k=k1#kid-k1', { waitUntil: 'load' }); await p.waitForTimeout(lockdown ? 10000 : 6000); return [c, p]; };
  const [kc, kp] = await kid(false);
  s = await shown(kp);
  ok(s && s.key === 'play' && s.n === 2, 'the kid gets the intro: 2 screens, starting with the game screen ' + JSON.stringify(s && { key: s.key, n: s.n }));
  await kp.screenshot({ path: `${OUT}/intro_kid_1.png` });
  const kt = [s ? s.text : '']; await kp.click('#intro .inext'); await kp.waitForTimeout(300); s = await shown(kp); kt.push(s ? s.text : '');
  ok(s && s.key === 'compete', 'screen 2: the friendly competition');
  ok(!/להורה|ההורה|להורים/.test(kt.join(' ')), 'no parent text and no "להורה" tag');
  ok(/יאללה למפה/.test(await kp.textContent('#intro .inext')), 'the last button: "יאללה למפה"');
  await kp.screenshot({ path: `${OUT}/intro_kid_2.png` });
  await kp.click('#intro .inext'); await kp.waitForTimeout(400);
  ok(!(await shown(kp)), '"יאללה למפה" closes it');
  await kp.reload({ waitUntil: 'load' }); await kp.waitForTimeout(6000);
  ok(!(await shown(kp)), 'the next time: not again');
  ok(!kp.errs.length, 'no page errors on the kid phone ' + JSON.stringify(kp.errs));
  await kc.close();

  console.log('3. a kid phone in Lockdown Mode');
  const [lc, lp] = await kid(true);
  const st = await lp.evaluate(() => ({ ns: window.SFF_NO_STORAGE, kd: !!window.SFF_KID_DEVICE, ik: IN.kid, via: window.__sffVia, kids: kids.length, intro: !!document.getElementById('intro'), err: document.getElementById('cloudErr') && !document.getElementById('cloudErr').classList.contains('hidden') ? document.getElementById('cloudErr').innerText.slice(0, 80) : '' }));
  ok(st.kids === 1 && !st.intro, 'no intro (no storage to remember it): ' + JSON.stringify(st));
  ok(!lp.errs.length && !st.err, 'no error ' + JSON.stringify(lp.errs));
  await lp.screenshot({ path: `${OUT}/intro_lockdown.png` });
  await lc.close();

  ok(!errs.length, 'no page errors (parents) ' + JSON.stringify(errs));
  await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
