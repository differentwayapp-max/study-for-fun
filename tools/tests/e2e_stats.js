// The parent's tracking ("מעקב"), two levels, on the emulators (firestore, auth; functions for the kid link):
// a family of 3 – נועה (English with mistakes + math), יואב (no practice for 4 days, a test in 2 days), תמר (no practice sets).
// Level 1: one short card per kid with the right "most important now" (words / not practising + the test / no practice sets);
//   "תרגול ממוקד" makes a focused (reinf) set at once, no build; "תזכורת בוואטסאפ" opens wa.me with the kid's link; 7 / 30 days
//   changes the squares and the numbers; a tutor sees only their kids; with 3 kids at most ~1.5 screens at 390×844.
// Level 2: the first tab is the set with the most to strengthen, the weakest first, "sits well" folded, the focused-practice
//   button seen with no scrolling and above the bottom bar; back to everyone.
// OUT=dir: level 1 and level 2, Hebrew and English, 390×844 and 375×667.
const { chromium } = require('playwright');
const APP = process.env.APP || 'http://localhost:8765/', OUT = process.env.OUT || require('os').tmpdir();
const EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' };
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) process.exitCode = 1; };
const GOOGLE = { sub: 'statsP', email: 'statsp@t.local', email_verified: true, name: 'שירה' };
(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const errs = [];
  const ctx = async (lang = 'he', w = 390, h = 844) => { const c = await b.newContext({ viewport: { width: w, height: h } });
    await c.addInitScript(([E, g, l]) => { window.SFF_REST_EMU = E; window.SFF_TEST_GOOGLE = g; localStorage.setItem('sff_lang', l); }, [EMU, GOOGLE, lang]); return c; };
  const open = async c => { const p = await c.newPage(); p.on('pageerror', e => errs.push(e.message)); await p.goto(APP, { waitUntil: 'load' }); await p.waitForTimeout(2000); if (await p.$('#fbGo')) await p.click('#fbGo');
    await p.waitForFunction(() => window.SFF_ROLE, null, { timeout: 25000 }); await p.waitForTimeout(2000); await p.evaluate(() => { document.getElementById('intro')?.remove(); document.getElementById('onb')?.remove(); document.getElementById('focusNew')?.remove(); }); return p; };
  // a game as the app records it: a chapter's questions, the first `wrong` answered wrong
  const play = (p, setId, kid, ch, wrong, ago = 0) => p.evaluate(([setId, kid, ch, wrong, ago]) => { const s = getSet(setId), qs = getChapters(s)[ch].qs, bad = qs.slice(0, wrong), by = {};
    qs.forEach(q => { by[q.topic] = by[q.topic] || { r: 0, n: 0 }; by[q.topic].n++; if (!bad.includes(q)) by[q.topic].r++; });
    history.unshift({ at: Date.now() - ago, kidId: kid, kid: '', subject: s.subject, grade: s.grade, setId: s.id, retry: false, topic: '', ch, right: qs.length - bad.length, n: qs.length, score: 10, mode: 'choice',
      qr: qs.map(q => s.questions.indexOf(q) + '.' + (bad.includes(q) ? '0.' + (q.answer + 1) % q.options.length : '1')), qk: qs.map(q => tkey(q.question) + (bad.includes(q) ? ':' + tkey(q.options[(q.answer + 1) % q.options.length]) : '')), topics: by });
    saveHistoryLocal(); pushProgress(kid); }, [setId, kid, ch, wrong, ago]);
  const day = 864e5;

  console.log('1. a family of 3');
  const c = await ctx(); const p = await open(c);
  const ids = await p.evaluate(async () => {
    kids.push({ id: 'k1', name: 'נועה', grade: 3, color: '#FF5C8A' }, { id: 'k2', name: 'יואב', grade: 4, color: '#2F6BFF' }, { id: 'k3', name: 'תמר', grade: 2, color: '#24C78E' }); saveKids();
    const en = await loadShare('en3'); en.src = 'st1'; const A = applyImport(en, kidById('k1')).set;
    const m = await loadShare('math3'); m.src = 'st2'; const M = applyImport(m, kidById('k1')).set; M.id = 's' + (Date.now() + 1);
    const y = await loadShare('en4'); y.src = 'st3'; const Y = applyImport(y, kidById('k2')).set; Y.id = 's' + (Date.now() + 2);
    const d = new Date(Date.now() + 2 * 864e5); Y.examDate = d.toISOString().slice(0, 10);
    store.save(); return { A: A.id, M: M.id, Y: Y.id, examDay: d.getDay() }; });
  // נועה: today and yesterday, English with mistakes in chapter 0, a little in chapter 1; math well
  await play(p, ids.A, 'k1', 0, 6, 0); await play(p, ids.A, 'k1', 0, 5, 3600e3); await play(p, ids.A, 'k1', 1, 3, day); await play(p, ids.A, 'k1', 1, 2, day + 500); await play(p, ids.M, 'k1', 0, 0, day + 1000); await play(p, ids.A, 'k1', 2, 0, 9 * day);
  // יואב: 4 days ago, no mistakes
  await play(p, ids.Y, 'k2', 0, 0, 4 * day);
  await p.evaluate(() => go('stats')); await p.waitForTimeout(1200);

  console.log('2. level 1 – every kid at a glance');
  const L1 = () => p.evaluate(() => [...document.querySelectorAll('#sBody .skcard')].map(c => ({ kid: c.dataset.kid, now: (c.querySelector('.sknow') || {}).className || '', txt: (c.querySelector('.sknow') || {}).innerText || '',
    btns: [...c.querySelectorAll('.skbtns .btn')].map(x => x.textContent.trim()), days: c.querySelectorAll('.sdays i').length, on: c.querySelectorAll('.sdays i.on').length, wk: (c.querySelector('.skweek .hint') || {}).textContent || '' })));
  let L = await L1(); const K = id => L.find(x => x.kid === id) || {};
  ok(L.length === 3, '3 cards: ' + L.map(x => x.kid).join(', '));
  ok(/focus/.test(K('k1').now) && /לחזק באנגלית/.test(K('k1').txt) && K('k1').btns[0] === 'תרגול ממוקד' && K('k1').btns.includes('פירוט ›'), 'נועה: "' + K('k1').txt + '" + תרגול ממוקד / פירוט');
  ok(await p.evaluate(() => !!document.querySelector('.skcard[data-kid="k1"] .sknow bdi')), "נועה's words are in <bdi>");
  const wd = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'][ids.examDay];
  ok(/idle/.test(K('k2').now) && /לא תרגל\/ה 4 ימים/.test(K('k2').txt) && new RegExp('המבחן ביום ' + wd).test(K('k2').txt) && /תזכורת בוואטסאפ/.test(K('k2').btns[0]), 'יואב: "' + K('k2').txt + '" + תזכורת בוואטסאפ');
  ok(/none/.test(K('k3').now) && /עוד אין תרגולים/.test(K('k3').txt) && /תרגול/.test(K('k3').btns[0]), 'תמר: "עוד אין תרגולים" + "＋ תרגול"');
  ok(K('k1').days === 7 && K('k1').on === 2 && /2\/7 ימים/.test(K('k1').wk) && K('k2').on === 1, '7 days: נועה 2/7 (' + K('k1').wk + '), יואב 1/7');
  await p.waitForTimeout(800);
  const wa = await p.evaluate(() => { const a = document.getElementById('stRem_k2'); return a ? { href: a.getAttribute('href'), target: a.target } : null; });
  const msg = wa && decodeURIComponent((wa.href.split('text=')[1] || ''));
  ok(wa && wa.href.startsWith('https://wa.me/?text=') && /\?f=[^&]+&t=[^&]+&k=k2/.test(msg) && /יואב/.test(msg) && wa.target === '_blank', 'the reminder: wa.me with יואב\'s own link – "' + (msg || '').split('\n')[0] + '"');
  const h1 = await p.evaluate(() => document.documentElement.scrollHeight);
  ok(h1 <= 1.5 * 844, `level 1 with 3 kids: ${h1}px (≤ 1.5 × 844)`);
  await p.click('.srange button:nth-child(2)'); await p.waitForTimeout(400); L = await L1();
  ok(K('k1').days === 30 && /\/30 ימים/.test(K('k1').wk) && K('k1').on === 3 && await p.evaluate(() => /30 הימים האחרונים/.test(document.querySelector('.shead h2').textContent)), '30 days: 30 squares, נועה 3/30 (' + K('k1').wk + ')');
  await p.click('.srange button:nth-child(1)'); await p.waitForTimeout(300);
  // "תרגול ממוקד" on level 1: a focused set at once, no build
  const before = await p.evaluate(() => ({ sets: sets.length, builds: (typeof BUILDS !== 'undefined' ? BUILDS.length : 0) }));
  await p.click('.skcard[data-kid="k1"] .skbtns .btn:first-child'); await p.waitForTimeout(800);
  const after = await p.evaluate(a => ({ reinf: sets.filter(s => s.reinf === a).length, sets: sets.length, builds: (typeof BUILDS !== 'undefined' ? BUILDS.length : 0), now: document.querySelector('.skcard[data-kid="k1"] .sknow').className }), ids.A);
  ok(after.reinf === 1 && after.sets === before.sets + 1 && after.builds === before.builds, 'תרגול ממוקד: a focused set (reinf) made at once, no build');

  console.log('3. level 2 – one kid');
  // a fresh source with mistakes again (the focused set exists now): open נועה's details
  await p.evaluate(a => { sets = sets.filter(s => s.reinf !== a); store.save(); go('stats'); }, ids.A); await p.waitForTimeout(400);
  await p.click('.skcard[data-kid="k1"] .skbtns .btn:last-child'); await p.waitForTimeout(600);
  const L2 = await p.evaluate(() => { const tabs = [...document.querySelectorAll('.stabs button')].map(b => ({ t: b.textContent.trim(), on: b.classList.contains('on') }));
    const pcts = [...document.querySelectorAll('.swhat .strow b')].map(b => parseInt(b.textContent)), cls = [...document.querySelectorAll('.swhat .strow b')].map(b => b.className);
    const f = document.querySelector('#sFocus:not(.hidden) .sfbtn'), r = f && f.getBoundingClientRect(), nav = document.getElementById('bNav').getBoundingClientRect();
    return { title: document.getElementById('topTitle').textContent, back: document.getElementById('topBack').textContent, backOn: !document.getElementById('topBack').classList.contains('hidden'), tabs, pcts, cls,
      folded: !!document.querySelector('details.sgood') && !document.querySelector('details.sgood').open, words: document.querySelectorAll('.swords .wchip').length,
      btn: f ? { t: f.innerText.trim(), top: r.top, bottom: r.bottom, h: r.height } : null, navTop: nav.top, scrollY: window.scrollY, vh: innerHeight }; });
  ok(L2.title === 'נועה' && L2.backOn && /מעקב/.test(L2.back), 'the top bar: נועה, "‹ מעקב"');
  ok(L2.tabs.length >= 2 && L2.tabs[0].on && /לחזק/.test(L2.tabs[0].t) && /אנגלית/.test(L2.tabs[0].t), 'the first tab is the one with the most to strengthen: ' + L2.tabs.map(t => t.t + (t.on ? ' ✓' : '')).join(' | '));
  const weakFirst = L2.cls.every((c, i) => i === 0 || !(c === 'weak' && L2.cls[i - 1] === 'mid')) && L2.cls.reduce((a, c, i) => a && (i === 0 || c !== L2.cls[i - 1] || L2.pcts[i] >= L2.pcts[i - 1]), true);
  ok(L2.pcts.length > 0 && weakFirst, '"מה לחזק": "לחזק" before "כמעט שם", the weakest first: ' + L2.pcts.join(', '));
  ok(L2.folded && L2.words > 0, '"יושב טוב" is folded; ' + L2.words + ' words with mistakes');
  ok(L2.btn && L2.btn.top >= 0 && L2.btn.bottom <= L2.navTop && L2.btn.h >= 44 && L2.scrollY === 0 && /תרגול ממוקד לנועה · \d+ מילים/.test(L2.btn.t), `the focused-practice button: seen with no scrolling, above the bar (${L2.btn && Math.round(L2.btn.bottom)} ≤ ${Math.round(L2.navTop)}): "${L2.btn && L2.btn.t}"`);
  await p.click('.swords .wchip'); await p.waitForTimeout(300);
  ok(await p.evaluate(() => !!document.querySelector('.swhat .wdetail')), 'a word opens its detail (games, what was answered)');
  await p.click('.stabs button:nth-child(2)'); await p.waitForTimeout(300);
  ok(await p.evaluate(() => /חשבון|מתמטיקה|math/i.test(document.querySelector('.stabs button.on').textContent) && document.getElementById('sFocus').classList.contains('hidden')), 'the math tab: nothing to strengthen – no pinned button');
  await p.click('.stabs button:nth-child(1)'); await p.waitForTimeout(300);
  await p.click('.srow:last-child'); await p.waitForTimeout(300);
  const HS = await p.evaluate(() => { const d = document.getElementById('histDlg'), sh = d && d.querySelector('.hsheet'), r = sh && sh.getBoundingClientRect();
    return { open: !!d && !d.classList.contains('hidden'), bars: d ? d.querySelectorAll('.hbars .hbar').length : 0, on: d ? d.querySelectorAll('.hbars .hbar[style]').length : 0, now: d ? d.querySelectorAll('.hbar.now').length : 0,
      rows: d ? d.querySelectorAll('.hrow').length : 0, more: !!(d && d.querySelector('.hmore')), sum: d ? (d.querySelector('.hsum') || {}).textContent || '' : '', inScreen: !!r && r.bottom <= innerHeight + 1 && r.top >= 0, table: d ? d.querySelectorAll('table').length : 0 }; });
  ok(HS.open && HS.bars === 14 && HS.on >= 1 && HS.now === 1 && HS.rows >= 3 && HS.rows <= 4 && /\d+ משחקים ב-14 ימים · \d+ ימים עם תרגול · \d+% הצלחה/.test(HS.sum) && HS.inScreen && !HS.table,
    'the history row opens a sheet: 14 days as bars (today outlined), one line of totals, the last games (≤ 4), no table ' + JSON.stringify(HS));
  if (HS.more) { await p.click('#histDlg .hmore'); await p.waitForTimeout(250); ok(await p.evaluate(() => document.querySelectorAll('#histDlg .hrow').length > 4 && !document.querySelector('#histDlg .hmore')), '"עוד N משחקים" shows them all'); }
  await p.evaluate(() => document.getElementById('histDlg').classList.add('hidden'));
  await p.click('#topBack'); await p.waitForTimeout(400);
  ok(await p.evaluate(() => document.querySelectorAll('#sBody .skcard').length === 3 && document.getElementById('topBack').classList.contains('hidden')), 'back: every kid again');
  // from the home card / "חדש!": straight to the kid and the set
  await p.evaluate(a => openFocusIn(a), ids.A); await p.waitForTimeout(400);
  ok(await p.evaluate(() => ST.kid === 'k1' && document.getElementById('topTitle').textContent === 'נועה'), 'openFocusIn opens the kid\'s level 2');
  await p.evaluate(() => go('stats'));

  console.log('4. a tutor sees only their kids');
  const tut = await p.evaluate(() => { const r = window.SFF_ROLE, m = window.SFF_MEMBER; window.SFF_ROLE = 'tutor'; window.SFF_MEMBER = { kids: ['k2'] }; renderStats(); const n = [...document.querySelectorAll('#sBody .skcard')].map(c => c.dataset.kid);
    const rem = !!document.getElementById('stRem_k2'); window.SFF_ROLE = r; window.SFF_MEMBER = m; renderStats(); return { n, rem }; });
  ok(tut.n.join() === 'k2' && !tut.rem, 'a tutor: only יואב, no reminder with the kid\'s link');

  console.log('5. screenshots');
  for (const [lang, w, h] of [['he', 390, 844], ['en', 390, 844], ['he', 375, 667], ['en', 375, 667]]) {
    const cc = await ctx(lang, w, h), q = await open(cc); await q.waitForFunction(() => kids.length === 3 && history.length >= 6, null, { timeout: 20000 }).catch(() => {});
    await q.evaluate(() => go('stats')); await q.waitForTimeout(1200);
    if (OUT) await q.screenshot({ path: `${OUT}/stats_l1_${lang}_${w}x${h}.png` });
    if (lang === 'en' && w === 390) console.log('    missing (en, level 1/2):', JSON.stringify(await q.evaluate(() => [...(window.__i18nMissing || [])].filter(x => /[֐-׿]/.test(x)).slice(-30))));
    if (lang === 'en') { const heb = await q.evaluate(() => (document.getElementById('sBody').innerText.match(/[^\s]*[֐-׿][^\s]*/g) || []).filter(w => !/נועה|יואב|תמר/.test(w))); ok(!heb.length, `en ${w}×${h} level 1: no Hebrew left ` + heb.slice(0, 6).join(' ')); }
    await q.evaluate(() => statsKid('k1')); await q.waitForTimeout(800);
    if (OUT) await q.screenshot({ path: `${OUT}/stats_l2_${lang}_${w}x${h}.png` });
    if (lang === 'en') { const heb = await q.evaluate(() => ((document.getElementById('sBody').innerText + ' ' + document.getElementById('sFocus').innerText).match(/[^\s]*[֐-׿][^\s]*/g) || []).filter(w => !/נועה|יואב|תמר/.test(w))); ok(!heb.length, `en ${w}×${h} level 2: no Hebrew left ` + heb.slice(0, 6).join(' ')); }
    await cc.close();
  }
  ok(!errs.length, 'no page errors ' + JSON.stringify(errs.slice(0, 3)));
  await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
