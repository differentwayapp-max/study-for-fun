// The store version is for families only (TEACH_LINKS off, the owner's decision 28.11): the family app has no way into the
// teachers' app – no ad / link on the sign-in screen, no ☰ link (even for an adult who teaches), no "private tutor" in the
// invitation, no teacher in the intro / store screens. With window.SFF_TEACH_LINKS = true everything comes back.
// Usage: the app served on 8765 → node tools/tests/local_family_only.js
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errs = [], out = {};
  for (const on of [false, true]) {
    const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
    p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(([on]) => { localStorage.setItem('sff_lang', 'he'); if (on) window.SFF_TEACH_LINKS = true; }, [on]);
    await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForSelector('#fbLogin', { timeout: 15000 }).catch(() => {});
    out[on] = await p.evaluate(async () => {
      const L = document.getElementById('fbLogin'), txt = L ? L.innerText : '';
      const login = { shown: !!L, teachLink: !!document.querySelector('#fbTeachLink,#fbTeachAd'), teacherWord: /מורה/.test(txt) };
      L?.remove(); document.getElementById('sffLoad')?.remove();
      kids.push({ id: 'k1', name: 'נועה', grade: 3, color: '#FF5C8A' });
      window.SFF_TEACHER = true; openMenu(); const menu = !!document.getElementById('dOtherApp'); closeMenu && closeMenu();
      openInvite(); const roles = document.getElementById('invRoles').innerText; document.getElementById('invDlg').classList.add('hidden');
      const intro = ['main', 'start', 'family'].map(k => { const d = document.createElement('div'); d.innerHTML = introCard(k, false, true).html; return d.textContent; }).join(' ');
      return { login, menu, tutorRole: /מורה/.test(roles), introTeacher: /מורה/.test(intro.replace(/שמורה/g, '')) };
    });
    await p.close();
  }
  // a teacher's links (joining a group / a parent's status page) open only the "soon" note – no anonymous sign-in, no request
  for (const q of ['join=AbCdEfGhIjKlMnOpQrSt.0123456789abcdef', 'req=AbCdEfGhIjKlMnOpQrSt.ZyXwVuTsRqPoNmLkJiHg.0123456789abcdef0123']) {
    const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(() => localStorage.setItem('sff_lang', 'he'));
    await p.goto('http://localhost:8765/?' + q, { waitUntil: 'load' }); await p.waitForSelector('#teachSoon', { timeout: 15000 }).catch(() => {});
    out[q.slice(0, 4)] = await p.evaluate(() => ({ soon: !!document.getElementById('teachSoon'), text: document.getElementById('teachSoon')?.innerText || '', form: !!document.querySelector('#joinPage canvas, #joinPage input'), login: !!document.getElementById('fbLogin') }));
    await p.close();
  }
  console.log(JSON.stringify(out, null, 1));
  const off = out[false], on = out[true];
  const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) errs.push(m); };
  ok(off.login.shown && !off.login.teachLink && !off.login.teacherWord, 'sign-in: no teacher card, ad or link');
  ok(!off.menu, '☰: no "to the teachers\' app" (also for an adult who teaches)');
  ok(!off.tutorRole, 'invitation: no "private tutor" role');
  ok(!off.introTeacher, 'intro / store screens: no teacher');
  for (const k of ['join', 'req=']) { const j = out[k]; ok(j && j.soon && /תיפתח בקרוב/.test(j.text) && !j.form && !j.login, `a teacher's ${k.replace('=', '')} link: only "joining a teacher's group opens soon"`); }
  ok(on.login.teachLink && on.menu && on.tutorRole && on.introTeacher, 'SFF_TEACH_LINKS = true: all of them come back');
  console.log(JSON.stringify({ errs })); await b.close(); process.exit(errs.length ? 1 : 0);
})();
