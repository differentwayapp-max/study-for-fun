// The teacher area, stage 2 – parents' consent, on the emulators (functions, firestore, auth):
// 1. the teacher's group link → a parent with no account reads the letter, fills the form and signs → a waiting request
//    (CONSENT_VERSION kept) → the teacher approves → the parent's status page shows the kid's link → the kid joins and plays →
//    the progress is saved; the consent keeps the letter's version and the signature;
// 2. a second parent of the same kid is attached to the student; a rejected request shows its reason and no link;
// 3. a closed, replaced or expired link is refused; an empty signature is refused; at most 5 requests an hour from a phone;
// 4. students come only from parents' signed requests – the teacher has no way to add one;
// 5. withdrawing (the parent, the teacher): the link stops, the progress goes;
// 6. AI building in a group counts on the teacher's own quota. Screenshots (OUT): Hebrew + English, 360 and 320.
const { chromium } = require('playwright');
const APP = 'http://localhost:8765/', OUT = process.env.OUT || require('os').tmpdir();
const FS = 'http://127.0.0.1:8080', PROJ = 'study-for-fun-7b03c', DOCS = `${FS}/v1/projects/${PROJ}/databases/(default)/documents`;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) process.exitCode = 1; };
const val = v => v == null ? null : 'integerValue' in v ? +v.integerValue : 'doubleValue' in v ? v.doubleValue : 'stringValue' in v ? v.stringValue : 'mapValue' in v ? Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, val(x)])) : 'arrayValue' in v ? (v.arrayValue.values || []).map(val) : 'booleanValue' in v ? v.booleanValue : null;
const doc = async path => { const r = await fetch(`${DOCS}/${path}`, { headers: { Authorization: 'Bearer owner' } }); if (!r.ok) return null; const d = await r.json(); return Object.fromEntries(Object.entries(d.fields || {}).map(([k, x]) => [k, val(x)])); };
const list = async path => ((await (await fetch(`${DOCS}/${path}?pageSize=100`, { headers: { Authorization: 'Bearer owner' } })).json()).documents || []).map(d => ({ id: d.name.split('/').pop(), ...Object.fromEntries(Object.entries(d.fields || {}).map(([k, x]) => [k, val(x)])) }));
const patch = (path, obj, mask) => fetch(`${DOCS}/${path}${mask ? '?' + mask.map(m => 'updateMask.fieldPaths=' + m).join('&') : ''}`, { method: 'PATCH', headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' },
  body: JSON.stringify({ fields: Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, typeof v === 'number' ? { integerValue: String(v) } : typeof v === 'boolean' ? { booleanValue: v } : { stringValue: String(v) }])) }) });
const EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' };
(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const errs = [];
  const ctx = async (o = {}) => { const c = await b.newContext({ viewport: { width: o.w || 390, height: o.h || 844 } });
    await c.addInitScript(([E, g, l]) => { window.SFF_REST_EMU = E; if (g) window.SFF_TEST_GOOGLE = g; localStorage.setItem('sff_lang', l); }, [EMU, o.google || null, o.lang || 'he']); return c; };
  const page = async (c, url, tag) => { const p = await c.newPage(); p.on('pageerror', e => errs.push((tag || '') + ': ' + e.message)); await p.goto(url, { waitUntil: 'load' }); return p; };
  // draw on the signature canvas like a finger; checked (the canvas has ink) and tried again if the page was still moving
  const inkOf = p => p.evaluate(() => { const c = document.getElementById('jSig'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return n; });
  const sign = async (p, n = 1) => { for (let tries = 0; tries < 4; tries++) {
    await p.locator('#jSig').scrollIntoViewIfNeeded(); await p.waitForTimeout(400 + tries * 400); const bx = await p.locator('#jSig').boundingBox(); const W = Math.min(22, (bx.width - 60) / 12);
    for (let k = 0; k < n; k++) { await p.mouse.move(bx.x + 30, bx.y + 30 + k * 10); await p.mouse.down(); for (let i = 1; i <= 12; i++) await p.mouse.move(bx.x + 30 + i * W, bx.y + 30 + k * 10 + (i % 2 ? 25 : -5)); await p.mouse.up(); }
    if (await inkOf(p) > 200) return; } };
  const join = async (url, parent, kid, o = {}) => { const c = await ctx(o), p = await page(c, url, 'parent');
    await p.waitForSelector('#jSend', { timeout: 20000 }); await p.fill('#jParent', parent); await p.fill('#jKid', kid); await p.fill('#jContact', o.contact || '');
    await p.check('#jAgree'); if (!o.noSig) await sign(p); if (o.shot) await p.screenshot({ path: `${OUT}/${o.shot}`, fullPage: false });
    await p.click('#jSend'); await p.waitForSelector(o.noSig ? '#jErr:not(:empty)' : '#jBody .jstat', { timeout: 20000 }).catch(() => {}); await p.waitForTimeout(300); return { c, p }; };

  console.log('1. a teacher, a group, its link');
  const tc = await ctx({ google: { sub: 'teacherC', email: 'teacherc@t.local', email_verified: true, name: 'דנה לוי' } });
  const T = await page(tc, APP, 'teacher');
  await T.waitForSelector('#fbTeach'); await T.click('#fbTeach'); await T.waitForSelector('#tsClass'); await T.click('#tsClass');
  await T.fill('#tsName', "ד'2 – אנגלית"); await T.click('#tsGo'); await T.waitForFunction(() => window.SFF_ROLE && window.SFF_KIND === 'class', null, { timeout: 25000 }); await T.waitForTimeout(1500);
  const cid = await T.evaluate(() => window.__sffFamily.famId);
  await T.evaluate(() => inviteStudents()); await T.waitForSelector('#tDlg input.tinyurl', { timeout: 15000 }); await T.waitForTimeout(800);
  const link = await T.inputValue('#tDlg input.tinyurl');
  ok(new RegExp(`\\?join=${cid}\\.[a-f0-9]{16}$`).test(link), 'the group link: ' + link.replace(APP, '/'));
  ok(await T.evaluate(() => !!document.querySelector('#tQR svg')), 'a QR code for the link');
  await T.screenshot({ path: `${OUT}/c_invite_he.png` }); await T.evaluate(() => tClose());

  console.log('2. a parent with no account signs');
  const P1 = await join(link, 'רונית כהן', 'נועה כ.', { contact: 'ronit@example.com', shot: 'c_join_he.png' });
  const reqUrl = P1.p.url();
  ok(/\?req=[A-Za-z0-9]{20}\.[A-Za-z0-9]{20}\.[a-f0-9]{36}$/.test(reqUrl) && /ממתין לאישור המורה/.test(await P1.p.textContent('#jBody')), 'sent: the personal status link, "waiting for the teacher"');
  await P1.p.screenshot({ path: `${OUT}/c_status_wait_he.png` });
  const [rid, key] = reqUrl.split('?req=')[1].split('.').slice(1);
  const R = await doc(`families/${cid}/joinReqs/${rid}`);
  ok(R && R.status === 'pending' && R.letterV === '0.91' && /^data:image\/png;base64,/.test(R.sig) && R.sig.length < 28000 && !('statusKey' in R) && R.keyHash && R.keyHash !== key, `the request: waiting, letter 0.9, a small PNG signature (${R && R.sig.length} chars), only the key's hash kept`);
  ok(await P1.p.evaluate(() => !window.SFF_ROLE && !document.getElementById('fbLogin')), 'the parent never sees the sign-in or the app');

  console.log('3. the teacher approves');
  await T.waitForSelector('.treq', { timeout: 15000 }); await T.waitForTimeout(500);
  ok(/בקשות ממתינות \(1\)/.test(await T.textContent('#kidCar')) && await T.evaluate(() => !!document.querySelector('.treq img.tsig[src^="data:image/png"]')), 'the teacher: "waiting requests (1)" with the signature');
  await T.screenshot({ path: `${OUT}/c_requests_he.png` });
  await T.click('.treq .btn:not(.ghost)'); await T.waitForTimeout(2500);
  const kidsL = (await doc(`families/${cid}/fam/kids`)).list, kid = kidsL[0], C1 = await doc(`families/${cid}/consents/${kid.id}`), F = await doc(`families/${cid}`);
  ok(kidsL.length === 1 && kid.name === 'נועה כ.' && C1.status === 'digital' && C1.letterV === '0.91' && /^data:image/.test(C1.sig) && C1.reqId === rid && C1.approvedBy && C1.parentName === 'רונית כהן', 'a student with a digital consent (letter 0.9, the signature, who approved)');
  ok(!!(F.kidTokens || {})[kid.id] && !!(await doc(`families/${cid}/kidpub/${kid.id}`)), "the kid's link and the kid's own record were made");
  ok(!(await doc(`families/${cid}/joinReqs/${rid}`)).sig, 'the request no longer keeps the signature (the consent does)');
  await T.waitForTimeout(800); await T.screenshot({ path: `${OUT}/c_students_he.png` });
  await P1.p.reload({ waitUntil: 'load' }); await P1.p.waitForSelector('#jKidLink', { timeout: 20000 });
  const kidLink = await P1.p.inputValue('#jKidLink');
  ok(kidLink.includes(`?f=${cid}&t=${F.kidTokens[kid.id]}&k=${kid.id}`), 'the parent sees "approved" and the kid\'s link');
  await P1.p.screenshot({ path: `${OUT}/c_status_ok_he.png` });

  console.log('4. the kid joins and plays');
  await T.evaluate(async id => { applyImport(await loadShare('en4'), kidById(id)); }, kid.id); await T.waitForTimeout(2500);
  const kc = await ctx(), K = await page(kc, kidLink, 'kid'); await K.waitForTimeout(7000);
  const ks = await K.evaluate(() => ({ kids: kids.map(k => k.name).join(), sets: sets.filter(s => !s.demo).length, err: document.getElementById('cloudErr') && !document.getElementById('cloudErr').classList.contains('hidden') }));
  ok(ks.kids === 'נועה כ.' && ks.sets === 1 && !ks.err, 'the kid\'s phone: only Noa, her practice set, no error ' + JSON.stringify(ks));
  await K.evaluate(() => { const s = sets.find(x => !x.demo); startGame(s, null, 'choice', 0); G.qs.forEach(q => G.res.push({ q, ok: true })); endGame(); }); await K.waitForTimeout(3000);
  const pr = await doc(`families/${cid}/progress/${kid.id}`);
  ok(pr && pr.history && pr.history.length === 1, 'the progress was saved in the group');

  console.log('5. a second parent, a rejected request');
  const P2 = await join(link, 'אבי כהן', 'נועה כ.');
  await T.waitForTimeout(1500); const rid2 = (await list(`families/${cid}/joinReqs`)).find(x => x.parentName === 'אבי כהן').id;
  await T.evaluate(id => tAttach(id), rid2); await T.waitForTimeout(400); await T.click('#tDlg .chipsel button'); await T.waitForTimeout(2500);
  const C2 = await doc(`families/${cid}/consents/${kid.id}`);
  ok((C2.parents || []).length === 2 && (await doc(`families/${cid}/fam/kids`)).list.length === 1, 'a second parent is attached to the same student (no second student)');
  const P3 = await join(link, 'זר', 'מישהו ז.');
  await T.waitForTimeout(1500); const rid3 = (await list(`families/${cid}/joinReqs`)).find(x => x.parentName === 'זר').id;
  T.once('dialog', d => d.accept('הילד לא בכיתה שלי')); await T.evaluate(id => tReject(id), rid3); await T.waitForTimeout(2500);
  await P3.p.reload({ waitUntil: 'load' }); await P3.p.waitForTimeout(3000);
  const t3 = await P3.p.textContent('#jBody');
  ok(/המורה לא אישר\/ה/.test(t3) && /הילד לא בכיתה שלי/.test(t3) && !(await P3.p.$('#jKidLink')), 'rejected: the parent sees the reason, no link');
  ok(!(await doc(`families/${cid}/joinReqs/${rid3}`)).sig, "a rejected request's signature is deleted");
  await P3.p.screenshot({ path: `${OUT}/c_status_no_he.png` });

  console.log('6. links, signatures, limits');
  const req = (p, d) => p.evaluate(async d => { try { await window.__sffJoin.request(d); return 'ok'; } catch (e) { return e.code; } }, d);
  const code = link.split('.').pop(), base = { classId: cid, code, parentName: 'הורה', kidName: 'ילד א.', agree: true, letterV: '0.9' };
  const blank = await P2.p.evaluate(() => { const c = document.createElement('canvas'); c.width = 360; c.height = 120; return c.toDataURL('image/png'); });
  const inked = await P2.p.evaluate(() => { const c = document.createElement('canvas'); c.width = 360; c.height = 120; const g = c.getContext('2d'); g.lineWidth = 3; g.beginPath(); g.moveTo(10, 60); for (let i = 0; i < 30; i++) g.lineTo(10 + i * 11, i % 2 ? 20 : 100); g.stroke(); return c.toDataURL('image/png'); });
  ok(await req(P2.p, { ...base, sig: blank }) === 'no_signature', 'an empty signature is refused (by the server too)');
  const P4 = await join(link, 'בלי חתימה', 'ילד ב.', { noSig: true });
  ok(/לחתום/.test(await P4.p.textContent('#jErr')), 'the page asks for a signature before sending');
  // this phone already sent one request (step 5): 4 more pass, the 6th in the hour is refused
  const lim = []; for (let i = 0; i < 5; i++) lim.push(await req(P2.p, { ...base, sig: inked }));
  ok(lim.join() === 'ok,ok,ok,ok,too_many', 'at most 5 requests an hour from one phone: ' + lim.join());
  await T.evaluate(() => inviteStudents('close')); await T.waitForTimeout(1500);
  const P5 = await page(await ctx(), link, 'parent5'); await P5.waitForTimeout(4000);
  ok(/סגר\/ה את הקישור/.test(await P5.textContent('#jBody')), 'a closed link: refused, with a clear message');
  await T.evaluate(() => inviteStudents('open')); await T.waitForTimeout(1200); await T.evaluate(() => inviteStudents('new')); await T.waitForTimeout(1500);
  const link2 = await T.inputValue('#tDlg input.tinyurl'); await T.evaluate(() => tClose());
  ok(link2 !== link && await req(P2.p, { ...base, sig: inked }) === 'link_bad', 'a new link: the old one is refused');
  await patch(`families/${cid}/joinLink/main`, { exp: Date.now() - 1000 }, ['exp']);
  ok(await req(P2.p, { ...base, code: link2.split('.').pop(), sig: inked }) === 'link_expired', 'an expired link is refused');
  await T.evaluate(() => inviteStudents('open')); await T.waitForSelector('#tDlg input.tinyurl'); await T.waitForTimeout(1200);
  const link3 = await T.inputValue('#tDlg input.tinyurl'); await T.evaluate(() => tClose());
  ok(link3 !== link2, 'opening an expired link gives a new one');

  console.log('7. students come only from parents');
  await T.evaluate(() => { tClose(); go('kids'); }); await T.waitForTimeout(800);
  ok(await T.evaluate(() => !document.querySelector('[onclick*="tAddStudent"],[onclick*="tPaper"]') && typeof tAddStudent === 'undefined'), 'the teacher has no "add a student" (only parents add their children)');
  await T.evaluate(() => inviteStudents()); await T.waitForSelector('#tDlg input.tinyurl'); await T.waitForTimeout(600);
  ok(await T.evaluate(() => !/הדפסה/.test(document.getElementById('tDlg').innerText)), 'no paper form to print'); await T.evaluate(() => tClose());
  ok(String(await (await fetch('http://127.0.0.1:5001/study-for-fun-7b03c/europe-west1/addStudent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"data":{}}' })).status) === '404', 'the server has no way to add a student by hand');
  // one of the waiting requests (step 6) is approved – a second student, for the teacher's "take out" below
  const w = (await list(`families/${cid}/joinReqs`)).find(x => x.status === 'pending');
  await T.evaluate(id => tApprove(id), w.id); await T.waitForTimeout(2500);
  const yo = (await doc(`families/${cid}/fam/kids`)).list.find(k => k.name === w.kidName);
  ok(!!yo, 'a waiting request approved: a second student');
  await T.waitForTimeout(800); await T.screenshot({ path: `${OUT}/c_students2_he.png`, fullPage: true });

  console.log('8. withdrawing');
  await P1.p.reload({ waitUntil: 'load' }); await P1.p.waitForSelector('#jKidLink', { timeout: 20000 });
  P1.p.once('dialog', d => d.accept()); await P1.p.click('#jBody .linkbtn.danger'); await P1.p.waitForTimeout(400);
  await P1.p.click('#sureYes').catch(() => {}); await P1.p.waitForTimeout(3000);
  ok((await doc(`families/${cid}/consents/${kid.id}`)).status === 'revoked' && !(await doc(`families/${cid}/progress/${kid.id}`)) && !((await doc(`families/${cid}`)).kidTokens || {})[kid.id]
    && !(await list(`families/${cid}/devices`)).some(d => d.kid === kid.id), "the parent withdraws: consent revoked; the kid's progress, link and phone are gone");
  ok(/ההסכמה בוטלה/.test(await P1.p.textContent('#jBody')), 'the status page says so');
  await K.reload({ waitUntil: 'load' }); await K.waitForTimeout(7000);
  ok(await K.evaluate(() => !sets.filter(s => !s.demo).length), "the kid's phone no longer reaches the group");
  await T.evaluate(async id => { await DB.doc('notes/' + id).set({ text: 'note', at: Date.now() }); await DB.collection('sets').doc('sx_' + id).set({ set: { id: 'sx_' + id, kidId: id, name: 'x', questions: [] } }); }, yo.id); await T.waitForTimeout(800);
  ok(!!(await doc(`families/${cid}/notes/${yo.id}`)) && !!(await doc(`families/${cid}/sets/sx_${yo.id}`)), "(a private note and a practice set for the student)");
  await T.evaluate(id => tStudent(id), yo.id); await T.waitForTimeout(300);
  await T.click('#tDlg .btn.danger'); await T.waitForTimeout(300); await T.click('#sureYes').catch(() => {}); await T.waitForTimeout(2500);
  ok((await doc(`families/${cid}/consents/${yo.id}`)).status === 'revoked' && !(await doc(`families/${cid}/fam/kids`)).list.some(k => k.id === yo.id), 'the teacher takes a student out: the same');
  ok(!(await doc(`families/${cid}/notes/${yo.id}`)) && !(await doc(`families/${cid}/sets/sx_${yo.id}`)), "…and the teacher's note and the student's practice sets are deleted too");

  console.log('9. AI building in a group: the teacher\'s own quota (stage 4)');
  const ai = await T.evaluate(async () => { try { const r = await window.__sffAI.start('אנגלית'); return [r.kind, r.free, r.teacher]; } catch (e) { return [e.code]; } });
  ok(ai[0] === 'free' && ai[1] === 5 && ai[2] === true, 'a build in a group: one of the teacher\'s 5 builds a month: ' + ai.join());

  console.log('10. English, and small phones');
  for (const [w, h] of [[360, 720], [320, 560]]) for (const lang of ['he', 'en']) {
    const tag = `${lang}${w}`;
    const c = await ctx({ w, h, lang }), p = await page(c, link3, 'shot');
    await p.waitForSelector('#jSend', { timeout: 20000 }); await p.fill('#jParent', 'Ronit'); await p.fill('#jKid', 'Noa K.'); await p.check('#jAgree'); await sign(p);
    await p.locator('#jSig').scrollIntoViewIfNeeded(); await p.screenshot({ path: `${OUT}/c_join_${tag}.png` });
    const heb = lang === 'en' ? await p.evaluate(() => [...document.querySelectorAll('#jBody .jhead p, #jBody .jform label, #jBody .jform .hint, #jSend, #jLetter h1, #jLetter h2')].map(e => e.textContent).filter(t => /[֐-׿]{2,}/.test(t))) : [];
    const wide = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    const over = await p.evaluate(() => { const a = document.getElementById('jSig').getBoundingClientRect(), b = document.getElementById('jClear').getBoundingClientRect(); return !(b.bottom <= a.top || b.top >= a.bottom || b.right <= a.left || b.left >= a.right); });
    ok(!over, `${tag}: nothing covers the signature area`);
    ok(!heb.length && !wide, `${tag}: the join page – translated, fits the screen ${JSON.stringify(heb.slice(0, 3))}`);
    await p.click('#jSend'); await p.waitForSelector('#jBody .jstat', { timeout: 20000 }).catch(async e => { console.log('DEBUG', tag, await p.evaluate(() => { const c = document.getElementById('jSig'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; const r = c.getBoundingClientRect(); const top = document.elementFromPoint(r.left + 60, r.top + 30); return [(document.getElementById('jErr') || {}).textContent, n, Math.round(r.top), Math.round(r.width), innerHeight, top && (top.id || top.className || top.tagName)]; })); throw e; }); await p.waitForTimeout(400); await p.screenshot({ path: `${OUT}/c_status_wait_${tag}.png` });
    if (w === 360) { const id = p.url().split('?req=')[1].split('.')[1]; await T.evaluate(id => tApprove(id), id); await T.waitForTimeout(2500);
      await p.reload({ waitUntil: 'load' }); await p.waitForSelector('#jKidLink', { timeout: 20000 }); await p.screenshot({ path: `${OUT}/c_status_ok_${tag}.png` });
      if (lang === 'en') { const heb = await p.evaluate(() => [...document.querySelectorAll('#jBody h2, #jBody p, #jBody .btn, #jBody b')].map(e => e.textContent).filter(t => /[\u0590-\u05FF]{2,}/.test(t) && !/נועה|Noa/.test(t)));
        ok(!heb.length, 'English: the status page is translated ' + JSON.stringify(heb.slice(0, 3))); } }
    const sp = await page(c, reqUrl, 'shot2'); await sp.waitForTimeout(3500); await sp.screenshot({ path: `${OUT}/c_status_off_${tag}.png` });
    const s3 = await page(c, P3.p.url(), 'shot3'); await s3.waitForTimeout(3500); await s3.screenshot({ path: `${OUT}/c_status_no_${tag}.png` });
    await c.close();
  }
  { const c = await ctx({ w: 360, h: 720, lang: 'en', google: { sub: 'teacherC', email: 'teacherc@t.local', email_verified: true, name: 'דנה לוי' } }), p = await page(c, APP, 'tEn');
    await p.waitForSelector('#fbTeach', { timeout: 20000 }); await p.click('#fbTeach'); await p.waitForFunction(() => window.SFF_ROLE, null, { timeout: 25000 }); await p.waitForTimeout(2500);
    await p.screenshot({ path: `${OUT}/c_teacher_en360.png`, fullPage: true });
    const hebH = await p.evaluate(() => [...document.querySelectorAll('#kidCar h3, #kidCar .btn, #kidCar .cbadge, #kidCar .tempty')].map(e => e.textContent).filter(t => /[\u0590-\u05FF]{2,}/.test(t)));
    ok(!hebH.length, "English: the teacher's home is translated " + JSON.stringify(hebH.slice(0, 3)));
    await p.evaluate(() => inviteStudents()); await p.waitForSelector('#tDlg input.tinyurl'); await p.waitForTimeout(800); await p.screenshot({ path: `${OUT}/c_invite_en360.png` });
    const heb = await p.evaluate(() => [...document.querySelectorAll('#tDlg h2, #tDlg p, #tDlg .btn, #tDlg .hint')].map(e => e.textContent).filter(t => /[֐-׿]{2,}/.test(t)));
    ok(!heb.length, 'English: the invite dialog is translated ' + JSON.stringify(heb.slice(0, 3))); await c.close(); }

  ok(!errs.length, 'no page errors ' + JSON.stringify(errs.slice(0, 5)));
  await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
