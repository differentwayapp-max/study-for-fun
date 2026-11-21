// Monthly quota on local emulators (functions + firestore + auth):
// 3 free practice sets, the 4th is refused, a failed start gives the build back, the daily $100 cap stops AI calls (no monthly cap).
// firebase emulators:exec --only functions,firestore,auth --project study-for-fun-7b03c "node tools/tests/e2e_quota.js"
const { chromium } = require('playwright');
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) process.exitCode = 1; };
(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  p.on('pageerror', e => console.log('pageerror', e.message)); p.on('console', m => { if (m.text().startsWith('END')) console.log(m.text()); });
  await p.addInitScript(() => { window.SFF_REST_EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' };
    window.SFF_TEST_GOOGLE = { sub: 'qa1', email: 'qa1@t.local', email_verified: true, name: 'הורה' }; localStorage.setItem('sff_lang', 'he'); });
  await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(2500); if (await p.$('#fbGo')) await p.click('#fbGo');
  await p.waitForFunction(() => window.SFF_ROLE && window.__sffAI, null, { timeout: 20000 }); await p.waitForTimeout(1000);
  const run = (f, a) => p.evaluate(f, a);
  const r = await run(async () => { const out = []; for (let i = 0; i < 4; i++) { try { out.push(await window.__sffAI.start('מתמטיקה')); } catch (e) { out.push({ err: e.code, used: e.used, price: e.price }); } } return out; });
  ok(r.slice(0, 3).every(x => x.kind === 'free') && r[2].used === 3, '3 free builds: ' + r.slice(0, 3).map(x => x.used).join(','));
  ok(r[3].err === 'quota' && r[3].price === 5, '4th build refused (quota, 5 ₪)');
  const refund = await run(async id => { const e = await window.__sffAI.end(id, false); console.log('END', JSON.stringify(e), id); try { return await window.__sffAI.start('אנגלית'); } catch (e) { return { err: e.code }; } }, r[2].buildId);
  ok(refund.kind === 'free' && refund.used === 3, 'a build that failed at the start is given back ' + JSON.stringify(refund));
  const q = await run(async () => { const db = await window.claude.use('db'); const u = await db.doc('usage/' + monthKeyIL()).get(); let w; try { await db.doc('usage/' + monthKeyIL()).set({ builds: 0 }); w = 'written'; } catch (e) { w = 'denied'; } return { builds: u.data().builds, w }; });
  ok(q.builds === 3 && q.w === 'denied', 'parent reads the counter (' + q.builds + ') but cannot change it');
  const call = await run(async id => { try { await (await window.claude.use('sample')).json('match', { ctx: { gi: 0, grade: "א'", subject: "מתמטיקה", topics: ["חיבור"] }, want: ["חיבור"], pool: [{ ref: "a", title: "חיבור", topics: ["חיבור"] }] }, { buildId: id }); return 'ok'; } catch (e) { return e.code + ':' + e.message; } }, refund.buildId);
  ok(!/quota|budget|build_closed/.test(call), 'an AI call inside a build passes the checks (then the fake key fails): ' + call.slice(0, 60));
  const calls = await run(async () => { const db = await window.claude.use('db'); const s = await db.collection('builds').get(); return s.docs.map(d => d.data().calls).reduce((a, c) => a + c, 0); });
  ok(calls === 1, 'the call was counted on the build');
  // no monthly cap: a month past $40 still works; the daily $100 cap: write today's spend as the server would, then any call is refused
  const fam = await run(() => window.__sffFamily.famId); const month = await run(() => monthKeyIL());
  const put = (doc, usd) => fetch(`http://127.0.0.1:8080/v1/projects/study-for-fun-7b03c/databases/(default)/documents/meta/${doc}?updateMask.fieldPaths=usd`, { method: 'PATCH', headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: { usd: { doubleValue: usd } } }) });
  ok((await put(`ai_spend_${month}`, 500)).ok, 'test: month spend set to $500');
  const free = await run(async () => { try { await (await window.claude.use('sample')).json('match', { ctx: { gi: 0, grade: "א'", subject: "מתמטיקה", topics: ["חיבור"] }, want: ["חיבור"], pool: [{ ref: "a", title: "חיבור", topics: ["חיבור"] }] }); return 'ok'; } catch (e) { return e.code; } });
  ok(free !== 'budget', 'no monthly cap: a month past $40 is not refused (' + free + ')');
  const day = await run(() => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()));
  ok((await put(`ai_day_${day}`, 100.01)).ok, 'test: today\'s spend set to $100.01');
  const capped = await run(async () => { try { await window.__sffAI.start('מדעים'); return 'started'; } catch (e) { return e.code; } });
  ok(capped === 'budget' || capped === 'quota', 'new build refused when today\'s AI spend reached $100 (' + capped + ')');
  const capped2 = await run(async () => { try { await (await window.claude.use('sample')).json('match', { ctx: { gi: 0, grade: "א'", subject: "מתמטיקה", topics: ["חיבור"] }, want: ["חיבור"], pool: [{ ref: "a", title: "חיבור", topics: ["חיבור"] }] }); return 'ok'; } catch (e) { return e.code; } });
  ok(capped2 === 'budget', 'AI calls refused at the daily $100 cap');
  await p.evaluate(async () => { await fetch('about:blank').catch(()=>{}); sample = await window.claude.use('sample'); kids.push({ id: 'k1', name: 'נועה', grade: 6, color: '#FF5C8A' }); saveKids(); openWizard('k1'); W.step = 4; wizRender(); }); await p.waitForTimeout(800);
  console.log('quota line:', await p.evaluate(() => document.getElementById('quotaLine').innerText.replace(/\s+/g, ' ')));
  await p.screenshot({ path: process.env.OUT + '/quota.png' }); void fam;
  await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
