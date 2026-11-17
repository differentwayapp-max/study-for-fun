// Catalog suggestion flow (emulators): a parent suggests → admin reviews and approves → it appears in the catalog and can be added.
const { chromium } = require('playwright');
const OUT = process.env.OUT || require('os').tmpdir();   /* screenshots never land in the repo */ const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) process.exitCode = 1; };
(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const open = async (sub, email, name) => { const p = await (await b.newContext({ viewport: { width: 360, height: 760 }, deviceScaleFactor: 2 })).newPage();
    p.on('pageerror', e => console.log('pageerror', sub, e.message)); p.on('dialog', d => d.accept('שברים · כיתה ה'));
    await p.addInitScript(g => { window.SFF_REST_EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' }; window.SFF_TEST_GOOGLE = g; localStorage.setItem('sff_lang', 'he'); }, { sub, email, email_verified: true, name });
    await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(2500); if (await p.$('#fbGo')) await p.click('#fbGo');
    await p.waitForFunction(() => window.SFF_ROLE && window.__sffRoot, null, { timeout: 20000 }); await p.waitForTimeout(1200); return p; };
  const dana = await open('dana', 'dana@t.local', 'דנה');
  await dana.evaluate(async () => { kids.push({ id: 'k1', name: 'יואב', grade: 4, color: '#2F6BFF' }); saveKids(); const s = applyImport(await loadShare('math7-nov26'), kidById('k1')).set; s.src = ''; s.shared = false; store.save(); curSet = s; renderReview(s); show('vReview'); });
  await dana.click('.rhead [aria-label="אפשרויות"]'); await dana.click('#rSuggest2'); await dana.waitForTimeout(300); await dana.click('#sureYes'); await dana.waitForTimeout(1500);
  const peek = await dana.evaluate(async () => { try { await window.__sffRoot.list('catalogSuggestions'); return 'read'; } catch (e) { return 'denied'; } });
  ok(peek === 'denied', 'a parent cannot read the suggestions');
  const adm = await open('talia', 'differentway.app@gmail.com', 'טליה');
  await adm.click('#menuBtn'); await adm.click('text=הצעות לקטלוג'); await adm.waitForTimeout(1500);
  ok(await adm.evaluate(() => document.querySelectorAll('.sugcard').length) === 1, 'admin sees 1 suggestion');
  await adm.screenshot({ path: OUT + '/sug_0.png' });
  await adm.click('text=✓ לאשר לקטלוג'); await adm.waitForTimeout(2000);
  const cat = await dana.evaluate(async () => { await openCatalog('k1'); await new Promise(r => setTimeout(r, 800)); return CAT.list.filter(x => /^fs-/.test(x.id)).map(x => x.id + '|' + x.title); });
  ok(cat.length === 1 && cat[0].includes('שברים'), 'the approved set is in the catalog: ' + cat[0]);
  await dana.screenshot({ path: OUT + '/sug_1.png' });
  const added = await dana.evaluate(async id => { const p = await loadShare(id); return p.qs.length; }, cat[0].split('|')[0]);
  ok(added > 100, 'it loads from the catalog (' + added + ' questions)');
  const hack = await dana.evaluate(async () => { try { await window.__sffRoot.set('catalog', 'x', { title: 'spam' }); return 'written'; } catch (e) { return 'denied'; } });
  ok(hack === 'denied', 'a parent cannot write to the catalog');
  await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
