// Renders every picture scene of catalog sets in the real app CSS and checks each emoji is fully
// inside the frame, is drawn on one line, and does not cover another emoji. IDS=math1,heb1 OUT=dir (optional)
const { chromium } = require('playwright');
const IDS = (process.env.IDS || '').split(',').filter(Boolean);
const OUT = process.env.OUT || require('os').tmpdir();   // screenshots never land in the repo
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 360, height: 720 }, deviceScaleFactor: 1 })).newPage();
  await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(1500);
  const ids = IDS.length ? IDS : await p.evaluate(async () => (await (await fetch('/share/catalog.json')).json()).sets.filter(x => x.status === 'ready').map(x => x.id));
  let bad = 0;
  for (const id of ids) {
    const res = await p.evaluate(async id => {
      const set = await loadShare(id); const out = [];
      const box = document.createElement('div'); box.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#fff;padding:12px;width:336px;overflow:auto';
      document.body.appendChild(box);
      for (const [i, q] of set.questions.entries()) {
        if (!q.scene || !q.scene.length) continue;
        box.innerHTML = sceneHtml(q.scene); await new Promise(r => requestAnimationFrame(r));
        const sc = box.firstElementChild.getBoundingClientRect(), sp = [...box.querySelectorAll('span')];
        const R = sp.map(s => s.getBoundingClientRect()), probs = [];
        R.forEach((r, j) => { const fs = parseFloat(getComputedStyle(sp[j]).fontSize);
          if (r.left < sc.left - 1 || r.right > sc.right + 1 || r.top < sc.top - 1 || r.bottom > sc.bottom + 1) probs.push(`"${sp[j].textContent}" goes out of the frame`);
          if (r.height > fs * 1.6) probs.push(`"${sp[j].textContent}" wraps to 2 lines`); });
        for (let a = 0; a < R.length; a++) for (let c = a + 1; c < R.length; c++) {
          const ox = Math.min(R[a].right, R[c].right) - Math.max(R[a].left, R[c].left), oy = Math.min(R[a].bottom, R[c].bottom) - Math.max(R[a].top, R[c].top);
          const small = Math.min(R[a].width * R[a].height, R[c].width * R[c].height);
          // an emoji sitting on another one (cat on a chair) is fine; two of the same that overlap make counting wrong
          if (ox > 0 && oy > 0 && ox * oy > small * .25 && sp[a].textContent === sp[c].textContent) probs.push(`two "${sp[a].textContent}" overlap`);
        }
        if (probs.length) out.push({ i, q: q.question, probs });
      }
      box.remove(); return { n: set.questions.length, out };
    }, id);
    bad += res.out.length;
    console.log(`${id}: ${res.n} questions, ${res.out.length} bad scenes`);
    res.out.forEach(x => console.log(`  #${x.i} ${x.q} → ${x.probs.join('; ')}`));
  }
  await b.close(); process.exit(bad ? 1 : 0);
})().catch(e => { console.error('FAIL', e); process.exit(2); });
