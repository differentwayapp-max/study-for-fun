// Admin "registered users" screen (emulators incl. functions): admins see accounts only; others are refused.
const { chromium } = require('playwright');
const OUT = process.env.OUT; const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) process.exitCode = 1; };
(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const open = async (sub, email, name, url = 'http://localhost:8765/') => { const p = await (await b.newContext({ viewport: { width: 360, height: 760 }, deviceScaleFactor: 2 })).newPage();
    await p.addInitScript(g => { window.SFF_REST_EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' }; window.SFF_TEST_GOOGLE = g; localStorage.setItem('sff_lang', 'he'); }, { sub, email, email_verified: true, name });
    await p.goto(url, { waitUntil: 'load' }); await p.waitForTimeout(2500); if (await p.$('#fbGo')) await p.click('#fbGo');
    await p.waitForFunction(() => window.SFF_ROLE, null, { timeout: 20000 }); await p.waitForTimeout(1500); return p; };
  const fam = await open('dana', 'dana@t.local', 'דנה כהן');
  await fam.evaluate(() => { kids.push({ id: 'k1', name: 'יואב', grade: 3, color: '#2F6BFF' }); saveKids(); }); await fam.waitForTimeout(1500);
  const link = await fam.evaluate(() => window.__sffFamily.kidLink('k1'));
  const kid = await (await b.newContext()).newPage(); await kid.addInitScript(() => { window.SFF_REST_EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' }; }); await kid.goto(link); await kid.waitForTimeout(6000);
  const denied = await fam.evaluate(async () => { try { await window.__sffAdminUsers(); return 'allowed'; } catch (e) { return String(e.code || e.message); } });
  ok(/permission/.test(denied), 'a regular parent is refused (' + denied + ')');
  const adm = await open('talia', 'differentway.app@gmail.com', 'טליה');
  await adm.click('#menuBtn'); await adm.waitForTimeout(300); await adm.click('text=משתמשים רשומים'); await adm.waitForTimeout(2500);
  const rows = await adm.evaluate(() => [...document.querySelectorAll('.utab tbody tr')].map(r => r.innerText.replace(/\s+/g, ' ')));
  const stats = await adm.evaluate(() => document.getElementById('uStats').innerText.replace(/\s+/g, ' '));
  ok(rows.length === 2 && rows.some(r => r.includes('dana@t.local')), 'admin sees the 2 parent accounts');
  ok(/1 טלפונים של ילדים/.test(stats), 'kid phones are counted, not listed: ' + stats);
  ok(!(await adm.evaluate(() => document.getElementById('vUsers').innerText)).includes('יואב'), 'no kid names on the screen');
  await adm.screenshot({ path: OUT + '/users.png' }); await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
