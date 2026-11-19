// F&F feedback, round 2: one top bar (☰ · the screen's name · ‹ back) and bottom tabs; ⋯ menu on the kid card; the practice
// screen's numbers are text and "▶ play with <kid>" is the main button; the game fits one phone screen (two answer columns,
// the feedback as a pop-up); one practice set for several kids (twins); a refresh keeps the screen; a kid without practice
// sets still shows in progress; a word on "מה אני יודע" shows its question. OUT=dir for screenshots.
const { chromium } = require('playwright');
const OUT = process.env.OUT || require('os').tmpdir();   // screenshots never land in the repo
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => localStorage.setItem('sff_lang', 'he'));
  await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(1800); await p.evaluate(() => document.getElementById('fbLogin')?.remove());
  const r = await p.evaluate(async () => {
    const out = {}, vis = el => !!el && getComputedStyle(el).display !== 'none' && el.offsetParent !== null || (el && getComputedStyle(el).position === 'fixed' && getComputedStyle(el).display !== 'none');
    kids.push({ id: 'k1', name: 'נועה', grade: 2, color: '#FF5C8A' }, { id: 'k2', name: 'תום', grade: 2, color: '#2F6BFF' }, { id: 'k3', name: 'דני', grade: 4, color: '#24C78E' }); saveKids();
    // twins: one practice set for two kids – two independent copies
    await openAddDialog('en4', 'k1'); ADD.kidIds.push('k2'); addConfirm();
    const a = sets.find(s => s.kidId === 'k1'), bb = sets.find(s => s.kidId === 'k2');
    out.twins = !!a && !!bb && a.id !== bb.id && a.questions[0] !== bb.questions[0];
    // the top bar and the tabs
    go('kids'); out.kids = { title: $('topTitle').textContent, back: !$('topBack').classList.contains('hidden'), bnav: getComputedStyle($('bNav')).display, pNav: getComputedStyle($('pNav')).display };
    curSet = a; renderReview(a); show('vReview');
    out.practice = { title: $('topTitle').textContent, back: !$('topBack').classList.contains('hidden'), play: $('rPlay').textContent, statsLook: getComputedStyle(document.querySelector('#rStats span')).borderTopWidth };
    goBack(); out.backTo = !$('vKids').classList.contains('hidden');
    // ⋯ on the kid card
    go('kids'); document.querySelector('.kidhero .kmore').click(); await new Promise(r => setTimeout(r, 50));
    out.kmenu = [...document.querySelectorAll('#popMenu button')].map(x => x.textContent.trim());
    document.body.click(); await new Promise(r => setTimeout(r, 50)); out.kmenuClosed = !document.getElementById('popMenu');
    // the game: one screen, two columns, feedback as a pop-up
    activeKid = 'k1'; go('kid'); startGame(a, null, 'choice', 0);
    const q = curQ(); out.ingame = document.body.classList.contains('ingame') && getComputedStyle(document.querySelector('header')).display === 'none';
    out.two = document.querySelector('.opts').classList.contains('two') || q.options.some(o => String(o).length > 18);
    out.fits = Math.max(...[...document.querySelectorAll('.opt')].map(o => o.getBoundingClientRect().bottom)) <= innerHeight;
    choicePick((q.answer + 1) % 4); await new Promise(r => setTimeout(r, 300));
    out.popup = getComputedStyle($('gSheet')).position === 'fixed' && $('gSheet').getBoundingClientRect().bottom <= innerHeight;
    quitGame();
    // progress: a kid without practice sets is still there
    go('stats'); out.nokid = $('sNoKids').textContent;
    // a word on "מה אני יודע" shows its question
    history.unshift({ at: Date.now(), kidId: 'k1', setId: a.id, ch: 0, right: 1, n: 1, mode: 'choice', qr: ['0.1'], qk: [tkey(a.questions[0].question)], topics: {} });
    activeKid = 'k1'; openMe(); const w = document.querySelector('#meBody .wchip'); w && w.click(); await new Promise(r => setTimeout(r, 50));
    out.wordQ = document.querySelector('#popMenu .wfq')?.textContent || '';
    // a refresh keeps the screen
    curSet = a; renderReview(a); show('vReview');
    return out;
  });
  await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(1800);
  r.afterReload = await p.evaluate(() => ({ review: !document.getElementById('vReview').classList.contains('hidden'), title: document.getElementById('topTitle').textContent }));
  if (OUT) { await p.screenshot({ path: `${OUT}/r2_practice.png` }); }
  console.log(JSON.stringify(r, null, 1));
  const ok = r.twins && r.kids.title === 'ילדים' && !r.kids.back && r.kids.bnav === 'grid' && r.kids.pNav === 'none'
    && /נועה/.test(r.practice.title) && r.practice.back && /לשחק עם נועה/.test(r.practice.play) && r.practice.statsLook === '0px' && r.backTo
    && r.kmenu.length === 3 && r.kmenuClosed && r.ingame && r.two && r.fits && r.popup && /דני/.test(r.nokid) && /עוד אין תרגולים/.test(r.nokid)
    && r.wordQ.length > 3 && r.afterReload.review;
  if (!ok) errs.push('round 2');
  console.log(JSON.stringify({ errs })); await b.close(); process.exit(errs.length ? 1 : 0);
})().catch(e => { console.error('FAIL', e); process.exit(1); });
