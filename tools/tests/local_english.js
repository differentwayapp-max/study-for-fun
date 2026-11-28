// The English version of a set's content (tools/sets_en/<id>.json → q.en, set.en): in English mode every game screen of a
// translated set shows no Hebrew; in Hebrew mode nothing of the English shows; the Hebrew stays the key (history, topics);
// a question edited since it was translated shows in Hebrew; a Hebrew set's labels are never half-translated.
// App served (python3 tools/serve.py 8765). IDS=math3,sci4 (translated sets) HEB=heb3
const { chromium } = require('playwright');
const IDS = (process.env.IDS || 'math3,sci4').split(','), HEB = process.env.HEB || 'heb3';
const HE = /[֐-׿]/;
async function page(b, lang) {
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(l => { try { localStorage.setItem('sff_lang', l); } catch (e) {} }, lang);
  await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(1800);
  await p.evaluate(() => document.getElementById('fbLogin')?.remove());
  return { p, errs };
}
// every visible text node with Hebrew (with the screen it was on); the kid's name is set in English, so any Hebrew is a miss
const walk = async (p, id, all) => p.evaluate(async ([id, all]) => {
  const HE = /[֐-׿]/, wait = ms => new Promise(r => setTimeout(r, ms)), out = {};
  const grab = tag => { for (const e of document.querySelectorAll('body *')) { if (e.offsetParent === null && e.tagName !== 'SUMMARY') continue;
    for (const n of e.childNodes) if (n.nodeType === 3 && HE.test(n.textContent)) { const t = n.textContent.trim().slice(0, 90); (out[t] = out[t] || new Set()).add(tag); } } };
  const s = await loadShare(id); s.id = 't_' + id; s.questions = s.qs; s.kidId = 'k1'; sets.length = 0; sets.push(s);
  if (!kids.find(k => k.id === 'k1')) kids.push({ id: 'k1', name: 'Adi', grade: s.grade, color: '#FF5C8A' });
  curSet = s; renderReview(s); show('vReview'); document.querySelectorAll('#vReview details').forEach(d => d.open = true); await wait(300); grab('review');
  openRoad(s.id); await wait(500); grab('road');
  const C = getChapters(s), chs = all ? C.map((_, i) => i) : [0, Math.floor(C.length / 2), C.length - 1];
  for (const m of ['choice', 'match', 'memory', 'riddle', 'spell']) for (const ch of chs) {
    try { startGame(s, null, m, ch); } catch (e) { continue; } await wait(120); grab('game:' + m + ':' + ch);
    if (m === 'choice') { choicePick(0); await wait(80); grab('sheet:' + ch); }
    try { G.res = G.qs.map(q => ({ q, ok: false, pick: (q.answer + 1) % 4 })); endGame(); await wait(150); grab('end:' + m + ':' + ch); } catch (e) {}
  }
  try { statsKid('k1'); await wait(300); grab('stats'); } catch (e) {}
  return Object.entries(out).map(([t, v]) => `${t}  <${[...v].slice(0, 3).join(',')}>`);
}, [id, all]);
(async () => {
  const b = await chromium.launch(), fails = [];
  // 1) English mode: a translated set shows no Hebrew anywhere
  { const { p, errs } = await page(b, 'en');
    for (const id of IDS) { const left = await walk(p, id, !!process.env.ALL);
      if (left.length) fails.push(`${id}: Hebrew in English mode (${left.length}):\n   ` + left.slice(0, 25).join('\n   ')); }
    // the Hebrew stays the key: a game played in English is recorded with the Hebrew question and topics
    const key = await p.evaluate(async id => { const s = await loadShare(id); s.id = 't_k'; s.questions = s.qs; s.kidId = 'k1'; sets.length = 0; sets.push(s);
      startGame(s, null, 'choice', 0); const q = G.qs[0]; choicePick(q.answer); G.res = [G.res[0]]; endGame();
      const h = history[0], q0 = s.questions[+String(h.qr[0]).split('.')[0]];
      const stale = { ...s.questions[1], question: s.questions[1].question + ' ' }; const shown = qv(stale).question === stale.question;
      return { topics: Object.keys(h.topics), heQ: q0.question, qk: h.qk[0], tkey: tkey(q0.question), shown, en: qv(q0).question }; }, IDS[0]);
    if (!key.topics.every(t => HE.test(t))) fails.push('history topics are not the Hebrew keys: ' + key.topics);
    if (key.qk !== key.tkey) fails.push('history qk is not the Hebrew question key');
    if (HE.test(key.en)) fails.push('qv() did not give the English question');
    if (!key.shown) fails.push('a question edited after translation still shows the old English');
    // a Hebrew set: chapter titles stay whole Hebrew (no "Open, אמצע וסוף")
    const heb = await p.evaluate(async id => { const s = await loadShare(id); s.id = 't_h'; s.questions = s.qs; s.kidId = 'k1'; sets.length = 0; sets.push(s);
      curSet = s; renderReview(s); show('vReview'); await new Promise(r => setTimeout(r, 300));
      return [...document.querySelectorAll('#vReview *')].map(e => [...e.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('')).filter(t => /[֐-׿]/.test(t) && /\b(Open|Start|End)\b/.test(t)); }, HEB);
    if (heb.length) fails.push(`${HEB}: half-translated Hebrew labels: ` + heb.slice(0, 5).join(' | '));
    if (errs.length) fails.push('page errors (en): ' + errs.slice(0, 3).join(' | '));
  }
  // 2) Hebrew mode: no English of the translation shows (the Hebrew question, options and labels)
  { const { p, errs } = await page(b, 'he');
    const r = await p.evaluate(async id => { const s = await loadShare(id); s.id = 't_he'; s.questions = s.qs; s.kidId = 'k1'; sets.length = 0; sets.push(s);
      const q = s.questions.find(x => x.en && x.en.q !== x.question); startGame(s, [q], 'choice');
      const box = document.querySelector('#gPlay .qbox').textContent, ch = getChapters(s)[0].title;
      return { box, he: q.question, ch, heCh: s.chapters[0].title }; }, IDS[0]);
    if (r.box.trim() !== r.he.trim()) fails.push('Hebrew mode shows the English question');
    if (r.ch !== r.heCh) fails.push('Hebrew mode shows an English chapter title');
    if (errs.length) fails.push('page errors (he): ' + errs.slice(0, 3).join(' | '));
  }
  await b.close();
  console.log(fails.length ? 'FAIL\n' + fails.join('\n') : `ok: ${IDS.join(', ')} in English, Hebrew keys kept, ${HEB} labels whole`);
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('FAIL', e); process.exit(1); });
