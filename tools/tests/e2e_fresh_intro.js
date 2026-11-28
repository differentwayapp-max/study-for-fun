// The explanation screens after every sign-in (the owner's decision, 24.11), on the emulators (firestore, auth, functions):
// a parent, a class teacher (/teach) and a private tutor each: sign in → their screens; close; open again → none;
// sign out and in again → their screens once more. A kid phone is not touched (its own first-time rule).
// Serve with `python3 tools/serve.py 8765`. OUT=dir for screenshots.
const { chromium } = require('playwright');
const APP = 'http://localhost:8765/', OUT = process.env.OUT || require('os').tmpdir();
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) process.exitCode = 1; };
(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const errs = [];
  const ctx = async (who, name) => { const c = await b.newContext({ viewport: { width: 390, height: 844 } });
    await c.addInitScript(g => { window.SFF_TEACH_LINKS = true; window.SFF_REST_EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' }; window.SFF_TEST_GOOGLE = g; window.SFF_TEST_ONB = true; localStorage.setItem('sff_lang', 'he'); },
      { sub: who, email: who + '@test.local', email_verified: true, name }); return c; };
  const page = async (c, url) => { const p = await c.newPage(); p.on('pageerror', e => errs.push(e.message)); await p.goto(url, { waitUntil: 'load' }); return p; };
  const intro = async (p, ms = 15000) => { await p.waitForSelector('#intro', { timeout: ms }).catch(() => {});
    return p.evaluate(() => { const el = document.getElementById('intro'); return el ? { key: el.dataset.key, n: el.querySelectorAll('.idots i').length || 1 } : null; }); };
  const close = async p => { await p.click('#intro .iskip').catch(() => p.evaluate(() => document.getElementById('intro')?.remove())); await p.waitForTimeout(800); };
  const signIn = async p => { await p.waitForSelector('#fbGo', { timeout: 20000 }); await p.click('#fbGo'); };
  const signOut = async p => { await p.evaluate(() => document.getElementById('fbOut').click()); await p.waitForSelector('#sureYes:visible', { timeout: 5000 }); await p.click('#sureYes');
    await p.waitForSelector('#fbLogin #fbGo', { timeout: 20000 }); };
  const reopen = async (c, url, cond) => { const p = await page(c, url); await p.waitForFunction(cond || (() => window.SFF_ROLE), null, { timeout: 25000 }); await p.waitForTimeout(4000); return p; };

  console.log('1. a parent');
  const oc = await ctx('freshP', 'טליה'); let P = await page(oc, APP);
  await signIn(P); let s = await intro(P);
  ok(s && s.key === 'main', 'signed in: the parent\'s screens (' + (s && s.key) + ')');
  await close(P);
  await P.evaluate(async () => { kids.push({ id: 'k1', name: 'נועה', grade: 6, color: '#FF5C8A' }, { id: 'k2', name: 'בן', grade: 5, color: '#2F6BFF' }); saveKids(); applyImport(await loadShare('en7-nov26'), kidById('k2')); });
  await P.waitForTimeout(3000);
  const inv = await P.evaluate(() => window.__sffFamily.invite('tutor', 'דנה', ['k2']));
  await P.close();
  P = await reopen(oc, APP);
  ok(!(await P.$('#intro')), 'the app opened again (still signed in): no screens');
  await signOut(P); await signIn(P); s = await intro(P);
  ok(s && s.key === 'main', 'signed out and in again: the parent\'s screens once more');
  await P.screenshot({ path: `${OUT}/fresh_parent.png` });
  await close(P);
  await P.reload({ waitUntil: 'load' }); await P.waitForFunction(() => window.SFF_ROLE, null, { timeout: 25000 }); await P.waitForTimeout(4000);
  ok(!(await P.$('#intro')), '…and only once: a reload after it shows none');

  console.log('2. a class teacher (/teach)');
  const tc = await ctx('freshT', 'רונית'); let T = await page(tc, APP + 'teach');
  await signIn(T); await T.waitForSelector('#tsClass', { timeout: 20000 }); await T.click('#tsClass');
  s = await intro(T); ok(s && /^s/.test(s.key), 'a new teacher: the teacher\'s screens before the first group (' + (s && s.key) + ')');
  await close(T); await T.waitForSelector('#tsName', { timeout: 10000 }).catch(() => {});
  if (await T.$('#tsName')) { await T.fill('#tsName', "ו'2 – חשבון"); await T.click('#tsGo'); }
  await T.waitForFunction(() => window.SFF_KIND === 'class' && window.SFF_ROLE, null, { timeout: 25000 }); await T.waitForTimeout(4000);
  ok(!(await T.$('#intro')), 'the group opens: the screens are not shown twice');
  await signOut(T); await signIn(T); await T.waitForFunction(() => window.SFF_KIND === 'class' && window.SFF_ROLE, null, { timeout: 25000 });
  s = await intro(T);
  ok(s && /^s/.test(s.key) && s.n > 1, 'signed out and in again: the class teacher\'s screens (' + (s && s.key) + ', ' + (s && s.n) + ' screens)');
  await T.screenshot({ path: `${OUT}/fresh_teacher.png` });
  await close(T); await T.close();
  T = await reopen(tc, APP + 'teach', () => window.SFF_KIND === 'class' && window.SFF_ROLE);
  ok(!(await T.$('#intro')), 'opened again (still signed in): none');

  console.log('3. a private tutor (invited by the parent)');
  const uc = await ctx('freshU', 'דנה המורה'); let U = await page(uc, inv);
  await signIn(U); await U.waitForFunction(() => window.SFF_ROLE === 'tutor', null, { timeout: 25000 });
  s = await intro(U, 20000); ok(s && /^t/.test(s.key), 'invited: the tutor\'s screens (' + (s && s.key) + ')');
  await close(U); await U.close();
  U = await reopen(uc, APP + 'teach', () => window.SFF_ROLE === 'tutor');
  ok(!(await U.$('#intro')), 'opened again: none');
  await signOut(U); await signIn(U); await U.waitForFunction(() => window.SFF_ROLE === 'tutor', null, { timeout: 25000 });
  s = await intro(U, 20000);
  ok(s && /^t/.test(s.key) && s.n === 5, 'signed out and in again: the tutor\'s 5 screens (' + (s && s.key) + ')');
  await U.screenshot({ path: `${OUT}/fresh_tutor.png` });

  ok(!errs.length, 'no page errors ' + errs.slice(0, 3).join(' | '));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
