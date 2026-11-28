# English version of the practice content – a prompt for the work

> **For the owner (Hebrew summary):** this file is a ready prompt to give a new Claude Code session. It covers every
> catalog practice set: math and science get a full English version; the English sets get English only where the Hebrew is
> an instruction or an explanation; the Hebrew sets stay in Hebrew. Nothing was changed in the code while preparing it.
> Before you run it, decide the points in §2 (each has a recommended default).

---

## The prompt

You are working on the Study for fun repo (read `CLAUDE.md` first). The app has an English interface (`public/i18n.js`),
but it never translates learning content: everything inside `SKIP` (questions, options, explanations, passages, picture text)
and every set label (set name, chapter titles, topics, tags) shows in Hebrew even when the interface is English.
**The goal:** a professional, accurate English version of every catalog practice set that is not a Hebrew-language set, so
that a family using the English interface sees the whole practice in English.

### 1. What the survey found (28.11.2026, English mode, phone width)

A probe opened math3, sci4, en4 and heb3 in English mode (set page, road map, every game, end screen) and listed every
Hebrew string still on screen. The interface itself is almost fully translated. What stays Hebrew:

| Where | Examples | Comes from |
|---|---|---|
| Set header | "מתמטיקה · מתמטיקה ג'", "מדעים · מדעים ד'" | set `name` (subject is translated, name is not) |
| Chapter list, road map, end screen | "בונים מספרים", "תכונות המים", "ערך המקום עד 10,000 0/10" | chapter `title`, `topics` |
| Every question, option, explanation | "כמה עשרות יש ב-…", "הנפח גדל" | `questions[]` |
| Picture text cards | "דני", "16 סמ״ר", "מנסרה משושה", "? ← ג + ד" | `scene[].e` (1,081 different Hebrew cards in math + science) |
| Catalog card | Hebrew `title`, `tags`, `samples` | `catalog.json` (only `desc_en` exists today) |
| Parent's build form | curriculum topics per grade | `public/share/curriculum.json` |
| Interface gaps (not content) | "רגע…" (loading); **a bug:** heb3's chapter "פתיחה, אמצע וסוף" shows as "Open, אמצע וסוף" – the UI dictionary translates the word "פתיחה" inside a Hebrew-set label | `i18n.js` |

Scale of the job (catalog sets in `public/share/catalog.json`):

| Group | Sets | Questions | What to translate |
|---|---|---|---|
| Math | math1–math8, math7-nov26 | ≈ 3,150 | everything (≈ 85% of questions have Hebrew) |
| Science | sci1–sci8, sci7-materials | ≈ 2,760 | everything (all Hebrew) |
| English | en3–en8, en4-nov26, en7-nov26 | ≈ 2,650 | Hebrew instructions and explanations only (≈ 85% of explanations are Hebrew), §5 |
| Hebrew | heb1–heb8 | ≈ 2,700 | **nothing in the content** (§6) |

### 2. Decisions for the owner before starting (recommended default first)

1. **Spelling: American English** for all content (the English sets already use "color", "favorite", "center"; math terms
   "trapezoid", "math"). The interface dictionary uses some British forms ("practise") – leave the interface as it is.
   Fix the few British forms in existing `desc_en` lines ("litres" → "liters") for one convention in the content.
2. **Context stays Israeli:** keep ₪ (shekels), Israeli names (Dani, Noa, Yoav – transliterated, consistent within a set),
   Israeli places, seasons, plants, animals and the Sunday–Thursday school week. Translate, don't localize – the child
   studies in an Israeli school; changing a fact (₪ → $, Haifa → London) changes the question.
3. **Notation for an English reader:** division ":" → "÷" (only division – a ratio or a scale stays "1 : 500");
   remainder "3 ושארית 2" → "3 R 2"; units in English symbols (§4.3); geometry points in Latin letters (§4.4).
4. **Length limits in English** (English needs more words than Hebrew, whose articles and prepositions are prefixes):
   question ≤ 1.5 × the set's `MAX_Q_WORDS` (default 9), options ≤ 4 words, explanation ≤ 14 words, text card ≤ 16
   characters (unchanged). Same spirit as the Hebrew rules – short, simple.
5. **English sets (§5):** keep every Hebrew word that is the exercise itself (translation, meaning hints, Hebrew letter
   sounds); translate only instructions and explanations.
6. **Hebrew sets (§6):** content and chapter titles stay Hebrew; only the set name gets an English label
   ("Hebrew – Grade 3"). Alternative: also English chapter titles for the parent's screens – not recommended, the
   titles name Hebrew grammar the child learns in Hebrew.
7. **AI-built sets (family builds):** out of scope for this job; a later step can make the build language follow the
   parent's interface language (`c.lang` in `functions/prompts.js`).

### 3. How the English is stored and shown (stage A – app support, needs the owner's approval of code changes)

Content alone will not show: the app needs a small reading layer. Do this first, as its own reviewed commit, with tests.

- **Hebrew stays the canonical key.** History, mastery, `focusOf`, `wordStats`, `topicRows`, `core_facts.json`, the
  match keys of saved progress and the copies in families all use the Hebrew `topic`, chapter `title` and answer text.
  Never replace them – English is a display layer. Progress must survive switching the language.
- **Source:** one sidecar file per set, `tools/sets_en/<id>.json`, so the Hebrew set files stay untouched:
  `set: {name, title, tags[], desc}` (desc = today's `desc_en`), `topics: {he: en}`, `chapters: [{title}]` in chapter
  order, `questions: [{he: <Hebrew question text>, q, o: [4, in the SOURCE order, before the build shuffles], x, sc: {<item index>: text}}]`
  plus the passages of science sets that have them (`text`). Key each question by its Hebrew text + answer; the build
  fails when a question has no English, or when the Hebrew changed since it was translated (store a short hash of the
  Hebrew question + options).
- **`tools/build_set.py`** merges the sidecar: each question gets `en: {q, o, x, sc}` with the options in the SAME
  shuffled order as the Hebrew (apply the same permutation), chapters get `title_en`, `topics_en`, the set and its catalog
  entry get `name_en`, `title_en`, `tags_en`, `samples_en`. It runs every English check of §4.6 (word limits, 4 different
  options, a card that is exactly the answer, clashes in a chapter) the same way it runs the Hebrew ones.
- **The app (`public/index.html`):** when `EN()` and the question has `en`, show `en.q / en.o / en.x / en.sc`
  everywhere a question appears (choice, match, memory, riddle tiles, spell, review list, mistakes, focused practice,
  teacher reports, print). Match / memory compare answers by the DISPLAYED language (`ansKey` on the English option),
  but record results under the Hebrew key. Labels (`name`, chapter titles, topics, tags) through one helper. English text
  in English mode is read aloud with the English voice. A set without `en` (family builds) shows as it is today.
  Copies in families pick up `en` through the existing version update (`ver`), progress kept.
- **Interface fixes from the survey:** add "רגע…" to `i18n.js`; mark labels of Hebrew sets `translate="no"` (or keep them
  out of the word patterns) so "פתיחה" in a chapter title is not turned into "Open".
- Tests: a local test that loads a translated set in English mode and finds no Hebrew on any game screen, and in Hebrew
  mode finds no English that was not there before; `e2e_stats.js` / `e2e_focus.js` with a history made in Hebrew and
  read in English.

### 4. The translation (stage B – the main job), math and science

**Skills are mandatory** (CLAUDE.md): invoke `build-practice-set` before you start a set and `review-practice-set` when
it is done. Every rule there applies to the English version too – four different options, exactly one correct, no
distractor also correct, the question never gives the answer, the picture never gives it away, no match/memory clash.

#### 4.1 Quality standard
- Professional, accurate, natural English, as a native-speaking teacher in an English-medium school would write it for
  that grade: simple words for grades 1–3, standard curriculum terms from grade 4 on. Never a word-for-word gloss.
- **Meaning first:** the English question asks exactly what the Hebrew asks, with the same answer and the same difficulty.
  If a faithful translation makes the question ambiguous, wrong, or gives the answer away, reword the English (keep the
  same skill and answer) and note it in the report – never change the Hebrew.
- One term = one English term across all grades and sets (glossary §4.5). Before translating a set, list its terms and
  check them against the glossary and the sets already done.
- Numbers: keep the digits, thousands with commas (10,000), decimal point, fractions as "3/4" and mixed numbers "1 1/2",
  π, degrees, %. Keep the `{…}` math wrapping (or drop the isolate marks ⁦⁩ in English – LTR text does not need them; be
  consistent).

#### 4.2 English-only traps (check every question)
- **Articles give the answer away:** "An ___ is…" or "Which is an…?" where only one option starts with a vowel; "a/an"
  before a blank → rephrase ("Which one…", "Name the…") or make all options fit.
- **Agreement gives it away:** "Which are…" with one plural option, a verb that fits only one option, "is/are" after a
  blank. Hebrew gender hints disappear in English – that is fine; check that no new hint appears.
- **The answer word in the question:** cognates and shared roots that Hebrew did not have ("A *conductor* conducts…",
  "Which *magnetic* material is attracted to a *magnet*?"). Reword.
- **Two options become the same or synonyms in English** ("גדל" / "התרחב" → both "expanded"; "עיגול" / "מעגל" → both
  "circle"). Make them differ or change the distractor (in the same form as the answer).
- **Order and direction:** a picture row keeps its physical places (`left:%`, never mirrored). A Hebrew question about
  "ראשון / אחרון / לפני / אחרי / הבא" in a row read right-to-left becomes a different answer when an English child reads
  left-to-right. For every such question (rows built with `ROW`, sequences, patterns, "מימין / משמאל"): either say the
  direction explicitly ("the first from the right") or check that the answer is the same in both readings. "Right / left"
  stay physical and keep their meaning.
- **Hebrew-letter content in math/science:** labels like "משולש אבג", "נקודה ד" (§4.4); wordplay, roots or Hebrew
  abbreviations (סמ״ק) – translate the idea, never the letters.
- **Words with two meanings in Hebrew:** "עיגול" = rounding (math3 "עיגול לעשרות" → "Rounding to the nearest ten") and
  also a disk; "היקף" = perimeter (polygon) or circumference (circle); "במאונך" (column addition) ≠ "מאונך"
  (perpendicular); "מסה" (mass) ≠ "משקל" (weight, in newtons from grade 7).

#### 4.3 Units and notation
| Hebrew | English | Hebrew | English |
|---|---|---|---|
| מ״מ | mm | סמ״ר / מ״ר | cm² / m² |
| ס״מ | cm | סמ״ק / מ״ק | cm³ / m³ |
| מ' (מטר) | m | ליטר / מ״ל | L / mL |
| ק״מ | km | גרם / ק״ג / טון | g / kg / t |
| קמ״ש | km/h | ניוטון | N (newton) |
| ₪ / אגורות | ₪ / agorot (decision 2) | שעה, דקה, שנייה | hour, minute, second (h, min, s on cards) |
| 7 : 2 (חילוק) | 7 ÷ 2 | 1 : 500 (קנה מידה, יחס) | 1 : 500 (unchanged) |
| 3 ושארית 2 | 3 R 2 | ← (on a Hebrew card) | → (on an English card) |

Dates: words ("March 1"), never 1/3 (ambiguous). Time on cards: "7:30". Number words for grades 1–2 as in the Hebrew.

#### 4.4 Geometry labels
Hebrew letters as point / shape labels become Latin capitals in alphabet order: א→A, ב→B, ג→C, ד→D, ה→E, ו→F, ז→G,
ח→H (משולש אבג → triangle ABC, צלע אב → side AB, זווית ∢ב → angle B, "מסמר ג'" → "nail C"). Same mapping in the
question, the options, the explanation and every picture card of that question. A card "? ← ג + ד" → "C + D → ?".

#### 4.5 Glossary (one term each – extend it in this file as you go)
**Math – numbers and operations:** מנייה counting · מספרים סודרים ordinal numbers · זוגי / אי-זוגי even / odd · ישר
המספרים the number line · פירוקי 10 number bonds to 10 · עשרות שלמות whole tens · ערך המקום place value · אחדות, עשרות,
מאות, אלפים ones, tens, hundreds, thousands · עיגול ואומדן rounding and estimating · חיבור / חיסור במאונך column addition /
subtraction · מספר חסר missing number · לוח הכפל the times tables (multiplication table) · פי כמה? how many times as many? ·
כפל / חילוק דו-ספרתי בחד-ספרתי 2-digit by 1-digit multiplication / division · חילוק ארוך long division · חילוק עם שארית
division with remainder · סדר פעולות חשבון order of operations · סימני התחלקות divisibility rules · מחלקים, כפולות divisors
(factors), multiples · ראשוניים / פריקים prime / composite · בעיות מילוליות word problems · דיאגרמת תמונות pictograph ·
טבלאות ודיאגרמות tables and charts · חקר נתונים data handling.
**Fractions, decimals, percent, ratio:** שבר fraction · מונה / מכנה numerator / denominator · חצי, שליש, רבע half, third,
quarter · שברים שקולים equivalent fractions · צמצום / הרחבה simplifying / expanding · מספר מעורב mixed number · שבר גדול
משלם improper fraction · מכנים שונים unlike denominators · שבר עשרוני decimal (decimal fraction) · שבר פשוט (common)
fraction · עשיריות, מאיות tenths, hundredths · אחוז percent · הנחה / התייקרות discount / price increase · ריבית interest ·
יחס / יחסים שקולים ratio / equivalent ratios · חלוקה לפי יחס dividing in a ratio · פרופורציה proportion · קנה מידה scale ·
מהירות, דרך וזמן speed, distance and time · ממוצע mean (average) · חציון median · שכיח mode · הסתברות probability.
**Algebra (7–8):** מספרים מכוונים positive and negative numbers · ערך מוחלט absolute value · מספרים נגדיים opposite numbers ·
ביטוי אלגברי algebraic expression · כינוס איברים דומים combining like terms · חוק הפילוג the distributive law · משוואה
equation · נעלם unknown · אגף side (of an equation) · מערכת צירים coordinate plane · ציר x / ציר y x-axis / y-axis · פונקציה,
כלל, טבלה, גרף function, rule, table, graph · הצבה substitution · שיפוע slope · ישר עולה / יורד increasing / decreasing line ·
נקודות חיתוך עם הצירים intercepts · חזקה, בסיס, מעריך power, base, exponent · שורש ריבועי square root · חוקי חזקות laws of
exponents · נוסחאות הכפל המקוצר special products · אי-שוויון inequality · מערכת משוואות system of equations · פתרון גרפי
graphical solution.
**Geometry and measurement:** צורות / מצולעים shapes / polygons · משולש, מרובע, מחומש, משושה triangle, quadrilateral,
pentagon, hexagon · ריבוע, מלבן square, rectangle · מקבילית parallelogram · מעוין rhombus · טרפז trapezoid · דלתון kite ·
אלכסון diagonal · ישרים מקבילים / מאונכים parallel / perpendicular lines · זווית חדה, ישרה, קהה, שטוחה acute, right,
obtuse, straight angle · זוויות צמודות adjacent angles on a straight line (supplementary) – not just "adjacent" ·
זוויות קודקודיות vertical angles · מתאימות / מתחלפות corresponding / alternate angles · זווית חיצונית exterior angle ·
חוצה זווית angle bisector · משולש שווה שוקיים / שווה צלעות / ישר זווית isosceles / equilateral / right triangle · שוק, בסיס
(של משולש) leg, base · גובה height (altitude) · חפיפת משולשים congruent triangles · משולשים דומים similar triangles · משפט
פיתגורס the Pythagorean theorem · ניצב / יתר leg / hypotenuse · מעגל, עיגול circle (the line / the region – "area of a
circle") · רדיוס, קוטר radius, diameter · היקף perimeter; of a circle: circumference · שטח area · שטח פנים surface area ·
גופים 3D shapes (solids) · תיבה rectangular prism (box) · קובייה cube · מנסרה prism · פירמידה, גליל, חרוט, כדור pyramid,
cylinder, cone, sphere · פאה, מקצוע, קודקוד face, edge, vertex · פריסה net · נפח volume · הזזה, שיקוף translation (slide),
reflection · סימטריה / ציר סימטריה symmetry / line of symmetry · לוח שנה calendar.
**Science – matter and energy:** חומר material / substance · גוף object · נפח volume · מסה mass · משקל weight · צפיפות
density · ציפה ושקיעה floating and sinking · מצבי צבירה states of matter · מוצק, נוזל, גז solid, liquid, gas · התכה / נמס
melting / melts · קיפאון freezing · התאדות evaporation · רתיחה boiling · התעבות condensation · המודל החלקיקי the particle
model · התפשטות expansion · פעפוע diffusion · שינוי פיזיקלי / כימי physical / chemical change · תגובה כימית chemical
reaction · מגיבים / תוצרים reactants / products · שימור מסה conservation of mass · תערובת, תמיסה, ממס, מומס mixture,
solution, solvent, solute · סינון, שיקוע, אידוי filtering, settling, evaporating · בעירה burning (combustion) · משולש
הבעירה the fire triangle · יסוד, תרכובת, מולקולה, אטום element, compound, molecule, atom · גרעין, פרוטון, נייטרון,
אלקטרון nucleus, proton, neutron, electron · הטבלה המחזורית the periodic table · מתכות / אל-מתכות metals / nonmetals ·
נוסחה כימית chemical formula · אנרגיה: אור, חום, חשמל, תנועה light, heat, electrical, motion (kinetic) energy · אנרגיה
אצורה stored (potential) energy · המרת אנרגיה / שרשרת energy conversion / chain · מקורות מתחדשים renewable sources · מעבר
חום: הולכה, הסעה, קרינה heat transfer: conduction, convection, radiation · בידוד insulation · חום וטמפרטורה heat and
temperature · מעגל חשמלי electric circuit · טורי / מקבילי series / parallel · סוללה, נורה, מפסק, תיל battery, bulb,
switch, wire · מוליכים / מבודדים conductors / insulators · זרם, מתח, התנגדות current, voltage, resistance · הספק power ·
מפסק פחת safety switch (RCD) · מגנט, אלקטרומגנט magnet, electromagnet · אור: מקור, התפשטות בקו ישר, צל light: source,
travels in straight lines, shadow · החזרה reflection · שבירת אור refraction · שקוף / שקוף למחצה / אטום transparent /
translucent / opaque · עדשה מרכזת / מפזרת converging / diverging lens · קוצר / רוחק ראייה nearsightedness / farsightedness
· קול: רעידות, גובה, עוצמה sound: vibrations, pitch, loudness · כוח, כוח שקול force, net force · חיכוך friction · כוח
הכובד gravity · חוקי ניוטון Newton's laws · מהירות speed · מכונות פשוטות: מנוף, גלגלת, גלגל וסרן, מישור משופע simple
machines: lever, pulley, wheel and axle, inclined plane.
**Science – living things, body, Earth:** חי ודומם living and non-living · מאפייני היצור החי characteristics of living
things · תא, רקמה, איבר, מערכת cell, tissue, organ, system · רמות ארגון levels of organization · מיקרוסקופ microscope ·
בעלי חוליות / חסרי חוליות vertebrates / invertebrates · יונקים, עופות, זוחלים, דו-חיים, דגים mammals, birds, reptiles,
amphibians, fish · פרוקי רגליים, חרקים arthropods, insects · סימני היכר identifying features · מפתח מיון classification
key · התאמות adaptations · בית גידול habitat · צמח: שורש, גבעול, עלה, פרח, פרי, זרע root, stem, leaf, flower, fruit,
seed · נביטה germination · האבקה pollination · פוטוסינתזה photosynthesis · נשימה תאית cellular respiration · פיוניות
stomata · הובלה בצמח transport in plants · יצרנים, צרכנים, מפרקים producers, consumers, decomposers · שרשרת / מארג מזון
food chain / food web · טורף / נטרף predator / prey · יחסי גומלין interactions · גורמים ביוטיים / אביוטיים biotic /
abiotic factors · רבייה מינית / אל-מינית sexual / asexual reproduction · הפריה fertilization · החושים the senses · שיניים:
חותכות, ניבים, טוחנות teeth: incisors, canines, molars · שלד, מפרקים, שרירים skeleton, joints, muscles · רכיבי המזון
nutrients · פחמימות, חלבונים, שומנים, ויטמינים, מינרלים carbohydrates, proteins, fats, vitamins, minerals · מערכת העיכול
digestive system · ושט, קיבה, מעי דק / גס esophagus, stomach, small / large intestine · מערכת הנשימה respiratory system ·
קנה הנשימה, סמפונות, נאדיות trachea (windpipe), bronchi, alveoli · הלב ומחזור הדם the heart and circulation · עורקים,
ורידים, נימים arteries, veins, capillaries · מערכת ההובלה circulatory (transport) system · העין, אישון, רשתית eye, pupil,
retina · האוזן, עור התוף ear, eardrum · מעטפות כדור הארץ Earth's spheres · הידרוספרה, אטמוספרה, ליתוספרה, ביוספרה
hydrosphere, atmosphere, lithosphere, biosphere · מחזור המים the water cycle · קרקע soil · סלעים rocks · בליה / סחיפה
weathering / erosion · שימור קרקע soil conservation · מערכת השמש the solar system · מופעי הירח the phases of the Moon ·
סיבוב / הקפה rotation / revolution (orbit) · עונות השנה the seasons · אפקט החממה the greenhouse effect · שינוי האקלים
climate change · זיהום pollution · מחזור (פסולת) recycling.
**Technology and inquiry:** מערכת טכנולוגית technological system · קלט, תהליך, פלט, בקרה, משוב input, process, output,
control, feedback · מוצר, כלי product, tool · תיכון הנדסי engineering design · שאלת חקר research question · השערה
hypothesis · משתנה בלתי תלוי / תלוי independent / dependent variable · גורם קבוע controlled variable · ניסוי בקרה control ·
מכשירי מדידה measuring instruments · משורה, מאזניים, מד-חום graduated cylinder, scale (balance), thermometer.

#### 4.6 Pictures
- The scene stays the same (same emoji, same places). Translate only Hebrew text cards (≤ 16 characters, "→" instead of
  "←", Latin point labels, English units). A card must not become exactly the answer in English; a number-only card stays.
- Re-check every picture against the English question (the PIC rules): a picture that was fine for the Hebrew word may now
  point to a different English word, or to the answer.
- `OPTS` pictures are tied to the option index – the English options keep the source order, so the pictures still match.

#### 4.7 Match / memory in English
All answers of a chapter meet in these games. After translating a chapter, list its English answer cards
(`node tools/match_list.js <id>` – extend it to print the English when it exists) and check each question against every
other English card: synonyms (big / large), a looser true answer, the same value in another form ("20 ₪" / "20",
"1 m" / "1 meter"), singular / plural. Two Hebrew answers that become the same English text are fine only if each is truly
correct for both questions; otherwise make the English questions specific or move them to multiple choice
("Which of these…").

### 5. English sets (en3–en8, en4-nov26, en7-nov26)

The questions are English already; the Hebrew in them is the native-language side of an English lesson for Hebrew-speaking
children. Translate only the Hebrew that is an instruction or an explanation. Classify every Hebrew string first:

| Keep in Hebrew (it IS the exercise) | Translate |
|---|---|
| Translation questions and options: "לחם = ?" → bread; "\"bored\" means:" → ['שמח','רעב','משועמם','עייף']; "The dog is big. = ?" → Hebrew sentences | Instructions: "איזו מהן היא אות גדולה?" → "Which one is a capital letter?"; "האות הגדולה של h?" → "The capital letter of h?" |
| Meaning hints that a translation would give away: "fl_g (דגל)", "The noise … made me ___ (מעוצבן)" | Grammar explanations: "ed בסוף ← עבר" → "-ed at the end → past"; "תואר לפני שם עצם: warm socks" → "Adjective before the noun: warm socks"; "R גדולה. r, a, n קטנות" → "R is a capital. r, a, n are small." |
| Hebrew letters as sounds: "איזה צליל עושה האות R?" → ['ה','ו','ר','ל']; letter names in Hebrew script ('אֵיי') | Mixed explanations: translate the Hebrew words that explain, keep the glosses: "cat – hat: שתיהן נגמרות ב-at" → "cat – hat: both end in -at"; "un = לא ← unfair = לא הוגן" stays (a gloss) |
| Glosses in explanations: "לחם = bread", "dog = כלב, big = גדול", "S עושה ס, כמו ב-sun" | Chapter titles / topics / tags with Hebrew (most are English already) |

When unsure, keep the Hebrew and list the question in the report. The Hebrew-mode display of these sets must not change.

### 6. Hebrew sets (heb1–heb8)

No change to questions, options, explanations, passages, pictures or chapter titles. Only `name_en` ("Hebrew – Grade 3")
and, if missing, `desc_en`. Make sure the English interface never half-translates their labels (the "פתיחה" → "Open"
bug, §1).

### 7. Other content

- `catalog.json`: `name_en`, `title_en`, `tags_en`, `samples_en` for every non-Hebrew set (from the build).
- `public/share/curriculum.json`: an English line for each topic (same order), used by the parent's build form in English.
- `tools/core_facts.json` stays Hebrew-keyed (the canonical text) – nothing to translate.

### 8. Order of work and checks

1. Stage A (§3) – app support, tests, owner review. Until it is merged, the sidecars can still be written and checked.
2. Pilot: **math3** and **sci4** (one of each), full review, owner reads a sample of 30 questions of each and approves the
   style. Only then the rest.
3. One set per commit, in this order: math1–8 + math7-nov26, sci1–8 + sci7-materials, the English sets, the Hebrew-set
   names. A large set may be split by chapters across subagents, but one agent owns the set's glossary and consistency.
4. For every set:
   - Translate (fill the sidecar). Use the glossary; add new terms to §4.5.
   - **Independent review:** a fresh agent that did not translate, given the Hebrew and the English side by side (not
     your notes), checks question by question: same meaning, same single correct answer, distractors still wrong in
     English, §4.2 traps, picture and cards, grade-appropriate natural English, glossary terms. Fix what it confirms.
   - `review-practice-set` on the English version (its tables, with an English column).
   - `SFF_DRY=1 python3 -I tools/build_set.py tools/sets/<file>.py` → `ok (dry)`, no English warnings; then the real
     build; `IDS=<id> node tools/tests/local_scenes.js` → 0 bad scenes (in English too); `for t in tools/tests/local_*.js; do node $t; done`.
   - Look at the set in English mode (set page, road map, each game, end screen, the parent's tracking screen): no Hebrew
     left except what §5 / §6 keep. Hebrew mode: unchanged.
5. Report per set: questions translated, questions reworded in English (with the reason), Hebrew kept on purpose (en sets),
   problems found in the Hebrew source (report them – do not fix the Hebrew in this job), check results.
6. Commit and push to the working branch. **Never run `tools/deploy.sh`** before the owner approves; a change to
   `public/build-core.js` (if stage A touches it) needs both a hosting and a functions deploy.
