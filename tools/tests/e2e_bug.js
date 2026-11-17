// Bug / idea report: the side-menu window saves the report (rules: any signed-in user creates their own, only app admins read).
// adminConfig (where reports are emailed) is closed to anyone who is not an app admin. Run inside the emulators (firestore, auth). OUT=dir for a screenshot.
const { chromium } = require('playwright');
const OUT = process.env.OUT || require('os').tmpdir();   // screenshots never land in the repo
(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await ctx.addInitScript(() => { window.SFF_REST_EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' };
    window.SFF_TEST_GOOGLE = { sub: 'bug1', email: 'bug@t.local', email_verified: true, name: 'הורה' }; localStorage.setItem('sff_lang', 'he'); });
  await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(2500); if (await p.$('#fbGo')) await p.click('#fbGo');
  await p.waitForFunction(() => window.SFF_ROLE, null, { timeout: 20000 }); await p.waitForTimeout(1500);
  await p.click('#menuBtn'); await p.waitForTimeout(300); await p.click('text=דיווח על תקלה או רעיון'); await p.waitForTimeout(300);
  await p.click('#bugBody .wtabs button >> nth=1');
  await p.fill('#bugText', 'רעיון לבדיקה: כפתור גדול יותר');
  if (OUT) await p.screenshot({ path: `${OUT}/bug.png` });
  await p.click('#bugBody .btn.big'); await p.waitForTimeout(1500);
  const msg = await p.textContent('#bugMsg');
  const read = await p.evaluate(async () => { try { await window.__sffRoot.list('bugReports'); return 'read allowed'; } catch (e) { return 'denied'; } });
  const cfgW = await p.evaluate(async () => { try { await window.__sffRoot.set('adminConfig', 'main', { reportMail: 'x@y.zz' }); return 'write allowed'; } catch (e) { return 'denied'; } });
  const cfgR = await p.evaluate(async () => { try { await window.__sffRoot.get('adminConfig', 'main'); return 'read allowed'; } catch (e) { return 'denied'; } });
  console.log(JSON.stringify({ msg, read, cfgW, cfgR, errs }));
  if (!/נשלח/.test(msg) || read !== 'denied' || cfgW !== 'denied' || cfgR !== 'denied') errs.push('bug report / admin settings');
  console.log(JSON.stringify({ errs })); await b.close(); process.exit(errs.length ? 1 : 0);
})().catch(e => { console.error('FAIL', e); process.exit(1); });
