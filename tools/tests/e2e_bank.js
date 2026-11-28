// The question bank, stage 1 (functions/index.js: bankAfterBuild, bankWatch), on the emulators (functions, firestore, auth)
// with the fake AI:
// 1. after a server build: its own checked questions go into qbank (never a ready catalog question, never one with a kid's
//    name, never one the bank step leaves out), with no family, kid, build or set id; the topic index counts them;
// 2. the measure: the first build had an empty bank (0), a second build on the same topics could have taken questions
//    from it (questions and money on the build and in meta/qbank_<month>); no build takes questions from the bank yet;
// 3. a question the parent changes or deletes leaves the bank; a whole set deleted does not take questions out;
// 4. the app cannot call the server's own "bank" step, and no parent can read the bank.
const { chromium } = require('playwright');
const PROJ = 'study-for-fun-7b03c', DOCS = `http://127.0.0.1:8080/v1/projects/${PROJ}/databases/(default)/documents`, H = { Authorization: 'Bearer owner' };
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) process.exitCode = 1; };
const val = v => v == null ? null : 'integerValue' in v ? +v.integerValue : 'doubleValue' in v ? v.doubleValue : 'stringValue' in v ? v.stringValue : 'mapValue' in v ? Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, val(x)])) : 'arrayValue' in v ? (v.arrayValue.values || []).map(val) : 'booleanValue' in v ? v.booleanValue : 'nullValue' in v ? null : null;
const get = async path => { const d = await (await fetch(`${DOCS}/${path}`, { headers: H })).json(); return d.fields ? Object.fromEntries(Object.entries(d.fields).map(([k, x]) => [k, val(x)])) : null; };
const list = async path => { let out = [], tok = '';
  do { const r = await (await fetch(`${DOCS}/${path}?pageSize=300${tok ? '&pageToken=' + tok : ''}`, { headers: H })).json();
    out = out.concat((r.documents || []).map(d => ({ id: d.name.split('/').pop(), ...Object.fromEntries(Object.entries(d.fields || {}).map(([k, x]) => [k, val(x)])) }))); tok = r.nextPageToken || ''; } while (tok);
  return out; };
const until = async (f, ms = 30000) => { const t = Date.now(); let v; while (!(v = await f()) && Date.now() - t < ms) await new Promise(r => setTimeout(r, 500)); return v; };
(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.context().addInitScript(() => { window.SFF_REST_EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' }; window.SFF_FAKE_AI = true;
    window.SFF_AI_ENABLED = true; window.SFF_TEST_GOOGLE = { sub: 'bank1', email: 'bank1@t.local', email_verified: true, name: 'הורה' }; localStorage.setItem('sff_lang', 'he'); });
  await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(2500); if (await p.$('#fbGo')) await p.click('#fbGo');
  await p.waitForFunction(() => window.SFF_ROLE && window.__sffAI && typeof sample !== 'undefined' && sample, null, { timeout: 25000 }); await p.waitForTimeout(1000);
  await p.evaluate(() => document.getElementById('onb')?.remove());
  const fam = await p.evaluate(() => window.__sffFamily.famId), month = await p.evaluate(() => monthKeyIL());
  await p.evaluate(() => { kids.push({ id: 'k1', name: 'נועה', grade: 3, color: '#2F6BFF' }); saveKids(); });
  await p.waitForTimeout(1500);

  const runBuild = async topics => {
    await p.evaluate(t => { openWizard('k1'); W.subject = 'אנגלית'; $('fTopics').value = t; W.step = 4; wizRender(); build(); }, topics);
    await p.waitForFunction(() => CUR_BUILD && CUR_BUILD !== 'send', null, { timeout: 60000 });
    const id = await p.evaluate(() => CUR_BUILD);
    // the bank runs right after the set is written: wait for its numbers on the build
    const bd = await until(async () => { const d = await get(`families/${fam}/builds/${id}`); return d && d.status === 'done' && d.bank ? d : null; }, 180000);
    return bd || {};
  };
  // "!private": the fake bank step leaves these out; "נועה": the kid's name
  const T = 'Short vowels\nMagic e\nPets !private\nנועה and colors';

  console.log('1. a build fills the bank');
  const b1 = await runBuild(T);
  ok(b1.status === 'done' && b1.bank, 'the build is done and has its bank numbers ' + JSON.stringify(b1.bank));
  const set1 = await get(`families/${fam}/sets/${b1.setId}`);
  const qs1 = (set1 && set1.set && set1.set.questions) || [], own1 = qs1.filter(q => !q.srcq);
  let bank = await list('qbank');
  const texts = new Set(bank.map(x => x.q && x.q.question));
  ok(bank.length > 0 && bank.length === b1.bank.added, `${bank.length} questions went into the bank (${own1.length} new in the set)`);
  ok(!bank.some(x => qs1.some(q => q.srcq && q.question === x.q.question)), 'no ready catalog question went in');
  ok(!bank.some(x => /!private/.test(x.q.question)) && own1.some(q => /!private/.test(q.question)), 'what the bank step leaves out (a real person, the family\'s material) stays out');
  ok(!bank.some(x => /נועה/.test(JSON.stringify(x.q))) && own1.some(q => /נועה/.test(q.question)), 'a question with a kid\'s name (in its text or its topic) stays out');
  ok(b1.bank.skipped === own1.length - bank.length, `the left-out ones are counted (${b1.bank.skipped})`);
  const keys = new Set(bank.flatMap(x => Object.keys(x)));
  ok(!['fam', 'famId', 'kidId', 'by', 'buildId', 'setId', 'uid'].some(k => keys.has(k)) && !JSON.stringify(bank).includes(fam), 'a bank question keeps no family, kid, build or set id');
  ok(bank.every(x => x.live === true && x.gi === 3 && x.subject === 'אנגלית' && x.q.options.length === 4), 'each one: grade, subject, topic, the question – live');
  const idx = (await list('qbankIdx'))[0] || {};
  const n = Object.values(idx.topics || {}).reduce((a, t) => a + t.n, 0);
  ok(n === bank.length, `the topic index counts them (${n})`);
  ok(b1.bank.could === 0 && b1.bank.usd === 0 && b1.bank.cost > 0, 'the measure: an empty bank could have given nothing ' + JSON.stringify(b1.bank));

  console.log('2. a second build on the same topics: the measure');
  const b2 = await runBuild(T);
  ok(b2.bank.could > 0 && b2.bank.usd > 0 && b2.bank.usd <= b2.bank.cost, `the bank could have given ${b2.bank.could} of ${b2.bank.of} questions ($${b2.bank.usd} of $${b2.bank.cost})`);
  const set2 = await get(`families/${fam}/sets/${b2.setId}`);
  ok(!set2.set.questions.some(q => /bank|qbank/.test(Object.keys(q).join(' '))), 'no build takes questions from the bank yet');
  const m = await get(`meta/qbank_${month}`);
  ok(m && m.builds === 2 && m.could === b2.bank.could && m.added === (await list('qbank')).length, 'the month adds it up ' + JSON.stringify(m));

  console.log('3. a question the parent changes or deletes leaves the bank');
  const before = (await list('qbank')).filter(x => x.live).length;
  const edit = await p.evaluate(id => { const s = sets.find(s => s.id === id); const own = s.questions.filter(q => !q.srcq && !/!private|נועה/.test(q.question));
    const del = own[0].question, ch = own[1].question; s.questions = s.questions.filter(q => q.question !== del);
    const q = s.questions.find(q => q.question === ch); q.options = [...q.options]; q.options[1] = 'שונה'; store.save(); return { del, ch }; }, b1.setId);
  const outs = await until(async () => { const L = await list('qbank'); const o = L.filter(x => !x.live); return o.length >= 2 ? L : null; }, 30000) || [];
  const gone = outs.filter(x => !x.live).map(x => x.q.question);
  ok(gone.includes(edit.del) && gone.includes(edit.ch) && gone.length === 2, 'the deleted question and the changed one are out of the bank (and nothing else)');
  ok(outs.filter(x => !x.live).every(x => x.out === 'edited'), 'marked as taken out by the parent');
  const idx2 = (await list('qbankIdx'))[0] || {};
  ok(Object.values(idx2.topics).reduce((a, t) => a + t.n, 0) === before - 2, 'the topic index counts them out');
  await p.evaluate(id => { sets = sets.filter(s => s.id !== id); store.save(); }, b2.setId);
  await new Promise(r => setTimeout(r, 4000));
  ok((await list('qbank')).filter(x => x.live).length === before - 2, 'a whole set deleted takes nothing out of the bank');
  ok((await get(`meta/qbank_${month}`)).out === 2, 'the month counts the ones taken out');

  console.log('4. the app cannot call the bank step, a parent cannot read the bank');
  const r = await p.evaluate(async () => { try { await (await window.claude.use('sample')).json('bank', { ctx: { gi: 3, grade: "ד'", subject: 'אנגלית', topics: ['x'] }, questions: [{ question: 'q', options: ['a', 'b', 'c', 'd'] }] }); return 'ok'; } catch (e) { return String(e.code || e.message); } });
  ok(r !== 'ok', 'the "bank" step is refused from the app: ' + r);
  const read = await p.evaluate(async () => { try { await window.__sffRoot.list('qbank'); return 'read'; } catch (e) { return 'denied'; } }).catch(() => 'denied');
  ok(read === 'denied', 'a parent cannot read the bank');
  ok(!errs.length, 'no page errors ' + errs.slice(0, 3).join(' | '));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
