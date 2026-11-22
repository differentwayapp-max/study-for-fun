// The teacher area, stage 4 – assignments, on the emulators (functions, firestore, auth) with the real rules:
// 1. a group with 4 approved students; the teacher gives 3 assignments in 3 steps (what → to whom → by when):
//    to all, to a choice (with "need strengthening" from the report), to one student; + "core facts again in two weeks";
// 2. one shared set each – no kid's id or name in it; a student's phone sees only what was given to all or to it, and the
//    rules refuse it the others even when asked directly;
// 3. the student's home: "📚 מהמורה … – עד …" with progress; past its date it stays, marked;
// 4. the teacher's home: "x/y סיימו" and a bar; who finished / is in the middle / did not start; close, delete;
// 5. "תרגול מהטעויות" from the student's card is made of the student's real mistakes, as a personal assignment;
// 6. a student's phone cannot write sets. Screenshots (OUT): the 3 steps, the student's home, the teacher's home – he/en, 360/320.
const { chromium } = require('playwright');
const APP = 'http://localhost:8765/', OUT = process.env.OUT || require('os').tmpdir();
const FS = 'http://127.0.0.1:8080', AUTH = 'http://127.0.0.1:9099', PROJ = 'study-for-fun-7b03c', DOCS = `${FS}/v1/projects/${PROJ}/databases/(default)/documents`;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) process.exitCode = 1; };
const enc = v => v === null || v === undefined ? { nullValue: null } : typeof v === 'boolean' ? { booleanValue: v } : typeof v === 'number' ? (Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v })
  : typeof v === 'string' ? { stringValue: v } : Array.isArray(v) ? { arrayValue: { values: v.map(enc) } } : { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, enc(x)])) } };
const val = v => v == null ? null : 'integerValue' in v ? +v.integerValue : 'doubleValue' in v ? v.doubleValue : 'stringValue' in v ? v.stringValue : 'booleanValue' in v ? v.booleanValue : 'mapValue' in v ? Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, val(x)])) : 'arrayValue' in v ? (v.arrayValue.values || []).map(val) : null;
const put = (path, obj, mask, H = { Authorization: 'Bearer owner' }, q = '') => fetch(`${DOCS}/${path}${mask ? '?' + mask.map(m => 'updateMask.fieldPaths=' + m).join('&') : q}`, { method: 'PATCH', headers: { ...H, 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, enc(v)])) }) }).then(r => r.status);
const get = async (path, H = { Authorization: 'Bearer owner' }) => { const r = await fetch(`${DOCS}/${path}`, { headers: H }); if (!r.ok) return r.status; const d = await r.json(); return Object.fromEntries(Object.entries(d.fields || {}).map(([k, x]) => [k, val(x)])); };
const list = async path => ((await (await fetch(`${DOCS}/${path}?pageSize=100`, { headers: { Authorization: 'Bearer owner' } })).json()).documents || []).map(d => ({ id: d.name.split('/').pop(), ...Object.fromEntries(Object.entries(d.fields || {}).map(([k, x]) => [k, val(x)])) }));
const anon = async () => { const r = await (await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"returnSecureToken":true}' })).json(); return { uid: r.localId, H: { Authorization: 'Bearer ' + r.idToken } }; };
const EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' };
const KIDS = [['k1', 'נועה כ.'], ['k2', 'יונתן ב.'], ['k3', 'מאיה ש.'], ['k4', 'איתי ר.']];
(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const errs = [];
  const ctx = async (o = {}) => { const c = await b.newContext({ viewport: { width: o.w || 360, height: o.h || 740 } });
    await c.addInitScript(([E, g, l]) => { window.SFF_REST_EMU = E; if (g) window.SFF_TEST_GOOGLE = g; localStorage.setItem('sff_lang', l); }, [EMU, o.google || null, o.lang || 'he']); return c; };
  const GOOGLE = { sub: 'teacherA4', email: 'teachera4@t.local', email_verified: true, name: 'דנה לוי' };
  const teacher = async (o = {}) => { const c = await ctx({ google: GOOGLE, ...o }), p = await c.newPage(); p.on('pageerror', e => errs.push('teacher: ' + e.message + ' @ ' + String(e.stack || '').split('\n').slice(1, 3).join(' ')));
    await p.goto(APP, { waitUntil: 'load' }); await p.waitForSelector('#fbTeach', { timeout: 20000 }); await p.click('#fbTeach');
    if (o.first) { await p.waitForSelector('#tsClass'); await p.click('#tsClass'); await p.fill('#tsName', "ד'2 – אנגלית"); await p.click('#tsGo'); }
    await p.waitForFunction(() => window.SFF_KIND === 'class', null, { timeout: 30000 }); await p.waitForTimeout(1500); return { c, p }; };

  console.log('1. a group with 4 approved students');
  const T0 = await teacher({ first: true }), T = T0.p;
  const cid = await T.evaluate(() => window.__sffFamily.famId);
  const tokens = Object.fromEntries(KIDS.map(([id]) => [id, 'TOK' + id + 'x'.repeat(20)]));
  await put(`families/${cid}`, { kidTokens: tokens }, ['kidTokens']);
  await put(`families/${cid}/fam/kids`, { list: KIDS.map(([id, name]) => ({ id, name, grade: 2, color: '#2F6BFF' })) });
  for (const [id, name] of KIDS) { await put(`families/${cid}/consents/${id}`, { status: 'digital', letterV: '0.9', at: Date.now(), parentName: 'הורה של ' + name });
    await put(`families/${cid}/kidpub/${id}`, { list: [{ id, name, grade: 2 }] }); }
  // יונתן struggles in "Animals" (the report of stage 3 → "need strengthening")
  await put(`families/${cid}/progress/k2`, { history: [{ at: Date.now() - 864e5, kidId: 'k2', kid: 'יונתן ב.', subject: 'אנגלית', grade: 2, setId: 'old', ch: 0, right: 2, n: 10, score: 20, mode: 'choice', qr: [], topics: { Animals: { r: 2, n: 10 } } }], profile: {} });
  await T.waitForFunction(() => trStudents().length === 4 && history.length >= 1, null, { timeout: 20000 }).catch(() => {});
  ok(await T.evaluate(() => trStudents().length === 4), 'the teacher sees 4 students');

  console.log('2. three assignments in 3 steps');
  const PICK = ['Animals', 'ABC order'];
  // (a) to all – through the dialogs, with screenshots
  await T.evaluate(() => { go('kids'); asgOpen(); }); await T.waitForSelector('#tDlg .aopt', { timeout: 5000 });
  ok(await T.evaluate(() => /מהקטלוג/.test(document.getElementById('tDlg').innerText) && /בנייה מהחומר שלך/.test(document.getElementById('tDlg').innerText)), 'step 1 "what": the catalog, a build from your own material');
  await T.screenshot({ path: `${OUT}/a_step1_he.png` });
  await T.evaluate(p => asgFromCatalog('en3-0e3c80', p), PICK); await T.waitForSelector('#tDlg .aradio', { timeout: 10000 });
  await T.screenshot({ path: `${OUT}/a_step2_he.png` });
  await T.click('#tDlg .actions .btn'); await T.waitForSelector('#asgDue', { timeout: 5000 });
  await T.screenshot({ path: `${OUT}/a_step3_he.png` });
  await T.evaluate(() => { ASG.due = isoDay(4); ASG.review = true; asgRender(); }); await T.waitForTimeout(300);
  await T.click('#asgGo'); await T.waitForTimeout(2500);
  // (b) to a choice: "need strengthening" picks יונתן
  await T.evaluate(p => { asgOpen(); return asgFromCatalog('en3-0e3c80', p); }, ['Animals']); await T.waitForSelector('#tDlg .aradio', { timeout: 10000 });
  await T.evaluate(() => { ASG.to = 'pick'; asgRender(); }); await T.waitForTimeout(300);
  const need = await T.evaluate(() => asgNeed(ASG.base));
  ok(need.join() === 'k2', '"need strengthening" (struggling in a topic of this subject): ' + need.join());
  await T.evaluate(() => { ASG.pick = new Set(asgNeed(ASG.base)); asgRender(); }); await T.waitForTimeout(200); await T.screenshot({ path: `${OUT}/a_step2_pick_he.png` });
  await T.evaluate(() => { asgNext2(); ASG.due = isoDay(6); asgSave(); }); await T.waitForTimeout(1500);
  // (c) to one student
  await T.evaluate(p => { asgOpen(); return asgFromCatalog('en3-0e3c80', p); }, ['ABC order']); await T.waitForSelector('#tDlg .aradio', { timeout: 10000 });
  await T.evaluate(() => { ASG.to = 'one'; ASG.one = 'k3'; asgNext2(); ASG.due = isoDay(2); asgSave(); }); await T.waitForTimeout(3000);
  const docs = (await list(`families/${cid}/sets`)).map(d => ({ id: d.id, ...d.set }));
  const all = docs.find(d => d.to === 'all' && !(d.ass && d.ass.review)), rev = docs.find(d => d.ass && d.ass.review), pick = docs.find(d => Array.isArray(d.to) && d.to.join() === 'k2'), one = docs.find(d => Array.isArray(d.to) && d.to.join() === 'k3');
  ok(all && pick && one && rev && docs.length === 4, `4 shared sets in the group: to all (${all && all.due}), to [k2], to [k3], and the review (starts ${rev && rev.ass.start})`);
  ok(docs.every(d => !('kidId' in d) && !('name' in d) && d.ass && d.ass.by && d.due && d.examDate === d.due), 'none has a kid\'s id or name; each has due (= its examDate), ass.by');
  ok(rev && rev.questions.every(q => q.core) && rev.questions.length > 0 && rev.ass.start > all.due && rev.to === 'all' && rev.questions.length < 44, `"core facts again in two weeks": ${rev && rev.questions.length} core questions, from ${rev && rev.ass.start}`);

  console.log("3. the students' phones");
  const kidLink = id => `${APP}?f=${cid}&t=${tokens[id]}&k=${id}`;
  const kidPage = async (id, o = {}) => { const c = await ctx(o), p = await c.newPage(); p.on('pageerror', e => errs.push(id + ': ' + e.message)); await p.goto(kidLink(id), { waitUntil: 'load' });
    await p.waitForFunction(() => typeof sets !== 'undefined' && sets.filter(s => !s.demo).length > 0, null, { timeout: 25000 }).catch(() => {}); await p.waitForTimeout(2500); return { c, p }; };
  const seen = async p => p.evaluate(() => ({ sets: sets.filter(s => !s.demo).map(s => s.id).sort(), mine: kidSets(kids[0]).map(s => s.id).sort(), bar: document.getElementById('asgBar').innerText.replace(/\s+/g, ' ') }));
  const K1 = await kidPage('k1'), K2 = await kidPage('k2'), K3 = await kidPage('k3');
  const s1 = await seen(K1.p), s2 = await seen(K2.p), s3 = await seen(K3.p);
  const ids = x => x.sort().join();
  ok(ids(s1.sets.filter(i => i !== rev.id)) === ids([all.id]) && !s1.mine.includes(rev.id), 'נועה (not chosen): only the assignment to all (the review waits for its day)');
  ok(ids(s2.sets.filter(i => i !== rev.id)) === ids([all.id, pick.id]), 'יונתן: the one to all + the one chosen for him');
  ok(ids(s3.sets.filter(i => i !== rev.id)) === ids([all.id, one.id]), 'מאיה: the one to all + her personal one');
  ok(/מהמורה/.test(s1.bar) && /דנה לוי/.test(s1.bar) && /עד יום|עד /.test(s1.bar) && /0\/\d+/.test(s1.bar), 'the home screen: "📚 מהמורה דנה לוי – עד …" with progress – ' + s1.bar.slice(0, 80));
  await K2.p.screenshot({ path: `${OUT}/a_kid_he.png` });
  // the rules, asked directly: a student's phone reads only what is for it, and writes no set
  const dev = await anon(); ok(await put(`families/${cid}/devices/${dev.uid}`, { token: tokens.k1, kid: 'k1', at: Date.now() }, null, dev.H, '?currentDocument.exists=false') === 200, '(a phone joins as נועה)');
  ok(typeof (await get(`families/${cid}/sets/${all.id}`, dev.H)) === 'object' && await get(`families/${cid}/sets/${pick.id}`, dev.H) === 403 && await get(`families/${cid}/sets/${one.id}`, dev.H) === 403,
    'rules: נועה\'s phone reads the assignment to all – not יונתן\'s or מאיה\'s, even asked directly');
  ok(await put(`families/${cid}/sets/x1`, { set: { id: 'x1', to: 'all', questions: [] } }, null, dev.H) === 403 && await put(`families/${cid}/sets/${all.id}`, { set: { id: all.id, to: 'all' } }, null, dev.H) === 403, '…and cannot write a set');
  ok(await put(`families/${cid}/sets/x2`, { set: { id: 'x2', to: 'all', kidId: 'k1', name: 'נועה', questions: [] } }) === 200 && await T.evaluate(async () => { try { await DB.collection('sets').doc('x3').set({ set: { id: 'x3', to: 'all', kidId: 'k1', name: 'נועה' } }); return 'ok'; } catch (e) { return e.code || 'err'; } }) !== 'ok',
    'rules: the teacher cannot write a shared set with a kid\'s id or name in it');

  console.log("4. progress: the teacher's home");
  // נועה finishes the assignment to all; יונתן plays one chapter
  const play = async (p, id, kid, chs) => p.evaluate(([id, kid, chs]) => { const s = getSet(id), C = getChapters(s); (chs === 'all' ? C.map((_, i) => i) : chs).forEach((ch, k) => {
      const qs = C[ch].qs; history.unshift({ at: Date.now() - 1000 * (k + 1), kidId: kid, kid: '', subject: s.subject, grade: s.grade, setId: s.id, retry: false, topic: C[ch].title, ch, right: qs.length, n: qs.length, score: 100, mode: 'choice',
        qr: qs.map(q => s.questions.indexOf(q) + '.1'), qk: qs.map(q => tkey(q.question)), topics: { [qs[0].topic]: { r: qs.length, n: qs.length } } }); }); saveHistoryLocal(); pushProgress(kid); renderKidSets(); }, [id, kid, chs]);
  await play(K1.p, all.id, 'k1', 'all'); await play(K2.p, all.id, 'k2', [0]);
  await K1.p.waitForTimeout(2500);
  await T.evaluate(() => go('kids')); await T.waitForFunction(id => { const s = getSet(id); return s && asgState(s).done.length === 1 && asgState(s).mid.length === 1; }, all.id, { timeout: 20000 }).catch(() => {});
  const st = await T.evaluate(id => { const s = getSet(id), x = asgState(s); return { done: x.done.map(k => k.id), mid: x.mid.map(k => k.id), none: x.none.map(k => k.id), row: [...document.querySelectorAll('.tasg')].map(e => e.innerText.replace(/\s+/g, ' ')) }; }, all.id);
  ok(st.done.join() === 'k1' && st.mid.join() === 'k2' && st.none.length === 2, `the assignment to all: finished נועה, in the middle יונתן, not started 2`);
  ok(st.row.some(r => /1\/4 סיימו/.test(r) && /1 באמצע/.test(r)), 'the teacher\'s home: "1/4 סיימו · 1 באמצע" with a bar – ' + (st.row[0] || '').slice(0, 70));
  ok(await K1.p.evaluate(() => /\d+\/\d+/.test(document.getElementById('asgBar').innerText) && document.querySelector('.kasg .mbar span').style.width === '100%'), 'נועה\'s home: the bar is full');
  await T.screenshot({ path: `${OUT}/a_teacher_home_he.png`, fullPage: true });
  await T.evaluate(id => tAsg(id), all.id); await T.waitForTimeout(300); await T.screenshot({ path: `${OUT}/a_teacher_asg_he.png` });
  ok(await T.evaluate(() => /סיימו · 1/.test(document.getElementById('tDlg').innerText) && /באמצע · 1/.test(document.getElementById('tDlg').innerText) && /עוד לא התחילו · 2/.test(document.getElementById('tDlg').innerText)), 'tapping it: who finished, who is in the middle, who did not start');
  await T.evaluate(() => tClose());

  console.log('5. past its date: it stays, marked');
  await T.evaluate(id => { const s = getSet(id); s.due = s.examDate = isoDay(-1); store.save(); }, one.id); await K3.p.waitForTimeout(3500);
  const late = await K3.p.evaluate(id => ({ bar: document.getElementById('asgBar').innerText, still: kidSets(kids[0]).some(s => s.id === id), done: setDone(getSet(id)) }), one.id);
  ok(late.still && !late.done && /התאריך עבר/.test(late.bar), 'מאיה\'s personal one, a day late: still on her home, marked "⏰ התאריך עבר"');
  await K3.p.screenshot({ path: `${OUT}/a_kid_late_he.png` });

  console.log('6. practice from the mistakes');
  // מאיה gets 4 questions wrong in her assignment
  const wrong = await K3.p.evaluate(id => { const s = getSet(id), qs = getChapters(s)[0].qs.slice(0, 8); const bad = qs.slice(0, 4);
    history.unshift({ at: Date.now(), kidId: 'k3', kid: '', subject: s.subject, grade: s.grade, setId: s.id, retry: false, topic: '', ch: 0, right: 4, n: 8, score: 40, mode: 'choice',
      qr: qs.map(q => s.questions.indexOf(q) + '.' + (bad.includes(q) ? 0 : 1)), qk: qs.map(q => tkey(q.question)), topics: { [qs[0].topic]: { r: 4, n: 8 } } }); saveHistoryLocal(); pushProgress('k3'); return bad.map(q => tkey(q.question)).sort(); }, one.id);
  await T.waitForFunction(() => history.some(h => h.kidId === 'k3' && h.right === 4), null, { timeout: 15000 }).catch(() => {});
  await T.evaluate(() => tStudent('k3')); await T.waitForTimeout(400);
  ok(await T.evaluate(() => /תרגול מהטעויות/.test(document.getElementById('tDlg').innerText)), 'the student\'s card: "🎯 תרגול מהטעויות"');
  await T.evaluate(() => tMistakes('k3')); await T.waitForTimeout(2500);
  const m = (await list(`families/${cid}/sets`)).map(d => d.set).find(d => d.ass && d.ass.mist);
  const mk = await T.evaluate(id => getSet(id).questions.map(q => tkey(q.question)).sort(), m && m.id);
  ok(m && Array.isArray(m.to) && m.to.join() === 'k3' && mk.join() === wrong.join(), `a personal assignment for מאיה made of her 4 real mistakes (no AI)`);

  console.log('7. close, delete');
  await T.evaluate(id => asgClose(id), pick.id); await K2.p.waitForTimeout(3500);
  ok(await K2.p.evaluate(id => !sets.filter(s => asgLive(s)).some(s => s.id === id) && kidSets(kids[0]).some(s => s.id === id), pick.id),
    'closed: off the top of יונתן\'s home, the practice set stays his');
  await T.evaluate(id => { const s = getSet(id); sets = sets.filter(x => x !== s); store.save(); rerender(); }, one.id); await T.waitForTimeout(2500);
  ok(await get(`families/${cid}/sets/${one.id}`) === 404, 'deleted: gone from the group');

  console.log('8. the quota message, and screenshots: English, 320');
  { const uid = await T.evaluate(() => window.SFF_UID), mk = await T.evaluate(() => monthKeyIL());
    await put(`teachers/${uid}/usage/${mk}`, { builds: 5, month: mk });
    await T.evaluate(() => { tClose(); openWizard(null); W.subject = 'אנגלית'; wizRender(); }); await T.waitForTimeout(1500);
    const q = await T.evaluate(() => ({ t: document.getElementById('quotaLine').innerText, off: document.getElementById('btnBuild').disabled }));
    ok(/ניצלת את 5 הבניות של החודש – מתחדש ב-/.test(q.t) && !/₪|תשלום/.test(q.t), 'all 5 used: "ניצלת את 5 הבניות של החודש – מתחדש ב-1 לחודש" (no payment) – ' + q.t.trim());
    await T.screenshot({ path: `${OUT}/a_quota_he360.png` }); }
  for (const [w, lang] of [[360, 'en'], [320, 'he'], [320, 'en']]) {
    const tag = lang + w, X = await teacher({ w, h: w === 320 ? 640 : 740, lang }); const p = X.p;
    await p.waitForFunction(() => trStudents().length === 4, null, { timeout: 20000 }).catch(() => {});
    await p.evaluate(() => go('kids')); await p.waitForTimeout(800); await p.screenshot({ path: `${OUT}/a_teacher_home_${tag}.png`, fullPage: true });
    await p.evaluate(() => asgOpen()); await p.waitForTimeout(800); await p.screenshot({ path: `${OUT}/a_step1_${tag}.png` });
    await p.evaluate(() => asgFromCatalog('en3-0e3c80', ['Animals'])); await p.waitForSelector('#tDlg .aradio', { timeout: 10000 }); await p.evaluate(() => { ASG.to = 'pick'; ASG.pick = new Set(asgNeed(ASG.base)); asgRender(); }); await p.waitForTimeout(400);
    await p.screenshot({ path: `${OUT}/a_step2_${tag}.png` });
    await p.evaluate(() => asgNext2()); await p.waitForTimeout(400); await p.screenshot({ path: `${OUT}/a_step3_${tag}.png` });
    await p.evaluate(() => { tClose(); openWizard(null); W.subject = 'אנגלית'; wizRender(); }); await p.waitForTimeout(1500); await p.screenshot({ path: `${OUT}/a_quota_${tag}.png` });
    if (lang === 'en') { const qt = await p.evaluate(() => document.getElementById('quotaLine').innerText); ok(/You've used this month's 5 builds/.test(qt), `${tag}: the quota message in English – ${qt.trim()}`); }
    await p.evaluate(() => go('kids'));
    const wide = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    const heb = lang === 'en' ? await p.evaluate(() => { const c = document.getElementById('tDlg').cloneNode(true); c.querySelectorAll('[translate="no"],bdi').forEach(x => x.remove()); return (c.innerText.match(/[^\n]*[֐-׿][^\n]*/g) || []); }) : [];
    ok(!wide && !heb.length, `${tag}: no sideways scroll${lang === 'en' ? ', no Hebrew left in the steps' + (heb.length ? ' – ' + heb.slice(0, 4).join(' | ') : '') : ''}`);
    await X.c.close();
    const KX = await kidPage('k2', { w, h: w === 320 ? 640 : 740, lang }); await KX.p.screenshot({ path: `${OUT}/a_kid_${tag}.png` });
    if (lang === 'en') { const h2 = await KX.p.evaluate(() => { const c = document.getElementById('asgBar').cloneNode(true); c.querySelectorAll('[translate="no"],bdi').forEach(x => x.remove()); return c.innerText.match(/[֐-׿]+/g) || []; });
      ok(!h2.length, `${tag}: the student's bar in English ${h2.join(' ')}`); }
    await KX.c.close();
  }
  ok(!errs.length, 'no page errors ' + errs.slice(0, 3).join(' | '));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
