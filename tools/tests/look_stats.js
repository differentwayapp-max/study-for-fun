// Parent feedback page with some history on a set. SET=<share> OUT=dir
const { chromium } = require('playwright');
const { SET, OUT } = process.env;
(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.SFF_REST_EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' };
    window.SFF_TEST_GOOGLE = { sub: 'st', email: 'st@t.local', email_verified: true, name: 'הורה' }; localStorage.setItem('sff_lang', 'he'); });
  await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(2500); if (await p.$('#fbGo')) await p.click('#fbGo');
  await p.waitForFunction(() => window.SFF_ROLE, null, { timeout: 20000 }); await p.waitForTimeout(1200);
  await p.evaluate(async sh => { kids.push({ id: 'k2', name: 'בן', grade: 6, color: '#2F6BFF' }); saveKids();
    const s = applyImport(await loadShare(sh), kidById('k2')).set; const C = getChapters(s); let t = Date.now() - 864e5;
    C.slice(0, 6).forEach((c, ci) => { const qs = c.qs; const res = qs.map((q, m) => ({ q, ok: (m * 7 + ci) % 4 !== 0 })); const by = {};
      res.forEach(r => { const b = by[r.q.topic] = by[r.q.topic] || { r: 0, n: 0 }; b.n++; if (r.ok) b.r++; });
      history.unshift({ at: t += 6e5, kidId: 'k2', kid: 'בן', subject: s.subject, grade: s.grade, setId: s.id, ch: s.questions.indexOf(qs[0]) >= 0 ? ci : ci, right: res.filter(r => r.ok).length, n: res.length, score: 50, mode: 'choice',
        qr: res.map(r => s.questions.indexOf(r.q) + '.' + (r.ok ? 1 : 0)), topics: by }); });
    saveHistoryLocal(); go('stats'); }, SET);
  await p.waitForTimeout(1500); await p.screenshot({ path: OUT + '/stats_full.png', fullPage: true });
  console.log(JSON.stringify({ errs })); await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
