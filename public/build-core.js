// Study for fun – building and checking practice-set questions with the AI, shared by the app and the server.
// The app loads it as a plain script (its names are globals there: the practice screen adds questions, fixes pictures and
// checks new questions with these same functions); the server (functions/index.js) requires it and runs a whole new
// practice set with buildSet – so a parent can close the phone while a set is built.
// Nothing here may touch the page (no DOM, no storage): the AI step is always passed in (askFn).
// The server's copy is functions/build-core.js, written from this file before every functions deploy (firebase.json).

const GRADES = ["א'","ב'","ג'","ד'","ה'","ו'","ז'","ח'","ט'","י'","י\"א","י\"ב"];

// the student and the test – the server builds every prompt from this (functions/prompts.js)
function aiCtx(gi, subject, topics, extra={}){ return {gi:+gi||0, grade:GRADES[+gi||0], subject:String(subject||'').replace(/^🎯\s*/,''), topics:(topics||[]).slice(0,30), ...extra}; }
const setAiCtx=set=>aiCtx(set.grade, set.subject, set.topics);
const qSend=(q,i,extra={})=>({i, topic:q.topic||'', question:q.question, options:q.options, answer:q.answer, explanation:q.explanation||'', emoji:q.emoji||'', scene:q.scene||null, ...extra});
const isPool=q=>!!q.srcq;            // a ready, already-checked question (srcq = its source) – never re-solved or changed

async function genChapter(askFn, ctx, o){
  const r=await askFn('gen', {ctx, chapter:{i:o.ci||0, n:o.n||1, title:o.title||'', topics:o.topics||[]}, quota:o.quota, avoid:(o.avoid||[]).slice(-120),
    styles:o.styles||'', difficulty:o.difficulty||'', nameIt:!!o.nameIt}, o.images&&o.images.length&&canImages?{images:o.images}:{});
  const tp=o.nameIt?Object.keys(o.quota):(o.topics||[]);
  return {title:String(r?.title||'').slice(0,40), qs:clean(r?.questions, tp).map(q=>({...q,ch:o.ci||0}))};
}

async function poolPick(askFn, ctx, I, profile, poolFn, rand=Math.random){
  const out={}, pool=await poolFn(I.kidId, I.gi, I.subject); if(!pool.length) return out;
  const want=[...new Set([...I.topics, ...(profile.detected_topics||[])])].slice(0,40);
  const m=await askFn('match', {ctx, want, pool:pool.map(c=>({ref:c.ref,title:c.title,topics:c.topics}))});
  const refs=t=>(((m&&m.map)||[]).find(x=>x.topic===t)||{}).refs||[];
  const groups=[]; let total=0;
  I.chapters.forEach((ch,ci)=>{ const seen=new Set(), cand=[];
    ch.topics.forEach(t=>refs(t).forEach(r=>{ const c=pool.find(x=>x.ref===r); if(c) c.qs.forEach(q=>{ if(!seen.has(q.srcq)){ seen.add(q.srcq); cand.push({...q,topic:t}); } }); }));
    const c80=cand.slice(0,80); if(c80.length && groups.length<12 && total+c80.length<=400){ total+=c80.length; groups.push({ci, topic:ch.topics.join(' + ').slice(0,120), cand:c80}); } });
  if(!groups.length) return out;
  const r=await askFn('select', {ctx, groups:groups.map(g=>({topic:g.topic, questions:g.cand.map((q,i)=>({i,question:q.question,answer:String(q.options[q.answer])}))}))});
  const taken=new Set();
  groups.forEach((g,k)=>{ const p=((r&&r.picks)||[]).find(x=>x.topic===g.topic)||((r&&r.picks)||[])[k]; if(!p||!Array.isArray(p.i)) return;
    const max=Math.floor(I.chapters[g.ci].count/2);
    const pick=[...new Set(p.i)].map(i=>g.cand[i]).filter(q=>q&&!taken.has(q.srcq)).sort(()=>rand()-.5).slice(0,max);
    pick.forEach(q=>taken.add(q.srcq));
    if(pick.length) out[g.ci]=pick.map(({topic,question,options,answer,explanation,emoji,scene,core,srcq})=>({topic,question,options,answer,explanation,emoji:emoji||'',...(scene?{scene}:{}),...(core?{core:true}:{}),ch:g.ci,srcq})); });
  return out;
}

function distribute(n, topics){
  const per={}; const base=Math.floor(n/topics.length); let rem=n-base*topics.length;
  topics.forEach(t=>{per[t]=Math.max(1,base+(rem>0?1:0)); if(rem>0) rem--;});
  return per;
}
const TOO_NEW_SEQ=['🧑‍🌾','🧑‍🍳','🧑‍🏫','🧑‍🎓','🧑‍⚕️','🧑‍💻','🧑‍🚀','🧑‍🎨','🧑‍🔧','🧑‍🚒'];
const TOO_NEW=new Set([...'🪑🪭🛝🪁🪀🟦🟥🟫🟩🟪🟧🟨🟢🩻🪼🫏🪿🪸🫧🧇🦘🩶🪢🫖🪴🪨🪵🛖🫐🫒🫑🫓🫔🫕🦬🦣🦫🦤🪶🦭🪲🪳🪰🪱🫀🫁🥷🫂🪄🪅🪆🧋🛻🛼🪃🪓🪔🪕🦯🦽🦾🧃🧉🧊🧄🧅🦩🦥🦦🦨🦪🧆🧈🧏🧍🧎🪐🪂🤿🥽🥼🦺🩰🩱🩲🩳🩸🩹🩺']);
const tooNew=e=>TOO_NEW_SEQ.includes(e)||[...String(e)].some(c=>TOO_NEW.has(c));
function cleanScene(sc){
  if(!Array.isArray(sc)||!sc.length) return null;
  sc=sc.filter(it=>!(it&&tooNew(it.e))); if(!sc.length) return null;
  const n=v=>Math.max(0,Math.min(100,+v||0));
  const out=sc.slice(0,12).filter(it=>it&&typeof it.e==='string'&&([...it.e].length<=4||(it.e.length<=16&&!PIC_CH.test(it.e)))).map(it=>({e:it.e.trim(),x:n(it.x),y:n(it.y),s:Math.max(10,Math.min(90,+it.s||40))}));
  return out.length?out:null;
}
function clean(arr, topics){
  if(!Array.isArray(arr)) return [];
  return arr.filter(q=>q && typeof q.question==='string' && Array.isArray(q.options) && q.options.length===4
      && Number.isInteger(+q.answer) && +q.answer>=0 && +q.answer<4 && new Set(q.options.map(o=>String(o).trim())).size===4)
    .map(q=>({topic: topics.includes(q.topic)?q.topic:(topics.find(t=>t.toLowerCase()===String(q.topic||'').toLowerCase())||topics[0]),
      question:String(q.question).trim(), options:q.options.map(o=>String(o).trim()), answer:+q.answer, explanation:String(q.explanation||'').trim(), emoji:(typeof q.emoji==='string'&&[...q.emoji].length<=4)?q.emoji.trim():'', ...(cleanScene(q.scene)?{scene:cleanScene(q.scene)}:{}), ...(Number.isInteger(q.ch)?{ch:q.ch}:{}), ...(q.core===true?{core:true}:{})}));
}

/* picture pass: every question gets a scene and a short stem that does not give the answer away */
const words=t=>String(t||'').trim().split(/\s+/).filter(Boolean).length;
const needsPic=q=>!q.scene || words(q.question)>6 || words(q.explanation)>14 || q.options.some(o=>words(o)>4) || q.question.toLowerCase().includes(String(q.options[q.answer]).toLowerCase());
// The rules for questions and pictures (BUILD_RULES, PIC_RULE, COPY_RULE) are in functions/prompts.js – the server puts them
// in every AI call (one cached system prompt).
async function picturePass(qs, ctx, askFn=ask, onProgress, want=needsPic){
  for(let round=0; round<2; round++){                       // a second round for any question still without a picture
  const idx=qs.map((q,i)=>(isPool(q)?false:round?noPic(q):want(q))?i:-1).filter(i=>i>=0); if(!idx.length) break;
  for(let k=0;k<idx.length;k+=12){
    if(onProgress) onProgress(k, idx.length);
    const part=idx.slice(k,k+12);
    const r=await askFn('pics', {ctx, items:part.map(i=>({i, question:qs[i].question, options:qs[i].options, answer:qs[i].answer}))});
    (Array.isArray(r?.items)?r.items:[]).forEach(it=>{ const q=qs[it.i]; if(!q||!part.includes(it.i)) return;
      const sc=cleanScene(it.scene); if(sc) q.scene=sc;
      if(Array.isArray(it.options)&&it.options.length===4&&it.options.every(o=>typeof o==='string'&&o.trim())&&new Set(it.options.map(o=>o.trim())).size===4) q.options=it.options.map(o=>o.trim());
      if(typeof it.question==='string' && it.question.trim() && !it.question.toLowerCase().includes(String(q.options[q.answer]).toLowerCase())) q.question=it.question.trim();
      if(typeof it.explanation==='string' && it.explanation.trim() && words(it.explanation)<=16) q.explanation=it.explanation.trim(); });
  }
  }
  return qs;
}
// the rules a program can check by itself, before any AI review (the reviewer is asked only about the rest)
const ansOf=q=>String(q.options[q.answer]).trim();
function codeChecks(qs){
  const bad=[], seen={}, val=a=>String(a).replace(/[\s⁦-⁩]/g,'').replace(/(₪|ש״ח|ס״מ|מ״מ|ק״מ|ק״ג|גרם|מטר|ליטר|מ״ל|%)$/,'');
  const add=(i,why)=>{ if(!bad.some(b=>b.i===i)) bad.push({i,why}); };
  qs.forEach((q,i)=>{
    if(q.emoji && tooNew(q.emoji)) q.emoji='';                                   // an emoji older phones cannot show: just dropped
    const a=ansOf(q), t=String(q.question).toLowerCase().replace(/[⁦-⁩]/g,'');
    if(words(a)>3) add(i,'התשובה ארוכה מ-3 מילים');
    if(!/^[\d\s.,/−+×÷:=%-]+$/.test(a) && a.length>=2 && !needOpts(q) && new RegExp('(^|[^\\p{L}])'+a.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'([^\\p{L}]|$)','u').test(t)) add(i,'השאלה מסגירה את התשובה');
    const k=String(q.question).trim().toLowerCase(); if(seen[k]!=null) add(i,'אותה שאלה מופיעה פעמיים'); seen[k]=i;
    const j=qs.findIndex((o,k2)=>k2<i && (o.ch??0)===(q.ch??0) && ansOf(o)!==a && val(ansOf(o))===val(a) && /\d/.test(a));
    if(j>=0 && !needOpts(q)) add(i,`התשובה "${a}" היא אותו ערך כמו התשובה "${ansOf(qs[j])}" של שאלה אחרת בפרק – לכתוב אותן באותה צורה`);
  });
  return bad;
}
// QA of new questions: the whole list solved blind once (40 per call), every chapter reviewed with its answers (the
// questions already in the chapter – o.context – and the pool's come along "locked": seen for clashes, never changed),
// the flagged ones fixed per chapter, every fix solved blind again and reviewed again with its chapter.
async function qaSet(qs, ctx, askFn=ask, o={}){
  const log=[]; let fixed=0, dropped=0; const prog=o.onProgress||(()=>{}), context=o.context||[];
  const solve=async list=>{ const out=[]; for(let k=0;k<list.length;k+=40){ const part=list.slice(k,k+40);
      const r=await askFn('solve', {ctx, questions:part.map(([q,i])=>qSend(q,i))}); out.push(...(Array.isArray(r?.results)?r.results:[])); } return out; };
  const review=async list=>{ const out=[]; for(let k=0;k<list.length;k+=40){ const part=list.slice(k,k+40);
      const r=await askFn('review', {ctx, questions:part.map(([q,i,locked])=>qSend(q,i,locked?{locked:true}:{}))}); out.push(...(Array.isArray(r?.flags)?r.flags:[])); } return out; };
  const open=qs.map((q,i)=>[q,i]).filter(([q])=>!isPool(q));
  const chs=[...new Set(qs.map(q=>q.ch??0))];
  // the chapter as the games see it: its new questions (index i) and the locked ones (index 1000+)
  const chapterList=(ch, list)=>list.map((q,i)=>[q,i,isPool(q)||q._lock]).filter(([q])=>(q.ch??0)===ch)
    .concat(context.filter(q=>(q.ch??0)===ch).map((q,k)=>[q,1000+k,true]));
  prog('בודקים את התשובות…');
  const res=await solve(open), byI=Object.fromEntries(res.map(r=>[+r.i,r]));
  const bad=codeChecks(qs).filter(b=>!isPool(qs[b.i]));
  open.forEach(([q,i])=>{ if(bad.some(b=>b.i===i)) return; const r=byI[i];
    if(!r){ bad.push({i,why:'הבודק לא החזיר תשובה'}); return; }
    if(r.pick!==q.answer || r.multiple_correct || (r.problem&&r.problem.trim()))
      bad.push({i,why: r.pick!==q.answer?`הבודק בחר תשובה ${+r.pick+1} במקום ${q.answer+1}`:(r.multiple_correct?'יותר מתשובה נכונה אחת':r.problem)}); });
  for(let n=0;n<chs.length;n++){ prog(`פרק ${n+1} מתוך ${chs.length}…`);
    (await review(chapterList(chs[n], qs))).forEach(f=>{ const i=+f.i; if(!Number.isInteger(i)||i>=1000||!qs[i]||isPool(qs[i])||bad.some(b=>b.i===i)) return;
      if(f.kind==='clash'&&needOpts(qs[i])) return; bad.push({i, why:String(f.note||f.kind).slice(0,200)}); }); }
  const out=qs.slice();
  if(bad.length){
    const fixedIdx=[];
    for(const ch of chs){ const mine=bad.filter(b=>(qs[b.i].ch??0)===ch); if(!mine.length) continue;
      prog('מתקנים…');
      const others=qs.map((q,i)=>[q,i]).filter(([q,i])=>(q.ch??0)===ch&&!mine.some(b=>b.i===i)).map(([q,i])=>qSend(q,i)).concat(context.filter(q=>(q.ch??0)===ch).map((q,k)=>qSend(q,1000+k))).slice(0,40);
      const fx=await askFn('fix', {ctx, items:mine.slice(0,40).map(b=>qSend(qs[b.i],b.i,{why:b.why})), others});
      const items=Array.isArray(fx?.items)?fx.items:[];
      mine.forEach(b=>{ const it=items.find(x=>+x.i===b.i);
        const cq=it&&it.action==='fix'&&it.question ? clean([it.question], [qs[b.i].topic, ...new Set(qs.map(q=>q.topic))])[0] : null;
        if(cq){ out[b.i]={...cq, ch:qs[b.i].ch}; fixedIdx.push(b.i); }
        else { out[b.i]=null; dropped++; log.push({q:qs[b.i].question, why:b.why, result:'הוסרה'}); } });
    }
    if(fixedIdx.length){
      // every fix: solved blind again, then reviewed again together with its chapter (a fix must not create a clash)
      prog('בודקים את התיקונים…');
      const re=await solve(fixedIdx.map(i=>[out[i],i])), reBy=Object.fromEntries(re.map(r=>[+r.i,r]));
      const why=i=>bad.find(b=>b.i===i).why, fail=new Set();
      fixedIdx.forEach(i=>{ const r=reBy[i]; if(!(r && r.pick===out[i].answer && !r.multiple_correct && !(r.problem&&r.problem.trim()))) fail.add(i); });
      const cur=out.map(q=>q&&{...q}); fixedIdx.forEach(i=>{ if(cur[i]&&!fail.has(i)) cur[i]._fix=1; });
      for(const ch of new Set(fixedIdx.filter(i=>!fail.has(i)).map(i=>out[i].ch??0))){
        const list=cur.map((q,i)=>[q,i]).filter(([q])=>q&&(q.ch??0)===ch).map(([q,i])=>[q,i,!q._fix])
          .concat(context.filter(q=>(q.ch??0)===ch).map((q,k)=>[q,1000+k,true]));
        (await review(list)).forEach(f=>{ const i=+f.i; if(fixedIdx.includes(i)&&!(f.kind==='clash'&&needOpts(out[i]))) fail.add(i); });
      }
      fixedIdx.forEach(i=>{ if(fail.has(i)){ out[i]=null; dropped++; log.push({q:qs[i].question, why:why(i), result:'הוסרה (התיקון לא עבר בדיקה חוזרת)'}); }
        else { out[i]={...out[i],fixed:true}; fixed++; log.push({q:out[i].question, why:why(i), result:'תוקנה ואומתה'}); } });
    }
  }
  return {questions:out.filter(Boolean), checked:qs.length, passed:qs.length-bad.length, fixed, dropped, log};
}

const noPic=q=>!Array.isArray(q.scene)||!q.scene.length;

// questions that only make sense next to their options ("Which is correct?", "מה נכון?", "מה מהבאים…") – choice only
const OPTS_EN=/\bcorrect\b|\b(is|are) (correct|true|right|wrong|false)\b|^which (one|of these)\b|\bof these\b|odd one|doesn't belong|does not belong/i, OPTS_NOT=/\bNOT\b/;
const OPTS_HE=/(מה|מי|איזה|איזו|אילו)\s+(נכון|נכונה|נכונים|לא נכון|שגוי)|מהבאים|מבין האפשרויות|לא שיי?ך|יוצא דופן|יוצאת דופן|אינו |אינה |אינם |אינן |איננה|כתוב נכון|כתובה נכון|כתובות נכון|מבין אלה|מאלה|איזה משפט נכון|באיזו מילה יש|יש טעות|איזו מהן|איזה מהם|מי מהם|מה מהם|מי מהן|איזה מהן/;
const needOpts=q=>{ const t=String(q.question).replace(/[\u2066-\u2069]/g,'').replace(/[\u0591-\u05C7]/g,''); return OPTS_EN.test(t)||OPTS_NOT.test(t)||OPTS_HE.test(t); };

const PIC_CH=/[\u2300-\u23FF\u2600-\u27BF\u2B00-\u2BFF\u{1F000}-\u{1FAFF}\uFE0F\u20E3]/u;   // arrows (→) and math signs (−) are text

// a short key of a text (question / option) – history keeps it next to the index, so an updated set still finds them
const tkey=t=>{ let h=2166136261; for(const c of String(t).replace(/[\s⁦-⁩]/g,'')){ h^=c.codePointAt(0); h=Math.imul(h,16777619)>>>0; } return h.toString(36); };

/* ---------- a whole new practice set (the server runs this: functions/index.js → runBuild) ----------
   I – the parent's form (subject, grade, topics, chapters…); askB(step, data) – one AI step; env:
   progress(stepId, state, detail) – what the build screen shows · pool(kidId, gi, subject) – the ready chapters poolPick may
   use · rand – a random source (the server's is seeded by the build, so a build that goes on repeats the same choices).
   Errors marked ctl (a step that may go better later, a cancelled build, time to hand over) are not swallowed anywhere. */
const SCAN_NONE={detected_topics:[],styles:'',difficulty:'',missing_from_parent_list:[]};
async function buildSet(I, askB, env={}){
  const P=env.progress||(()=>{}), {gi, subject, topics, chapters}=I;
  const ctx=aiCtx(gi, subject, topics, {pages:I.pages, link:I.link});
  /* 1. scan (the files were read when the build was sent – the answer comes from the build's log) */
  P('scan','run');
  const profile = (I.text || I.files) ? ((await askB('scan', {ctx, text:I.text})) || SCAN_NONE) : SCAN_NONE;
  P('scan','done', (I.text||I.files||profile.detected_topics?.length)?`נמצאו ${profile.detected_topics?.length||0} נושאים בחומר. ${profile.styles||''}`:'לא הועלה חומר – השאלות ייבנו לפי הנושאים והכיתה בלבד');

  /* 2. questions – one call per chapter (with checked questions from the pool where they fit, up to half a chapter) */
  P('gen','run');
  let pool={}; try{ pool=await poolPick(askB, ctx, I, profile, env.pool||(async()=>[]), env.rand||Math.random); }catch(e){ if(e&&e.ctl) throw e; pool={}; }
  const gen=[];
  for(let ci=0;ci<chapters.length;ci++){
    const ch=chapters[ci], taken=pool[ci]||[]; P('gen','run',`פרק ${ci+1} מתוך ${chapters.length}…`);
    const need=Math.max(1,ch.count-taken.length), before=gen.flat().concat(taken);
    const g=await genChapter(askB, ctx, {ci, n:chapters.length, title:ch.title, topics:ch.topics, quota:distribute(need, ch.topics),
      avoid:before.map(q=>q.question).slice(-120), styles:profile.styles, difficulty:profile.difficulty});
    gen[ci]=taken.map(q=>({...q,ch:ci})).concat(g.qs);
  }
  let qs=gen.flat();
  P('gen','done',`${chapters.length} פרקים · ${qs.length} שאלות`);

  /* 3. coverage – every topic gets questions */
  P('cover','run');
  for(const t of topics){
    if(qs.some(q=>q.topic===t)) continue;
    const ci=Math.max(0,chapters.findIndex(c=>c.topics.includes(t)));
    const g=await genChapter(askB, ctx, {ci, n:chapters.length, title:t, topics:[t], quota:{[t]:3}, avoid:qs.map(q=>q.question).slice(-120)});
    qs=qs.concat(g.qs);
  }
  const missingTopics=topics.filter(t=>!qs.some(q=>q.topic===t));
  /* pictures – only for questions that do not follow the picture rules yet */
  P('cover','run','🖼️ תמונות…');
  qs=await picturePass(qs, ctx, askB, null, q=>!isPool(q)&&needsPic(q));
  P('cover', missingTopics.length?'fail':'done', missingTopics.length?`חסר: ${missingTopics.join(', ')}`:'✓ כל הנושאים · 🖼️ תמונות');

  /* 4. QA – the whole set solved blind once; every chapter reviewed with its answers; fixes checked again */
  P('qa','run');
  const qa=await qaSet(qs, ctx, askB, {onProgress:t=>P('qa','run',t)}); qs=qa.questions;
  P('qa','done',`נבדקו ${qa.checked} · עברו ${qa.passed} · תוקנו ${qa.fixed} · הוסרו ${qa.dropped}`);

  const coverage={}; topics.forEach(t=>coverage[t]=qs.filter(q=>q.topic===t).length);
  return {...(I.reinf?{reinf:I.reinf}:{}), name:I.name, grade:gi, subject:I.reinf?'🎯 '+subject:subject, topics, questions:qs, source:{link:I.link,pages:I.pages}, examDate:I.examDate, dailyGoal:I.dailyGoal, perRound:I.perRound, kidId:I.kidId, chapters,
    qa:{checked:qa.checked,passed:qa.passed,fixed:qa.fixed,dropped:qa.dropped,log:qa.log}, coverage, suggestions:(profile.missing_from_parent_list||[]).filter(t=>!topics.includes(t))};
}

if(typeof module!=='undefined' && module.exports) module.exports={GRADES, aiCtx, qSend, isPool, genChapter, poolPick, distribute, tooNew, cleanScene, clean, words, needsPic,
  picturePass, codeChecks, qaSet, noPic, needOpts, PIC_CH, tkey, buildSet};
