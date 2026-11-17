// Editing a practice set (local emulators, AI answers mocked): more questions, a new topic chapter, remove a chapter.
const { chromium } = require('playwright');
const OUT = process.env.OUT || require('os').tmpdir();   /* screenshots never land in the repo */ const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) process.exitCode = 1; };
(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const p = await (await b.newContext({ viewport: { width: 360, height: 760 }, deviceScaleFactor: 2 })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.SFF_REST_EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' }; window.SFF_TEST_GOOGLE = { sub: 'ed', email: 'ed@t.local', email_verified: true, name: 'טליה' }; localStorage.setItem('sff_lang', 'he'); });
  await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(2500); if (await p.$('#fbGo')) await p.click('#fbGo');
  await p.waitForFunction(() => window.SFF_ROLE, null, { timeout: 20000 }); await p.waitForTimeout(1200);
  await p.evaluate(async () => {
    sample = { limits: async () => ({ images: true }), json: async (prompt, opts = {}) => { if (/NEW multiple-choice/.test(prompt)) window.__lastGen = { imgs: (opts.images || []).length, sheet: /worksheet photo/.test(prompt) };   // mocked AI
      if (/Turn each practice question into a PICTURE/.test(prompt)) return { items: [] };
      if (/independent checker/.test(prompt)) { const n = (prompt.match(/"i":/g) || []).length; return { results: [...Array(n).keys()].map(i => ({ i, pick: 0, multiple_correct: false, problem: '' })) }; }
      const t = (prompt.match(/one of (\[[^\]]*\])/) || [])[1]; const topic = t ? JSON.parse(t)[0] : 'מדפי העבודה'; const n = +(prompt.match(/Write (\d+) NEW/) || [0, 6])[1];
      return { questions: [...Array(n).keys()].map(i => ({ topic, question: `${topic} שאלה ${i + 1}?`, options: [`${i + 1}`, `${i + 2}x`, `${i + 3}y`, `${i + 4}z`], answer: 0, explanation: 'הסבר', emoji: '🧮', scene: null })) }; } };
    kids.push({ id: 'k1', name: 'בן', grade: 6, color: '#2F6BFF' }); saveKids(); curSet = applyImport(await loadShare('math7-nov26'), kidById('k1')).set; renderReview(curSet); show('vReview'); });
  await p.waitForTimeout(800);
  let n0 = await p.evaluate(() => ({ q: curSet.questions.length, c: getChapters(curSet).length, c0: getChapters(curSet)[0].qs.length }));
  await p.click('.rhead [aria-label="אפשרויות"]'); await p.click('#rEdit'); await p.waitForTimeout(400);
  await p.click('#chb0 > .chrow'); await p.waitForTimeout(400);
  await p.screenshot({ path: OUT + '/ed_0.png' });
  await p.evaluate(() => { canImages = true; EDIT_IMGS = [new Blob(['x'], { type: 'image/png' })]; renderRevChapters(curSet); });
  n0 = await p.evaluate(() => ({ q: curSet.questions.length, c: getChapters(curSet).length, c0: getChapters(curSet)[0].qs.length }));
  await p.evaluate(() => moreQs(0)); await p.waitForTimeout(1500);
  const lg = await p.evaluate(() => window.__lastGen); ok(lg && lg.imgs === 1 && lg.sheet, 'worksheet photo sent with the request');
  await p.evaluate(() => { EDIT_IMGS = []; });
  // worksheet photos → a new chapter named from the sheets
  await p.evaluate(() => { const f = new File(['x'], 'sheet.png', { type: 'image/png' }); editImgs([f]); });
  await p.waitForTimeout(300); ok(await p.evaluate(() => !document.getElementById('moreDlg').classList.contains('hidden')), 'photos picked → "where to add?" opens');
  const c0 = await p.evaluate(() => getChapters(curSet).length);
  await p.evaluate(() => [...document.querySelectorAll('#moreDlg .ditem')].find(b => b.textContent.includes('פרק חדש לפי הדפים')).click()); await p.waitForTimeout(1800);
  const sh = await p.evaluate(() => { const C = getChapters(curSet); return { n: C.length, t: C[C.length - 1].title, q: C[C.length - 1].qs.length, box: document.getElementById('workBox').innerText }; });
  ok(sh.n === c0 + 1 && sh.t === 'מדפי העבודה' && sh.q === 8 && /מדפי העבודה/.test(sh.box), `new chapter from the sheets: "${sh.t}" · ${sh.q} questions`);
  const n1 = await p.evaluate(() => ({ q: curSet.questions.length, c0: getChapters(curSet)[0].qs.length, edited: !!curSet.edited }));
  ok(n1.c0 === n0.c0 + 6 && n1.edited, `+6 questions in chapter 1 (${n0.c0} → ${n1.c0})`);
  await p.fill('#newChName', 'שברים'); await p.evaluate(() => addChapter()); await p.waitForTimeout(1500);
  const n2 = await p.evaluate(() => { const C = getChapters(curSet); return { c: C.length, last: C[C.length - 1].title, lastQs: C[C.length - 1].qs.length, topics: curSet.topics.includes('שברים') }; });
  ok(n2.c === n0.c + 2 && n2.last === 'שברים' && n2.lastQs === 8 && n2.topics, `new chapter "שברים" with ${n2.lastQs} questions`);
  await p.evaluate(() => { history.unshift({ at: Date.now(), kidId: 'k1', setId: curSet.id, ch: 3, right: 5, n: 5, topics: {}, qr: [] }); });
  const del = p.evaluate(() => delChapter(1)); await p.waitForTimeout(300); await p.click('#sureYes'); await del; await p.waitForTimeout(500);
  const n3 = await p.evaluate(() => ({ c: getChapters(curSet).length, h: history.find(h => h.setId === curSet.id).ch, titles: getChapters(curSet).slice(0, 2).map(c => c.title.split(' ·')[0]) }));
  ok(n3.c === n2.c - 1 && n3.h === 2 && n3.titles[1].startsWith('ערך'), `chapter 2 removed, progress moved (${n3.titles.join(' | ')}, history ch 3 → ${n3.h})`);
  await p.evaluate(() => { REV_OPEN[curSet.id] = getChapters(curSet).length - 1; renderReview(curSet); scrollTo(0, 99999); }); await p.waitForTimeout(500);
  await p.screenshot({ path: OUT + '/ed_1.png' });
  console.log(JSON.stringify({ errs })); await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
