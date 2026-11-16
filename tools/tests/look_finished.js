// Finished practice sets fold into their own section (test date passed / all stations done / a focused 🎯 practice
// was opened for it); focused practice sits on top with a big 🎯. Parent card + kid screen. OUT=dir for screenshots.
const { chromium } = require('playwright');
const OUT = process.env.OUT;
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => localStorage.setItem('sff_lang', 'he'));
  await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(2000); await p.evaluate(() => document.getElementById('fbLogin')?.remove());
  const r = await p.evaluate(async () => {
    kids.push({ id: 'k2', name: 'בן', grade: 6, color: '#2F6BFF' });
    const add = async (id, extra) => { const s = await loadShare(id); const o = { ...s, id: 'x' + id, kidId: 'k2', name: 'בן', questions: s.qs, shared: true, src: id, created: Date.now(), qa: {}, ...extra }; sets.push(o); return o; };
    const math = await add('math7-nov26', {});                                   // active
    const sci = await add('sci7-materials', {});                                 // gets a focused practice → finished
    const en = await add('en7-nov26', { examDate: '2026-10-01' });               // test date passed → finished
    const heb = await add('heb1', {});                                           // every station done → finished
    getChapters(heb).forEach((c, i) => history.unshift({ at: Date.now(), kidId: 'k2', setId: heb.id, ch: i, right: 10, n: 10, mode: 'choice', qr: [], topics: {} }));
    history.unshift({ at: Date.now(), kidId: 'k2', setId: heb.id, ch: -1, right: 10, n: 10, mode: 'choice', qr: [], topics: {} });
    sets.push({ id: 'rx', reinf: sci.id, kidId: 'k2', name: 'בן', grade: 6, subject: '🎯 מדעים', topics: ['מסה'], questions: sci.questions.slice(0, 8).map(q => ({ ...q, ch: 0 })),
      chapters: [{ title: '🎯 חיזוק', topics: ['מסה'], count: 8 }], examDate: '', dailyGoal: 1, perRound: 8, shared: true, qa: {}, created: Date.now() });
    go('kids');
    return { status: sets.map(s => [s.subject, setDone(s)]) };
  });
  await p.waitForTimeout(800);
  if (OUT) await p.screenshot({ path: `${OUT}/fin_parent.png`, fullPage: true });
  await p.click('.kidhero .donesec summary'); await p.waitForTimeout(300);
  if (OUT) await p.screenshot({ path: `${OUT}/fin_parent_open.png`, fullPage: true });
  const parent = await p.evaluate(() => ({ active: [...document.querySelectorAll('.kidhero > div > .prow, .kidhero .prow:not(.fin)')].map(x => x.querySelector('.t').textContent.trim()),
    fin: [...document.querySelectorAll('.kidhero .donelist .prow')].map(x => x.textContent.replace(/\s+/g, ' ').trim()) }));
  await p.evaluate(() => { activeKid = 'k2'; go('kid'); }); await p.waitForTimeout(800);
  if (OUT) await p.screenshot({ path: `${OUT}/fin_kid.png`, fullPage: true });
  const kid = await p.evaluate(() => ({ cards: [...document.querySelectorAll('#subCar h2')].map(h => h.textContent.trim()), done: document.querySelectorAll('#kidDone .prow').length }));
  console.log(JSON.stringify({ r, parent, kid }, null, 1));
  const ok = parent.active.length === 2 && /מדעים/.test(parent.active[0]) && parent.fin.length === 3 && kid.cards.length === 2 && kid.done === 3;
  if (!ok) errs.push('finished section');
  console.log(JSON.stringify({ errs })); await b.close(); process.exit(errs.length ? 1 : 0);
})().catch(e => { console.error('FAIL', e); process.exit(1); });
