// Terms of use + user guide: the pages open in Hebrew and English (no sideways scroll, the contents links work),
// the side menu links to both, the sign-in box blocks "I'm a parent" until ticked, and the consent is kept with the account.
// Run inside the emulators (firestore, auth). OUT=dir for screenshots.
const { chromium } = require('playwright');
const OUT = process.env.OUT;
(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const errs = [], ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) errs.push(m); };
  // 1. the pages
  for (const page of ['guide', 'terms']) for (const lang of ['he', 'en']) {
    const p = await (await b.newContext({ viewport: { width: 360, height: 740 }, deviceScaleFactor: 2 })).newPage();
    p.on('pageerror', e => errs.push(e.message));
    await p.goto(`http://localhost:8765/${page}.html?lang=${lang}`, { waitUntil: 'load' }); await p.waitForTimeout(400);
    const r = await p.evaluate(() => ({ lang: document.documentElement.lang, dir: document.documentElement.dir, wide: document.documentElement.scrollWidth > innerWidth + 1,
      h1: [...document.querySelectorAll('.card')].find(c => getComputedStyle(c).display !== 'none')?.querySelector('h1')?.textContent, toc: document.querySelectorAll('.card[data-l="' + document.documentElement.lang + '"] .toc a').length }));
    ok(r.lang === lang && r.dir === (lang === 'he' ? 'rtl' : 'ltr') && !r.wide && r.h1, `${page}.html?lang=${lang}: "${r.h1}", no sideways scroll`);
    if (OUT) await p.screenshot({ path: `${OUT}/${page}_${lang}.png` });
    if (page === 'guide') {
      ok(r.toc >= 10, `guide contents: ${r.toc} links`);
      await p.click(`.card[data-l="${lang}"] .toc a >> nth=4`); await p.waitForTimeout(700);
      const top = await p.evaluate(l => document.querySelector(`.card[data-l="${l}"] h2:nth-of-type(5)`).getBoundingClientRect().top, lang);
      ok(top >= 0 && top < 200, 'a contents link jumps to its chapter');
    }
    await p.close();
  }
  // 2. the sign-in box (a real sign-in screen: no fake Google account → the box starts unticked)
  {
    const ctx = await b.newContext({ viewport: { width: 360, height: 740 }, deviceScaleFactor: 2 }); const p = await ctx.newPage();
    await ctx.addInitScript(() => { window.SFF_REST_EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' }; localStorage.setItem('sff_lang', 'he'); });
    let popup = false; ctx.on('page', () => { popup = true; });
    await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForSelector('#fbGo', { timeout: 15000 });
    ok(!(await p.isChecked('#fbAgree')), 'the consent box starts unticked');
    await p.click('#fbGo'); await p.waitForTimeout(600);
    const msg = await p.textContent('#fbErr');
    ok(/סמנו שקראתם/.test(msg) && !popup && !!(await p.$('#fbLogin')), '"I\'m a parent" without the tick: a message, no Google sign-in');
    if (OUT) await p.screenshot({ path: `${OUT}/terms_signin.png` });
    await ctx.close();
  }
  // 3. a parent who ticked and signed in: the consent is kept with the account; the menu has both links
  {
    const ctx = await b.newContext({ viewport: { width: 360, height: 740 } }); const p = await ctx.newPage();
    await ctx.addInitScript(() => { window.SFF_REST_EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' };
      window.SFF_TEST_GOOGLE = { sub: 'terms1', email: 'terms@t.local', email_verified: true, name: 'הורה' }; localStorage.setItem('sff_lang', 'he'); });
    await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(2500); if (await p.$('#fbGo')) await p.click('#fbGo');
    await p.waitForFunction(() => window.SFF_ROLE, null, { timeout: 20000 }); await p.waitForTimeout(2000);
    const t = await p.evaluate(async () => (await window.__sffRoot.get('users', window.SFF_UID))?.terms || null);
    ok(t && t.v === '2026-11-17' && t.at > 0, 'consent kept with the account: ' + JSON.stringify(t));
    // 4. a parent who signed in before the terms existed: one-time approval when the app opens
    await p.evaluate(async () => { localStorage.removeItem('sff_terms_ok'); await window.__sffRoot.set('users', window.SFF_UID, { terms: { v: 'old', at: 1 } }); });
    await ctx.addInitScript(() => { window.SFF_TEST_ASK_CONSENT = 1; });
    await p.reload({ waitUntil: 'load' }); await p.waitForSelector('#fbOk', { timeout: 20000 });
    await p.click('#fbOk'); await p.waitForTimeout(300);
    ok(!!(await p.$('#fbOk')) && /סמנו שקראתם/.test(await p.textContent('#fbErr')), 'already signed in: the app waits for the approval');
    if (OUT) await p.screenshot({ path: `${OUT}/terms_consent.png` });
    await p.click('#fbAgree'); await p.click('#fbOk');
    await p.waitForFunction(() => window.SFF_ROLE, null, { timeout: 20000 }); await p.waitForTimeout(1500);
    const t2 = await p.evaluate(async () => (await window.__sffRoot.get('users', window.SFF_UID))?.terms || null);
    ok(t2 && t2.v === '2026-11-17', 'approval kept with the account: ' + JSON.stringify(t2));
    await p.click('#menuBtn'); await p.waitForTimeout(300);
    const links = await p.evaluate(() => [...document.querySelectorAll('#sideMenu a.ditem')].map(a => a.getAttribute('href')));
    ok(links.includes('/guide.html') && links.includes('/terms.html'), 'side menu: ' + links.join(', '));
    await ctx.close();
  }
  console.log(JSON.stringify({ errs })); await b.close(); process.exit(errs.length ? 1 : 0);
})().catch(e => { console.error('FAIL', e); process.exit(1); });
