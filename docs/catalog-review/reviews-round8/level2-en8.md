# en8 – שאלות רמת מבחן (רמה ב')

**נבדק:** sff-v166 + התוספת (לא הועלה), בקובץ הבנוי `public/share/en8.txt` (`ver` 90421026b9). מספרי השאלות (#) לפי הבנייה הזאת.

**מה נעשה:**
- **העזר `Q`** מקבל עכשיו `lvl=1`, ושדה שביעי `2` נוסף רק כש-`lvl == 2`. נוסף גם `Q2(...)`.
  - נבדק ב-SFF_DRY (סקריפט שמחשב hash של השאלות): `ver` לא השתנה אחרי שינוי העזר (b6fd56755e לפני ואחרי).
- **93 שאלות `lvl: 2`** נוספו בסוף 34 פרקים קיימים. לא נוספו פרקים, סדר הפרקים לא השתנה, ופרק החזרה לא שונה. הסט עכשיו 473 שאלות.
- **שאלות קיימות:**
  - הטקסט, התשובה, האפשרויות וההסבר של כל 380 השאלות הקיימות זהים (השוויתי לפני ואחרי), חוץ מתיקון סבב 9 שבהמשך.
  - סדר האפשרויות אחרי הערבוב השתנה. זה קורה כי `rng` אחד רץ לפי הסדר על כל הקובץ (כמו ב-math7).
- **תיקון סבב 9:** «Is the ice thick ___ to walk on?» הוחלפה ב-«The ice isn't thick ___ to walk on. Stay off!».
  - התשובה עדיין enough, עם אותם מסיחים (much / too / very).
  - התמונה עכשיו ⛸️ 🚫.
  - נבדקו קלפי הפרק (many, much, any, a little, few, no, every, a few, boring, neither): אף אחד מהם לא משלים את המשפט.
- **הדוגמאות האסורות מ-level-prompt-1** (העתק של en7: I ___ swim when I was five, Look at those clouds, answered … correct) לא שומשו:
  - «Yesterday I ___ finish the test in time. Hooray!» ✔ was able to
  - «Which is correct? The glass is at the edge! It ___ fall.» ✔ is going to
  - «The team played ___ (bad) and lost.» ✔ badly

## לפי סוג משימה

| סוג | מס' | דוגמאות (#) |
|---|---|---|
| מציאת טעות ותיקונה | 9 | #12 has went, #25 since five years, #73 During I was, #98 will comes, #122 If it will rain (כרטיס), #134 more taller (כרטיס), #161 musts, #275 didn't used, #301 sings beautiful |
| ניסוח שאלה לתשובה נתונה | 6 | #11 How long has she lived, #38 When did you meet, #61 What were you doing, #85 What are you doing (עתיד), #251 When was it built, #274 Where did she use to live |
| Cloze של זמנים (שני פערים, או בלי מילת רמז) | 6 | #24 has had, bought · #37 have known, met · #62 was doing, went · #110 rains, will stay · #262 used to, visited · #60 were singing |
| Present Perfect בהקשר ובשלילה | 4 | #10 first time, #13 so far, #26 It's been … since, #49 so far |
| עתיד: לוח זמנים, as soon as, going to לפי ראיה | 3 | #96, #97, #84 |
| unless | 3 | #109, #111 (משמעות), #123 |
| השוואות: one of the, twice as, such, less … than | 4 | #145–#148 |
| could / allowed to / needn't / will have to | 5 | #159 weren't allowed to, #160 needn't, #172 was able to, #173 don't need to, #174 will have to |
| neither / either / each / none / few | 4 | #185 few → boring, #186 None, #187 Neither, #198 Each |
| מילות זיקה: חיבור שני משפטים, where, whose, השמטה | 6 | #209 where, #210 that אפשר להשמיט, #221 whose, #222–#224 חיבור משפטים מכרטיס |
| סביל: המרה, שאלה, שלילה, פעיל מול סביל | 6 (+#251) | #235 gets, #236 is sold, #237 aren't given, #248 was bitten, #249 Were, #250 wasn't |
| used to מגוון | 1 (+#262, #274, #275) | #263 usually מול used to |
| -ness / -ly / משפחות מילים / חלק דיבר | 6 | #286 kindness, #287 badly, #288 success, #289 adjective, #300 succeed, #302 Unluckily |
| כתיבה: דעה, סיום מייל, משפט שלא שייך | 3 | #313, #314, #315 |
| despite / because of / as a result / whereas | 4 | #326–#329 |
| phrasal verbs ו-collocations | 7 | #340 run out, #353 turn off, #364 give up, #376 look after, #377 took off, #351 pay attention, #389 make a decision |
| Gerund מול infinitive | 6 | #352 forgot to, #365 stopped smoking, #378 looking forward to visiting, #400 enjoy listening, #401 decided to, #402 hope to |
| Unseen על הקטעים הקיימים | 10 | הפניה 4 (#413, #426, #439, #451); הוכחה / איזו פסקה 2 (#414, #438); רצף 2 (#425, #450); עובדה מול דעה 2 (#427, #452) |
| **סה"כ** | **93** | |

## בדיקות
- **בנייה:**
  - `SFF_DRY=1 SFF_PICSTATS=1` נותן `ok (dry): 473 questions`, בלי שגיאות ובלי אף warning (אין DUP).
  - הבנייה האמיתית רצה תחת `flock`: ‏`OK 473 questions · 37 chapters`, ‏59/59 מילים מתורגלות.
- **תמונות:** `IDS=en8 local_scenes` נותן 0 bad scenes. `local_optsq` נותן `errs: []`.
  - כל התמונות הן מצב או נתונים (ROW / TXT), ואף אחת לא מראה את התשובה.
  - אין אימוג'י מאחרי 2019. שניים הוחלפו בזמן הכתיבה: 🪟 ו-🪑.
- **משחקי התאמה** (`match_list`):
  - נבדק כל קלף מול כל שאלה בכל פרק ששונה.
  - **שבע התנגשויות נמצאו ותוקנו בזמן הבנייה:**

    | התנגשות | תיקון |
    |---|---|
    | less expensive מול «This phone is ___ (expensive)» | השאלה הועברה ל-ch12, עם רמז (expensive) |
    | Neither מול «___ of my parents are teachers» | השאלה הועברה ל-ch15 |
    | aren't given מול «Letters ___ every morning» | עכשיו "Which is correct?" |
    | Turn ___ the lights: גם out מתאים | השאלה הועברה ל-ch28 |
    | was able to מול couldn't ומול had to | נוסף "Hooray!", והשאלה ב-ch14 |
    | don't need to מול הקלף don't have to | השאלה ב-ch14 |
    | will have to מול must / mustn't | "Which is correct?" |

  - **נשארות בבחירה מרובה** (`needOpts`): השאלות "Which is correct / Which of these / NOT / is wrong".
- **כפילויות:**
  - בדיקת ה-DUP של הבנייה מול כל סטי האנגלית בקטלוג (en3–en8, ‏en4/en7-nov26) נקייה.
  - בסוף נבדק שוב הקובץ הנוכחי `tools/sets/en7.py` (עודכן ב-21:06), יחד עם en7_nov26 ו-en3–en6: חיפוש לפי תחילת כל שאלה חדשה ולפי מילות המפתח (unless, despite, whose, give up, allowed, such…). לא נמצאה כפילות.
  - **קרובות לשאלות ב-en7 בזווית אחרת:** ‏en7 ‏"give up means" מול #364 (השלמה במשפט); en7 ‏"I need to ___ it" (charge) מול #352 (forget + to).
- **סקירה (review-practice-set) של כל 93 השאלות בגרסה הבנויה:** נמצאו ותוקנו ארבעה ממצאים קלים.

  | # | בעיה | תיקון |
  |---|---|---|
  | #84 | 🥛 אינה כוס (כלל התמונות) | ROW("🥤", "⚠️") |
  | #287 | המסיח worse נכון ("played worse and lost") | הוחלף ב-badful |
  | #376 | המסיח for אפשרי ("look for my cat") | הוחלף ב-out (האפשרויות עכשיו after / out / on / up) |
  | #389 | "give a decision" קיים (שופט) | הוחלף ב-say |

  אחרי התיקונים: ודאי 0, קל 0.
- **זכויות יוצרים:** כל המשפטים נכתבו מחדש. מדוח en8 נלקחו רק סוגי המשימות ודוגמאות שהדוח עצמו כתב (למשל first time sushi, café where, Despite the rain). אין העתקה מספר לימוד.
- **`core_facts.json`:** לא נדרש שינוי. השאלה על הקרח לא מסומנת שם.

## מה דולג ולמה
- **פרק "Paragraphs" כפרק קריאה עם פסקה ממוספרת:** הדוח הציע אותו, אבל זה היה מחייב פרק חדש או מעבר של פרק קיים לפרק קריאה. דולג. במקומו נכתבו שלוש שאלות כתיבה בפרק הקיים.
- **קטעי Unseen ארוכים (300–450 מילים) וטקסט טיעון:** מחכים להחלטה (level-prompt-1). השאלות נכתבו על הקטעים הקיימים.
- **"Did you use to…?" כשאלת בחירה:** כל אפשרות הייתה 4 מילים, ולכן השאלה הוסרה. used to בשאלה מופיע ב-#274.
- **פרק החזרה (ch37):** לא נגעתי בו.

## לפני העלאה
- **האפליקציה עוד לא מפרידה בין הרמות.** לא להעלות לפני שנבנה "⭐ שלב מבחן".
- לא בוצעו commit, ‏push או deploy.
