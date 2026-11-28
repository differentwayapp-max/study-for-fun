# Prompt: fix two problems in catalog sets (a wrong Hebrew gloss; answer cards that fit two questions)

> For the owner: give this file to the chat that fixes content. It covers items 3 and 4 of the list in
> `docs/english-production-prompt.md` §6. Each item below was checked against the real match game
> (`node tools/match_list.js <id>`) – suspected items that turned out fine were left out.

---

You are working on the Study for fun repo (read `CLAUDE.md` first). Fix the content problems below in the catalog practice sets.
**The skills are mandatory:** invoke `build-practice-set` before editing and `review-practice-set` after (CLAUDE.md). Work on the
branch with the English version (`claude/sharp-volta-jie6e7`, or main once it is merged) – every set now has an English file
`tools/sets_en/<id>.json`, and **a change to a Hebrew question makes the build fail until its English is updated** (see step 3).

## 1. Background – the match / memory games
In these games all questions of a chapter meet; a question shows only its text and picture, and the answer cards are the
chapter's correct answers. A line is accepted only to the question's own card or to a card with identical text. So if ANOTHER
card of the chapter is also a right answer, a child who picks it gets "טעות". The fix, in this order (build-practice-set §4):
make the question specific, or word it "איזה מהם… / מה מהבאים…" so the app keeps it in multiple choice (`needOpts`), or change
the other card. See each chapter's cards: `node tools/match_list.js <id>` (add `SFF_LANG=en` for the English version).

## 2. The fixes

### Item 3 – en4-nov26: "נמר" is a leopard, not a tiger (`tools/sets/en4_nov26.py`)
The Hebrew hint / gloss for **tiger** is "נמר"; in Hebrew נמר = leopard, tiger = טיגריס.
| Line | Now | Fix |
|---|---|---|
| 61 (`HEB` dict – feeds the generated questions' hints and explanations) | `"tiger": "נמר"` | `"tiger": "טיגריס"` |
| 151 | `"ti_er (נמר)"` | `"ti_er (טיגריס)"` |
| 102 (explanation) | `"נמר (טיגריס) = tiger"` | `"טיגריס = tiger"` |
Grep the set for any other "נמר" after the change (`grep -n נמר tools/sets/en4_nov26.py` → none).
Optional, the owner's call (the school's word list decides; keep both lines consistent with `WORD_LIST`): "ladybird" is British –
American "ladybug"; "תנין" + 🐊 is a crocodile, while the answer word is "alligator".

### Item 4 – answer cards that fit two questions in one chapter
| Set · file line | Chapter | Question → answer | The other card that also fits | Fix |
|---|---|---|---|---|
| math7-nov26 · `tools/sets/math7_nov26.py:156` | ch7 סוגי זוויות | «איזו זווית קהה?» → 100° | **120°** (another question's answer – also obtuse) | «איזו מהן קהה?» (stays multiple choice; its picture already shows the four options) |
| sci2 · `tools/sets/sci2.py:41` | ch1 קשה, רך ושקוף | «דרך מה אי אפשר לראות?» → קרטון | **דובי** (a teddy bear – also not see-through) | «דרך מה מהבאים אי אפשר לראות?» (the picture shows the four options) |
| sci2 · `tools/sets/sci2.py:77` | ch4 ממיינים חומרים | «מסמר, מפתח, מטבע – מה משותף להם?» → עשויים ממתכת | **אטומים למים** (also true of metal objects) | «ממה עשויים מסמר, מפתח ומטבע?» with options «ממתכת / מעץ / מגומי / מזכוכית» (the answer card becomes "ממתכת") |
| sci7 · `tools/sets/sci7.py:345` | ch19 חום או טמפרטורה? | «מחממים מים בסיר. מה המים מקבלים מהלהבה?» → חום | **אנרגיה שעוברת** (the answer of «מהו חום?» – also what the water gets) | «…מה מהבאים המים מקבלים מהלהבה?» |
| sci7 · `tools/sets/sci7.py:435` / `:438` | ch26 רמות ארגון – תרגול | «רקמה בנויה מ…» → תאים · «כדורית דם אדומה היא…» → תא | the same word, plural / singular, in one chapter (minor) | «רקמה בנויה מ…» → answer «תאים רבים», or move one of the two to another chapter |
Before each change, run `node tools/match_list.js <id>` and confirm the clash is still there; after it, run it again and check that
no card of the chapter answers the new wording, and that the new answer clashes with nothing.

## 3. The English side (every set has `tools/sets_en/<id>.json`)
1. After the Hebrew edits: `SFF_EN_DUMP=/tmp/<id>.json python3 -I tools/build_set.py tools/sets/<file>.py` – the changed questions come
   out with `"stale": true` (or with empty English when the Hebrew question text changed – they are keyed by the Hebrew).
2. In `tools/sets_en/<id>.json` update each such entry: the new `he`, `a`, `h` (copy from the dump) and the English
   `q` / `o` (same order as the Hebrew source options) / `x`. Rules: `docs/english-content-prompt.md` §4 (§5 for an English set).
   English wording for the fixes above: math7-nov26 "Which of these angles is obtuse?" (already so in English – only `he`/`h`
   change); sci2 "Which of these can't we see through?"; sci2 "What are a nail, a key and a coin made of?" → "Metal / Wood /
   Rubber / Glass"; sci7 "Water in a pot sits on a flame. Which of these does the water get from it?"; en4-nov26 – the
   English entry of "ti_er (טיגריס)" keeps the Hebrew hint (it is the exercise) and the explanation glosses "טיגריס".
3. The build must pass in both languages: `SFF_DRY=1 python3 -I tools/build_set.py tools/sets/<file>.py` → `ok (dry)` and
   `EN: N/N questions in English`, no `EN ch…` errors (the build checks that a question kept in multiple choice in Hebrew is
   so in English too).

## 4. Checks and report
- Build each changed set (`python3 -I tools/build_set.py tools/sets/<file>.py`), then with the app served
  (`python3 tools/serve.py 8765 &`): `IDS=<ids> node tools/tests/local_scenes.js` and `SFF_LANG=en IDS=<ids> node tools/tests/local_scenes.js`
  → 0 bad scenes; `IDS=math7-nov26,sci2,sci7 node tools/tests/local_english.js` → ok; `node tools/match_list.js <id>` for each.
- `review-practice-set` on the changed questions; report what changed (old → new, Hebrew and English) and the check results.
- Commit and push. **Never run `tools/deploy.sh` before the owner approves** – the deploy goes with the English version
  (`docs/english-production-prompt.md`).
