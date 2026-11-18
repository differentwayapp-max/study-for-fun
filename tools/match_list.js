// Lists, per chapter, the questions that can enter the match / memory games of a catalog set (as the app decides),
// with their answers – so a reviewer can check that no answer card of the chapter also answers another question.
// Usage: node tools/match_list.js <set id>   (reads public/share/<id>.txt, the last build)
const fs = require('fs'), path = require('path'), id = process.argv[2], R = path.resolve(__dirname, '..') + '/';
const src = fs.readFileSync(R + 'public/index.html', 'utf8').split('\n');
const pick = n => src.find(l => l.startsWith(n)).replace(/^const /, 'var ');
eval(pick('const OPTS_EN')); eval(pick('const OPTS_HE')); var needOpts; eval(pick('const needOpts')); var ansKey; eval(pick('const ansKey'));
const d = JSON.parse(Buffer.from(fs.readFileSync(R + 'public/share/' + id + '.txt', 'utf8').slice(5), 'base64'));
const strip = t => String(t).replace(/[⁦-⁩]/g, '');
d.chapters.forEach((c, ci) => {
  const qs = d.questions.filter(q => q.ch === ci);
  if (c.text) { console.log(`\n## ch${ci + 1} ${c.title} – reading passage: choice only`); return; }
  const ok = qs.filter(q => !needOpts(q) && String(q.options[q.answer]).length <= 40 && q.question.length <= 110);
  console.log(`\n## ch${ci + 1} ${c.title} – ${ok.length}/${qs.length} questions in the match game`);
  ok.forEach(q => console.log(`- «${strip(q.question)}» → ${strip(q.options[q.answer])}   [picture: ${(q.scene || []).map(s => s.e).join(' ')}]`));
  const keys = [...new Set(ok.map(ansKey))]; console.log(`  answer cards: ${keys.map(strip).join(' | ')}`);
});
