// Google Play pictures from the app's own intro screens (one source for both): the 8 phone screens at 1080 × 2160 and the
// feature graphic at 1024 × 500, in Hebrew → store/play/ and English → store/play/en/.
// Serve the app first:  python3 -m http.server 8765 --directory public &   then:  node tools/store_shots.js
// (the page is opened with /?intro=<1-8|feature>&shot=1 – only that screen is drawn; nothing signs in). APP=url to use another address.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const APP = process.env.APP || 'http://localhost:8765/';
const ROOT = path.join(__dirname, '..', 'store', 'play');
const NAMES = ['1_main', '2_play', '3_build', '4_focus', '5_progress', '6_testday', '7_compete', '8_share'];   // INTRO_ALL's order ("safe" → the description)
(async () => {
  const b = await chromium.launch();
  for (const lang of ['he', 'en']) {
    const out = lang === 'he' ? ROOT : path.join(ROOT, 'en'); fs.mkdirSync(out, { recursive: true });
    const shot = async (q, w, h, scale, file) => {
      const c = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: scale });
      await c.addInitScript(l => { try { localStorage.setItem('sff_lang', l); } catch (e) {} }, lang);
      const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
      await p.goto(APP + '?intro=' + q + '&shot=1', { waitUntil: 'load' });
      await p.waitForSelector('#introShot'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(700);
      const bad = await p.evaluate(l => { const t = document.getElementById('introShot').innerText;
        return l === 'en' ? (t.match(/[֐-׿][^\n]*/g) || []) : []; }, lang);
      await p.screenshot({ path: path.join(out, file) });
      if (errs.length || bad.length) { console.log('  ✗', lang, file, errs.concat(bad).join(' | ')); process.exitCode = 1; } else console.log('  ✓', lang, file);
      await c.close();
    };
    for (let i = 0; i < 8; i++) await shot(i + 1, 360, 720, 3, `phone_${NAMES[i]}.png`);     // 1080 × 2160
    await shot('feature', 1024, 500, 1, 'feature_1024x500.png');
  }
  await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
