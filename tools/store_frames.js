// Store listing images (1080x1920): caption + 1, 2 or 4 phones. Plus feature graphic 1024x500 and icon 512.
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const R = path.join(__dirname, '../store/raw/'), O = path.join(__dirname, '../store/play/');
const img = f => 'data:image/png;base64,' + fs.readFileSync(R + f + '.png').toString('base64');
const FONT = '<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Varela+Round&display=swap" rel="stylesheet">';
const FRAMES = [
  ['1_subjects', 'למידה חוויתית<br>במקצועות הליבה', ['אנגלית', 'מתמטיקה', 'שפה', 'מדעים'], '#1B2A4A', ['s_eng', 's_math', 's_heb', 's_sci']],
  ['2_feedback', 'פידבק לילד וגם להורה', 'מה כבר יודעים, ובאילו נושאים כדאי לעשות חזרה', '#22B573', ['s_me', 's_parent']],
  ['3_family', 'כל המשפחה מלווה', 'משתפים בן/בת זוג, סבא וסבתא ומורה פרטי במעקב ובחיזוק', '#FF5C8A', ['s_family']],
  ['4_testday', 'תרגול לפי החומר<br>ועד יום המבחן', 'מפה של כל הפרקים, מותאמת לתאריך המבחן', '#F2A63B', ['s_add', 's_map']],
  ['5_games', 'משחק אחר בכל תחנה', 'שאלות עם תמונות, זיכרון, התאמה וסידור אותיות', '#2F6BFF', ['5_spell', '6_match']],
];
const phone = (f, w, x, y, rot = 0, z = 1, h = w * 16 / 9) => `<div class="ph" style="width:${w}px;height:${h}px;left:${x}px;top:${y}px;transform:rotate(${rot}deg);z-index:${z}"><img src="${img(f)}"></div>`;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  fs.readdirSync(O).filter(f => f.startsWith('phone_')).forEach(f => fs.unlinkSync(O + f));
  for (const [name, t, sub, bg, shots] of FRAMES) {
    const subHtml = Array.isArray(sub) ? `<div class="chips">${sub.map(s => `<span>${s}</span>`).join('')}</div>` : `<p>${sub}</p>`;
    const top = t.includes('<br>') ? 560 : 470;
    let phones = '';
    if (shots.length === 1) phones = phone(shots[0], 760, 160, top);
    if (shots.length === 2) phones = phone(shots[0], 560, 470, top + 40, 4, 1) + phone(shots[1], 560, 50, top + 150, -4, 2);
    if (shots.length === 4) phones = [[565, top - 30, 2], [75, top - 10, -2], [565, top + 640, -2], [75, top + 660, 2]].map(([x, y, r], i) => phone(shots[i], 440, x, y, r, 1, 600)).join('');
    await p.setContent(`<html dir="rtl"><head>${FONT}<style>
      body{margin:0;width:1080px;height:1920px;background:${bg};font-family:"Fredoka","Varela Round",sans-serif;color:#fff;overflow:hidden;position:relative}
      .dots{position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.12) 3px,transparent 3px);background-size:44px 44px}
      h1{position:relative;margin:110px 50px 0;font-size:92px;line-height:1.08;text-align:center;font-weight:700}
      p{position:relative;margin:28px 90px 0;font-size:44px;line-height:1.3;text-align:center;opacity:.95;font-family:"Varela Round",sans-serif}
      .chips{position:relative;display:flex;justify-content:center;gap:18px;margin-top:34px}
      .chips span{background:#fff;color:${bg};border-radius:999px;padding:10px 30px;font-size:44px;font-weight:700}
      .ph{position:absolute;border-radius:60px;background:#111;padding:18px;box-shadow:0 30px 80px rgba(0,0,0,.35)}
      .ph img{width:100%;height:100%;border-radius:44px;display:block;object-fit:cover;object-position:top}
    </style></head><body><div class="dots"></div><h1>${t}</h1>${subHtml}${phones}</body></html>`, { waitUntil: 'networkidle' });
    await p.waitForTimeout(300); await p.screenshot({ path: O + 'phone_' + name + '.png' });
  }
  await b.close(); console.log('done');
})();
