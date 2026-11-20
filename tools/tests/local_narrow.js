// Narrow phones (iPhone "large icons" / Display Zoom = 320 px wide; Safari's bars leave ~560 px): a number sequence in a
// question ("20, 19, 18, _") never breaks across lines; the picture, the question and the answers fit one screen; the
// question counter in the top bar is not cut. At 390 the layout keeps its normal size. OUT=dir for screenshots.
const { chromium } = require('playwright');
const OUT = process.env.OUT || require('os').tmpdir();
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) process.exitCode = 1; };
(async () => {
  const b = await chromium.launch(), errs = [];
  for (const [w, h] of [[320, 560], [390, 844]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }), p = await ctx.newPage();
    p.on('pageerror', e => errs.push(e.message)); await p.addInitScript(() => localStorage.setItem('sff_lang', 'he'));
    await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(1500); await p.evaluate(() => document.getElementById('fbLogin')?.remove());
    const r = await p.evaluate(async () => {
      kids.push({ id: 'k1', name: 'נועה', grade: 0, color: '#FF5C8A' }); saveKids(); applyImport(await loadShare('math1'), kidById('k1'));
      const set = sets.find(x => x.kidId === 'k1'); activeKid = 'k1'; go('kid'); startGame(set, null, 'choice', 0);
      G.qs[G.i] = set.questions.find(q => /סופרים אחורה/.test(q.question)); choiceRender();
      const qb = document.querySelector('.qbox'), tn = qb.firstChild, t = tn.textContent, top = s => { const k = t.indexOf(s), rg = document.createRange(); rg.setStart(tn, k); rg.setEnd(tn, k + s.length); return Math.round(rg.getBoundingClientRect().top); };
      const c = document.getElementById('gCount');
      return { sameLine: top('20') === top('_'), ltr: (() => { const k = t.indexOf('20'), rg = document.createRange(); rg.setStart(tn, k); rg.setEnd(tn, k + 2); const a = rg.getBoundingClientRect().left; const k2 = t.indexOf('_'); rg.setStart(tn, k2); rg.setEnd(tn, k2 + 1); return a < rg.getBoundingClientRect().left; })(),
        fits: Math.max(...[...document.querySelectorAll('.opt')].map(o => o.getBoundingClientRect().bottom)) <= innerHeight, wide: document.documentElement.scrollWidth > innerWidth,
        countCut: c.scrollWidth > c.clientWidth + 1, qsize: parseFloat(getComputedStyle(qb).fontSize) };
    });
    console.log(w, JSON.stringify(r)); await p.screenshot({ path: `${OUT}/narrow_${w}.png` });
    ok(r.sameLine && r.ltr, `${w}: "20, 19, 18, _" on one line, in order`);
    ok(r.fits && !r.wide, `${w}: the question and the answers fit one screen, no sideways scroll`);
    ok(!r.countCut, `${w}: the question counter is not cut`);
    if (w === 390) ok(r.qsize > 20, '390: the normal size is kept');
    await ctx.close();
  }
  ok(!errs.length, 'no page errors ' + JSON.stringify(errs)); await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
