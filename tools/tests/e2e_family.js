// End-to-end on local Firebase emulators (real security rules): a family with several adults.
// Run:  firebase emulators:exec --only firestore,auth --project study-for-fun-7b03c "node tools/tests/e2e_family.js"
// (the app must be served on http://localhost:8765 – e.g. python3 -m http.server 8765 --directory public)
const { chromium } = require('playwright');
const APP = 'http://localhost:8765/';
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) process.exitCode = 1; };
(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const errs = [];
  const open = async (who, url = APP) => {
    const c = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); const p = await c.newPage();
    p.on('pageerror', e => errs.push(who + ': ' + e.message));
    await p.addInitScript(g => { window.SFF_REST_EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' }; window.SFF_TEST_GOOGLE = g; localStorage.setItem('sff_lang', 'he'); },
      { sub: who, email: who + '@test.local', email_verified: true, name: { owner: 'טליה', grandma: 'סבתא רותי', tutor: 'דנה המורה', stranger: 'זר' }[who] });
    await p.goto(url, { waitUntil: 'load' }); await p.waitForTimeout(2500);
    if (await p.$('#fbGo')) { await p.click('#fbGo'); }
    await p.waitForFunction(() => window.SFF_ROLE, null, { timeout: 20000 }); await p.waitForTimeout(1500);
    return { c, p };
  };

  console.log('1. the parent starts a family: 2 kids + the English practice set');
  const O = await open('owner');
  ok(await O.p.evaluate(() => window.SFF_ROLE) === 'owner', 'role: owner');
  await O.p.evaluate(async () => {
    kids.push({ id: 'k1', name: 'נועה', grade: 6, color: '#FF5C8A' }, { id: 'k2', name: 'בן', grade: 6, color: '#2F6BFF' }); saveKids();
    const pl = await loadShare('en7-nov26'); applyImport(pl, kidById('k2'));
  });
  await O.p.waitForTimeout(3000);
  const inv1 = await O.p.evaluate(() => window.__sffFamily.invite('helper', 'סבתא רותי', []));
  const inv2 = await O.p.evaluate(() => window.__sffFamily.invite('tutor', 'דנה', ['k2']));
  const ownerUid = await O.p.evaluate(() => window.SFF_UID);
  ok(new RegExp('\\?invite=' + ownerUid + '\\.[0-9a-f]+$').test(inv1), 'invitation link: ' + inv1.replace(APP, '/'));
  await O.p.evaluate(() => go('family')); await O.p.waitForTimeout(800);
  await O.p.screenshot({ path: '/tmp/claude-0/-home-user/f1f58124-ffdc-5396-a49f-3c76f54353ce/scratchpad/fam_owner.png', fullPage: true });

  console.log('2. grandma opens her invitation (helper)');
  const G = await open('grandma', inv1);
  ok(await G.p.evaluate(() => window.SFF_ROLE) === 'helper', 'role: helper');
  ok(await G.p.evaluate(() => window.__sffFamily.famId) === ownerUid, 'active family: the parent\'s');
  await G.p.waitForTimeout(2000);
  ok(await G.p.evaluate(() => kids.length) === 2, 'sees both kids');
  ok(await G.p.evaluate(() => sets.filter(s => !s.demo).length) === 1, 'sees the practice set');
  const denied = await G.p.evaluate(async () => { try { const db = await window.claude.use('db'); await db.doc('fam/kids').set({ list: [] }); return 'written'; } catch (e) { return String(e.code || e.message); } });
  ok(/permission/.test(denied), 'cannot change the kids list (' + denied + ')');
  ok(await G.p.evaluate(() => !document.querySelector('[aria-label="עריכה"]')), 'no edit button for a helper');
  await G.p.evaluate(() => go('family')); await G.p.waitForTimeout(800);
  await G.p.screenshot({ path: '/tmp/claude-0/-home-user/f1f58124-ffdc-5396-a49f-3c76f54353ce/scratchpad/fam_grandma.png', fullPage: true });

  console.log('3. the tutor (only Ben)');
  const T = await open('tutor', inv2);
  ok(await T.p.evaluate(() => window.SFF_ROLE) === 'tutor', 'role: tutor');
  await T.p.waitForTimeout(1500);
  ok(await T.p.evaluate(() => visibleKids().map(k => k.name).join()) === 'בן', 'sees only Ben');

  console.log('4. an invitation works once');
  const S = await open('stranger', inv1);
  ok(await S.p.evaluate(() => window.SFF_ROLE) === 'owner' && String(await S.p.evaluate(() => window.SFF_INVITE_MSG)).startsWith('bad'), 'a used invitation is refused');

  console.log('5. the parent sees the adults, removes the tutor');
  await O.p.reload({ waitUntil: 'load' }); await O.p.waitForFunction(() => window.SFF_ROLE); await O.p.waitForTimeout(1500);
  const names = await O.p.evaluate(async () => (await window.__sffFamily.members()).map(m => m.name + ':' + m.role).sort().join(', '));
  ok(names === 'דנה המורה:tutor, סבתא רותי:helper', 'adults: ' + names);
  const tutorUid = await T.p.evaluate(() => window.SFF_UID);
  await O.p.evaluate(async u => window.__sffFamily.remove(u), tutorUid);
  await T.p.reload({ waitUntil: 'load' }); await T.p.waitForFunction(() => window.SFF_ROLE); await T.p.waitForTimeout(1000);
  ok(await T.p.evaluate(() => window.__sffFamily.famId) === tutorUid, 'the removed tutor is back to her own family only');

  console.log('6. the kid\'s phone still works');
  const link = await O.p.evaluate(() => window.__sffFamily.kidLink('k2'));
  const kc = await b.newContext({ viewport: { width: 390, height: 844 } }); const kp = await kc.newPage(); kp.on('pageerror', e => errs.push('kid: ' + e.message));
  await kp.addInitScript(() => { window.SFF_REST_EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' }; });
  await kp.goto(link, { waitUntil: 'load' }); await kp.waitForTimeout(7000);
  ok(await kp.evaluate(() => sets.filter(s => !s.demo).length) === 1, 'Ben\'s phone gets his practice set');

  console.log(errs.length ? 'page errors: ' + errs.join(' | ') : 'no page errors');
  await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
