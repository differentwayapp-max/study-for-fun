// Reading a passage aloud: play → pause keeps the place → go on from there; tapping a word starts there; the word is coloured.
// Speech is faked (headless has no voices): every utterance fires its word boundaries, unless paused.
const { chromium } = require('playwright');
const OUT = process.env.OUT || require('os').tmpdir();   // screenshots never land in the repo
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 360, height: 720 }, deviceScaleFactor: 2 })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { localStorage.setItem('sff_lang', 'he');
    window.__said = []; let timer = null;
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: { speaking: false, cancel() { clearTimeout(timer); }, pause() {}, resume() {},
      speak(u) { window.__said.push(u.text); const ws = [...u.text.matchAll(/\S+/g)]; let k = 0;
        const step = () => { if (k < ws.length) { u.onboundary && u.onboundary({ name: 'word', charIndex: ws[k].index }); k++; timer = setTimeout(step, 60); } else u.onend && u.onend(); };
        timer = setTimeout(step, 30); } } });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: function (t) { this.text = t; } }); });
  await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(2000); await p.evaluate(() => document.getElementById('fbLogin')?.remove());
  await p.evaluate(async () => { const s = await loadShare('en7-nov26'); s.id = 't1'; s.questions = s.qs; const ci = s.chapters.findIndex(c => c.text);
    const k = { id: 'k1', name: 'בן', grade: 6, color: '#2F6BFF' }; kids.push(k); s.kidId = 'k1'; sets.push(s);
    startGame(s, s.questions.filter(q => q.ch === ci), 'choice', ci); });
  await p.waitForTimeout(800);
  const st = () => p.evaluate(() => ({ i: RD.i, on: RD.on, n: RD.words.length, lit: document.querySelector('.passage .rw.on')?.dataset.i, btn: document.querySelector('.rdplay')?.textContent }));
  const res = {};
  res.start = await st();
  await p.click('.rdplay'); await p.waitForTimeout(700); res.playing = await st();
  if (OUT) await p.screenshot({ path: `${OUT}/reader_on.png` });
  await p.click('.rdplay'); await p.waitForTimeout(400); res.paused = await st();
  await p.waitForTimeout(500); res.pausedLater = await st();
  await p.click('.rdplay'); await p.waitForTimeout(300); res.resumed = await st();
  await p.click('.passage .rw[data-i="40"]'); await p.waitForTimeout(200); res.tapped = await st();
  console.log(JSON.stringify(res));
  const ok = !res.start.on && res.playing.on && res.playing.lit != null && !res.paused.on && res.paused.i === res.pausedLater.i && res.paused.i > 0
    && res.resumed.on && res.resumed.i >= res.paused.i && res.tapped.i >= 40 && res.tapped.i < 44;
  if (!ok) errs.push('reader');
  console.log(JSON.stringify({ errs })); await b.close(); process.exit(errs.length ? 1 : 0);
})().catch(e => { console.error('FAIL', e); process.exit(1); });
