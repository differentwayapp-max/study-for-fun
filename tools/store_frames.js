// Store listing images: framed screenshots with a caption (1080x1920) + feature graphic (1024x500) + icon 512.
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const R = path.join(__dirname, '../store/raw/'), O = path.join(__dirname, '../store/play/');
const img = f => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
const FONT = '<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Varela+Round&display=swap" rel="stylesheet">';
const SHOTS = [
  ['2_map', 'מפה עד יום המבחן', 'כל פרק הוא תחנה. רואים מה עברנו ומה נשאר', '#1B2A4A'],
  ['3_choice', 'לומדים דרך משחק', 'שאלות קצרות עם תמונות וקול', '#F2A63B'],
  ['5_spell', 'מסדרים אותיות', 'כותבים את המילה ושומעים איך אומרים אותה', '#2F6BFF'],
  ['6_match', 'משחקי התאמה וזיכרון', 'משחק אחר בכל תחנה, כל הפרק בכל משחק', '#FF5C8A'],
  ['7_me', 'מה אני יודע?', 'המילים שצריך לחזק, ותרגול שלהן בלחיצה', '#22B573'],
  ['8_parent', 'ההורה רואה הכול', 'ההתקדמות של כל ילד ומה עוד צריך לתרגל', '#1B2A4A'],
];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  for (const [f, t, sub, bg] of SHOTS) {
    await p.setContent(`<html dir="rtl"><head>${FONT}<style>
      body{margin:0;width:1080px;height:1920px;background:${bg};font-family:"Fredoka","Varela Round",sans-serif;color:#fff;overflow:hidden;position:relative}
      .dots{position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.12) 3px,transparent 3px);background-size:44px 44px}
      h1{position:relative;margin:110px 60px 0;font-size:96px;line-height:1.05;text-align:center;font-weight:700}
      p{position:relative;margin:26px 90px 0;font-size:44px;text-align:center;opacity:.92;font-family:"Varela Round",sans-serif}
      .ph{position:absolute;left:50%;top:470px;transform:translateX(-50%);width:800px;height:1422px;border-radius:72px;background:#111;padding:22px;box-shadow:0 30px 80px rgba(0,0,0,.35)}
      .ph img{width:800px;height:1422px;border-radius:52px;display:block;object-fit:cover;object-position:top}
    </style></head><body><div class="dots"></div><h1>${t}</h1><p>${sub}</p><div class="ph"><img src="${img(R + f + '.png')}"></div></body></html>`, { waitUntil: 'networkidle' });
    await p.waitForTimeout(300); await p.screenshot({ path: O + 'phone_' + f + '.png' });
  }
  // feature graphic 1024x500
  await p.setViewportSize({ width: 1024, height: 500 });
  await p.setContent(`<html dir="rtl"><head>${FONT}<style>
    body{margin:0;width:1024px;height:500px;background:#F2A63B;font-family:"Fredoka","Varela Round",sans-serif;color:#1B2A4A;overflow:hidden;position:relative}
    .dots{position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.18) 3px,transparent 3px);background-size:40px 40px}
    .ic{position:absolute;right:70px;top:110px;width:280px;height:280px;border-radius:64px;box-shadow:0 10px 0 #1B2A4A;border:5px solid #1B2A4A}
    .t{position:absolute;right:400px;left:50px;top:120px}
    h1{margin:0;font-size:84px;line-height:1;direction:ltr;text-align:right} h2{margin:22px 0 0;font-size:44px;font-family:"Varela Round",sans-serif;font-weight:400}
    .em{margin-top:26px;font-size:54px;letter-spacing:12px}
  </style></head><body><div class="dots"></div><img class="ic" src="${img(path.join(__dirname, '../public/icons/maskable-512.png'))}">
    <div class="t"><h1>Study for fun</h1><h2>מתכוננים למבחן דרך משחקים</h2><div class="em">🗺️🃏🔤⭐</div></div></body></html>`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(300); await p.screenshot({ path: O + 'feature_1024x500.png' });
  fs.copyFileSync(path.join(__dirname, '../public/icons/maskable-512.png'), O + 'icon_512.png');
  await b.close(); console.log('done');
})();
