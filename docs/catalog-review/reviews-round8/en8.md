# בדיקה (סבב 8) – en8, אנגלית כיתה ח' (sff-v159)

- **הגרסה שנבדקה:** sff-v159, `public/share/en8.txt` (ver `dd670fd2c7`), המקור `tools/sets/en8.py`. כל 12 קובצי `en8*.txt` ב-`public/share` זהים (אותו md5).
- **המזהים:** `en8#N` הוא אינדקס השאלה בקובץ הבנוי (מ-0). המספרים זזים אחרי כל עריכה, ולכן מצוטט גם טקסט השאלה.
- **מה נבדק:** כל 380 השאלות ב-37 פרקים, כולל ארבעת קטעי ה-Unseen (237, 231, 220 ו-235 מילים) ו-40 השאלות עליהם.
- **כפילויות:** הסט הושווה לכל סטי האנגלית: en3, en4, en4-nov26, en5, en6, en7, en7-nov26. ההשוואה נעשתה לפי דמיון טקסט, ולפי אותה תשובה בניסוח קרוב.
- **התאמה לתוכנית:** כל הנושאים מופיעים ב-`curriculum.json` לכיתה ח' (grade 7). חסר רק ‎-ness, שמופיע בתוכנית ולא בסט.

## סיכום

| | מספר |
|---|---|
| שאלות שנבדקו | 380 (40 מהן בקטעי Unseen) |
| ודאי | 12: ארבע שגיאות (שלוש התנגשויות במשחק ההתאמה, ושאלה אחת עם שתי תשובות נכונות) ושמונה כפילויות מול en5/en6/en7 |
| קל | 24 |
| התלבטויות חדשות | 3 |
| שגיאות מפתח, עובדה או דקדוק בתשובה המסומנת | 0 |

**בדיקות מכניות:**

| בדיקה | תוצאה |
|---|---|
| `SFF_DRY=1 SFF_PICSTATS=1 build_set` | `ok (dry): 380 questions`, בלי `warning` ובלי `DUP` |
| שורות תמונה שעורבבו | 1 בלבד (#150, `OPTS`). אין שורת אפשרויות נוספת |
| `local_scenes` (IDS=en8) | 0 סצנות פגומות |
| `local_optsq` | `errs: []`. ב-en8 נכנסות 30 מתוך 37 שאלות למשחקי ההתאמה |
| אימוג'י חדשים מ-2019 | אין |
| `qa` בקובץ הבנוי | ‏380/380 עברו |

**הערה על כלי:** `node tools/match_list.js` נשבר: `needOpts`, ‏`OPTS_EN` ו-`OPTS_HE` עברו מ-`public/index.html` ל-`public/build-core.js`. הרשימה הופקה בעותק מקומי שקורא את `build-core.js` (אותו כלל כמו במשחק). מומלץ לתקן את הכלי.

**הערה חשובה ל-match:** שאלות "Which time word…", ‏"Which modal…", ‏"Which noun…" ו-"Which phrase…" **כן** נכנסות למשחקי ההתאמה. `needOpts` תופס רק "which one" או "which of these", ‏"correct" וכדומה. בסט הזה לא נמצאה בהן התנגשות, אבל צריך לזכור את זה כשמנסחים.

---

## התאמה לרמת כיתה ח'

**השורה התחתונה:** הסט מכסה את רשימת הנושאים של ח', ואין בו שגיאות מפתח. אבל ברוב פרקי הדקדוק והמילים הוא **ברמה של en7 (כיתה ז')**, ולא בדרישה של מבחן ח'.
- **צורת השאלה:** כמעט כל השאלות הן "השלם מילה אחת במשפט קצר" או "תרגם מילה". 245 שאלות הן השלמה (‎___), ב-249 התשובה היא מילה אחת, ואורך שאלה ממוצע הוא 7 מילים. עוד 34 שאלות הן "מילה עברית = ?", ‏15 הן "X means:", ו-16 הן "V3 / Comparative / Noun / Opposite of X?".
- **מבחן ח' אמיתי בישראל** (תוכנית 2018, רמת Intermediate, ‏Band II) בודק בעיקר:
  - **רמת המשפט:** חיבור שני משפטים במילת זיקה או במילת קישור; המרת משפט שלם מפעיל לסביל; ניסוח שאלה לתשובה נתונה; מציאת טעות במשפט.
  - **רמת הטקסט:** Cloze של פסקה עם כמה זמנים, שבה הזמן נקבע לפי ההקשר; Unseen של 300–450 מילים עם שאלות הפניה (reference), הוכחה מהטקסט, היסק, רצף ומטרת הכותב; משימת כתיבה (פסקה, מכתב או מייל, דעה) עם משפט נושא ומילות קישור.
  - **Band II בהקשר:** משפחות מילים (succeed – success – successful), צירופים קבועים (collocations) ופעלים מורכבים (phrasal verbs). לא רק תרגום.
- **הכפילות מול en7:** בפרקי ה-modals, ה-quantifiers, ההשוואות ומילות הקישור, en8 שואל כמעט אותן שאלות כמו en7, באותה רמה:
  - en7#186–#188 ‏"Advice: … you ___" מול en8#121, ‏#128;
  - en7#232–#233 ‏"It was cold. ___, we went swimming" מול en8#250, ‏#252;
  - en7#195–#196 ‏"mustn't = ?" מול en8#125–#126;
  - en7#108 ‏"A plane is ___ (fast)" מול en8#118.
  
  כותרת המקור טוענת "The grade 7 sets … are not repeated here", אבל בפועל יש חפיפה גדולה.

### לפי פרק

| פרק | סוג המשימה היום | רמה מול ח' | מה חסר (דוגמאות שכתבתי, לא מספר לימוד) |
|---|---|---|---|
| ch0 Present Perfect: have/has + V3 | 5 מתוך 10 הן "Third form (V3) of X?", ועוד #361 בחזרה | **מתחת לרמה.** שינון V3 שייך לז'. בח' בודקים Present Perfect בשאלה, בשלילה ובהקשר | "This is the first time I ___ sushi." ✔ have eaten (ולא ate / eat / am eating). "___ he finished his project yet? – No, not yet." ✔ Has. "How long ___ here? – Since May." ✔ have you lived |
| ch1–ch3 ever/yet/since/for, Past Simple מול PP | השלמת מילה אחת במשפט בודד, עם מילת זמן שמסגירה את הזמן (yesterday, since) | **חלקית.** ההבחנה נכונה, אבל תמיד יש "מילת רמז" ואין הקשר של טקסט | **Cloze עם שני משפטים, בלי מילת רמז:** "I ___ Dana since 2019. We ___ at camp." ✔ "have known, met", מול "knew, have met" / "have known, have met" / "know, met". **מציאת טעות:** "Find the mistake: 'She has went home.'" ✔ went → gone |
| ch4–ch5 Past Progressive, when/while/during | השלמת was/were + ing | **בסדר לח'.** ‏during מול while הוא צעד מעל ז' | **שתי פעולות בטקסט:** "While Dad ___ (drive), we ___ (sing)." ✔ "was driving, were singing". **שאלה לתשובה:** "'I was reading at 9.' – What ___ at 9?" ✔ were you doing |
| ch6–ch7 Future | will / going to / am meeting. ברמה טובה (החלטה של הרגע, ראיה, סידור) | **בסדר**, אבל שני זוגות כמעט זהים (#63/#73, ‏#64/#79) | **עתיד בשאלה עם מילת שאלה:** "What time ___ the train leave?" ✔ does (לוח זמנים). **הבחנה בהקשר:** "Look at those clouds! It ___ rain." ✔ is going to, כשהמסיחים הם will rains / rains / is raining |
| ch8–ch9 First conditional | השלמת הפועל בחלק של if או של התוצאה | **בסדר**, חסרים unless ו-when | **unless:** "You'll miss the bus ___ you hurry." ✔ unless (מול if / when / so). **שני חלקים בשאלה אחת:** "If it ___ , we ___ inside." ✔ "rains, will stay" |
| ch10–ch11 השוואות | בעיקר "Comparative of X?" והשלמה עם רמז בסוגריים. as…as, so…that ו-the more…the better הם צעד טוב | **חלקית.** רוב הפרק חוזר על en7 ch10–11 | **one of the + superlative + plural:** "It's one of the ___ in Israel." ✔ oldest cities (מול oldest city / older cities / most old cities). **less … than:** "Walking is ___ than driving." ✔ less dangerous. **twice as … as** |
| ch12–ch13 Modals | must / mustn't / should / might, ותרגום ל"אסור" ו"לא חייבים" | **מתחת לרמה.** כמעט זהה ל-en7 ch19–20 | **could / was able to:** "I ___ swim when I was five." ✔ could. **(not) allowed to:** "Last year we ___ use phones in class." ✔ weren't allowed to. **needn't / don't need to:** "You ___ bring food. We have plenty." ✔ don't need to. **will have to:** "Next year you ___ wear a uniform." ✔ will have to |
| ch14–ch15 Quantifiers | too much/many, a few/a little, enough, plenty, both | **חלקית.** ‏a few, a little, some ו-enough כבר נלמדו ב-en7 | **neither / either / none:** "___ of my two friends came. I was alone." ✔ Neither. **each / every / all:** "___ of the 30 students got a certificate." ✔ Each, מול Every (שאינו מתאים לפני of). **few מול a few במשמעות:** "Few people came, so the party was ___." ✔ boring |
| ch16–ch17 who / which / whose | בחירת מילת זיקה אחת. where מופיע רק כמסיח, ו-whose רק פעם אחת | **מתחת לרמה.** בח' המשימה המרכזית היא **חיבור שני משפטים** | **where כמילת זיקה:** "This is the café ___ we first met." ✔ where. **whose:** "That's the girl ___ mother is a pilot." ✔ whose. **חיבור משפטים (שאלת Which of these):** "Join: 'I have a cousin. She lives in Rome.'" ✔ "a cousin who" / "a cousin which" / "a cousin she" / "a cousin whose". **השמטת המילה:** "The book (which) I read" – "In which sentence can 'which' be left out?" |
| ch18–ch19 Passive | השלמה של is/was + V3, משפטים קצרים מאוד | **חלקית.** אין המרה של משפט שלם, ואין שאלה או שלילה בסביל בעבר | **המרה:** "Active: 'The dog bit Tom.' Passive: Tom ___ by the dog." ✔ was bitten. **שאלה בסביל:** "___ the windows cleaned yesterday?" ✔ Were. **שלילה:** "The letter ___ sent. It's still here." ✔ wasn't. **פעיל או סביל בהקשר:** "The museum ___ 2 million visitors a year." ✔ gets (מול is got / is visited / was visited) |
| ch20–ch21 used to | 6 מתוך 10 עם התשובה "used to" וכמעט אותם מסיחים (use to / is used / was use) | **מתחת לרמה.** תרגיל צורה חוזר על עצמו | **used to מול Past Simple בהקשר:** "When I was ten, I ___ to the beach every Friday. Last Friday I ___ to the zoo." ✔ "used to go, went". **ניגוד עם now:** "We ___ have a car, but now we take the bus." ✔ used to, מול "used to not" / "didn't use" / "use to" |
| ch22–ch23 Word building | "Noun of X?" ו-"Opposite of X?" בודדות, וכמה השלמות | **חלקית.** אין ‎-ness (בתוכנית!), אין ‎-ly, ‏-er/-or, ואין משפחות מילים במשפט | **‎-ness:** "Thank you for your ___ (kind)." ✔ kindness. **‎-ly:** "She answered every question ___ (correct)." ✔ correctly. **משפחת מילים:** "The test was a big ___ for me." ✔ success, מול succeed / successful / successfully. **חלק דיבר:** "In 'a careful driver', careful is a/an:" ✔ adjective |
| ch24 Writing a paragraph | מונחים ("Which sentence gives the main idea") וזיהוי של משפט בודד | **מתחת לרמה.** במבחן ח' כותבים פסקה. כאן רק מזהים מונח | **פרק קריאה (passage) של "פסקה לדוגמה"** עם משפטים ממוספרים (1)–(6). שאלות: "Which sentence is the topic sentence?" ✔ (1); ‏"Which sentence does NOT belong?" ✔ (4), משפט שסוטה מהנושא; "Which word fits gap A?" ✔ Moreover; "Which is the best concluding sentence?"; ‏"Which greeting ends an informal email?" ✔ Best wishes. כך נשארים במגבלת 3 מילים לתשובה |
| ch25 Connectors | although / however / therefore / in addition, ותרגום | **מתחת לרמה.** זהה לרמת en7 ch23 | **despite / in spite of + שם עצם:** "___ the rain, the game went on." ✔ Despite (מול Although / However / Because). **because מול because of:** "The flight was late ___ the storm." ✔ because of. **so מול such:** "It was ___ a hot day that we stayed in." ✔ such. **as a result / on the other hand / whereas** |
| ch26–ch31 Band II (סביבה, טכנולוגיה, בריאות, נסיעות, מדיה, רגשות) | 34 שאלות תרגום "X = ?", והשאר השלמה של מילה במשפט קצר. המילים עצמן ברמת Band II טובה | **חלקית.** בחירת המילים טובה, אבל אין צירופים, פעלים מורכבים או משפחות מילים | **phrasal verbs:** "Don't give ___! You can finish the race." ✔ up; "We've run ___ of milk." ✔ out. **collocations:** "Please pay ___ to the instructions." ✔ attention; "We need to ___ a decision today." ✔ make (מול do / take / give). **אותה מילה בשני מובנים:** "book a room" מול "read a book" |
| ch32–ch35 Unseen | 4 טקסטים טובים ומקוריים (מאמר, מכתב, מאמר, סיפור), 220–237 מילים, 10 שאלות בחירה לכל טקסט. יש רעיון מרכזי, פרטים, מילה בהקשר, NOT, מטרת הכותב והיסק קל (#327, ‏#336) | **מעט קצר וקל מדי.** במבחן ח' הטקסט באורך 300–450 מילים. אין שאלות הפניה, הוכחה, רצף או עובדה מול דעה | **הפניה:** "In paragraph 2, 'This light' refers to:" ✔ blue light. **הוכחה:** "Which paragraph explains why bees are disappearing?" ✔ paragraph 2. **רצף:** "What did Shira and Omer do FIRST?" ✔ checked news sites. **עובדה מול דעה:** "Which is an opinion?" ✔ "Bees are amazing". **כותרת לפסקה:** "The best title for paragraph 4:" ✔ "How you can help". **סוג טקסט חסר:** טקסט טיעון (בעד ונגד), וטקסט מידע עם טבלה |
| ch36 חזרה | 20 שאלות מכל הנושאים | **חסרים נושאים.** אין Passive, ‏used to או גזירת מילים (גם ב-`topics` של הפרק) | ראו "קל" בהמשך |

### נושאים שחסרים לגמרי (מקובלים במבחני ח')
1. **Gerund מול infinitive:** "I enjoy ___ to music." ✔ listening (מול to listen / listen / listened). "We decided ___ a puppy." ✔ to adopt.
2. **unless, ו-when/as soon as לעתיד:** "I'll call you as soon as I ___ home." ✔ get.
3. **ניסוח שאלה לתשובה נתונה:** "'She has lived here for 5 years.' – How long ___ here?" ✔ has she lived.
4. **מציאת טעות ותיקונה:** "Find the mistake: 'If it will rain, we'll stay.'" ✔ will rain → rains.
5. **‎-ness, ‏‎-ly ומשפחות מילים** (‎-ness כתוב ב-`curriculum.json`).
6. **phrasal verbs ו-collocations של Band II.**
7. **כתיבה:** מבנה מייל או מכתב (פתיחה, סיום, פסקה), פסקת דעה (In my opinion, I believe, To sum up), ומשפט שלא שייך לפסקה.
8. **Unseen ארוך יותר** (300–400 מילים) עם שאלות הפניה, הוכחה ורצף, וטקסט מסוג טיעון או מידע עם טבלה.

### המגבלה המבנית
- **הכללים:** אפשרות של עד 3 מילים, ושאלה של עד 12 מילים (`MAX_Q_WORDS = 12`).
- **מה הם חוסמים:** את רוב המשימות ברמת המשפט, כמו המרה מלאה לסביל או משפט מחובר כתשובה.
- **מה אפשר לעשות בתוך הכללים:**
  - תשובה של 3 מילים שנושאת את הצורה ("was built / were built …", ‏"have known, met");
  - "Which of these…" עם כרטיס טקסט;
  - **פרק קריאה (passage)** לכל משימה ברמת הטקסט: פסקה עם פערים, פסקת כתיבה לדוגמה, מייל. השאלות עליו הן בחירה מרובה בלבד, והטקסט יכול להיות עד 300 מילים.
- ראו התלבטות 1.

---

## אימות הבדיקה הקודמת

| מזהה | ציטוט השאלה | בעיה (סבב קודם) | מצב היום |
|---|---|---|---|
| en8#42 | "While she ___ (read), her phone rang." | כמעט זהה ל-en7#358 (fix-prompt-dilemmas) | ✅ שונה. נשאר דמיון של מבנה ל-en7#73 ‏"___ I was cooking, the phone rang" ול-en8#50. זה "אותו ידע בגיוון", תקין |
| en8#344 | "dropped" (paragraph 2) means: | המסיח "נפל" נכון בחלקו | ✅ המסיחים עכשיו נשבר / גדל / נעלם |
| en8#225, ‏#318, ‏#115, ‏#264, ‏#374 | colorful, practice, harbor | איות אמריקאי אחיד | ✅ אחיד. במילים נשארו כמה בריטיות: rubbish ‏(#96), petrol ‏(#75), "diary" ליומן פגישות (#65), "at weekends" (Unseen 1). ראו התלבטות 3 |
| en8#129 | "You ___ drink so much cola. It's advice, not a rule." | התנגשות mustn't (dilemmas) | ✅ "It's advice, not a rule" פותר את ההתנגשות |
| en8#143 | "The hall is empty. Take ___ seat you like – just one." | כפילות "not a drop" (סבב 5) | ✅ ללא שינוי, תקין |
| en8#214 | "Thirty years ago, people ___ have smartphones." | "A hundred years ago … phones" (סבב 3–4) | ✅ |
| ch16–17 | who / which | "that" נכון תמיד (סבב 4) | ✅ אין "that" נכון בין המסיחים. ב-#168 ו-#179 ‏that שגוי, וזה נכון |
| en8#241, ‏#243 | "supporting sentence" | יחיד/רבים (סבב 4) | ✅ אחיד |
| en8#142 | "We need two more chairs. We don't have ___." | כפילות en7 ‏"We don't have ___ chairs for everyone" (סבב 3) | ⚠️ הכפילות תוקנה, אבל נוצרה **התנגשות חדשה** עם הקלף any. ראו "התנגשויות" |
| en8#169 | "Look! There's the dog ___ bit me!" | who מקובל על בעל חיים (dilemmas.md) | ➖ עדיין פתוח ב-dilemmas.md. לא נבדק מחדש כממצא |

**בעיות בשאלות ששונו:** רק #142 (ראו למטה).

---

## שגיאות ודאיות

| מזהה | ציטוט השאלה | בעיה | תיקון מוצע |
|---|---|---|---|
| en8#123 | "Tomorrow is Saturday. I ___ get up early." ✔ don't have to (has to / must / mustn't) | **שתי תשובות נכונות:** "I must get up early" תקין לגמרי. אולי יש טיול בשבת. ההקשר "שבת" רק מרמז. גם במשחק ההתאמה הקלפים must, ‏should, ‏shouldn't ו-mustn't יוצרים משפט תקין | "No school tomorrow, so I ___ get up early." ✔ don't have to, אותם מסיחים. ‏so מחייב היגיון של תוצאה: must ו-mustn't סותרים אותו, ו-has to לא דקדוקי. 9 מילים. ההסבר: "אין חובה ← don't have to" |

(שלוש ההתנגשויות הוודאיות בטבלה הבאה. שמונה הכפילויות הוודאיות בטבלת "כפילויות".)

---

## התנגשויות במשחקי התאמה

| מזהה | ציטוט השאלה | חומרה | בעיה | תיקון מוצע |
|---|---|---|---|---|
| en8#13 (ch1) | "Have you ___ tried sushi? – No, not once." ✔ ever | **ודאי** | הקלף already (#11) יוצר "Have you already tried sushi? – No, not once.", תקין לגמרי. גם הקלף never (#12) יוצר "Have you never tried sushi?", שאלת הפתעה תקינה | "Is this the first time you've ___ flown?" ✔ ever (since / for / yet / ever). already, never ו-yet לא מתאימים אחרי the first time. התמונה ✈️ 😬. ההסבר: "the first time + Present Perfect ← ever" |
| en8#142 (ch14) | "We need two more chairs. We don't have ___." ✔ enough | **ודאי** | הקלף any (#143) יוצר "We don't have any", תקין, במובן "אין לנו עוד". גם many מתאים בערך | "Is the ice thick ___ to walk on?" ✔ enough (enough / much / too / very). אחרי תואר אף קלף אחר בפרק לא מתאים. נמנעתי מ-"old enough" ומ-"warm enough", שכבר מופיעים ב-en7#173 ו-#176. התמונה ⛸️ 🚶. ההסבר: "אחרי תואר: thick enough = עבה מספיק" |
| en8#212 (ch21) | "You used to have a dog, right?" – "Yes, I ___." ✔ did | **ודאי** | הקלף used to (#219) יוצר "Yes, I used to.", תשובה טבעית ונכונה | להעביר לבחירה בלבד: "Did you use to have a dog? Which answer is correct?" ✔ "Yes, I did", מול "Yes, I used" / "Yes, I was" / "Yes, I do". 10 מילים, כל אפשרות 3 מילים, ו-"is correct" תופס את `needOpts` |
| en8#92 (ch9) | "She'll be angry if you ___ her bike." ✔ break | קל | הקלף leave (#94) יוצר "if you leave her bike", אפשרי (משאירים אותו בחוץ) | "If you ___ that vase, Mom will be angry." ✔ break (breaking / broke / will break). התמונה 🏺 😠 |
| en8#49 (ch4) | "She hurt her hand while she ___." ✔ was cooking | קל | הקלף was reading (#42) יוצר משפט תקין. רק התמונה 🔪 🥕 מכריעה | "She burned her hand while she ___ dinner." ✔ was cooking (were cooking / is cooking / cooks) |
| en8#121, ‏#128 (ch12) | "Take my advice: you ___ revise tonight…" / "My advice: you ___ take an umbrella." ✔ should | קל | הקלף must (#120) יוצר עצה חזקה ותקינה ("you must revise") | ‏#121 ← "It's only advice: you ___ revise tonight for the test." (10 מילים). ‏#128 ← "It'll rain. Just advice: you ___ take an umbrella." (9 מילים). "only advice" ו-"Just advice" שוללים את must. ‏shouldn't לא מתאים במשמעות |
| en8#120 (ch12) | "Drivers ___ stop at a red light. It's the law." ✔ must | קל | הקלף should יוצר משפט נכון, אבל רופף יותר | "Drivers ___ stop at a red light. There's no choice." (10 מילים) |
| en8#122 (ch12) | "You ___ touch the paintings. It's forbidden in this museum." ✔ mustn't | קל | הקלף shouldn't (#129) יוצר משפט נכון, אבל רופף יותר | "You ___ touch the paintings. It's a rule, not advice." (10 מילים) |
| en8#130 (ch13) | "Take a coat. It ___ be cold later." ✔ might | קל | הקלף should (#134, ‏#139) יוצר "It should be cold later" (צפוי), תקין | "Take a coat. It ___ be cold later – nobody knows." (10 מילים) |
| en8#234 (ch23) | "The door isn't locked. It's ___." ✔ unlocked | קל | הקלף unsafe (#237) יוצר "It's unsafe", מסקנה הגיונית | "The door is ___. Come in!" ✔ unlocked (אותם מסיחים) |
| en8#310 (ch31) | "I found my lost dog, so I'm not worried. I feel ___." ✔ relieved | קל | הקלף cheerful (#318) מתאים כתשובה רופפת ("I feel cheerful") | "I found my lost dog. Phew! I feel ___ (הוקל לי)." עם רמז בעברית, כמו ב-#313 (10 מילים) |
| en8#244 (ch24) | "'Dogs make great pets.' This is a:" ✔ topic sentence | קל | בלי הקשר, משפט כזה יכול להיות גם משפט סיכום (הקלף concluding sentence) | "A paragraph starts: 'Dogs make great pets.' This is a:" (8 מילים) |

שאר הפרקים נבדקו קלף מול כל שאלה (ch0–ch31, ch36), ולא נמצאו בהם התנגשויות.

---

## תמונות שמסגירות או מטעות

| מזהה | ציטוט השאלה | בעיה | תיקון מוצע |
|---|---|---|---|
| en8#151 | "Which noun is countable?" ✔ coin (money / water / advice). התמונה `ROW("💰","💧","💬")` | **קל.** לתשובה אין תמונה, ו-💰 (שק כסף) מצויר ליד money אבל נראה כמו מטבעות. הילד עלול לקשר את 💰 ל-coin, ובכל מקרה התמונה מתאימה רק לשלושה מסיחים. (🪙 חדש מדי) | להחליף את התשובה ל-egg: האפשרויות egg / money / water / advice, והתמונה `OPTS("🥚","💰","💧","💬")`. ההסבר: "egg – one egg, two eggs" |
| en8#352 | "Who is Shira?" ✔ Omer's sister (Omer's teacher / a news presenter / a journalist friend). התמונה 👧 📱 | **קל.** הילדה 👧 מרמזת על אחות, ומרחיקה את המסיחים של מבוגרים (teacher, presenter) | `ROW("📱", "🦈")` (הסרטון) |

לא נמצאה תמונה שמראה את התשובה. כל כרטיסי הטקסט (#111, ‏#113, ‏#114, ‏#138, ‏#249, ‏#315, ‏#359) הם נתוני השאלה עצמה.

---

## כפילויות

| מזהה | ציטוט השאלה | חומרה | בעיה | תיקון מוצע |
|---|---|---|---|---|
| en8#23 | "___ you see the match last night?" ✔ Did | **ודאי** | כמעט זהה ל-en6#173 ‏"___ you see the game last night?" (did), ודומה ל-en5#232 | "___ your parents meet at school or at work?" ✔ Did (Have / Has / Were). ‏Do הוצא, כי "Do your parents meet…" תקין בהווה |
| en8#64 | "I promise I ___ tell anyone your secret." ✔ won't | **ודאי** | כמעט זהה ל-en7#91 ‏"Don't worry, I ___ tell anyone." (won't), ודומה גם ל-#79 בסט | "I promise I ___ use your phone without asking." ✔ won't (wasn't / am not / not). didn't ו-don't הוצאו, כי "I promise I didn't…" תקין |
| en8#118 | "A plane is much ___ (fast) than a train." ✔ faster | **ודאי** | כמעט זהה ל-en7#108 ‏"A plane is ___ (fast) than a car." | "The new phone is much ___ (light) than the old one." ✔ lighter (lightest / light / more light). 11 מילים |
| en8#125 | "mustn't" means: ✔ אסור | **ודאי** | זהה בתוכן ובתשובה ל-en7#195 ‏"mustn't = ?" (אסור). זו עובדת ליבה (`core_facts.json`), אבל צריך לחזור עליה בגיוון | '"You mustn't run here." means:' ✔ אסור לרוץ (לא חייב לרוץ / כדאי לרוץ / אולי ירוץ). לעדכן את הטקסט גם ב-`core_facts.json` |
| en8#126 | "don't have to" means: ✔ לא חייבים | **ודאי** | זהה ל-en7#196 ‏"don't have to = ?" | '"You don't have to come." means:' ✔ לא חייב לבוא (אסור לבוא / כדאי לבוא / אולי יבוא). לעדכן ב-`core_facts.json` |
| en8#255 | "although" means: ✔ למרות ש | **ודאי** | זהה ל-en7#234 ‏"although = ?" | '"Although it rained, we played." means:' ✔ למרות הגשם שיחקנו (שיחקנו בגלל הגשם / לא שיחקנו בגשם / שיחקנו לפני הגשם). לעדכן ב-`core_facts.json` |
| en8#154 | "There isn't ___ sugar left." ✔ much | **ודאי** | כמעט זהה ל-en7#204 ‏"There isn't ___ milk." (much) | "We can't bake today. There isn't ___ flour." ✔ much (a few / many / few). בפרק אין קלף אחר שמתאים |
| en8#363 | "We ___ the museum last Sunday." ✔ visited | **ודאי** | כמעט זהה ל-en5#203 ‏"We ___ our grandma last Sunday." (visited). זו רמה של ה' | "We ___ the new museum when it opened in 2022." ✔ visited (visit / has visited / have visited) |
| en8#20 | "I ___ to my grandma on the phone yesterday." ✔ talked | קל | ניסוח כמעט זהה ל-en6#142 ‏"I ___ my grandma on the phone yesterday." (called), עם תשובה אחרת | "We ___ about the trip the day before yesterday." ✔ talked (אותם מסיחים) |
| en8#250 | "It was raining. ___, we went to the beach." ✔ However | קל | אותו מבנה ואותו רעיון כמו en7#233 ‏"It was cold. ___, we went swimming." | "The tickets were expensive. ___, we bought them." ✔ However |
| en8#252 | "___ it was cold, she didn't wear a coat." ✔ Although | קל | מאוד דומה ל-en7#232 ‏"___ it was cold, we went swimming." | "___ she had a map, she got lost." ✔ Although |
| en8#258 | "She is rich. ___, she isn't happy." ✔ However | קל | אותו משפט כמו en7#228 ‏"He is rich, ___ he isn't happy." (but) | "The film got great reviews. ___, I found it boring." ✔ However |
| en8#102 ↔ en8#367 | "This is the ___ day of my life!" / "This is the ___ pizza in town!" ✔ best | קל | בתוך הסט: אותה תבנית, אותן אפשרויות בדיוק (most good / goodest / best / better) | ‏#367 ← "This is the ___ (bad) pizza in town!" ✔ worst (baddest / worse / most bad). בפרק החזרה אין קלף אחר שמתאים. אין כאן כפילות עם #101, כי השאלה שם בנויה אחרת ("Superlative of bad?") |
| en8#63 ↔ en8#73 | "We ___ to visit Rome." / "Next summer we ___ to visit Greece." ✔ are going | קל | בתוך הסט: אותה תבנית ואותם מסיחים | ‏#73 ← "We aren't ___ to visit Greece this summer." ✔ going (go / will / goes). בפרק הקלף going זהה ל-#77, ולכן תקין |
| en8#64 ↔ en8#79 | "I promise I ___ tell…" / "I ___ forget your birthday again. I promise!" ✔ won't | קל | בתוך הסט: שתי הבטחות עם won't. מטופל בתיקון של #64 למעלה | – |

"אותו ידע בגיוון", לא כפילות ותקין:
- #41 מול en7#63 (were playing football);
- #50 מול en7#73;
- #52 מול en7#358;
- #105 מול en7#110;
- #374 ו-#375 מול #264 ו-#270 (עובדות ליבה בזווית חדשה).

---

## קל – עוד ממצאים

| מזהה | ציטוט השאלה | בעיה | תיקון מוצע |
|---|---|---|---|
| en8#328 | "Which tip is NOT in the article?" – האפשרות "use alarm clock" | אנגלית לא תקינה (חסר an) | "use an alarm" (3 מילים) |
| en8#335 | "What happened while they were swimming?" – המסיח "Dad lost glasses" | אנגלית טלגרפית (חסר his) | "Dad's glasses fell" או "glasses got lost" (3 מילים) |
| ch36 חזרה כללית | ב-`topics` של הפרק ובשאלות שלו אין Passive, ‏used to ו-Word building | שלושה נושאים של הסט לא חוזרים בחזרה | להוסיף את PS, ‏UT ו-WF ל-`topics`, ולהחליף שלוש שאלות חלשות (למשל #368 ‏bigger ו-#370 ‏How many brothers, ברמת ו'–ז') ב: "Paper ___ from trees." ✔ is made (is make / makes / made); "When he was young, my grandpa ___ work on a farm." ✔ used to (use to / was use / uses to). ‏"When he was young" שולל את הקלף should; "He forgot his keys again. He's so ___." ✔ careless (careful / uncareful / careness). לבדוק אחר כך התנגשויות קלפים בפרק החזרה |
| כותרת `tools/sets/en8.py` | "The grade 7 sets (en7, en7_nov26) are not repeated here." | לא מדויק. ראו טבלת הכפילויות | לעדכן אחרי התיקונים |
| `tools/match_list.js` | – | הכלי נשבר אחרי שההגדרות עברו ל-build-core.js | לקרוא את `public/build-core.js` (עם `OPTS_NOT`) במקום את `index.html` |

**נבדק ותקין** (שאלות שהן חשד טבעי לתשובה נוספת):
- #21 "I ___ to London twice in my life" (went – התלבטות ישנה);
- #73 "go" כמסיח;
- #85 "are";
- #95 "would";
- #97 "dies";
- #183 "grow" (נשלל בגלל "Passive:");
- #217 ו-#203 (התלבטות ישנה);
- #327 "can't concentrate" (בטקסט: "find it hard to concentrate". מקובל);
- #337 "active" (מילה מהקטע).

---

## התלבטויות חדשות

| # | מזהה | נושא | הפרטים |
|---|---|---|---|
| 1 | en8 כולו | העמקה לרמת ח' בתוך כללי האפליקציה | **רוב המשימות ברמת המשפט והטקסט חסומות** בכללים: עד 3 מילים לאפשרות ועד 12 מילים לשאלה. **ההצעה:** (א) להוסיף פרקי passage שאינם Unseen: פסקה עם פערים (Cloze של זמנים), פסקת כתיבה לדוגמה עם משפטים ממוספרים, ומייל; (ב) להחליף בכל פרק דקדוק 3–4 שאלות "צורה" בשאלות הקשר ("have known, met", ‏"was bitten", "unless", ‏"Neither"); (ג) להוסיף פרקים: gerund/infinitive, ‏despite/because of/unless, ‏-ness/-ly ומשפחות מילים, ‏phrasal verbs ו-collocations. **ההחלטה של הבעלים:** להרחיב את en8, או לבנות סט המשך ("en8 – מבחן") ולהשאיר את en8 כבסיס |
| 2 | ch32–ch35 | אורך ה-Unseen וסוגי השאלות | **היום:** 220–237 מילים. **במבחני ח':** 300–450, כשהכלל באפליקציה הוא 80–300. **ההצעה:** להאריך שני טקסטים ל-280–300 מילים, להוסיף שאלות הפניה, הוכחה ("Which paragraph…"), רצף ועובדה מול דעה, ולהוסיף טקסט טיעון או טקסט מידע עם טבלה. **השאלה לבעלים:** להעלות את תקרת ה-300 לפרקי Unseen של ח'–ט'? |
| 3 | #65, ‏#75, ‏#96, Unseen 1 | אנגלית בריטית מול אמריקאית באוצר המילים | האיות אוחד לאמריקאי, אבל נשארו diary (לפגישות), petrol, ‏rubbish ו-at weekends. בבתי הספר בישראל מקובלות שתי הגרסאות. **השאלה:** לאחד גם את אוצר המילים (calendar, gas, trash, on weekends), או להשאיר |
