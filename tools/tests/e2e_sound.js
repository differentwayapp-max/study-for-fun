// The sound check (☰ → הגדרות → בדיקת צליל) saves every run in the family's failure log (families/{f}/errlog, where
// 'sound-check'): who ran it, what worked, the voice and the phone – so a "no sound" report can be investigated. The check screen itself does not mention the log.
// A kid's phone (normal and Lockdown-like REST) adds its result but cannot read the log; a parent sees it in 🧾 יומן תקלות.
// Run inside the emulators (firestore, auth). OUT=dir for screenshots.
const { chromium } = require('playwright');
const OUT = process.env.OUT || require('os').tmpdir();
const FS = 'http://127.0.0.1:8080', PROJ = 'study-for-fun-7b03c', DOCS = `${FS}/v1/projects/${PROJ}/databases/(default)/documents`;
const H = { Authorization: 'Bearer owner', 'Content-Type': 'application/json' };
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) process.exitCode = 1; };
const sv = s => ({ stringValue: s });
const put = (path, fields) => fetch(`${DOCS}/${path}`, { method: 'PATCH', headers: H, body: JSON.stringify({ fields }) }).then(r => { if (!r.ok) throw new Error(path + ' ' + r.status); });
const logOf = async f => ((await (await fetch(`${DOCS}/families/${f}/errlog?pageSize=100`, { headers: H })).json()).documents || [])
  .map(d => Object.fromEntries(Object.entries(d.fields).map(([k, v]) => [k, Object.values(v)[0]])));
const ARGS = { args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] };
(async () => {
  await put('families/FSND', { inviteToken: sv('OLD'), kidTokens: { mapValue: { fields: { k1: sv('TOKS') } } } });
  await put('families/FSND/fam/kids', { list: { arrayValue: { values: [{ mapValue: { fields: { id: sv('k1'), name: sv('Ben'), grade: { integerValue: '6' }, color: sv('#2F6BFF') } } }] } } });
  const b = await chromium.launch(ARGS), errs = [];
  for (const mode of ['sdk', 'rest']) {
    const c = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }), p = await c.newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(() => { window.SFF_REST_EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' }; localStorage.setItem('sff_lang', 'he'); });
    if (mode === 'rest') await p.route('http://localhost:8765/?**', async r => { const res = await r.fetch(); r.fulfill({ response: res, body: (await res.text()).replace('<script type="module">', '<script type="text/x-blocked">') }); });
    const before = (await logOf('FSND')).length;
    await p.goto('http://localhost:8765/?f=FSND&t=TOKS#kid-k1', { waitUntil: 'load' }); await p.waitForTimeout(8000);
    await p.evaluate(() => openSoundCheck()); await p.waitForFunction(() => window.__sffSoundLogged !== undefined, null, { timeout: 15000 });
    const note = await p.evaluate(() => document.querySelector('#moreDlg .moresheet').textContent);
    if (mode === 'sdk') await p.screenshot({ path: `${OUT}/sound_kid.png` });
    const L = (await logOf('FSND')).filter(r => r.where === 'sound-check');
    const r = L.sort((a, x) => Number(x.at) - Number(a.at))[0] || {};
    console.log(mode, JSON.stringify(r));
    ok(!/יומן/.test(note) && /בדיקת צליל/.test(note), `kid phone (${mode}): the check screen does not mention the log`);
    ok(L.length > before - 0 && /Ben/.test(r.by || '') && /tone:/.test(r.msg || '') && /speak:/.test(r.msg || '') && ['ok', 'fail'].includes(r.code), `kid phone (${mode}): the log has who, tone, speech and the phone`);
    const read = await p.evaluate(async () => { try { const db = await window.claude.use('db'); const q = await db.collection('errlog').get(); return q.docs.length; } catch (e) { return 'denied'; } });
    ok(read === 'denied' || read === 0, `kid phone (${mode}) cannot read the family log (${read})`);
    await c.close();
  }
  // a parent: runs the check and sees every run in 🧾 יומן תקלות
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }), p = await c.newPage(); p.on('pageerror', e => errs.push(e.message));
  await c.addInitScript(() => { window.SFF_REST_EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' };
    window.SFF_TEST_GOOGLE = { sub: 'sndmom', email: 'snd.mom@t.local', email_verified: true, name: 'אמא' }; localStorage.setItem('sff_lang', 'he'); });
  await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(2500); if (await p.$('#fbGo')) await p.click('#fbGo');
  await p.waitForFunction(() => window.SFF_ROLE, null, { timeout: 20000 }); await p.waitForTimeout(1200);
  await p.evaluate(() => { document.getElementById('onb')?.remove(); openMenu(); });
  await p.waitForTimeout(300); await p.evaluate(() => [...document.querySelectorAll('#sideMenu .ditem')].find(x => /בדיקת צליל/.test(x.textContent)).click());
  await p.waitForFunction(() => window.__sffSoundLogged !== undefined, null, { timeout: 15000 });
  const uid = await p.evaluate(() => window.SFF_UID);
  const pl = (await logOf(uid)).filter(r => r.where === 'sound-check');
  ok(pl.length === 1 && pl[0].by === 'אמא', 'parent: the check from the menu is in the log, with the parent name');
  await p.evaluate(() => { closeMore(); openErrLog(); }); await p.waitForTimeout(800);
  const view = await p.evaluate(() => document.querySelector('#moreDlg .moresheet').innerText);
  ok(/sound-check/.test(view) && /אמא/.test(view) && /tone:/.test(view), 'parent: 🧾 יומן תקלות shows the run');
  await p.screenshot({ path: `${OUT}/sound_log.png` });
  ok(!errs.length, 'no page errors ' + JSON.stringify(errs));
  await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
