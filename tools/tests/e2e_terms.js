// Terms of use + user guide: the pages open in Hebrew and English (no sideways scroll, the contents links work),
// the side menu links to both. The terms + the privacy policy are approved ONCE per adult, after the sign-in (no tick box on
// the sign-in screen); the server keeps the record (users/{uid}.terms + a line in consentLog per approval – versions, when);
// the phone cannot write it; a new terms version asks once more. Run inside the emulators (functions, firestore, auth).
const SRC = require('fs').readFileSync(__dirname + '/../../public/index.html', 'utf8');
const TV = (SRC.match(/const TERMS_VERSION = '([^']+)'/) || [])[1], PV = (SRC.match(/const PRIVACY_VERSION = '([^']+)'/) || [])[1];   // the current versions
const { chromium } = require('playwright');
const OUT = process.env.OUT || require('os').tmpdir();   // screenshots never land in the repo
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
  // 2. the sign-in screen: no tick box (the approval comes once, after the sign-in) – "I'm a parent" goes straight to Google
  {
    const ctx = await b.newContext({ viewport: { width: 360, height: 740 }, deviceScaleFactor: 2 }); const p = await ctx.newPage();
    await ctx.addInitScript(() => { window.SFF_REST_EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' }; localStorage.setItem('sff_lang', 'he'); });
    let popup = false; ctx.on('page', () => { popup = true; });
    await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForSelector('#fbGo', { timeout: 15000 });
    const line = await p.evaluate(() => { const l = document.querySelector('.fbtermsl'); return l ? { t: l.textContent, links: [...l.querySelectorAll('a')].map(a => a.getAttribute('href')) } : null; });
    ok(!(await p.$('#fbAgree')) && line && /פעם אחת/.test(line.t) && line.links.join() === '/terms.html,/privacy.html', 'the sign-in screen: no tick box, a line with both links (' + (line && line.t) + ')');
    if (OUT) await p.screenshot({ path: `${OUT}/terms_signin.png` });
    await p.click('#fbGo'); await p.waitForTimeout(1500);
    const err = await p.textContent('#fbErr').catch(() => '');
    ok(popup || /auth\//.test(err), '"I\'m a parent" carries on to Google with no tick (' + (popup ? 'popup' : err) + ')');   // the emulator cannot open a real Google window
    await ctx.close();
  }
  // 3. a new parent: approves once, after the sign-in; the server keeps which versions and when; the next sign-in asks nothing
  {
    const ctx = await b.newContext({ viewport: { width: 360, height: 740 } }); const p = await ctx.newPage();
    await ctx.addInitScript(() => { window.SFF_REST_EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' }; window.SFF_TEST_ASK_CONSENT = 1;
      window.SFF_TEST_GOOGLE = { sub: 'terms1', email: 'terms@t.local', email_verified: true, name: 'הורה' }; localStorage.setItem('sff_lang', 'he'); });
    await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(2500); if (await p.$('#fbGo')) await p.click('#fbGo');
    await p.waitForSelector('#fbOk', { timeout: 20000 });
    ok(/פעם אחת בלבד/.test(await p.textContent('#fbLogin')), 'a new adult: "approve the terms and the privacy policy – just once"');
    await p.click('#fbOk'); await p.waitForTimeout(300);
    ok(!!(await p.$('#fbOk')) && /סמנו שקראתם/.test(await p.textContent('#fbErr')), 'with no tick: the app waits for the approval');
    if (OUT) await p.screenshot({ path: `${OUT}/terms_consent.png` });
    const t0 = Date.now(); await p.click('#fbAgree'); await p.click('#fbOk');
    await p.waitForFunction(() => window.SFF_ROLE, null, { timeout: 20000 }); await p.waitForTimeout(1500);
    const rec = () => p.evaluate(async () => ({ terms: (await window.__sffRoot.get('users', window.SFF_UID))?.terms || null, log: (await window.__sffRoot.list(`users/${window.SFF_UID}/consentLog`)).sort((a, b) => a.at - b.at) }));
    let r = await rec();
    ok(r.terms && r.terms.v === TV && r.terms.privacy === PV && r.terms.at >= t0 - 5000, 'the account keeps the versions approved and when: ' + JSON.stringify(r.terms));
    ok(r.log.length === 1 && r.log[0].terms === TV && r.log[0].privacy === PV && r.log[0].app === 'family' && r.log[0].provider === 'google.com' && r.log[0].at >= t0 - 5000, 'one line in the approvals log: ' + JSON.stringify(r.log[0]));
    // the next time: nothing is asked (the box would show – SFF_TEST_ASK_CONSENT), and nothing is added
    await p.reload({ waitUntil: 'load' }); await p.waitForFunction(() => window.SFF_ROLE, null, { timeout: 20000 }); await p.waitForTimeout(1200);
    r = await rec();
    ok(!(await p.$('#fbOk')) && r.log.length === 1, 'opening the app again: not asked again, still one line');
    // the phone cannot write the record itself
    const forge = await p.evaluate(async () => [await window.__sffRoot.set('users', window.SFF_UID, { terms: { v: '2099-01-01', at: 1 } }).then(() => 'ok', () => 'denied'),
      await window.__sffRoot.add(`users/${window.SFF_UID}/consentLog`, { terms: '2099-01-01', at: 1 }).then(() => 'ok', () => 'denied')]);
    ok(forge.join() === 'denied,denied', 'the phone cannot change the record or add to the log: ' + forge.join());
    // the terms change (a new version): asked once more, a second line
    await fetch(`http://127.0.0.1:8080/v1/projects/study-for-fun-7b03c/databases/(default)/documents/users/${await p.evaluate(() => window.SFF_UID)}?updateMask.fieldPaths=terms`, { method: 'PATCH',
      headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: { terms: { mapValue: { fields: { v: { stringValue: '2026-01-01' } } } } } }) });
    await p.reload({ waitUntil: 'load' }); await p.waitForSelector('#fbOk', { timeout: 20000 });
    ok(/עדכנו את תנאי השימוש/.test(await p.textContent('#fbLogin')), 'a new version of the terms: "we updated the terms…", asked once more');
    await p.click('#fbAgree'); await p.click('#fbOk'); await p.waitForFunction(() => window.SFF_ROLE, null, { timeout: 20000 }); await p.waitForTimeout(1500);
    r = await rec();
    ok(r.log.length === 2 && r.terms.v === TV, 'a second line in the log, the account on the new version');
    await p.click('#menuBtn'); await p.waitForTimeout(300);
    const links = await p.evaluate(() => [...document.querySelectorAll('#sideMenu a.ditem')].map(a => a.getAttribute('href')));
    ok(links.includes('/guide.html') && links.includes('/terms.html'), 'side menu: ' + links.join(', '));
    await ctx.close();
  }
  console.log(JSON.stringify({ errs })); await b.close(); process.exit(errs.length ? 1 : 0);
})().catch(e => { console.error('FAIL', e); process.exit(1); });
