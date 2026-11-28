# Prompt: take the English version of the practice content to production

> For the owner: give this whole file to the chat that deploys. It covers the app code and the content prepared in branch
> `claude/sharp-volta-jie6e7` (commit `795d71f`), one bug fix that is still needed, the checks, and the deploy.

---

You are working on the Study for fun repo (read `CLAUDE.md` first). A branch, `claude/sharp-volta-jie6e7`, holds the English
version of the practice content: app support + two translated catalog sets (math3, sci4). Bring it into the main line,
apply the fix below, check, and deploy **only after the owner approves**.

## 1. What the branch contains (commit 795d71f – read its diff)
- `public/index.html` – the English layer, shown only in English mode (`EN()`); Hebrew mode is unchanged:
  - `qv(q)` – a question's English view (`q.en = {k, q, o, x, sc}`; `k` = the Hebrew question it was translated from – a question
    edited since shows in Hebrew). Used at every place a question is shown (games, end screen, review list, mistakes, stats, teacher
    screens) and by the game rules that read the shown text (`shortA`, `riddleOK`, `spellOK`, `cueTxt`, `ansKey`, `cardFace`,
    `ansVal`, `optKey`, `needOpts` in `modePool`). History, topics, focus, `qk` keys stay Hebrew.
  - `lbl(t, set)`, `lblMap()`, `window.sffLabel` – topic / chapter / set-name labels from `set.en.labels`; a Hebrew set's labels
    map to themselves (so the UI dictionary never half-translates them – the bug "Open, אמצע וסוף").
  - `getChapters` gives the English chapter title (`he` keeps the Hebrew); `passageOf` the English passage (`set.en.texts`).
  - `loadShare` re-attaches `q.en` after `clean()` (build-core.js is NOT changed – no functions deploy needed); `applyImport`
    copies `p.en` into the family's set (new and updated copies).
  - Catalog: `catTitle(x)` (`title_en`), topic names, curriculum lines from `curriculum.json` `grades_en` when present.
  - `wordStats` items get `disp` (the shown answer); the stats / words screens show `disp`, keys stay `label`.
- `public/i18n.js` – asks `window.sffLabel` first in `translate()`; adds "רגע…" → "One moment…".
- `tools/build_set.py` – reads `tools/sets_en/<id>.json`, checks it (limits, no Hebrew left, answer in the question, cards ≤ 16,
  "←" on an English card, every Hebrew card translated, Hebrew changed since translation = error, chapter clashes as warnings),
  adds `q.en`, `set.en`, catalog `name_en` / `title_en` / `tags_en` / `samples[].q_en`; `SFF_EN_DUMP=<file>` writes a skeleton.
- `tools/sets_en/math3.json`, `tools/sets_en/sci4.json` + the rebuilt `public/share/math3*.txt`, `sci4*.txt`, `catalog.json`.
- Tests: `tools/tests/local_english.js` (new), `tools/tests/local_scenes.js` (`SFF_LANG=en`).
- Docs: `CLAUDE.md` (a line on the English version), `docs/english-content-prompt.md`, `docs/catalog-review/english-pilot.md`.

The owner approved the translation's style (28.11); one wording fix is already in the branch (math3: a comparison of
exercises asks "Which exercise gives the greater result?" – `tools/sets_en/math3.json` + the rebuilt `public/share/math3*.txt`).

## 2. Fix still needed (found by the owner on the map, not in the branch)
On the road map, stations of a translated set show a number card ("4,725", "2 thousands") as their icon. The cause: `qv()`
replaces `emoji` with the first picture card. In Hebrew `q.emoji` is '' for a card longer than 4 characters (`clean()`), so the
station gets its regular icon; it must stay so. But a short Hebrew card that IS the emoji (e.g. "דני", ≤ 4 characters) must show
its English. In `qv()` in `public/index.html` replace

```js
explanation:e.x!=null?String(e.x):q.explanation, ...(sc?{scene:sc,emoji:sc[0]?sc[0].e:q.emoji}:{})};
```
with
```js
explanation:e.x!=null?String(e.x):q.explanation, ...(sc?{scene:sc,
    emoji:q.emoji&&Array.isArray(q.scene)&&q.scene[0]&&q.emoji===q.scene[0].e&&sc[0]?sc[0].e:q.emoji}:{})};   // only a translated card that was the emoji
```
and add to `local_english.js` (section 1, after the history check) a test that the map's station icons in English are the same
as in Hebrew except where the Hebrew icon is a Hebrew card:
```js
const icons = await p.evaluate(async id => { const s = await loadShare(id);
  return s.qs.filter(q => qv(q).emoji !== q.emoji && !/[֐-׿]/.test(q.emoji || '')).length; }, IDS[0]);
if (icons) fails.push(`${icons} questions get another icon in English (a number card would show on the map)`);
```
Then `node tools/tests/local_english.js` must print `ok` (before the fix it reports "דני" in sci4 or numbers on the map).
Verified on a copy of the app (not in the repo): with this fix the test prints `ok` and the map's stations show their icons.
Already so in Hebrew too, not caused by this branch (the owner may want it fixed separately): a number card of ≤ 4 characters
("347", math3 station 5) is kept by `clean()` as `q.emoji`, so the map shows it as the station's icon – the map could skip text
items (`!PIC_CH.test(e)`) when it picks the station icon in `renderRoad` (`const emo=…`).

## 3. Checks before deploy (app served: `python3 tools/serve.py 8765 &`)
1. `for s in math3 sci4; do SFF_DRY=1 python3 -I tools/build_set.py tools/sets/$s.py; done` → `EN: N/N questions in English`, `ok (dry)`.
2. `ALL=1 node tools/tests/local_english.js` → `ok: math3, sci4 in English, Hebrew keys kept, heb3 labels whole`.
3. `IDS=math3,sci4 node tools/tests/local_scenes.js` and `SFF_LANG=en IDS=math3,sci4 node tools/tests/local_scenes.js` → 0 bad scenes.
4. `for t in tools/tests/local_*.js; do node $t; done` – all pass, except `local_games.js` and `local_round2.js`, which already
   failed before this branch (a loading overlay / a missing element – not related; check they fail the same way on main).
5. In the emulators (as in CLAUDE.md): `e2e_stats.js`, `e2e_focus.js`, `e2e_assign.js` – the screens that now read `qv` / `lbl`.
6. Look with your own eyes, English mode, phone width: the catalog card of math3 / sci4, adding it to a kid, the map (station
   icons!), a game of each kind, the end screen, the parent's tracking screen. Then Hebrew mode: nothing changed.

## 4. Deploy (only after the owner approves)
- Hosting only: `tools/deploy.sh "English version: math3, sci4 + app support"`. No functions deploy (build-core.js unchanged), no rules.
- Family copies of math3 / sci4 update by themselves on the next open (`ver` changed), progress kept.

## 5. After this – the rest of the catalog (content only, no app change)
Follow `docs/english-content-prompt.md` §4–§8 set by set (math1–8, math7-nov26, sci1–8, sci7-materials, the English sets §5, the
Hebrew sets' names §6): skeleton with `SFF_EN_DUMP`, translate, an independent reviewer, the build checks, `local_scenes` in
English, `local_english.js` with `IDS=<id>`, one set per commit. The pilot taught two rules, now in §4.6: a table of cards reads
right-to-left (give the LEFT card the label), and number-only division cards "24 : 4" become "24 ÷ 4" (clock times untouched).
Open from the pilot (Hebrew, the owner's call): sci4 "רוכבים על סקייטבורד. מה מגן על הברכיים?" gives away "מגני ברכיים".
