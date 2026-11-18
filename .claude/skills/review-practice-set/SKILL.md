---
name: review-practice-set
description: Review catalog practice sets of Study for fun (or one set, or the live version) question by question against every rule – correct answers, distractors, pictures that give the answer away or confuse, match/memory clashes, duplicates across grades, copyright, picture order – and write the findings as tables with proposed fixes. Use when asked to check / review / audit a practice set, a test or the catalog (בדיקה, סקירה של שאלון / תרגול / קטלוג).
---

# Reviewing a practice set

The goal: find everything that would give a child a wrong "טעות", show the answer, confuse, or repeat – and propose an exact fix for each finding.
The rules are the ones in `.claude/skills/build-practice-set/SKILL.md` (read it first); this skill says how to check them and how to report.

## 0. What to review
- The source files `tools/sets/<file>.py` and what the app really shows: the built set `public/share/<id>.txt` (base64 JSON after `SFF1:` – options already shuffled, pictures already moved). Review the built version: that is what the child sees. Find each question in the source by its text.
- For the live site, compare with `https://study-for-fun-7b03c.web.app/share/catalog.json` and `/share/<id>.txt` (read-only).
- Name the version you reviewed (sff-vN, from `public/index.html` `<meta name="sff-ver">`) – question numbers (`sci7#250`) refer to it and move after any edit, so also quote the question text.
- Review **every** question, not a sample. One agent per set (or per subject) for the whole catalog.

## 1. Mechanical checks first
- `SFF_DRY=1 SFF_PICSTATS=1 python3 -I tools/build_set.py tools/sets/<file>.py` – errors, `warning:` lines (picture card holding the answer, `DUP vs <id>`), and where the answer lands among option pictures (about 25% per place; more than 40% in one place is an error).
- `node tools/match_list.js <id>` – per chapter, the questions that enter the match / memory games and the chapter's answer cards.
- With the app served: `IDS=<id> node tools/tests/local_scenes.js` (every picture renders inside the frame, nothing overlaps) and `node tools/tests/local_optsq.js`.

## 2. Per question – check all of these
1. **Correct:** the marked answer is right (recompute math; check facts, Hebrew grammar and spelling, English grammar).
2. **One correct option:** no distractor is also correct, including odd-but-grammatical sentences, synonyms and looser true statements.
3. **Distractors in the same form** as the answer (pair ↔ pairs, tool ↔ tools, same gender/number/tense) and plausible for the grade.
4. **Question text** does not contain or hint the answer; fits `MAX_Q_WORDS`; clear without the options unless it is an "איזה מהם / Which of these" question.
5. **Picture:**
   - gives the answer away? (the right option alone, or the answer + one distractor, or a text card that is the answer, or – in an option row – the answer always in the same place);
   - misleading / unrelated? (🐸 for "jump", 🥛 for glass, a picture that shows a distractor);
   - for naming questions: points to exactly that word; for counting: the given objects, not the result;
   - order: a question about place or order (מימין, ראשון, לפני, first, left, order, ABC order) must keep the picture in its source order; a story row (🍰 👍 🥕 👎) must not be shuffled; a row of the options should be `OPTS(...)` in option order;
   - emoji from before 2019 only (`TOO_NEW` in `tools/pic_rules.py`).
6. **Match / memory clash:** does any OTHER answer card of the same chapter also answer this question (given only its text and picture)? Include the same value in another form ("20 ₪"/"20", "1 מטר"/"מטר"), singular/plural, masculine/feminine, synonyms, a grammatical alternative. Identical answer texts are accepted by the game (not a clash); one-letter answers are case-sensitive (D ≠ d). Questions that `needOpts` keeps in multiple choice and reading-passage questions do not enter these games.
7. **Repetition:** the same question (same text + answer, or the same numbers + answer) in this set or in **any** set of the same subject; near-duplicates in the set (same answer, almost the same wording). Core facts ("כמה דקות יש בשעה?", "כמה מטרים יש בקילומטר?") should recur – but only in a varied form (other wording, another angle, another game), never as the same question again.
8. **Copyright:** no wording, sentence, story, passage, table or exercise copied from a textbook, worksheet or presentation; no textbook page numbers in catalog chapter titles.
9. **Grade and curriculum:** fits the grade and the Ministry of Education topics (`public/share/curriculum.json`); explanation ≤ 10 words, simple, says why.
10. **After a previous round:** check that every fix of the last fix prompt (`docs/catalog-review/fix-prompt-round*.md`) really happened and did not create a new problem (a new clash, a new duplicate, distractors in another form).

## 3. Severity
- **ודאי (certain):** a child who answers correctly gets "טעות" (wrong key, two correct options, a match clash), the picture shows the answer, a factual or language error.
- **קל (minor):** a possible but unlikely alternative, a weak distractor, a picture that hints, wording that could be clearer.
- **התלבטות (dilemma):** a question of taste or pedagogy – goes to `docs/catalog-review/dilemmas.md` (never edit that file without the owner).

## 4. Report
Write one file per subject group in `docs/catalog-review/reviews-roundN/<group>.md` (Hebrew), per set:
- a short summary (questions checked, findings by severity);
- tables – `| מזהה | ציטוט השאלה | בעיה | תיקון מוצע |` – under the headings: "אימות הבדיקה הקודמת", "בעיות בשאלות ששונו", "שגיאות ודאיות", "התנגשויות במשחקי התאמה" (with a severity column), "תמונות שמסגירות או מטעות", "כפילויות", "התלבטויות חדשות";
- every proposed fix must itself pass all the rules (4 options ≤ 3 words, explanation ≤ 10 words, no new clash or duplicate, picture rules) – check it before writing it down.
Then write the fix prompt `docs/catalog-review/fix-prompt-roundN.md` for the fixing session: the context, how to work (source files, build limits, the per-question checks, `SFF_DRY=1`, local_scenes, no `deploy.sh` before approval), the certain findings as a table, then pictures, changed questions, duplicates, small fixes, and the work order.
Do not change set files while reviewing, and never deploy.
