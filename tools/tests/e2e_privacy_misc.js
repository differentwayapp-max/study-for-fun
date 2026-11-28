// Small privacy fixes, on the emulators (functions, firestore, auth). The app admin is the first address in functions/.env
// (read here, never written into the test).
// 1. an app admin cannot touch a teacher's group (its link, requests, consents); every look at the accounts list is logged;
// 2. a student taken out of a group also leaves the assignments given to them, and their phone's sign-in account is deleted;
// 3. a printed class report shows 1–2 students as "fewer than 3"; the phone's error log keeps no document paths;
// 4. many new join requests in one group in an hour are refused (per group, not only per phone);
// 5. the daily cleaning: bug reports after 180 days, the server log after 90 days;
// 6. the upload step says the material goes to Anthropic (Hebrew + English).
const { chromium } = require('playwright');
const APP = 'http://localhost:8765/', PROJ = 'study-for-fun-7b03c';
const FS = 'http://127.0.0.1:8080', DOCS = `${FS}/v1/projects/${PROJ}/databases/(default)/documents`, AUTH = 'http://127.0.0.1:9099', FN = `http://127.0.0.1:5001/${PROJ}/europe-west1`;
const EMU = { fs: FS, auth: AUTH };
const ADMIN = (require('fs').readFileSync(__dirname + '/../../functions/.env', 'utf8').match(/^ADMIN_EMAILS=([^,\s]+)/m) || [])[1];
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) process.exitCode = 1; };
const enc = v => v === null || v === undefined ? { nullValue: null } : typeof v === 'boolean' ? { booleanValue: v } : typeof v === 'number' ? (Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v })
  : typeof v === 'string' ? { stringValue: v } : Array.isArray(v) ? { arrayValue: { values: v.map(enc) } } : { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, enc(x)])) } };
const val = v => v == null ? null : 'integerValue' in v ? +v.integerValue : 'doubleValue' in v ? v.doubleValue : 'stringValue' in v ? v.stringValue : 'booleanValue' in v ? v.booleanValue : 'mapValue' in v ? Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, val(x)])) : 'arrayValue' in v ? (v.arrayValue.values || []).map(val) : null;
const OWNER = { Authorization: 'Bearer owner', 'Content-Type': 'application/json' };
const put = (path, obj, mask) => fetch(`${DOCS}/${path}${mask ? '?' + mask.map(m => 'updateMask.fieldPaths=' + m).join('&') : ''}`, { method: 'PATCH', headers: OWNER, body: JSON.stringify({ fields: Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, enc(v)])) }) });
const get = async path => { const r = await fetch(`${DOCS}/${path}`, { headers: OWNER }); if (!r.ok) return null; const d = await r.json(); return Object.fromEntries(Object.entries(d.fields || {}).map(([k, x]) => [k, val(x)])); };
const anon = async () => { const r = await (await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"returnSecureToken":true}' })).json(); return { uid: r.localId, token: r.idToken }; };
const authUsers = async ids => ((await (await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/projects/${PROJ}/accounts:lookup`, { method: 'POST', headers: OWNER, body: JSON.stringify({ localId: ids }) })).json()).users || []).map(u => u.localId);
const call = async (fn, data, token) => { const r = await fetch(`${FN}/${fn}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: JSON.stringify({ data }) }); const j = await r.json(); return j.error ? (j.error.details && j.error.details.reason) || j.error.status : j.result; };

(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const errs = [];
  const ctx = async (g, lang = 'he') => { const c = await b.newContext({ viewport: { width: 390, height: 844 } }); await c.addInitScript(([E, g, l]) => { window.SFF_TEACH_LINKS = true; window.SFF_REST_EMU = E; if (g) window.SFF_TEST_GOOGLE = g; localStorage.setItem('sff_lang', l); }, [EMU, g, lang]); return c; };
  const signIn = async (c, url) => { const p = await c.newPage(); p.on('pageerror', e => errs.push(e.message)); await p.goto(url, { waitUntil: 'load' }); await p.waitForTimeout(2000); if (await p.$('#fbGo')) await p.click('#fbGo'); return p; };
  const tokenOf = p => p.evaluate(async () => { const { getAuth } = await import('https://www.gstatic.com/firebasejs/' + window.SFF_FIREBASE_SDK + '/firebase-auth.js'); return getAuth().currentUser.getIdToken(); });

  // a teacher and a group with two students and an assignment to both
  const T = await signIn(await ctx({ sub: 'miscT', email: 'misct@t.local', email_verified: true, name: 'דנה' }), APP + 'teach');
  await T.waitForSelector('#tsClass', { timeout: 20000 }); await T.click('#tsClass'); await T.fill('#tsName', "ד'1"); await T.click('#tsGo');
  await T.waitForFunction(() => window.SFF_KIND === 'class', null, { timeout: 25000 }); await T.waitForTimeout(1500);
  const cid = await T.evaluate(() => window.__sffFamily.famId);
  const phone = await anon();
  await put(`families/${cid}/fam/kids`, { list: [{ id: 'st1', name: 'יונתן', grade: 3 }, { id: 'st2', name: 'מאיה', grade: 3 }] });
  for (const k of ['st1', 'st2']) { await put(`families/${cid}/consents/${k}`, { status: 'digital', at: 1 }); await put(`families/${cid}/kidpub/${k}`, { list: [{ id: k, name: k }] }); }
  await put(`families/${cid}/devices/${phone.uid}`, { kid: 'st1', at: 1 });
  await put(`families/${cid}/sets/a1`, { set: { id: 'a1', grp: 1, to: ['st1', 'st2'], toMap: { st1: true, st2: true }, ass: { by: 'x', at: 1 }, questions: [] } });

  console.log('1. the app admins and a teacher\'s group');
  const A = await signIn(await ctx({ sub: 'miscA', email: ADMIN, email_verified: true, name: 'Admin' }), APP);
  await A.waitForFunction(() => window.SFF_ROLE, null, { timeout: 25000 }); await A.waitForTimeout(800);
  const at = await tokenOf(A);
  const r1 = await call('joinLink', { classId: cid }, at), r2 = await call('revokeConsent', { classId: cid, kidId: 'st2' }, at);
  ok(r1 === 'PERMISSION_DENIED' && r2 === 'PERMISSION_DENIED' && (await get(`families/${cid}/consents/st2`)).status === 'digital', 'an app admin cannot open the group\'s link or withdraw a consent: ' + [r1, r2].join(', '));
  const u = await call('adminUsers', {}, at);
  const log = ((await (await fetch(`${DOCS}/serverLog?pageSize=100`, { headers: OWNER })).json()).documents || []).map(d => Object.fromEntries(Object.entries(d.fields).map(([k, x]) => [k, val(x)])));
  ok(u && Array.isArray(u.parents) && log.some(x => x.fn === 'adminUsers' && x.kind === 'admin'), 'an admin reads the accounts list: allowed, and a line in the server log');

  console.log('2. a student taken out of the group');
  const tt = await tokenOf(T);
  ok(await call('revokeConsent', { classId: cid, kidId: 'st1' }, tt) && true, 'the teacher takes יונתן out');
  const a1 = (await get(`families/${cid}/sets/a1`)).set;
  ok(a1.to.join() === 'st2' && !('st1' in a1.toMap) && a1.toMap.st2 === true, 'the assignment is now for מאיה only (to, toMap)');
  ok(!(await authUsers([phone.uid])).length, "יונתן's phone's sign-in account is deleted");

  console.log('3. the printed report; the error log');
  const pr = await T.evaluate(() => { trPrint = (orig => function () { window.print = () => {}; return orig.apply(this, arguments); })(trPrint); trPrint(); const t = document.getElementById('trPrint'); return { few: [few(0), few(1), few(2), few(3)].join('|'), cells: [...t.querySelectorAll('td')].map(x => x.textContent).join(' ') }; });
  ok(pr.few === '0|פחות מ-3|פחות מ-3|3', 'a printed report: 1–2 students show as "fewer than 3" (' + pr.few + ')');
  const el = await T.evaluate(async () => { await logFail('test', { code: 'x', message: 'No document to update: projects/p/databases/(default)/documents/families/abcDEF123/sets/s1' }); return JSON.parse(localStorage.getItem('sff_errlog') || '[]')[0].msg; });
  ok(!/abcDEF123/.test(el) && /families\/…/.test(el), 'the error log keeps the message without the document path: ' + el.slice(-50));

  console.log('4. new join requests per group');
  const now = Date.now(); await put(`joinLimits/g_${cid}_req`, { t: Array.from({ length: 20 }, (_, i) => now - i * 1000) });
  const link = await call('joinLink', { classId: cid }, tt);
  const parent = await anon();
  const sig = await T.evaluate(() => { const c = document.createElement('canvas'); c.width = 360; c.height = 120; const g = c.getContext('2d'); g.lineWidth = 3; g.beginPath(); g.moveTo(10, 60); for (let i = 0; i < 30; i++) g.lineTo(10 + i * 11, i % 2 ? 20 : 100); g.stroke(); return c.toDataURL('image/png'); });
  const r4 = await call('requestJoin', { classId: cid, code: link.code, parentName: 'הורה', kidName: 'ילד א.', agree: true, letterV: '0.91', sig }, parent.token);
  await put(`joinLimits/g_${cid}_req`, { t: [] });
  const r5 = await call('requestJoin', { classId: cid, code: link.code, parentName: 'הורה', kidName: 'ילד א.', agree: true, letterV: '0.91', sig }, parent.token);
  ok(r4 === 'too_many' && r5 && r5.reqId, 'the 21st new request in an hour in one group is refused (from any phone); under the limit it passes');

  console.log('5. the daily cleaning: bug reports, the server log');
  await put('bugReports/oldRep00000000000001', { by: 'x', at: now - 181 * 864e5, kind: 'bug', text: 'old' });
  await put('bugReports/newRep00000000000001', { by: 'x', at: now - 10 * 864e5, kind: 'bug', text: 'new' });
  await put('serverLog/oldLog00000000000001', { at: now - 91 * 864e5, fn: 'x', msg: 'old' });
  const cl = await call('testClean', { only: ['bugReports', 'serverLog'] });
  ok(!(await get('bugReports/oldRep00000000000001')) && !!(await get('bugReports/newRep00000000000001')) && !(await get('serverLog/oldLog00000000000001')), 'a report of 181 days and a log line of 91 days are deleted; a recent report stays ' + JSON.stringify(cl));

  console.log('6. the upload step');
  for (const lang of ['he', 'en']) {
    const P = await signIn(await ctx({ sub: 'miscP' + lang, email: `miscp${lang}@t.local`, email_verified: true, name: 'P' }, lang), APP);
    await P.waitForFunction(() => window.SFF_ROLE, null, { timeout: 25000 }); await P.waitForTimeout(1200);
    const t = await P.evaluate(() => { document.getElementById('intro')?.remove(); kids.push({ id: 'k1', name: 'Noa', grade: 3, color: '#FF5C8A' }); saveKids(); openWizard('k1'); W.step = 3; wizRender(); const n = document.querySelector('.privnote'); return n && n.offsetParent ? n.innerText : ''; });
    ok(lang === 'he' ? /Anthropic/.test(t) && /כסו שמות/.test(t) : /Anthropic/.test(t) && /Cover names/.test(t) && !/[֐-׿]/.test(t), `${lang}: "${t}"`);
  }
  ok(!errs.length, 'no page errors ' + JSON.stringify(errs.slice(0, 3)));
  await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
