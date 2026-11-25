// The intro screens on short phones (the owner's report: cut on an iPhone), on the emulators (firestore, auth):
// sizes as Safari shows a page with its address bar – SE 375×548, mini 375×629, 14/15 390×664, Pro Max 430×740 – and Android 360×740;
// the series: the parent (4), the kid (2), the tutor (t1–t5), the class teacher and the private teacher (s1–s6), Hebrew and English.
// Each screen: nothing of the screen (but a phone picture, or a part hidden on purpose) below the bottom of the stage – a must
// from 390×664 up; at 375×548 / 375×629 it may scroll, only with the hint (a fade + an arrow) on, and the hint goes at the end;
// every button ≥ 44 px; the explanation ≥ 12 px on the screen (its size × the scale). English: no Hebrew left.
// The family app's sign-in: no card cut in half at the bottom (a short screen: one link to the teachers' app instead of the card).
// OUT=dir: a picture of each screen that fails, and the pictures for the report (SHOTS=1).
const { chromium } = require('playwright');
const APP = 'http://localhost:8765/', OUT = process.env.OUT || require('os').tmpdir(), SHOTS = !!process.env.SHOTS;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) process.exitCode = 1; };
const EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' };
const SIZES = [[375, 548, 'SE'], [375, 629, 'mini'], [390, 664, '14'], [430, 740, 'ProMax'], [360, 740, 'Android']];
const SERIES = [['parent', '(openIntro(false),0)'], ['kid', '(openIntro(true),0)'], ['tutor', "(openTeacherIntro('tutor'),0)"], ['class', "(openTeacherIntro('class'),0)"], ['private', "(openTeacherIntro('private'),0)"]];
const PICK = { parent: ['main', 'material', 'track', 'start'], kid: ['play', 'compete'], tutor: ['t3'], class: ['s2'], private: ['s3'] };
(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const errs = [], table = {}, bad = [], tags = [];
  const check = p => p.evaluate(() => {
    const el = document.getElementById('intro'), st = el.querySelector('.istage'), c = el.querySelector('.icard0'), sb = st.getBoundingClientRect().bottom;
    const k = new DOMMatrix(getComputedStyle(c).transform).a;
    const kids = () => [...c.children].filter(x => !x.classList.contains('iphone') && x.offsetParent !== null);
    const low = kids().filter(x => x.getBoundingClientRect().bottom > sb + 1).map(x => (x.className || x.tagName) + ':' + Math.round(x.getBoundingClientRect().bottom - sb));
    const hint = el.querySelector('.imore.on') ? true : false, scroll = getComputedStyle(st).overflowY !== 'hidden' && st.scrollHeight > st.clientHeight + 1;
    const small = [...el.querySelectorAll("button")].filter(x => x.offsetParent !== null).filter(x => { const r = x.getBoundingClientRect(); return r.height < 44 || r.width < 44; }).map(x => x.className + ' ' + Math.round(x.getBoundingClientRect().width) + '×' + Math.round(x.getBoundingClientRect().height));
    const font = [...c.children].filter(x => x.tagName === 'P' && x.offsetParent !== null).map(x => parseFloat(getComputedStyle(x).fontSize) * k).filter(f => f < 11.95).map(f => f.toFixed(1));
    // to the end: everything is reachable, the hint goes
    st.scrollTop = st.scrollHeight; const sb2 = st.getBoundingClientRect().bottom;
    const lowEnd = kids().filter(x => x.getBoundingClientRect().bottom > sb2 + 1).length;
    return { key: el.dataset.key, k: +k.toFixed(2), low, hint, scroll, small, font, lowEnd, heb: (el.innerText.match(/[֐-׿][^\n]*/g) || []) };
  });
  const endHint = p => p.evaluate(() => new Promise(r => setTimeout(() => { const el = document.getElementById('intro'); const st = el.querySelector('.istage'); const res = !!el.querySelector('.imore.on'); st.scrollTop = 0; st.dispatchEvent(new Event('scroll')); r(res); }, 150)));
  for (const lang of ['he', 'en']) {
    const c = await b.newContext({ viewport: { width: 390, height: 664 }, deviceScaleFactor: 2, hasTouch: true });
    await c.addInitScript(([l, E]) => { window.SFF_REST_EMU = E; window.SFF_TEST_GOOGLE = { sub: 'ios-' + l, email: 'ios-' + l + '@t.local', email_verified: true, name: 'הורה' }; localStorage.setItem('sff_lang', l); }, [lang, EMU]);
    const p = await c.newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.goto(APP, { waitUntil: 'load' }); await p.waitForTimeout(2000); if (await p.$('#fbGo')) await p.click('#fbGo');
    await p.waitForFunction(() => window.SFF_ROLE, null, { timeout: 20000 }); await p.waitForTimeout(1500);
    await p.evaluate(l => { document.getElementById('intro')?.remove(); if (!kids.length) kids.push({ id: 'kx', name: l === 'en' ? 'Noa' : 'נועה', grade: 4, color: '#2F6BFF' }); }, lang);   // (a name is never translated: an English family's kid)
    for (const [w, h, nm] of SIZES) {
      await p.setViewportSize({ width: w, height: h }); await p.waitForTimeout(150);
      for (const [ser, js] of SERIES) {
        await p.evaluate('document.getElementById("intro")?.remove()'); await p.evaluate(js); await p.waitForSelector('#intro'); await p.waitForTimeout(250);
        const n = await p.evaluate(() => IN.list.length);
        for (let i = 0; i < n; i++) {
          await p.evaluate(i => { if (IN.i !== i) introGo(i); }, i); await p.waitForTimeout(260);
          if (await p.evaluate(() => !!document.querySelector('#intro .itag'))) tags.push(`${lang} ${ser}:${await p.evaluate(() => IN.list[IN.i])}`);
          const r = await check(p), must = w >= 390 || h >= 664, hEnd = r.scroll ? await endHint(p) : false;
          const fits = !r.low.length && !r.scroll, hinted = r.scroll && r.hint && !hEnd && !r.lowEnd;
          const pass = (fits || (!must && hinted)) && !r.small.length && !r.font.length && (lang === 'he' || !r.heb.length);
          const id = `${ser}:${r.key}`; (table[id] = table[id] || {})[`${nm} ${lang}`] = (fits ? 'נכנס' : hinted ? 'נגלל עם רמז' : 'נחתך') + ` ${Math.round(r.k * 100)}%`;
          if (!pass) { bad.push(`${lang} ${w}×${h} ${id}: ` + JSON.stringify({ low: r.low, scroll: r.scroll, hint: r.hint, hintAtEnd: hEnd, lowEnd: r.lowEnd, small: r.small, font: r.font, heb: lang === 'en' ? r.heb : [] }));
            await p.screenshot({ path: `${OUT}/ios_fail_${lang}_${w}x${h}_${ser}_${r.key}.png` }); }
          if (SHOTS && ([664, 548].includes(h) || (w === 360 && ser === 'parent')) && PICK[ser].includes(r.key)) await p.screenshot({ path: `${OUT}/ios_${lang}_${w}x${h}_${ser}_${r.key}.png` });
        }
      }
    }
    await p.evaluate('document.getElementById("intro")?.remove()'); await c.close();
  }
  console.log('the screens: Hebrew and English, 5 sizes, 5 series');
  ok(!tags.length, 'no "for the parent / for the kid / for the private tutor" tag in the app (only in the store\'s pictures) ' + JSON.stringify([...new Set(tags)]));
  ok(!bad.length, 'every screen fits (from 390×664 up: with no scrolling; smaller: scrolling only with the hint), buttons ≥ 44 px, the explanation ≥ 12 px, English has no Hebrew' + (bad.length ? '\n    ' + bad.join('\n    ') : ''));
  require('fs').writeFileSync(`${OUT}/ios_table.json`, JSON.stringify(table, null, 1));

  console.log('the family app\'s sign-in');
  for (const [w, h, nm] of SIZES) for (const lang of ['he', 'en']) {
    const c = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    await c.addInitScript(l => localStorage.setItem('sff_lang', l), lang);
    const p = await c.newPage(); p.on('pageerror', e => errs.push(e.message)); await p.goto(APP, { waitUntil: 'load' });
    await p.waitForSelector('#fbLogin', { timeout: 20000 }); await p.waitForTimeout(800);
    const r = await p.evaluate(() => { const H = innerHeight, cut = [...document.querySelectorAll('#fbLogin .fbcard, #fbLogin .fbad')].filter(x => x.offsetParent !== null).filter(x => { const q = x.getBoundingClientRect(); return q.top < H && q.bottom > H + 1; }).map(x => x.id || x.className);
      const ad = document.querySelector('#fbLogin .fbad'), link = document.getElementById('fbTeachLink');
      return { cut, ad: !!(ad && ad.offsetParent), link: !!(link && link.offsetParent), linkIn: link && link.offsetParent ? link.getBoundingClientRect().bottom <= H : null, linkH: link && link.offsetParent ? Math.round(link.getBoundingClientRect().height) : 0, text: link ? link.innerText : '' }; });
    const short = h < 700;
    ok(!r.cut.length && (short ? (r.link && !r.ad && r.linkH >= 44) : (r.ad && !r.link)), `${nm} ${w}×${h} ${lang}: no card cut in half; ${short ? 'one link instead of the teachers\' card' : 'the teachers\' card'} ` + JSON.stringify(r));
    if (SHOTS && [664, 548].includes(h)) await p.screenshot({ path: `${OUT}/ios_login_${lang}_${w}x${h}.png` });
    await c.close();
  }
  ok(!errs.length, 'no page errors ' + JSON.stringify(errs.slice(0, 5)));
  await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
