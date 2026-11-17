// Match with lines + memory: when two questions have the same answer, either answer card is right for either question.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => localStorage.setItem('sff_lang', 'he'));
  await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(1800); await p.evaluate(() => document.getElementById('fbLogin')?.remove());
  const r = await p.evaluate(async () => {
    const Q = (q, a) => ({ topic: 't', question: q, options: [a, 'x1', 'x2', 'x3'], answer: 0, explanation: '', ch: 0 });
    const s = { id: 'dup', kidId: 'k1', name: 'עדי', grade: 4, subject: 'אנגלית', topics: ['t'], chapters: [{ title: 'a', topics: ['t'], count: 4 }],
      questions: [Q('happy', 'שמח'), Q('glad', 'שמח'), Q('dog', 'כלב'), Q('cat', 'חתול')], examDate: '', dailyGoal: 1, perRound: 10, qa: {}, created: Date.now() };
    kids.push({ id: 'k1', name: 'עדי', grade: 4, color: '#FF5C8A' }); sets.push(s);
    startGame(s, null, 'match', 0);
    const qi = G.m.slice.findIndex(q => q.question === 'happy'), other = G.m.slice.findIndex(q => q.question === 'glad');
    matchSel(qi); matchTo(other);                       // "happy" → the other "שמח" card
    const first = { done: !!G.m.done[qi], used: !!G.m.used[other], ok: G.res.at(-1)?.ok };
    matchSel(other); matchTo(other);                    // that card is taken – nothing happens
    const taken = !G.m.done[other];
    matchSel(other); matchTo(qi);                       // "glad" → the remaining "שמח" card
    const second = { done: !!G.m.done[other], ok: G.res.at(-1)?.ok };
    const dog = G.m.slice.findIndex(q => q.question === 'dog'), cat = G.m.slice.findIndex(q => q.question === 'cat');
    matchSel(dog); matchTo(cat); const wrong = !G.m.done[dog];   // a different answer is still a mistake
    // memory
    startGame(s, null, 'memory', 0);
    const C = G.mem.cards, qh = C.findIndex(c => c.side === 'q' && G.qs[c.p].question === 'happy'), ag = C.findIndex(c => c.side === 'a' && G.qs[c.p].question === 'glad');
    memFlip(qh); memFlip(ag); await new Promise(r => setTimeout(r, 500));
    const mem = document.getElementById('mc' + qh).classList.contains('got') && document.getElementById('mc' + ag).classList.contains('got');
    return { first, taken, second, wrong, mem };
  });
  console.log(JSON.stringify(r));
  const ok = r.first.done && r.first.used && r.first.ok && r.taken && r.second.done && r.second.ok && r.wrong && r.mem;
  if (!ok) errs.push('same answer in match / memory');
  console.log(JSON.stringify({ errs })); await b.close(); process.exit(errs.length ? 1 : 0);
})().catch(e => { console.error('FAIL', e); process.exit(1); });
