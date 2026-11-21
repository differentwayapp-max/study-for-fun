// Pictures by default: opening a parent-built practice set whose questions have no picture adds them in the background
// (only those questions, nothing else changes). Catalog sets are never touched. There is no picture button.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 360, height: 720 } })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => localStorage.setItem('sff_lang', 'he'));
  await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(2000); await p.evaluate(() => document.getElementById('fbLogin')?.remove());
  const r = await p.evaluate(async () => {
    let calls = 0, asked = [];
    sample = { limits: async () => ({ images: true }), json: async (step, d) => { calls++; const items = step === 'pics' ? d.items : [];
      asked.push(items.map(x => x.i)); return { items: items.map(x => ({ i: x.i, scene: [{ e: '🍎', x: 50, y: 50, s: 40 }], question: x.question, options: x.options, explanation: 'הסבר' })) }; } };
    kids.push({ id: 'k1', name: 'נועה', grade: 0, color: '#FF5C8A' });
    const mine = { id: 'm1', kidId: 'k1', name: 'נועה', grade: 0, subject: 'מדעים', topics: ['א'], chapters: null, qa: {}, created: Date.now(),
      questions: [0, 1, 2].map(i => ({ topic: 'א', question: 'שאלה ' + i, options: ['a' + i, 'b', 'c', 'd'], answer: 0, explanation: '', ...(i === 1 ? { scene: [{ e: '🐶', x: 50, y: 50, s: 40 }] } : {}) })) };
    const cat = await loadShare('math1'); cat.id = 'c1'; cat.questions = cat.qs; cat.src = 'math1'; cat.shared = true; cat.kidId = 'k1'; cat.questions[0] = { ...cat.questions[0] }; delete cat.questions[0].scene;
    sets.push(mine, cat);
    curSet = cat; renderReview(cat); show('vReview'); await new Promise(r => setTimeout(r, 300)); const afterCat = calls;
    curSet = mine; renderReview(mine); show('vReview'); await new Promise(r => setTimeout(r, 800));
    return { afterCat, calls, asked, pics: mine.questions.map(q => (q.scene || [])[0]?.e), button: !!document.getElementById('picFix') };
  });
  console.log(JSON.stringify(r));
  if (r.afterCat !== 0 || r.calls !== 1 || JSON.stringify(r.asked) !== '[[0,2]]' || r.pics.join('') !== '🍎🐶🍎' || r.button) errs.push('autopics');
  console.log(JSON.stringify({ errs })); await b.close(); process.exit(errs.length ? 1 : 0);
})().catch(e => { console.error('FAIL', e); process.exit(1); });
