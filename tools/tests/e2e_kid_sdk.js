// End-to-end on local Firebase emulators with the real security rules:
// a family with the English practice set → a kid's phone where the module script cannot run (like iPhone Lockdown Mode)
const { chromium } = require('playwright'); const fs = require('fs');
const FS = 'http://127.0.0.1:8080', AU = 'http://127.0.0.1:9099', PROJ = 'study-for-fun-7b03c';
const DOCS = `${FS}/v1/projects/${PROJ}/databases/(default)/documents`;
const enc = x => x === null || x === undefined ? { nullValue: null } : typeof x === 'string' ? { stringValue: x } : typeof x === 'boolean' ? { booleanValue: x }
  : typeof x === 'number' ? (Number.isInteger(x) ? { integerValue: String(x) } : { doubleValue: x }) : Array.isArray(x) ? { arrayValue: { values: x.map(enc) } } : { mapValue: { fields: encF(x) } };
const encF = o => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined).map(([k, v]) => [k, enc(v)]));
const put = (path, obj) => fetch(`${DOCS}/${path}`, { method: 'PATCH', headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: encF(obj) }) }).then(r => { if (!r.ok) throw new Error(path + ' ' + r.status); });
(async () => {
  const code = fs.readFileSync(__dirname + '/../../public/share/en7-nov26.txt', 'utf8').slice(5);
  const p0 = JSON.parse(Buffer.from(code, 'base64').toString('utf8'));
  const set = { id: 's1', kidId: 'k1', name: 'Ben', grade: 6, subject: p0.subject, topics: p0.topics, questions: p0.questions, chapters: p0.chapters, examDate: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10) /* always a week ahead */, dailyGoal: 5, perRound: 13, shared: true, src: 'en7_nov26', words: p0.words, qa: p0.qa };
  await put('families/FAM1', { inviteToken: 'OLD', kidTokens: { k1: 'TOK1' }, createdAt: Date.now() });
  await put('families/FAM1/fam/kids', { list: [{ id: 'k1', name: 'Ben', grade: 6, color: '#2F6BFF' }] });
  await put('families/FAM1/sets/s1', { set });
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] }); const errs = [];
  for (const [name, tok] of [['right link', 'TOK1'], ['wrong link', 'BAD']]) {
    const c = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); const p = await c.newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type()==='error') errs.push('console: '+m.text().slice(150,420)); }); p.on('requestfailed', r => errs.push('failed: '+r.url().slice(0,80)+' '+(r.failure()||{}).errorText));
    await p.addInitScript(() => { window.SFF_REST_EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' }; localStorage.setItem('sff_lang', 'he'); });
    // like Lockdown Mode: the module script never runs
    if (process.env.BLOCK) await p.route('http://localhost:8765/?**', async r => { const res = await r.fetch(); r.fulfill({ response: res, body: (await res.text()).replace('<script type="module">', '<script type="text/x-blocked">') }); });
    await p.goto(`http://localhost:8765/?f=FAM1&t=${tok}#kid-k1`, { waitUntil: 'load' }); await p.waitForTimeout(9000);
    const st = await p.evaluate(() => ({ via: window.__sffVia, stage: window.__sffStage, kids: kids.length, sets: sets.filter(s => !s.demo).length, err: window.__sffCloudErr || window.__sffJoinErr || '' }));
    console.log(name.padEnd(10), JSON.stringify(st)); console.log('   errs:', errs.slice(0,5).join(' | '));
    if (name === 'right link') {
      await p.screenshot({ path: `${process.env.OUT || require('os').tmpdir()}/e2e_home.png` });
      await p.click('#subCar .play'); await p.waitForTimeout(800);
      console.log('   map stations:', await p.evaluate(() => document.querySelectorAll('#rdMap .st').length), '| demo?', await p.evaluate(() => !!document.querySelector('#rdHdr .demotag')));
      await p.screenshot({ path: `${process.env.OUT || require('os').tmpdir()}/e2e_map.png` });
      // play chapter 1 and finish it → progress must reach the family (parent side)
      await p.evaluate(() => { const s = sets.find(x => !x.demo); startGame(s, null, 'choice', 0); G.qs.forEach(q => G.res.push({ q, ok: true })); endGame(); });
      await p.waitForTimeout(2500);
      const pr = await fetch(`${DOCS}/families/FAM1/progress/k1`, { headers: { Authorization: 'Bearer owner' } }).then(r => r.json());
      console.log('   progress saved in the cloud:', pr.fields ? (pr.fields.history.arrayValue.values || []).length + ' game(s)' : JSON.stringify(pr).slice(0, 120));
    } else {
      await p.evaluate(() => go('kid')); await p.waitForTimeout(300);
      console.log('   message:', await p.evaluate(() => document.getElementById('cloudErr').innerText.replace(/\s+/g, ' ').slice(0, 90)));
    }
    await c.close();
  }
  console.log('ERR', errs); await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
