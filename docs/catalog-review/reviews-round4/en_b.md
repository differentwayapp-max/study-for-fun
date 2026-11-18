# סבב 5 – אנגלית ב' (en6, en7, en7-nov26, en8)

שיטה: עברתי על כל שורות ה-CHANGED ב-new5 והשוויתי אותן לשורות המקבילות ב-dump4 (diff מלא). ממצאי reviews4/en_b.md אומתו מול dump5, ושאלות שזזו אותרו לפי הטקסט. בכל פרק השוויתי בין כל זוגות שאלות ה-⟨M⟩: האם הקלף של B הוא גם תשובה נכונה ל-A? המפתח הוא ansKey, ולכן "Did" ו-"did" הם אותו קלף. בתמונות של מילות היחס (en6 ch9) בדקתי במקור (r5/tools/sets/en6.py) את מיקום הסמלים: ON/UNDER/NEXT וסצנת המורה מול הילדים. כפילויות נבדקו מול en5, en6, en7 ו-en8.

ממצא כללי: בארבעת הסטים האלה ה"סוויפ" שינה רק 35 שורות, ורובן הוספה של רמז "(verb)", "Advice:" או מילה מבדילה. רוב התיקונים שהוצעו ב-reviews4 ל-en6 **לא בוצעו**.

---

### en6 (כיתה ו') — 460 שאלות

**אימות הבדיקה הקודמת**
| פריט | סטטוס | הערה |
|---|---|---|
| בעיה בשאלה ששונתה: #339 "A ___ is a top and a skirt in one piece." – מסיחים ברבים | ❌ | עדיין jeans / glasses / shoes. "A ___ is" מסגיר את dress מהדקדוק בלבד |
| התנגשות #255 sunny / #258 hot | ❌ | ללא שינוי. "The sun is shining. It's hot." נכון |
| התנגשות #32 is / #36 isn't | ❌ | ללא שינוי. "There isn't a big tree in our yard." נכון |
| התנגשות #158 took / #154, #157 got | ✅ | "Last week we ___ (take) the bus to Haifa." |
| התנגשות #318 blond / #321 short, #319 red | ✅ | "What color is Dana's hair?" short כבר לא מתאים, ו-red נשלל בתמונה 👱‍♀️ (שאלת זיהוי) |
| התנגשות #344 boots / #337 socks | ❌ | ללא שינוי. "In the rain I wear socks on my feet." נכון |
| התנגשות חלשה #254 rainy / #256 cloudy | ❌ | ללא שינוי |
| התנגשות חלשה #8 are playing / #2 are writing | ✅ | "The children ___ football in the garden…" אין קלף אחר שמתאים |
| התנגשות חלשה #314 Don't run / #308 "Don't smoke." | ❌ | ללא שינוי |
| התנגשות #122 was / #127 wasn't (⚠️ בסבב 4) | ❌ | ללא שינוי: "Yesterday I ___ at home. I watched TV all day." |
| תמונה #224 🎾 ל-"You need a racket for ___." | ❌ | עדיין 🎾 לבד |

**בעיות בשאלות ששונו**

אין בעיות חדשות. בדקתי את #8, #89, #143, #150, #158, #166, #202, #241 ו-#318: התשובות נכונות, יש רק תשובה נכונה אחת, וההסברים והשפה תקינים. ב-#89 התמונה היא סצנה: המורה גדולה בחזית והילדים קטנים ברקע, ולכן היא מתאימה ל-in front of ולא ל-behind.

הערה: התוספת "from the tap" ב-#241 לא יצרה כפילות. השאלה הייתה ונשארה כמעט זהה ל-en5#295 "I'm thirsty. I want some ___." (ראו בהתלבטויות).

**התנגשויות במשחקי התאמה**
| חומרה | מזהה A | מזהה B | הבעיה | תיקון |
|---|---|---|---|---|
| ודאי | en6#255 "The sun is shining. It's ___." (sunny) | en6#258 (hot) | פתוח מסבב 4. "It's hot" נכון, ו-☀️ לא מכריעה | "שמשי = ?" ✔ sunny |
| ודאי | en6#344 "In the rain I wear ___ on my feet." (boots) | en6#337 (socks) | פתוח מסבב 4. "I wear socks on my feet" נכון גם בגשם, ו-🌧️ 🦶 לא מכריעה | "Rain ___ keep my feet dry." ✔ boots, עם מסיחים hats / scarves / gloves |
| ודאי | en6#32 "There ___ a big tree in our yard." (is) | en6#36 (isn't) | פתוח מסבב 4. זה אותו דפוס כמו was/wasn't שתוקן ב-ch13. 🌳 🏡 מטה ל-is, אבל הטקסט לבדו מאפשר את שתיהן | "…in our yard. I love to sit under it." |
| קל | en6#122 "Yesterday I ___ at home. I watched TV all day." (was) | en6#127 (wasn't) | פתוח. אפשר לצפות בטלוויזיה גם מחוץ לבית | "Yesterday I ___ at home all day. I didn't go out." |
| קל | en6#254 "It's ___ today. Take an umbrella." (rainy) | en6#256 (cloudy) | פתוח. "It's cloudy. Take an umbrella." הגיוני | "…Take an umbrella – the streets are wet." |
| קל | en6#314 "Pool rule: ___ near the water." (Don't run) | en6#308 ("Don't smoke.") | פתוח. גם עישון ליד הבריכה אסור (בקלף יש נקודה, אבל הילד לא ישים לב) | "…near the water – the floor is slippery!" |
| קל | en6#381 "Tom is tall, ___ his brother is short." (but), en6#384 "The film was long, ___ it was very good." (but) | en6#376, #382 (and) | חדש. "Tom is tall, and his brother is short." הוא משפט טבעי לגמרי. גם "…long, and it was very good" תקין | לנסח את #381 ו-#384 כ-"Which word…?" (⟨—⟩), או למשל "Tom is tall, ___ he can't play basketball." |
| קל | en6#74 "We love ___ new house." (our) | en6#79 (their), en6#73/#77 (His/his), en6#72 (Her), en6#80 (your) | חדש. "We love their new house" (של השכנים) דקדוקי והגיוני. 🏡 לא מכריעה | "We love ___ new house. We moved in last week." |
| קל | en6#198 "At night I ___ to bed at ten." (go), en6#201 "…then I ___ breakfast." (have) | en6#196 (get) | חדש. "I get to bed at ten" ו-"then I get breakfast" הם ביטויים קיימים | רמז בסוגריים: "(go)" ו-"(have)", כמו שנעשה ב-ch15–ch16 |

**תמונות שמסגירות או מטעות**
| חומרה | מזהה | שאלה | ✔ | תמונה | תיקון |
|---|---|---|---|---|---|
| ודאי | en6#224 | You need a racket for ___. | tennis | 🎾 (סמל הענף, והמסיחים הם ענפים אחרים) | 🎾 🏃 ⚽ 🏊 (כל האפשרויות, כמו ב-#226 וב-#455), או 🏸 בלי כדור, או בלי תמונה |

שאר התמונות תקינות. #241 (🚰 🍞 🍚 🧀) ו-#335, #339, #342 מציגות את כל האפשרויות. #343 מציגה את התשובה ושניים משלושת המסיחים. ב-#323 ‏🧔 ("Look at his chin!") ו-#320 ‏👨‍🦲 התמונה היא נתון השאלה.

**התלבטויות חדשות**
| מזהה | שאלה | ההתלבטות |
|---|---|---|
| en6#52, #53, #56, #58; en6#43, #44 | Two ___ are talking. / three ___ in the kitchen / My mom has two ___. | בפרקי הרבים (ch5–ch6) כמעט כל קלף רבים מתאים דקדוקית לכל משפט ("My mom has two brothers", "Two men are talking"). ההכרעה היא רק לפי התמונה (👩 👩, 🐁, ⌚ ⌚). זה תקין כל עוד התמונה מוצגת בקלף |
| en6#241 / en5#295 | I'm thirsty. Can I have some ___ from the tap? / I'm thirsty. I want some ___. | כמעט זהות (water). הכפילות לא נוצרה בסוויפ |
| en6#150 / en5#225 | Yesterday I ___ (do) my homework… / I ___ my homework last night. | כמעט זהות (did). הכפילות קדמה לסוויפ |

**ציון:** 7.5 – השינויים בסוויפ תקינים, אבל 8 מתוך 11 ממצאי סבב 4 עדיין פתוחים. שלוש מההתנגשויות הפתוחות ודאיות (sunny/hot, boots/socks, is/isn't), וגם 🎾 ו-#339 נשארו.

---

### en7 (כיתה ז') — 372 שאלות

**אימות הבדיקה הקודמת**
| פריט | סטטוס | הערה |
|---|---|---|
| בעיה בשאלה ששונתה: #213 כפילות עם en6#34 ועם en8#143 ("There isn't ___ milk/juice in the fridge… not a drop") | ❌ | ללא שינוי, ואף אחת משלוש השאלות לא שונתה. לפי הכלל צריך לשנות את en8#143, כי זו הכיתה הגבוהה |
| התנגשות #76 was running / #79 was sleeping | ✅ | "He fell while he ___ to the bus." |

**בעיות בשאלות ששונו**

אין. בדקתי את 13 השורות: #58, #61, #76, #86, #133, #186–#188, #199, #215 ו-#295.
- #58 "___ it rain yesterday? – Yes, it rained." ✔ Did. אין בפרק קלף אחר שמתאים.
- #86 הפך את הכיוון ל-"will not = ?" ✔ won't. המפתח זהה ל-#91.
- #133 "Gold costs more" שולל את cheap.
- #199 "Now she…" שולל את had.

כל התשובות וההסברים נכונים. לא נוצרו כפילויות חדשות.

**התנגשויות במשחקי התאמה:** לא נמצאו התנגשויות ודאיות או קלות. עברתי על כל 30 הפרקים שיש בהם ⟨M⟩. בפרקי הכמתים (ch21–ch22) תוספות כמו "not one drop", "only five minutes" ו-"just three" סוגרות את much/any/a few.

**תמונות שמסגירות או מטעות:** אין. בשאלות "Which word goes with…" (#207, #218, #219) מוצגות התשובה ושניים מהמסיחים, וזה מקובל.

**התלבטויות חדשות**
| מזהה | שאלה | ההתלבטות |
|---|---|---|
| en7#186, #188 | Advice: you look tired. You ___ go to bed. (should) | הקלף could (‏#182, #185) יוצר "You could go to bed", שהיא הצעה דקדוקית. "Advice:" מכוון ל-should |
| en7#259 / en7#252 | Who designs buildings? (an architect) / Who builds bridges and machines? (an engineer) | גם מהנדס מתכנן בניינים. המילה designs מכוונת ל-architect |
| en7#41, #9, #51, #42 | (מסבב 4) | עדיין כמעט זהות ל-en6#163, #139, #173, #166. לא היה בתוכנית התיקונים |

**ציון:** 9 – כל השינויים תקינים וההתנגשות היחידה תוקנה. נשארה רק הכפילות של #213 עם en6 ועם en8.

---

### en7-nov26 (כיתה ז') — 178 שאלות

**אימות הבדיקה הקודמת**
| פריט | סטטוס | הערה |
|---|---|---|
| התנגשות #17 "What is this?" ⛈️ 💨 (storm) / #16 wind, #13 rain | ✅ | #17 ← "Rain, thunder and wind: a ___." ו-#13 ← "What is falling?" ‏🌧️. הטקסט מבדיל ביניהן, גם אם התמונה ⛈️ 💨 נשארה |

**בעיות בשאלות ששונו**

אין. בדקתי את #13, #17 ו-#44.
- #44 "כדור הארץ = ?" ✔ planet Earth, עם המסיחים city / sea / ground. הניסוח תקין, ו-"earth" מופיע בסט רק כמסיח (#43, #52).
- ב-#13 "What is falling?" עם 🌧️: הקלף snow לא מתאים לתמונה, והקלף cloud לא "נופל".

**התנגשויות במשחקי התאמה:** אין. בפרקי השיום ("What is this?" / "Who is he?") כל תמונה מתאימה לקלף אחד. בפרקי הדקדוק (ch1, ch3, ch5, ch11, ch13) אין קלף שני שמתאים.

**תמונות שמסגירות או מטעות:** אין. ב-#17 ‏⛈️ 💨 מציגה את נתוני ההגדרה (rain, thunder, wind), כמו "A ___ flies a plane" עם ✈️. זה לא מסגיר.

**התלבטויות חדשות:** אין.

**ציון:** 9.5 – סט נקי. כל ממצאי סבב 4 תוקנו.

---

### en8 (כיתה ח') — 380 שאלות

**אימות הבדיקה הקודמת**
| פריט | סטטוס | הערה |
|---|---|---|
| התנגשות #59 was skiing / #57 was playing | ✅ | "…while I ___ down the mountain." התמונה הוחלפה מ-⛷️ ל-🏔️ 🦴, וכבר לא מסגירה |
| curriculum.json, אנגלית כיתה ח': להוסיף Passive, used to וגזירת מילים | ❌ | ב-r5/public/share/curriculum.json, ב-grades/7/אנגלית, עדיין רק 4 שורות: Unseen, Present Perfect, תנאי + who/which/that, וקישור + Band II |
| (התלבטות) #128 should / must | ✅ | "My advice: you ___ take an umbrella." |
| (התלבטות) #143 כפילות milk | ❌ | ראו en7#213 |

**בעיות בשאלות ששונו**
| מזהה | שאלה | בעיה | תיקון מוצע |
|---|---|---|---|
| en8#266 | Sun and wind never run out. They are ___ energy. (renewable) | ניסוח קל בלבד: שמש ורוח הן *מקורות* אנרגיה. התשובה נכונה ויחידה | "They are ___ energy sources." |

שאר השורות (#1, #6, #24, #25, #59, #62, #128, #133, #182, #283, #310) תקינות.
- ב-#25 "Which time word goes with Present Perfect?" ✔ yet: הקלפים since / for / just / already / never / ever נמצאים ב-ch2 וב-ch4, ולא ב-ch3. בפרק ch3 הקלף היחיד של מילת זמן הוא ago (‏#24), ולכן אין התנגשות.
- הרמז "(make)" ב-#182 סוגר את are grown ואת are delivered.

**התנגשויות במשחקי התאמה:** לא נמצאו התנגשויות ודאיות או קלות. עברתי על 32 פרקים: Present Perfect, Past Progressive (‏#49 "She hurt her hand while she ___." – רק was cooking מתאים דקדוקית לשאלה שאין בה מושא), modals, כמתים, מילות זיקה, Passive, used to וגזירת מילים.

**תמונות שמסגירות או מטעות:** אין. כרטיסי הנתונים (#111, #113, #114, #138 "NO SWIMMING" ו-#249) הם חלק מהשאלה.

**התלבטויות חדשות**
| מזהה | שאלה | ההתלבטות |
|---|---|---|
| en8#21 / en8#22 | I ___ to London twice in my life. (have been) / …went | באנגלית אמריקאית "I went to London twice in my life" נאמר. Present Perfect הוא נושא השיעור, ולכן זה מקובל |
| en8#310 / en8#318 | I found my lost dog, so I'm not worried. I feel ___. (relieved) / cheerful | "I feel cheerful" דקדוקי. "so I'm not worried" מכוון ל-relieved |
| en8#130 | Take a coat. It ___ be cold later. (might) | מסבב 4, ללא שינוי: "should" (‏#134, #139) במשמעות "צפוי" |

**ציון:** 9 – כל השינויים תקינים וההתנגשות היחידה תוקנה. נשארו פתוחים curriculum.json והכפילות של #143.

---

## סיכום
| סט | ✅ | ⚠️ | ❌ | בעיות חדשות בשורות ששונו | התנגשויות (ודאי/קל) | תמונות (ודאי/קל) |
|---|---|---|---|---|---|---|
| en6 | 3 | 0 | 8 | 0 | 3 / 6 (3 הוודאיות ו-3 מהקלות פתוחות מסבב 4, ו-3 קלות חדשות: and/but, our/their, get) | 1 / 0 (#224, פתוח) |
| en7 | 1 | 0 | 1 | 0 | 0 / 0 | 0 / 0 |
| en7-nov26 | 1 | 0 | 0 | 0 | 0 / 0 | 0 / 0 |
| en8 | 2 | 0 | 2 | 1 (ניסוח קל, #266) | 0 / 0 | 0 / 0 |

**3 הבעיות החמורות בכל סט**
- **en6:** (1) #255 sunny ↔ #258 hot; (2) #344 boots ↔ #337 socks; (3) #32 is ↔ #36 isn't. עוד פתוחים: 🎾 ב-#224, והמסיחים ברבים ב-#339.
- **en7:** (1) #213 כפילות עם en6#34 ועם en8#143. אין בעיות נוספות ברמה הזו.
- **en7-nov26:** אין בעיות פתוחות.
- **en8:** (1) curriculum.json לא עודכן; (2) #143 כפילות (milk, not a drop); (3) ניסוח קל ב-#266.
