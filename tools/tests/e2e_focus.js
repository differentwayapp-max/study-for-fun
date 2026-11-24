// תרגול ממוקד – focused practice, on the emulators (functions, firestore, auth):
// 1. a new parent sees the intro (focus right after progress), not "חדש!";
// 2. a parent who already knows the app: "חדש! תרגול ממוקד" once, with the kid's real mistakes – then never again;
// 3. the kid's card at home (an adult's): a set that ended with mistakes → "התרגול הסתיים!" with the right words; the one button
//    makes a focused set at once (no build used), the card goes and the focused set is first; "תוקנו ✓" after a right answer;
// 4. an open set with mistakes → "N מילים לחזק"; "אחר כך" stays after a reload, and comes back with a new mistake;
// 5. the test passed → "המבחן עבר!"; no mistakes → "🌟 הכול יושב!";
// 6. nothing of this on a kid's phone or in a teacher's group; "סט חיזוק" nowhere (Hebrew / English).
// Screenshots (OUT): the opening screen, the focus screen, "חדש!", the card's two states – Hebrew + English, 360.
const { chromium } = require('playwright');
const APP = 'http://localhost:8765/', OUT = process.env.OUT || require('os').tmpdir();
const FS = 'http://127.0.0.1:8080', PROJ = 'study-for-fun-7b03c', DOCS = `${FS}/v1/projects/${PROJ}/databases/(default)/documents`;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) process.exitCode = 1; };
const val = v => v == null ? null : 'integerValue' in v ? +v.integerValue : 'doubleValue' in v ? v.doubleValue : 'stringValue' in v ? v.stringValue : 'booleanValue' in v ? v.booleanValue : 'mapValue' in v ? Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, val(x)])) : 'arrayValue' in v ? (v.arrayValue.values || []).map(val) : null;
const get = async path => { const r = await fetch(`${DOCS}/${path}`, { headers: { Authorization: 'Bearer owner' } }); if (!r.ok) return null; const d = await r.json(); return Object.fromEntries(Object.entries(d.fields || {}).map(([k, x]) => [k, val(x)])); };
const EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' };
(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const errs = [];
  const ctx = async (o = {}) => { const c = await b.newContext({ viewport: { width: o.w || 360, height: o.h || 740 } });
    await c.addInitScript(([E, g, l, onb]) => { window.SFF_REST_EMU = E; if (g) window.SFF_TEST_GOOGLE = g; if (onb) window.SFF_TEST_ONB = 1; localStorage.setItem('sff_lang', l); }, [EMU, o.google || null, o.lang || 'he', o.onb !== false]); return c; };
  const PAR = { sub: 'focusP', email: 'focusp@t.local', email_verified: true, name: 'שירה' };
  const logs = [];
  const parent = async (c, o = {}) => { for (const old of c.pages()) await old.close(); /* a reload: one tab at a time (two tabs share one Firestore cache) */ const p = await c.newPage(); p.on('console', m => logs.push(m.type() + ': ' + m.text().slice(0, 160))); p.on('dialog', d => { logs.push('DIALOG ' + d.message().slice(0, 100)); d.dismiss().catch(() => {}); }); p.on('pageerror', e => errs.push('parent: ' + e.message)); await p.goto(APP, { waitUntil: 'load' }); await p.waitForTimeout(2000);
    if (await p.$('#fbGo')) await p.click('#fbGo'); await p.waitForFunction(() => window.SFF_ROLE, null, { timeout: 25000 }).catch(async e => { console.log('    STUCK url', p.url(), 'logs', JSON.stringify(logs.slice(-12))); const h = await p.content().catch(x => 'content: ' + x.message); console.log('    STUCK html', h.replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/g, '').replace(/\s+/g, ' ').slice(-900)); throw e; }); await p.waitForTimeout(o.wait || 2500); return p; };
  // a game as the app records it: the questions of a chapter, some answered wrong (the option after the right one)
  const play = (p, setId, kid, ch, wrongN, ago = 0) => p.evaluate(([setId, kid, ch, wrongN, ago]) => { const s = getSet(setId), qs = getChapters(s)[ch].qs, bad = qs.slice(0, wrongN);
    history.unshift({ at: Date.now() - ago, kidId: kid, kid: '', subject: s.subject, grade: s.grade, setId: s.id, retry: false, topic: '', ch, right: qs.length - bad.length, n: qs.length, score: 10, mode: 'choice',
      qr: qs.map(q => s.questions.indexOf(q) + '.' + (bad.includes(q) ? '0.' + (q.answer + 1) % q.options.length : '1')), qk: qs.map(q => tkey(q.question) + (bad.includes(q) ? ':' + tkey(q.options[(q.answer + 1) % q.options.length]) : '')),
      topics: { [qs[0].topic]: { r: qs.length - bad.length, n: qs.length } } }); saveHistoryLocal(); pushProgress(kid); return bad.map(q => String(q.options[q.answer]).trim()); }, [setId, kid, ch, wrongN, ago]);
  const card = p => p.evaluate(() => { const c = document.querySelector('#focusCard .fcard'); return c ? { cls: c.className, text: c.innerText.replace(/\s+/g, ' '), words: [...c.querySelectorAll('.fwords span')].map(x => x.textContent) } : null; });

  console.log('1. a new parent: the intro, with "תרגול ממוקד" – not "חדש!"');
  const c1 = await ctx({ google: PAR }); let p = await parent(c1);
  const keys = await p.evaluate(() => IN.list.join());
  ok(keys === 'main,build,testday,progress,focus,share,safe', 'the parent\'s intro: ' + keys);
  await p.evaluate(() => introEnd()); await p.waitForTimeout(4500);
  ok(!(await p.$('#focusNew')), 'a new parent does not get "חדש!" (the intro showed it)');

  console.log('2. a kid with practice sets and games');
  const ids = await p.evaluate(async () => { kids.push({ id: 'k1', name: 'נועה', grade: 3, color: '#FF5C8A' }); saveKids();
    const all = await loadShare('en4'), T = [...new Set(all.qs.map(q => q.topic))];
    const A = applyImport(pickTopics(all, T.slice(0, 2)), kidById('k1')).set; A.subject = 'אנגלית א'; A.src = 'x1';
    const B = applyImport(pickTopics(await loadShare('en4'), T.slice(2, 4)), kidById('k1')).set; B.subject = 'אנגלית ב'; B.src = 'x2'; B.id = 's' + (Date.now() + 7);
    store.save(); return { A: A.id, B: B.id, chA: getChapters(A).length, chB: getChapters(B).length }; });
  // A: every chapter passed, with mistakes → done; B: one chapter, with mistakes → open
  const wrongA = []; for (let ch = 0; ch < ids.chA; ch++) wrongA.push(...await play(p, ids.A, 'k1', ch, ch < 2 ? 2 : 0, 3600e3 - ch * 1000));
  const wrongB = await play(p, ids.B, 'k1', 0, 3, 7200e3);
  await p.waitForTimeout(2500);
  ok(await p.evaluate(id => setDone(getSet(id)) === 'done', ids.A) && await p.evaluate(id => !setDone(getSet(id)), ids.B), `A finished (${ids.chA} chapters, ${wrongA.length} mistakes), B open (3 mistakes)`);

  console.log('3. "חדש!" – a parent who already knows the app');
  p = await parent(c1, { wait: 6500 });
  const nw = await p.evaluate(() => { const e = document.getElementById('focusNew'); return e ? e.innerText.replace(/\s+/g, ' ') : null; });
  ok(nw && /חדש!/.test(nw) && /תרגול ממוקד/.test(nw) && /נועה/.test(nw) && [...wrongA, ...wrongB].filter(w => nw.includes(w)).length >= 2, '"חדש!" with נועה\'s real mistakes: ' + (nw || '').slice(0, 110));
  await p.screenshot({ path: `${OUT}/f_new_he.png` });
  await p.click('#focusNew .linkbtn'); await p.waitForTimeout(1500);
  const u = await get(`users/${await p.evaluate(() => window.SFF_UID)}`);
  ok(u && u.news && u.news.focus > 0 && u.intro > 0, '"הבנתי": kept in users/{uid}.news.focus (the intro field stays)');
  p = await parent(c1, { wait: 6500 }); ok(!(await p.$('#focusNew')), '…and not again after a reload');

  console.log("4. the kid's card at home (the parent's)");
  await p.evaluate(() => { activeKid = 'k1'; go('kid'); }); await p.waitForTimeout(800);
  let C = await card(p);
  ok(C && /f1/.test(C.cls) && /התרגול הסתיים!/.test(C.text) && /סיים\/ה את אנגלית א/.test(C.text) && /% הצלחה/.test(C.text), 'a set that ended: "התרגול הסתיים!" – ' + (C && C.text.slice(0, 90)));
  ok(C && C.words.length > 0 && C.words.every(w => wrongA.includes(w)), 'its words are the kid\'s real mistakes: ' + (C && C.words.join(', ')));
  ok(C && /תרגול ממוקד ·/.test(C.text) && /בחינם, בלחיצה/.test(C.text) && /לראות את ההתקדמות/.test(C.text) && /אחר כך/.test(C.text), 'one button "🎯 תרגול ממוקד · N", the line, "לראות את ההתקדמות", "אחר כך"');
  const small = await p.evaluate(() => [...document.querySelectorAll('#focusCard button')].filter(x => x.getBoundingClientRect().height < 44).map(x => x.textContent.trim()));
  ok(!small.length, 'every button ≥ 44 px ' + small.join(' | '));
  await p.screenshot({ path: `${OUT}/f_card1_he.png`, fullPage: true });
  const before = await p.evaluate(async () => (await getQuota()).used);
  await p.click('#focusCard .focusbtn'); await p.waitForTimeout(1500);
  const after = await p.evaluate(async () => (await getQuota()).used);
  const made = await p.evaluate(id => { const r = sets.find(s => s.reinf === id); return r ? { id: r.id, n: r.questions.length, first: document.querySelector('#subCar .hero h2')?.textContent || '' } : null; }, ids.A);
  ok(made && made.n > 0 && before === after, `the button: a focused set at once (${made && made.n} questions) – the monthly builds unchanged (${before} → ${after})`);
  C = await card(p);
  ok(made && /🎯/.test(made.first) && !(C && /f1/.test(C.cls)), 'the "done" card is gone, and the focused set is first: ' + (made && made.first));
  // the kid answers one of them right in the focused set → "תוקנו: … ✓"
  // (one right, the rest still wrong – the focused set stays open)
  const fixedW = await p.evaluate(rid => { const s = getSet(rid), qs = s.questions, q = qs[0], w = x => (x.answer + 1) % x.options.length;
    history.unshift({ at: Date.now(), kidId: 'k1', kid: '', subject: s.subject, grade: s.grade, setId: s.id, retry: false, topic: '', ch: 0, right: 1, n: qs.length, score: 10, mode: 'choice',
      qr: qs.map((x, i) => i + (i ? '.0.' + w(x) : '.1')), qk: qs.map((x, i) => tkey(x.question) + (i ? ':' + tkey(x.options[w(x)]) : '')), topics: { [q.topic]: { r: 1, n: qs.length } } });
    saveHistoryLocal(); pushProgress('k1'); renderKidSets(); return String(q.options[q.answer]).trim(); }, made.id);
  await p.waitForTimeout(500);
  const fx = await p.evaluate(() => (document.querySelector('#subCar .hero.focusc .ffixed') || {}).textContent || '');
  ok(new RegExp('תוקנו:.*' + fixedW.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '.*✓').test(fx), 'the focused set shows "' + fx + '"');

  console.log('5. an open set with mistakes: "N מילים לחזק"');
  C = await card(p);
  const nB = new Set(wrongB.map(w => w.toLowerCase())).size;   // words, not questions: two questions may share an answer
  ok(C && /f2/.test(C.cls) && new RegExp(nB + ' (מילים|שאלות|מילה|שאלה) לחזק').test(C.text) && /אנגלית ב/.test(C.text) && C.words.every(w => wrongB.includes(w)) && /מוכן מיד · בחינם · מופיע ל/.test(C.text), 'state 2: ' + (C && C.text.slice(0, 90)));
  await p.screenshot({ path: `${OUT}/f_card2_he.png`, fullPage: true });
  await p.click('#focusCard .fcard .linkbtn:last-of-type'); await p.waitForTimeout(1800);
  p = await parent(c1, { wait: 3000 }); await p.evaluate(() => { activeKid = 'k1'; go('kid'); }); await p.waitForTimeout(800);
  ok(!(await card(p)), '"אחר כך": not back after a reload (kept on the set – synced for every adult)');
  const more = await play(p, ids.B, 'k1', 1 < ids.chB ? 1 : 0, 2); await p.waitForTimeout(800); await p.evaluate(() => renderKidSets());
  const nB2 = await p.evaluate(id => focusOf(getSet(id)).items.length, ids.B);
  C = await card(p); ok(C && /f2/.test(C.cls) && nB2 > nB && new RegExp(nB2 + ' (מילים|שאלות) לחזק').test(C.text), 'a new mistake brings it back: ' + (C && C.text.slice(0, 40)));

  console.log('6. the test passed; nothing to strengthen');
  const ids2 = await p.evaluate(async () => { const all = await loadShare('en4'), T = [...new Set(all.qs.map(q => q.topic))];
    const E = applyImport(pickTopics(all, [T[4]]), kidById('k1')).set; E.subject = 'אנגלית מבחן'; E.src = 'x3'; E.id = 's' + (Date.now() + 11); E.examDate = new Date(Date.now() - 2 * 864e5).toISOString().slice(0, 10);
    const D = applyImport(pickTopics(await loadShare('en4'), [T[5]]), kidById('k1')).set; D.subject = 'אנגלית מושלם'; D.src = 'x4'; D.id = 's' + (Date.now() + 13);
    store.save(); return { E: E.id, D: D.id, chD: getChapters(D).length }; });
  await play(p, ids2.E, 'k1', 0, 2, 0); await p.evaluate(() => renderKidSets());
  C = await card(p); ok(C && /f1/.test(C.cls) && /המבחן עבר!/.test(C.text), 'a set whose test passed: "המבחן עבר!" – ' + (C && C.text.slice(0, 60)));
  await p.evaluate(id => focusLater(id, 'fin'), ids2.E);
  for (let ch = 0; ch < ids2.chD; ch++) await play(p, ids2.D, 'k1', ch, 0, -ch - 1);
  await p.evaluate(() => renderKidSets()); C = await card(p);
  ok(C && /f1/.test(C.cls) && /🌟 הכול יושב!/.test(C.text) && /לתרגול חדש מהקטלוג/.test(C.text), 'a set with no mistakes: "🌟 הכול יושב!" + a new set from the catalog');

  console.log('7. the progress screen: the one button');
  await p.evaluate(id => { const s = getSet(id); delete s.focusSeen; store.save(); go('stats'); }, ids.B); await p.waitForTimeout(800);
  const st = await p.evaluate(id => { const c = document.querySelector(`.scard[data-set="${id}"]`); return c ? { btn: [...c.querySelectorAll('.focusbtn')].map(x => x.textContent.trim()), txt: c.innerText } : null; }, ids.B);
  ok(st && st.btn.length === 1 && new RegExp('🎯 תרגול ממוקד · ' + nB2).test(st.btn[0]) && /בחינם, בלחיצה/.test(st.txt), 'one button on the set\'s card: ' + (st && st.btn.join(' | ')));
  ok(await p.evaluate(() => !/סט חיזוק/.test(document.body.innerText)), 'no "סט חיזוק" anywhere (progress screen, home)');

  console.log("8. not on a kid's phone, not in a teacher's group");
  const link = await p.evaluate(() => window.__sffFamily.kidLink('k1'));
  const kc = await ctx({}); const K = await kc.newPage(); K.on('pageerror', e => errs.push('kid: ' + e.message)); await K.goto(link, { waitUntil: 'load' });
  await K.waitForFunction(() => typeof sets !== 'undefined' && sets.filter(s => !s.demo).length > 0, null, { timeout: 25000 }).catch(() => {}); await K.waitForTimeout(6000);
  ok(await K.evaluate(() => !document.querySelector('#focusCard .fcard') && !document.getElementById('focusNew')), "the kid's phone: no card, no \"חדש!\"");
  await kc.close();
  const tc = await ctx({ google: { sub: 'focusT', email: 'focust@t.local', email_verified: true, name: 'מורה' }, onb: false }); const T = await tc.newPage(); T.on('pageerror', e => errs.push('teacher: ' + e.message));
  await T.goto(APP + 'teach', { waitUntil: 'load' }); await T.waitForSelector('#fbGo'); await T.click('#fbGo'); await T.waitForSelector('#tsClass'); await T.click('#tsClass'); await T.fill('#tsName', 'ג'); await T.click('#tsGo');
  await T.waitForFunction(() => window.SFF_KIND === 'class', null, { timeout: 25000 }); await T.waitForTimeout(4000);
  ok(await T.evaluate(() => !document.getElementById('focusNew') && focusCardFor({ id: 'x', name: 'x' }) === ''), "a teacher's group: none of it");
  await tc.close();

  console.log('9. English, and the screenshots');
  const ce = await ctx({ google: PAR, lang: 'en' }); const pe = await parent(ce);
  await pe.evaluate(id => { const s = getSet(id); delete s.finSeen; store.save(); activeKid = 'k1'; go('kid'); }, ids2.E); await pe.waitForTimeout(800);
  await pe.evaluate(id => focusLater(id, 'fin'), ids2.D); await pe.waitForTimeout(600);
  const ce1 = await card(pe); await pe.screenshot({ path: `${OUT}/f_card1_en.png`, fullPage: true });
  const heb = s => (s.match(/[^\s]*[֐-׿][^\s]*/g) || []).filter(w => !/נועה|אנגלית|מבחן|מושלם|^[אב]$/.test(w));   // names and set names are content
  ok(ce1 && /The test is over!|Practice set done!/.test(ce1.text) && !heb(ce1.text).length, 'English card 1: ' + (ce1 && ce1.text.slice(0, 80)) + ' ' + heb(ce1 ? ce1.text : '').join(' '));
  await pe.evaluate(id => { const s = getSet(id); s.finSeen = Date.now(); store.save(); renderKidSets(); }, ids2.E); await pe.waitForTimeout(500);
  const ce2 = await card(pe); await pe.screenshot({ path: `${OUT}/f_card2_en.png`, fullPage: true });
  ok(ce2 && /to strengthen/.test(ce2.text) && !heb(ce2.text).length, 'English card 2: ' + (ce2 && ce2.text.slice(0, 70)) + ' ' + heb(ce2 ? ce2.text : '').join(' '));
  ok(await pe.evaluate(() => { go('stats'); return !/review set|סט חיזוק/i.test(document.body.innerText); }), 'no "review set" in English either');
  // "חדש!" in English (a fresh look: the flag cleared on this phone only)
  await pe.evaluate(() => { document.getElementById('intro')?.remove(); FOCUS_NEW = false; window.SFF_NEWS = {};   /* (a new sign-in: its explanation screens closed first) */ localStorage.removeItem('sff_news_focus'); go('kids'); maybeFocusNew(9); }); await pe.waitForTimeout(1500);
  await pe.screenshot({ path: `${OUT}/f_new_en.png` });
  const ne = await pe.evaluate(() => (document.getElementById('focusNew') || {}).innerText || '');
  ok(/New!/.test(ne) && /Focused practice/.test(ne) && !heb(ne).length, 'English "New!": ' + ne.replace(/\s+/g, ' ').slice(0, 80));
  await ce.close();
  // the intro screens (opening + focus), Hebrew and English
  for (const lang of ['he', 'en']) { const c = await b.newContext({ viewport: { width: 360, height: 740 } }); await c.addInitScript(l => localStorage.setItem('sff_lang', l), lang); const q = await c.newPage();
    await q.goto(APP, { waitUntil: 'load' }); await q.waitForTimeout(1200); await q.evaluate(() => { document.getElementById('fbLogin')?.remove(); openIntro(false); });
    await q.waitForTimeout(400); await q.screenshot({ path: `${OUT}/f_intro_main_${lang}.png` });
    await q.evaluate(() => introGo(IN.list.indexOf('focus'))); await q.waitForTimeout(400); await q.screenshot({ path: `${OUT}/f_intro_focus_${lang}.png` }); await c.close(); }
  ok(!errs.length, 'no page errors ' + errs.slice(0, 3).join(' | '));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
