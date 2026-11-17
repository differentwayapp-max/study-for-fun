// Server log red dot: an app admin sees a red dot on ☰ (and next to "יומן שרת") when the server log has a new entry;
// opening the log clears it, and it stays cleared after a reload. A regular parent never sees it and cannot read the log.
// Run inside the emulators (firestore, auth). OUT=dir for screenshots.
const { chromium } = require('playwright');
const OUT = process.env.OUT || require('os').tmpdir();   // screenshots never land in the repo
const DOCS = 'http://127.0.0.1:8080/v1/projects/study-for-fun-7b03c/databases/(default)/documents';
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) process.exitCode = 1; };
(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const addLog = msg => fetch(`${DOCS}/serverLog`, { method: 'POST', headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: { at: { integerValue: String(Date.now()) }, fn: { stringValue: 'ask' }, kind: { stringValue: 'error' }, code: { stringValue: 'internal' }, msg: { stringValue: msg }, ms: { integerValue: '5' } } }) });
  const ctx = await b.newContext({ viewport: { width: 360, height: 760 }, deviceScaleFactor: 2 });
  const open = async (c, sub, email) => { const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await c.addInitScript(g => { window.SFF_REST_EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' }; window.SFF_TEST_GOOGLE = g; localStorage.setItem('sff_lang', 'he'); }, { sub, email, email_verified: true, name: 'טליה' });
    await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(2500); if (await p.$('#fbGo')) await p.click('#fbGo');
    await p.waitForFunction(() => window.SFF_ROLE, null, { timeout: 20000 }); await p.waitForTimeout(2500); p.errs = errs; return p; };
  const dot = p => p.evaluate(() => document.getElementById('menuBtn').classList.contains('dot'));
  await addLog('test error 1');
  const adm = await open(ctx, 'talia', 'differentway.app@gmail.com');
  ok(await dot(adm), 'admin: a new server log entry → red dot on ☰');
  if (OUT) await adm.screenshot({ path: `${OUT}/slog_dot.png` });
  await adm.click('#menuBtn'); await adm.waitForTimeout(400);
  ok(await adm.isVisible('#slDot'), 'admin: red dot next to "יומן שרת" in the menu');
  if (OUT) await adm.screenshot({ path: `${OUT}/slog_menu.png` });
  await adm.click('text=יומן שרת'); await adm.waitForTimeout(1200);
  ok(/test error 1/.test(await adm.textContent('#moreDlg')), 'the log shows the entry');
  ok(!(await dot(adm)), 'opening the log clears the dot');
  await adm.reload({ waitUntil: 'load' }); await adm.waitForFunction(() => window.SFF_ROLE, null, { timeout: 20000 }); await adm.waitForTimeout(2500);
  ok(!(await dot(adm)), 'after a reload: still no dot (nothing new)');
  await addLog('test error 2');
  await adm.evaluate(() => checkServerLog()); await adm.waitForTimeout(800);
  ok(await dot(adm), 'another new entry → the dot is back');
  const par = await open(await b.newContext({ viewport: { width: 360, height: 760 } }), 'dana2', 'dana2@t.local');
  ok(!(await dot(par)), 'a regular parent: no dot');
  const read = await par.evaluate(async () => { try { await window.__sffRoot.newest('serverLog', 'at'); return 'read allowed'; } catch (e) { return 'denied'; } });
  ok(read === 'denied', 'a regular parent cannot read the server log');
  ok(!adm.errs.length && !par.errs.length, 'no page errors ' + JSON.stringify([...adm.errs, ...par.errs]));
  await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
