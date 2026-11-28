# Prompt: take the English version of the practice content to production

> For the owner: give this whole file to the chat that deploys. It covers the app code and ALL the English content prepared in
> branch `claude/sharp-volta-jie6e7`, two small app fixes that are still needed, the checks, and the deploy. Section 6 lists
> problems found in the Hebrew sets on the way – for the owner's decision, not part of this deploy.

---

You are working on the Study for fun repo (read `CLAUDE.md` first). A branch, `claude/sharp-volta-jie6e7`, holds the English
version of the practice content: app support + every catalog set (34). Bring it into the main line, apply the two fixes
below, check, and deploy **only after the owner approves**.

**Content (all done, each set translated, independently reviewed and fixed, owner approved the style on the pilot):**
- Math and science – full English: math1–math8, math7-nov26, sci1–sci8, sci7-materials (≈ 6,000 questions, picture text,
  chapter / topic names, reading passages).
- English sets – only the Hebrew that instructs or explains is English; the Hebrew that IS the exercise (translation, meaning
  hints, glosses, Hebrew letter sounds) stays: en3–en8, en4-nov26, en7-nov26.
- Hebrew sets – content stays Hebrew; only the set's name and catalog title in English: heb1–heb8.
- `public/share/curriculum.json` – `grades_en` (the catalog's "what grade N learns", for parents).

## 1. What the branch contains (from commit 795d71f on – read the diff)
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
- `tools/sets_en/<id>.json` for all 34 sets + the rebuilt `public/share/<id>*.txt`, `catalog.json`, `curriculum.json`.
- More build checks added on the way: a question kept in multiple choice in Hebrew (`needOpts`) must be so in English too; no
  direction marks in English; "←"/"→" set by the text's direction (English-first → "→", Hebrew-first → "←"); one-letter
  answers keep their case.
- Tests: `tools/tests/local_english.js` (new), `tools/tests/local_scenes.js` (`SFF_LANG=en`).
- Docs: `CLAUDE.md` (a line on the English version), `docs/english-content-prompt.md`, `docs/catalog-review/english-pilot.md`.

The owner approved the translation's style (28.11); one wording fix is already in the branch (math3: a comparison of
exercises asks "Which exercise gives the greater result?" – `tools/sets_en/math3.json` + the rebuilt `public/share/math3*.txt`).

## 2. Fixes still needed in the app (not in the branch – the owner asked that this session not change the app)

### 2a. Station icons on the map (found by the owner)
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

### 2b. Book pages in English chapter titles (math7-nov26)
Its chapter titles carry pages ("… · עמ' 5–20"); the English labels say "… · pp. 5–20". `PG_RE` in `public/index.html` matches
only `עמ'`, so in English the pages stay inside the chapter name instead of showing apart. Change
`const PG_RE=/\s*·\s*(עמ'[^·]*)$/;` to `const PG_RE=/\s*·\s*((?:עמ'|pp\.)[^·]*)$/;` and look at that set's map in English.

## 3. Checks before deploy (app served: `python3 tools/serve.py 8765 &`)
1. `for f in tools/sets/*.py; do SFF_DRY=1 python3 -I tools/build_set.py $f; done` → every set `ok (dry)`, `EN: N/N questions in English`.
2. `IDS=math1,math2,math3,math4,math5,math6,math7,math8,math7-nov26,sci1,sci2,sci3,sci4,sci5,sci6,sci7,sci8,sci7-materials node tools/tests/local_english.js`
   → `ok …` (no Hebrew in English mode, Hebrew keys kept, heb3 labels whole). The English sets keep Hebrew on purpose – not in this test.
3. `node tools/tests/local_scenes.js` and `SFF_LANG=en node tools/tests/local_scenes.js` (all catalog sets) → 0 bad scenes
   (checked in this branch: 34 sets, 0 bad, in both languages).
4. `for t in tools/tests/local_*.js; do node $t; done` – all pass, except `local_games.js` and `local_round2.js`, which already
   failed before this branch (a loading overlay / a missing element – not related; check they fail the same way on main).
5. In the emulators (as in CLAUDE.md): `e2e_stats.js`, `e2e_focus.js`, `e2e_assign.js` – the screens that now read `qv` / `lbl`.
6. Look with your own eyes, English mode, phone width: the catalog (a grade, a subject, its topics, "what grade N learns"), adding
   a set to a kid, the map (station icons!), a game of each kind, the end screen, the parent's tracking screen – one math, one
   science, one English and one Hebrew set. Then Hebrew mode: nothing changed.

## 4. Deploy (only after the owner approves)
- Hosting only: `tools/deploy.sh "English version of the practice content + app support"`. No functions deploy (build-core.js
  unchanged), no rules.
- Family copies of every catalog set update by themselves on the next open (`ver` changed), progress kept.

## 5. Keeping it up to date
A change to a Hebrew question makes the build fail for that set ("the Hebrew changed since it was translated") until its English
is updated: `SFF_EN_DUMP=/tmp/x.json python3 -I tools/build_set.py tools/sets/<file>.py` marks it `stale`; fix the English in
`tools/sets_en/<id>.json` (copy the new `h`). A new catalog set needs its `tools/sets_en/<id>.json` the same way
(`docs/english-content-prompt.md` §4–§8). Family-built (AI) sets have no English – they show as built.

## 6. Problems in the Hebrew sets found on the way (for the owner – not part of this deploy)
Each is the same in Hebrew mode; the English was already worded around it where possible. Numbers are places in the built set.
- **sci4** "רוכבים על סקייטבורד. מה מגן על הברכיים?" gives away "מגני ברכיים" → "מה מגן על הרגליים כשנופלים?".
- **math1** #183: the picture pairs 8 with the girl and 9 with the boy (8 boys, 9 girls); #139: the 10 (seats) under the child, the 6 (taken) under the bus.
- **math4** a picture uses 🥛 for a liter (#334); an explanation "20, 18, 18, 18" does not follow the option order (#308).
- **math7** "בפונקציה עולה … y…" → "עולה" and "בפונקציה קבועה … y…" → "קבוע": the answer word is in the question (#186, #187).
- **math7-nov26** "איזו זווית קהה?" – in the matching game the chapter's 120° card is also obtuse → "איזו מהן קהה?".
- **sci1** "איזה יצור חי לא הולך ממקום למקום?" – the chapter's card "פרח" also fits → "איזה מהם…".
- **sci2** "דרך מה אי אפשר לראות?", "על מה הכי נוח לשכב?" – another card of the chapter also fits; "מסמר, מפתח, מטבע – מה משותף להם?" vs
  "אטומים למים"; 🥛 shown as a glass cup (#31); "אדים" listed as a state of matter.
- **sci3** the card "גומי" also answers "אילו כפפות ילבש?" (chapter "מוליך או מבודד?"); 🥛 used as a glass in #1, #42, #44, #92.
- **sci5** "באיזה מזון יש הרבה חלבון?" and "איזה מזון עשיר בשומן?" – the chapter's card "גבינה" fits both → "איזה מהם…".
- **sci7** "תאי עצב → רקמת עצבים" (the root gives the answer, #250); "תאים" / "תא" answers in one chapter (#254/#257);
  "אנרגיה שעוברת" also answers the flame question (#181/#188).
- **en4-nov26** the hint "נמר" for tiger means leopard → "טיגריס" (#68, #127); "ladybird" is British (ladybug); "תנין" + 🐊 is a
  crocodile, the answer says alligator (#43, #86, #137).
- **en4 / en5 / en6** a few English questions show their own answer or need "Which of these…" in Hebrew mode too (en4 #42,
  #297; en5 #387 "cold and ___ … snow" → snowy; en6 #396).
