// A group's students are kept no longer than the privacy policy says, on the emulators (functions, firestore, auth):
// 0. opening a group: its school year is chosen in the form (this one / the next – in July–August the next by default), the
//    form says when its students will be deleted, and once the group is open a message gives the date;
// 1. the end of the school year (the daily cleaning, run with made-up dates – testClean), by each group's own school year:
//    5 August: a group of the year ending on this 1.9 gets its yearEnd – the teacher's home says so (print a report / delete
//    now); a group of next year does not (one opened in July before the year existed, too); 2 September: the students and
//    all about them are deleted (the list, the consents, the progress, the phones and their sign-in accounts, the notes, the
//    lessons, the requests, a per-student set) – the group and its shared assignment stay, with nobody in it, and the group
//    moves on to the next school year; running it again changes nothing;
// 2. "🗑 מחיקת הקבוצה" in the group's settings (the teachers' app): a report to print first, then "for good?" – nothing of the
//    group is left, the student's phone's sign-in account is deleted, the teacher is in another group;
// 3. the student's phone, opened again: "the link is not active", and nothing of the group is left on it.
const { chromium } = require('playwright');
const APP = 'http://localhost:8765/', PROJ = 'study-for-fun-7b03c', OUT = process.env.OUT || require('os').tmpdir();
const FS = 'http://127.0.0.1:8080', DOCS = `${FS}/v1/projects/${PROJ}/databases/(default)/documents`, AUTH = 'http://127.0.0.1:9099', FN = `http://127.0.0.1:5001/${PROJ}/europe-west1`;
const EMU = { fs: FS, auth: AUTH };
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) process.exitCode = 1; };
const enc = v => v === null || v === undefined ? { nullValue: null } : typeof v === 'boolean' ? { booleanValue: v } : typeof v === 'number' ? (Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v })
  : typeof v === 'string' ? { stringValue: v } : Array.isArray(v) ? { arrayValue: { values: v.map(enc) } } : { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, enc(x)])) } };
const val = v => v == null ? null : 'integerValue' in v ? +v.integerValue : 'doubleValue' in v ? v.doubleValue : 'stringValue' in v ? v.stringValue : 'booleanValue' in v ? v.booleanValue : 'mapValue' in v ? Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, val(x)])) : 'arrayValue' in v ? (v.arrayValue.values || []).map(val) : null;
const OWNER = { Authorization: 'Bearer owner', 'Content-Type': 'application/json' };
const put = (path, obj, mask) => fetch(`${DOCS}/${path}${mask ? '?' + mask.map(m => 'updateMask.fieldPaths=' + m).join('&') : ''}`, { method: 'PATCH', headers: OWNER, body: JSON.stringify({ fields: Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, enc(v)])) }) });
const get = async path => { const r = await fetch(`${DOCS}/${path}`, { headers: OWNER }); if (!r.ok) return null; const d = await r.json(); return Object.fromEntries(Object.entries(d.fields || {}).map(([k, x]) => [k, val(x)])); };
const exists = async path => (await fetch(`${DOCS}/${path}`, { headers: OWNER })).ok;
const authUsers = async ids => ((await (await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/projects/${PROJ}/accounts:lookup`, { method: 'POST', headers: OWNER, body: JSON.stringify({ localId: ids }) })).json()).users || []).map(u => u.localId);
// the school years a group may choose now (as the app and the server work them out: from 1.9 the next year; in July–August the next by default)
const schoolYearsNow = (t = Date.now()) => { const d = new Date(t), y = d.getFullYear(), md = (d.getMonth() + 1) * 100 + d.getDate(), cur = md >= 901 ? y + 1 : y; return { choices: [cur, cur + 1], def: md >= 701 && md < 901 ? cur + 1 : cur }; };
const clean = async now => (await (await fetch(`${FN}/testClean`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: { now, only: ['schoolYear'] } }) })).json()).result;

(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const errs = [];
  const ctx = async g => { const c = await b.newContext({ viewport: { width: 390, height: 844 } }); await c.addInitScript(([E, g]) => { window.SFF_TEACH_LINKS = true; window.SFF_REST_EMU = E; if (g) window.SFF_TEST_GOOGLE = g; localStorage.setItem('sff_lang', 'he'); }, [EMU, g]); return c; };
  console.log('0. opening a group: its school year');
  { const c0 = await b.newContext({ viewport: { width: 390, height: 844 } });
    await c0.addInitScript(([E]) => { window.SFF_TEACH_LINKS = true; window.SFF_REST_EMU = E; window.SFF_TEST_GOOGLE = { sub: 'yearN', email: 'yearn@t.local', email_verified: true, name: 'רונית' }; window.SFF_TEST_YEARNOTE = 1; localStorage.setItem('sff_lang', 'he'); }, [EMU]);
    const N = await c0.newPage(); N.on('pageerror', e => errs.push('new: ' + e.message));
    await N.goto(APP + 'teach', { waitUntil: 'load' }); await N.waitForSelector('#fbGo'); await N.click('#fbGo'); await N.waitForSelector('#tsClass'); await N.click('#tsClass'); await N.waitForSelector('#tsYear');
    const f = await N.evaluate(() => ({ opts: [...document.querySelectorAll('#tsYear option')].map(o => [o.value, o.textContent, o.selected]), note: document.getElementById('tsYearNote').textContent }));
    const exp = schoolYearsNow();
    ok(f.opts.length === 2 && f.opts.map(o => +o[0]).join() === exp.choices.join() && +f.opts.find(o => o[2])[0] === exp.def && /תשפ/.test(f.opts[0][1]) && f.opts[0][1].includes(`\u2066${exp.choices[0] - 1}–${exp.choices[0]}\u2069`) && f.note.includes(`1.9.${exp.def}`),
      `the form: the school year – ${f.opts.map(o => o[1] + (o[2] ? ' ✓' : '')).join(' / ')}; "${f.note}"`);
    await N.selectOption('#tsYear', String(exp.choices[1])); await N.waitForTimeout(100);
    ok((await N.textContent('#tsYearNote')).includes(`1.9.${exp.choices[1]}`), 'choosing next year: the date in the line changes with it');
    await N.screenshot({ path: `${OUT}/year_form.png` });
    await N.fill('#tsName', "ה'1"); await N.click('#tsGo'); await N.waitForFunction(() => window.SFF_KIND === 'class', null, { timeout: 25000 });
    await N.waitForSelector('#sureDlg:not(.hidden)', { timeout: 10000 }).catch(() => {});
    const pop = await N.evaluate(() => { const d = document.getElementById('sureDlg'); return d && !d.classList.contains('hidden') ? { t: d.innerText, no: !document.getElementById('sureNo').classList.contains('hidden') } : null; });
    ok(pop && /קבוצה זו נועדה לתרגול עבור שנת הלימודים תשפ/.test(pop.t) && /בהתאם למדיניות הפרטיות שלנו, כל נתוני התלמידים בקבוצה זו יימחקו/.test(pop.t) && pop.t.includes(`1.9.${exp.choices[1]}`) && /להדפיס דוח התקדמות בכל עת/.test(pop.t) && !pop.no,
      'the group opened: "this group is for the school year…", "…the students\' data will be deleted on 1.9…", "you can print a progress report at any time" (one button)');
    await N.screenshot({ path: `${OUT}/year_popup.png` });
    const gN = await N.evaluate(() => window.__sffFamily.famId);
    ok((await get(`families/${gN}`)).yearEnds === exp.choices[1], 'the group keeps its school year (yearEnds ' + exp.choices[1] + ')');
    await N.click('#sureYes'); await N.evaluate(() => go('family')); await N.waitForTimeout(500);
    ok(/שנת הלימודים/.test(await N.textContent('#famBody')) && (await N.textContent('#famBody')).includes(`1.9.${exp.choices[1]}`) && await N.evaluate(() => !!document.getElementById('grpPrint')), "the group's settings: its school year, the date, and \"print a progress report\" (any time)");
    await N.evaluate(() => { window.print = () => { window.__printed = true; }; document.getElementById('grpPrint').click(); }); await N.waitForTimeout(300);
    ok(await N.evaluate(() => window.__printed === true && !!document.getElementById('trPrint')), 'the print button prints the report (with no students yet too)');
    await N.screenshot({ path: `${OUT}/year_settings.png` });
    await c0.close(); }

  const tc = await ctx({ sub: 'yearT', email: 'yeart@t.local', email_verified: true, name: 'דנה לוי' }); const T = await tc.newPage(); T.on('pageerror', e => errs.push('teacher: ' + e.message));
  await T.goto(APP + 'teach', { waitUntil: 'load' }); await T.waitForSelector('#fbGo'); await T.click('#fbGo'); await T.waitForSelector('#tsClass'); await T.click('#tsClass');
  await T.fill('#tsName', "ג'1 – אנגלית"); await T.click('#tsGo'); await T.waitForFunction(() => window.SFF_KIND === 'class', null, { timeout: 25000 }); await T.waitForTimeout(1200);
  const g1 = await T.evaluate(() => window.__sffFamily.famId), uid = await T.evaluate(() => window.SFF_UID);
  const g2 = await T.evaluate(() => window.__sffNewClass({ teach: 'class', name: "ג'2 – חדשה", grade: 2, subject: 'אנגלית' }));
  const g3 = await T.evaluate(() => window.__sffNewClass({ teach: 'class', name: "ג'3 – למחיקה", grade: 2, subject: 'אנגלית' }));
  // a student in a group: the list, the student's own record, the consent, the link; its phone opens the link
  const student = async (cid, id, name) => { const tok = 'tok' + id;
    await put(`families/${cid}/fam/kids`, { list: [{ id, name, grade: 2, color: '#2F6BFF' }] });
    await put(`families/${cid}/kidpub/${id}`, { list: [{ id, name, grade: 2 }] });
    await put(`families/${cid}/consents/${id}`, { status: 'digital', parentName: 'הורה של ' + name, letterV: '0.91', at: Date.now() });
    await put(`families/${cid}`, { kidTokens: { [id]: tok } }, ['kidTokens']);
    const kc = await ctx(), K = await kc.newPage(); K.on('pageerror', e => errs.push('kid: ' + e.message));
    await K.goto(`${APP}?f=${cid}&t=${tok}&k=${id}#kid-${id}`, { waitUntil: 'load' }); await K.waitForFunction(n => typeof kids !== 'undefined' && kids.some(k => k.name === n), name, { timeout: 30000 }).catch(() => {});
    const phone = (await (await fetch(`${DOCS}/families/${cid}/devices?pageSize=10`, { headers: OWNER })).json()).documents?.map(d => d.name.split('/').pop())[0];
    return { K, phone }; };

  console.log('1. the end of the school year');
  const s1 = await student(g1, 'st1', 'יונתן');
  ok(!!s1.phone && (await authUsers([s1.phone])).length === 1, "the student's phone joined the group (its sign-in account and device)");
  await put(`families/${g1}`, { yearEnds: 2026 }, ['yearEnds']);                                                       // a group of the year 2025–2026
  await put(`families/${g2}`, { createdAt: Date.parse('2026-07-15T08:00:00Z') }, ['createdAt', 'yearEnds']);          // from before school years: opened in July → next year
  await put(`families/${g1}/progress/st1`, { history: [] }); await put(`families/${g1}/notes/st1`, { text: 'מתקשה בקריאה', at: 1 });
  await put(`families/${g1}/sched/st1`, { day: 2, time: '16:00' }); await put(`families/${g1}/joinReqs/ReqYearAbcdefghij012`, { status: 'pending', parentName: 'x', kidName: 'y', at: Date.now() });
  await put(`families/${g1}/sets/sOld`, { set: { id: 'sOld', kidId: 'st1', name: 'יונתן', questions: [] } });
  await put(`families/${g1}/sets/a1`, { set: { id: 'a1', grp: 1, to: ['st1'], toMap: { st1: true }, ass: { by: uid, at: 1 }, questions: [] } });
  let r = await clean(Date.parse('2026-07-20T09:00:00Z'));
  ok(!(await get(`families/${g1}`)).yearEnd && r.schoolYear === 0, '20 July: nothing yet');
  r = await clean(Date.parse('2026-08-05T09:00:00Z'));
  const G1a = await get(`families/${g1}`), G2a = await get(`families/${g2}`);
  ok(G1a.yearEnd === Date.parse('2026-08-31T21:00:00Z') && !G2a.yearEnd && r.schoolYear === 0 && (await get(`families/${g1}/fam/kids`)).list.length === 1,
    '5 August: the group of 2025–2026 gets yearEnd = 1.9 (Israel midnight); the one opened in July (next year) not; nobody deleted yet');
  // the teacher's home (the notice is shown until yearEnd – moved to next week here, since today is past 1.9.2026)
  await put(`families/${g1}`, { yearEnd: Date.now() + 5 * 864e5 }, ['yearEnd']);
  await T.evaluate(id => window.__sffFamily.switchTo(id), g1); await T.waitForFunction(() => window.SFF_KIND === 'class', null, { timeout: 25000 }); await T.waitForTimeout(2500);
  await T.evaluate(() => { document.getElementById('intro')?.remove(); go('kids'); }); await T.waitForTimeout(800);
  const note = await T.evaluate(() => { const n = document.getElementById('yearEnd'); return n ? { t: n.innerText, btns: [...n.querySelectorAll('button')].map(x => x.textContent) } : null; });
  ok(note && /יימחקו התלמידים וההתקדמות שלהם/.test(note.t) && note.btns.some(x => /הדפסת דוח/.test(x)) && note.btns.some(x => /למחוק עכשיו/.test(x)), "the teacher's home: \"on 1.9 the students and their progress will be deleted\" + print / delete now");
  await T.screenshot({ path: `${OUT}/year_end_note.png` });
  r = await clean(Date.parse('2026-09-02T06:00:00Z'));
  const left = []; for (const p of [`families/${g1}/kidpub/st1`, `families/${g1}/consents/st1`, `families/${g1}/progress/st1`, `families/${g1}/devices/${s1.phone}`, `families/${g1}/notes/st1`, `families/${g1}/sched/st1`, `families/${g1}/joinReqs/ReqYearAbcdefghij012`, `families/${g1}/sets/sOld`]) if (await exists(p)) left.push(p.split('/').slice(2).join('/'));
  const G1b = await get(`families/${g1}`), A1 = (await get(`families/${g1}/sets/a1`)).set;
  ok(r.schoolYear === 1 && !left.length && (await get(`families/${g1}/fam/kids`)).list.length === 0 && Object.keys(G1b.kidTokens || {}).length === 0, '2 September: the students and all about them are deleted ' + (left.length ? 'LEFT: ' + left.join(', ') : ''));
  ok(!(await authUsers([s1.phone])).length, "…and the student's phone's sign-in account");
  ok(G1b.kind === 'class' && G1b.yearWiped === 2026 && G1b.yearEnds === 2027 && !G1b.yearEnd && A1 && A1.to.length === 0 && Object.keys(A1.toMap || {}).length === 0, 'the group and its assignment stay, with nobody in it – the group is now of 2026–2027');
  ok(!(await get(`families/${g2}`)).yearWiped && (await clean(Date.parse('2026-09-03T06:00:00Z'))).schoolYear === 0, 'the group opened in July (next year) is untouched; running it again changes nothing');

  console.log('2. "🗑 מחיקת הקבוצה" in the group\'s settings');
  const s3 = await student(g3, 'st3', 'מאיה');
  await put(`families/${g3}/progress/st3`, { history: [] });
  await T.evaluate(id => window.__sffFamily.switchTo(id), g3); await T.waitForFunction(() => window.SFF_KIND === 'class', null, { timeout: 25000 }); await T.waitForTimeout(2500);
  await T.evaluate(() => { document.getElementById('intro')?.remove(); go('family'); }); await T.waitForTimeout(800);
  ok(await T.evaluate(() => !!document.getElementById('grpDel') && document.getElementById('grpDel').offsetParent !== null), 'the group\'s settings have "🗑 מחיקת הקבוצה"');
  await T.click('#grpDel'); await T.waitForTimeout(300);
  const dlg = await T.evaluate(() => document.getElementById('tDlg').innerText);
  ok(/הדפסת דוח לפני/.test(dlg) && /אי אפשר לשחזר/.test(dlg), 'first: print a report, it cannot be restored');
  await T.screenshot({ path: `${OUT}/year_delete_dialog.png` });
  await T.click('#grpDelGo'); await T.waitForSelector('#sureYes', { timeout: 5000 }); await T.click('#sureYes');
  await T.waitForFunction(g => window.__sffFamily && window.__sffFamily.famId && window.__sffFamily.famId !== g, g3, { timeout: 30000 }).catch(() => {});
  await T.waitForTimeout(1500);
  const after = await T.evaluate(() => ({ fam: window.__sffFamily.famId, groups: (window.SFF_FAMS || []).map(f => f.id) }));
  ok(!(await exists(`families/${g3}`)) && !(await exists(`families/${g3}/fam/kids`)) && !(await exists(`families/${g3}/progress/st3`)) && !(await exists(`families/${g3}/consents/st3`)), 'nothing of the group is left');
  ok(!(await authUsers([s3.phone])).length, "the student's phone's sign-in account is deleted");
  ok(after.fam !== g3 && !after.groups.includes(g3) && !((await get(`teachers/${uid}`)).classes || []).includes(g3), 'the teacher is in another group; it is gone from ☰ and from the count');

  console.log("3. the student's phone, opened again");
  await s3.K.reload({ waitUntil: 'load' }); await s3.K.waitForTimeout(8000);
  const kp = await s3.K.evaluate(() => { const e = document.getElementById('cloudErr'); const o = {}; Object.keys(localStorage).filter(k => k.startsWith('sff_')).forEach(k => o[k] = localStorage.getItem(k));
    return { msg: e && !e.classList.contains('hidden') ? e.innerText : (document.getElementById('fbLogin') ? 'login' : ''), ls: o }; });
  ok(/לא פעיל|login/.test(kp.msg) && !/מאיה|"st3"|tokst3/.test(JSON.stringify(kp.ls)), 'the link is not active, and nothing of the group is left on the phone: ' + Object.keys(kp.ls).join(', '));
  await s3.K.screenshot({ path: `${OUT}/year_kid_gone.png` });
  ok(!errs.filter(e => !/permission|insufficient/i.test(e)).length, 'no page errors ' + JSON.stringify(errs.slice(0, 3)));
  await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
