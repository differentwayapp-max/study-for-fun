// Test-level questions (lvl 2, a set file's 7th field `2`) never reach a regular game: loadShare / every set that arrives
// (storage, the cloud, an old copy with them mixed in) keeps them in set.qs2, apart from set.questions. Loads math7 (with its
// lvl 2 questions) and checks every station × every game, "חזרה על הכול", the review questions, focused practice and a
// teacher's assignment copy – and that the map ("עברתי", the plan) and the readiness meter are the same as for math7 before
// them (MAIN=<file>: the set without them; default: the branch's own set with its lvl 2 questions taken out).
// Usage: the app served on 8765 (APP=… for another) → node tools/tests/local_lvl.js
const { chromium } = require('playwright'); const fs = require('fs');
const APP = process.env.APP || 'http://localhost:8765/';
const MAIN = process.env.MAIN ? fs.readFileSync(process.env.MAIN, 'utf8').trim() : '';
(async () => {
  const b = await chromium.launch(); const errs = []; const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => localStorage.setItem('sff_lang', 'he'));
  await p.goto(APP, { waitUntil: 'load' }); await p.waitForTimeout(1800);
  await p.evaluate(() => { document.getElementById('fbLogin')?.remove(); document.getElementById('sffLoad')?.remove(); });
  const r = await p.evaluate(async MAIN => {
    const out = {}, bad = [];
    const p = await loadShare('math7'), L2 = new Set(p.qs2.map(q => tkey(q.question)));
    out.load = { qs: p.qs.length, qs2: p.qs2.length, lvlInQs: p.qs.filter(q => q.lvl === 2 || L2.has(tkey(q.question))).length, allLvl2: p.qs2.every(q => q.lvl === 2) };
    // the regular list is the set before its test-level questions
    let ref = null;
    if (MAIN) ref = await loadShare(MAIN);
    else { const raw = await (await fetch('/share/math7.txt')).text(); const j = JSON.parse(decodeURIComponent(escape(atob(raw.trim().slice(5))))); j.questions = j.questions.filter(q => q.lvl !== 2);
      ref = await loadShare('SFF1:' + btoa(unescape(encodeURIComponent(JSON.stringify(j))))); }
    out.same = ref.qs.length === p.qs.length && ref.qs.every((q, i) => q.question === p.qs[i].question && q.ch === p.qs[i].ch);
    kids.push({ id: 'k1', name: 'נועה', grade: 6, color: '#FF5C8A' }, { id: 'k2', name: 'רון', grade: 6, color: '#2F6BFF' });
    const S = applyImport(p, kidById('k1')).set, R = applyImport(ref, kidById('k2')).set;
    out.set = { q: S.questions.length, qs2: (S.qs2 || []).length, lvlInQs: S.questions.filter(q => L2.has(tkey(q.question))).length };
    // an old copy with the test-level questions mixed in (another phone, storage) is split as it comes in
    const mixed = JSON.parse(JSON.stringify(S)); mixed.questions = [...mixed.questions, ...mixed.qs2]; delete mixed.qs2; splitLvl(mixed);
    out.split = { q: mixed.questions.length, qs2: mixed.qs2.length };
    const mixed2 = JSON.parse(JSON.stringify(S)); mixed2.questions = [...mixed2.questions, ...mixed2.qs2]; delete mixed2.qs2;
    out.chGuard = getChapters(mixed2).every(c => c.qs.every(q => q.lvl !== 2));
    // every station × every game, and "חזרה על הכול" (ch -1)
    const C = getChapters(S); let games = 0;
    for (let ch = -1; ch < C.length; ch++) for (const m of MODES.map(x => x.id)) {
      try { startGame(S, null, m, ch); } catch (e) { bad.push(`start ${m} ${ch}: ${e.message}`); continue; }
      games++; (G.qs || []).forEach(q => { if (q.lvl === 2 || L2.has(tkey(q.question))) bad.push(`${m} ch${ch}: ${q.question}`); });
      try { quitGame(); } catch (e) {}
    }
    out.games = games;
    // the review questions: every question answered yesterday in another game
    const y = Date.now() - 864e5; history.unshift({ at: y, kidId: 'k1', setId: S.id, ch: 0, right: S.questions.length, n: S.questions.length, mode: 'match',
      qr: S.questions.map((q, i) => i + '.1'), qk: S.questions.map(q => tkey(q.question)), topics: {} });
    for (let ch = 0; ch < C.length; ch++) reviewQs(S, ch, 'choice').forEach(q => { if (L2.has(tkey((q.q || q).question || ''))) bad.push('reviewQs ' + ch); });
    // focused practice from mistakes in every chapter (and the weak-topics material)
    history.unshift({ at: Date.now(), kidId: 'k1', setId: S.id, ch: 1, right: 0, n: 10, mode: 'choice',
      qr: S.questions.slice(0, 40).map(q => S.questions.indexOf(q) + '.0.' + ((q.answer + 1) % 4)), qk: S.questions.slice(0, 40).map(q => tkey(q.question) + ':' + tkey(q.options[(q.answer + 1) % 4])), topics: {} });
    const before = sets.length; try { makeFocus(S.id, true); } catch (e) { bad.push('makeFocus ' + e.message); }
    const F = sets.length > before ? sets.find(s => s.reinf) : null; out.focus = F ? F.questions.length : 0;
    (F ? F.questions : []).forEach(q => { if (L2.has(tkey(q.question))) bad.push('focus: ' + q.question); });
    reinfMat(S, S.topics).forEach(q => { if (L2.has(tkey((q && q.question) || ''))) bad.push('reinfMat'); });
    // a teacher's assignment copy
    const A = asgCopy(p); out.asg = { q: A.questions.length, qs2: (A.qs2 || []).length, lvlInQs: A.questions.filter(q => L2.has(tkey(q.question))).length };
    // the map and the readiness meter: the same as the set without them, for the same games
    history.filter(h => h.setId === S.id).forEach(h => history.push({ ...h, kidId: 'k2', setId: R.id }));
    const P1 = roadPlan(S), P2 = roadPlan(R), E1 = examReady(S), E2 = examReady(R);
    out.map = { N: [P1.N, P2.N], done: [[...chaptersDone(S)].join(), [...chaptersDone(R)].join()], ready: [E1 && E1.pct, E2 && E2.pct], chq: getChapters(S).map(c => c.qs.length).join() === getChapters(R).map(c => c.qs.length).join() };
    out.bad = bad.slice(0, 8); out.nbad = bad.length; return out;
  }, MAIN);
  console.log(JSON.stringify(r, null, 1));
  const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) errs.push(m); };
  ok(r.load.qs2 === 58 && r.load.allLvl2 && !r.load.lvlInQs, `loadShare: the 58 test-level questions apart (${r.load.qs} + ${r.load.qs2})`);
  ok(r.same, 'the regular list = the set without them (same questions, same order, same chapters)');
  ok(r.set.qs2 === 58 && !r.set.lvlInQs && r.set.q === r.load.qs, 'the family\'s copy: questions without them, qs2 with them');
  ok(r.split.qs2 === 58 && r.split.q === r.load.qs && r.chGuard, 'a copy with them mixed in is split; getChapters never shows them');
  ok(r.games > 100 && !r.nbad, `every station × every game, "חזרה על הכול", review questions, focused practice: no test-level question (${r.games} games)${r.nbad ? ' – ' + r.bad.join(' | ') : ''}`);
  ok(r.focus > 0, 'focused practice was built (' + r.focus + ' questions)');
  ok(r.asg.qs2 === 58 && !r.asg.lvlInQs, 'a teacher\'s assignment copy keeps them apart');
  ok(r.map.N[0] === r.map.N[1] && r.map.done[0] === r.map.done[1] && r.map.ready[0] === r.map.ready[1] && r.map.chq, `the map and the readiness meter as without them (${r.map.N[0]} stations, readiness ${r.map.ready[0]}%)`);
  ok(!errs.some(e => !/^(loadShare|the |a |every|focused)/.test(e)), 'no page errors')
  console.log(JSON.stringify({ errs })); await b.close(); process.exit(errs.length ? 1 : 0);
})();
