// First F&F feedback, round 1: "מושלם" only on 10/10; the 1-4 mark stays visible on a wrong answer; the mistakes button
// counts the open mistakes; an updated set (options in another order) still shows the kid's real wrong answer; connect-with-lines
// has no red-like colour for right lines and says what to do; mute also stops reading aloud; a name says how many characters
// are left; the last map station is "חזרה על הכול"; a kid cannot rename themself; editing a kid stays on that kid's card.
const { chromium } = require('playwright');
const OUT = process.env.OUT || require('os').tmpdir();   // screenshots never land in the repo
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => localStorage.setItem('sff_lang', 'he'));
  await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(1800); await p.evaluate(() => document.getElementById('fbLogin')?.remove());
  const r = await p.evaluate(async () => {
    const out = {};
    const s = await loadShare('math3'); s.id = 'r1'; s.questions = s.qs; s.kidId = 'k1';
    kids.push({ id: 'k1', name: 'נועה', grade: 2, color: '#FF5C8A' }, { id: 'k2', name: 'בן', grade: 6, color: '#2F6BFF' }); sets.push(s);
    // 11: 9/10 is not "perfect"
    startGame(s, null, 'choice', 0); G.res = G.qs.slice(0, 10).map((q, k) => ({ q, ok: k > 0 })); endGame(); out.t9 = $('eTitle').textContent;
    startGame(s, null, 'choice', 0); G.res = G.qs.slice(0, 10).map(q => ({ q, ok: true })); endGame(); out.t10 = $('eTitle').textContent;
    // 12: a wrong answer keeps its number visible
    startGame(s, null, 'choice', 1); const q = curQ(), wrong = (q.answer + 1) % 4; choicePick(wrong);
    const key = document.querySelectorAll('.opt')[wrong].querySelector('.key'); out.keyColor = getComputedStyle(key).color; out.keyBg = getComputedStyle(key).backgroundColor;
    // 9 + 10: the set is updated (options reordered): the mistake still shows the option the kid really picked
    const qi = s.questions.indexOf(q), picked = q.options[wrong];
    history.unshift({ at: Date.now(), kidId: 'k1', setId: 'r1', ch: 1, right: 0, n: 1, mode: 'choice', qr: [`${qi}.0.${wrong}`], qk: [tkey(q.question) + ':' + tkey(picked)], topics: {} });
    q.options = [...q.options].reverse(); q.answer = 3 - q.answer;                  // the update
    const m = mistakesOf(s, history).find(x => x.i === qi); out.shownWrong = q.options[m.lastWrong.pick]; out.picked = picked;
    // an old record (no keys) whose pick now points at the right answer: no wrong answer is shown
    history.unshift({ at: Date.now() + 1, kidId: 'k1', setId: 'r1', ch: 2, right: 0, n: 1, mode: 'choice', qr: [`${s.questions.indexOf(G.qs[1] || s.questions[30])}.0.${(G.qs[1] || s.questions[30]).answer}`], topics: {} });
    out.oldPick = mistakesOf(s, history).find(x => x.i === s.questions.indexOf(G.qs[1] || s.questions[30])).lastWrong.pick;
    // later the kid answers it right → the button counts open mistakes only
    history.unshift({ at: Date.now() + 2, kidId: 'k1', setId: 'r1', ch: 1, right: 1, n: 1, mode: 'choice', qr: [`${qi}.1`], qk: [tkey(q.question)], topics: {} });
    go('stats'); renderStats(); out.mbtn = document.querySelector('.mistbtn')?.textContent.replace(/\s+/g, ' ').trim();
    // 17: connect-with-lines
    out.lineColors = LINE_COLORS; startGame(s, null, 'match', 0); out.howto = $('gTop').textContent.trim();
    // 8: mute stops reading aloud
    MUTE = true; let spoke = 0; const orig = speechSynthesis.speak.bind(speechSynthesis); speechSynthesis.speak = () => { spoke++; };
    startGame(s, null, 'choice', 0); speakQ(); out.mutedSpoke = spoke; MUTE = false; speakQ(); out.unmutedSpoke = spoke; speechSynthesis.speak = orig;
    // 15: the name limit is said before it cuts
    go('kids'); const nm = $('kfName'); nm.value = 'אבגדהוזחטיכלמנסעפצ'; nameLeft(nm); out.left = nm.parentElement.querySelector('.nameleft').textContent;
    // 19: the last station
    curSet = s; openRoad(s.id); out.rev = [...document.querySelectorAll('#rdMap text')].map(t => t.textContent).filter(t => /חזרה/.test(t));
    // 23: the kid's profile name cannot be edited
    activeKid = 'k1'; openProfile && openProfile(); out.pfRead = $('pfName').readOnly;
    // 4 + 5: edit the second kid in place
    go('kids'); carGo('kidCar', 1); openKidEdit('k2'); $('keName').value = 'בני'; $('keGrade').value = 5; saveKidEdit();
    await new Promise(r => setTimeout(r, 300));
    out.edited = { name: kidById('k2').name, grade: kidById('k2').grade, dlg: $('kidEditDlg').classList.contains('hidden') };
    openKidEdit('k1'); out.fresh = { name: $('keName').value, grade: +$('keGrade').value }; $('kidEditDlg').classList.add('hidden');   // another kid: its own values, not the last one's
    return out;
  });
  await p.waitForTimeout(400);
  const cur = await p.evaluate(() => document.querySelector('#kidCar .carnav button.on, #kidCar [aria-current="true"]')?.textContent || null);
  if (OUT) { await p.evaluate(() => openKidEdit('k1')); await p.waitForTimeout(300); await p.screenshot({ path: `${OUT}/kid_edit.png` }); }
  console.log(JSON.stringify({ ...r, cur }, null, 1));
  const ok = r.t9 === 'כמעט מושלם!' && r.t10 === 'מושלם!' && r.keyColor !== r.keyBg && r.shownWrong === r.picked && r.oldPick === null
    && /ועוד \d+ תוקנו/.test(r.mbtn || '') && !r.lineColors.includes('#FF5C8A') && /לוחצים על שאלה/.test(r.howto)
    && r.mutedSpoke === 0 && r.unmutedSpoke === 1 && /נשארו/.test(r.left) && r.rev.some(t => /חזרה על הכול/.test(t)) && r.pfRead
    && r.edited.name === 'בני' && r.edited.grade === 5 && r.edited.dlg && r.fresh.name === 'נועה' && r.fresh.grade === 2;
  if (!ok) errs.push('round 1');
  console.log(JSON.stringify({ errs })); await b.close(); process.exit(errs.length ? 1 : 0);
})().catch(e => { console.error('FAIL', e); process.exit(1); });
