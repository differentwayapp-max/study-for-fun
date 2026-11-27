// Admin "🗄️ גיבויים" screen + restoring one family (emulators incl. functions):
// a regular parent is refused; the admin sees the screen; a family is restored to a past minute (point-in-time) –
// the kids come back as they were, the kid links (access) stay as they are now; an unknown account is refused.
// (The Google backup APIs and the bucket don't exist in the emulator: the setup rows show their errors there.)
const { chromium } = require('playwright');
const OUT = process.env.OUT || require('os').tmpdir();   /* screenshots never land in the repo */ const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) process.exitCode = 1; };
(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const open = async (sub, email, name, lang = 'he', url = 'http://localhost:8765/') => { const p = await (await b.newContext({ viewport: { width: 360, height: 760 }, deviceScaleFactor: 2 })).newPage();
    await p.addInitScript(g => { window.SFF_REST_EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' }; window.SFF_TEST_GOOGLE = g; localStorage.setItem('sff_lang', g.lang); }, { sub, email, email_verified: true, name, lang });
    await p.goto(url, { waitUntil: 'load' }); await p.waitForTimeout(2500); if (await p.$('#fbGo')) await p.click('#fbGo');
    await p.waitForFunction(() => window.SFF_ROLE, null, { timeout: 20000 }); await p.waitForTimeout(1500); return p; };
  const fam = await open('dana', 'dana@t.local', 'דנה כהן');
  await fam.evaluate(() => { kids.push({ id: 'k1', name: 'יואב', grade: 3, color: '#2F6BFF' }); saveKids();
    sets.unshift({ id: 'sA', kidId: 'k1', name: 'יואב', grade: 3, subject: 'חשבון', topics: ['חיבור'], created: Date.now(),
      questions: [{ topic: 'חיבור', question: '1+1', options: ['2', '3', '4', '5'], answer: 0, explanation: 'כי', ch: 0 }], chapters: [{ title: 'חיבור', topics: ['חיבור'], count: 1 }] });
    store.save(); }); await fam.waitForTimeout(2500);
  // the restore point: a whole minute after kid 1 was saved, before kid 2
  const wait = 61000 - (Date.now() % 60000); await fam.waitForTimeout(wait);
  const T = Date.now();
  await fam.waitForTimeout(2000);
  await fam.evaluate(() => { kids.push({ id: 'k2', name: 'נועה', grade: 5, color: '#F2A63B' }); saveKids(); removeSet('sA'); }); await fam.waitForTimeout(2500);   // a practice set deleted by mistake
  const link2 = await fam.evaluate(() => window.__sffFamily.kidLink('k2'));
  ok(/k2|kid/.test(link2), 'a kid link for kid 2 was made after the restore point');

  const denied = await fam.evaluate(async () => { try { await window.__sffBackup({ action: 'status' }); return 'allowed'; } catch (e) { return String(e.code || e.message); } });
  ok(/permission/.test(denied), 'a regular parent is refused (' + denied + ')');
  const denied2 = await fam.evaluate(async t => { try { await window.__sffBackup({ action: 'restore', fam: 'dana@t.local', at: t, confirm: true }); return 'allowed'; } catch (e) { return String(e.code || e.message); } }, T);
  ok(/permission/.test(denied2), 'a regular parent cannot restore (' + denied2 + ')');

  const adm = await open('talia', 'differentway.app@gmail.com', 'טליה');
  await adm.click('#menuBtn'); await adm.waitForTimeout(300); await adm.click('text=גיבויים'); await adm.waitForSelector('#bkCheck', { timeout: 60000 });
  const txt = await adm.evaluate(() => document.querySelector('#moreDlg .moresheet').innerText);
  ok(txt.includes('שחזור לכל דקה') && txt.includes('גיבוי שבועי') && txt.includes('שחזור משפחה'), 'the admin sees the backups screen');
  await adm.screenshot({ path: OUT + '/backups.png' });

  const left = T + 61000 - Date.now(); if (left > 0) await adm.waitForTimeout(left);       // the restore point must be a minute old
  const bad = await adm.evaluate(async t => { try { await window.__sffBackup({ action: 'restore', fam: 'nobody@t.local', at: t }); return 'allowed'; } catch (e) { return e.code; } }, T);
  ok(bad === 'no_account', 'an unknown account is refused (' + bad + ')');
  const old = await adm.evaluate(async () => { try { await window.__sffBackup({ action: 'restore', fam: 'dana@t.local', at: Date.now() - 8 * 864e5 }); return 'allowed'; } catch (e) { return e.code; } });
  ok(old === 'out_of_window', 'more than 7 days back is refused (' + old + ')');

  // the preview, from the screen
  await adm.fill('#bkFam', 'dana@t.local');
  await adm.evaluate(t => { const d = new Date(t - new Date().getTimezoneOffset() * 60000); document.getElementById('bkAt').value = d.toISOString().slice(0, 16); }, T);
  await adm.click('#bkCheck'); await adm.waitForSelector('#bkRes .errrow', { timeout: 30000 });
  const prev = await adm.evaluate(() => document.getElementById('bkRes').innerText.replace(/\s+/g, ' '));
  ok(/אז .*1 ילדים · 1 תרגולים/.test(prev) && /עכשיו: 2 ילדים · 0 תרגולים/.test(prev), 'the preview shows then 1 kid + 1 set, now 2 kids + 0 sets: ' + prev);
  await adm.screenshot({ path: OUT + '/backups_preview.png' });
  await adm.click('#bkGo'); await adm.waitForTimeout(400);
  await adm.click('#sureYes').catch(async () => { await adm.click('text=לשחזר >> nth=-1'); });
  await adm.waitForFunction(() => /שוחזר/.test(document.getElementById('bkRes').innerText), null, { timeout: 30000 });
  await adm.screenshot({ path: OUT + '/backups_done.png' });

  await fam.waitForTimeout(3000);
  const famId = await fam.evaluate(() => window.__sffFamily.famId);
  const raw = await (await fetch(`http://127.0.0.1:8080/v1/projects/study-for-fun-7b03c/databases/(default)/documents/families/${famId}/fam/kids`, { headers: { Authorization: 'Bearer owner' } })).json();
  const ids = ((raw.fields || {}).list || {}).arrayValue?.values?.map(v => v.mapValue.fields.id.stringValue).join(',');
  ok(ids === 'k1', 'in the database the kids are back to the restore point: ' + ids);
  await fam.waitForFunction(() => window.SFF_ROLE && typeof kids !== 'undefined', null, { timeout: 20000 }); await fam.waitForTimeout(3000);   // the parent's open app reloads by itself
  const after = await fam.evaluate(() => kids.map(k => k.id).join(','));
  ok(after === 'k1', "the parent's open app shows the restored kids: " + after);
  const back = await fam.evaluate(() => sets.map(x => x.id).join(','));
  ok(back === 'sA', 'the deleted practice set is back in the app: ' + back);
  await fam.evaluate(() => { kids[0].name = 'יואב ש.'; saveKids(); }); await fam.waitForTimeout(2500);
  const raw2 = await (await fetch(`http://127.0.0.1:8080/v1/projects/study-for-fun-7b03c/databases/(default)/documents/families/${famId}/fam/kids`, { headers: { Authorization: 'Bearer owner' } })).json();
  const ids2 = ((raw2.fields || {}).list || {}).arrayValue?.values?.map(v => v.mapValue.fields.id.stringValue).join(',');
  ok(ids2 === 'k1', 'the next save from that app does not bring the old kid back: ' + ids2);
  const tok = await fam.evaluate(() => window.__sffFamily.kidLink('k2'));
  ok(tok === link2, 'the kid link made after the restore point is kept (access is never restored)');
  const log = await adm.evaluate(async () => (await window.__sffRoot.list('serverLog')).filter(r => r.kind === 'restore').length);
  ok(log === 1, 'the restore is in the server log');
  // English
  const en1 = await open('talia', 'differentway.app@gmail.com', 'טליה', 'en');
  await en1.evaluate(() => openBackups()); await en1.waitForSelector('#bkCheck', { timeout: 60000 });
  await en1.fill('#bkFam', 'dana@t.local'); await en1.click('#bkCheck');   // an hour ago the family didn't exist yet: the error, in English
  await en1.waitForFunction(() => { const t = document.getElementById('bkRes').innerText; return t && !/⏳/.test(t); }, null, { timeout: 30000 });
  const en = await en1.evaluate(() => document.querySelector('#moreDlg .moresheet').innerText);
  const heb = en.split('\n').filter(l => /[\u0590-\u05FF]/.test(l));
  ok(!heb.length, 'the screen is in English: ' + (heb.join(' | ') || 'no Hebrew left'));
  await en1.screenshot({ path: OUT + '/backups_en.png' });
  await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
