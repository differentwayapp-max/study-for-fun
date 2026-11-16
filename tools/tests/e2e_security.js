// Security checks on local emulators (functions + firestore + auth, real rules):
//  1. a kid phone cannot inject HTML/script into the parent's app through its name/picture
//  2. one family cannot use up the AI budget (per-family cap, limited refunds)
//  3. one adult invitation = one adult, with exactly the role and kids it gives
//  4. a kid phone joins with its own kid's link and writes only that kid's progress
// firebase emulators:exec --only functions,firestore,auth --project study-for-fun-7b03c "node tools/tests/e2e_security.js"
const { chromium } = require('playwright');
const FS = 'http://127.0.0.1:8080', AU = 'http://127.0.0.1:9099', PROJ = 'study-for-fun-7b03c';
const ROOT = `projects/${PROJ}/databases/(default)/documents`, DOCS = `${FS}/v1/${ROOT}`;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) process.exitCode = 1; };
const enc = x => x === null || x === undefined ? { nullValue: null } : typeof x === 'string' ? { stringValue: x } : typeof x === 'boolean' ? { booleanValue: x }
  : typeof x === 'number' ? (Number.isInteger(x) ? { integerValue: String(x) } : { doubleValue: x }) : Array.isArray(x) ? { arrayValue: { values: x.map(enc) } } : { mapValue: { fields: encF(x) } };
const encF = o => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined).map(([k, v]) => [k, enc(v)]));
const admin = (path, obj) => fetch(`${DOCS}/${path}`, { method: 'PATCH', headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: encF(obj) }) });
const user = async email => {
  const r = await fetch(`${AU}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=x`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(email ? { email, password: 'pw123456', returnSecureToken: true } : { returnSecureToken: true }) }).then(r => r.json());
  return { uid: r.localId, H: { Authorization: 'Bearer ' + r.idToken, 'Content-Type': 'application/json' } };
};
const write = (u, path, obj, q = '') => fetch(`${DOCS}/${path}${q}`, { method: 'PATCH', headers: u.H, body: JSON.stringify({ fields: encF(obj) }) }).then(r => r.status);
const commit = (u, writes) => fetch(`${DOCS}:commit`, { method: 'POST', headers: u.H, body: JSON.stringify({ writes }) }).then(r => r.status);
const upd = (path, obj, mask) => ({ update: { name: `${ROOT}/${path}`, fields: encF(obj) }, ...(mask ? { updateMask: { fieldPaths: mask } } : {}) });
(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.SFF_REST_EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' };
    window.SFF_TEST_GOOGLE = { sub: 'secparent', email: 'secparent@t.local', email_verified: true, name: 'Parent' }; localStorage.setItem('sff_lang', 'he'); });
  await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(2500); if (await p.$('#fbGo')) await p.click('#fbGo');
  await p.waitForFunction(() => window.SFF_ROLE && window.__sffAI, null, { timeout: 20000 }); await p.waitForTimeout(1000);
  await p.evaluate(() => { kids.push({ id: 'k1', name: 'Noa', grade: 3, color: '#FF5C8A' }, { id: 'k2', name: 'Ben', grade: 5, color: '#2F6BFF' }); saveKids(); });
  await p.waitForTimeout(2500);
  const fam = await p.evaluate(() => window.__sffFamily.famId);
  const link1 = new URL(await p.evaluate(() => window.__sffFamily.kidLink('k1')));
  const link2 = new URL(await p.evaluate(() => window.__sffFamily.kidLink('k2')));
  const famTok = new URL(await p.evaluate(() => window.SFF_APP_URL)).searchParams.get('t');
  const t1 = link1.searchParams.get('t'), t2 = link2.searchParams.get('t');

  console.log('4. kid links are per kid');
  ok(link1.searchParams.get('k') === 'k1' && link1.hash === '#kid-k1' && t1 && t2 && t1 !== t2, 'each kid has an own link token');
  ok(t1 === new URL(await p.evaluate(() => window.__sffFamily.kidLink('k1'))).searchParams.get('t'), 'the same kid gets the same link again');
  const old = await user(null);
  ok(await write(old, `families/${fam}/devices/${old.uid}`, { token: famTok, at: Date.now() }, '?currentDocument.exists=false') === 403, 'the old family-wide token no longer joins a new phone');
  const fake = await user(null);
  ok(await write(fake, `families/${fam}/devices/${fake.uid}`, { token: t1, kid: 'k2', at: Date.now() }, '?currentDocument.exists=false') === 403, "Noa's token cannot join as Ben");
  const d = await user(null);
  ok(await write(d, `families/${fam}/devices/${d.uid}`, { token: t1, kid: 'k1', at: Date.now() }, '?currentDocument.exists=false') === 200, "Noa's phone joins with Noa's link");
  ok(await write(d, `families/${fam}/progress/k2`, { history: [], profile: { nick: 'x' } }) === 403, "Noa's phone cannot overwrite Ben's progress");
  ok(await write(d, `families/${fam}/progress/k1`, { history: [{ at: 1, setId: 's', n: 1, right: 1 }], profile: { nick: 'Noa' } }) === 200, "Noa's phone saves Noa's progress");
  ok(await write(d, `families/${fam}/devices/${d.uid}`, { token: t2, kid: 'k2', at: Date.now() }) === 200, "the phone can be moved to Ben with Ben's link");
  ok(await write(d, `families/${fam}/progress/k1`, { history: [], profile: { nick: 'Noa' } }) === 403, '…and then no longer writes Noa');

  console.log('1. a kid phone cannot inject script through its name or picture');
  const k = await user(null);
  await write(k, `families/${fam}/devices/${k.uid}`, { token: t1, kid: 'k1', at: Date.now() }, '?currentDocument.exists=false');
  const evil = '<img src=x onerror="window.__PWNED=1">';
  const w = await write(k, `families/${fam}/progress/k1`, { history: [{ at: 2, setId: 's', kid: evil, subject: evil, n: 1, right: evil, mode: evil, qr: [evil], topics: { [evil]: { r: evil, n: 1 } } }],
    profile: { nick: evil, avatar: { type: 'emoji', value: evil } } });
  ok(w === 200, 'malicious profile and game written (as an attacker with the link could)');
  await write(k, `families/${fam}/progress/k1`, { history: [], profile: { nick: 'Noa', avatar: { type: 'mascot', value: '"/><img src=x onerror="window.__PWNED=2">' } } });
  await p.waitForTimeout(3000); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(6000);
  await p.evaluate(() => { try { openKidLink('k1'); go('stats'); } catch (e) {} }); await p.waitForTimeout(1500);
  ok(await p.evaluate(() => window.__PWNED) === undefined, 'no script ran in the parent\'s app');
  const kid1 = await p.evaluate(() => kidById('k1'));
  ok(!/[<>]/.test(JSON.stringify(kid1)), 'the kid keeps a clean name/picture: ' + JSON.stringify({ nick: kid1.nick, avatar: kid1.avatar }));
  ok(await p.evaluate(() => avatarHtml({ avatar: { type: 'emoji', value: '<b>x</b>' } }).includes('&lt;b&gt;')) && await p.evaluate(() => !mascot('happy', '"><b>').includes('"><b>')), 'avatar and colours are escaped when drawn');

  console.log('3. one invitation = one adult');
  await admin(`families/${fam}/invites/INV1`, { role: 'tutor', name: 'Tutor', kids: ['k1'], by: fam, exp: Date.now() + 864e5, used: false });
  const a1 = await user('tutor1@t.local'), a2 = await user('tutor2@t.local'), a3 = await user('tutor3@t.local');
  ok(await write(a1, `families/${fam}/members/${a1.uid}`, { role: 'tutor', name: 'T1', kids: ['k1'], invite: 'INV1', at: Date.now() }) === 403, 'joining without using up the invitation is refused');
  ok(await commit(a1, [upd(`families/${fam}/members/${a1.uid}`, { role: 'tutor', name: 'T1', kids: [], invite: 'INV1', at: Date.now() }),
    upd(`families/${fam}/invites/INV1`, { used: true, usedBy: a1.uid }, ['used', 'usedBy'])]) === 403, 'a tutor cannot widen the kids the invitation gives');
  ok(await commit(a1, [upd(`families/${fam}/invites/INV1`, { used: true, usedBy: a1.uid }, ['used', 'usedBy'])]) === 403, 'an invitation cannot be burned without joining');
  ok(await commit(a1, [upd(`families/${fam}/members/${a1.uid}`, { role: 'tutor', name: 'T1', kids: ['k1'], invite: 'INV1', at: Date.now() }),
    upd(`families/${fam}/invites/INV1`, { used: true, usedBy: a1.uid }, ['used', 'usedBy'])]) === 200, 'the invited adult joins (join + invitation used, together)');
  ok(await commit(a2, [upd(`families/${fam}/members/${a2.uid}`, { role: 'tutor', name: 'T2', kids: ['k1'], invite: 'INV1', at: Date.now() }),
    upd(`families/${fam}/invites/INV1`, { used: true, usedBy: a2.uid }, ['used', 'usedBy'])]) === 403, 'a second adult with the same invitation is refused');
  ok(await write(a3, `families/${fam}/members/${a3.uid}`, { role: 'tutor', name: 'T3', kids: ['k1'], invite: 'INV1', at: Date.now() }) === 403, '…also without the batch');

  console.log('2. AI budget: limited refunds, a cap per family');
  const ends = [];
  for (let i = 0; i < 3; i++) ends.push(await p.evaluate(async () => { const s = await window.__sffAI.start('מתמטיקה'); return (await window.__sffAI.end(s.buildId, false)).refunded; }));
  ok(ends[0] === true && ends[1] === true && ends[2] === false, 'failed-at-the-start builds are given back twice a month, not more: ' + ends.join(','));
  const month = await p.evaluate(() => monthKeyIL());
  await admin(`families/${fam}/usage/${month}`, { usd: 8.01, builds: 1, refunds: 2, month });
  const st = await p.evaluate(async () => { try { await window.__sffAI.start('אנגלית'); return 'started'; } catch (e) { return e.code; } });
  ok(st === 'family_budget', 'a family at its $8 share cannot start a build: ' + st);
  const ask = await p.evaluate(async () => { try { await (await window.claude.use('sample')).json('hi', {}); return 'ok'; } catch (e) { return e.code; } });
  ok(ask === 'family_budget', '…nor make AI calls: ' + ask);
  ok(!errs.length, 'no page errors ' + errs.join(' | '));
  await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
