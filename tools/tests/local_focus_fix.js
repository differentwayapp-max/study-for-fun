// Focused practice – two bugs a parent met (26.11):
// 1. memory / match: two cards that look the same (the same picture, the same text) or the same value in another form never meet
//    with different answers (noClash); a focused set from mistakes keeps every source chapter apart (one station each);
// 2. "✨ תרגול ממוקד לנושאים" (an AI build): it gets the source set's own words (reinfMat → I.mat), asks only about them
//    (the gen prompt), takes no ready questions from the catalog, and a word answer not in the material stays out (matOnly).
// Run with the app served (python3 tools/serve.py 8765).
const { chromium } = require('playwright');
const path = require('path');
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) process.exitCode = 1; };
(async () => {
  console.log('1. the server side (build-core, prompts)');
  const core = require(path.join(__dirname, '../../public/build-core.js'));
  const q = (topic, question, a) => ({ topic, question, options: [a, 'x', 'y', 'z'], answer: 0, explanation: '', emoji: '🍎' });
  const mat = ['What is this? → kitchen', 'Where do we sleep? → bedroom'];
  const kept = core.matOnly([q('Rooms', 'A', 'kitchen'), q('Rooms', 'B', 'bedroom'), q('Rooms', 'C', 'garage'), q('Rooms', 'D', '3')], mat);
  ok(kept.map(x => x.options[0]).join() === 'kitchen,bedroom,3', 'matOnly: a word not in the material stays out (garage), numbers stay: ' + kept.map(x => x.options[0]));
  const all = [q('R', 'A', 'garage'), q('R', 'B', 'attic'), q('R', 'C', 'kitchen')];
  ok(core.matOnly(all, mat).length === 3, 'matOnly: when most answers are not in it, nothing is dropped (the build still has questions)');
  const calls = []; let poolCalls = 0;
  const askB = async (step, d) => { calls.push([step, d]);
    if (step === 'gen') return { questions: Object.entries(d.quota).flatMap(([t, n]) => Array.from({ length: n }, (_, k) => ({ topic: t, question: 'Q' + k + t, options: [k % 2 ? 'kitchen' : 'bedroom', 'a', 'b', 'c'], answer: 0, explanation: 'e', emoji: '🛏️' }))) };
    if (step === 'solve') return { results: d.questions.map(x => ({ i: x.i, pick: x.answer, multiple_correct: false, problem: '' })) };
    if (step === 'review') return { flags: [] };
    if (step === 'pics') return { items: [] };
    return {}; };
  const I = { name: 'נועה', reinf: 'sA', gi: 3, subject: 'אנגלית', topics: ['Rooms'], perRound: 5, kidId: 'k1', chapters: [{ title: 'Rooms', topics: ['Rooms'], count: 5 }], text: '', mat, examDate: '', dailyGoal: 1, skip: {} };
  const out = await core.buildSet(I, askB, { pool: async () => { poolCalls++; return [{ ref: 'x', title: 'Rooms', topics: ['Rooms'] }]; } });
  const gens = calls.filter(c => c[0] === 'gen');
  ok(poolCalls === 0 && !calls.some(c => c[0] === 'match'), 'a focused build takes no ready questions from the catalog');
  ok(gens.length && gens.every(c => JSON.stringify(c[1].mat) === JSON.stringify(mat)), 'every gen call gets the material');
  ok(out.reinf === 'sA' && out.questions.length === 5, 'the focused set is built: ' + out.questions.length + ' questions');
  const I2 = { ...I, reinf: null, mat: [] }; let pool2 = 0;
  await core.buildSet(I2, askB, { pool: async () => { pool2++; return []; } });
  ok(pool2 === 1, 'a normal build still looks in the catalog');
  const P = require(path.join(__dirname, '../../functions/prompts.js'));
  const STEPS = P.STEPS || P.steps || P;
  const gen = STEPS.gen || (STEPS.STEPS && STEPS.STEPS.gen);
  const d = { ctx: { gi: 3, grade: "ג'", subject: 'אנגלית', topics: ['Rooms'] }, chapter: { i: 0, n: 1, title: 'Rooms', topics: ['Rooms'] }, quota: { Rooms: 5 }, avoid: [] };
  const withM = gen.build({ ...d, mat }, {}), noM = gen.build(d, {});
  ok(/FOCUSED PRACTICE/.test(withM) && withM.includes('kitchen') && !/FOCUSED PRACTICE/.test(noM), 'the gen prompt: "only these words" with the material, nothing without it');

  console.log('2. the app (games, the focused set)');
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(3000);
  const r = await p.evaluate(async () => {
    const Q = (question, a, emoji, scene) => ({ topic: 'T', question, options: [a, 'o1' + a, 'o2' + a, 'o3' + a], answer: 0, explanation: '', emoji, ...(scene ? { scene } : {}) });
    // the same picture, a "what is this?" question (no text on the card) → the same card, two answers
    const mem = [Q('What is this?', 'apple', '🍎'), Q('What is this?', 'fruit', '🍎'), Q('What is this?', 'dog', '🐶'), Q('What is this?', 'cat', '🐱')];
    const m1 = noClash(mem, 'memory').map(q => q.options[0]).join();
    // the same picture, different short texts → different cards: both stay
    const txt = [Q('Which color?', 'red', '🍎'), Q('Which fruit?', 'apple', '🍎')];
    const m2 = noClash(txt, 'memory').length;
    // the same answer twice is fine (either card is right); the same value in another form is not
    const same = noClash([Q('A?', 'dog', '🐶'), Q('B?', 'dog', '🐕')], 'memory').length;
    const vals = noClash([Q('כמה עולה?', '20 ₪', '🪙'), Q('כמה שקלים?', '20', '💰'), Q('כמה?', '7', '🔢')], 'match').map(q => q.options[0]).join();
    // a set whose memory pool has such a pair: the station's game is not memory / match
    const set = { id: 'tclash', name: 'ט', grade: 1, subject: 'אנגלית', topics: ['T'], perRound: 6, chapters: [{ title: 'A', topics: ['T'], count: 4 }], questions: mem.map(q => ({ ...q, ch: 0 })) };
    const modes = new Set(); for (let k = 0; k < 6; k++) modes.add(pickMode(set, 0));
    go('kid'); startGame(set, mem, 'memory'); await new Promise(r => setTimeout(r, 400));
    const inGame = G && G.mode === 'memory' ? G.qs.map(q => q.options[0]).sort().join() : G && G.mode;
    // a focused set from the mistakes of chapters 1 and 3 of a set → two stations, each from one chapter
    const all = await loadShare('en4'); kids.push({ id: 'kf', name: 'נועה', grade: 3, color: '#FF5C8A' });
    const A = applyImport(all, kids.find(k => k.id === 'kf')).set; const C = getChapters(A);
    const mk = ch => { const qs = C[ch].qs, bad = qs.slice(0, 2);
      history.unshift({ at: Date.now() - ch * 1000, kidId: 'kf', kid: '', subject: A.subject, grade: A.grade, setId: A.id, retry: false, topic: '', ch, right: qs.length - 2, n: qs.length, score: 1, mode: 'choice',
        qr: qs.map(q => A.questions.indexOf(q) + '.' + (bad.includes(q) ? '0.' + (q.answer + 1) % q.options.length : '1')), topics: {} }); return bad; };
    const bad = [...mk(0), ...mk(2)];
    const fid = makeFocus(A.id, true), F = getSet(fid), FC = getChapters(F);
    const key = q => String(q.options[q.answer]).trim().toLowerCase(), missed = Object.fromEntries(bad.map(q => [key(q), C.findIndex(c => c.qs.includes(q))]));
    const srcOf = q => missed[key(q)] ?? C.findIndex(c => c.qs.some(x => x.question === q.question && key(x) === key(q)));
    const stations = FC.map(c => [...new Set(c.qs.map(srcOf))]);
    const mat = reinfMat(A, [C[0].qs[0].topic]);
    return { m1, m2, same, vals, modes: [...modes].join(), inGame, nCh: C.length, stations: JSON.stringify(stations), titles: F.chapters.map(c => c.title), dg: F.dailyGoal, badN: bad.length, fN: F.questions.length,
      mat: mat.length, matOk: mat.every(x => / → /.test(x)) };
  });
  ok(r.m1 === 'apple,dog,cat', 'memory: the same picture with no text, another answer → one stays out: ' + r.m1);
  ok(r.m2 === 2, 'memory: the same picture with different texts → both stay');
  ok(r.same === 2, 'the same answer twice → both stay (either card is right)');
  ok(r.vals === '20 ₪,7', 'match: "20 ₪" and "20" never meet: ' + r.vals);
  ok(!/memory|match/.test(r.modes), 'a station with such a pair is played in another game: ' + r.modes);
  ok(r.inGame === 'apple,cat,dog' || r.inGame === 'choice', 'a memory game asked directly leaves the clash out: ' + r.inGame);
  ok(r.nCh > 2 && r.stations === '[[0],[2]]', `a focused set from mistakes in chapters 1 and 3 → 2 stations, each from one chapter: ${r.stations} (${r.titles.join(' | ')})`);
  ok(r.titles.every(t => t.startsWith('🎯 ')) && r.dg === 2, 'the stations are named 🎯 + the chapter, both open today (dailyGoal ' + r.dg + ')');
  ok(r.fN >= r.badN, `the focused set has every mistake (${r.fN} ≥ ${r.badN})`);
  ok(r.mat > 0 && r.matOk, `reinfMat: the source's own questions of the topic, "question → answer" (${r.mat})`);
  ok(!errs.length, 'no page errors ' + errs.join(' | '));
  await b.close();
})();
