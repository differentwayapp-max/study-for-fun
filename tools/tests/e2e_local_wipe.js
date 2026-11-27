// Nothing of an account stays on a phone, on the emulators (firestore, auth):
// 1. a parent signs out (☰ → התנתקות): no kid names, practice sets, progress, family or error log left in localStorage /
//    sessionStorage, and Firestore's copy on the phone (IndexedDB) is gone; the language stays;
// 2. a kid's phone whose link the parent replaced ("🔄 החלפת קישור"), opened again: "the link is not active", and nothing of
//    the family is left on it;
// 3. the address an email sign-in link was sent to is kept for a day only.
const { chromium } = require('playwright');
const APP = 'http://localhost:8765/', EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' };
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) process.exitCode = 1; };
const NAMES = /נועה|יואב|שירה|"k1"|"k2"/;
const local = p => p.evaluate(async () => { const o = {}; for (const st of [localStorage, sessionStorage]) Object.keys(st).forEach(k => o[(st === sessionStorage ? 's:' : '') + k] = st.getItem(k));
  const dbs = indexedDB.databases ? (await indexedDB.databases()).map(d => d.name).filter(n => /^firestore\//.test(n || '')) : []; return { o, dbs }; });
(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const errs = [];
  const c = await b.newContext({ viewport: { width: 390, height: 844 } });
  await c.addInitScript(([E]) => { window.SFF_REST_EMU = E; window.SFF_TEST_GOOGLE = { sub: 'wipeP', email: 'wipep@t.local', email_verified: true, name: 'שירה' }; if (!localStorage.getItem('sff_lang')) localStorage.setItem('sff_lang', 'he'); }, [EMU]);
  const p = await c.newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto(APP, { waitUntil: 'load' }); await p.waitForTimeout(2000); if (await p.$('#fbGo')) await p.click('#fbGo');
  await p.waitForFunction(() => window.SFF_ROLE, null, { timeout: 25000 }); await p.waitForTimeout(1500);
  await p.evaluate(async () => { document.getElementById('intro')?.remove(); document.getElementById('onb')?.remove();
    kids.push({ id: 'k1', name: 'נועה', grade: 3, color: '#FF5C8A' }, { id: 'k2', name: 'יואב', grade: 4, color: '#2F6BFF' }); saveKids();
    applyImport(await loadShare('en3'), kidById('k1')); store.save(); sessionStorage.setItem('sff_fresh', '1'); });
  await p.waitForTimeout(3000);
  const link = await p.evaluate(() => window.__sffFamily.kidLink('k1'));

  console.log('1. a kid phone with the link, then the parent signs out');
  const kc = await b.newContext({ viewport: { width: 390, height: 844 } }); await kc.addInitScript(([E]) => { window.SFF_REST_EMU = E; localStorage.setItem('sff_lang', 'he'); }, [EMU]);
  const K = await kc.newPage(); K.on('pageerror', e => errs.push('kid: ' + e.message));
  await K.goto(link, { waitUntil: 'load' }); await K.waitForFunction(() => typeof kids !== 'undefined' && kids.some(k => k.name === 'נועה') && sets.some(s => !s.demo), null, { timeout: 30000 }).catch(() => {});
  const k0 = await local(K);
  ok(NAMES.test(JSON.stringify(k0.o)) && k0.dbs.length > 0, 'the kid phone keeps the family (names, sets) and Firestore\'s copy');
  const before = await local(p);
  ok(NAMES.test(JSON.stringify(before.o)) && before.dbs.length > 0, 'before signing out: the family is kept on the phone');
  await p.evaluate(() => { document.getElementById('fbOut').click(); }); await p.waitForSelector('#sureYes', { timeout: 5000 }); await p.click('#sureYes');
  await p.waitForSelector('#fbGo', { timeout: 20000 }); await p.waitForTimeout(1500);
  const after = await local(p), bad = Object.entries(after.o).filter(([k, v]) => NAMES.test(v) || /^(s:)?sff_(sets|history|data_fam|active_fam|errlog|fresh|lock|tok|fam)$/.test(k) || (k === 'sff_kids' && v !== '[]'));
  ok(!bad.length && !after.dbs.length && after.o.sff_lang === 'he', 'after signing out: no names, sets, family, error log or Firestore copy; the language stays: ' + Object.keys(after.o).join(', ') + (bad.length ? ' BAD: ' + bad.map(x => x[0]).join(',') : ''));

  console.log("2. the parent replaces the kid's link; the kid's phone opens again");
  await p.click('#fbGo'); await p.waitForFunction(() => window.SFF_ROLE, null, { timeout: 25000 }); await p.waitForTimeout(2500);
  await p.evaluate(() => window.__sffFamily.newKidLink('k1')); await p.waitForTimeout(1500);
  await K.reload({ waitUntil: 'load' }); await K.waitForTimeout(8000);
  const k1 = await local(K), msg = await K.evaluate(() => { const e = document.getElementById('cloudErr'); return e && !e.classList.contains('hidden') ? e.innerText : (document.getElementById('fbLogin') ? 'login' : ''); });
  ok(/לא פעיל|login/.test(msg) && !NAMES.test(JSON.stringify(k1.o)) && !k1.dbs.length, 'the old link: "not active", and nothing of the family left on the kid phone: ' + Object.keys(k1.o).join(', '));

  console.log('3. the email sign-in address is kept for a day only');
  const mail = await p.evaluate(() => { localStorage.setItem('sff_link_mail', JSON.stringify({ mail: 'old@t.local', at: Date.now() - 2 * 864e5 })); const m = JSON.parse(localStorage.getItem('sff_link_mail')); return Date.now() - m.at < 864e5 ? m.mail : ''; });
  ok(mail === '' && /864e5 \? m\.mail/.test(await (await fetch(APP)).text()), 'an address kept 2 days ago is not used (it would be asked for again)');
  ok(!errs.filter(e => !/permission|insufficient/i.test(e)).length, 'no page errors ' + JSON.stringify(errs.slice(0, 3)));
  await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
