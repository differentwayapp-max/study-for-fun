// Google Play pictures from the app's own intro screens (one source for both): the 5 phone screens at 1080 × 2160
// (INTRO_ALL: main, play, material, track, family), in Hebrew → store/play/ and English → store/play/en/.
// The feature graphic (1024 × 500) is made only with FEATURE=1 – it doesn't change with the screens.
// Each screen is checked before its picture: nothing runs out of the 360 × 720 (a phone picture is whole), no audience tag.
// Serve the app first:  python3 -m http.server 8765 --directory public &   then:  node tools/store_shots.js
// (the page is opened with /?intro=<1-5|feature>&shot=1 – only that screen is drawn; nothing signs in). APP=url to use another address.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const APP = process.env.APP || 'http://localhost:8765/';
const ROOT = path.join(__dirname, '..', 'store', 'play');
const NAMES = ['1_main', '2_play', '3_material', '4_track', '5_family'];   // INTRO_ALL's order ("safe for kids" is in screen 5 and in the description)
const TAGS = /(^|\n)\s*(להורה|לילד|למורה הפרטי|למורה בבית הספר|בין האחים|לאחים, לחברים ולכיתה|For parents|For the parent|For kids|For the kid|For the private tutor|For the school teacher|Between siblings)\s*(\n|$)|לאחים, לחברים ולכיתה/;   // an audience tag is a line of its own
(async () => {
  const b = await chromium.launch();
  for (const lang of ['he', 'en']) {
    const out = lang === 'he' ? ROOT : path.join(ROOT, 'en'); fs.mkdirSync(out, { recursive: true });
    const shot = async (q, w, h, scale, file) => { const q0 = q;
      const c = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: scale });
      await c.addInitScript(l => { try { localStorage.setItem('sff_lang', l); } catch (e) {} }, lang);
      const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
      await p.goto(APP + '?intro=' + q + '&shot=1', { waitUntil: 'load' });
      await p.waitForSelector('#introShot'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(700);
      const bad = await p.evaluate(([l, tags, q0]) => { const root = document.getElementById('introShot'), t = root.innerText, out = l === 'en' ? (t.match(/[֐-׿][^\n]*/g) || []) : [];
        if (new RegExp(tags).test(t)) out.push('an audience tag: ' + t.match(new RegExp(tags))[0].trim());
        if (q0 !== 'feature') { const R = root.firstElementChild.getBoundingClientRect();   // nothing out of the 360 × 720
          if (Math.round(R.width) !== 360 || Math.round(R.height) !== 720) out.push('the screen is ' + R.width + '×' + R.height);
          for (const x of root.querySelectorAll('*')) { const r = x.getBoundingClientRect(); if (!r.width && !r.height) continue;
            if (r.left < R.left - .5 || r.top < R.top - .5 || r.right > R.right + .5 || r.bottom > R.bottom + .5) { out.push('out of the screen: ' + (x.className || x.tagName) + ' ' + [r.left, r.top, r.right, r.bottom].map(Math.round)); break; } } }
        return out; }, [lang, TAGS.source, String(q0)]);
      await p.screenshot({ path: path.join(out, file) });
      const png = fs.readFileSync(path.join(out, file)), W = png.readUInt32BE(16), H = png.readUInt32BE(20);
      if (W !== w * scale || H !== h * scale) bad.push(`the picture is ${W}×${H}`);
      if (errs.length || bad.length) { console.log('  ✗', lang, file, errs.concat(bad).join(' | ')); process.exitCode = 1; } else console.log('  ✓', lang, file);
      await c.close();
    };
    for (let i = 0; i < NAMES.length; i++) await shot(i + 1, 360, 720, 3, `phone_${NAMES[i]}.png`);     // 1080 × 2160
    const old = fs.readdirSync(out).filter(f => /^phone_.*\.png$/.test(f) && !NAMES.some(n => f === `phone_${n}.png`));
    if (old.length) console.log('  pictures not in the store any more (delete them):', old.join(', '));
    if (process.env.FEATURE) await shot('feature', 1024, 500, 1, 'feature_1024x500.png');
  }
  await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
