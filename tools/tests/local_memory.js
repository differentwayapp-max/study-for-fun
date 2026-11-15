// Memory game: first looks are not mistakes; skipping a card you already saw is.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(3000);
  const r = await p.evaluate(async () => {
    const qs = ['red','blue','green','black','brown','gray'].map((w, i) => ({ topic: 'Colors', question: 'Color ' + (i + 1) + '?', options: [w, 'x' + i, 'y' + i, 'z' + i], answer: 0, explanation: w, emoji: '🎨' }));
    const set = { id: 'tmem', name: 'ט', grade: 3, subject: 'אנגלית', topics: ['Colors'], questions: qs, perRound: 6 }; go('kid'); startGame(set, qs, 'memory'); for (let t = 0; t < 30 && !(G && G.mem); t++) await new Promise(r => setTimeout(r, 200));
    const M = G.mem, wait = ms => new Promise(r => setTimeout(r, ms)), flip = async i => { memFlip(i); await wait(60); };
    const mate = i => M.cards.findIndex((c, k) => k !== i && c.p === M.cards[i].p && c.side !== M.cards[i].side);
    // 1) two blind moves with 4 different pairs → no mistakes
    const used = new Set(), pick = () => { for (let i = 0; i < M.cards.length; i++) if (!used.has(i) && !used.has(mate(i))) { used.add(i); return i; } };
    const a = pick(), b = pick(); await flip(a); await flip(b); await wait(1300);
    const c = pick(), d = pick(); await flip(c); await flip(d); await wait(1300);
    const blind = Object.values(M.miss).reduce((x, y) => x + y, 0);
    // 2) flip the mate of a card already seen, then a different card → a real mistake
    const e = mate(a), wrong = [...Array(M.cards.length).keys()].find(k => k !== e && k !== a && M.cards[k].p !== M.cards[e].p && !M.cards.every(() => 0));
    await flip(e); await flip(wrong === a ? b : wrong); await wait(1300);
    const after = Object.values(M.miss).reduce((x, y) => x + y, 0);
    return { blind, after, cards: M.cards.length };
  });
  console.log(JSON.stringify({ ...r, errs }));
  await b.close();
})();
