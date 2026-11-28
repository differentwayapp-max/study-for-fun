// Full screen walk (emulators): every screen in Hebrew and English at phone width – 360 and 320 (iPhone "large icons" /
// Display Zoom, small phones; QA_WIDTHS=360 for one width). At 320 the choice game must fit one screen (320×560).
// Also the teacher area (sign-in with 3 cards, the first choice, the group form, the teacher's home, ☰, the group screen,
// the report tab with no students yet, ☰ → איך זה עובד). The report with students: e2e_class_report.js; the intro: e2e_intro_teacher.js.
// Checks: page errors, sideways overflow, a way back, Hebrew UI text left untranslated in English. Screenshots → OUT.
const { chromium } = require('playwright');
const OUT = process.env.OUT || require('os').tmpdir();   /* screenshots never land in the repo */ const findings = [];
const SCREENS = [
  ['kids', async p => p.evaluate(() => go('kids'))],
  ['menu', async p => { await p.evaluate(() => go('kids')); await p.click('#menuBtn'); }, true],
  ['progress', async p => p.evaluate(() => go('stats'))],
  ['family', async p => p.evaluate(() => go('family'))],
  ['catalog', async p => p.evaluate(() => openCatalog('k1'))],
  ['practice', async p => p.evaluate(() => { curSet = sets.find(s => s.subject === 'מתמטיקה'); renderReview(curSet); show('vReview'); })],
  ['practice-more', async p => { await p.evaluate(() => { curSet = sets.find(s => s.subject === 'מתמטיקה'); renderReview(curSet); show('vReview'); }); await p.evaluate(() => openMore()); }, true],
  ['practice-edit', async p => p.evaluate(() => { curSet = sets.find(s => s.subject === 'מתמטיקה'); EDIT_ON[curSet.id] = true; REV_OPEN[curSet.id] = 0; renderReview(curSet); show('vReview'); })],
  ['builder-1', async p => p.evaluate(() => openWizard('k1'))],
  ['builder-4', async p => p.evaluate(() => { openWizard('k1'); W.subject = 'מתמטיקה'; $('fTopics').value = 'שברים\nאחוזים'; W.step = 4; wizRender(); })],
  ['users', async p => p.evaluate(() => openUsers())],
  ['suggestions', async p => p.evaluate(() => openSuggestions())],
  ['errlog', async p => p.evaluate(() => openErrLog()), true],
  ['kid-home', async p => p.evaluate(() => { activeKid = 'k2'; go('kid'); })],
  ['kid-map', async p => p.evaluate(() => { activeKid = 'k2'; go('kid'); openRoad(sets.find(s => s.kidId === 'k2').id); })],
  ['kid-me', async p => p.evaluate(() => { activeKid = 'k2'; openMe(); })],
  ['game-choice', async p => p.evaluate(() => { const s = sets.find(s => s.kidId === 'k2'); go('kid'); startGame(s, null, 'choice', 3); })],
  ['game-memory', async p => p.evaluate(() => { const s = sets.find(s => s.kidId === 'k2'); go('kid'); startGame(s, null, 'memory', 8); })],
  ['game-match', async p => p.evaluate(() => { const s = sets.find(s => s.kidId === 'k2'); go('kid'); startGame(s, null, 'match', 7); })],
  ['game-spell', async p => p.evaluate(() => { const s = sets.find(s => s.kidId === 'k2'); go('kid'); startGame(s, null, 'spell', 10); })],
];
(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  for (const W of (process.env.QA_WIDTHS || '360,320').split(',').map(Number)) for (const lang of ['he', 'en']) {
    const tag = W === 360 ? lang : `${lang}${W}`;
    const p = await (await b.newContext({ viewport: { width: W, height: W === 320 ? 560 : 720 }, deviceScaleFactor: 1 })).newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/permission|Failed to load resource|ERR_|net::/i.test(m.text())) errs.push('console: ' + m.text().slice(0, 120)); });
    await p.addInitScript(([l, t]) => { window.SFF_TEACH_LINKS = true; window.SFF_REST_EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' }; window.SFF_TEST_GOOGLE = { sub: 'qa' + t, email: 'differentway.app@gmail.com', email_verified: true, name: 'טליה' }; localStorage.setItem('sff_lang', l); }, [lang, tag]);
    await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(2500); if (await p.$('#fbGo')) await p.click('#fbGo');
    await p.waitForFunction(() => window.SFF_ROLE, null, { timeout: 20000 }); await p.waitForTimeout(2500);
    await p.evaluate(async () => { kids.push({ id: 'k1', name: 'בן', grade: 6, color: '#2F6BFF' }, { id: 'k2', name: 'עדי', grade: 3, color: '#FF5C8A' }); saveKids();
      applyImport(await loadShare('math7-nov26'), kidById('k1')); await new Promise(r => setTimeout(r, 20)); applyImport(await loadShare('en7-nov26'), kidById('k1')); await new Promise(r => setTimeout(r, 20));
      const s = applyImport(await loadShare('en4-nov26'), kidById('k2')).set; const C = getChapters(s);
      [0, 1, 2].forEach(ch => history.unshift({ at: Date.now() - ch * 6e5, kidId: 'k2', kid: 'עדי', subject: s.subject, grade: s.grade, setId: s.id, ch, right: ch === 1 ? 4 : 11, n: 12, score: 1, mode: 'choice', qr: C[ch].qs.map((q, j) => s.questions.indexOf(q) + '.' + (j % 4 ? 1 : 0)), topics: { [C[ch].qs[0].topic]: { r: ch === 1 ? 4 : 11, n: 12 } } }));
      saveHistoryLocal(); });
    await p.waitForTimeout(1500);
    for (const [name, act, keepOpen] of SCREENS) {
      try { await p.evaluate(() => { closeMenu(); closeMore(); document.getElementById('gSheet')?.classList.remove('show'); }); await act(p); await p.waitForTimeout(1300); }
      catch (e) { findings.push(`${lang} ${name}: could not open (${e.message.slice(0, 80)})`); continue; }
      const r = await p.evaluate(lang => {
        const wide = document.documentElement.scrollWidth > innerWidth + 1;
        const vis = el => el && el.offsetParent !== null && getComputedStyle(el).visibility !== 'hidden';
        const back = [...document.querySelectorAll('button,a')].filter(vis).some(b => /✕|×|חזרה|ביטול|סגירה|Close|Back|Cancel|ילדים|Kids|למסך ההורה|Parent screen/.test(b.textContent + (b.getAttribute('aria-label') || '')));
        let heb = [];
        if (lang === 'en') { const SKIP = '.qbox,.opts,.passage,.expl,.mcard,.mitem,.slots,.tiles,.wchips,.wchip,.wdetail,.q-list,#rQA,#repQ,.ttile,[translate="no"],.rq,.chqs,.nm,.who b,.utab,.cartab,.kidhero h2,.mebar,.whoami,#rTitle,.catcard .hint,.catcard p,.trow b,.scard h3,.sugcard,.errrow,#dName,#dSub,.prow .t,.rdlegend,svg,text';
          const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
          while ((n = w.nextNode())) { const t = n.textContent.trim(); if (!/[֐-׿]{2,}/.test(t)) continue; const el = n.parentElement; if (!vis(el) || el.closest(SKIP)) continue; heb.push(t.slice(0, 40)); } }
        const ob = [...document.querySelectorAll('#vGame:not(.hidden) .opt')].map(o => o.getBoundingClientRect().bottom);
        return { wide, back, heb: [...new Set(heb)].slice(0, 6), fits: !ob.length || Math.max(...ob) <= innerHeight };
      }, lang);
      await p.screenshot({ path: `${OUT}/${tag}_${name}.png` });
      if (r.wide) findings.push(`${tag} ${name}: page wider than the phone (sideways scroll)`);
      if (!r.back && !['kids', 'kid-home'].includes(name)) findings.push(`${tag} ${name}: no visible way back`);
      if (r.heb.length) findings.push(`${tag} ${name}: Hebrew left in English: ${r.heb.join(' | ')}`);
      if (name === 'game-choice' && !r.fits) findings.push(`${tag} ${name}: the answers go below the screen`);
    }
    if (errs.length) findings.push(`${tag}: page errors: ${[...new Set(errs)].slice(0, 5).join(' || ')}`);
    await p.context().close();
  }
  // the teacher area: the sign-in screen (3 cards), the first choice, the group form, the teacher's home, ☰ and the group screen
  for (const W of (process.env.QA_WIDTHS || '360,320').split(',').map(Number)) for (const lang of ['he', 'en']) {
    const tag = W === 360 ? lang : `${lang}${W}`;
    const p = await (await b.newContext({ viewport: { width: W, height: W === 320 ? 560 : 720 }, deviceScaleFactor: 1 })).newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(([l, t]) => { window.SFF_TEACH_LINKS = true; window.SFF_REST_EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' };
      window.SFF_TEST_GOOGLE = { sub: 'qat' + t, email: 'qat' + t + '@t.local', email_verified: true, name: 'מורה' }; localStorage.setItem('sff_lang', l); }, [lang, tag]);
    const check = async name => { const r = await p.evaluate(lang => {
        const vis = el => el && el.offsetParent !== null && getComputedStyle(el).visibility !== 'hidden'; let heb = [];
        if (lang === 'en') { const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
          while ((n = w.nextNode())) { const t = n.textContent.trim(); if (!/[\u0590-\u05FF]{2,}/.test(t)) continue; const el = n.parentElement; if (!vis(el) || el.closest('[translate="no"],#dName,#dSub,.thead h2,#hdrTitle')) continue; heb.push(t.slice(0, 40)); } }
        return { wide: document.documentElement.scrollWidth > innerWidth + 1, heb: [...new Set(heb)].slice(0, 6) }; }, lang);
      await p.screenshot({ path: `${OUT}/${tag}_${name}.png` });
      if (r.wide) findings.push(`${tag} ${name}: page wider than the phone (sideways scroll)`);
      if (r.heb.length) findings.push(`${tag} ${name}: Hebrew left in English: ${r.heb.join(' | ')}`); };
    try {
      await p.goto('http://localhost:8765/teach', { waitUntil: 'load' }); await p.waitForSelector('#fbGo', { timeout: 15000 }); await check('t-login');
      await p.click('#fbGo'); await p.waitForSelector('#tsClass', { timeout: 20000 }); await check('t-choose');
      await p.click('#tsClass'); await p.fill('#tsName', lang === 'en' ? 'Grade 4, class 2 – Math' : "ד'2 – חשבון"); await check('t-form');
      await p.click('#tsGo'); await p.waitForFunction(() => window.SFF_ROLE, null, { timeout: 25000 }); await p.waitForTimeout(2000); await check('t-home');
      await p.click('#menuBtn'); await p.waitForTimeout(500); await check('t-menu'); await p.evaluate(() => closeMenu());
      await p.evaluate(() => go('family')); await p.waitForTimeout(800); await check('t-group');
      await p.evaluate(() => go('stats')); await p.waitForTimeout(600); await check('t-report');
      await p.evaluate(() => { openHowItWorks(); }); await p.waitForTimeout(500); await check('t-howto'); await p.evaluate(() => introEnd());
    } catch (e) { findings.push(`${tag} teacher: ${e.message.slice(0, 120)}`); }
    if (errs.length) findings.push(`${tag} teacher: page errors: ${[...new Set(errs)].slice(0, 5).join(' || ')}`);
    await p.context().close();
  }
  console.log(findings.length ? 'FINDINGS\n' + findings.join('\n') : 'no findings'); await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
