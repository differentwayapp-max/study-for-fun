// First-run welcome screens (parents, right after the terms approval): 5 screens with real app pictures (5 pictures,
// every screen fits a small phone without scrolling);
// "אחר כך" → shown again the next time the app opens (a new tab), "הבנתי" → a note about the user guide, then never again
// (kept with the account, so not on another phone either). Run inside the emulators (firestore, auth). OUT=dir for screenshots.
const { chromium } = require('playwright');
const OUT = process.env.OUT || require('os').tmpdir();   // screenshots never land in the repo
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) process.exitCode = 1; };
(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const mk = async (lang = 'he') => { const c = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    await c.addInitScript(l => { window.SFF_REST_EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' }; window.SFF_TEST_ONB = 1;
      window.SFF_TEST_GOOGLE = { sub: 'onb-' + l, email: 'onb' + l + '@t.local', email_verified: true, name: 'הורה' }; localStorage.setItem('sff_lang', l); }, lang); return c; };
  const open = async c => { const p = await c.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
    await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(2500); if (await p.$('#fbGo')) await p.click('#fbGo');
    await p.waitForFunction(() => window.SFF_ROLE, null, { timeout: 20000 }); await p.waitForTimeout(1500); return p; };
  const vis = (p, sel) => p.evaluate(s => !!document.querySelector(s), sel);
  // first sign-in: from the click on "I'm a parent" until the welcome screens, the app itself never shows (no flash)
  const c1 = await mk(); let p1;
  { const p = await c1.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
    await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForSelector('#fbGo', { timeout: 15000 });
    await p.evaluate(() => { window.__flash = 0; window.__seen = []; const t = setInterval(() => {
      const st = document.getElementById('fbLogin') ? 'login' : document.getElementById('onbWait') ? 'wait' : document.getElementById('onb') ? 'onb' : 'app';
      if (window.__seen[window.__seen.length - 1] !== st) window.__seen.push(st);
      if (st === 'onb') clearInterval(t); }, 30); });
    await p.click('#fbGo'); await p.waitForSelector('#onb', { timeout: 20000 }); await p.waitForTimeout(300);
    const seen = await p.evaluate(() => window.__seen);
    ok(!seen.includes('app'), 'no flash of the app before the welcome screens: ' + seen.join(' → '));
    p1 = p; await p.waitForFunction(() => window.SFF_ROLE, null, { timeout: 20000 }); await p.waitForTimeout(1200); }
  ok(await vis(p1, '#onb'), 'first sign-in: the welcome screens open');
  const imgs = [];
  for (let i = 0; i < 5; i++) {
    if (OUT) await p1.screenshot({ path: `${OUT}/onb_live_${i + 1}.png` });
    imgs.push(...await p1.evaluate(() => [...document.querySelectorAll('#onb img')].map(im => im.complete && im.naturalWidth > 0)));
    if (i < 4) await p1.click('#onb .btns .btn.big');
    await p1.waitForTimeout(400);
  }
  ok(imgs.length === 5 && imgs.every(Boolean), `the real app pictures load (${imgs.length})`);
  // every screen fits a small phone (390 × 667) without scrolling
  { const ph = await c1.newPage(); await ph.setViewportSize({ width: 390, height: 667 }); await ph.goto('http://localhost:8765/', { waitUntil: 'load' }); await ph.waitForTimeout(1500);
    const hs = []; for (let i = 0; i < 5; i++) { hs.push(await ph.evaluate(async i => { document.getElementById('fbLogin')?.remove(); ONB_I = i; onbShow();
      await Promise.all([...document.querySelectorAll('#onb img')].map(im => im.complete ? 0 : new Promise(r => { im.onload = im.onerror = r; })));
      return document.getElementById('onb').scrollHeight; }, i)); }
    ok(hs.every(h => h <= 667), 'every screen fits a small phone: ' + hs.join(', ')); await ph.close(); }
  ok(/הבנתי/.test(await p1.textContent('#onb .btns')), 'the last screen has "הבנתי" and "אחר כך"');
  await p1.click('#onb .btns .btn.ghost'); await p1.waitForTimeout(300);
  ok(!(await vis(p1, '#onb')), '"אחר כך" closes it');
  await p1.reload({ waitUntil: 'load' }); await p1.waitForFunction(() => window.SFF_ROLE, null, { timeout: 20000 }); await p1.waitForTimeout(1500);
  ok(!(await vis(p1, '#onb')), 'same visit (reload): not again');
  const p2 = await open(c1);
  ok(await vis(p2, '#onb'), '"אחר כך": the next time the app opens, it shows again');
  for (let i = 0; i < 4; i++) { await p2.click('#onb .btns .btn.big'); await p2.waitForTimeout(250); }
  await p2.click('#onb .btns .btn.big'); await p2.waitForTimeout(800);
  ok(await vis(p2, '#onbNote') && /מדריך למשתמש/.test(await p2.textContent('#onbNote')), '"הבנתי": a note that it is all in the user guide');
  if (OUT) await p2.screenshot({ path: `${OUT}/onb_live_note.png` });
  await p2.click('#onbNote .btn'); await p2.waitForTimeout(300);
  const saved = await p2.evaluate(async () => (await window.__sffRoot.get('users', window.SFF_UID))?.onb || 0);
  ok(saved > 0, '"הבנתי" is kept with the account');
  const c3 = await mk(), p3 = await open(c3);   // a new phone: empty storage
  ok(!(await vis(p3, '#onb')), 'after "הבנתי": never again, not on another phone either');
  const c4 = await mk('en'), p4 = await open(c4);
  ok(await vis(p4, '#onb') && /Welcome/.test(await p4.textContent('#onb')), 'English: translated');
  await p4.click('#onb .btns .btn.big'); await p4.waitForTimeout(400);
  const en = await p4.evaluate(() => ({ src: document.querySelector('#onb img')?.getAttribute('src'), heb: /[֐-׿]/.test(document.querySelector('#onb h1').textContent + document.querySelector('#onb p').textContent + document.querySelector('#onb .tip').textContent + document.querySelector('#onb .onbul').textContent) }));
  ok(en.src === '/onb/en-pick.webp' && !en.heb, 'English: English pictures and no Hebrew text ' + JSON.stringify(en));
  if (OUT) await p4.screenshot({ path: `${OUT}/onb_live_en.png` });
  ok(![p1, p2, p3, p4].some(p => p.errs.length), 'no page errors ' + JSON.stringify([p1, p2, p3, p4].flatMap(p => p.errs)));
  await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
