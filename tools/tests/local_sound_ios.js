// iPhone sound: the app lets the phone pick its own voice (the "enhanced / premium / Siri" voices iPhone lists are often
// not downloaded – speaking with them is silent); the sound check starts the tone and the voice inside the tap itself,
// before any wait (iPhone plays sound only from a tap) and opens its window at once; a chosen voice that stays silent is
// said again with the phone's own voice (desktop). Uses a fake speechSynthesis that records every call.
const { chromium, devices } = require('playwright');
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) process.exitCode = 1; };
const FAKE = () => {
  const log = window.__speak = [];
  const voices = [{ name: 'Samantha', lang: 'en-US', localService: true }, { name: 'Ava (Premium)', lang: 'en-US', localService: true }, { name: 'Carmit', lang: 'he-IL', localService: true }];
  const ss = { speaking: false, pending: false, onvoiceschanged: null, getVoices: () => voices, cancel() { log.push({ cancel: 1, t: performance.now() }); },
    speak(u) { log.push({ text: u.text, voice: u.voice ? u.voice.name : null, t: performance.now(), sync: !!window.__inTap });
      if (u.voice && /Premium/.test(u.voice.name)) return;            // a premium voice that is not downloaded: silent
      setTimeout(() => u.onstart && u.onstart({}), 30); setTimeout(() => u.onend && u.onend({}), 60); } };
  Object.defineProperty(window, 'speechSynthesis', { value: ss, configurable: true });
  window.SpeechSynthesisUtterance = function (t) { this.text = t; this.lang = ''; this.rate = 1; this.voice = null; };
};
(async () => {
  const b = await chromium.launch(), errs = [];
  for (const [tag, opt] of [['iphone', devices['iPhone 13']], ['desktop', { viewport: { width: 1280, height: 800 } }]]) {
    const ctx = await b.newContext(opt), p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
    await ctx.addInitScript(FAKE); await ctx.addInitScript(() => localStorage.setItem('sff_lang', 'he'));
    await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(1500); await p.evaluate(() => document.getElementById('fbLogin')?.remove());
    const r = await p.evaluate(async () => {
      const out = { ios: IOS, voice: (bestVoice('en-US') || {}).name || null };
      __speak.length = 0; window.__inTap = true; const pr = openSoundCheck(); window.__inTap = false;   // the tap: everything before the first await runs in it
      out.inTap = __speak.some(x => x.text === 'Hello! Study for fun.' && x.sync);
      out.openAtOnce = !document.getElementById('moreDlg').classList.contains('hidden') && /בודקים/.test(document.querySelector('#moreDlg .moresheet').textContent);
      await Promise.race([pr, new Promise(r => setTimeout(r, 6000))]); out.result = document.querySelector('#moreDlg .moresheet').innerText;
      closeMore(); __speak.length = 0; sayWord('apple'); await new Promise(r => setTimeout(r, 1800)); out.word = __speak.filter(x => x.text).map(x => x.voice || '(phone)');
      return out; });
    console.log(tag, JSON.stringify({ ...r, result: r.result.replace(/\s+/g, ' ').slice(0, 160) }));
    if (tag === 'iphone') {
      ok(r.ios && r.voice === null, 'iPhone: the app does not choose a voice – the phone uses its own');
      ok(r.word.length === 1 && r.word[0] === '(phone)', 'iPhone: a word is said once, with the phone\'s voice');
    } else {
      ok(!r.ios && r.voice === 'Ava (Premium)', 'desktop: the most natural voice is still chosen');
      ok(r.word.length === 2 && r.word[1] === '(phone)', 'desktop: a chosen voice that stays silent is said again with the default voice');
    }
    ok(r.inTap, tag + ': the check starts the voice inside the tap');
    ok(r.openAtOnce, tag + ': the check window opens at once');
    ok(/✅ הקראה באנגלית/.test(r.result) && /לבדוק שוב/.test(r.result), tag + ': the result shows the voice worked, with "check again"');
    await ctx.close();
  }
  ok(!errs.length, 'no page errors ' + JSON.stringify(errs)); await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
