# תיקוני סבב 9 – en7, en7-nov26 ופריט אחד ב-en6

- **מקור הממצאים:** `docs/catalog-review/reviews-round9/en7.md`, לפי `docs/catalog-review/fix-prompt-round9.md`, סעיפים 1–4 וסעיף 5 (רק en6).
- **en8 לא נגעתי בו.** סוכן אחר עורך אותו. הפריט של en8 בסעיף 5 («Is the ice thick ___ to walk on?») נשאר לו.
- **לא נוספו שאלות "רמת מבחן"** (שדה שביעי `2`). הן שייכות לפרומט נפרד.
- **הקבצים ששונו:** `tools/sets/en7.py`, ‏`tools/sets/en7_nov26.py`, ‏`tools/sets/en6.py`, והקבצים הבנויים `public/share/{en7,en7-nov26,en6}.txt` ו-`public/share/catalog.json` (נבנו תחת ה-lock).
- **`tools/core_facts.json`:** לא היה צריך לשנות. אף שאלה ששונתה לא מופיעה שם, וה-build לא התריע על טקסט חסר.

## en7

### סעיף 1 – ודאי
| שאלה | מה נעשה | מצב |
|---|---|---|
| «I ___ a strange dream last night.» ✔ had (הקלף had התאים ל-«They ___ all the pizza») | ← «I ___ asleep in front of the TV last night.» ✔ fell (felt / fall / falled). הסבר: «fall – fell; fell asleep = נרדמתי». תמונה 😴 📺 | ✅ |
| «I like tea ___ coffee.» ✔ and (הקלף and התאים לכל הפרק) | ← «Which of these adds another idea?» ✔ and (but / so / because). השאלה יוצאת ממשחק ההתאמה. הסבר: «and = וגם, מוסיף רעיון». תמונה ☕ ➕ 🍵 | ✅ |
| «The sun was shining, ___ the water was cold. (אבל)» | הרמז «(אבל)» נמחק, והמסיח and הוחלף ב-or | ✅ |
| «Which is more polite: ___ you help me?» | ← «Which of these is more polite: ___ you help me?». עכשיו נשארת בבחירה מרובה | ✅ |

### סעיף 2 – כפילויות
| שאלה | מה נעשה | מצב |
|---|---|---|
| «We stayed home ___ it was raining.» (= en6) | ← «The match was cancelled ___ the field was full of water.» ✔ because (so / but / although). הסבר: «הסיבה לביטול ← because». תמונה ⚽ 💧 | ✅ |
| «I ___ TV last night.» (= en5) | ← «I ___ the whole film last night, but I didn't like it.» ✔ watched. תמונה 🎬 🌙. הקלף enjoyed נשלל בגלל "but I didn't like it" | ✅ |
| «I ___ ride a bike when I was six.» (קל, אותו מבנה כמו «swim when I was five») | ← «My grandpa ___ run fast when he was young.» ✔ could. תמונה 👴 🏃 | ✅ |
| «She was ___ a letter.» (קל, קרוב ל-en5) | ← «She was ___ a message to her friend.» ✔ sending (send / sent / sends). תמונה 👧 📱 | ✅ |
| «There aren't ___ eggs in the fridge.» (קל) | ← «There aren't ___ eggs, so I can't bake a cake.» | ✅ |
| «Yesterday we ___ to the beach by bus.» (קל) | ← «Last summer we ___ to Eilat by train.» ✔ went. תמונה 🚆 🏖️ | ✅ |

### סעיף 3 – התנגשויות קלות, תמונות וניסוח
| שאלה | מה נעשה | מצב |
|---|---|---|
| «This test was as ___ as last week's test.» (הקלף big) | ← «This test was as ___ as last week's. Again, everyone got 100.» (12 מילים) | ✅ |
| «I don't have ___ money – not even one shekel.» (הקלף much) | ← «I don't have ___ money. My wallet is empty!» | ✅ |
| «Add only ___ salt to the soup.» (הקלף some) | ← «Which of these fits? Add only ___ salt to the soup.» (יוצאת מההתאמה) | ✅ |
| «Which word shows a result?» (גם הקלף "לכן" מתאים) | ← «Which English word shows a result?» | ✅ |
| «Plastic bags are bad for the ___ – the world around us.» (הקלף climate) | ← «Plastic is bad for the ___ around us.» | ✅ |
| «The plane will ___ in Rome at six.» – התמונה 🛬 היא התשובה | תמונה ✈️ 🇮🇹 🕕 | ✅ |
| «אנרגיה סולארית = ___ energy» – תעתיק של התשובה | ← «Energy from the sun = ___ energy» ✔ solar. הסבר: «solar = של השמש». תמונה 🔋 🏠 | ✅ |
| «Which one is bad for the planet?» – ❓ קישוט | `OPTS("🏭", "♻️", "☀️", "🌳")` לפי סדר האפשרויות | ✅ |
| «…so I slept early.» – תרגום מעברית | ← «…so I went to bed early.» | ✅ |
| «They said yes! They ___ come to the party.» – המסיח did דקדוקי | did ← were | ✅ |
| «Global warming makes the Earth ___.» – warming מסגיר את warmer | ← «Because of global warming, ice in the Arctic ___.» ✔ melts (freezes / grows / builds). הסבר: «חם יותר ← הקרח נמס» | ✅ |
| «What did the writer play with the brother?» | ← «What did the writer play in the evening?» | ✅ |
| «What is the main idea of the text?» – אותה תשובה כמו שאלת האתגר | התשובה ← «a week offline» | ✅ |
| D2–D4 (quick/slow כתואר פועל, However עם פסיק, פרקי כתיבה ו-Unseen חדשים) | התלבטויות לבעלים | ⏭ דולג – לא בסבב התיקונים |

### סעיף 4 – הכותרת של en7
- הערת הכותרת שמפנה ל-en7-nov26 עודכנה: «…are in the separate set en7-nov26 ("Start of grade 7 review")…». זו הערה בקוד בלבד. ב-`title` וב-`desc` של en7 אין הפניה ל-en7-nov26.

## en7-nov26

### סעיף 4 – סידור הסט (נשאר בקטלוג)
- **השם:** «English ז' – start of grade 7 review».
- **הכותרת:** «Start of grade 7 review · Present Simple · Words».
- **התיאור:** «חזרה לתחילת כיתה ז': Present Simple (has, does, don't, שאלות, always / never), כ-110 מילים (מזג אוויר, טבע ומקומות, פעולות, תיאור) וקטע קריאה». ‏`desc_en` באותו תוכן. «112 מילים מהדף» ו-«worksheet words» הוסרו.
- **`examDate`:** ‏`"2026-11-18"` ← `""`. ‏`dailyGoal`: ‏5 ← 2, כמו בשאר סטי הקטלוג.
- **`perRound=13`:** נשאר, כי הפרקים בני 13 שאלות.
- **ההערות בקוד:** הוסרו «Student's Book p.37» ו-«Exam 18.11.2026» (בכותרת הקובץ ובהערה של `WORD_LIST`).
- **`MAX_Q_WORDS = 10`:** נוסף (הדוח המליץ על כך, D1-ב). בלעדיו השאלה החדשה בת 7 המילים לא עוברת.
- **`OLD_CODES` ו-`WORD_LIST`:** נשארו, כדי שהעותקים הקיימים ימשיכו להתעדכן.
- **לא נוספו:** `KINDS` ופרק Present Progressive. זו הרחבת תוכן, ולא תיקון ממצא.

### כפילויות (סעיף 2)
| שאלה | מה נעשה | מצב |
|---|---|---|
| «She ___ to school.» (= en5) | ← «She ___ to the pool every Monday.» ✔ goes. תמונה 👧 🏊‍♀️. **סטייה מהדוח:** הדוח הציע «She ___ swimming every Monday», אבל אחרי שהשאלה של Dad שונתה יש בפרק הקלף watches, ו-"She watches swimming every Monday" תקין | ✅ |
| «Dad ___ TV at night.» (= en5) | ← «Grandpa ___ the news every evening.» ✔ watches. תמונה 👴 📺 🌙 | ✅ |
| «She ___ a dog.» (= en4) | ← «Noa ___ long curly hair.» ✔ has. תמונה 👩‍🦱 | ✅ |
| «Do you ski? No, I ___.» (קל) | ← «Do they ski? No, they ___.» ✔ don't. המסיח am not הוחלף ב-aren't | ✅ |
| «We ___ time together.» (קל) | ← «How do you ___ your weekends?» ✔ spend. הסבר: «spend the weekend = לבלות את הסופ״ש». תמונה 👪 📅 | ✅ |

### התנגשויות ותמונות (סעיף 3)
| שאלה | מה נעשה | מצב |
|---|---|---|
| «My dog doesn't ___ trees.» | ← «My dog doesn't ___ up trees.» | ✅ |
| «I ___ when my alarm rings.» (הקלף leave) | ← «I ___ and open my eyes.» | ✅ |
| «What is this?» ✔ snow, תמונה ❄️ (מתפרש כקרח) | תמונה 🌨️ ⛄ | ✅ |
| «Who is he?» ✔ farmer / sailor – מסיחים city / problem | המסיחים: farmer / sailor / fan / pilot | ✅ |
| «סנטר = ?» – 🧔 (זקן, וגם התמונה של sailor) | תמונה 🧑 עם 👆 מתחת לסנטר | ✅ |
| «כדור הארץ = ?» – התשובה היחידה בת שתי מילים | האפשרויות: planet Earth / the moon / the sun / a city | ✅ |

## en6 (סעיף 5)
- «We stayed at home ___ it was raining.» ← «Which of these fits? We stayed at home ___ it was raining.» ✔ because. האפשרויות: because / but / so / or.
- המסיח and הוחלף ב-so, כי or כבר היה מסיח.
- נוסף «Which of these fits?» (כמו בשאלה אחרת באותו פרק). בלי זה, הקלף and של הפרק («I like apples ___ bananas», «I have a dog ___ a cat») עדיין היה מתאים במשחק ההתאמה.
- **לא תוקן (מחוץ למשימה, לסבב של en6):** «I'm hungry ___ I didn't eat breakfast.» ✔ because. גם שם המסיח and יוצר משפט דקדוקי («I'm hungry and I didn't eat breakfast»), וגם שם הקלף and מתאים במשחק ההתאמה.

## בדיקות
- **`SFF_DRY=1 SFF_PICSTATS=1 build_set`:**
  - en7: ‏`ok (dry): 372 questions`.
  - en7-nov26: ‏`ok (dry): 178 questions`.
  - en6: ‏`ok (dry): 460 questions`.
  - אין `warning` ואין `DUP`.
  - שורות `OPTS`: ב-en7 שש, והתשובה מפוזרת בין המקומות. ב-en7-nov26 התשובה ב-2/3/2/2.
- **build אמיתי (flock):**
  - en7 ‏`SFF1@en7-a424fe`.
  - en7-nov26 ‏`SFF1@en7-nov26-f79f7a`.
  - en6 ‏`SFF1@en6-2381a8`.
- **`local_scenes`:** ‏0 סצנות פגומות בכל שלושת הסטים.
- **`local_optsq`:** ‏`errs: []`, ‏`leaks: []`.
- **`match_list` (en7, en7-nov26):** כל שאלה ששונתה נבדקה מול כל קלפי הפרק שלה, ואין התנגשות חדשה. בדיקה ידנית של הצירופים: "cancelled so…", ‏"enjoyed the whole film, but I didn't like it", ‏"Grandpa sells the news", ‏"Noa does long curly hair", ‏"will run … when he was young".
- **כפילויות מול כל סטי האנגלית (כולל en8 הנוכחי, grep):** אין שאלה זהה לאף אחת מהשאלות החדשות.
- **`review-practice-set` על השאלות ששונו:**
  - (א) התשובות נכונות.
  - (ב) אין מסיח נכון.
  - (ג) המסיחים באותה צורה.
  - (ד) אין תמונה שמסגירה.
  - (ה) אין התנגשות.
  - (ו) אין כפילות.
  - **נקודה קלה אחת שנשארה:** «I don't have ___ money. My wallet is empty!» – עם הקלף much נוצר "I don't have much money. My wallet is empty!". המשפט סותר את עצמו, כך שהוא לא באמת נכון. זה הנוסח שהדוח הציע.
