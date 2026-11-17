// Grade catalog screen (local emulators). OUT=dir
const { chromium } = require('playwright');
const OUT = process.env.OUT || require('os').tmpdir();   // screenshots never land in the repo
(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const errs = [];
  for (const lang of ['he', 'en']) {
    const p = await (await b.newContext({ viewport: { width: 360, height: 720 }, deviceScaleFactor: 2 })).newPage();
    p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(l => { window.SFF_REST_EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' };
      window.SFF_TEST_GOOGLE = { sub: 'ct' + l, email: 'mom' + l + '@t.local', email_verified: true, name: 'טליה' }; localStorage.setItem('sff_lang', l); }, lang);
    await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(2500); if (await p.$('#fbGo')) await p.click('#fbGo');
    await p.waitForFunction(() => window.SFF_ROLE, null, { timeout: 20000 }); await p.waitForTimeout(1200);
    await p.evaluate(() => { kids.push({ id: 'k1', name: 'נועה', grade: 0, color: '#FF5C8A' }, { id: 'k2', name: 'בן', grade: 6, color: '#2F6BFF' }); saveKids(); openCatalog('k1'); return kids.length; }).then(n => n !== 2 && errs.push('kids ' + n));
    await p.waitForTimeout(2000);
    await p.screenshot({ path: `${OUT}/cat_${lang}_0.png` });
    await p.screenshot({ path: `${OUT}/cat_${lang}_full.png`, fullPage: true });
    if (lang === 'he') {
      await p.evaluate(() => { CAT.grade = 2; renderCatalog(); }); await p.waitForTimeout(500);
      await p.screenshot({ path: `${OUT}/cat_he_g3.png`, fullPage: true });
      await p.evaluate(() => { CAT.grade = 0; renderCatalog(); });
      await p.click('.subjtile >> nth=0'); await p.waitForTimeout(1500);
      if (!await p.$('.pickgo[disabled]')) errs.push('add should wait for a topic');
      await p.click('.pick >> nth=0'); await p.click('.pick >> nth=2'); await p.waitForTimeout(300);
      await p.screenshot({ path: `${OUT}/cat_he_subj.png`, fullPage: true });
      await p.click('.pickgo'); await p.waitForTimeout(1200);
      await p.screenshot({ path: `${OUT}/cat_he_add.png` });
      await p.click('#addDlg .btn.big'); await p.waitForTimeout(800);
      const r = await p.evaluate(() => { const s = sets.find(x => x.kidId === 'k1'); return s && { pick: s.pick, topics: [...new Set(s.questions.map(q => q.topic))], ch: s.chapters.length, n: s.questions.length, bad: s.questions.some(q => !s.chapters[q.ch]) }; });
      console.log('added', JSON.stringify(r));
      if (!r || r.topics.length !== 2 || r.bad) errs.push('picked set wrong');
    }
    await p.close();
  }
  console.log(JSON.stringify({ errs })); await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
