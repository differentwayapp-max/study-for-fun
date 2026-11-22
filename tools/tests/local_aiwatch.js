// An AI call that never answers must not hold a build forever (iPhone cuts the connection when the screen locks):
// 1. a call that was in the background for more than 30 s counts as lost when the app comes back;
// 2. a call with no answer after 8 minutes (wall clock) ends as too slow; a short trip to the background does not;
// 3. a normal answer passes; the answer check's parallel runner keeps the order and runs at most 3 at a time;
// 4. the build screen shows a running clock next to the working step; 5. the screen stays on while a build is sent (Wake Lock). Run with the app served on :8765.
const { chromium } = require('playwright');
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) process.exitCode = 1; };
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext()).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8765/', { waitUntil: 'load' }); await p.waitForTimeout(1500);
  const r = await p.evaluate(async () => {
    let hidden = false; Object.defineProperty(document, 'hidden', { get: () => hidden, configurable: true });
    let shift = 0; const real = Date.now; Date.now = () => real() + shift;
    const setHidden = h => { hidden = h; document.dispatchEvent(new Event('visibilitychange')); };
    const outcome = pr => pr.then(v => 'ok:' + v, e => 'err:' + (e && e.code));
    const never = () => new Promise(() => {});
    const res = {};
    { const o = outcome(aiWatch(never())); setHidden(true); shift += 31e3; setHidden(false); res.lost = await o; }
    { const o = outcome(aiWatch(never())); setHidden(true); shift += 5e3; setHidden(false);
      const quick = await Promise.race([o, new Promise(r => setTimeout(() => r('still waiting'), 300))]); res.short = quick;
      shift += 8 * 60e3 + 1e3; setHidden(true); setHidden(false); res.slow = await o; }
    res.normal = await outcome(aiWatch(Promise.resolve(7)));
    let now = 0, most = 0;
    res.order = (await pmap([5, 1, 4, 2, 3, 0], 3, async (x) => { now++; most = Math.max(most, now); await new Promise(r => setTimeout(r, x * 20)); now--; return x * 10; })).join();
    res.most = most;
    Date.now = real;
    document.getElementById('fbLogin')?.remove(); if (!document.getElementById('st_qa')) document.getElementById('vBuild').insertAdjacentHTML('beforeend', '<ul><li id="st_qa" data-n="4"><span class="ic"></span><span class="d"></span></li></ul>');
    show('vBuild'); setStep('qa', 'run', 'בודקים את התשובות…');
    await new Promise(r => setTimeout(r, 2300));
    res.clock = document.querySelector('#st_qa .tm')?.textContent || '';
    setStep('qa', 'done', '✓'); res.clockGone = !document.querySelector('#st_qa .tm');
    // the screen stays on while a build runs, and is let go after
    let req = 0, rel = 0; Object.defineProperty(navigator, 'wakeLock', { value: { request: async () => { req++; const l = new EventTarget(); l.release = async () => { rel++; }; return l; } }, configurable: true });
    await wakeOn(); const held = req === 1; wakeOff(); res.wake = held && rel === 1;
    return res;
  });
  ok(r.lost === 'err:lost', 'in the background for more than 30 s → lost (' + r.lost + ')');
  ok(r.short === 'still waiting', 'a short trip to the background: still waiting');
  ok(r.slow === 'err:ai_slow', 'no answer after 8 minutes → too slow (' + r.slow + ')');
  ok(r.normal === 'ok:7', 'a normal answer passes');
  ok(r.order === '50,10,40,20,30,0' && r.most === 3, `parallel runner: order kept (${r.order}), at most 3 at a time (${r.most})`);
  ok(/^⏱ 0:0[1-3]$/.test(r.clock) && r.clockGone, `a running clock next to the working step (${r.clock}), gone when done`);
  ok(r.wake, 'the screen is kept on while the build is sent, and let go after');
  ok(!errs.length, 'no page errors ' + JSON.stringify(errs));
  await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
