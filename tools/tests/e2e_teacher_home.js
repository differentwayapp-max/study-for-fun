// The teachers' app home ("היום"), on the emulators (functions, firestore, auth):
// 1. the school's world: 27 students in different states, an assignment due in 2 days, 3 waiting requests →
//    "3 things for today" = stuck on one topic · the requests · the reminder (in that order); the circles' colours; a circle opens
//    its student; the WhatsApp reminder has no kid's name; the active assignment; the weakest topics; the 4 tabs + the floating button;
// 2. the private world: no lessons → "מתי השיעורים?"; fixed lessons → the next lesson (and the week's roll-over); "since the last
//    lesson" counts only the games after it; my week; the students' cards;
// 3. a new group: the 3 steps by what is there, then the full home by itself;
// 4. performance: 40 students × 300 games, 360 wide, CPU ×4 – the time until the home shows.
// Screenshots (OUT): the three homes, both worlds, Hebrew + English, 360 and 320.
const { chromium } = require('playwright');
const APP = 'http://localhost:8765/', OUT = process.env.OUT || require('os').tmpdir();
const FS = 'http://127.0.0.1:8080', PROJ = 'study-for-fun-7b03c', DOCS = `${FS}/v1/projects/${PROJ}/databases/(default)/documents`;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) process.exitCode = 1; };
const enc = v => v === null || v === undefined ? { nullValue: null } : typeof v === 'boolean' ? { booleanValue: v } : typeof v === 'number' ? (Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v })
  : typeof v === 'string' ? { stringValue: v } : Array.isArray(v) ? { arrayValue: { values: v.map(enc) } } : { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, enc(x)])) } };
const put = (path, obj) => fetch(`${DOCS}/${path}`, { method: 'PATCH', headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, enc(v)])) }) }).then(r => r.status);
const NAMES = ['נועה כהן', 'יונתן בר', 'מאיה שלו', 'איתי רון', 'אורי לוי', 'תמר גל', 'דניאל אור', 'שירה טל', 'עומר נוי', 'ליה פז', 'אדם שחר', 'רוני קם', 'הילה דן', 'גיא בן', 'נטע רז', 'עידו שם', 'מיקה אל', 'יואב חן', 'אלה ים', 'בן גור', 'שקד נור', 'אריאל טוב', 'יעל זך', 'נדב כץ', 'רותם עז', 'אביב לב', 'זוהר רם'];
(async () => {
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights'] });
  const errs = [];
  const GOOGLE = { sub: 'teacherH', email: 'teacherh@t.local', email_verified: true, name: 'דנה לוי' };
  const ctx = async (o = {}) => { const c = await b.newContext({ viewport: { width: o.w || 360, height: o.h || 780 }, deviceScaleFactor: o.dpr || 1 });
    await c.addInitScript(([g, l]) => { window.SFF_TEACH_LINKS = true; window.SFF_REST_EMU = { fs: 'http://127.0.0.1:8080', auth: 'http://127.0.0.1:9099' }; window.SFF_TEST_GOOGLE = g; localStorage.setItem('sff_lang', l); }, [o.google || GOOGLE, o.lang || 'he']); return c; };
  const home = async p => { await p.evaluate(() => { go('kids'); }); await p.waitForTimeout(500); };
  // a group's data, written as the server would (the emulator's owner): students, consents, games, an assignment
  const seed = async (p, cid, plan, asg) => {
    const out = await p.evaluate(async ([plan, asg]) => {
      const t = (await (await fetch('/share/en3-0e3c80.txt')).text()).trim().slice(5);
      const S = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(t), c => c.charCodeAt(0))));
      const chs = [...new Set(S.questions.map(q => q.ch))].filter(c => S.questions.filter(q => q.ch === c).length >= 6).slice(0, 3);
      const qs = S.questions.filter(q => chs.includes(q.ch)).map(q => ({ ...q, ch: chs.indexOf(q.ch) }));
      const now = Date.now(), day = 864e5, id = 'asg1';
      const set = { ...S, id, questions: qs, chapters: chs.map(c => S.chapters[c]), grp: 1, cloud: true, created: now - 5 * day };
      delete set.qa; delete set.v; delete set.kidId; delete set.name;
      if (asg) { const due = new Date(now + asg.due * day); due.setHours(12, 0, 0, 0); set.to = 'all'; set.due = due.toISOString().slice(0, 10); set.examDate = set.due; set.ass = { by: 'x', at: now - 3 * day }; set.title = 'Letters & sounds'; }
      const prog = {};
      plan.forEach(([kid, games], ki) => { const H = [];   /* (each kid's games a few seconds apart – the app tells games apart by time + set) */
        games.forEach(([ago, ch, right]) => { const g = qs.filter(q => q.ch === ch).slice(0, 10), by = {}, qr = [], qk = [];
          g.forEach((q, j) => { const ok = j < right, i = qs.indexOf(q); by[q.topic] = by[q.topic] || { r: 0, n: 0 }; by[q.topic].n++; if (ok) by[q.topic].r++;
            const pick = ok ? null : (q.answer + 1) % q.options.length; qr.push(i + '.' + (ok ? 1 : 0) + (pick == null ? '' : '.' + pick)); qk.push(tkey(q.question) + (pick == null ? '' : ':' + tkey(q.options[pick]))); });
          H.push({ at: Math.round(now - ago * day) - ki * 1000 - H.length * 7, kidId: kid, kid: '', subject: set.subject, grade: set.grade, setId: id, retry: false, topic: set.chapters[ch] && set.chapters[ch].title || '', ch, right, n: g.length, score: right * 10, mode: 'choice', qr, qk, topics: by }); });
        H.sort((a, b) => b.at - a.at); prog[kid] = { history: H, profile: {} }; });
      return { set, prog, topic0: qs.find(q => q.ch === 0).topic };
    }, [plan, asg]);
    const kidsList = plan.map(([kid], i) => ({ id: kid, name: (plan[i][2] || NAMES[i % NAMES.length]), grade: 2, color: '#2F6BFF' }));
    await put(`families/${cid}/fam/kids`, { list: kidsList });
    for (const k of kidsList) { await put(`families/${cid}/consents/${k.id}`, { status: 'digital', letterV: '0.91', at: Date.now(), parentName: 'הורה של ' + k.name, contact: '050-1234567' });
      await put(`families/${cid}/kidpub/${k.id}`, { list: [{ id: k.id, name: k.name, grade: 2 }] }); if (out.prog[k.id].history.length) await put(`families/${cid}/progress/${k.id}`, out.prog[k.id]); }
    if (asg) await put(`families/${cid}/sets/asg1`, { set: out.set });
    return out;
  };

  console.log('1. the school\'s world');
  const tc = await ctx(), T = await tc.newPage(); T.on('pageerror', e => errs.push('teacher: ' + e.message));
  await T.goto(APP + 'teach', { waitUntil: 'load' }); await T.waitForSelector('#fbGo'); await T.click('#fbGo');
  await T.waitForSelector('#tsClass'); await T.click('#tsClass'); await T.fill('#tsName', "ד'2"); await T.selectOption('#tsSubj', { label: 'אנגלית' }).catch(() => {}); await T.click('#tsGo');
  await T.waitForFunction(() => window.SFF_KIND === 'class' && window.SFF_ROLE, null, { timeout: 25000 }); await T.waitForTimeout(1500);
  const cid = await T.evaluate(() => window.__sffFamily.famId);
  // 5 stuck on the first chapter's topic (twice 1/10) · 4 never played · 10 strong (all 3 chapters, 10/10) · 8 so-so (one chapter, 7/10)
  const plan = [];
  for (let i = 0; i < 27; i++) { const kid = 's' + String(i + 1).padStart(2, '0');
    plan.push([kid, i < 5 ? [[0.3, 0, 1], [0.2, 0, 1]] : i < 9 ? [] : i < 19 ? [[3, 0, 10], [2, 1, 10], [1, 2, 10]] : [[2, 1, 7]]]); }
  const sd = await seed(T, cid, plan, { due: 2 });
  for (const [i, n] of [[1, 'רון א.'], [2, 'גל ב.'], [3, 'שי ג.']]) await put(`families/${cid}/joinReqs/r${i}`, { status: 'pending', kidName: n, parentName: 'הורה ' + n, at: Date.now() - i * 3600e3, letterV: '0.91' });
  await T.reload({ waitUntil: 'load' });   // (a teacher opening the app with the data there)
  await T.waitForFunction(() => window.SFF_ROLE && trStudents().length === 27 && sets.some(isAsg) && history.length >= 48 && CLS.reqs.length === 3, null, { timeout: 60000 }).catch(() => {});
  await home(T);
  const H1 = await T.evaluate(() => ({ todo: [...document.querySelectorAll('.thtodo')].map(x => [x.className.replace(/.*t-/, ''), x.innerText.replace(/\s+/g, ' ')]),
    open: document.querySelector('.thopen')?.innerText.replace(/\s+/g, ' '), dots: document.querySelectorAll('.thdot').length,
    lv: Object.fromEntries([...document.querySelectorAll('.thdot')].map(d => [d.getAttribute('aria-label'), d.className.replace(/.*l-/, '')])) }));
  ok(H1.todo.map(x => x[0]).join() === 'stuck,reqs,remind', '"3 things for today": stuck · requests · reminder – ' + H1.todo.map(x => x[0]).join());
  ok(/^5 תלמידים נתקעו ב/.test(H1.todo[0][1].replace(/^\S+ /, '')) || /5 תלמידים נתקעו ב/.test(H1.todo[0][1]), 'stuck: 5 students on one topic – ' + H1.todo[0][1].slice(0, 80));
  ok(H1.todo[0][1].includes(sd.topic0) && /ועוד 2/.test(H1.todo[0][1]) && /שליחת תרגול ממוקד ל-5/.test(H1.todo[0][1]), '…its topic, 3 names + "ועוד 2", "שליחת תרגול ממוקד ל-5"');
  ok(/3 בקשות הצטרפות מחכות/.test(H1.todo[1][1]) && /לאשר את הבקשות/.test(H1.todo[1][1]), 'the requests: 3 waiting → "לאשר את הבקשות"');
  ok(/4 עוד לא התחילו את המשימה/.test(H1.todo[2][1]) && /נשארו 2 ימים|יומיים/.test(H1.todo[2][1]) && /תזכורת להורים בוואטסאפ/.test(H1.todo[2][1]), 'the reminder: 4 did not start · 2 days left – ' + H1.todo[2][1].slice(0, 90));
  const wa = await T.evaluate(() => decodeURIComponent(document.querySelector('.t-remind a').href.split('text=')[1] || ''));
  ok(/Letters & sounds/.test(wa) && !(await T.evaluate(t => trStudents().some(k => t.includes(k.name.split(' ')[0])), wa)), 'the WhatsApp reminder: the assignment and its date – no kid\'s name: ' + wa.replace(/\n/g, ' | '));
  ok(/השבוע 23 מתוך 27 תלמידים תרגלו\. 5 מהם צריכים אותך היום\./.test(H1.open) || /השבוע 23 מתוך 27 תלמידים תרגלו/.test(H1.open), 'the opening card: who practised this week, who needs you – ' + (H1.open || '').slice(0, 120));
  ok(/85%/.test(H1.open), 'the ring: 23/27 = 85% practised');
  const L = H1.lv;
  const lv = i => L[Object.keys(L).find(k => k.startsWith(NAMES[i] + ' –'))];
  ok(H1.dots === 27 && lv(0) === 'r' && lv(5) === 'n' && lv(9) === 'g' && lv(19) === 'o', `the circles: 27 – stuck red, never played dashed, strong green, so-so yellow (${lv(0)},${lv(5)},${lv(9)},${lv(19)})`);
  const legend = await T.evaluate(() => document.querySelector('.thleg').innerText.replace(/\s+/g, ' '));
  ok(/שולט\/ת · 10/.test(legend) && /כמעט · 8/.test(legend) && /צריך\/ה עזרה · 5/.test(legend) && /לא תרגל\/ה · 4/.test(legend), 'the legend counts: ' + legend);
  await T.evaluate(n => [...document.querySelectorAll('.thdot')].find(d => d.getAttribute('aria-label').startsWith(n)).click(), NAMES[9]); await T.waitForTimeout(400);
  ok(await T.evaluate(n => !document.getElementById('tDlg').classList.contains('hidden') && document.querySelector('#tDlg h2').textContent.includes(n), NAMES[9]), 'a circle opens its student\'s card');
  await T.evaluate(() => tClose());
  const act = await T.evaluate(() => document.querySelector('.thasg')?.innerText.replace(/\s+/g, ' '));
  ok(/Letters & sounds/.test(act) && /סיימו 10/.test(act) && /באמצע 13/.test(act) && /לא התחילו 4/.test(act), 'the active assignment: done 10 · in the middle 13 · not started 4 – ' + act);
  ok(await T.evaluate(() => document.querySelectorAll('.thtop').length >= 1), 'where the class stands: the weakest topics');
  const nav = await T.evaluate(() => ({ tabs: [...document.querySelectorAll('#bNav button')].map(b => b.innerText.replace(/\s+/g, ' ').trim()), fab: getComputedStyle(document.getElementById('thFab')).display, sel: document.querySelector('.thsel')?.innerText, bell: document.querySelector('.thbell i')?.textContent }));
  ok(nav.tabs.join('|').replace(/[^֐-׿|]/g, '') === 'היום|תלמידים|המשימות|דוחות' && nav.fab !== 'none' && /ד'2/.test(nav.sel) && nav.bell === '3', 'the tabs: היום · תלמידים · משימות · דוחות, the floating "+ משימה חדשה", the group selector and the bell (3)');
  await T.screenshot({ path: `${OUT}/th_school_he360.png`, fullPage: true });
  await T.click('.thbell'); await T.waitForTimeout(500);
  ok(await T.evaluate(() => !document.getElementById('vTStud').classList.contains('hidden') && document.querySelectorAll('#vTStud .treq').length === 3), 'the bell → the students tab with the 3 requests');
  await T.evaluate(() => thTab('asg')); await T.waitForTimeout(300);
  ok(await T.evaluate(() => !document.getElementById('vTAsg').classList.contains('hidden') && /Letters/.test(document.getElementById('vTAsg').innerText)), 'the assignments tab');
  await T.click('.thsel'); await T.waitForTimeout(400);
  ok(await T.evaluate(() => !document.getElementById('vPlaces').classList.contains('hidden')), 'the group selector → the class picker');
  await home(T);

  console.log('2. the private world');
  const pid = await T.evaluate(() => window.__sffNewClass({ teach: 'private', name: 'פרטי', grade: 4, subject: 'אנגלית' }));
  await T.evaluate(id => window.__sffFamily.switchTo(id), pid); await T.waitForFunction(() => (window.SFF_CLASS || {}).teach === 'private' && window.SFF_ROLE, null, { timeout: 25000 });
  const pplan = [['p1', [[8, 0, 9], [1, 0, 3], [1.1, 1, 9]], 'ליאור'], ['p2', [[2, 1, 8]], 'מאיה'], ['p3', [], 'עמית']];
  await seed(T, pid, pplan, { due: 6 });
  await T.waitForFunction(() => trStudents().length === 3 && sets.some(isAsg), null, { timeout: 30000 }).catch(() => {}); await home(T);
  ok(await T.evaluate(() => /מתי השיעורים/.test(document.querySelector('.thopen').innerText) && document.documentElement.classList.contains('wpriv')), 'no fixed lessons → "מתי השיעורים?" (purple)');
  await T.screenshot({ path: `${OUT}/th_private_nolessons_he360.png`, fullPage: true });
  // p1: a lesson today, 3 hours from now (so the last one was 7 days ago, less 3 hours); p2: tomorrow
  const nowD = new Date(), inH = new Date(Date.now() + 3 * 3600e3), hm = d => String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  const same = inH.getDay() === nowD.getDay();
  await put(`families/${pid}/sched/p1`, { slots: [{ d: inH.getDay(), t: hm(inH) }], from: Date.now() - 30 * 864e5, last: 0, upd: 0 });
  await put(`families/${pid}/sched/p2`, { slots: [{ d: (nowD.getDay() + 1) % 7, t: '16:00' }], from: Date.now() - 30 * 864e5, last: 0, upd: 0 });
  await T.waitForFunction(() => Object.keys(CLS.sched || {}).length === 2, null, { timeout: 20000 }).catch(() => {}); await home(T);
  const P = await T.evaluate(() => document.querySelector('.thopen').innerText.replace(/\s+/g, ' '));
  ok(/השיעור הבא/.test(P) && /ליאור/.test(P) && (same ? /היום/.test(P) : /מחר/.test(P)) && /בעוד (3 שעות|שעתיים)/.test(P), 'the next lesson: ליאור, today, in 3 hours – ' + P.slice(0, 90));
  ok(/מאז השיעור הקודם: 2 משחקים/.test(P), '"since the last lesson" counts only the games after it (2 of 3) – ' + (P.match(/מאז השיעור הקודם:[^.]*/) || [''])[0]);
  ok(/כדאי לעבוד היום על/.test(P), 'what to work on today (the weakest topic since the last lesson)');
  const roll = await T.evaluate(() => { const now = Date.now(), d = new Date(now - 3600e3), t = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    const n = nextLesson({ slots: [{ d: d.getDay(), t }] }, now); return Math.round((n - now) / 3600e3); });
  ok(roll === 167, 'a lesson an hour ago → the next one in a week (167 hours): ' + roll);
  const wk = await T.evaluate(() => [...document.querySelectorAll('.thday')].map(d => d.innerText.replace(/\s+/g, ' ')));
  ok(wk.length === 5 && (new Date().getDay() >= 5 || wk.some(x => /ליאור/.test(x))), 'my week: 5 days (Sun–Thu) with the lessons (ליאור\'s is today – not on the list on Friday / Saturday) – ' + wk.join(' | '));
  const kc = await T.evaluate(() => [...document.querySelectorAll('.thkid')].map(x => x.innerText.replace(/\s+/g, ' ')));
  ok(kc.length === 3 && kc.some(x => /עמית/.test(x) && /לא תרגל/.test(x)), 'the students\' cards: 3, "לא תרגל/ה" for one who never played');
  await T.screenshot({ path: `${OUT}/th_private_he360.png`, fullPage: true });
  const ptabs = await T.evaluate(() => [...document.querySelectorAll('#bNav button')].map(b => b.innerText.replace(/[^֐-׿]/g, '')).join('|'));
  ok(ptabs === 'היום|שיעורים|תלמידים|דוחות', 'the private tabs: היום · שיעורים · תלמידים · דוחות');

  console.log('3. a new group');
  const nid = await T.evaluate(() => window.__sffNewClass({ teach: 'class', name: 'ה׳3', grade: 4, subject: 'אנגלית' }));
  await T.evaluate(id => window.__sffFamily.switchTo(id), nid); await T.waitForFunction(() => (window.SFF_CLASS || {}).name === 'ה׳3' && window.SFF_ROLE, null, { timeout: 25000 }); await home(T); await T.waitForTimeout(1500);
  const st = () => T.evaluate(() => [...document.querySelectorAll('.thstep')].map(x => x.classList.contains('done') ? 1 : 0).join(''));
  await T.waitForSelector('#thQR svg', { timeout: 30000 }).catch(() => {}); await T.waitForSelector('.threc', { timeout: 10000 }).catch(() => {});
  ok(await st() === '100' && await T.evaluate(() => document.querySelectorAll('.threc').length >= 1 && !!document.querySelector('#thQR svg')), 'the 3 steps: only "opened" done; the QR and the catalog picks are there');
  await T.screenshot({ path: `${OUT}/th_new_he360.png`, fullPage: true });
  await put(`families/${nid}/joinReqs/n1`, { status: 'pending', kidName: 'חדש', parentName: 'הורה', at: Date.now(), letterV: '0.91' });
  await T.waitForFunction(() => CLS.reqs.length === 1, null, { timeout: 20000 }).catch(() => {}); await home(T);
  ok(await st() === '110', 'a request came in → step 2 done');
  await seed(T, nid, [['n1', [[1, 0, 8]], 'חדש']], { due: 5 });
  await T.waitForFunction(() => trStudents().length === 1 && sets.some(isAsg), null, { timeout: 30000 }).catch(() => {}); await T.waitForTimeout(800);
  ok(await T.evaluate(() => !document.querySelector('.thstep') && !!document.querySelector('.thopen .thring')), 'a first student and a first assignment → the full home, by itself');

  console.log('4. screenshots: English, 320');
  for (const [w, lang] of [[360, 'he'], [360, 'en'], [320, 'he'], [320, 'en']]) {
    const c = await ctx({ w, h: 1700, lang, dpr: 2 }), p = await c.newPage(); p.on('pageerror', e => errs.push(`${lang}${w}: ` + e.message));
    for (const [id, tag] of [[cid, 'school'], [pid, 'private'], [nid, 'new']]) {
      await p.addInitScript(i => { try { localStorage.setItem('sff_active_teach', i); } catch (e) {} }, id);
      await p.goto(APP + 'teach', { waitUntil: 'load' }); await p.waitForFunction(() => document.querySelector('#fbLogin #fbGo') || window.SFF_ROLE, null, { timeout: 25000 }); if (await p.$('#fbLogin #fbGo')) await p.click('#fbLogin #fbGo');
      await p.waitForFunction(i => window.__sffFamily && window.__sffFamily.famId === i && window.SFF_ROLE, id, { timeout: 25000 }); await p.waitForTimeout(3500); await home(p);
      const wide = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      ok(!wide, `${tag} ${lang} ${w}: nothing wider than the screen`);
      if (lang === 'en') { const heb = (await p.evaluate(() => document.getElementById('vKids').innerText + ' ' + document.getElementById('bNav').innerText)).match(/[^\s]*[֐-׿][^\s]*/g) || [];
        const known = NAMES.concat(['ליאור', 'מאיה', 'עמית', 'חדש', "ד'2", 'ה׳3', 'פרטי', 'דנה', 'רון א.', 'גל ב.', 'שי ג.']).flatMap(n => n.split(' ')).map(n => n.replace(/[.׳']/g, ''));   /* names and initials are content */
        const left = heb.filter(x => !(/^[\u0590-\u05FF][.׳',]*$/.test(x) || known.some(n => n.length > 1 && x.includes(n))));
        ok(left.length <= 2, `${tag} English: no Hebrew left but names (${left.slice(0, 8).join(' ')})`); }
      await p.screenshot({ path: `${OUT}/th_${tag}_${lang}${w}.png` });
    }
    await c.close();
  }

  console.log('5. performance: 40 students × 300 games, 360, CPU ×4');
  {
    const big = await T.evaluate(() => window.__sffNewClass({ teach: 'class', name: 'גדולה', grade: 2, subject: 'אנגלית' }));
    const bp = []; for (let i = 0; i < 40; i++) { const g = []; for (let j = 0; j < 300; j++) g.push([j * 0.1 + 0.05, j % 3, 4 + (i + j) % 7]); bp.push(['b' + i, g, 'תלמיד ' + i]); }
    await seed(T, big, bp, { due: 3 });
    const c = await ctx({ w: 360, h: 780 }), p = await c.newPage(); const cdp = await c.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await p.addInitScript(i => { try { localStorage.setItem('sff_active_teach', i); } catch (e) {} }, big);
    const t0 = Date.now(); await p.goto(APP + 'teach', { waitUntil: 'load' }); await p.waitForSelector('#fbLogin #fbGo', { timeout: 30000 }); await p.click('#fbLogin #fbGo');
    await p.waitForFunction(() => document.querySelectorAll('.thdot').length === 40 && history.length >= 12000, null, { timeout: 180000 }).catch(() => {});
    const ms = Date.now() - t0, rt = await p.evaluate(() => { const a = performance.now(); renderTeacherHome(); return Math.round(performance.now() - a); });
    console.log(`    opening (sign-in → the home with 40 circles): ${(ms / 1000).toFixed(1)} s · one render of the home: ${rt} ms (CPU ×4)`);
    ok(await p.evaluate(() => document.querySelectorAll('.thdot').length === 40), `40 × 300: the home shows (${(ms / 1000).toFixed(1)} s; render ${rt} ms)`);
    await c.close();
  }
  ok(!errs.length, 'no page errors ' + errs.slice(0, 3).join(' | '));
  await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
