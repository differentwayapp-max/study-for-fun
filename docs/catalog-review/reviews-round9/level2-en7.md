# שאלות "רמת מבחן" (רמה ב') – en7 ו-en7-nov26

לפי `docs/catalog-review/level-prompt-2.md`, סעיפים 6–7. נקודת המוצא: `reviews-round9/en7.md` (הטבלה "לפי פרק – רמה ופריטים ברמת מבחן" ו"סוגי משימות שחסרים"). סבב התיקונים כבר נעשה (`fixed-en7.md`), ולכן כל פריט מהדוח נבדק שוב מול הקבצים המתוקנים, וגם מול קלפי ההתאמה של הפרק אחרי התיקון.

- **en7:** ‏372 ← 495 שאלות (**123 ברמה ב'**).
- **en7-nov26 ("חזרה לתחילת כיתה ז'"):** ‏178 ← 200 שאלות (**22 ברמה ב'**).
- כל שאלה חדשה נמצאת בסוף רשימת השאלות של פרק קיים. לא נוספו פרקים, ולא השתנה סדר הפרקים או שמותיהם.
- **לא הועלה לאתר.** לא הורץ `deploy.sh`, ולא בוצעו פעולות git.

## העזרים (`Q` עם `lvl`)
- **en7:** ל-`Q` נוסף פרמטר `lvl=1`, והשדה השביעי `2` נוסף רק כש-`lvl == 2`. נוסף גם `Q2(...)` = `Q(..., lvl=2)`, כמו ב-en8.
- **en7_nov26:** בקובץ לא היה עזר `Q`, כי השאלות הקיימות כתובות כטאפלים. נוספו `Q` / `Q2` באותה צורה, ו-`ROW` (מהעזרים של en7). רק השאלות החדשות משתמשות בהם, והשאלות הקיימות לא נגעו.
- **בדיקת `SFF_DRY` לפני ההוספה:**
  - הרצתי עותק של `build_set.py` מתיקיית העבודה הזמנית, שמחשב את ה-`ver` גם במצב dry.
  - אחרי הוספת העזרים בלבד יצא אותו `ver`: en7 ‏`0a96e0430f`, ‏en7-nov26 ‏`2664515494`.
- **אחרי ההוספה:**
  - כל 372 / 178 השאלות הקיימות זהות בתוכן: טקסט, נושא, פרק, קבוצת האפשרויות, תשובה, הסבר ותמונה.
  - **שימו לב – סדר האפשרויות של שאלות קיימות זז.** ה-`rng` של `build_set.py` מערבב לפי הסדר בקובץ, ולכן כל שאלה שנוספה באמצע הקובץ מזיזה את הערבוב של השאלות שאחריה. התשובה הנכונה לא השתנתה. זה קורה בכל סט שמקבל רמה ב' בתוך הפרקים. נשאר כפי שהוא, כי `build_set.py` לא בתחום שלי.

## מה נוסף, לפי סוג משימה

| סוג | en7 | nov26 | איפה (פרקים) |
|---|---|---|---|
| מציאת טעות ותיקונה ("Find the mistake") | 12 | 2 | ‏-ed, ‏time words, ‏go–went, ‏didn't, ‏Past Progressive, ‏when/while, ‏will, השוואה, ‏not as…as, תואר/תואר פועל, ‏too, ‏although (‏"Although… but"); ב-nov26: ‏he go, ‏Does she likes |
| שאלה לתשובה נתונה | 10 | 2 | ‏Past questions ×4 (‏Where were they, ‏Who called, ‏What time did you get, ‏What did she buy), ‏What were you doing, ‏What will the weather…, ‏Where are you going to…, ‏Do you have to, ‏How many lessons, ‏תשובה קצרה I won't; ב-nov26: ‏Where does, ‏When do |
| המרה לשלילה ("Negative:") | 10 | 2 | ‏didn't open / sing / eat, ‏weren't (clouds, singing), ‏won't tell, ‏isn't going to, ‏isn't warm enough, ‏shouldn't, ‏wasn't any; ב-nov26: ‏doesn't like, ‏don't live |
| "usually … but yesterday" (ניגוד זמנים) | 6 | 2 | ‏-ed ×2, ‏time words, ‏woke, ‏didn't eat, ‏was watching; ב-nov26: ‏usually take / today is walking |
| שתי השלמות במשפט | 10 | 1 | ‏cleaned, watered · ‏was, were · ‏was riding, dropped · ‏rang, were writing · ‏While, started · ‏as, as · ‏careful, carefully · ‏too, enough · ‏mustn't, can · ‏some, any; ב-nov26: ‏drinks, drinks |
| מילת יחס אחרי תואר / פועל | 11 | – | ‏afraid of, ‏proud of, ‏worried about, ‏excited about, ‏good at, ‏wait for, ‏listen to, ‏interested in, ‏full of, ‏important for, ‏depend on |
| צירופים ופעלים מורכבים | 11 | – | ‏take an order, ‏miss the bus, ‏check in, ‏take a photo, ‏turn off, ‏look for, ‏make a mistake, ‏throw away, ‏take care of, ‏pick up, ‏cut down |
| there was / there were | 9 | – | ‏didn't-wasn't ×4 (אחת מהן שלילה), ‏Were there…?, ‏much/many ×2, ‏some/any ×2 (אחת מהן שלילה) |
| Present Simple מול Present Progressive | – | 10 | ‏Look! / Listen! / Shh… right now / now (‏is drinking, ‏is watching, ‏is ringing, ‏am not watching, ‏What is he doing), מול every Friday / twice a day / usually (‏bakes, ‏brushes, ‏Does he usually), ושני פריטי usually … but today |
| מילות רצף (כתיבה) | 7 | – | ‏First, ‏Then, ‏Finally ×2, ‏After that, ‏before, "Which of these starts a list of steps?" |
| פריטים בהקשר מהטבלה של הדוח | 18 | – | כתיב בתוך משפט (‏rubbed, ‏worried), פועל לא רגיל בהקשר (‏left, ‏drove), ‏When is she going to…, ‏even bigger, ‏shorter than מנתונים, ‏Jupiter… the biggest, ‏Dan הכי נמוך (טבלה ב-`TXT`), ‏the best day, סדר מילים (‏speaks English well), ‏hard / hardly, ‏should בלי רמז, ‏didn't have to, ‏How much does it cost, ‏Is there any milk, ‏Because בתחילת משפט, ‏disappointed בהקשר |
| Unseen: הפניה ("'it' is:") | 8 | 2 | כל אחד מארבעת הקטעים ×2, ‏Weather Watcher ×2 |
| Unseen: סדר אירועים | 7 | 2 | ‏FIRST / right after (‏Passport), ‏LAST / which watch (‏Inventor), ‏LAST that day (‏Beach), ‏start the book / FIRST (‏Screens); ‏right after / before leaving |
| Unseen: ראיה מהטקסט ("How do we know…?") | 6 | 1 | ‏grateful / didn't mind the delay, ‏wasn't easy, ‏dangerous for turtles / family changed, ‏the best evening; ‏why the weather matters |
| **סה"כ** | **123** (ב-34 פרקים) | **22** (ב-5 פרקים) | |

- **מילות רצף: 7 ולא 10.** כל פריט רצף שנכנס למשחק ההתאמה התנגש בקלפים של שני פרקי הקישור. למשל, "Finally, we went swimming" ו-"Before it was cold, we went swimming" נכונים, וכך גם "It was raining, then we stayed home". לכן כולם נוסחו כ-"Which of these fits?" ונשארים בבחירה מרובה. פריט שמונה ("Before the film…") נמחק, כי בניסוח הקצר גם after מתאים.
- **ראיה מהטקסט: 7.** בכל קטע יש שאלה אחת או שתיים, כדי לא לחזור על שאלות ה-Why הקיימות.
- **Present Simple מול Progressive:** כולן ב-en7-nov26, כי זה הסט של ההווה. ב-en7 אין פרק הווה, ופרק חדש לא בתחום.

## פריטים מהדוח ששונו או דולגו (הבדיקה החוזרת)

| פריט בדוח | מה נעשה | למה |
|---|---|---|
| "I usually walk the dog, but yesterday Dad ___ it." | ← "Dad usually cooks dinner, but last night Mom ___ it." ✔ cooked, ועוד "I usually walk to school, but yesterday I ___ there by bus." ✔ travelled | בפרק -ed יש קלפים (cleaned) שמתאימים ל-"Dad ___ it" |
| "The bus ___ suddenly…" ✔ stopped | ← "She ___ her hands together because they were cold." ✔ rubbed | הקלף stopped התאים ל-"The little girl ___ when she fell off her bike" |
| "Dana ___ her new bike to school yesterday." ✔ rode | ← "Dad ___ us to the beach in his new car." ✔ drove | הקלף rode התאים ל-"Last summer we ___ to Eilat by train" (ובפרק go–went: ‏brought her bike) |
| "We ___ home at seven and arrived at nine." ✔ left | ← "We ___ the house at seven…" | ‏flew home / went home התאימו |
| "Find the mistake: 'We buyed a cake.'" | נכנס כמו שהוא | – |
| "'Tom ate the cake.' Negative" | נכנס | – |
| "'They were at the mall.' – Where ___?" | נכנס | – |
| "'Ron called me.' – Who ___ you?" ✔ called | ← "___ you? – Ron called me." ✔ Who called (Who did called / Whom called / Who calls) | המילה called נמצאת בשאלה, וה-build פוסל ("question gives the answer away") |
| "While Maya ___ her bike, she ___ her phone." | נכנס | – |
| "When ___ she going to visit us?" | ← "…to come here?" | ‏"is" מופיע בתוך visit (נפסל ב-build) |
| "'Will you help me?' – 'Sorry, I ___.'" | נכנס | – |
| "Tel Aviv is big, but Jerusalem is even ___." | נכנס עם "Which is correct?" | ‏even better / even more interesting מקלפי הפרק נכונים |
| "Of all the planets, Jupiter is the ___." | ← "Jupiter is huge. In size, it is the ___ planet." | הקלף best ("the best planet") |
| "Ron is 140 cm. Gal is 150 cm…" | נכנס | – |
| "My bag is ___ heavy as yours." ✔ as | ← "Both boxes weigh 3 kg. Mine is ___ heavy ___ yours." ✔ as, as | ‏"as" נמצא בשאלה (נפסל ב-build) |
| "speaks English well" (סדר מילים) | נכנס ("Which word order is correct?") | – |
| "She worked ___ all day…" ✔ hard | נכנס עם "Which is correct?" | הקלף carefully ("worked carefully all day") |
| "The box was too heavy for me ___ lift." ✔ to | **דולג** | ‏"to" נמצא בתוך "too", ולכן נפסל ב-build. ‏too…to כבר קיים בפרק (‏"I'm ___ tired to do my homework") |
| "Yesterday was a holiday, so we ___ go to school." | נכנס | – |
| "You look ill. You ___ see a doctor." | נכנס עם "Which of these fits?" | הקלפים can / could ("You could see a doctor") |
| "How ___ does this T-shirt cost?" | נכנס | – |
| "Is there ___ milk left? – Yes, a little." | נכנס עם "Which of these fits?" (בלי left) | הקלפים some / much מתאימים |
| "___ the bus was late, we missed the film." | נכנס | – |
| "___, we packed. Then we drove. Finally, we flew." | ← "Which of these fits? ___, we packed. Then we flew." | ראו מילות רצף למעלה |
| "I'm afraid ___ spiders." / ‏"Are you interested ___ science?" | ‏afraid נכנס. ‏interested ← "Ron loves science. He's very ___ it." ✔ interested in | ‏"in" נמצא בתוך interested (נפסל ב-build) |
| "I'm ___ my keys…" ✔ looking for | ← "I'm ___ my phone. Have you seen it?" (בפרק Technology) | – |
| "Can you ___ a photo of us?" | ← "Don't forget to ___ a photo of the Eiffel Tower!" | – |
| "Noa didn't win, so she felt ___." | ← "Which of these fits? Noa lost the race, so she felt ___." | הקלפים jealous / embarrassed סבירים |
| Unseen – כל 9 הפריטים | נכנסו, ונוספו עליהם עוד 12 | ‏"What did the class do LAST?" ✔ ‏"visited recycling center". ‏"What happened LAST in the story?" ← "Which of these happened LAST?" (הדבר האחרון בסיפור הוא החברה והתוכנית ללמוד, והם לא באפשרויות) |
| "Look! The baby ___." ✔ is sleeping (הדוח, nov26) | ← "Look! The cat ___ my milk!" ✔ is drinking | `DUP vs en6` ("Look! The baby ___."). גם is sleeping התאים ל-"He ___ with his toys" |
| "She ___ to the market every Friday." ✔ goes | ← "Every Friday, Mom ___ a cake for us." ✔ bakes | כמעט זהה ל-"She ___ to the pool every Monday" באותו פרק |

## התנגשויות שנמצאו בבדיקה ותוקנו לפני הבנייה האחרונה
| שאלה (קיימת או חדשה) | הקלף החדש שהתאים | התיקון |
|---|---|---|
| "We ___ football yesterday." | ‏didn't play | השלילה ← "'We opened the gift.' Negative" ✔ didn't open |
| "Last summer we ___ to Eilat by train." | ‏didn't come | ← "'He sang a song.' Negative" ✔ didn't sing |
| "I ___ swim when I was five." | ‏couldn't | ← "'You should eat it.' Negative" ✔ shouldn't |
| "Hurry! We need to ___ the bus at eight." ✔ catch | ‏take (‏take a photo) | ← "Hurry, or we'll ___ the bus!" ✔ miss |
| "My parents ___ in Haifa." (nov26) | ‏are singing / walk | ← "Listen! Your phone ___ in your bag." ✔ is ringing, ‏"I usually ___ the bus, but today I'm walking." ✔ take |
| "My dad ___ the dishes." (nov26) | ‏is taking | ← "She usually takes the bus, but today she ___." ✔ is walking. ‏"Yesterday she walked, but she usually ___ the bus" נמחקה (הקלפים takes ו-is taking התאימו זה לזה) |
| פרקי הקישור (ch23–ch24) | ‏First, ‏Then, ‏Finally, ‏Before | כל פריטי הרצף ← "Which of these…" |

## כפילויות
- **ה-build:** אין `DUP` מול אף סט שבנוי בקטלוג.
- **סקריפט מול כל קבצי המקור `tools/sets/en*.py`:** זהות של טקסט ותשובה, ודמיון של יותר מ-0.8 עם אותה תשובה. נבדק גם en8 הנוכחי, שבזמן הבדיקה האחרונה היו בו 93 שאלות `Q2` של הסוכן האחר. נמצאו ותוקנו:
  - "Find the mistake: 'She will comes tomorrow.'" – כמעט זהה ל-en8 ‏"He will comes tomorrow" ← "'We will helps you later.'" ✔ helps → help.
  - "How ___ brothers do you have?" – זהה ל-en8#702 ← "'We have four lessons today.' – How ___ lessons do you have?".
  - nov26 ‏"What ___ you doing now? – I'm reading." – קרוב ל-en6 ‏"What ___ you doing? I'm painting." ← "What ___ your brother doing now? – Sleeping." ✔ is.
  - nov26 ‏"Listen! Someone ___ at the door." – קרוב ל-en6 ‏"Listen! Somebody ___ on the door.". גם הגרסה "Listen! The baby ___ again." קרובה ל-en5 ← "Listen! Your phone ___ in your bag.".
- **נשאר:** ‏"Which happened FIRST?" – אותו טקסט שאלה כמו בקטע של en8, אבל על קטע אחר ועם תשובה אחרת. זה לא כפילות.
- **en8 נכתב כרגע:** כדאי שהסוכן של en8 יריץ את אותה בדיקה מול en7 בסוף שלו. הסקריפט: ‏`/tmp/claude-0/-home-user-study-for-fun/8fe836c8-2ea6-5f64-93be-67f6a36fcaf5/scratchpad/en7l2/dups.py`.

## בדיקות (אחרי הבנייה האחרונה)
- **`SFF_DRY=1 SFF_PICSTATS=1`:**
  - en7: ‏`ok (dry): 495 questions`.
  - en7-nov26: ‏`ok (dry): 200 questions`.
  - אין `warning`.
  - שורות `OPTS`: ב-en7 עשר (ארבע חדשות ב-Unseen), והתשובה בכל המקומות. ב-nov26: 2/3/2/2.
- **build אמיתי (flock):**
  - en7: ‏`SFF1@en7-7002dc` (495 שאלות, 35 פרקים).
  - en7-nov26: ‏`SFF1@en7-nov26-b95408` (200 שאלות, 13 פרקים).
- **`local_scenes`:** ‏0 סצנות פגומות בשני הסטים.
- **`local_optsq`:** ‏`errs: []`, ‏`leaks: []`.
- **`match_list` (en7, en7-nov26):**
  - כל שאלה חדשה נבדקה מול כל קלפי הפרק שלה.
  - כל קלף חדש נבדק מול כל השאלות הקיימות בפרק.
  - התיקונים בטבלה למעלה.
  - פריטי "Find the mistake" ופריטי שתי ההשלמות יוצרים קלפים ייחודיים ("buyed → bought", ‏"was, were"), ולכן הם לא מתנגשים.
- **`review-practice-set` על כל 145 השאלות החדשות, בגרסה הבנויה:**
  - **(1) התשובה נכונה.** נבדקה גם הכרונולוגיה ב-Passport: הטלפון צלצל בבית הקפה לפני שאמא בדקה את הדרכונים.
  - **(2) אין מסיח נכון.**
    - הוחלפו: "Next" ב-"Last week we visit Grandma" (‏"Next week we visit Grandma" תקין), ‏"was ringing, wrote" (תקין דקדוקית) ← ‏ringed, ‏"watched" ב-"yesterday at ten I ___ TV" (‏"I watched TV" תקין), ‏"for" ב-worried / ‏"to" ב-important / ‏"on" ב-waiting.
    - ‏"make the bus" (סלנג אמריקאי), ‏"take down trees" ו-"arrive at Rome" לא נכנסו כאפשרויות.
  - **(3) המסיחים באותה צורה.** זוגות מול זוגות, ושלוש מילים לכל היותר.
  - **(4) השאלה לא מסגירה, ועומדת במגבלה.** עד 12 מילים ב-en7, ועד 10 ב-nov26.
  - **(5) התמונות:**
    - מראות את המצב, לא את התשובה.
    - ב-Unseen: ‏`OPTS` של כל האפשרויות לשאלות "'it' is", ו-ROW קבוע לשאלות סדר (FIRST / LAST / after).
    - הוחלפו ‏🪐 ‏🧃 ‏🪓 (אחרי 2019) ו-🪴.
    - ‏🥛 משמש כחלב בלבד.
  - **(6) התנגשויות:** ראו למעלה.
  - **(7) כפילויות:** ראו למעלה.
  - **(8) זכויות יוצרים:** הכול נכתב מחדש. השאלות על הקטעים מתייחסות לטקסטים המקוריים של הסט.
  - **(9) הסברים** עד 10 מילים.
- **`core_facts.json`:** לא שונה. אף שאלה מסומנת לא השתנתה, וה-build לא התריע.

## לא נעשה (מחוץ לפרומט)
- פרק Present Progressive ב-en7.
- קטעי Unseen שאינם סיפור.
- פרקי כתיבה (D4 בדוח).
- סדר האפשרויות של שאלות קיימות, שזז בגלל ה-rng של ה-build (ראו למעלה).
