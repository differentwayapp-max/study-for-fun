# בדיקה (סבב 9) – en7 ו-en7-nov26, אנגלית כיתה ז' (sff-v159)

- **הגרסה שנבדקה:** sff-v159. ‏`public/share/en7.txt` (ver `139eb49420`, ‏372 שאלות, 35 פרקים) ו-`public/share/en7-nov26.txt` (ver `7110e39661`, ‏178 שאלות, 13 פרקים). המקורות: `tools/sets/en7.py`, ‏`tools/sets/en7_nov26.py`.
- **המזהים:** `en7#N` הוא אינדקס השאלה בקובץ הבנוי, **מ-0**, כמו בדוח en8 של סבב 8. גם הפרקים ממוספרים מ-0 (`ch0`). המספרים זזים אחרי כל עריכה, ולכן מצוטט גם טקסט השאלה.
- **מה נבדק:** כל 550 השאלות, אחת אחת, כולל חמשת קטעי ה-Unseen (201, ‏201, ‏194 ו-208 מילים ב-en7, ו-176 ב-en7-nov26) ו-61 השאלות עליהם.
- **כפילויות:** הושוו לכל סטי האנגלית: en3, ‏en4, ‏en4-nov26, ‏en5, ‏en6, ‏en8 (וגם בין שני הסטים). ההשוואה נעשתה לפי טקסט מנורמל ולפי "אותה תשובה בניסוח קרוב" (דמיון 0.72 ומעלה). נבדקו גם ההצעות של דוח en8 (סבב 8), כדי שלא יתנגשו בתיקונים כאן.

## סיכום

| | en7 | en7-nov26 | סה"כ |
|---|---|---|---|
| שאלות שנבדקו | 372 (48 ב-Unseen) | 178 (13 ב-Unseen) | 550 |
| ודאי | 5 (3 התנגשויות במשחק ההתאמה, 2 כפילויות מול en5/en6) | 3 (כפילויות מול en4/en5) | **8** |
| קל | 18 | 9 | **27** |
| התלבטויות חדשות | 3 | 1 | **4** |
| שגיאות מפתח, עובדה או דקדוק בתשובה המסומנת | 0 | 0 | 0 |
| התנגשויות עם הצעות דוח en8 (לתקן ב-en8) | 3 ודאי, 2 קל | – | |

**השורה התחתונה:** אין בשני הסטים תשובה שגויה. הבעיות האמיתיות הן שלוש התנגשויות במשחק ההתאמה ב-en7 (בעיקר הקלף and), חמש כפילויות מול כיתות נמוכות, ופער רמה מול מבחן ז' אמיתי (ראו הפרק הבא).

---

## התאמה לרמת כיתה ז'

### מה בודק מבחן ז' אמיתי (תוכנית משרד החינוך, Band I–II)
מבחן אנגלית בכיתה ז' בבית ספר בישראל (סוף שנה ראשונה של חטיבת הביניים) בנוי בדרך כלל מ:
1. **Unseen** של 200–300 מילים, לעיתים טקסט שאינו סיפור (מייל או מכתב, מודעה או לוח זמנים, כתבת מידע). השאלות: פרט מהטקסט, מילה בהקשר, **הפניה** ("it / they refers to"), **רצף** (מה קרה קודם), **הוכחה** ("How do we know…", "Copy the words that show…"), נכון או לא נכון, רעיון מרכזי או כותרת.
2. **דקדוק ברמת המשפט, בהקשר:** Past Simple מול Past Progressive (כולל שני חסרים באותו משפט), הווה מול עבר באותו משפט ("usually … but yesterday"), will / going to, השוואות בלי רמז בסוגריים, modals בעבר (had to, didn't have to), כמתים, מילות קישור.
3. **המרה ושאלה:** הפיכת משפט לשלילה או לשאלה, **ניסוח שאלה לתשובה נתונה**, **מציאת טעות ותיקונה**.
4. **אוצר מילים Band II בשימוש:** מילה בהקשר, מילות יחס אחרי תואר ופועל (afraid of, interested in, listen to), צירופים (take a photo), פעלים מורכבים בסיסיים (look for).
5. **כתיבה:** פסקה או מייל קצר. במבחן בבחירה זה נבדק דרך מילות רצף (First, Then, Finally), משפט פתיחה וסיום, ופיסוק.

### השורה התחתונה ל-en7
- **הנושאים** תואמים את `curriculum.json` לכיתה ז' (grade 6): ‏Past Simple, ‏Past Progressive, ‏will / going to, השוואות, modals, כמתים, מילות קישור, ‏Band II. **מה שחסר מהתוכנית:** "כתיבת פסקאות", אין אף שאלה על כתיבה.
- **צורת השאלה:** 213 מתוך 372 שאלות הן "השלם מילה אחת", ‏33 הן "Past / Comparative / Superlative / Adverb of X?", ‏31 הן "מילה עברית = ?", ו-9 הן "X means:". האורך הממוצע של שאלה הוא 6.4 מילים. ברוב משפטי הדקדוק יש מילת רמז (yesterday, last night, Advice:, ‏(big)) שקובעת את התשובה בלי להבין את ההקשר.
- **החזקים:** פרקי ה-Past Progressive (when / while), ‏too / enough ו-as … as עם הסקה (#122, ‏#131, ‏#139) כבר ברמת מבחן.
- **מתחת לרמה:** ch2 (‏10/10 "Past of X?"), ‏ch10–ch11 (‏11 שאלות עם התואר בסוגריים ועוד 6 "X of Y?"), ‏ch15 (5 עם רמז בסוגריים), ופרקי המילים ch24–ch29 (‏32 שאלות תרגום, והשאר הגדרות קצרות).
- **ה-Unseen:** ארבעה טקסטים טובים ומקוריים, כולם **סיפור**, ‏194–208 מילים, עם 12 שאלות לכל טקסט. השאלות: בעיקר פרט מהטקסט, מילה אחת, רעיון מרכזי ושאלת היסק אחת. **אין** שאלות הפניה, רצף או הוכחה, ואין טקסט שאינו סיפור.

### לפי פרק – רמה ופריטים ברמת מבחן (level 2)
כל הפריטים כתבתי בעצמי. כולם עומדים במגבלות: 4 אפשרויות של עד 3 מילים, השאלה עד 12 מילים (`MAX_Q_WORDS = 12` ב-en7), והסבר עד 10 מילים. נבדק שאין להם כפילות בסטי האנגלית האחרים, ושהם לא מתנגשים בהצעות של דוח en8. מוסיפים אותם כשדה שביעי `2` בטאפל, בתוך הפרק הקיים. **✔ = התשובה; השאר מסיחים.** לפריטים שנכנסים למשחק ההתאמה נבדק שאף קלף אחר בפרק לא עונה עליהם.

| פרק | המשימה היום | רמה מול ז' | פריטים מוצעים (level 2) |
|---|---|---|---|
| ch0–ch1 Past Simple ‏-ed | 7 "Past of X?", והשאר השלמה עם מילת זמן | **חלקית.** תמיד יש yesterday / ago, ואין ניגוד בין הווה לעבר | **ניגוד הרגל מול עבר:** "I usually walk the dog, but yesterday Dad ___ it." ✔ walked · walks · walk · walking. הסבר: "yesterday ← עבר, גם אם usually". **כתיב בתוך משפט:** "The bus ___ suddenly, and everyone fell forward." ✔ stopped · stoped · stops · stopping. הסבר: "תנועה קצרה + p ← מכפילים: stopped" |
| ch2–ch3 פעלים לא רגילים | ‏13 "Past of X?" מתוך 21 | **מתחת לרמה.** במבחן הפועל הלא רגיל מופיע בתוך הקשר | **בהקשר:** "We ___ home at seven and arrived at nine." ✔ left · leaved · leave · leaves. הסבר: "leave – left (פועל לא רגיל)". "Dana ___ her new bike to school yesterday." ✔ rode · ridden · rided · rides. הסבר: "ride – rode; ridden היא הצורה השלישית". **מציאת טעות:** "Find the mistake: 'We buyed a cake.'" ✔ buyed → bought · We → Us · a → an · cake → cakes. הסבר: "buy – bought, לא buyed" |
| ch4 ‏didn't / wasn't | השלמה. רמה טובה | **בסדר.** חסרה המרה | **המרה לשלילה:** "'Tom ate the cake.' Negative: Tom ___ the cake." ✔ didn't eat · didn't ate · doesn't eat · wasn't eat. הסבר: "didn't + צורת בסיס: eat" |
| ch5 שאלות בעבר | השלמת Did / Was / Were | **בסדר.** אין ניסוח שאלה לתשובה נתונה | **שאלה לתשובה:** "'They were at the mall.' – Where ___?" ✔ were they · did they · they were · was they. הסבר: "בשאלה הופכים את הסדר: were they". **שאלת נושא:** "'Ron called me.' – Who ___ you?" ✔ called · call · did called · calls. הסבר: "שואלים על מי שעשה ← בלי did" |
| ch6–ch7 Past Progressive, ‏when / while | ברמת מבחן | **בסדר.** אין שני חסרים באותו משפט | **שני חסרים:** "While Maya ___ her bike, she ___ her phone." ✔ "was riding, dropped" · "rode, drops" · "were riding, dropped" · "is riding, drops". הסבר: "ארוכה: was + ing; קצרה: עבר פשוט" |
| ch8–ch9 עתיד | ברמה טובה | **בסדר.** חסרה שאלה עם going to ותשובה קצרה עם will | "When ___ she going to visit us?" ✔ is · does · will · are. הסבר: "she ← is going to; בשאלה is לפני she". "'Will you help me?' – 'Sorry, I ___.'" ✔ won't · don't · willn't · am not. הסבר: "Will you…? ← תשובה קצרה: I won't" |
| ch10–ch11 השוואות | ‏11 עם רמז בסוגריים, ‏6 "X of Y?" | **מתחת לרמה.** הרמז בסוגריים עושה חצי מהעבודה | **בלי רמז:** "Tel Aviv is big, but Jerusalem is even ___." ✔ bigger · biggest · more big · big. הסבר: "even + צורת השוואה: bigger". "Of all the planets, Jupiter is the ___." ✔ biggest · bigger · most big · big. הסבר: "of all ← הכי: the biggest". **הסקה מנתונים:** "Ron is 140 cm. Gal is 150 cm. Ron is ___ Gal." ✔ shorter than · taller than · as tall as · the shortest. הסבר: "140 קטן מ-150 ← shorter than" |
| ch12–ch13 ‏as … as | הסקה טובה (#122, ‏#131, ‏#139) | **ברמת מבחן** | אין צורך בתוספת. אפשר אחת: "My bag is ___ heavy as yours." ✔ as · than · more · so. הסבר: "אותו משקל ← as … as" |
| ch14–ch15 תארי פועל | השלמה, 5 עם רמז בסוגריים, ו-4 "Adverb of X?" | **חלקית.** אין סדר מילים, ואין hard / hardly | **סדר מילים (שאלת Which):** "Which is correct?" ✔ speaks English well · speaks well English · well speaks English · speaks English good. הסבר: "פועל, אחריו המושא, ואז well". **מלכודת hardly:** "She worked ___ all day and passed the test." ✔ hard · hardly · hardness · hardy. הסבר: "hard = במאמץ; hardly = כמעט לא" |
| ch16–ch17 ‏too / enough | ברמת מבחן | **בסדר** | "The box was too heavy for me ___ lift." ✔ to · for · that · than. הסבר: "too + תואר + to + פועל" |
| ch18–ch19 Modals | 5 תרגומים ("should = ?", ‏"mustn't = ?"), והשאר עם רמז "Advice:" | **חלקית.** אין have to בעבר בשלילה, ו-should תמיד מגיע עם "Advice:" | "Yesterday was a holiday, so we ___ go to school." ✔ didn't have to · mustn't · don't have to · hadn't to. הסבר: "חג בעבר ← לא היינו חייבים". **עצה בלי רמז:** "You look ill. You ___ see a doctor." ✔ should · shouldn't · mustn't · can't. הסבר: "חולה ← כדאי ללכת לרופא: should". (נמנעתי מ-allowed to, ‏will have to, ‏needn't ו-could / was able to, שדוח en8 מציע לח') |
| ch20–ch21 כמתים | השלמה, רמה טובה | **בסדר.** חסרים How much לשאלת מחיר, ו-any בשאלה | "How ___ does this T-shirt cost?" ✔ much · many · long · often. הסבר: "מחיר ← How much". "Is there ___ milk left? – Yes, a little." ✔ any · a few · many · a lot. הסבר: "שאלה + לא נספר ← any" |
| ch22–ch23 מילות קישור | השלמה, ותרגום של so / because / although / however | **בסדר.** חסרים Because בתחילת משפט ומילות רצף לכתיבה | "___ the bus was late, we missed the film." ✔ Because · Although · However · So. הסבר: "סיבה בתחילת המשפט ← Because". **כתיבה – מילות רצף:** "___, we packed. Then we drove. Finally, we flew." ✔ First · Then · Finally · However. הסבר: "סדר בפסקה: First, Then, Finally" |
| ch24–ch29 מילים (Band II) | ‏32 "מילה עברית = ?", והשאר הגדרות קצרות ("A ___ fixes cars") | **מתחת לרמה.** בחירת המילים טובה, אבל אין שימוש: מילות יחס, צירופים, פעלים מורכבים | **מילת יחס אחרי תואר:** "I'm afraid ___ spiders." ✔ of · from · at · in. הסבר: "afraid of (לא from) = מפחד מ". "Are you interested ___ science?" ✔ in · on · at · of. הסבר: "interested in = מתעניין ב". **פועל מורכב:** "I'm ___ my keys. Have you seen them?" ✔ looking for · looking at · looking after · looking like. הסבר: "look for = לחפש". **צירוף:** "Can you ___ a photo of us?" ✔ take · do · make · bring. הסבר: "take a photo = לצלם". **מילה בהקשר:** "Noa didn't win, so she felt ___." ✔ disappointed · proud · grateful · confident. הסבר: "לא ניצחה ← מאוכזבת" |
| ch30–ch33 Unseen | 4 סיפורים, ‏194–208 מילים | **חלקית.** אורך בתחתית הטווח, רק סיפורים, ואין הפניה, רצף והוכחה | **The Lost Passport:** "'Is this yours?' – 'this' is:" ✔ the passport · the sandwich · the phone · the table. "Which happened FIRST?" ✔ Noam's phone rang · Mom checked passports · Noam ran back · the waiter smiled. "How do we know Noam was grateful?" ✔ he thanked him · he felt terrible · he ran back · he was excited. **The Young Inventor:** "'It also shows where the person is.' 'It' is:" ✔ the watch · the phone · the message · the family. **The Beach Clean-Up:** "'its leg was stuck' – 'its' means:" ✔ the turtle's · the net's · the sea's · Yael's. "What did the class do LAST?" ✔ visited recycling center · saved a turtle · collected bottles · counted bags. **One Week Without Screens:** "'I didn't feel the same about it.' 'It' is:" ✔ the phone · the rule · the book · the week. "When did the writer start the book?" ✔ on day three · on day one · after the week · on day five |
| ch34 חזרה | 18 שאלות מכל הנושאים | **בסדר** | – |

### סוגי משימות ונושאים שחסרים לגמרי ב-en7
1. **מציאת טעות ותיקונה** ("Find the mistake") – אין אף שאלה. מתאים ל-ch2, ‏ch4, ‏ch14 (דוגמאות למעלה).
2. **ניסוח שאלה לתשובה נתונה** – רק #61 מתקרב. מתאים ל-ch5 ול-ch9.
3. **ניגוד זמנים בתוך משפט אחד** ("usually … but yesterday") ו**שני חסרים** באותו משפט – אין.
4. **Present Simple מול Present Progressive** – בכותרת של en7 כתוב שההווה נמצא ב-en7-nov26. אבל שם יש רק Present Simple, וההבחנה בין שני זמני ההווה לא מופיעה באף סט של ז'. זה חלק קבוע ממבחן ראשון של ז'. אם en7-nov26 יוצא מהקטלוג, צריך פרק כזה ב-en7 (פרק חדש, לא level 2): "Look! The baby ___ ." ✔ is sleeping · sleeps · sleep · sleeping; "She ___ to the market every Friday." ✔ goes · is going · go · going.
5. **there was / there were** – אין ב-en7 (עבר של there is/are).
6. **מילות יחס, צירופים ופעלים מורכבים** – אין ב-en7 (ב-en7-nov26 יש כמה, אבל רק כתרגום).
7. **כתיבה** – אין. בתוך הפרקים הקיימים אפשר להוסיף רק מילות רצף (ch23). משימה של פסקה עם משפטים ממוספרים ("Which sentence does NOT belong?", "the best ending") צריכה פרק קריאה חדש, כמו שדוח en8 מציע לח'. ראו התלבטות D4.
8. **Unseen שאינו סיפור** (מייל לחבר, מודעה או לוח זמנים, כתבת מידע) ו**טקסט של 250–300 מילים** – צריך פרק חדש. ראו D4.

### en7-nov26 – למה הוא נבנה, והאם להשאיר אותו בקטלוג
- **מה זה:** סט שנבנה למבחן של כיתה מסוימת: "Present Simple + Word Review (Student's Book p.37). Exam 18.11.2026" (הערת הכותרת במקור). יש בו 112 מילים מהדף של המורה (`WORD_LIST`), ‏`examDate="2026-11-18"`, ‏`dailyGoal=5`, ‏`perRound=13`. המבחן כבר עבר. האפליקציה מתעלמת מתאריך שעבר כשמוסיפים את הסט (`adExam` ב-index.html), כך שאין תקלה טכנית.
- **הרמה:** Present Simple הוא נושא של ה'–ו' ב-`curriculum.json`, וכאן הוא בא כחזרה של תחילת ז'. רוב המילים הן Band I (rain, cloud, sea, city, finger, bone, coat), ומיעוטן Band II (predict, destroy, extreme, certainly). ‏79 מתוך 178 שאלות (44%) הן תרגום "מילה עברית = ?". השאלות קצרות מאוד (ממוצע 4.1 מילים, `MAX_Q_WORDS` לפי ברירת המחדל: 6). ב-Unseen יש 176 מילים ושאלות פרט בלבד. שלוש שאלות כמעט זהות לשאלות של en4 ו-en5.
- **ההמלצה (להחלטת הבעלים, D1):** לא להשאיר אותו כמו שהוא כסט ז' כללי בקטלוג. שתי אפשרויות:
  - (א) להוציא אותו מהקטלוג. המשפחה שבשבילה נבנה כבר משתמשת בו.
  - (ב) להפוך אותו ל"ז' – חזרת פתיחה: Present Simple ו-Progressive + מילים": ‏`examDate=""`, ‏`dailyGoal=2`, ‏`perRound=10`, ‏`MAX_Q_WORDS = 10`, ‏`KINDS` כמו ב-en7 (היום אין לו `KINDS`, והאפליקציה מנחשת את סוג התחנה), פרק Present Progressive מול Simple, ותיקון שלוש הכפילויות.
  
  בשני המקרים צריך לעדכן את הכותרת של en7 ("Present Simple … are in the separate set en7_nov26").

---

## בדיקות מכניות

| בדיקה | en7 | en7-nov26 |
|---|---|---|
| `SFF_DRY=1 SFF_PICSTATS=1 build_set` | `ok (dry): 372 questions`. אין `warning` ואין `DUP` | `ok (dry): 178 questions`. אין `warning` ואין `DUP` |
| שורות תמונה שעורבבו (`OPTS`) | 5. התשובה ב-5 מקומות שונים, ואף מקום לא מעל 40% | 9. התשובה: מקום 1 ×2, מקום 2 ×3, מקום 3 ×2, מקום 4 ×2 |
| `local_scenes` (השרת על 8768, עותק של הבדיקה עם הפורט הזה) | 0 סצנות פגומות | 0 סצנות פגומות |
| `local_optsq` | `errs: []`, ‏`leaks: []`. ‏18/35 פרקים במשחק ההתאמה | 9/13 |
| `node tools/match_list.js` | עובד. הרשימה שימשה לבדיקת ההתנגשויות | עובד |
| `qa` בקובץ הבנוי | ‏372/372 | ‏178/178 |
| אימוג'י חדשים מ-2019 | אין | אין (👩‍🦱 הוא מ-2018) |

**הערה על השרת:** `local_scenes.js` ו-`local_optsq.js` קבועים על פורט 8765. על 8765 לא ענה אף שרת, ולכן הרצתי את `tools/serve.py 8768` ועותק של שתי הבדיקות עם הפורט 8768 (בתיקיית העבודה הזמנית, לא במאגר). השרת נעצר בסוף.

**הערה על match:** ‏"Which day / Which week is in the past?" (#10, ‏#11), ‏"Which base verb is irregular?" (#39), ‏"Which sentence is about the future?" (#99), ‏"Which word shows a result?" (#231) ו-"Which is more polite…" (#185) **כן** נכנסות למשחק ההתאמה. `needOpts` תופס רק "which one", ‏"which of these", ‏"correct" וכדומה. בחמש הראשונות אין התנגשות. ב-#185 יש (ראו בהמשך).

---

## en7

### אימות הבדיקה הקודמת

| מזהה | ציטוט השאלה | מה ביקשו | מצב |
|---|---|---|---|
| en7#213 | "Dad ate them all, so there aren't ___ apples left." | סבב 6: במקום "there isn't ___ juice", כי הקלף much התאים גם | ✅ תוקן. אין התנגשות חדשה (‏"aren't much apples" לא דקדוקי) |
| en7#239, ‏#41 | "I didn't go to the party ___ I was sick." / ‏"The shop was closed, so we ___ buy any bread." | סבב 6 ו-dilemmas (סבב 4–5): להעלות רמה מול en6#163, ‏#166 | ✅ שונה. עכשיו זה "אותו ידע בגיוון" |
| en7#9, ‏#50, ‏#51 | "The little girl ___ when she fell…" / ‏"I ___ very tired last night…" / ‏"___ you and your friends enjoy the trip…" | dilemmas סבב 4–5: כמעט זהות ל-en6 | ✅ שונו. ב-#50 נשאר ניסוח עברי ("slept early"), ראו "קל" |
| en7#14 | "Past of plan?" | dilemmas סבב 1: המסיח planed הוא מילה אמיתית | ✅ המסיח עכשיו planded |
| en7#87 | "Good news! Scientists think people ___ live on Mars in 2050." | dilemmas סבב 4: ה-"I'll" בתוך המשפט רמז ל-will | ✅ תוקן |
| en7#358 | "While I was sleeping, the phone ___." | dilemmas סבב 4: כמעט זהה ל-en8#42 | ✅ השינוי נעשה ב-en8 |
| en7#130, ‏#131 | "Haifa isn't as hot as Eilat. Eilat is ___." | dilemmas סבב 2: "Haifa isn't as big as Tel Aviv" תלוי בשטח או באוכלוסייה | ✅ נוסח מחדש. אין בעיה |
| en7#150 | "Which word is the adverb of loud?" | dilemmas סבב 2: loud / quick משמשים גם כתואר פועל | ✅ נוסח מחדש. בחירה בין loudly ל-loud |
| התלבטויות פתוחות | #117 Paris ("the most beautiful city"), ‏#314 ‏"late because of a delay", ‏#324 "big and heavy", ‏#144 quieter, ‏#133 "as good as gold", ‏#186–#188 could/can מול should, ‏#199 "is to wear" | – | עדיין פתוחות ב-`dilemmas.md` (לא נגעתי). אין מה להוסיף |

### בעיות בשאלות ששונו
אין בעיה חדשה בשאלות ששונו. החריג היחיד: #223 ‏"The sun was shining, ___ the water was cold. (אבל)". הרמז "(אבל)" נוסף כדי לחסום את המסיח and, אבל הוא מתרגם את התשובה. התיקון נמצא בהתנגשות 2.

### שגיאות ודאיות
אין שגיאת מפתח, עובדה או דקדוק בתשובה המסומנת. הממצאים הוודאיים הם התנגשויות במשחק ההתאמה וכפילויות (בטבלאות הבאות).

### התנגשויות במשחקי התאמה

| מזהה | ציטוט השאלה | חומרה | בעיה | תיקון מוצע |
|---|---|---|---|---|
| en7#33 (ch3) | "They ___ all the pizza – the box is empty!" ✔ ate | **ודאי** | הקלף had (של #32 ‏"I ___ a strange dream last night.") יוצר "They had all the pizza", משפט תקין וטבעי (had = אכלו) | להחליף את #32 ולא את #33: "I ___ asleep in front of the TV last night." ✔ fell (felt / fall / falled). הסבר: "fall – fell; fell asleep = נרדמתי". תמונה 😴 📺. בדקתי: fell לא משלים אף שאלה אחרת בפרק (went, wrote, ate, bought, saw, won). זה לא כפילות (en7#171 רק מזכיר "I fell asleep" בתוך שאלה אחרת) |
| en7#222–#228 (ch22) | "I like tea ___ coffee." ✔ and, מול "I'm hungry, ___ I'm making a sandwich." (so), ‏#225 (because), ‏#226 ‏"It was raining, ___ we stayed home." (so), ‏#227 (because), ‏#228 ‏"He is rich, ___ he isn't happy." (but) | **ודאי** | הקלף and מתאים דקדוקית לכל אחד מששת המשפטים ("It was raining, and we stayed home" טבעי לגמרי). ילד שמחבר and לאחד מהם מקבל "טעות" | (1) #222 ← ‏"Which of these adds another idea?" ✔ and (so / but / because). ‏`needOpts` תופס "which of these", ולכן השאלה יוצאת ממשחק ההתאמה. הסבר: "and = וגם, מוסיף רעיון". התמונה ☕ 🍵 נשארת. (2) #223: למחוק את "(אבל)" ולהחליף את המסיח and ב-or: ‏"The sun was shining, ___ the water was cold." ✔ but (so / because / or). כך גם הרמז שמתרגם את התשובה יורד. אחרי (1) הקלפים בפרק הם but, ‏so, ‏because, ‏לכן ו-כי. בדקתי: אף אחד מהם לא מתאים לשאלה של קלף אחר |
| en7#185 (ch18) | "Which is more polite: ___ you help me?" ✔ Could | **ודאי** | השאלה נכנסת למשחק ההתאמה (‏`needOpts` לא תופס "Which is more polite"). שם אין אפשרויות להשוות אליהן, והקלף can (‏#184, ‏#190) יוצר "Can you help me?", בקשה מנומסת ונכונה | "Which of these is more polite: ___ you help me?" (9 מילים). השאלה יוצאת ממשחק ההתאמה, והאפשרויות לא משתנות |
| en7#127 (ch12) | "This test was as ___ as last week's test." ✔ easy | קל | הקלף big (‏#124) יוצר "as big as last week's test" (מבחן ארוך), תקין | "This test was as ___ as last week's. Again, everyone got 100." ✔ easy (12 מילים) |
| en7#214 (ch21) | "I don't have ___ money – not even one shekel." ✔ any | קל | הקלף much (‏#221) יוצר "I don't have much money", תקין. רק "not even one shekel" מכוון ל-any | "I don't have ___ money. My wallet is empty!" ✔ any |
| en7#216 (ch21) | "Add only ___ salt to the soup." ✔ a little | קל | הקלף some (‏#212, ‏#217) יוצר "Add only some salt", תקין אם כי פחות טבעי | "Which of these fits? Add only ___ salt." (יוצאת מההתאמה), או להשאיר |
| en7#231 (ch22) | "Which word shows a result?" ✔ so | קל | השאלה נכנסת להתאמה, ושם גם הקלף העברי "לכן" (‏#229) "מראה תוצאה" | "Which English word shows a result?" |
| en7#300 (ch29) | "Plastic bags are bad for the ___ – the world around us." ✔ environment | קל | הקלף climate (‏#304) יוצר "bad for the climate", נכון עובדתית | "Plastic is bad for the ___ around us." ✔ environment. ‏"the climate around us" לא טבעי |

### תמונות שמסגירות או מטעות

| מזהה | ציטוט השאלה | בעיה | תיקון מוצע |
|---|---|---|---|
| en7#273 | "The plane will ___ in Rome at six." ✔ land | התמונה 🛬 (מטוס נוחת) היא התשובה. המסיחים fly ו-leave נפסלים מהתמונה | ✈️ 🇮🇹 🕕 |
| en7#289 | "אנרגיה סולארית = ___ energy" ✔ solar | "סולארית" היא תעתיק של התשובה, והתמונה ☀️ מוסיפה רמז | "Energy from the sun = ___ energy" ✔ solar (water / wind / nuclear). תמונה 🔋 🏠. הסבר: "solar = של השמש". זה לא כפילות של #371 ("Solar panels make energy from the ___"), כי הכיוון הפוך |
| en7#305 | "Which one is bad for the planet?" ✔ pollution | 🌍 ❓ – ‏❓ הוא קישוט בלבד | ‏`OPTS("♻️", "🌳", "☀️", "🏭")` לפי סדר האפשרויות במקור (recycling, ‏trees, ‏solar energy, ‏pollution) |

### כפילויות

| מזהה | ציטוט השאלה | חומרה | בעיה | תיקון מוצע |
|---|---|---|---|---|
| en7#227 | "We stayed home ___ it was raining." ✔ because | **ודאי** | כמעט זהה ל-en6#380 ‏"We stayed at home ___ it was raining." (because). הכיתה הגבוהה משתנה | "The match was cancelled ___ the field was full of water." ✔ because (so / but / although). הסבר: "הסיבה לביטול ← because". תמונה ⚽ 💧. בדקתי: אין התאמה לקלפים so או but |
| en7#12 | "I ___ TV last night." ✔ watched | **ודאי** | כמעט זהה ל-en5#202 ‏"She ___ TV last night." (watched) | "I ___ the whole film last night, but I didn't like it." ✔ watched (watch / watches / watching). ‏12 מילים. הסבר: "last night ← עבר: watched". תמונה 🎬 🌙. בדקתי: הקלף enjoyed נשלל ("but I didn't like it"), ו-planned, ‏opened ו-cooked לא מתאימים |
| en7#364 | "I ___ ride a bike when I was six." ✔ could | קל | אותו מבנה ואותה תשובה כמו #182 ‏"I ___ swim when I was five." | "My grandpa ___ run fast when he was young." ✔ could (can / will / must) |
| en7#64 | "She was ___ a letter." ✔ writing | קל | קרוב ל-en5#372 ‏"She is ___ a letter now." (writing) | "She was ___ a message to her friend." ✔ sending (send / sent / sends) |
| en7#220 | "There aren't ___ eggs in the fridge." ✔ any | קל | קרוב ל-en6#34 ‏"There isn't ___ milk in the fridge." (any), ול-en8#143 שתוקן לאחרונה | "There aren't ___ eggs, so I can't bake a cake." ✔ any |
| en7#30 | "Yesterday we ___ to the beach by bus." ✔ went | קל | קרוב ל-en5#213 ‏"Yesterday I ___ to the park." ול-en6#143 ‏"Yesterday we ___ (go) to the zoo." | "Last summer we ___ to Eilat by train." ✔ went |

#### התנגשויות עם הצעות דוח en8 (סבב 8) – לתקן ב-en8, לא ב-en7

| הצעה בדוח en8 | זהה או קרובה ל- | חומרה | מה לעשות ב-en8 |
|---|---|---|---|
| ch12–13: ‏"I ___ swim when I was five." ✔ could | en7#182, **זהה מילה במילה** | **ודאי** | לבחור משפט אחר ל-could / was able to, למשל "Last week I ___ finish the test in time." ✔ was able to |
| ch6–7: ‏"Look at those clouds! It ___ rain." ✔ is going to | en7#92 ‏"Look at the clouds! It ___ to rain." | **ודאי** | ראיה אחרת: "The glass is at the edge! It ___ fall." |
| ch22–23: ‏"She answered every question ___ (correct)." ✔ correctly | en7#159 ‏"He answered all the questions ___ (correct)." | **ודאי** | ‏-ly על תואר אחר, למשל "The team played ___ (bad) and lost." ✔ badly |
| תיקון en8#142: ‏"Is the ice thick ___ to walk on?" ✔ enough | en7#173 ‏"Is the water warm ___ for swimming?" | קל | אותו מבנה ("Is the X adj ___ …?"). עדיף משפט חיובי או שלילי |
| תיקון en8#154: ‏"We can't bake today. There isn't ___ flour." ✔ much | en7#204 ‏"There isn't ___ milk." | קל | "אותו ידע בגיוון", מקובל. אפשר לגוון עוד |

### קל – ניסוח ודקדוק

| מזהה | ציטוט השאלה | בעיה | תיקון מוצע |
|---|---|---|---|
| en7#50 | "I ___ very tired last night, so I slept early." | ‏"slept early" הוא תרגום מעברית ("הלכתי לישון מוקדם"). באנגלית: went to bed early | "I ___ very tired last night, so I went to bed early." (12 מילים) |
| en7#84 | "They said yes! They ___ come to the party." ✔ will | המסיח did יוצר "They did come" (did מודגש), משפט דקדוקי | להחליף את did ב-were |
| en7#302 | "Global warming makes the Earth ___." ✔ warmer | ‏"warming" בשאלה מסגיר את warmer | "Because of global warming, ice in the Arctic ___." ✔ melts (freezes / grows / builds). הסבר: "חם יותר ← הקרח נמס". בדקתי: melts לא מתאים לשאלה אחרת בפרק |
| en7#346 | "What did the writer play with the brother?" | ‏"the brother" לא טבעי (המין של הכותב לא ידוע) | "What did the writer play in the evening?" ✔ a board game |
| en7#352 | "What is the main idea of the text?" ✔ a screen-free week | אותו טקסט תשובה כמו #342 ‏"What was the school challenge?" | התשובה של #352: "a week offline", ושאר האפשרויות נשארות |

### התלבטויות חדשות (לא לערוך את `dilemmas.md` בלי הבעלים)

| # | מזהה | שאלה | התלבטות |
|---|---|---|---|
| D2 | en7#142, ‏#143 | "He is a quick runner. He runs ___." (מסיח quick) / ‏"The turtle is slow. It walks very ___." (מסיח slow) | ‏"runs quick" ו-"walk slow" נפוצים בדיבור, ובחלק מהמילונים slow / quick מופיעים גם כתואר פועל. בבית הספר מלמדים ‎-ly, ולכן המפתח סביר. דומה לסוגיית quieter (סבב 2) |
| D3 | en7#233, ‏#236, ‏#241 | "It was cold. ___, we went swimming." / ‏"She was tired, ___ she finished her homework." / ‏"The test was hard. ___, I got 100!" | במשחק ההתאמה "But, we went swimming" (עם פסיק) נחשב לא תקני, ו-"She was tired, however she finished…" נפוץ אבל נחשב comma splice. ההבחנה בפסיק היא בדיוק מה שהפרק מלמד. הצעה: להשאיר, ואולי להוסיף להסבר "However, עם פסיק אחריו" |
| D4 | en7 (כל הסט) | כתיבה ו-Unseen שאינו סיפור | פריטי level 2 בתוך הפרקים לא יכסו פסקה עם משפטים ממוספרים, מייל, מודעה או טקסט של 250–300 מילים. כל אלה דורשים פרקי קריאה חדשים (`text`). צריך החלטה אם להוסיף פרקים כאלה ל-en7 |

---

## en7-nov26

### אימות הבדיקה הקודמת

| מזהה | ציטוט השאלה | מה ביקשו | מצב |
|---|---|---|---|
| en7-nov26#124, ‏#73, ‏#157 | "להיות צודק = to be ___" ✔ in the right / ‏"ללבוש = ?" ✔ put on / ‏"Where do the friends swim?" ✔ at the pool | dilemmas סבב 1 | עדיין פתוחות. בלי שינוי |

אין תיקונים קודמים מסבבי 6–8 לסט הזה.

### שגיאות ודאיות
אין שגיאת מפתח, עובדה או דקדוק. הממצאים הוודאיים הם שלוש כפילויות (בטבלה).

### כפילויות

| מזהה | ציטוט השאלה | חומרה | בעיה | תיקון מוצע |
|---|---|---|---|---|
| en7-nov26#0 | "She ___ to school." ✔ goes | **ודאי** | כמעט זהה ל-en5#26 ‏"She ___ to school by bus." (goes) | "She ___ swimming every Monday." ✔ goes (go / going / gone). ‏5 מילים, בתוך `MAX_Q_WORDS = 6`. הסבר: "she ← go + es: goes". תמונה 👧 🏊‍♀️. בדקתי: הקלף swim לא מתאים (‏"She swim"), וגם לא plays. אין כפילות (en6 ‏"I ___ swimming every Friday." ✔ go בודק צירוף אחר) |
| en7-nov26#6 | "Dad ___ TV at night." ✔ watches | **ודאי** | כמעט זהה ל-en5#27 ‏"My mom ___ TV at night." (watches) | "Grandpa ___ the news every evening." ✔ watches (watch / watchs / watching). תמונה 👴 📺 |
| en7-nov26#139 | "She ___ a dog." ✔ has | **ודאי** | כמעט זהה ל-en4#267 ‏"He ___ a dog." (has) | "Noa ___ long curly hair." ✔ has (have / haves / having). תמונה 👩‍🦱. בדקתי: does, ‏opens ו-work לא מתאימים |
| en7-nov26#143 | "Do you ski? No, I ___." ✔ don't | קל | אותו מבנה ואותה תשובה כמו en4#247 ‏"Do you like milk? No, I ___." | "Do they ski? – No, they ___." ✔ don't |
| en7-nov26#117 | "We ___ time together." ✔ spend | קל | כמעט זהה ל-#9 באותו סט ("We ___ time in the park.") | "How do you ___ your weekends?" ✔ spend (stay / fall / set) |

### התנגשויות במשחקי התאמה

| מזהה | ציטוט השאלה | חומרה | בעיה | תיקון מוצע |
|---|---|---|---|---|
| en7-nov26#32 (ch2) | "My dog doesn't ___ trees." ✔ climb | קל | הקלפים eat ו-watch יוצרים "doesn't eat trees" ו-"doesn't watch trees", משפטים תקינים | "My dog doesn't ___ up trees." (6 מילים) |
| en7-nov26#82 (ch5) | "I ___ when my alarm rings." ✔ wake up | קל | הקלף leave יוצר "I leave when my alarm rings", תקין | "I ___ and open my eyes." ✔ wake up |
| en7-nov26#15 (ch1) | "What is this?" ✔ snow, תמונה ❄️ ⛄ | קל | ‏❄️ (פתית) מתפרש גם כקרח, והקלף ice נמצא באותו פרק | תמונה 🌨️ ⛄ (ענן שיורד ממנו שלג) |

### תמונות ומסיחים

| מזהה | ציטוט השאלה | בעיה | תיקון מוצע |
|---|---|---|---|
| en7-nov26#102, ‏#103 | "Who is he?" ✔ farmer / sailor | מסיחים שאינם בני אדם (city, ‏problem) נפסלים מיד | ‏#102: farmer / sailor / fan / pilot. ‏#103: sailor / farmer / fan / pilot |
| en7-nov26#111 | "סנטר = ?" ✔ chin, תמונה 🧔 | ‏🧔 מראה זקן, והוא אותה תמונה כמו של sailor (‏#103) | ‏🧑 ⬇️, או ציור פנים עם חץ לסנטר |
| en7-nov26#44 | "כדור הארץ = ?" ✔ planet Earth | התשובה היחידה בת שתי מילים (city / sea / ground). הצורה מסגירה | planet Earth / the moon / the sun / a city |

### קל – הגדרות הסט
| מזהה | בעיה | תיקון מוצע |
|---|---|---|
| `SET` ב-en7_nov26.py | ‏`examDate="2026-11-18"` (כבר עבר), ‏`dailyGoal=5`, ‏`perRound=13` מכוונים למבחן אחד. אין `KINDS`. ‏`MAX_Q_WORDS` לפי ברירת המחדל (6), ולכן אין מקום לשאלות ברמת מבחן | ראו D1 |

### התלבטויות חדשות

| # | מזהה | התלבטות |
|---|---|---|
| D1 | en7-nov26 (כל הסט) | סט של מבחן כיתתי אחד (Student's Book p.37, מבחן ב-18.11.2026, שכבר עבר). הרמה היא חזרה של ה'–ו' עם מילים מהדף, ו-44% מהשאלות הן תרגום. להוציא אותו מהקטלוג, או להפוך אותו ל"ז' – חזרת פתיחה" (ראו בפרק הרמה). כך או כך, צריך לעדכן את הכותרת של en7, שמפנה אליו |

---

## הערה צדדית (מחוץ לסט)
en6#380 ‏"We stayed at home ___ it was raining." ✔ because, והמסיח and: ‏"We stayed at home and it was raining" תקין דקדוקית. זה שתי תשובות נכונות ב-en6, ושווה לבדוק בסבב של en6.
