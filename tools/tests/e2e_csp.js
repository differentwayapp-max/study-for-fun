// No request to anyone the app does not need, on the emulators (functions, firestore, auth), with the app's headers ENFORCED
// (tools/serve.py serves firebase.json's "**" headers, the CSP enforced even while the site has it as Report-Only):
// 1. the headers are there (Referrer-Policy no-referrer, nosniff, Permissions-Policy, the CSP) and every page has
//    <meta name="referrer" content="no-referrer">;
// 2. no CSP violation on: the sign-in screen, the parent app (kids, the catalog, a set, the map, progress, family, the wizard),
//    a kid's phone, the teachers' app, the guide / terms / privacy / consent pages;
// 3. the fonts are the app's own (/fonts/…): Fredoka, Rubik and Varela Round load, nothing from Google Fonts; no wa.me link
//    without noreferrer.
const { chromium } = require('playwright');
const APP = 'http://localhost:8765/', EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' };
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) process.exitCode = 1; };
(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const viol = [], outside = [], errs = [];
  const ctx = async g => { const c = await b.newContext({ viewport: { width: 390, height: 844 } });
    await c.addInitScript(([E, g]) => { window.SFF_TEACH_LINKS = true; window.SFF_REST_EMU = E; if (g) window.SFF_TEST_GOOGLE = g; localStorage.setItem('sff_lang', 'he');
      document.addEventListener('securitypolicyviolation', e => (window.__csp = window.__csp || []).push(`${e.violatedDirective} ${e.blockedURI}`)); }, [EMU, g]);
    c.on('request', r => { const u = new URL(r.url()); if (!/^(localhost|127\.0\.0\.1)$/.test(u.hostname) && !/(^|\.)(gstatic\.com|googleapis\.com|cloudfunctions\.net|firebaseapp\.com)$/.test(u.hostname)) outside.push(u.hostname); });
    return c; };
  const watch = (p, tag) => { p.on('console', m => { if (/Content Security Policy|Refused to/i.test(m.text())) viol.push(`${tag}: ${m.text().slice(0, 160)}`); }); p.on('pageerror', e => errs.push(`${tag}: ${e.message}`)); };
  const grab = async (p, tag) => { const v = await p.evaluate(() => window.__csp || []); v.forEach(x => viol.push(`${tag}: ${x}`)); };

  console.log('1. the headers');
  const h = (await fetch(APP)).headers;
  ok(h.get('referrer-policy') === 'no-referrer' && h.get('x-content-type-options') === 'nosniff' && /camera=\(self\)/.test(h.get('permissions-policy') || '') && /default-src 'self'/.test(h.get('content-security-policy') || ''), 'Referrer-Policy, nosniff, Permissions-Policy, the CSP');
  const metas = []; for (const pg of ['', 'guide.html', 'terms.html', 'privacy.html', 'consent.html']) metas.push(/<meta name="referrer" content="no-referrer">/.test(await (await fetch(APP + pg)).text()));
  ok(metas.every(Boolean), 'every page has <meta name="referrer" content="no-referrer">');

  console.log('2. no CSP violation anywhere');
  const s = await ctx(), S = await s.newPage(); watch(S, 'sign-in'); await S.goto(APP, { waitUntil: 'load' }); await S.waitForSelector('#fbGo', { timeout: 20000 }); await S.waitForTimeout(800); await grab(S, 'sign-in');
  const pc = await ctx({ sub: 'cspP', email: 'cspp@t.local', email_verified: true, name: 'הורה' }), P = await pc.newPage(); watch(P, 'parent');
  await P.goto(APP, { waitUntil: 'load' }); await P.waitForTimeout(2000); if (await P.$('#fbGo')) await P.click('#fbGo');
  await P.waitForFunction(() => window.SFF_ROLE, null, { timeout: 25000 }); await P.waitForTimeout(1500);
  const sid = await P.evaluate(async () => { document.getElementById('intro')?.remove(); kids.push({ id: 'k1', name: 'נועה', grade: 3, color: '#FF5C8A' }); saveKids(); const s = applyImport(await loadShare('en3'), kidById('k1')).set; store.save(); return s.id; });
  for (const js of ["go('kids')", "openCatalog('k1')", `curSet=getSet('${sid}');renderReview(curSet);show('vReview')`, `openRoad('${sid}')`, "go('stats')", "go('family')", "openWizard('k1')", "openMenu()", "closeMenu&&closeMenu();go('kids')"]) { await P.evaluate(js); await P.waitForTimeout(500); }
  const fonts = await P.evaluate(async () => { await document.fonts.ready;
    return { loaded: [...document.fonts].filter(x => x.status === 'loaded').map(x => x.family.replace(/"/g, '')),
      files: performance.getEntriesByType('resource').map(e => e.name).filter(n => /\.woff2/.test(n)).map(n => new URL(n).pathname) }; });
  const link = await P.evaluate(() => window.__sffFamily.kidLink('k1'));
  const wa = await P.evaluate(() => { openKidLink('k1'); return [...document.querySelectorAll('a[href*="wa.me"]')].filter(a => !/noreferrer/.test(a.rel)).length; });
  await grab(P, 'parent');
  const kc = await ctx(), K = await kc.newPage(); watch(K, 'kid'); await K.goto(link, { waitUntil: 'load' }); await K.waitForTimeout(6000); await grab(K, 'kid');
  const tc = await ctx({ sub: 'cspT', email: 'cspt@t.local', email_verified: true, name: 'מורה' }), T = await tc.newPage(); watch(T, 'teacher');
  await T.goto(APP + 'teach', { waitUntil: 'load' }); await T.waitForSelector('#fbGo'); await T.click('#fbGo'); await T.waitForSelector('#tsClass'); await T.click('#tsClass');
  await T.fill('#tsName', "ג'1"); await T.click('#tsGo'); await T.waitForFunction(() => window.SFF_KIND === 'class', null, { timeout: 25000 }); await T.waitForTimeout(1500);
  for (const js of ["go('kids')", "thTab('stud')", "thTab('asg')", "go('stats')", "go('family')"]) { await T.evaluate(js); await T.waitForTimeout(500); }
  await grab(T, 'teacher');
  const dc = await ctx(); for (const pg of ['guide.html', 'terms.html', 'privacy.html', 'consent.html']) { const D = await dc.newPage(); watch(D, pg); await D.goto(APP + pg, { waitUntil: 'load' }); await D.waitForTimeout(600); await grab(D, pg); await D.close(); }
  ok(!viol.length, 'no CSP violation: the sign-in, the parent app (7 screens + ☰), a kid phone, the teachers\' app (5 screens), 4 document pages' + (viol.length ? '\n    ' + [...new Set(viol)].slice(0, 10).join('\n    ') : ''));

  console.log('3. the fonts, the links');
  ok(['Fredoka', 'Rubik', 'Varela Round'].every(n => fonts.loaded.includes(n)) && fonts.files.length >= 3 && fonts.files.every(f => f.startsWith('/fonts/')) && ['fredoka', 'rubik', 'varela-round'].every(n => fonts.files.some(f => f.includes(n + '-hebrew'))),
    'Fredoka, Rubik, Varela Round load from the app itself (' + fonts.files.length + ' files, all /fonts/…, Hebrew included)');
  ok(!outside.length, 'no request outside Firebase / Google sign-in (no Google Fonts): ' + ([...new Set(outside)].join(', ') || 'none'));
  ok(wa === 0, 'every WhatsApp link has rel="noopener noreferrer"');
  ok(!errs.length, 'no page errors ' + JSON.stringify(errs.slice(0, 3)));
  await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
