const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route(/gstatic\.com\/firebasejs/, r => r.abort());
  await p.addInitScript(() => { localStorage.setItem('sff_lang','he'); localStorage.setItem('sff_kids', JSON.stringify([{id:'k1',name:'Ben',grade:6,color:'#2F6BFF'}])); });
  await p.goto('http://localhost:8765/#kid-k1', { waitUntil: 'load' }); await p.waitForTimeout(2000);
  await p.evaluate(async () => { const pl=await loadShare('en7-nov26'); applyImport(pl,kidById('k1')); });
  const sleep = ms => p.waitForTimeout(ms);
  // spelling on chapter 8 (has "ice cream cone" etc.) – every question, letters or multiple choice
  for (const [mode, ch] of [['spell',7],['riddle',8],['match',1],['memory',1]]) {
    await p.evaluate(([m,c]) => { G=null; startGame(sets[0], null, m, c); }, [mode, ch]); await sleep(300);
    const chLen = await p.evaluate(c => chapterQs(sets[0], c).length, ch);
    for (let guard=0; guard<80; guard++) {
      const st = await p.evaluate(() => ({ end: !$('vEnd').classList.contains('hidden'), mode: G.mode, i: G.i, n: G.qs.length, sheet: $('gSheet').classList.contains('show'), riddle: !!document.querySelector('#rTiles'), opts: !!document.querySelector('#gPlay .opt:not([disabled])'), mem: !!G.mem, match: !!G.m }));
      if (st.end) break;
      if (st.sheet) { await p.evaluate(() => { const b=[...document.querySelectorAll('#gSheet .btn')].pop(); b && b.click(); }); await sleep(250); continue; }
      if (st.mode==='memory') { await p.evaluate(() => { const M=G.mem; const left=M.cards.map((c,i)=>({c,i})).filter(x=>!$('mc'+x.i).classList.contains('got')); if(!left.length) return; const a=left[0], b2=left.find(x=>x.c.p===a.c.p&&x.i!==a.i); memFlip(a.i); memFlip(b2.i); }); await sleep(450); continue; }
      if (st.mode==='match') { await p.evaluate(() => { const M=G.m; const i=M.slice.findIndex((_,k)=>!M.done[k]); if(i<0) return; matchSel(i); matchTo(i); }); await sleep(120); continue; }
      if (st.riddle) { await p.evaluate(() => { const R=G.r; [...R.ans.replace(/ /g,'')].forEach(c=>riddleTap(R.tiles.findIndex(t=>!t.used&&t.c===c))); }); await sleep(1900); continue; }
      if (st.opts) { await p.evaluate(() => choicePick(curQ().answer)); await sleep(1900); continue; }
      await sleep(300);
    }
    const r = await p.evaluate(() => ({ answered: history[0] && history[0].n, right: history[0] && history[0].right, mode: history[0] && history[0].mode }));
    console.log(mode.padEnd(7), 'chapter', ch+1, '→ questions in chapter:', chLen, '| answered in session:', r.answered, '| right:', r.right);
  }
  console.log('ERR', errs); await b.close(); })();
