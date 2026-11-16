// Progress tracking → a practice set's card → "see the mistakes": each wrong question with the kid's answer and the right one.
const { chromium } = require('playwright');
const OUT = process.env.OUT;
(async () => {
  const b = await chromium.launch(); const errs = [];
  for (const lang of ['he', 'en']) {
    const p = await (await b.newContext({ viewport: { width: 360, height: 760 }, deviceScaleFactor: 2 })).newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(l => localStorage.setItem('sff_lang', l), lang);
    await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(2000); await p.evaluate(() => document.getElementById('fbLogin')?.remove());
    const r = await p.evaluate(async () => {
      const s = await loadShare('math1'); s.id = 't1'; s.questions = s.qs; s.chapters = s.chapters; kids.push({ id: 'k1', name: 'נועה', grade: 0, color: '#FF5C8A' }); s.kidId = 'k1'; s.subject = 'מתמטיקה'; sets.push(s);
      const now = Date.now();
      // round 1: q0 wrong (picked 1), q1 right, q2 wrong; round 2 (later): q0 right, q2 wrong again, q5 wrong (memory – not counted)
      const a = s.questions[0].answer, c = s.questions[2].answer;
      history.unshift({ at: now - 864e5, kidId: 'k1', setId: 't1', subject: s.subject, ch: 0, right: 1, n: 3, mode: 'choice', qr: [`0.0.${(a + 1) % 4}`, '1.1', `2.0.${(c + 2) % 4}`], topics: {} });
      history.unshift({ at: now, kidId: 'k1', setId: 't1', subject: s.subject, ch: 0, right: 1, n: 2, mode: 'choice', qr: ['0.1', `2.0.${(c + 1) % 4}`], topics: {} });
      history.unshift({ at: now, kidId: 'k1', setId: 't1', subject: s.subject, ch: 0, right: 0, n: 1, mode: 'memory', qr: ['5.0'], topics: {} });
      go('stats'); renderStats();
      const btn = [...document.querySelectorAll('.mistbtn')].map(x => x.textContent);
      const all = mistakesOf(s, history); return { btn, open: all.filter(m => !m.fixed).map(m => m.i), fixed: all.filter(m => m.fixed).map(m => m.i), pick2: all.find(m => m.i === 2).lastWrong.pick, want2: (c + 1) % 4 };
    });
    await p.click('.mistbtn'); await p.waitForTimeout(500);
    if (OUT) await p.screenshot({ path: `${OUT}/mist_${lang}.png` });
    await p.click('#mistBody .wtabs button >> nth=1'); await p.waitForTimeout(300);
    if (OUT) await p.screenshot({ path: `${OUT}/mist_${lang}_fixed.png` });
    console.log(lang, JSON.stringify(r));
    if (JSON.stringify(r.open) !== '[2]' || JSON.stringify(r.fixed) !== '[0]' || r.pick2 !== r.want2) errs.push('mistakes ' + lang);
    await p.close();
  }
  console.log(JSON.stringify({ errs })); await b.close(); process.exit(errs.length ? 1 : 0);
})().catch(e => { console.error('FAIL', e); process.exit(1); });
