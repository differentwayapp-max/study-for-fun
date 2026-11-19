// Security checks on local emulators (functions + firestore + auth, real rules):
//  1. a kid phone cannot inject HTML/script into the parent's app through its name/picture
//  2. one family cannot use up the AI budget (per-family cap, limited refunds)
//  3. one adult invitation = one adult, with exactly the role and kids it gives
//  4. a kid phone joins with its own kid's link and writes only that kid's progress
//  5. bug reports: no markup through the document id, typed/sized fields, one a minute per user; the admin list runs no script
//  6. catalog suggestions: typed fields; the admin list and the in-app catalog run no script from them
//  7. the server writes a family's error log only for that family's own parents
//  8. app admins need a verified address; the service worker never stores /share/ files
// firebase emulators:exec --only functions,firestore,auth --project study-for-fun-7b03c "node tools/tests/e2e_security.js"
const { chromium } = require('playwright');
const FS = 'http://127.0.0.1:8080', AU = 'http://127.0.0.1:9099', PROJ = 'study-for-fun-7b03c';
const ROOT = `projects/${PROJ}/databases/(default)/documents`, DOCS = `${FS}/v1/${ROOT}`;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) process.exitCode = 1; };
const enc = x => x === null || x === undefined ? { nullValue: null } : typeof x === 'string' ? { stringValue: x } : typeof x === 'boolean' ? { booleanValue: x }
  : typeof x === 'number' ? (Number.isInteger(x) ? { integerValue: String(x) } : { doubleValue: x }) : Array.isArray(x) ? { arrayValue: { values: x.map(enc) } } : { mapValue: { fields: encF(x) } };
const encF = o => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined).map(([k, v]) => [k, enc(v)]));
const admin = (path, obj) => fetch(`${DOCS}/${path}`, { method: 'PATCH', headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: encF(obj) }) });
// an adult = an email account whose address is verified (as an email sign-in link gives); no email = a kid device (anonymous)
const user = async (email, verified = true) => {
  let r = await fetch(`${AU}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=x`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(email ? { email, password: 'pw123456', returnSecureToken: true } : { returnSecureToken: true }) }).then(r => r.json());
  if (email && verified) {
    await fetch(`${AU}/identitytoolkit.googleapis.com/v1/projects/${PROJ}/accounts:update`, { method: 'POST', headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' },
      body: JSON.stringify({ localId: r.localId, emailVerified: true }) });
    r = await fetch(`${AU}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=x`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'pw123456', returnSecureToken: true }) }).then(r => r.json());
  }
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

  { const nv = await user('unverified@t.local', false);
    ok(await write(nv, `users/${nv.uid}`, { x: 1 }) === 403, 'an email account that never verified its address is not a parent'); }
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
  console.log('5. bug reports');
  const rid = () => Array.from({ length: 20 }, () => 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 62)]).join('');
  const bug = (u, extra = {}) => ({ by: u.uid, byName: 'x', at: Date.now(), kind: 'bug', text: 'hi', where: 'vKids', ver: 'sff-v1', ua: 'ua', role: '', ...extra });
  const report = (u, id, data) => commit(u, [{ update: { name: `${ROOT}/bugLimits/${u.uid}`, fields: {} }, updateTransforms: [{ fieldPath: 'at', setToServerValue: 'REQUEST_TIME' }] },
    { update: { name: `${ROOT}/bugReports/${id}`, fields: encF(data) }, currentDocument: { exists: false } }]);
  const atk = await user(null), evilId = 'x" onmouseover="window.__PWNED=5" y="';
  ok(await report(atk, encodeURIComponent(evilId), bug(atk)) !== 200, 'a report whose id carries markup is refused');
  ok(await report(atk, rid(), bug(atk, { byName: 'n'.repeat(61) })) === 403, 'a too long name is refused');
  ok(await report(atk, rid(), bug(atk, { at: 'now' })) === 403, 'a time that is not a number is refused');
  ok(await report(atk, rid(), bug(atk)) === 200, 'a normal report is accepted');
  ok(await report(atk, rid(), bug(atk)) === 403, 'a second report within a minute is refused');
  await p.evaluate(ev => { const L = window.__sffRoot.list; window.__sffRoot.list = async c => c === 'bugReports'
    ? [{ id: ev, by: 'x', byName: '<img src=x onerror="window.__PWNED=6">', at: Date.now(), kind: 'bug', text: '<b onmouseover="window.__PWNED=7">t</b>', where: 'w', ver: 'v', ua: 'u', role: 'r' },
       { id: "');window.__PWNED=8;('", at: Date.now(), kind: 'idea', text: 't' }] : L(c); openBugList(); }, evilId);
  await p.waitForTimeout(400);
  // the admin moves the mouse over every part of the list and presses 🗑 (inline handlers would fire on these events)
  await p.evaluate(() => document.querySelectorAll('#moreDlg *').forEach(el => ['mouseover', 'mouseenter', 'focus'].forEach(t => el.dispatchEvent(new MouseEvent(t, { bubbles: true })))));
  await p.evaluate(() => document.querySelectorAll('#moreDlg .bugdel').forEach(b => b.click())); await p.waitForTimeout(400);
  ok(await p.evaluate(() => window.__PWNED) === undefined && await p.evaluate(() => [...document.querySelectorAll('#moreDlg .bugdel')].every(b => !b.getAttribute('onmouseover') && !b.getAttribute('onclick'))),
    'admin report list: no script runs from an id, a name or a text (hover + click)');
  await p.evaluate(() => closeMore());

  console.log('6. catalog suggestions');
  const sug = extra => p.evaluate(async x => { try { await window.__sffRoot.add('catalogSuggestions', { by: window.SFF_UID, byName: 'P', at: Date.now(), subject: 'מדעים', grade: 3, topics: ['a'], chapters: 2, questions: 10, code: 'SFF1:x', ...x }); return 'ok'; } catch (e) { return 'denied'; } }, extra);
  ok(await sug({ chapters: '<img src=x onerror="window.__PWNED=9">' }) === 'denied', 'a suggestion with markup instead of a number is refused');
  ok(await sug({ subject: 's'.repeat(61) }) === 'denied', 'a too long subject is refused');
  ok(await sug({}) === 'ok', 'a normal suggestion is accepted');
  await p.evaluate(() => { const L = window.__sffRoot.list; window.__sffRoot.list = async c => c === 'catalogSuggestions'
    ? [{ id: 'a', by: 'x', byName: '<img src=x onerror="window.__PWNED=10">', at: Date.now(), subject: '<img src=x onerror="window.__PWNED=11">', grade: '"><img src=x onerror="window.__PWNED=12">',
        topics: ['<img src=x onerror="window.__PWNED=13">'], chapters: '<img src=x onerror="window.__PWNED=14">', questions: '<svg onload="window.__PWNED=15">', code: 'x' }]
    : c === 'catalog' ? [{ id: "x');window.__PWNED=16;('", title: 'evil', grade: 3, subject: 'מדעים' },
        { id: 'okid', title: '<img src=x onerror="window.__PWNED=17">', subject: 'מדעים', grade: '"><img src=x onerror="window.__PWNED=18">', tags: ['<img src=x onerror="window.__PWNED=19">'], questions: '<b>', chapters: 1, samples: [{ q: '<img src=x onerror="window.__PWNED=20">', e: '<b>' }] }]
    : L(c); openSuggestions(); });
  await p.waitForTimeout(800);
  await p.evaluate(() => document.querySelectorAll('#uList *').forEach(el => el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))));
  await p.evaluate(() => openCatalog()); await p.waitForTimeout(1500);
  for (let g = 0; g < 8; g++) for (const sb of ['מתמטיקה', 'עברית / לשון', 'מדעים', 'אנגלית']) await p.evaluate(([g, sb]) => { CAT.grade = g; CAT.subj = sb; renderCatalog();
    document.querySelectorAll('#vCat *').forEach(el => el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))); }, [g, sb]);
  await p.waitForTimeout(600);
  ok(await p.evaluate(() => window.__PWNED) === undefined, 'admin suggestion list and the in-app catalog: no script runs');
  ok(await p.evaluate(() => !(CAT.list || []).some(x => /[^A-Za-z0-9_-]/.test(String(x.id).replace(/^fs-/, '')))), 'a catalog entry with a strange id is not shown');

  console.log('7. the server error log');
  const famLog = async () => ((await (await fetch(`${DOCS}/families/${fam}/errlog?pageSize=300`, { headers: { Authorization: 'Bearer owner' } })).json()).documents || []).length;
  const callAsk = (H, data) => fetch(`http://127.0.0.1:5001/${PROJ}/europe-west1/ask`, { method: 'POST', headers: H, body: JSON.stringify({ data }) }).then(r => r.status);
  const n0 = await famLog();
  const srvLog = async () => ((await (await fetch(`${DOCS}/serverLog?pageSize=300`, { headers: { Authorization: 'Bearer owner' } })).json()).documents || []);
  const s0 = (await srvLog()).length;
  const anon = await user(null), mail = await user('stranger@t.local');
  await callAsk(anon.H, { prompt: '', famId: fam }); await callAsk(mail.H, { prompt: '', famId: fam });
  ok(await famLog() === n0, "an anonymous or non-Google caller cannot write into a family's error log");
  const sl = await srvLog();
  ok(sl.length >= s0 + 2 && sl.every(d => !JSON.stringify(d.fields).includes(fam)), 'the admins\' server log gets the failures (function, code, time – no family id)');
  ok(await fetch(`${DOCS}/serverLog`, { headers: anon.H }).then(r => r.status) === 403, 'a non-admin cannot read the server log');
  await p.evaluate(async () => { try { await (await window.claude.use('sample')).json('', {}); } catch (e) {} });
  await p.waitForTimeout(800);
  ok(await famLog() >= n0, "the family's own parent still gets server errors in the log");

  console.log('8. admins and the service worker');
  const fsr = require('fs'), pth = require('path');
  const rules = fsr.readFileSync(pth.join(__dirname, '../../firestore.rules'), 'utf8'), sw = fsr.readFileSync(pth.join(__dirname, '../../public/sw.js'), 'utf8');
  ok(/function appAdmin\(\)[^}]*email_verified == true/.test(rules), 'appAdmin() requires a verified address');
  ok(sw.includes("if (url.pathname.startsWith('/share/')) return;"), 'the service worker never caches /share/ files');

  ok(!errs.length, 'no page errors ' + errs.join(' | '));
  await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
