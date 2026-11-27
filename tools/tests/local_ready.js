// The test window's effort bar: the readiness meter on the road map (examReady / examEffort / readyBox) and on the
// parent's row. Readiness per station = right answers among its last 10 answered questions (not answered = wrong),
// the set = the stations' average; the weakest played stations (under 80%) with a button each; today's stations and
// the effort left until the test; the "where to be today" mark on the bar; English.
// Usage: the app served on 8765 → node tools/tests/local_ready.js
const { chromium } = require('playwright');
const OUT = process.env.OUT || '';
(async () => {
  const b = await chromium.launch(); const errs = [];
  for (const lang of ['he', 'en']) {
    const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 })).newPage();
    p.on('pageerror', e => errs.push(lang + ': ' + e.message));
    await p.addInitScript(l => localStorage.setItem('sff_lang', l), lang);
    await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(1800); await p.evaluate(() => document.getElementById('fbLogin')?.remove());
    const r = await p.evaluate(async () => {
      const s = await loadShare('math8'); s.id = 'rd1'; s.questions = s.qs; s.kidId = 'k1';
      const day = 864e5, iso = t => new Date(t).toISOString().slice(0, 10);
      s.examDate = iso(Date.now() + 10 * day); s.created = Date.now() - 4 * day; s.dailyGoal = 3;
      kids.push({ id: 'k1', name: 'נועה', grade: 7, color: '#FF5C8A' }); sets.push(s); activeKid = 'k1';
      const C = getChapters(s);
      const game = (ch, rights, at) => { const qs = C[ch].qs.slice(0, rights.length);
        history.unshift({ at, kidId: 'k1', setId: 'rd1', ch, right: rights.filter(Boolean).length, n: qs.length, mode: 'choice',
          qr: qs.map((q, k) => s.questions.indexOf(q) + '.' + (rights[k] ? 1 : 0)), qk: qs.map(q => tkey(q.question)), topics: {} }); };
      const T0 = Date.now() - 3 * day;
      game(0, Array(10).fill(1), T0);                                   // station 1: 100%
      game(1, [1, 1, 1, 1, 0, 0, 0, 0, 0, 0], T0 + 1);                  // station 2: 40%
      game(2, [1, 0, 0], T0 + 2);                                       // station 3: 1 of 10 → 10%
      game(1, [1, 1], T0 + 3);                                          // station 2 again: the newest 10 = 2 right + 8 older (4 right… of the first 8: 4) → 60%
      const R = examReady(s), P = roadPlan(s), E = examEffort(s, P);
      openRoad('rd1'); await new Promise(r => setTimeout(r, 300));
      const box = document.querySelector('#rdHdr .rdready'), mark = document.querySelector('#rdHdr .rdexp');
      go('kids'); await new Promise(r => setTimeout(r, 300));
      const row = [...document.querySelectorAll('.prow')].map(x => x.textContent.replace(/\s+/g, ' ')).find(t => /מוכנות|Readiness/.test(t)) || null;
      openRoad('rd1'); await new Promise(r => setTimeout(r, 200));
      return { pct: R.pct, per: R.per.slice(0, 4).map(x => x.pct), n: C.length, weak: R.weak.map(w => [w.i, w.pct]),
        E: { rest: E.rest, today: E.today, min: E.min, expect: E.expect && +E.expect.toFixed(2) },
        box: box && box.innerText.replace(/\s+/g, ' '), chips: box ? box.querySelectorAll('.rdweak button').length : 0, mark: !!mark,
        markAt: mark && mark.style.insetInlineStart, row, missing: (window.__i18nMissing ? [...window.__i18nMissing] : []).filter(x => /מוכנ|תחנ|לחזק|עבודה|המבחן/.test(x)) };
    });
    if (OUT) { await p.evaluate(() => { document.getElementById('sffLoad')?.remove(); document.documentElement.className = document.documentElement.className.replace(/\bsoft\b|\bboot\w*/g, ''); window.scrollTo(0, 0); }); await p.screenshot({ path: `${OUT}/ready_${lang}.png` }); }
    console.log(lang, JSON.stringify(r, null, 1));
    const n = r.n, want = Math.round((100 + 60 + 10) / n);
    const ok = r.per[0] === 100 && r.per[1] === 60 && r.per[2] === 10 && r.per[3] === 0 && r.pct === want
      && JSON.stringify(r.weak) === '[[2,10],[1,60]]' && r.chips === 2 && r.mark && r.E.expect > 0.2 && r.E.expect < 0.5
      && (lang === 'he' ? /מוכנות/.test(r.box) && /היום: פרק/.test(r.box) && /עד המבחן: עוד \d+ פרקים/.test(r.box) && /לחזק/.test(r.box) && /מוכנות \d+%/.test(r.row || '')
                        : /Readiness/.test(r.box) && /Today: chapter/.test(r.box) && /Until the test: \d+ more chapters/.test(r.box) && /Strengthen/.test(r.box) && !r.missing.length);
    if (!ok) errs.push('ready ' + lang);
  }
  console.log(JSON.stringify({ errs })); await b.close(); process.exit(errs.length ? 1 : 0);
})();
