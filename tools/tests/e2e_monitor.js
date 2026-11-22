// Monitoring (שליטה ובקרה): the app reports its own failures, the server finds what is stuck, healthReport sends it out.
//  1. app: an uncaught error and a rejected promise go into the family's errlog – once (the same error again: no new record)
//  2. app: a record queued while there was no cloud connection (sff_errq) goes out on the next start
//  3. server: watchdog via healthReport – a build idle 30 min (reported, still resumable), a family or group build past 3 h (closed,
//     refunded – a group on its teacher), an AI call that never returned, the same failure in 3 families, many failed builds,
//     a family near its $8 cap, a teacher near the $12 cap
//  4. healthReport: no key → 401; the second call has no new findings (each finding once); no kid names in the report
// firebase emulators:exec --only functions,firestore,auth --project study-for-fun-7b03c "node tools/tests/e2e_monitor.js"
// (the emulator reads HEALTH_KEY from functions/.secret.local – this test writes one there if missing)
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const SECRET = path.join(__dirname, '../../functions/.secret.local');
const KEY = 'test-health-key-0123456789';
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) process.exitCode = 1; };
(async () => {
  const sec = fs.existsSync(SECRET) ? fs.readFileSync(SECRET, 'utf8') : '';
  const key = (sec.match(/^HEALTH_KEY=(.+)$/m) || [])[1];
  if (!key) { fs.appendFileSync(SECRET, `HEALTH_KEY=${KEY}\n`); console.log('wrote HEALTH_KEY to functions/.secret.local – run the test again (the emulator reads it at start)'); process.exit(1); }
  process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
  const admin = require('../../functions/node_modules/firebase-admin');
  admin.initializeApp({ projectId: 'study-for-fun-7b03c' });
  const db = admin.firestore();
  const URL = 'http://127.0.0.1:5001/study-for-fun-7b03c/europe-west1/healthReport';
  const month = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem', year: 'numeric', month: '2-digit' }).format(new Date()).slice(0, 7);
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

  // ---- 1-2: the app
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  await p.addInitScript(() => { window.SFF_REST_EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' };
    window.SFF_TEST_GOOGLE = { sub: 'mon1', email: 'mon1@t.local', email_verified: true, name: 'הורה' }; localStorage.setItem('sff_lang', 'he');
    if (!sessionStorage.getItem('q')) { sessionStorage.setItem('q', '1');
      localStorage.setItem('sff_errq', JSON.stringify([{ at: Date.now() - 6e5, where: 'stuck:start', code: 'auth', msg: 'queued while offline', subject: '', ver: 'sff-v0', by: 'parent' }])); } });
  await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(2500); if (await p.$('#fbGo')) await p.click('#fbGo');
  await p.waitForFunction(() => window.SFF_ROLE && window.__sffFamily, null, { timeout: 20000 }); await p.waitForTimeout(1500);
  const fam = await p.evaluate(() => window.__sffFamily.famId);
  const errlog = async () => (await db.collection(`families/${fam}/errlog`).get()).docs.map(d => d.data());
  ok((await errlog()).some(r => r.where === 'stuck:start' && r.msg === 'queued while offline'), 'a failure queued without a connection is sent on the next start');
  ok(await p.evaluate(() => localStorage.getItem('sff_errq')) === null, 'the queue is empty afterwards');
  await p.evaluate(() => { setTimeout(() => { throw new Error('monitor-test boom'); }, 0); Promise.reject(new Error('monitor-test rejected')); });
  await p.waitForTimeout(1500);
  await p.evaluate(() => { setTimeout(() => { throw new Error('monitor-test boom'); }, 0); });
  await p.waitForTimeout(1500);
  const L = await errlog();
  ok(L.filter(r => r.where === 'js' && /monitor-test boom/.test(r.msg)).length === 1, 'an uncaught error → errlog, once (the same error again is not repeated)');
  ok(L.some(r => r.where === 'promise' && /monitor-test rejected/.test(r.msg)), 'a rejected promise → errlog');
  ok(L.find(r => r.where === 'js').ver.startsWith('sff-v'), 'the record has the app version');
  await b.close();

  // ---- 3: the server
  const now = Date.now(), B = (f, id) => db.doc(`families/${f}/builds/${id}`);
  // a family: a build idle 35 min, a build past 3 h, a build whose AI calls are old but whose progress is fresh (a server build)
  await B('famStuckA1', 'idle').set({ status: 'running', at: now - 50 * 60e3, last: now - 35 * 60e3, calls: 9, kind: 'free', subject: 'מתמטיקה', month });
  await B('famStuckA1', 'moving').set({ status: 'running', srv: true, at: now - 45 * 60e3, last: now - 40 * 60e3, progAt: now - 2 * 60e3, calls: 12, kind: 'free', subject: 'אנגלית', month });
  await B('famStuckB1', 'old').set({ status: 'running', at: now - 4 * 36e5, calls: 2, kind: 'free', subject: 'מדעים', month });
  await db.doc(`families/famStuckB1/usage/${month}`).set({ builds: 1, month });
  // a teacher's group: its build counts on the teacher (teachers/{uid}/usage), the teacher near the $12 cap
  await db.doc('families/grpTest0001').set({ kind: 'class', ownerUid: 'teacherT1', name: 'כיתה ד סגולה', teacherName: 'המורה דנה' });
  await B('grpTest0001', 'gold').set({ status: 'running', srv: true, at: now - 4 * 36e5, calls: 1, kind: 'free', subject: 'מדעים', month });
  await db.doc('teachers/teacherT1').set({ builds: 2 });
  await db.doc(`teachers/teacherT1/usage/${month}`).set({ builds: 2, usd: 10, month });
  for (let i = 0; i < 3; i++) await B('famFail' + i + 'xx', 'f').set({ status: 'failed', at: now - 2 * 36e5, endedAt: now - 36e5, calls: 4, kind: 'free', month });
  for (let i = 0; i < 3; i++) await db.collection(`families/famSpike${i}x/errlog`).add({ at: now - 10 * 60e3, where: 'build:write', code: 'internal', msg: 'same failure', subject: '', ver: 'sff-v999', by: 'נועה' });
  await db.doc(`families/famRich01/usage/${month}`).set({ usd: 7.1, month });
  await db.doc(`meta/ai_day_${day}`).set({ usd: 3, res: { deadcall1: { usd: 0.4, at: now - 20 * 60e3 } } }, { merge: true });

  const r401 = await fetch(URL); ok(r401.status === 401, 'healthReport without the key → 401');
  const rBad = await fetch(URL, { headers: { Authorization: 'Bearer wrong-key-wrong-key-1234' } }); ok(rBad.status === 401, 'a wrong key → 401');
  const H = { headers: { Authorization: 'Bearer ' + key } };
  const r1 = await fetch(URL + '?since=' + (now - 2 * 36e5), H); ok(r1.ok, 'healthReport with the key → ' + r1.status);
  const j = await r1.json(), F = j.newFindings || [], has = (kind, code, re) => F.some(f => f.kind === kind && f.code === code && (!re || re.test(f.msg)));
  ok(has('stuck', 'build', /no AI call or progress for 35 min .*family /), 'a build idle 35 min is reported');
  ok((await B('famStuckA1', 'idle').get()).data().status === 'running', '… and left running (the parent can still resume it)');
  ok(!F.some(f => /אנגלית/.test(f.msg)), 'a server build that is still making progress is not reported');
  ok(has('stuck', 'build_abandoned', /family .*refunded/), 'a family build past 3 hours is closed and refunded');
  const old = (await B('famStuckB1', 'old').get()).data(), use = (await db.doc(`families/famStuckB1/usage/${month}`).get()).data();
  ok(old.status === 'failed' && old.err === 'build_closed' && use.builds === 0 && use.refunds === 1, '… failed / build_closed, the free build given back to the family');
  ok(has('stuck', 'build_abandoned', /group [0-9a-f]{6} \(teacher [0-9a-f]{6}\).*refunded/), 'a group build past 3 hours is closed, named only by hashes');
  const tu = (await db.doc(`teachers/teacherT1/usage/${month}`).get()).data(), tt = (await db.doc('teachers/teacherT1').get()).data();
  ok(tu.builds === 1 && tu.refunds === 1 && tt.builds === 1 && !(await db.doc(`families/grpTest0001/usage/${month}`).get()).exists, '… refunded on the TEACHER\'s quota, nothing on the group');
  ok(has('stuck', 'ai_call'), 'an AI call that never returned is reported');
  ok(has('spike', 'build:write|internal', /3 families/), 'the same failure in 3 families → spike');
  ok(has('warn', 'builds_failing'), 'many failed builds → early warning');
  ok(has('warn', 'family_cap', /family [0-9a-f]{6} used \$7\.10 of the \$8/), 'a family near its $8 cap → early warning');
  ok(has('warn', 'teacher_cap', /teacher [0-9a-f]{6} used \$10\.00 of the \$12/), 'a teacher near the $12 cap (all groups) → early warning');
  const all = JSON.stringify(j);
  ok(!/famRich01|famStuck|famSpike|grpTest0001|teacherT1/.test(all), 'families, groups and teachers appear only as a short hash');
  ok(!/נועה|דנה|סגולה|הורה/.test(all), 'no kid, teacher, parent or group names in the report');
  ok(j.clientErrors.some(g => g.where === 'js' && g.count === 1) && j.clientErrors.some(g => g.where === 'build:write' && g.families === 3), 'the users\' failures, grouped: ' + j.clientErrors.map(g => g.where + '×' + g.count).join(', '));
  ok(j.serverLog.some(r => r.fn === 'watchdog' && r.kind === 'spike'), 'the findings are in the server log too (red dot, email)');
  ok(j.problems > 0 && j.aiSpendToday.cap === 100, 'problems ' + j.problems + ', AI spend today $' + j.aiSpendToday.usd);
  const j2 = await (await fetch(URL, H)).json();
  ok(j2.newFindings.length === 0, 'the next call: nothing new (each finding is reported once)');
  ok(j2.serverLog.length === 0 || j2.serverLog.every(r => Date.parse(r.at) > Date.parse(j.now) - 5000), 'the next call starts where the last one ended');
  process.exit(process.exitCode || 0);
})().catch(e => { console.error('FAIL', e); process.exit(1); });
