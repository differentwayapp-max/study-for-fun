// Phone screens on iPhone sizes, on the emulators (firestore, auth):
// the bottom bar (#bNav / #kNav) never hides anything – scrolled to the end, the last thing on a screen is above it; no sticky
// header leaves content half under it; no height from vh. Every size twice: in Safari, and as an app opened from the home
// screen (the safe area: --sat 47px, --sab 34px – the app reads --sat/--sab, falling back to env(safe-area-inset-*)).
// 1. "ילדים": a family of 4 kids (one with 1 practice set, one with 5): every kid's card ends above the bar and its
//    "+ תרגול" is seen with no scrolling; "ימים ברצף" stays on one line;
// 2. the catalog: after scrolling 100 / 170 / 300 px nothing is half under a sticky element; at the end, the last thing above
//    the bar;
// 3. the other screens (the end of each above the bar): the kid's home, the map, "מה אני יודע", a set's screen, the progress
//    screen, the family, the wizard; the teachers' app: today, students, assignments, reports.
// OUT=dir: screenshots of "ילדים" and the catalog (a small scroll, the end) at 390×664 and 390×844 with the safe area.
const { chromium } = require('playwright');
const APP = 'http://localhost:8765/', OUT = process.env.OUT || require('os').tmpdir();
const FS = 'http://127.0.0.1:8080', PROJ = 'study-for-fun-7b03c', DOCS = `${FS}/v1/projects/${PROJ}/databases/(default)/documents`;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) process.exitCode = 1; };
const enc = v => v === null || v === undefined ? { nullValue: null } : typeof v === 'boolean' ? { booleanValue: v } : typeof v === 'number' ? (Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v })
  : typeof v === 'string' ? { stringValue: v } : Array.isArray(v) ? { arrayValue: { values: v.map(enc) } } : { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, enc(x)])) } };
const put = (path, obj) => fetch(`${DOCS}/${path}`, { method: 'PATCH', headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, enc(v)])) }) });
const EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' };
const SIZES = [[375, 548], [375, 629], [390, 664], [430, 740], [360, 740], [390, 844], [430, 932]];
const MODES = [['safari', null], ['home', [47, 34]]];

// in the page: the screen's state after a change of size / safe area
const SETUP = ([sa]) => { const R = document.documentElement.style; if (sa) { R.setProperty('--sat', sa[0] + 'px'); R.setProperty('--sab', sa[1] + 'px'); } else { R.removeProperty('--sat'); R.removeProperty('--sab'); }
  dispatchEvent(new Event('resize')); };
// scrolled to the end: the lowest thing on the screen (not sticky / fixed) against the top of the bottom bar
const END = (view) => { window.scrollTo(0, document.documentElement.scrollHeight); const v = document.getElementById(view);
  const nav = [...document.querySelectorAll('.bnav')].find(n => n.offsetHeight > 0), navTop = nav ? nav.getBoundingClientRect().top : innerHeight;
  let low = null, lowB = -1;
  const pinned = el => { for (let e = el; e && e !== v; e = e.parentElement) { const p = getComputedStyle(e).position; if (p === 'sticky' || p === 'fixed') return true; } return false; };
  v.querySelectorAll('*').forEach(el => { if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') return; const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return;
    if (pinned(el) || (el.closest('details:not([open])') && !el.closest('summary'))) return; let clip = false; for (let e = el.parentElement; e && e !== v; e = e.parentElement) { const o = getComputedStyle(e).overflowY; if (o === 'auto' || o === 'scroll' || o === 'hidden') { const pr = e.getBoundingClientRect(); if (r.bottom > pr.bottom + 1) { clip = true; break; } } }
    if (clip) return; if (r.bottom > lowB) { lowB = r.bottom; low = (el.id ? '#' + el.id : el.className ? '.' + String(el.className).split(' ')[0] : el.tagName) + ' «' + (el.textContent || '').trim().slice(0, 24) + '»'; } });
  return { ok: lowB <= navTop + 0.5, lowB: Math.round(lowB), navTop: Math.round(navTop), low, nav: !!nav }; };
// nothing in the view half under a sticky element (a sticky element's own content does not count)
const HALF = (view) => { const v = document.getElementById(view), st = [...v.querySelectorAll('*')].filter(e => e.offsetParent && getComputedStyle(e).position === 'sticky');
  const bad = []; st.forEach(s => { const sr = s.getBoundingClientRect(); v.querySelectorAll('*').forEach(el => { if (s.contains(el) || el.contains(s) || !el.offsetParent) return; const r = el.getBoundingClientRect(); if (r.height < 2) return;
    const over = Math.min(r.bottom, sr.bottom) - Math.max(r.top, sr.top); if (over > 1 && over < r.height - 1 && r.left < sr.right && r.right > sr.left) bad.push(String(el.className || el.tagName).split(' ')[0]); }); });
  return { sticky: st.length, bad: [...new Set(bad)].slice(0, 6) }; };

(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const errs = [];
  const ctx = async g => { const c = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
    await c.addInitScript(([E, g]) => { window.SFF_REST_EMU = E; window.SFF_TEST_GOOGLE = g; localStorage.setItem('sff_lang', 'he'); }, [EMU, g]); return c; };
  const shot = async (p, name) => { if (process.env.OUT) await p.screenshot({ path: `${OUT}/layout_${name}.png` }); };

  console.log('1. a family: 4 kids, one with 1 practice set, one with 5');
  const c = await ctx({ sub: 'layoutP', email: 'layoutp@t.local', email_verified: true, name: 'שירה' }); const p = await c.newPage(); p.on('pageerror', e => errs.push('parent: ' + e.message));
  await p.goto(APP, { waitUntil: 'load' }); await p.waitForTimeout(2000); if (await p.$('#fbGo')) await p.click('#fbGo');
  await p.waitForFunction(() => window.SFF_ROLE, null, { timeout: 25000 }); await p.waitForTimeout(2000);
  const ids = await p.evaluate(async () => { document.getElementById('intro')?.remove(); document.getElementById('onb')?.remove(); document.getElementById('focusNew')?.remove();
    [['k1', 'נועה', 3, '#FF5C8A'], ['k2', 'יואב', 4, '#2F6BFF'], ['k3', 'תמר', 2, '#24C78E'], ['k4', 'אלכסנדרה', 5, '#F2A63B']].forEach(([id, name, grade, color]) => kids.push({ id, name, grade, color })); saveKids();
    const one = applyImport(await loadShare('en3'), kidById('k1')).set;
    const five = []; for (const s of ['en4', 'en3-0e3c80', 'en3-1cc43d', 'en4-20fa84', 'en4-23a979']) { const sh = await loadShare(s); sh.src = 'lay' + five.length; const x = applyImport(sh, kidById('k2')).set; x.id = 's' + Date.now() + five.length; five.push(x); }
    five[0].examDate = new Date(Date.now() + 5 * 864e5).toISOString().slice(0, 10); five[0].created = Date.now() - 2 * 864e5;   // the map with a test: the readiness header
    store.save(); return { one: one.id, five: five.map(x => x.id) }; });
  const cnt = await p.evaluate(() => [kids.length, ...kids.map(k => kidSets(k).length)]);
  ok(cnt.join() === '4,1,5,0,0', 'נועה has 1 practice set, יואב 5, תמר and אלכסנדרה none: ' + cnt.join());

  const fails = { kids: [], streak: [], cat: [], end: [], map: [] }, seen = new Set();
  for (const [w, h] of SIZES) for (const [mode, sa] of MODES) {
    const tag = `${w}×${h} ${mode}`;
    await p.setViewportSize({ width: w, height: h }); await p.evaluate(SETUP, [sa]); await p.waitForTimeout(250);
    // 1. ילדים
    await p.evaluate(() => go('kids')); await p.waitForTimeout(400);
    const K = await p.evaluate(() => { window.scrollTo(0, 0); const nav = document.getElementById('bNav').getBoundingClientRect(), hd = document.querySelector('header').getBoundingClientRect();
      return [...document.querySelectorAll('#kidCar .slide')].map(s => { const c = s.querySelector('.kidhero'); if (!c) return null; const r = c.getBoundingClientRect(), add = c.querySelector('.khadd'), a = add && add.getBoundingClientRect();
        const st = c.querySelector('.khsub'), sr = st && st.getBoundingClientRect();
        return { who: (c.querySelector('h2') || {}).textContent || 'form', bottom: Math.round(r.bottom), top: Math.round(r.top), navTop: Math.round(nav.top), hdB: Math.round(hd.bottom),
          add: a ? { top: Math.round(a.top), bottom: Math.round(a.bottom), vis: getComputedStyle(add).visibility } : null, streak: sr ? Math.round(sr.height) : 0, streakLH: st ? parseFloat(getComputedStyle(st).lineHeight) || 16 : 0 }; }).filter(Boolean); });
    K.forEach(k => { if (k.bottom > k.navTop || k.top < k.hdB || (k.add && (k.add.bottom > k.navTop || k.add.top < k.hdB))) fails.kids.push(`${tag} ${k.who}: card ${k.top}–${k.bottom}, + ${k.add && k.add.top + '–' + k.add.bottom}, bar at ${k.navTop}`);
      if (k.streak > k.streakLH * 1.5) fails.streak.push(`${tag} ${k.who}: ${k.streak}px`); });
    if (w === 390 && mode === 'home' && (h === 664 || h === 844)) await shot(p, `kids_${w}x${h}_home`);
    // 2. the catalog
    await p.evaluate(() => openCatalog('k1')); await p.waitForTimeout(700);
    for (const y of [100, 170, 300]) { await p.evaluate(y => window.scrollTo(0, y), y); await p.waitForTimeout(80); const r = await p.evaluate(HALF, 'vCat');
      if (r.bad.length) fails.cat.push(`${tag} after ${y}px: half under a sticky element: ${r.bad.join(', ')}`);
      if (y === 170 && w === 390 && mode === 'home' && (h === 664 || h === 844)) await shot(p, `catalog_${w}x${h}_home_scroll170`); }
    let e = await p.evaluate(END, 'vCat'); if (!e.ok) fails.end.push(`${tag} catalog: ${e.low} ends at ${e.lowB}, bar at ${e.navTop}`); seen.add('הקטלוג');
    if (w === 390 && mode === 'home' && (h === 664 || h === 844)) await shot(p, `catalog_${w}x${h}_home_end`);
    // 3. the other screens of the family app
    const screens = [['ההתקדמות (מעקב)', "go('stats')", 'vStats'], ['המשפחה', "go('family')", 'vFamily'], ['האשף – תרגול חדש', "openWizard('k1')", 'vWizard'], ['האשף – שלב החומר', "openWizard('k1');W.step=3;wizRender()", 'vWizard'],
      ['מסך התרגול', `curSet=getSet(${JSON.stringify(ids.five[0])});renderReview(curSet);show('vReview')`, 'vReview'],
      ['בית הילד', "activeKid='k2';go('kid')", 'vKid'], ['המפה', `openRoad(${JSON.stringify(ids.five[0])})`, 'vRoad'], ['מה אני יודע', "activeKid='k2';openMe()", 'vMe'],
      ['מעקב – כל הילדים', "go('stats')", 'vStats'], ['מעקב – ילד אחד', "statsKid('k2')", 'vStats']];
    for (const [name, js, view] of screens) { await p.evaluate(js); await p.waitForTimeout(450); e = await p.evaluate(END, view); seen.add(name);
      if (!e.ok || !e.nav) fails.end.push(`${tag} ${name}: ${e.low} ends at ${e.lowB}, bar at ${e.navTop}${e.nav ? '' : ' (no bar)'}`); }
    // the map's readiness header leaves at least two rows of the map on the screen (no scrolling)
    await p.evaluate(id => openRoad(id), ids.five[0]); await p.waitForTimeout(500);
    const M = await p.evaluate(() => { window.scrollTo(0, 0); const sv = document.querySelector('#rdMap svg'), r = sv.getBoundingClientRect(), k = r.width / 390, nav = document.getElementById('bNav').getBoundingClientRect();
      const bottom = nav.height && nav.top < innerHeight ? nav.top : innerHeight; return { row2: Math.round(r.top + (228 + 12) * k), bottom: Math.round(bottom), meter: !!document.querySelector('#rdHdr .rmbar'), go: !!document.querySelector('#rdHdr .rmgo') }; });
    if (!M.meter || !M.go || (h <= 548 && mode === 'safari' && M.row2 > M.bottom)) fails.map.push(`${tag}: the 2nd row ends at ${M.row2}, the screen at ${M.bottom}${M.meter ? '' : ' (no meter)'}${M.go ? '' : ' (no today button)'}`);
    if (w === 375 && h === 548 && mode === 'safari') await shot(p, `map_${w}x${h}_safari`);
    await p.evaluate(() => { document.body.classList.remove('kidside'); go('kids'); });
  }
  await p.evaluate(SETUP, [null]);
  console.log('2. the screens, 7 sizes × (Safari, from the home screen)');
  ok(!fails.kids.length, 'ילדים: every kid\'s card ends above the bottom bar, "+ תרגול" seen with no scrolling' + (fails.kids.length ? '\n    ' + fails.kids.slice(0, 12).join('\n    ') : ''));
  ok(!fails.streak.length, '"ימים ברצף" on one line' + (fails.streak.length ? '\n    ' + fails.streak.slice(0, 8).join('\n    ') : ''));
  ok(!fails.map.length, 'the map: the readiness header (meter + today button) leaves two rows of the map on the screen at 375×548 (Safari)' + (fails.map.length ? '\n    ' + fails.map.slice(0, 8).join('\n    ') : ''));
  ok(!fails.cat.length, 'the catalog: nothing half under a sticky element after 100 / 170 / 300 px' + (fails.cat.length ? '\n    ' + fails.cat.slice(0, 8).join('\n    ') : ''));
  const kidsCard = await p.evaluate(() => getComputedStyle(document.querySelector('.kidhero')).height.endsWith('px') && !/vh/.test(getComputedStyle(document.querySelector('.kidhero')).getPropertyValue('--kidh')));
  ok(kidsCard, 'the kid card\'s height is measured (no vh)');
  await c.close();

  console.log("3. the teachers' app: a group with 6 students, their sets and an assignment");
  const tc = await ctx({ sub: 'layoutT', email: 'layoutt@t.local', email_verified: true, name: 'דנה לוי' }); const T = await tc.newPage(); T.on('pageerror', e => errs.push('teacher: ' + e.message));
  await T.goto(APP + 'teach', { waitUntil: 'load' }); await T.waitForSelector('#fbGo'); await T.click('#fbGo'); await T.waitForSelector('#tsClass'); await T.click('#tsClass');
  await T.fill('#tsName', "ד'2 – אנגלית"); await T.click('#tsGo'); await T.waitForFunction(() => window.SFF_ROLE && window.SFF_KIND === 'class', null, { timeout: 25000 }); await T.waitForTimeout(1200);
  const cid = await T.evaluate(() => window.__sffFamily.famId), uid = await T.evaluate(() => window.SFF_UID);
  const KIDS = [['t1', 'נועה כ.'], ['t2', 'יונתן ב.'], ['t3', 'מאיה ש.'], ['t4', 'איתי ר.'], ['t5', 'אורי ל.'], ['t6', 'תמר ג.']];
  const S = await T.evaluate(async () => { const t = (await (await fetch('/share/en3-0e3c80.txt')).text()).trim().slice(5); const S = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(t), c => c.charCodeAt(0)))); delete S.qa; delete S.v; return S; });
  await put(`families/${cid}/fam/kids`, { list: KIDS.map(([id, name]) => ({ id, name, grade: 2, color: '#2F6BFF' })) });
  for (const [id, name] of KIDS) { await put(`families/${cid}/consents/${id}`, { status: 'digital', letterV: '0.9', at: Date.now(), parentName: 'הורה של ' + name }); await put(`families/${cid}/kidpub/${id}`, { list: [{ id, name, grade: 2 }] }); }
  const due = new Date(Date.now() + 5 * 864e5).toISOString().slice(0, 10);
  await put(`families/${cid}/sets/a1`, { set: { ...S, id: 'a1', grp: 1, to: 'all', toMap: {}, due, examDate: due, ass: { by: uid, at: Date.now() }, created: Date.now(), cloud: true } });
  await T.waitForFunction(() => trStudents().length === 6 && sets.length >= 1, null, { timeout: 45000 }).catch(() => {});
  ok(await T.evaluate(() => trStudents().length === 6 && sets.some(s => s.id === 'a1')), 'the teacher sees 6 students and the assignment');
  const tf = [];
  for (const [w, h] of SIZES) for (const [mode, sa] of MODES) {
    const tag = `${w}×${h} ${mode}`; await T.setViewportSize({ width: w, height: h }); await T.evaluate(SETUP, [sa]); await T.waitForTimeout(200);
    for (const [name, js, view] of [['היום', "go('kids')", 'vKids'], ['תלמידים', "thTab('stud')", 'vTStud'], ['משימות', "thTab('asg')", 'vTAsg'], ['דוחות', "go('stats')", 'vStats']]) {
      await T.evaluate(js); await T.waitForTimeout(450); const e = await T.evaluate(END, view); seen.add('מורים: ' + name);
      if (!e.ok || !e.nav) tf.push(`${tag} ${name}: ${e.low} ends at ${e.lowB}, bar at ${e.navTop}${e.nav ? '' : ' (no bar)'}`); }
  }
  console.log('4. scrolled to the end, the last thing is above the bottom bar: ' + [...seen].join(' · '));
  ok(!fails.end.length && !tf.length, 'every screen, 7 sizes × (Safari, from the home screen)' + (fails.end.length + tf.length ? '\n    ' + [...fails.end, ...tf].slice(0, 20).join('\n    ') : ''));
  ok(!errs.length, 'no page errors ' + JSON.stringify([...new Set(errs)].slice(0, 5)));
  await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
