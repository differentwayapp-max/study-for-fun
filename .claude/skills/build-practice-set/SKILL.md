---
name: build-practice-set
description: MANDATORY before building, extending or rewriting any Study for fun practice set (a catalog set in tools/sets/<file>.py or a set for a family) – questions, options, explanations, pictures, chapters – with every rule the app, the games and the owner set. Use whenever asked to build a new practice set / test (שאלון, תרגול, מבחן), add chapters or questions, or rewrite questions.
---

# Building a practice set

A catalog practice set is a Python file `tools/sets/<file>.py` (name with `_`, id with `-`: `sci7_materials.py` → `sci7-materials`).
`tools/build_set.py` turns it into `public/share/<id>.txt` + its entry in `public/share/catalog.json`. Never edit `public/share/*.txt` by hand.
Kids answer by playing: multiple choice, connect-with-lines (התאמה בקו), memory (bonus), riddles (letter tiles) and spelling.
Every rule below exists because a child got a wrong "טעות", saw the answer in the picture, or was confused. Follow all of them.

## 0. Before writing
- **Source of the content:** the Israeli Ministry of Education curriculum for that grade and subject (`public/share/curriculum.json` lists the topics per grade). Material a parent sends (worksheet photo, presentation, word list) only shows WHAT the test covers – topics, words, kinds of exercises, level.
- **Copyright – own words only:** write every question, sentence, story, reading passage, table and explanation yourself. Never copy the source's wording, a sentence, a story, a passage, a table or an exercise – not even with small changes – and never a whole page or exercise list. Single words, concept names, numbers and facts are fine (a word list for a vocabulary test is fine). No textbook page numbers in chapter titles of catalog sets (a family's own exam set may keep them: the app shows "· עמ' 21" as the pages to study).
- Read an existing set of the same subject first (e.g. `tools/sets/sci4.py`, `en4.py`, `heb3.py`, `math5.py`) and copy its helpers (`W`, `Q`, `ROW`, `TWO`, `CARD`…) and layout.

## 1. File layout
- Header comment: grade, subject, the topics, `# Run: python3 -I tools/build_set.py tools/sets/<file>.py`.
- `SET = dict(name=…, grade=<0-based: 0 = א', 3 = ד', 6 = ז'>, subject="מתמטיקה"|"עברית / לשון"|"מדעים"|"אנגלית", title=…, desc=… (Hebrew), desc_en=…, tags=[…], examDate="", dailyGoal=2, perRound=10, topics=[…])`.
- `C` = list of chapters `(title, [topics], [questions], optional reading passage text)`. Organise by **fine topics, about 20 questions per topic (two chapters of ~10)**, so a parent can tick only what the test covers, plus a mixed review chapter.
- Question tuple: `(topic, question, [4 options], answer_index, explanation, scene)`; many sets use a `Q(...)` helper. The answer may be listed first – the build shuffles the options.
- Optional: `MAX_Q_WORDS` (default 6), `ANSWER_IN_Q_OK`, `KINDS` (station type: abc / gram / word / read / rev), `WORD_LIST` (every word must be a correct answer somewhere), `OLD_CODES`.
- Numbers and math inside Hebrew text go in `{…}` (wrapped in Unicode isolates by `W`), so "-5", "(3,-2)", "3/4" show the right way round.
- Reading passage chapter: 80–300 words, original text; its questions are played as multiple choice only.

## 2. Every question
- **Exactly 4 different options, ≤ 3 words each; exactly one correct.** Explanation ≤ 10 words, simple, says WHY. Question ≤ `MAX_Q_WORDS`.
- **No distractor is also correct** – not even a strange but grammatical sentence ("I have a girl"), not a synonym, not a looser true statement ("לא יגדל טוב" next to "יתייבש").
- **Distractors in the same form as the answer**: a pair answer ("אור וחום") → pair distractors; a tool → tools ("במגנט / בפילטר / בכף", not "באידוי"); insects → insects (or ask "מי מעביר אבקה?"); same gender/number/tense.
- **The question text never contains or hints the answer.**
- **Suited to the grade**, no trick questions, correct Hebrew (gender agreement, spelling, niqqud where the grade uses it) and correct English.
- A question that only makes sense next to its options ("Which of these…", "איזה מהם…", "מה מהבאים…", "מה נכון?", "מה לא שייך?") is fine – the app keeps it in multiple choice (`needOpts` in `public/index.html`). Use that wording on purpose whenever the answer is right only relative to the options ("איזה מספר הכי גדול?" → "איזה מהם הכי גדול?").

## 3. Pictures (the strictest rules – a parent's complaint)
Every question has a picture (`scene`): items `(emoji, x, y, size)` in a 0–100 frame, ground at y≈85.
- **The picture never shows or hints the correct answer, and never confuses.** Test: "Could a child who does not know the answer pick it by looking?" → change it. "Could it lead to a wrong answer, or is it unrelated?" → change it.
- What the picture shows, by question type:
  - **Naming** ("What is this?", "מה זה?", a verb, "X is for…"): the thing to name – the picture IS the question; it must point to exactly that word (🐸 for "jump" is wrong – the child thinks "frog"). Approved pairs: `tools/pic_rules.py`.
  - **Counting / arithmetic:** the objects (`COUNT(("🍎",3))`) or a text card of the given numbers (`TXT("5 + 3")`) – never the result.
  - **Reading a table / graph / sentence / clock:** that data.
  - **Every other question (knowledge, facts, categories, opposites, tools, concepts):** never the right option alone and never the answer + only one distractor. Show **all the options** (`OPTS(...)`), or the situation the question describes without its result ("which tool measures mass?" → the objects to weigh, not ⚖️), or no picture rather than a misleading one.
- **Option rows – `OPTS(...)`:** when the pictures ARE the options, write `OPTS("🐕", "🐈", "🐟", "🐦")` in the **same order as the options** (picture i ↔ option i; 3 pictures = the first 3 options, so put the option without a picture last). The build moves them so the answer is not always in the same place. Use plain `ROW(...)` (fixed order) for a story row (🍰 👍 🥕 👎), the question's data, a sequence/pattern, or any question about place or order (מימין, ראשון, לפני, first, left, order…) – the build refuses to move those.
- One emoji per scene item (several of the same → `COUNT`). All items inside the frame, not overlapping.
- **No emoji newer than 2019** (older phones show a box) – see `TOO_NEW` in `tools/pic_rules.py` (🧊 🪛 🪱 🪷 🪁 🪟 🫘 🧍 🧃 🪙 … are forbidden).
- No lone decoration (🤔 ❓ 🔢 ✏️ 📚 🎯 …) – show what the question is about.
- Text cards: ≤ 16 characters; a Hebrew card never uses "→" (write "←"); a card that is exactly the answer is an error; a card holding the answer is fine only when it is the question's own data.
- 🥛 is not glass, a litre or chocolate milk; 🍷 is not a liquid example – use a text card.

## 4. The match and memory games (a parent's complaint: a right line marked "טעות")
In these games all questions of a **chapter** meet: each question shows only its text and picture, and the answer cards are the chapter's correct answers. A line is accepted only to the question's own card or to a card with **identical** answer text (case-insensitive, except one-letter answers: D ≠ d).
- For every question, check every other answer card of the same chapter: **no other card may also answer it** – synonyms (big/large), a looser true answer, a grammatical alternative ("Put on your ___" → coat AND scarf), the same value in another form ("20 ₪"/"20", "1 מטר"/"מטר", "ימין"/"ימינה"), singular/plural, masculine/feminine ("קטן"/"קטנה" → "הזרם קטן"/"ההתנגדות קטנה").
- Fix in this order: make the two answers identical text when both truly fit both; make the question specific (add an anchor word, a unit, "לפי הצלעות", a Hebrew hint "(אוכל)"); or reword it to "איזה מהם… / Which of these…" so it stays in multiple choice.
- List each chapter's match-game questions and answer cards (from the last build): `node tools/match_list.js <id>`. The game logic: `needOpts`, `ansKey`, `modePool` in `public/index.html`.

## 5. Repetition
- **The same question must not appear twice** in a set, and not as an identical question in **any** set of the same subject (other grades included). The build warns `DUP vs <id>` (same text + answer, or the same numbers + answer). In a duplicate pair, change the **higher grade** and raise its level.
- Near-duplicates inside a set (same answer, almost the same wording) – vary them, unless they are deliberate practice of a core fact.
- **Core facts / characteristics (מאפיינים)** – the facts a child must simply know, e.g. "כמה דקות יש בשעה?" (60), "כמה מטרים יש בקילומטר?" (1,000), units, definitions, properties – are part of learning by repetition: the child should meet them more than once, but **varied** – a different game (choice → match → riddle), a different wording or angle ("כמה דקות בשעה וחצי?", "2 ק״מ = ? מטר", "60 דקות = ?"), a later chapter or the review. Never the identical question again and again in the same form.
- **Mark the core facts** of a set in `tools/core_facts.json` (set id → exact question texts, about 10–15% of the set, questions that make sense on their own): the app brings them back as 2–3 "🔁 שאלת חזרה" questions at the end of later stations, in another kind of game. If you reword a marked question, update its text there too (the build warns when a listed text is not found).

## 6. Build and check (every time)
1. `SFF_DRY=1 python3 -I tools/build_set.py tools/sets/<file>.py` – checks without writing (safe when several sets are edited at once). Must end with `ok (dry)`. Read every `warning:` line (picture card holding the answer, `DUP vs …`) and fix the real ones.
   `SFF_PICSTATS=1` prints how many option rows were shuffled and where the answer landed (≈25% per place is right).
2. `python3 -I tools/build_set.py tools/sets/<file>.py` – writes the set and the catalog entry (build sets one at a time).
3. With the app served (`python3 -m http.server 8765 --directory public &`): `IDS=<id> node tools/tests/local_scenes.js` → **0 bad scenes**.
4. `for t in tools/tests/local_*.js; do node $t; done` – all pass.
5. Commit and push. **Never run `tools/deploy.sh` before the owner approves.** Report: what was built/changed, what was skipped and why, the check results.
