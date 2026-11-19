// Parent sign-in with an email link (no Google, no password): the sign-in screen sends a link, the link signs the parent in
// and the app opens as a parent (own family, the terms approval kept). An email+password account whose address was never
// verified is NOT a parent (the rules refuse it). Run inside the emulators (firestore, auth). OUT=dir for screenshots.
const { chromium } = require('playwright');
const OUT = process.env.OUT || require('os').tmpdir();   // screenshots never land in the repo
const AUTH = 'http://127.0.0.1:9099', PROJ = 'study-for-fun-7b03c';
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) process.exitCode = 1; };
(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await ctx.addInitScript(() => { window.SFF_REST_EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' }; localStorage.setItem('sff_lang', 'he'); });
  await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForSelector('#fbGo', { timeout: 15000 });
  await p.click('#fbEmailBtn'); await p.fill('#fbEmailIn', 'mom.mail@t.local');
  await p.click('#fbEmailGo'); await p.waitForTimeout(400);
  ok(/סמנו שקראתם/.test(await p.textContent('#fbErr')), 'without the terms tick: no link is sent');
  await p.click('#fbAgree'); await p.click('#fbEmailGo'); await p.waitForTimeout(2500);
  const sent = await p.textContent('#fbEmail');
  ok(/שלחנו קישור/.test(sent), 'the screen says the link was sent');
  if (OUT) await p.screenshot({ path: `${OUT}/email_sent.png` });
  const codes = await (await fetch(`${AUTH}/emulator/v1/projects/${PROJ}/oobCodes`)).json();
  const c = (codes.oobCodes || []).reverse().find(x => x.email === 'mom.mail@t.local' && x.requestType === 'EMAIL_SIGNIN');
  ok(!!c, 'Firebase sent the sign-in email');
  const u = new URL(c.oobLink), link = `http://localhost:8765/?mail=1&mode=signIn&oobCode=${u.searchParams.get('oobCode')}&apiKey=${u.searchParams.get('apiKey')}&lang=he`;
  await p.goto(link, { waitUntil: 'load' }); await p.waitForFunction(() => window.SFF_ROLE, null, { timeout: 25000 }); await p.waitForTimeout(1500);
  const st = await p.evaluate(async () => ({ role: window.SFF_ROLE, email: window.SFF_EMAIL, url: location.href, terms: (await window.__sffRoot.get('users', window.SFF_UID))?.terms || null,
    write: await window.__sffRoot.set('users', window.SFF_UID, { probe: 1 }).then(() => 'ok', e => 'denied') }));
  console.log(JSON.stringify(st));
  ok(st.role === 'owner' && st.email === 'mom.mail@t.local', 'the link signs the parent in, with their own family');
  ok(!/oobCode/.test(st.url), 'the one-time link is removed from the address bar');
  ok(st.terms && st.terms.v, 'the terms approval is kept with the account');
  ok(st.write === 'ok', 'the parent can save');
  // an email+password account that never verified its address is not a parent
  const su = await (await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'nobody@t.local', password: 'secret123', returnSecureToken: true }) })).json();
  const r = await fetch(`http://127.0.0.1:8080/v1/projects/${PROJ}/databases/(default)/documents/users/${su.localId}`, { method: 'PATCH',
    headers: { Authorization: 'Bearer ' + su.idToken, 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: { x: { integerValue: '1' } } }) });
  ok(r.status === 403, 'an unverified email+password account is refused (' + r.status + ')');
  ok(!errs.length, 'no page errors ' + JSON.stringify(errs));
  await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
