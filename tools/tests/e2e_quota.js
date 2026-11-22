// Monthly quota on local emulators (functions + firestore + auth):
// 3 free practice sets, the 4th is refused, a failed start gives the build back, the daily $100 cap stops AI calls (no monthly cap).
// A teacher (stage 4): 5 builds a month for all their groups together (the 6th refused, spread over 2 groups); the second build
// only with 3 approved students; the $12 cap shared by the groups; a teacher who is also a parent keeps the family's own 3;
// a failed build given back; the teacher reads the counter and cannot write it; another teacher cannot build in the group.
// firebase emulators:exec --only functions,firestore,auth --project study-for-fun-7b03c "node tools/tests/e2e_quota.js"
const { chromium } = require('playwright');
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) process.exitCode = 1; };
(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  p.on('pageerror', e => console.log('pageerror', e.message)); p.on('console', m => { if (m.text().startsWith('END')) console.log(m.text()); });
  await p.addInitScript(() => { window.SFF_REST_EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' };
    window.SFF_TEST_GOOGLE = { sub: 'qa1', email: 'qa1@t.local', email_verified: true, name: 'הורה' }; localStorage.setItem('sff_lang', 'he'); });
  await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(2500); if (await p.$('#fbGo')) await p.click('#fbGo');
  await p.waitForFunction(() => window.SFF_ROLE && window.__sffAI, null, { timeout: 20000 }); await p.waitForTimeout(1000);
  const run = (f, a) => p.evaluate(f, a);
  const r = await run(async () => { const out = []; for (let i = 0; i < 4; i++) { try { out.push(await window.__sffAI.start('מתמטיקה')); } catch (e) { out.push({ err: e.code, used: e.used, price: e.price }); } } return out; });
  ok(r.slice(0, 3).every(x => x.kind === 'free') && r[2].used === 3, '3 free builds: ' + r.slice(0, 3).map(x => x.used).join(','));
  ok(r[3].err === 'quota' && r[3].price === 5, '4th build refused (quota, 5 ₪)');
  const refund = await run(async id => { const e = await window.__sffAI.end(id, false); console.log('END', JSON.stringify(e), id); try { return await window.__sffAI.start('אנגלית'); } catch (e) { return { err: e.code }; } }, r[2].buildId);
  ok(refund.kind === 'free' && refund.used === 3, 'a build that failed at the start is given back ' + JSON.stringify(refund));
  const q = await run(async () => { const db = await window.claude.use('db'); const u = await db.doc('usage/' + monthKeyIL()).get(); let w; try { await db.doc('usage/' + monthKeyIL()).set({ builds: 0 }); w = 'written'; } catch (e) { w = 'denied'; } return { builds: u.data().builds, w }; });
  ok(q.builds === 3 && q.w === 'denied', 'parent reads the counter (' + q.builds + ') but cannot change it');
  const call = await run(async id => { try { await (await window.claude.use('sample')).json('match', { ctx: { gi: 0, grade: "א'", subject: "מתמטיקה", topics: ["חיבור"] }, want: ["חיבור"], pool: [{ ref: "a", title: "חיבור", topics: ["חיבור"] }] }, { buildId: id }); return 'ok'; } catch (e) { return e.code + ':' + e.message; } }, refund.buildId);
  ok(!/quota|budget|build_closed/.test(call), 'an AI call inside a build passes the checks (then the fake key fails): ' + call.slice(0, 60));
  const calls = await run(async () => { const db = await window.claude.use('db'); const s = await db.collection('builds').get(); return s.docs.map(d => d.data().calls).reduce((a, c) => a + c, 0); });
  ok(calls === 1, 'the call was counted on the build');
  // no monthly cap: a month past $40 still works; the daily $100 cap: write today's spend as the server would, then any call is refused
  const fam = await run(() => window.__sffFamily.famId); const month = await run(() => monthKeyIL());
  const put = (doc, usd) => fetch(`http://127.0.0.1:8080/v1/projects/study-for-fun-7b03c/databases/(default)/documents/meta/${doc}?updateMask.fieldPaths=usd`, { method: 'PATCH', headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: { usd: { doubleValue: usd } } }) });
  ok((await put(`ai_spend_${month}`, 500)).ok, 'test: month spend set to $500');
  const free = await run(async () => { try { await (await window.claude.use('sample')).json('match', { ctx: { gi: 0, grade: "א'", subject: "מתמטיקה", topics: ["חיבור"] }, want: ["חיבור"], pool: [{ ref: "a", title: "חיבור", topics: ["חיבור"] }] }); return 'ok'; } catch (e) { return e.code; } });
  ok(free !== 'budget', 'no monthly cap: a month past $40 is not refused (' + free + ')');
  const day = await run(() => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()));
  ok((await put(`ai_day_${day}`, 100.01)).ok, 'test: today\'s spend set to $100.01');
  const capped = await run(async () => { try { await window.__sffAI.start('מדעים'); return 'started'; } catch (e) { return e.code; } });
  ok(capped === 'budget' || capped === 'quota', 'new build refused when today\'s AI spend reached $100 (' + capped + ')');
  const capped2 = await run(async () => { try { await (await window.claude.use('sample')).json('match', { ctx: { gi: 0, grade: "א'", subject: "מתמטיקה", topics: ["חיבור"] }, want: ["חיבור"], pool: [{ ref: "a", title: "חיבור", topics: ["חיבור"] }] }); return 'ok'; } catch (e) { return e.code; } });
  ok(capped2 === 'budget', 'AI calls refused at the daily $100 cap');
  await p.evaluate(async () => { await fetch('about:blank').catch(()=>{}); sample = await window.claude.use('sample'); kids.push({ id: 'k1', name: 'נועה', grade: 6, color: '#FF5C8A' }); saveKids(); openWizard('k1'); W.step = 4; wizRender(); }); await p.waitForTimeout(800);
  console.log('quota line:', await p.evaluate(() => document.getElementById('quotaLine').innerText.replace(/\s+/g, ' ')));
  await p.screenshot({ path: process.env.OUT + '/quota.png' }); void fam;

  console.log('a teacher: 5 builds a month, for all their groups together');
  {
    const AU = 'http://127.0.0.1:9099', PROJ = 'study-for-fun-7b03c', DOCS = `http://127.0.0.1:8080/v1/projects/${PROJ}/databases/(default)/documents`, FN = `http://127.0.0.1:5001/${PROJ}/europe-west1`;
    const enc = x => x === null ? { nullValue: null } : typeof x === 'string' ? { stringValue: x } : typeof x === 'boolean' ? { booleanValue: x } : typeof x === 'number' ? (Number.isInteger(x) ? { integerValue: String(x) } : { doubleValue: x })
      : Array.isArray(x) ? { arrayValue: { values: x.map(enc) } } : { mapValue: { fields: Object.fromEntries(Object.entries(x).map(([k, v]) => [k, enc(v)])) } };
    const admin = (path, obj) => fetch(`${DOCS}/${path}`, { method: 'PATCH', headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: enc(obj).mapValue.fields }) });
    const user = async email => { let r = await fetch(`${AU}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=x`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: 'pw123456', returnSecureToken: true }) }).then(r => r.json());
      await fetch(`${AU}/identitytoolkit.googleapis.com/v1/projects/${PROJ}/accounts:update`, { method: 'POST', headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' }, body: JSON.stringify({ localId: r.localId, emailVerified: true }) });
      r = await fetch(`${AU}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=x`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: 'pw123456', returnSecureToken: true }) }).then(r => r.json());
      return { uid: r.localId, H: { Authorization: 'Bearer ' + r.idToken, 'Content-Type': 'application/json' } }; };
    const call = (u, name, data) => fetch(`${FN}/${name}`, { method: 'POST', headers: u.H, body: JSON.stringify({ data }) }).then(async r => { const j = await r.json().catch(() => ({})); return r.ok ? j.result : { err: (j.error && j.error.details && j.error.details.reason) || (j.error && j.error.status) || r.status, ...(j.error && j.error.details || {}) }; });
    const month = await p.evaluate(() => monthKeyIL());
    await admin(`meta/ai_day_${day}`, { usd: 0 }); await admin(`meta/ai_spend_${month}`, { usd: 0 });   // the daily cap above was reached on purpose
    const T = await user('teacherq@t.local'), T2 = await user('teacherq2@t.local');
    const A = (await call(T, 'createClass', { teach: 'class', name: 'א', grade: 3, subject: 'אנגלית' })).classId, B = (await call(T, 'createClass', { teach: 'class', name: 'ב', grade: 4, subject: 'אנגלית' })).classId;
    ok(A && B, 'a teacher with 2 groups');
    const s1 = await call(T, 'startBuild', { famId: A, subject: 'אנגלית' });
    ok(s1.kind === 'free' && s1.used === 1 && s1.free === 5 && s1.teacher, 'the first build, with no students: free, 1 of 5');
    const s2 = await call(T, 'startBuild', { famId: B, subject: 'אנגלית' });
    ok(s2.err === 'need_students' && s2.min === 3, 'the second, with no approved students: refused – "need_students" (3)');
    await admin(`families/${A}/consents/k1`, { status: 'digital' }); await admin(`families/${A}/consents/k2`, { status: 'digital' }); await admin(`families/${B}/consents/k3`, { status: 'pending' });
    ok((await call(T, 'startBuild', { famId: A, subject: 'x' })).err === 'need_students', '2 approved + 1 waiting is not enough');
    await admin(`families/${B}/consents/k3`, { status: 'digital' });
    const runs = []; for (const g of [B, A, B, A, B]) runs.push(await call(T, 'startBuild', { famId: g, subject: 'אנגלית' }));
    ok(runs.slice(0, 4).every(r => r.kind === 'free') && runs[3].used === 5, '3 approved students in 2 groups: builds 2–5 pass, spread over both groups: ' + runs.slice(0, 4).map(r => r.used).join(','));
    ok(runs[4].err === 'quota' && runs[4].free === 5 && runs[4].teacher === true && runs[4].used === 5, 'the 6th is refused (quota, 5 – no paid builds for teachers), though asked in the other group');
    const u = await fetch(`${DOCS}/teachers/${T.uid}/usage/${month}`, { headers: T.H }).then(r => r.json());
    ok(+u.fields.builds.integerValue === 5, 'counted in teachers/{uid}/usage/{month}: 5 (not per group)');
    const fa = await fetch(`${DOCS}/families/${A}/usage/${month}`, { headers: { Authorization: 'Bearer owner' } });
    ok(fa.status === 404, 'nothing counted on the groups themselves');
    // a failed build is given back (at most 2 a month, like a family)
    const back = await call(T, 'endBuild', { famId: A, buildId: runs[3].buildId, ok: false });
    const again = await call(T, 'startBuild', { famId: B, subject: 'x' });
    ok(back.refunded === true && again.kind === 'free' && again.used === 5, 'a failed build is given back – one more build passes');
    // the teacher reads the counter, cannot write it; another teacher can do neither, nor build in the group
    ok((await fetch(`${DOCS}/teachers/${T.uid}/usage/${month}?updateMask.fieldPaths=builds`, { method: 'PATCH', headers: T.H, body: JSON.stringify({ fields: { builds: { integerValue: '0' } } }) })).status === 403, 'the teacher cannot change the counter');
    ok((await fetch(`${DOCS}/teachers/${T.uid}/usage/${month}`, { headers: T2.H })).status === 403, 'another teacher cannot read it');
    ok((await call(T2, 'startBuild', { famId: A, subject: 'x' })).err === 'PERMISSION_DENIED', 'another teacher cannot build in the group');
    // the $12 cap is the teacher's, shared by the groups
    await admin(`teachers/${T.uid}/usage/${month}`, { builds: 1, usd: 11.999, month });
    const capA = await call(T, 'ask', { famId: A, step: 'match', data: { ctx: { gi: 0, grade: "א'", subject: 'מתמטיקה', topics: ['חיבור'] }, want: ['חיבור'], pool: [{ ref: 'a', title: 'חיבור', topics: ['חיבור'] }] } });
    const capB = await call(T, 'startBuild', { famId: B, subject: 'x' });
    ok(capA.err === 'teacher_budget' && capA.cap === 12, 'at $12 (counted for the teacher): an AI call in group A is refused – teacher_budget');
    await admin(`teachers/${T.uid}/usage/${month}`, { builds: 1, usd: 12, month });
    ok((await call(T, 'startBuild', { famId: B, subject: 'x' })).err === 'teacher_budget', '…and a new build in group B too' + (capB.err ? '' : ''));
    // a teacher who is also a parent: the family keeps its own 3 builds
    await admin(`families/${T.uid}`, { inviteToken: 'x'.repeat(18), name: 'הורה ומורה', createdAt: Date.now() });
    const fam = await call(T, 'startBuild', { famId: T.uid, subject: 'מתמטיקה' });
    ok(fam.kind === 'free' && fam.used === 1 && fam.free === 3 && !fam.teacher, 'the same person as a parent: the family\'s own quota (1 of 3), apart from the teacher\'s');
  }
  await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
