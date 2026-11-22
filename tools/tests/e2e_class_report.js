// The teacher area, stage 3 – the teacher's screens, on the emulators (functions, firestore, auth):
// 1. a group with 6 approved students, a real catalog set each and games (a strong student, a struggling one, one stuck on a
//    chapter, one who didn't play this week, one who never played, an average one);
// 2. the teacher's home: who needs attention (stuck / didn't practise this week / doing well);
// 3. the report by topic: the numbers (mastery = the last 10 questions of a topic), weakest topic first, the period filter,
//    a topic's page (who needs help, the hardest questions and the wrong answer chosen most), the students × topics map;
// 4. a student's card: topics, last mistakes, a private note (saved for the teacher only);
// 5. live: a student's new game shows up without a reload; the printable report has no names;
// 6. the mastery maths on fixed data. Screenshots (OUT): Hebrew + English, 360, 320 and a wide screen;
// 7. performance: 40 students × 300 games – how much is read at opening and how long until the report shows (360, CPU ×4).
const { chromium } = require('playwright');
const APP = 'http://localhost:8765/', OUT = process.env.OUT || require('os').tmpdir();
const FS = 'http://127.0.0.1:8080', PROJ = 'study-for-fun-7b03c', DOCS = `${FS}/v1/projects/${PROJ}/databases/(default)/documents`;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) process.exitCode = 1; };
const enc = v => v === null || v === undefined ? { nullValue: null } : typeof v === 'boolean' ? { booleanValue: v } : typeof v === 'number' ? (Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v })
  : typeof v === 'string' ? { stringValue: v } : Array.isArray(v) ? { arrayValue: { values: v.map(enc) } } : { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, enc(x)])) } };
const put = (path, obj) => fetch(`${DOCS}/${path}`, { method: 'PATCH', headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, enc(v)])) }) }).then(r => r.status);
const val = v => v == null ? null : 'integerValue' in v ? +v.integerValue : 'doubleValue' in v ? v.doubleValue : 'stringValue' in v ? v.stringValue : 'booleanValue' in v ? v.booleanValue : 'mapValue' in v ? Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, val(x)])) : 'arrayValue' in v ? (v.arrayValue.values || []).map(val) : null;
const get = async path => { const r = await fetch(`${DOCS}/${path}`, { headers: { Authorization: 'Bearer owner' } }); if (!r.ok) return null; const d = await r.json(); return Object.fromEntries(Object.entries(d.fields || {}).map(([k, x]) => [k, val(x)])); };
const EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' };
const KIDS = [['k1', 'נועה כ.', .95], ['k2', 'יונתן ב.', .3], ['k3', 'מאיה ש.', .6], ['k4', 'איתי ר.', .75], ['k5', 'אורי ל.', null], ['k6', 'תמר ג.', .7]];
(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const errs = [];
  const ctx = async (o = {}) => { const c = await b.newContext({ viewport: { width: o.w || 390, height: o.h || 844 } });
    await c.addInitScript(([E, g, l]) => { window.SFF_REST_EMU = E; if (g) window.SFF_TEST_GOOGLE = g; localStorage.setItem('sff_lang', l); }, [EMU, o.google || null, o.lang || 'he']); return c; };
  const GOOGLE = { sub: 'teacherR', email: 'teacherr@t.local', email_verified: true, name: 'דנה לוי' };

  console.log('1. a group with students, sets and games');
  const tc = await ctx({ google: GOOGLE }); const T = await tc.newPage(); T.on('pageerror', e => errs.push('teacher: ' + e.message));
  await T.goto(APP, { waitUntil: 'load' });
  await T.waitForSelector('#fbTeach'); await T.click('#fbTeach'); await T.waitForSelector('#tsClass'); await T.click('#tsClass');
  await T.fill('#tsName', "ד'2 – אנגלית"); await T.click('#tsGo'); await T.waitForFunction(() => window.SFF_ROLE && window.SFF_KIND === 'class', null, { timeout: 25000 }); await T.waitForTimeout(1200);
  const cid = await T.evaluate(() => window.__sffFamily.famId);
  // the set and the games are made in the page (the app's own key function), written as the server would (emulator owner)
  const seed = await T.evaluate(async (KIDS) => {
    const t = (await (await fetch('/share/en3-0e3c80.txt')).text()).trim().slice(5);
    const S = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(t), c => c.charCodeAt(0))));
    const now = Date.now(), day = 864e5; let seedN = 7; const rnd = () => (seedN = (seedN * 16807) % 2147483647) / 2147483647;
    const out = { sets: {}, prog: {} };
    KIDS.forEach(([id, name, p], ki) => {
      const set = { ...S, id: 's_' + id, kidId: id, name, created: now - 40 * day, cloud: true }; delete set.qa; delete set.v; out.sets[id] = set;
      if (p == null) return;
      const H = []; const game = (at, ch, prob) => { const qs = set.questions.map((q, i) => [q, i]).filter(([q]) => q.ch === ch).slice(0, 10); const by = {}; let right = 0;
        const qr = [], qk = []; qs.forEach(([q, i]) => { const okk = rnd() < prob; by[q.topic] = by[q.topic] || { r: 0, n: 0 }; by[q.topic].n++; if (okk) { by[q.topic].r++; right++; }
          const pick = okk ? null : (q.answer + 1) % q.options.length; qr.push(i + '.' + (okk ? 1 : 0) + (pick == null ? '' : '.' + pick)); qk.push(tkey(q.question) + (pick == null ? '' : ':' + tkey(q.options[pick]))); });
        H.unshift({ at, kidId: id, kid: name, subject: set.subject, grade: set.grade, setId: set.id, retry: false, topic: set.chapters[ch] && set.chapters[ch].title || '', ch, right, n: qs.length, score: right * 10, mode: 'choice', qr, qk, topics: by }); };
      const base = id === 'k4' ? now - 14 * day : now - 6 * day;
      const chs = [...new Set(set.questions.map(q => q.ch))].filter(c => set.questions.filter(q => q.ch === c).length >= 6), pickCh = [0, 3, 6, 9, 12, 15].map(i => chs[i % chs.length]);
      for (let g = 0; g < 12; g++) game(base + g * 0.45 * day + ki * 3600e3, pickCh[g % 6], p);
      if (id === "k3") { game(now - 3 * 3600e3, pickCh[1], 0.1); game(now - 2 * 3600e3, pickCh[1], 0.1); }      // stuck: twice in a row on the same chapter, under 50%
      H.sort((a, b) => b.at - a.at); out.prog[id] = { history: H, profile: { nick: name } };
    });
    return out;
  }, KIDS);
  await put(`families/${cid}/fam/kids`, { list: KIDS.map(([id, name]) => ({ id, name, grade: 2, color: '#2F6BFF' })) });
  for (const [id, name] of KIDS) {
    await put(`families/${cid}/consents/${id}`, { status: 'digital', letterV: '0.9', at: Date.now(), parentName: 'הורה של ' + name });
    await put(`families/${cid}/kidpub/${id}`, { list: [{ id, name, grade: 2 }] });
    await put(`families/${cid}/sets/s_${id}`, { set: seed.sets[id] });
    if (seed.prog[id]) await put(`families/${cid}/progress/${id}`, seed.prog[id]);
  }
  const nGames = Object.values(seed.prog).reduce((a, p) => a + p.history.length, 0);
  await T.waitForFunction(n => trStudents().length === 6 && sets.length === 6 && history.length >= n, nGames, { timeout: 45000 }).catch(() => {});
  ok(await T.evaluate(n => trStudents().length === 6 && sets.length === 6 && history.length >= n, nGames), 'the teacher sees 6 students, their sets and their games (live, no reload)');

  console.log("2. the teacher's home: who needs attention");
  await T.evaluate(() => go('kids')); await T.waitForTimeout(500);
  const att = await T.evaluate(() => [...document.querySelectorAll('.tatt')].map(x => x.textContent.replace(/\s+/g, ' ').trim()));
  ok(att.length === 3 && /כדאי לחזק · 1/.test(att[0]) && /מאיה/.test(att[0]), 'stuck: מאיה (twice in a row under 50% on the same chapter) – ' + att[0]);
  ok(/לא תרגלו השבוע · 2/.test(att[1]) && /איתי/.test(att[1]) && /אורי/.test(att[1]), "didn't practise this week: איתי (9+ days ago) and אורי (never)");
  ok(/סיימו את התרגיל בהצלחה · 0/.test(att[2]), 'finished the set successfully: nobody yet (נועה plays well but hasn\'t passed every chapter) – ' + att[2]);
  // נועה passes every chapter of her set (in the page only – taken out again after)
  const att2 = await T.evaluate(() => { const s = getSet('s_k1'), now = Date.now(), add = getChapters(s).map((c, i) => ({ at: now - 600e3 + i, kidId: 'k1', kid: '', subject: s.subject, grade: s.grade, setId: s.id, retry: false, topic: c.title || '', ch: i, right: 9, n: 10, score: 90, mode: 'choice', fake: 1 }));
    history.unshift(...add); go('kids'); const r = [...document.querySelectorAll('.tatt')].map(x => x.textContent.replace(/\s+/g, ' ').trim());
    history = history.filter(h => !h.fake); return r; });
  ok(/סיימו את התרגיל בהצלחה · 1/.test(att2[2]) && /נועה/.test(att2[2]) && !/יונתן/.test(att2[2]), 'finished successfully: נועה once every chapter is passed – ' + att2[2]);
  await T.evaluate(() => go('kids')); await T.waitForTimeout(300);
  await T.screenshot({ path: `${OUT}/r_home_he.png`, fullPage: true });

  console.log('3. the report by topic');
  await T.evaluate(() => go('stats')); await T.waitForSelector('#tReport .trrow', { timeout: 10000 });
  const R = await T.evaluate(() => { const r = classReport(history, trStudents(), { days: 30 }); return { topics: r.topics.map(t => [t.name, t.avg, t.g, t.o, t.r, t.n]), avg: r.avg, played: r.played, weak: r.weak, multi: r.multi }; });
  ok(R.played === 5 && R.topics.length >= 4, `30 days: 5 of 6 practised, ${R.topics.length} topics`);
  ok(R.topics.every((t, i) => i === 0 || R.topics[i - 1][1] <= t[1]), 'weakest topic first: ' + R.topics.map(t => t[0] + ' ' + t[1] + '%').join(' · '));
  ok(R.topics.every(t => t[2] + t[3] + t[4] + t[5] === 6), 'every topic counts all 6 students (masters + on the way + struggling + not practised)');
  const rows = await T.evaluate(() => [...document.querySelectorAll('#tReport .trrow')].map(x => x.querySelector('.tn').textContent + ' ' + x.querySelector('.ta b').textContent));
  ok(rows.length === R.topics.length && rows[0] === R.topics[0][0] + ' ' + R.topics[0][1] + '%', 'the screen shows the same list: ' + rows[0]);
  const sum = await T.evaluate(() => [...document.querySelectorAll('.trsum b')].map(x => x.textContent));
  ok(sum[0] === R.avg + '%' && sum[1] === '5 / 6', 'summary cards: average ' + sum[0] + ', practised ' + sum[1] + ', weak topics ' + sum[2] + ', struggling in more than one ' + sum[3]);
  const R7 = await T.evaluate(() => classReport(history, trStudents(), { days: 7 }).played);
  ok(R7 === 4, 'the last 7 days: 4 practised (איתי played 9+ days ago)');
  await T.screenshot({ path: `${OUT}/r_topics_he.png`, fullPage: true });
  // a topic's page
  const weakName = R.topics[0][0];
  await T.click('#tReport .trrow'); await T.waitForSelector('.trtopic', { timeout: 5000 });
  const tp = await T.evaluate(() => ({ h: document.querySelector('.trtopic h2').textContent, help: [...document.querySelectorAll('.trkid b:first-of-type')].map(x => x.textContent), q: [...document.querySelectorAll('.trq')].map(x => x.textContent.replace(/\s+/g, ' ').trim()) }));
  ok(tp.h === weakName && tp.help.includes('יונתן ב.'), `the topic "${weakName}": who needs help – ${tp.help.join(', ')}`);
  ok(tp.q.length > 0 && tp.q.some(x => /הטעות הנפוצה/.test(x)), 'the hardest questions, with the wrong answer chosen most: ' + (tp.q[0] || '').slice(0, 90));
  await T.screenshot({ path: `${OUT}/r_topic_he.png`, fullPage: true });
  // the map
  await T.evaluate(() => { TR.topic = null; TR.view = 'map'; renderTeacherStats(); });
  const map = await T.evaluate(() => ({ rows: document.querySelectorAll('.trmap tbody tr').length, empty: [...document.querySelectorAll('.trmap tbody tr')].find(r => /אורי/.test(r.textContent))?.querySelectorAll('.m-n').length, cols: document.querySelectorAll('.trmap thead th').length }));
  ok(map.rows === 6 && map.empty === map.cols - 2, `the map: 6 students × ${map.cols - 2} topics, אורי (never played) all empty`);
  await T.screenshot({ path: `${OUT}/r_map_he.png`, fullPage: true });

  console.log("4. a student's card and a private note");
  await T.evaluate(() => tStudent('k2')); await T.waitForSelector('#tDlg .tbars', { timeout: 5000 });
  const card = await T.evaluate(() => ({ bars: document.querySelectorAll('#tDlg .tbars>div').length, mist: document.querySelectorAll('#tDlg .trq').length }));
  ok(card.bars >= 3 && card.mist === 5, `יונתן's card: ${card.bars} topics, the last 5 mistakes`);
  await T.fill('#tNote', 'צריך לשבת איתו על חרוזים'); await T.click('#tDlg button:has-text("שמירת ההערה")'); await T.waitForTimeout(1200);
  ok((await get(`families/${cid}/notes/k2`) || {}).text === 'צריך לשבת איתו על חרוזים', 'the note is saved (notes/k2)');
  await T.screenshot({ path: `${OUT}/r_card_he.png`, fullPage: true });
  await T.evaluate(() => tClose()); await T.evaluate(() => tStudent('k2')); await T.waitForFunction(() => document.getElementById('tNote')?.value === 'צריך לשבת איתו על חרוזים', null, { timeout: 5000 }).catch(() => {});
  ok(await T.evaluate(() => document.getElementById('tNote').value) === 'צריך לשבת איתו על חרוזים', 'opened again: the note is there');
  await T.evaluate(() => tClose());

  console.log('5. live, and the printed report');
  await T.evaluate(() => { TR.view = 'topics'; go('stats'); });
  const g5 = await T.evaluate(() => { const s = sets.find(x => x.kidId === 'k5'), qs = s.questions.filter(q => q.ch === 0).slice(0, 10), by = {};
    qs.forEach(q => { by[q.topic] = by[q.topic] || { r: 0, n: 0 }; by[q.topic].n++; by[q.topic].r++; });
    return { at: Date.now(), kidId: 'k5', kid: 'אורי ל.', subject: s.subject, grade: s.grade, setId: s.id, retry: false, topic: '', ch: 0, right: qs.length, n: qs.length, score: 100, mode: 'choice', qr: qs.map(q => s.questions.indexOf(q) + '.1'), qk: qs.map(q => tkey(q.question)), topics: by }; });
  await put(`families/${cid}/progress/k5`, { history: [g5], profile: { nick: 'אורי ל.' } });
  await T.waitForFunction(() => document.querySelectorAll('.trsum b')[1]?.textContent === '6 / 6', null, { timeout: 10000 }).catch(() => {});
  ok(await T.evaluate(() => document.querySelectorAll('.trsum b')[1].textContent) === '6 / 6', "אורי's first game shows up at once (6 / 6 practised), no reload");
  await T.evaluate(() => { window.print = () => { window.__printed = 1; }; trPrint(); }); await T.waitForTimeout(300);
  const pr = await T.evaluate(() => ({ p: window.__printed, t: document.getElementById('trPrint').textContent }));
  ok(pr.p === 1 && /דוח הפנמה לפי נושא/.test(pr.t) && !KIDS.some(([, n]) => pr.t.includes(n)), 'the printed report: topics and numbers, no student name');

  console.log('6. the maths on fixed data');
  const M = await T.evaluate(() => {
    const A = (r, n, at) => ({ at, topics: { A: { r, n } } });
    const m1 = kidMastery([A(10, 10, 3), A(0, 10, 2)]).A.pct, m2 = kidMastery([A(5, 5, 3), A(0, 10, 2)]).A.pct, m3 = kidMastery([A(3, 4, 3)]).A.pct;
    const s = [{ id: 'a' }, { id: 'b' }], H = [{ kidId: 'a', at: Date.now(), subject: 'x', right: 2, n: 10, setId: 's', ch: 1, topics: { T: { r: 2, n: 10 } } }, { kidId: 'b', at: Date.now(), subject: 'x', right: 9, n: 10, setId: 's', ch: 1, topics: { T: { r: 9, n: 10 } } }];
    const r = classReport(H, s, { days: 7 }), t = r.topics[0];
    return { m1, m2, m3, t: [t.avg, t.g, t.o, t.r, t.n], lv: [mastLvl(80), mastLvl(79), mastLvl(60), mastLvl(59), mastLvl(null)].join('') };
  });
  ok(M.m1 === 100 && M.m2 === 50 && M.m3 === 75, 'mastery = the last 10 questions: 100% (older 10 wrong ignored), 50% (5 right + 5 of the older wrong), 75% (3/4)');
  console.log('    ', JSON.stringify(M)); ok(M.t.join() === '55,1,0,1,0' && M.lv === 'goorn', 'class average 55% (20% and 90%), levels 80→g 79→o 60→o 59→r none→n');

  console.log('7. screenshots: English, 320 and a wide screen');
  for (const [w, lang, tag] of [[360, 'en', 'en360'], [320, 'he', 'he320'], [1200, 'he', 'wide']]) {
    const c = await ctx({ google: GOOGLE, w, h: w > 900 ? 900 : 760, lang }); const p = await c.newPage(); p.on('pageerror', e => errs.push(tag + ': ' + e.message));
    await p.goto(APP, { waitUntil: 'load' }); await p.waitForSelector('#fbTeach', { timeout: 20000 }); await p.click('#fbTeach'); await p.waitForFunction(() => window.SFF_KIND === 'class' && typeof trStudents === 'function' && trStudents().length === 6 && history.length > 40, null, { timeout: 30000 }).catch(async () => console.log('    (not ready)', await p.evaluate(() => [window.SFF_KIND, window.SFF_ROLE, typeof trStudents === 'function' && trStudents().length, history.length, sets.length])));
    await p.waitForTimeout(800); await p.evaluate(() => go('kids')); await p.waitForTimeout(500); await p.screenshot({ path: `${OUT}/r_home_${tag}.png`, fullPage: true });
    await p.evaluate(() => go('stats')); await p.waitForTimeout(600); await p.screenshot({ path: `${OUT}/r_topics_${tag}.png`, fullPage: true });
    await p.evaluate(() => { TR.view = 'map'; renderTeacherStats(); }); await p.waitForTimeout(300); await p.screenshot({ path: `${OUT}/r_map_${tag}.png`, fullPage: true });
    const over = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    ok(over <= 1, `${tag}: no sideways page scroll (the map scrolls inside its box)`);
    await p.evaluate(() => { TR.view = 'topics'; TR.topic = classReport(history, trStudents(), { days: 30 }).topics[0].name; renderTeacherStats(); }); await p.waitForTimeout(300); await p.screenshot({ path: `${OUT}/r_topic_${tag}.png`, fullPage: true });
    await p.evaluate(() => { TR.topic = null; tStudent('k2'); }); await p.waitForTimeout(600); await p.screenshot({ path: `${OUT}/r_card_${tag}.png` });
    if (lang === 'en') { const heb = await p.evaluate(() => { const t = [...document.querySelectorAll('#tReport, #tDlg')].map(e => { const c = e.cloneNode(true); c.querySelectorAll('[translate="no"],textarea').forEach(x => x.remove()); c.querySelectorAll('*').forEach(x => x.insertAdjacentText('afterend', '\n')); return c.textContent; }).join('\n'); return (t.match(/[^\n]*[֐-׿][^\n]*/g) || []).filter(l => !/נועה|יונתן|מאיה|איתי|אורי|תמר|ד'2|הורה של/.test(l)); });
      ok(heb.length === 0, 'English: no Hebrew left in the report and the card' + (heb.length ? ' – ' + heb.slice(0, 5).join(' | ') : '')); }
    await c.close();
  }
  console.log('8. performance: 40 students × 300 games (the largest history), 360 wide, CPU slowed ×4');
  {
    const PG = { sub: 'teacherPerf', email: 'teacherperf@t.local', email_verified: true, name: 'מורה' };
    const c0 = await ctx({ google: PG }); const p0 = await c0.newPage(); p0.on('pageerror', e => errs.push('perf: ' + e.message));
    await p0.goto(APP, { waitUntil: 'load' }); await p0.waitForSelector('#fbTeach'); await p0.click('#fbTeach'); await p0.waitForSelector('#tsClass'); await p0.click('#tsClass');
    await p0.fill('#tsName', 'גדולה'); await p0.click('#tsGo'); await p0.waitForFunction(() => window.SFF_KIND === 'class', null, { timeout: 25000 }); await p0.waitForTimeout(800);
    const big = await p0.evaluate(() => window.__sffFamily.famId); await c0.close();
    // a game like the app writes it: 10 questions, their keys, 1–2 topics
    const TOP = ['חיבור', 'חיסור', 'כפל', 'חילוק', 'שברים', 'מדידות', 'גאומטריה', 'בעיות מילוליות'], now = Date.now();
    const rk = n => Math.random().toString(36).slice(2, 2 + n);
    const game = (kid, i) => { const t1 = TOP[i % 8], t2 = TOP[(i + 3) % 8], qr = [], qk = []; let right = 0; const by = { [t1]: { r: 0, n: 0 }, [t2]: { r: 0, n: 0 } };
      for (let q = 0; q < 10; q++) { const okk = Math.random() < .7, t = q < 6 ? t1 : t2; by[t].n++; if (okk) { by[t].r++; right++; } qr.push((i * 3 + q) % 90 + '.' + (okk ? 1 : 0) + (okk ? '' : '.' + q % 4)); qk.push(rk(8) + (okk ? '' : ':' + rk(6))); }
      return { at: now - i * 3 * 3600e3, kidId: kid, kid: 'תלמיד ' + kid, subject: 'מתמטיקה', grade: 3, setId: 's_' + kid, retry: false, topic: 'פרק ' + (i % 12), ch: i % 12, right, n: 10, score: right * 10, mode: 'choice', qr, qk, topics: by }; };
    const N = 40, G = 300, ids = Array.from({ length: N }, (_, i) => 'p' + i);
    await put(`families/${big}/fam/kids`, { list: ids.map((id, i) => ({ id, name: 'תלמיד ' + (i + 1), grade: 3, color: '#2F6BFF' })) });
    let bytes = 0;
    for (const id of ids) { await put(`families/${big}/consents/${id}`, { status: 'digital', letterV: '0.9', at: now });
      const prog = { history: Array.from({ length: G }, (_, i) => game(id, i)), profile: { nick: id } }; bytes += JSON.stringify(prog).length;
      const st = await put(`families/${big}/progress/${id}`, prog); if (st !== 200) console.log('    progress write', id, st); }
    console.log(`    seeded ${N} students × ${G} games – ${(bytes / 1024 / 1024).toFixed(1)} MB of progress (JSON)`);
    const c = await ctx({ google: PG, w: 360, h: 720 }); const p = await c.newPage(); p.on('pageerror', e => errs.push('perf: ' + e.message));
    const cdp = await c.newCDPSession(p); await cdp.send('Network.enable'); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    const url = {}; let fsBytes = 0, allBytes = 0;
    cdp.on('Network.requestWillBeSent', e => { url[e.requestId] = e.request.url; });
    cdp.on('Network.dataReceived', e => { allBytes += e.dataLength; if (/:8080\//.test(url[e.requestId] || '')) fsBytes += e.dataLength; });
    await p.goto(APP, { waitUntil: 'load' }); await p.waitForSelector('#fbTeach', { timeout: 30000 });
    const t0 = Date.now(); await p.click('#fbTeach');
    await p.waitForFunction(() => window.SFF_KIND === 'class', null, { timeout: 60000 }); const tIn = Date.now() - t0;
    await p.waitForFunction(n => typeof history !== 'undefined' && history.length >= n, N * G, { timeout: 180000 }).catch(() => {});
    const tData = Date.now() - t0;
    const tR = await p.evaluate(() => { const a = performance.now(); go('stats'); return performance.now() - a; });
    await p.waitForSelector('#tReport .trrow', { timeout: 60000 }).catch(() => {}); const tShown = Date.now() - t0;
    const info = await p.evaluate(() => ({ games: history.length, rows: document.querySelectorAll('#tReport .trrow').length, played: document.querySelectorAll('.trsum b')[1]?.textContent,
      ls: (() => { let n = 0; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); n += (localStorage.getItem(k) || '').length; } return n; })() }));
    const tHome = await p.evaluate(() => { const a = performance.now(); go('kids'); return performance.now() - a; });
    const tMap = await p.evaluate(() => { const a = performance.now(); go('stats'); TR.view = 'map'; renderTeacherStats(); const d = performance.now() - a; TR.view = 'topics'; return d; });
    global.PERF = { fsMB: fsBytes / 1048576, allMB: allBytes / 1048576, tIn, tData, tShown, tR, tHome, tMap, ...info };
    console.log(`    read at opening: Firestore ${(fsBytes / 1048576).toFixed(2)} MB (all requests ${(allBytes / 1048576).toFixed(2)} MB, the emulator sends it uncompressed)`);
    console.log(`    signed in → the group: ${(tIn / 1000).toFixed(1)} s; → all ${info.games} games in: ${(tData / 1000).toFixed(1)} s; → the report on screen: ${(tShown / 1000).toFixed(1)} s`);
    console.log(`    drawing (CPU ×4): the report ${tR.toFixed(0)} ms, the map ${tMap.toFixed(0)} ms, the teacher's home (attention) ${tHome.toFixed(0)} ms; ${info.rows} topics, ${info.played} practised; localStorage ${(info.ls / 1048576).toFixed(2)} MB`);
    ok(info.games >= N * G && info.rows === 8, `the report with 40 × 300 games: ${info.rows} topics`);
    await c.close();
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
