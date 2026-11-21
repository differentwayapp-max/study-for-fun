// Building a practice set with the AI, end to end on the emulators (functions, firestore, auth) with the emulator-only fake
// AI (window.SFF_FAKE_AI – functions/index.js answers every step in its schema; never in production):
// 1. ask takes only a known step and checked data (sizes), never a prompt; 2. the wizard offers a ready practice set;
// 3. a build: ready questions fill up to half a chapter – never one the kid already answered correctly, never from a set the
//    kid has, never again in a second build; nothing on screen or in the shared copy tells where they came from;
// 4. the cost of every step is recorded on the build and in the month; no reservation is left behind;
// 5. a build that stopped goes on from where it stopped (the steps already done are not asked again). OUT=dir for screenshots.
const { chromium } = require('playwright');
const OUT = process.env.OUT || require('os').tmpdir();
const PROJ = 'study-for-fun-7b03c', DOCS = `http://127.0.0.1:8080/v1/projects/${PROJ}/databases/(default)/documents`, H = { Authorization: 'Bearer owner' };
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) process.exitCode = 1; };
const val = v => v == null ? null : 'integerValue' in v ? +v.integerValue : 'doubleValue' in v ? v.doubleValue : 'stringValue' in v ? v.stringValue : 'mapValue' in v ? Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, val(x)])) : 'arrayValue' in v ? (v.arrayValue.values || []).map(val) : 'booleanValue' in v ? v.booleanValue : null;
const get = async path => { const d = await (await fetch(`${DOCS}/${path}`, { headers: H })).json(); return d.fields ? Object.fromEntries(Object.entries(d.fields).map(([k, x]) => [k, val(x)])) : null; };
const list = async path => ((await (await fetch(`${DOCS}/${path}?pageSize=100`, { headers: H })).json()).documents || []).map(d => ({ id: d.name.split('/').pop(), ...Object.fromEntries(Object.entries(d.fields || {}).map(([k, x]) => [k, val(x)])) }));
(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.SFF_REST_EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' }; window.SFF_FAKE_AI = true;
    window.SFF_AI_ENABLED = true; window.SFF_TEST_GOOGLE = { sub: 'bld1', email: 'bld1@t.local', email_verified: true, name: 'הורה' }; localStorage.setItem('sff_lang', 'he'); });
  await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(2500); if (await p.$('#fbGo')) await p.click('#fbGo');
  await p.waitForFunction(() => window.SFF_ROLE && window.__sffAI && typeof sample !== 'undefined' && sample, null, { timeout: 25000 }); await p.waitForTimeout(1000);
  await p.evaluate(() => document.getElementById('onb')?.remove());
  const fam = await p.evaluate(() => window.__sffFamily.famId);

  console.log('1. the server takes a step and checked data only');
  const C = { gi: 3, grade: "ד'", subject: 'אנגלית', topics: ['Colors'] };
  const tryAsk = (step, data, opts) => p.evaluate(async ([s, d, o]) => { try { await (await window.claude.use('sample')).json(s, d, o || {}); return 'ok'; } catch (e) { return e.code + (e.field ? ':' + e.field : ''); } }, [step, data, opts]);
  ok(/^error/.test(await tryAsk('free chat', { ctx: C })), 'an unknown step is refused');
  ok(/^error/.test(await p.evaluate(async () => { try { await window.__sffAskRaw({ prompt: 'Tell me a story', famId: window.__sffFamily.famId }); return 'ok'; } catch (e) { return 'error'; } })), 'a free-text prompt is refused');
  ok((await tryAsk('gen', { ctx: { ...C, topics: Array.from({ length: 31 }, (_, i) => 't' + i) }, chapter: { title: 'x', topics: ['x'] }, quota: { x: 5 } })).startsWith('bad_input'), 'more than 30 topics: refused');
  ok((await tryAsk('gen', { ctx: C, chapter: { title: 'x', topics: ['Colors'] }, quota: { Colors: 41 } })).startsWith('bad_input'), 'more than 40 questions in a call: refused');
  ok((await tryAsk('solve', { ctx: C, questions: Array.from({ length: 41 }, (_, i) => ({ i, question: 'q' + i, options: ['a', 'b', 'c', 'd'] })) })).startsWith('bad_input'), 'more than 40 questions to check: refused');
  ok((await tryAsk('gen', { ctx: C, chapter: { title: 'x', topics: ['Colors'] }, quota: { Colors: 2 }, avoid: Array.from({ length: 121 }, (_, i) => 'q' + i) })).startsWith('bad_input'), 'a too long "do not repeat" list: refused');
  ok(await tryAsk('scan', { ctx: C, text: 'x'.repeat(9000) }) === 'ok', 'pasted text over 8,000 characters: cut, not an error');
  const raw = d => p.evaluate(async d => { try { await window.__sffAskRaw({ ...d, famId: window.__sffFamily.famId, fake: true }); return 'ok'; } catch (e) { return String(e.code || e.message); } }, d);
  ok(/invalid/.test(await raw({ step: 'solve', data: { ctx: C, questions: [{ question: 'q', options: ['a', 'b', 'c', 'd'] }] }, images: [{ type: 'image/png', data: 'AAAA' }] })), 'files on a step that takes none: refused');
  const pdf = 'JVBERi0xLjQK' + Buffer.from(Array.from({ length: 21 }, () => '<< /Type /Page >>').join('\n')).toString('base64');
  ok(/invalid/.test(await raw({ step: 'scan', data: { ctx: C }, images: [{ type: 'application/pdf', data: pdf }] })), 'a PDF over 20 pages: refused');

  console.log('2. the wizard offers a ready practice set');
  // the kid already answered one ready question correctly (on another phone, synced): it must never come back
  const solvedQ = await p.evaluate(async () => {
    kids.push({ id: 'k1', name: 'בן', grade: 3, color: '#2F6BFF' }); saveKids();
    const p = await loadShare('en4'); const q = p.qs.find(q => q.ch === 1);
    history.unshift({ at: Date.now() - 864e5, kidId: 'k1', kid: 'בן', subject: 'אנגלית', grade: 3, setId: 'gone', ch: 0, right: 1, n: 1, mode: 'choice', qr: ['0.1'], qk: [tkey(q.question)], topics: {} });
    saveHistoryLocal(); return q.question; });
  await p.evaluate(() => { openWizard('k1'); W.subject = 'אנגלית'; wizRender(); });
  await p.waitForFunction(() => !document.getElementById('wReady').classList.contains('hidden'), null, { timeout: 10000 });
  const card = await p.textContent('#wReady');
  ok(/יש לנו תרגול מוכן לאנגלית לכיתה ד'/.test(card) && /נבנה ונבדק בקפידה על ידי הצוות שלנו/.test(card) && /לא מנצלת אף אחת מ-3 הבניות החודשיות שלכם/.test(card), 'the card: ready practice, built and checked by the team, uses none of the 3 builds');
  await p.screenshot({ path: `${OUT}/build_ready.png` });
  await p.click('#wReady .linkbtn'); await p.waitForTimeout(300);
  ok(await p.evaluate(() => document.getElementById('wReady').classList.contains('hidden')), '"build a new one" hides it');

  console.log('3. a build');
  const calls = [];
  await p.exposeFunction('__logStep', s => calls.push(s));
  await p.evaluate(() => { const j = sample.json; sample.json = async (s, d, o) => { window.__logStep(s); if (window.__failOnce === s) { window.__failOnce = null; throw { code: 'error', message: 'test: network' }; } if (window.__hangOnce === s) { window.__hangOnce = null; window.__hung = true; return new Promise(() => {}); } return j(s, d, o); }; });
  const runBuild = async (topics, failAt) => {
    await p.evaluate(([t, f]) => { window.__failOnce = f; openWizard('k1'); W.subject = 'אנגלית'; $('fTopics').value = t; W.step = 4; wizRender(); build(); }, [topics, failAt || null]);
  };
  const newSet = n => p.waitForFunction(n => sets.filter(s => s.kidId === 'k1' && !s.src).length >= n, n, { timeout: 120000 });
  await runBuild('Rhymes & sounds\nShort vowels\nMagic e\nColors\nAnimals'); await newSet(1); await p.waitForTimeout(1500);
  const r1 = await p.evaluate(solved => { const s = sets.find(s => s.kidId === 'k1' && !s.src), C = s.chapters;
    return { n: s.questions.length, pool: s.questions.filter(q => q.srcq).map(q => q.srcq), perCh: C.map((c, i) => [s.questions.filter(q => q.ch === i && q.srcq).length, c.count]),
      solvedBack: s.questions.some(q => q.question === solved), shared: setPayload(s).questions.some(q => 'srcq' in q), cq: (kidById('k1').cq || []).length,
      screen: document.getElementById('vReview').innerText + ' ' + JSON.stringify(s.qa), qa: s.qa }; }, solvedQ);
  console.log(JSON.stringify({ n: r1.n, pool: r1.pool.length, perCh: r1.perCh, qa: { ...r1.qa, log: r1.qa.log.length } }));
  ok(r1.n > 0 && r1.pool.length > 0, `the set was built (${r1.n} questions, ${r1.pool.length} of them ready ones)`);
  ok(r1.perCh.every(([k, c]) => k <= Math.floor(c / 2)), 'ready questions: at most half of each chapter');
  ok(!r1.solvedBack, 'a question the kid already answered correctly (in a deleted set) is not taken');
  ok(!r1.shared, 'the shared copy carries no source marks');
  ok(r1.cq === r1.pool.length, 'the kid remembers which ready questions it got');
  ok(!/קטלוג|catalog/i.test(r1.screen), 'nothing on the practice screen or in the check log mentions where questions came from');
  ok(r1.qa.checked >= r1.n && r1.qa.passed >= r1.pool.length, 'ready questions are counted as checked and passed like the others');
  await p.screenshot({ path: `${OUT}/build_done.png` });

  console.log('4. costs');
  const builds = await list(`families/${fam}/builds`), done = builds.filter(x => x.status === 'done');
  const bd = done[done.length - 1] || {};
  ok(done.length === 1 && bd.usd > 0 && bd.steps && bd.steps.gen.calls >= 5 && bd.steps.match && bd.steps.select && bd.steps.solve && bd.steps.review, 'the build has its cost: total and per step ' + JSON.stringify(Object.keys(bd.steps || {})));
  const month = await p.evaluate(() => monthKeyIL()), m = await get(`meta/ai_spend_${month}`), u = await get(`families/${fam}/usage/${month}`);
  ok(m.steps && m.steps.gen.usd > 0 && m.calls > 0, 'the month adds up cost per step');
  ok(!Object.keys(m.res || {}).length && !Object.keys(u.res || {}).length, 'no reservation is left after the calls');
  const day = (await list('meta')).find(x => /^ai_day_/.test(x.id));
  ok(day && day.usd > 0, 'the day has its own total (daily cap)');

  console.log('5. a second build for the same kid, and a build that stopped');
  calls.length = 0;
  await runBuild('Rhymes & sounds\nShort vowels\nMagic e\nColors\nAnimals', 'review');
  await p.waitForFunction(() => /להמשיך מאיפה שנעצר/.test(document.getElementById('bActs').textContent), null, { timeout: 120000 });
  await p.screenshot({ path: `${OUT}/build_stopped.png` });
  const before = calls.slice(), genBefore = before.filter(s => s === 'gen').length;
  ok(await p.evaluate(() => !!localStorage.getItem('sff_build_cp')), 'what was built so far is kept');
  calls.length = 0;
  await p.click('#bActs .btn.big'); await newSet(2); await p.waitForTimeout(1500);
  ok(!calls.includes('gen') && !calls.includes('scan') && !calls.includes('match') && calls.includes('review'), `going on: only the steps left run (${[...new Set(calls)].join(',')}; before: ${genBefore} chapters written)`);
  const r2 = await p.evaluate(() => { const S = sets.filter(s => s.kidId === 'k1' && !s.src); const a = new Set(S[1].questions.map(q => q.srcq).filter(Boolean)); return { again: S[0].questions.filter(q => q.srcq && a.has(q.srcq)).length, cp: !!localStorage.getItem('sff_build_cp') }; });
  ok(r2.again === 0, 'the second build gives the kid no ready question the first one gave');
  ok(!r2.cp, 'when the build is done nothing is kept');
  const b2 = (await list(`families/${fam}/builds`)).filter(x => x.status === 'done');
  ok(b2.length === 2, 'the stopped build finished on the same build (no extra build used): ' + b2.length);

  console.log('6. the screen goes off in the middle of a build (iPhone: the call never comes back)');
  calls.length = 0;
  await p.evaluate(() => { window.__hangOnce = 'review'; });
  await runBuild('Rhymes & sounds\nShort vowels\nMagic e\nColors\nAnimals');
  await p.waitForFunction(() => window.__hung, null, { timeout: 120000 });
  ok(await p.evaluate(() => buildRunning()), 'the build waits for an answer that will not come');
  calls.length = 0;
  // the screen was off for 40 seconds and is on again
  await p.evaluate(() => { HIDE_N++; HIDE_AT = Date.now() - 40e3; document.dispatchEvent(new Event('visibilitychange')); });
  await newSet(3); await p.waitForTimeout(1500);
  ok(!calls.includes('gen') && !calls.includes('scan') && calls.includes('review'), `it goes on by itself from where it stopped, no button (${[...new Set(calls)].join(',')})`);
  const b3 = (await list(`families/${fam}/builds`)).filter(x => x.status === 'done');
  ok(b3.length === 3, 'on the same build (no extra build used): ' + b3.length);
  ok(await p.evaluate(() => !localStorage.getItem('sff_build_cp') && !buildRunning()), 'nothing is left running or kept');
  ok(!errs.length, 'no page errors ' + JSON.stringify(errs));
  await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
