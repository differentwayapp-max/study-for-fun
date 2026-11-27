// Deleting an account – done by the server (deleteAccount), on the emulators (functions, firestore, auth).
// One adult who is everything at once:
//   a parent (own family: kids, practice sets, progress, a kid's phone, an invitation, a finished build with its log, usage,
//   billing), the teacher of a group (an approved student, the consent, a request, a private note, the student's phone,
//   the teacher's quota), a private tutor in another family (joined by an invitation – not in users/{uid}.fams) and a helper
//   in a third (only in users/{uid}.fams); and they sent a bug report and a catalog suggestion.
// After "delete account" in the family app: none of it is left, the account and both kid phones' sign-in accounts are gone,
// the other families and someone else's bug report stay, nothing of the account is left in this browser's storage.
// Also: a kid phone (anonymous) cannot call it.
const { chromium } = require('playwright');
const APP = 'http://localhost:8765/', PROJ = 'study-for-fun-7b03c';
const FS = 'http://127.0.0.1:8080', DOCS = `${FS}/v1/projects/${PROJ}/databases/(default)/documents`, AUTH = 'http://127.0.0.1:9099', FN = `http://127.0.0.1:5001/${PROJ}/europe-west1`;
const EMU = { fs: FS, auth: AUTH };
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) process.exitCode = 1; };
const enc = v => v === null || v === undefined ? { nullValue: null } : typeof v === 'boolean' ? { booleanValue: v } : typeof v === 'number' ? (Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v })
  : typeof v === 'string' ? { stringValue: v } : Array.isArray(v) ? { arrayValue: { values: v.map(enc) } } : { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, enc(x)])) } };
const OWNER = { Authorization: 'Bearer owner', 'Content-Type': 'application/json' };
const put = (path, obj) => fetch(`${DOCS}/${path}`, { method: 'PATCH', headers: OWNER, body: JSON.stringify({ fields: Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, enc(v)])) }) });
const exists = async path => (await fetch(`${DOCS}/${path}`, { headers: OWNER })).ok;
const anon = async () => { const r = await (await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"returnSecureToken":true}' })).json(); return { uid: r.localId, token: r.idToken }; };
const authUsers = async ids => ((await (await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/projects/${PROJ}/accounts:lookup`, { method: 'POST', headers: OWNER, body: JSON.stringify({ localId: ids }) })).json()).users || []).map(u => u.localId);

(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const errs = [];
  const c = await b.newContext({ viewport: { width: 390, height: 844 } });
  await c.addInitScript(([E]) => { window.SFF_REST_EMU = E; window.SFF_TEST_GOOGLE = { sub: 'delP', email: 'delp@t.local', email_verified: true, name: 'שירה כהן' }; localStorage.setItem('sff_lang', 'he'); }, [EMU]);
  const p = await c.newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto(APP, { waitUntil: 'load' }); await p.waitForTimeout(2000); if (await p.$('#fbGo')) await p.click('#fbGo');
  await p.waitForFunction(() => window.SFF_ROLE && window.SFF_UID, null, { timeout: 25000 }); await p.waitForTimeout(1500);
  const uid = await p.evaluate(() => window.SFF_UID);

  console.log('1. one adult: a parent, a group\'s teacher, a private tutor elsewhere, a helper in a third family');
  // the own family, in the app (kids, a set, progress)
  await p.evaluate(async () => { document.getElementById('intro')?.remove(); document.getElementById('onb')?.remove();
    kids.push({ id: 'k1', name: 'נועה', grade: 3, color: '#FF5C8A' }); saveKids(); const s = applyImport(await loadShare('en3'), kidById('k1')).set;
    history.unshift({ at: Date.now(), kidId: 'k1', kid: 'נועה', subject: s.subject, grade: 3, setId: s.id, retry: false, topic: '', ch: 0, right: 3, n: 4, score: 30, mode: 'choice', qr: [], qk: [], topics: {} }); saveHistoryLocal(); pushProgress('k1'); store.save(); });
  await p.waitForTimeout(3000);
  const kidPhone = await anon(), studPhone = await anon(), month = new Date().toISOString().slice(0, 7);
  const F = `families/${uid}`;
  await put(`${F}/devices/${kidPhone.uid}`, { kid: 'k1', at: Date.now() });
  await put(`${F}/invites/inv1`, { role: 'helper', kids: [], exp: Date.now() + 864e5, used: false });
  await put(`${F}/builds/b1`, { status: 'done', at: Date.now(), kidId: 'k1', subject: 'אנגלית', prog: { scan: { s: 'done', d: 'Unit 5 – שמות' } } });
  await put(`${F}/builds/b1/log/0`, { step: 'scan', out: '{}' });
  await put(`${F}/usage/${month}`, { builds: 1, usd: 0.4 });
  await put(`${F}/billing/main`, { credits: 2 });
  // the group this adult teaches
  const cid = 'DelGroupAbcdefghij01';
  await put(`families/${cid}`, { kind: 'class', ownerUid: uid, teacherName: 'שירה כהן', teach: 'class', name: "ג'1", grade: 2, subject: 'אנגלית', inviteToken: 'x', kidTokens: { st1: 'tok' }, createdAt: Date.now() });
  await put(`families/${cid}/fam/info`, { kind: 'class', teacher: 'שירה כהן', name: "ג'1", grade: 2 });
  await put(`families/${cid}/fam/kids`, { list: [{ id: 'st1', name: 'יונתן', grade: 2, color: '#2F6BFF' }] });
  await put(`families/${cid}/kidpub/st1`, { list: [{ id: 'st1', name: 'יונתן', grade: 2 }] });
  await put(`families/${cid}/consents/st1`, { status: 'digital', parentName: 'דנה', contact: '050', letterV: '0.91', at: Date.now() });
  await put(`families/${cid}/joinReqs/ReqAbcdefghij0123456`, { status: 'pending', parentName: 'רון', kidName: 'מיה', at: Date.now(), keyHash: 'h' });
  await put(`families/${cid}/notes/st1`, { text: 'צריך עזרה בקריאה', at: Date.now() });
  await put(`families/${cid}/progress/st1`, { history: [] });
  await put(`families/${cid}/devices/${studPhone.uid}`, { kid: 'st1', at: Date.now() });
  await put(`teachers/${uid}`, { classes: [cid], at: Date.now() });
  await put(`teachers/${uid}/usage/${month}`, { builds: 1 });
  // a private tutor in family Q (joined by its invitation) and a helper in family R (only in the account's list)
  const Q = 'otherFamQ00001', R = 'otherFamR00001';
  await put(`families/${Q}`, { inviteToken: 'q', name: 'משפחת לוי' }); await put(`families/${Q}/members/${uid}`, { role: 'tutor', kids: ['q1'], invite: 'invQ', at: 1 });
  await put(`families/${Q}/invites/invQ`, { role: 'tutor', used: true, usedBy: uid, exp: 1 });
  await put(`families/${R}`, { inviteToken: 'r', name: 'משפחת כץ' }); await put(`families/${R}/members/${uid}`, { role: 'helper', kids: [], invite: 'invR', at: 1 });
  await put(`users/${uid}`, { fams: [R], classes: [cid], roles: ['teacher'], terms: { v: '1', at: 1 } });
  // what they sent the app's team, the limits – and someone else's report (stays)
  await put(`bugReports/repMine00000000000001`, { by: uid, byName: 'שירה כהן', at: 1, kind: 'bug', text: 'x' });
  await put(`bugReports/repOther0000000000001`, { by: 'someoneElse', byName: 'אחר', at: 1, kind: 'bug', text: 'y' });
  await put(`catalogSuggestions/sugMine0000000000001`, { by: uid, byName: 'שירה כהן', at: 1, subject: 'אנגלית' });
  await put(`bugLimits/${uid}`, { at: 1 }); await put(`joinLimits/${uid}`, { t: [1] });
  const gone = [F, `${F}/fam/kids`, `${F}/progress/k1`, `${F}/devices/${kidPhone.uid}`, `${F}/invites/inv1`, `${F}/builds/b1`, `${F}/builds/b1/log/0`, `${F}/usage/${month}`, `${F}/billing/main`,
    `families/${cid}`, `families/${cid}/fam/kids`, `families/${cid}/kidpub/st1`, `families/${cid}/consents/st1`, `families/${cid}/joinReqs/ReqAbcdefghij0123456`, `families/${cid}/notes/st1`, `families/${cid}/progress/st1`, `families/${cid}/devices/${studPhone.uid}`,
    `teachers/${uid}`, `teachers/${uid}/usage/${month}`, `users/${uid}`, `families/${Q}/members/${uid}`, `families/${R}/members/${uid}`,
    `bugReports/repMine00000000000001`, `catalogSuggestions/sugMine0000000000001`, `bugLimits/${uid}`, `joinLimits/${uid}`];
  const before = await Promise.all(gone.map(exists));
  ok(before.every(Boolean), `all ${gone.length} documents are there before` + (before.every(Boolean) ? '' : ': missing ' + gone.filter((_, i) => !before[i]).join(', ')));
  ok((await authUsers([uid, kidPhone.uid, studPhone.uid])).length === 3, 'the account and the two kid phones have sign-in accounts');
  ok(await p.evaluate(() => Object.keys(localStorage).some(k => k === 'sff_kids')), 'this browser keeps the family (sff_kids)');

  console.log('2. a kid phone cannot delete anything');
  const r = await fetch(`${FN}/deleteAccount`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + kidPhone.token }, body: '{"data":{}}' });
  ok(r.status === 403 && (await exists(F)), 'an anonymous caller: refused (' + r.status + '), the family is still there');

  console.log('3. "delete account" in the family app');
  await p.evaluate(() => { openDelAcc(); deleteAccount(); });
  await p.waitForFunction(() => /✓|⚠️/.test(document.getElementById('delAccMsg').textContent), null, { timeout: 60000 }).catch(() => {});
  const msg = await p.evaluate(() => document.getElementById('delAccMsg').textContent);
  ok(/✓/.test(msg), 'the app says it was deleted: ' + msg);
  const after = await Promise.all(gone.map(exists)), left = gone.filter((_, i) => after[i]);
  ok(!left.length, `none of the ${gone.length} documents is left` + (left.length ? ': ' + left.join(', ') : ''));
  ok(!(await authUsers([uid, kidPhone.uid, studPhone.uid])).length, 'the account and both kid phones\' sign-in accounts are deleted');
  ok(await exists(`families/${Q}`) && await exists(`families/${R}`) && await exists(`families/${Q}/invites/invQ`) && await exists('bugReports/repOther0000000000001'), 'the other families and someone else\'s report stay');
  await p.waitForTimeout(1200);
  const ls = await p.evaluate(() => { const o = {}; try { Object.keys(localStorage).filter(k => k.startsWith('sff_')).forEach(k => o[k] = localStorage.getItem(k)); } catch (e) {} return o; });
  const leak = Object.entries(ls).filter(([k, v]) => /נועה|שירה|יונתן|delp@|en3|"id"/.test(v) || ['sff_data_fam', 'sff_active_fam', 'sff_errlog', 'sff_lock', 'sff_tok'].includes(k));
  ok(!leak.length, 'nothing of the account left in this browser (no names, sets, family): ' + JSON.stringify(ls).slice(0, 160));
  const log = await (await fetch(`${DOCS}/serverLog?pageSize=50`, { headers: OWNER })).json();
  const line = (log.documents || []).map(d => d.fields).find(f => f.fn && f.fn.stringValue === 'deleteAccount' && f.kind && f.kind.stringValue === 'info');
  ok(line && !/שירה|נועה|יונתן|delp@/.test(JSON.stringify(line)), 'the server log has a line with numbers only: ' + (line ? line.msg.stringValue : '–'));
  ok(!errs.length, 'no page errors ' + JSON.stringify(errs.slice(0, 3)));
  await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
