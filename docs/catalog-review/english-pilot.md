# גרסה באנגלית – סט הניסיון (math3, sci4)

גרסת האפליקציה: sff-v162 + השינויים בענף `claude/sharp-volta-jie6e7` (לא הועלה לאוויר).
מספרי השאלות (`math3#12`) הם המיקום בסט הבנוי `public/share/<id>.txt`.

## מה נעשה
- **שלב א – תמיכה באפליקציה (קוד):** במצב אנגלית מוצגים השאלה, התשובות, ההסבר, טקסט בתמונות, שמות הפרקים והנושאים באנגלית,
  בכל המשחקים, במסך הסיום, במפת הדרך, ברשימת השאלות של ההורה, בטעויות, במעקב ובמסכי המורה. העברית נשארת המפתח –
  ההיסטוריה וההתקדמות נשמרות בעברית, ומעבר שפה לא משנה דבר. שאלה שנערכה אחרי התרגום חוזרת לעברית עד שתתורגם שוב.
  תוקן גם: "רגע…" באנגלית, ושמות הפרקים של סטים בעברית כבר לא מתורגמים חלקית ("Open, אמצע וסוף").
- **התוכן:** `tools/sets_en/math3.json` (378 שאלות), `tools/sets_en/sci4.json` (279 שאלות) + שמות הסט, הנושאים, הפרקים והתגיות.
- **תהליך:** מתרגמים (5, במקביל, לפי המילון והכללים ב-`docs/english-content-prompt.md`) → בדיקה עצמאית של סוקר
  שלא תרגם, שאלה מול שאלה → תיקונים → בדיקות הבנייה.

## הבדיקות
| בדיקה | math3 | sci4 |
|---|---|---|
| `SFF_DRY=1 build_set.py` (כולל בדיקות האנגלית: אורך, 4 תשובות שונות, אין עברית, תשובה בשאלה, כרטיסים, התנגשויות בפרק) | ok, 378/378 באנגלית | ok, 279/279 באנגלית |
| `local_scenes.js` בעברית ובאנגלית (`SFF_LANG=en`) | 0 תמונות פגומות | 0 תמונות פגומות |
| `local_english.js` (כל פרק, כל משחק, מסך סיום, מעקב – אין עברית במצב אנגלית; העברית נשארת המפתח; במצב עברית אין אנגלית) | עבר | עבר |
| שאר `local_*.js` | עברו, חוץ מ-`local_games`, `local_round2` – נכשלים גם בלי השינוי (לא קשור) | |

## ממצאי הסוקר העצמאי (תוקנו)
| | math3 | sci4 |
|---|---|---|
| שגיאות (משמעות, שתי תשובות נכונות, רמז לתשובה, אנגלית שגויה) | 20 | 7 |
| שיפורי ניסוח / מונחים | 4 | 24 |

העיקריים: טבלאות של כרטיסים בתמונה (שם ← ערך) נקראו הפוך באנגלית – הוחלפו כך שהשם משמאל (19 ב-math3, 6 ב-sci4;
בשלוש טבלאות שבהן השם לא נכנס משמאל נשאר הסדר "35° | Eilat"); "flashlight" הסגיר את התשובה "Light";
"Half a liter" / "1/2 L" לאותה תשובה בפרק אחד (התנגשות במשחק ההתאמה) – אוחד.

## בעיות בעברית שעלו בדרך (לא שונו – להחלטתך)
| מזהה | ציטוט | בעיה | הצעה |
|---|---|---|---|
| sci4 | "רוכבים על סקייטבורד. מה מגן על הברכיים?" → "מגני ברכיים" | השאלה מסגירה את התשובה | "מה מגן על הרגליים כשנופלים?" (כך באנגלית) |

(המתרגמים והסוקרים הציעו עוד שלוש; בדקתי ונפסלו – התשובות בפרקים שונים, או כרטיסים של מספרים בלבד.)

## אישור הבעלים (28.11)
הסגנון אושר. תיקון אחד: שאלה שמשווה תרגילים לא חוזרת על התרגילים – "Which exercise gives the greater result?"
(math3: "מה גדול יותר: 9 כפול 2 או 5 כפול 3?" ו"מה גדול יותר?" 21 × 4 / 41 × 2; התשובות "9 × 2" / "5 × 3"). הכלל נוסף ל-§4.2.

## 30 שאלות מכל סט (כפי שאושרו)
עמודת English היא מה שהילד רואה במצב אנגלית (🖼 = טקסט בתמונה).

### מתמטיקה ג' (math3) – 30 שאלות לדוגמה

| # | פרק | עברית | English | התשובה |
|---|---|---|---|---|
| math3#5 | Thousands, hundreds, tens and ones | כתבו במספר: שבעת אלפים ושמונים<br>7,800 / 7,080 / 7,008 / 780<br>💡 7 אלפים, 0 מאות, 8 עשרות, 0 אחדות | Write as a number: seven thousand eighty<br>7,800 / 7,080 / 7,008 / 780<br>💡 7 thousands, 0 hundreds, 8 tens, 0 ones<br>🖼 שבעת אלפים→seven thousand · ושמונים→eighty | 7,080 |
| math3#12 | Building numbers | באיזה מספר ספרת המאות היא 6?<br>6,340 / 3,460 / 3,640 / 3,406<br>💡 3,640: 3 אלפים, 6 מאות, 4 עשרות | Which number has 6 in the hundreds place?<br>6,340 / 3,460 / 3,640 / 3,406<br>💡 3,640: 3 thousands, 6 hundreds, 4 tens | 3,640 |
| math3#26 | Greater, less or equal | איזה מספר נמצא בין 2,998 ל-3,001?<br>3,010 / 2,999 / 2,997 / 3,002<br>💡 2,998, 2,999, 3,000, 3,001 | Which number is between 2,998 and 3,001?<br>3,010 / 2,999 / 2,997 / 3,002<br>💡 2,998, 2,999, 3,000, 3,001 | 2,999 |
| math3#30 | Sequences and the number line | מה המספר הבא בסדרה?<br>3,600 / 4,000 / 4,500 / 3,550<br>💡 קופצים כל פעם 500 | What is the next number in the pattern?<br>3,600 / 4,000 / 4,500 / 3,550<br>💡 Jump by 500 each time | 4,000 |
| math3#41 | Rounding to tens and hundreds | עגלו את 347 למאות<br>340 / 350 / 400 / 300<br>💡 ספרת העשרות 4 – מעגלים למטה | Round 347 to the nearest hundred<br>340 / 350 / 400 / 300<br>💡 The tens digit is 4 – round down | 300 |
| math3#68 | Column addition | מה המספר החסר?<br>3,500 / 8,500 / 4,500 / 3,000<br>💡 6,000 − 2,500 = 3,500 | What is the missing number?<br>3,500 / 8,500 / 4,500 / 3,000<br>💡 6,000 − 2,500 = 3,500 | 3,500 |
| math3#71 | Column subtraction | 7,352 − 4,128 =<br>3,224 / 3,234 / 4,224 / 3,236<br>💡 2 − 8: פורטים עשרת, 12 − 8 = 4 | 7,352 − 4,128 =<br>3,224 / 3,234 / 4,224 / 3,236<br>💡 2 − 8: regroup a ten, 12 − 8 = 4 | 3,224 |
| math3#85 | Stories with addition and subtraction | משאית שקלה 5,200 ק״ג. פרקו 1,800 ק״ג. כמה היא שוקלת עכשיו?<br>4,400 ק״ג / 7,000 ק״ג / 3,400 ק״ג / 3,600 ק״ג<br>💡 5,200 − 1,800 = 3,400 | A truck weighed 5,200 kg. They unloaded 1,800 kg. What does it weigh now?<br>4,400 kg / 7,000 kg / 3,400 kg / 3,600 kg<br>💡 5,200 − 1,800 = 3,400 | 3,400 kg |
| math3#99 | Two-step stories | כמה ספרים נמכרו בשני הימים יחד?<br>3,100 / 2,900 / 3,000 / 300<br>💡 1,350 + 1,650 = 3,000 | How many books were sold on the two days together?<br>3,100 / 2,900 / 3,000 / 300<br>💡 1,350 + 1,650 = 3,000<br>🖼 1,350→Sunday · יום א'→1,350 · 1,650→Monday · יום ב'→1,650 | 3,000 |
| math3#110 | Division facts | 56 : 8 =<br>6 / 8 / 7 / 48<br>💡 7 × 8 = 56 | 56 ÷ 8 =<br>6 / 8 / 7 / 48<br>💡 7 × 8 = 56<br>🖼 56 : 8→56 ÷ 8 | 7 |
| math3#128 | Multiplying tens and hundreds | כרטיס טיסה עולה 700 ₪. כמה עולים 3 כרטיסים?<br>703 ₪ / 210 ₪ / 2,100 ₪ / 21,000 ₪<br>💡 7 מאות × 3 = 21 מאות | A plane ticket costs 700 ₪. How much do 3 tickets cost?<br>703 ₪ / 210 ₪ / 2,100 ₪ / 21,000 ₪<br>💡 7 hundreds × 3 = 21 hundreds | 2,100 ₪ |
| math3#133 | Dividing tens and hundreds | 900 : 3 =<br>30 / 300 / 3,000 / 600<br>💡 9 מאות : 3 = 3 מאות | 900 ÷ 3 =<br>30 / 300 / 3,000 / 600<br>💡 9 hundreds ÷ 3 = 3 hundreds<br>🖼 900 : 3→900 ÷ 3 | 300 |
| math3#140 | Multiplying tens and ones | 23 × 3 =<br>96 / 26 / 66 / 69<br>💡 20 × 3 = 60, 3 × 3 = 9 | 23 × 3 =<br>96 / 26 / 66 / 69<br>💡 20 × 3 = 60, 3 × 3 = 9 | 69 |
| math3#161 | Dividing tens and ones | 96 : 3 =<br>93 / 33 / 32 / 23<br>💡 90 : 3 = 30, 6 : 3 = 2 | 96 ÷ 3 =<br>93 / 33 / 32 / 23<br>💡 90 ÷ 3 = 30, 6 ÷ 3 = 2<br>🖼 96 : 3→96 ÷ 3 | 32 |
| math3#176 | Division problems | בשבוע 7 ימים. כמה שבועות הם 98 ימים?<br>91 / 13 / 15 / 14<br>💡 70 : 7 = 10, 28 : 7 = 4 | A week has 7 days. How many weeks are 98 days?<br>91 / 13 / 15 / 14<br>💡 70 ÷ 7 = 10, 28 ÷ 7 = 4<br>🖼 98 : 7→98 ÷ 7 | 14 |
| math3#186 | How many times more? | לגל 16 גולות. לאבי פי 2 יותר. כמה לאבי?<br>8 / 162 / 18 / 32<br>💡 פי 2 – כופלים: 16 × 2 = 32 | Gal has 16 marbles. Avi has 2 times as many. How many does Avi have?<br>8 / 162 / 18 / 32<br>💡 2 times as many – multiply: 16 × 2 = 32<br>🖼 16→Gal · גל→16 · ?→Avi · אבי→? | 32 |
| math3#191 | How many times less? | חולצה עולה 56 ₪, והגרביים זולים ממנה פי 8. כמה הגרביים?<br>448 ₪ / 48 ₪ / 64 ₪ / 7 ₪<br>💡 56 : 8 = 7 | A shirt costs 56 ₪, 8 times as much as the socks. How much are the socks?<br>448 ₪ / 48 ₪ / 64 ₪ / 7 ₪<br>💡 56 ÷ 8 = 7<br>🖼 56 ₪→Shirt · חולצה→56 ₪ · ?→Socks · גרביים→? | 7 ₪ |
| math3#203 | Division with remainder | 50 : 6 =<br>8 ושארית 2 / 9 ושארית 2 / 7 ושארית 8 / 8 ושארית 4<br>💡 8 × 6 = 48, ונשארים 2 | 50 ÷ 6 =<br>8 R 2 / 9 R 2 / 7 R 8 / 8 R 4<br>💡 8 × 6 = 48, and 2 are left over<br>🖼 50 : 6→50 ÷ 6 | 8 R 2 |
| math3#221 | Multiplication and division first | 20 − 12 : 4 =<br>5 / 17 / 2 / 8<br>💡 קודם חילוק: 12 : 4 = 3 | 20 − 12 ÷ 4 =<br>5 / 17 / 2 / 8<br>💡 Divide first: 12 ÷ 4 = 3<br>🖼 20 − 12 : 4→20 − 12 ÷ 4 | 17 |
| math3#238 | Parentheses | בכל שקית 4 תפוחים. יש 3 שקיות ועוד 2 תפוחים. כמה תפוחים?<br>9 / 24 / 14 / 20<br>💡 3 × 4 + 2 = 14 | Each bag has 4 apples. There are 3 bags and 2 more apples. How many apples?<br>9 / 24 / 14 / 20<br>💡 3 × 4 + 2 = 14 | 14 |
| math3#246 | Part of a whole | איזה שבר הכי קטן?<br>שליש / רבע / שלם / חצי<br>💡 ככל שיש יותר חלקים, כל חלק קטן | Which fraction is the smallest?<br>one third / one quarter / one whole / one half<br>💡 The more parts, the smaller each part | one quarter |
| math3#250 | Part of a quantity | כמה זה חצי מ-18?<br>8 / 9 / 36 / 6<br>💡 18 : 2 = 9 | What is half of 18?<br>8 / 9 / 36 / 6<br>💡 18 ÷ 2 = 9 | 9 |
| math3#279 | Perpendicular and parallel lines | באיזו אות יש קווים מאונכים?<br>F / V / O / N<br>💡 ב-F הקווים נפגשים בזווית ישרה | Which letter has perpendicular lines?<br>F / V / O / N<br>💡 In F, the lines meet at right angles | F |
| math3#281 | Triangles | משולש שיש בו זווית ישרה נקרא…<br>חד זווית / ישר זווית / קהה זווית / שווה צלעות<br>💡 יש בו פינה כמו פינת דף | What is a triangle with a right angle called?<br>Acute triangle / Right triangle / Obtuse triangle / Equilateral triangle<br>💡 It has a corner like a page corner | Right triangle |
| math3#292 | Quadrilaterals | האם כל ריבוע הוא מלבן?<br>לא / רק לפעמים / רק ריבוע גדול / כן<br>💡 לריבוע 4 זוויות ישרות – לכן הוא מלבן | Is every square a rectangle?<br>No / Only sometimes / Only a big square / Yes<br>💡 A square has 4 right angles, so it is a rectangle | Yes |
| math3#309 | mm, cm, m and km | מה ארוך יותר: 1 מטר או 120 ס״מ?<br>אי אפשר לדעת / הם שווים / 120 ס״מ / 1 מטר<br>💡 1 מטר = 100 ס״מ | Which is longer: 1 m or 120 cm?<br>Can't tell / They are equal / 120 cm / 1 m<br>💡 1 m = 100 cm | 120 cm |
| math3#320 | Grams and kilograms | כמה גרם יש בקילוגרם אחד?<br>1,000 / 100 / 60 / 10<br>💡 קילו = אלף | How many grams are in one kilogram?<br>1,000 / 100 / 60 / 10<br>💡 Kilo means a thousand | 1,000 |
| math3#339 | Liters | בבריכת ילדים 500 ליטר. הוסיפו 250 ליטר. כמה עכשיו?<br>250 ליטר / 750 ליטר / 700 ליטר / 755 ליטר<br>💡 500 + 250 = 750 | A kiddie pool has 500 L. We added 250 L. How much is in it now?<br>250 L / 750 L / 700 L / 755 L<br>💡 500 + 250 = 750 | 750 L |
| math3#349 | Hours and minutes | יצאנו ב-7:40 ונסענו 35 דקות. מתי הגענו?<br>8:05 / 7:75 / 8:15 / 8:25<br>💡 20 דקות עד 8:00, ועוד 15 | We left at 7:40 and drove for 35 minutes. When did we arrive?<br>8:05 / 7:75 / 8:15 / 8:25<br>💡 20 minutes to 8:00, then 15 more | 8:15 |
| math3#356 | The calendar | איזה חודש בא אחרי מרץ?<br>פברואר / אפריל / מאי / יוני<br>💡 ינואר, פברואר, מרץ, אפריל | Which month comes after March?<br>February / April / May / June<br>💡 January, February, March, April<br>🖼 ינואר→January · פברואר→February · מרץ→March | April |

### מדעים ד' (sci4) – 30 שאלות לדוגמה

| # | פרק | עברית | English | התשובה |
|---|---|---|---|---|
| sci4#0 | Volume – how much space an object takes up | מהו נפח?<br>החום של הגוף / צורת הגוף / הצבע של הגוף / המקום שגוף תופס<br>💡 נפח הוא המקום שהגוף תופס | What is the volume of an object?<br>Its warmth / Its shape / Its color / The space it fills<br>💡 Volume is the space an object takes up | The space it fills |
| sci4#3 | Volume – how much space an object takes up | כמה מ״ל יש בליטר אחד?<br>1,000 / 100 / 10 / 500<br>💡 ליטר אחד = 1,000 מ״ל | How many mL are in one liter?<br>1,000 / 100 / 10 / 500<br>💡 1 liter = 1,000 mL<br>🖼 ליטר אחד→1 liter · = ? מ״ל→= ? mL | 1,000 |
| sci4#10 | Amount of material – mass and scales | מה מודדים במאזניים?<br>טמפרטורה / אורך / נפח / מסה<br>💡 מאזניים מודדים מסה – כמות החומר | What do we measure with a balance?<br>Temperature / Length / Volume / Mass<br>💡 A balance measures mass – the amount of matter | Mass |
| sci4#28 | Solid, liquid and gas | את מה הכי קל לדחוס למקום קטן?<br>גז / נוזל / מוצק / אף אחד מהם<br>💡 גז אפשר לדחוס; נוזל ומוצק כמעט לא | Which is the easiest to squeeze into a small space?<br>Gas / Liquid / Solid / None of them<br>💡 A gas can be compressed; liquids and solids hardly at all | Gas |
| sci4#32 | Changes between states of matter | מים רותחים הופכים לאדים. איך נקרא התהליך?<br>התאדות / התכה / קיפאון / התעבות<br>💡 התאדות: מנוזל לגז | Boiling water turns into vapor. What is this process called?<br>Evaporation / Melting / Freezing / Condensation<br>💡 Evaporation: from liquid to gas | Evaporation |
| sci4#44 | Properties of water | מוזגים שמן ומים לאותה כוס. מה יקרה?<br>השמן ישקע / המים יתאדו / יתערבבו לגמרי / השמן יצוף למעלה<br>💡 שמן לא מתמוסס במים וצף מעליהם | Oil and water are poured into the same glass. What will happen?<br>The oil sinks / The water evaporates / They mix completely / The oil floats<br>💡 Oil doesn't dissolve in water and floats on it | The oil floats |
| sci4#56 | Using and saving water | מים זורמים מסובבים טורבינה. מה היא מייצרת?<br>מלח / חשמל / קרח / אדמה<br>💡 תחנת כוח מים מייצרת חשמל | Flowing water turns a turbine. What does it produce?<br>Salt / Electricity / Ice / Soil<br>💡 A water power station makes electricity | Electricity |
| sci4#62 | Stages of the water cycle | מי גשם נכנסים לתוך האדמה. איך נקרא התהליך?<br>התעבות / חלחול / התאדות / התכה<br>💡 המים מחלחלים דרך האדמה | Rainwater goes into the ground. What is this process called?<br>Condensation / Infiltration / Evaporation / Melting<br>💡 The water seeps down through the soil | Infiltration |
| sci4#77 | The water cycle around us | באיזה שלב המים עוברים מנוזל לגז?<br>התאדות / חלחול / משקעים / התעבות<br>💡 התאדות: מים הופכים לאדים | At which stage does water change from liquid to gas?<br>Evaporation / Infiltration / Precipitation / Condensation<br>💡 Evaporation: water turns into vapor | Evaporation |
| sci4#81 | Air has volume, mass and pressure | ניפחנו בלון. מה נכנס לתוכו?<br>כלום / מים / חול / אוויר<br>💡 האוויר תופס מקום ומנפח את הבלון | We blew up a balloon. What went inside it?<br>Nothing / Water / Sand / Air<br>💡 Air takes up space and fills the balloon | Air |
| sci4#95 | Using air and keeping it clean | איזה אוויר יוצא ממייבש שיער?<br>אוויר מלוכלך / אוויר חם / אוויר רטוב / אוויר קפוא<br>💡 זרם אוויר חם מייבש את השיער | What kind of air comes out of a hair dryer?<br>Dirty air / Hot air / Wet air / Freezing air<br>💡 A stream of hot air dries the hair | Hot air |
| sci4#93 | Using air and keeping it clean | מה מניע סירת מפרש?<br>הדלק / החשמל / השמש / הרוח<br>💡 הרוח – אוויר בתנועה – דוחפת את המפרש | What moves a sailboat?<br>Fuel / Electricity / Sunlight / Wind<br>💡 Wind – moving air – pushes the sail | Wind |
| sci4#100 | The skeleton and joints | איזו עצם מגינה על המוח?<br>עצם הזרוע / עצם הירך / הצלעות / הגולגולת<br>💡 הגולגולת היא קופסה קשה סביב המוח | Which part of the skeleton protects the brain?<br>The upper arm bone / The thighbone / The ribs / The skull<br>💡 The skull is a hard box around the brain | The skull |
| sci4#118 | Muscles and movement | אילו מערכות עובדות יחד כדי שנזוז?<br>עיניים ואוזניים / שלד ושרירים / קיבה ומעיים / עור ושיער<br>💡 השרירים מושכים את עצמות השלד | Which systems work together so we can move?<br>Eyes and ears / Skeleton and muscles / Stomach and intestines / Skin and hair<br>💡 Muscles pull the bones of the skeleton | Skeleton and muscles |
| sci4#128 | The skin and its jobs | למה רוחצים ידיים לפני האוכל?<br>לחמם את הידיים / לייבש את הידיים / לצבוע את הידיים / לשטוף חיידקים מהידיים<br>💡 סבון ומים מסירים חיידקים | Why do we wash our hands before eating?<br>To warm them / To dry them / To color them / To remove germs<br>💡 Soap and water remove germs | To remove germs |
| sci4#132 | Taking care of the body | רוכבים על סקייטבורד. מה מגן על הברכיים?<br>כפפות צמר / צעיף / נעלי בית / מגני ברכיים<br>💡 מגנים מונעים שריטות ופציעות | You ride a skateboard. What protects your legs if you fall?<br>Wool gloves / A scarf / Slippers / Knee pads<br>💡 Pads prevent scrapes and injuries | Knee pads |
| sci4#144 | Earth's spheres | מפני מה מגינה שכבת האוזון?<br>רוחות / גשם חזק / שלג / קרינה מזיקה מהשמש<br>💡 האוזון בולע חלק מקרינת השמש | What does the ozone layer protect us from?<br>Winds / Heavy rain / Snow / Harmful sun rays<br>💡 Ozone absorbs part of the Sun's radiation | Harmful sun rays |
| sci4#149 | Weather and rain in Israel | באיזה אזור בישראל יורד הכי הרבה גשם?<br>בערבה / בדרום / בצפון / באילת<br>💡 בצפון יורד יותר גשם מבדרום | Which part of Israel gets the most rain?<br>The Arava / The south / The north / Eilat<br>💡 The north gets more rain than the south | The north |
| sci4#167 | Lithosphere – the rock sphere | באיזו מעטפת מתרחשת רעידת אדמה?<br>ליתוספרה / אטמוספרה / ביוספרה / הידרוספרה<br>💡 הסלעים בעומק האדמה זזים, והקרקע רועדת | In which sphere do earthquakes happen?<br>Lithosphere / Atmosphere / Biosphere / Hydrosphere<br>💡 Rocks deep underground move, and the ground shakes | Lithosphere |
| sci4#170 | Biosphere – the sphere of life | איפה חיים יצורים בכדור הארץ?<br>רק באוויר / רק בים / ביבשה, במים ובאוויר / רק ביבשה<br>💡 הביוספרה נוגעת בכל שלוש המעטפות האחרות | Where on Earth are living things found?<br>Only in the air / Only in the sea / Land, water and air / Only on land<br>💡 The biosphere touches all three other spheres | Land, water and air |
| sci4#188 | Five groups of vertebrates | לאיזו קבוצה שייך התנין?<br>דו-חיים / יונקים / דגים / זוחלים<br>💡 לתנין קשקשים קשים והוא מטיל ביצים | Which group does the crocodile belong to?<br>Amphibians / Mammals / Fish / Reptiles<br>💡 A crocodile has hard scales and lays eggs | Reptiles |
| sci4#179 | Five groups of vertebrates | מה משותף לכל בעלי החוליות?<br>עמוד שדרה / קשקשים / נוצות / זימים<br>💡 לכולם שלד פנימי עם עמוד שדרה | What do all vertebrates have in common?<br>A backbone / Scales / Feathers / Gills<br>💡 They all have an inner skeleton with a backbone | A backbone |
| sci4#198 | Identifying features of each group | לפי הטבלה – לאיזו קבוצה שייך בעל החיים?<br>עופות / דגים / יונקים / זוחלים<br>💡 פרווה וגור חי – יונק | According to the table, which group does the animal belong to?<br>Birds / Fish / Mammals / Reptiles<br>💡 Fur and live young – a mammal<br>🖼 פרווה→Yes · יש→Fur · נוצות→No · אין→Feathers · ביצים→No · לא מטיל→Eggs | Mammals |
| sci4#202 | Invertebrates | האם העכביש הוא חרק?<br>כן / לא / רק עכביש גדול / רק בלילה<br>💡 לעכביש 8 רגליים, ולחרק 6 | Is a spider an insect?<br>Yes / No / Only big spiders / Only at night<br>💡 A spider has 8 legs, and an insect has 6 | No |
| sci4#216 | Adaptations and classification keys | לפי מפתח המיון בכרטיס – מי זה?<br>יונה / לטאה / עטלף / דג<br>💡 עמוד שדרה ונוצות – עוף | According to the classification key on the card, which animal is it?<br>Pigeon / Lizard / Bat / Fish<br>💡 A backbone and feathers – a bird<br>🖼 יש עמוד שדרה→Has a backbone · יש נוצות→Has feathers | Pigeon |
| sci4#228 | Need, structure and function | על איזה צורך עונה מתקן המים בבית הספר?<br>תאורה / שתייה / חימום / תחבורה<br>💡 מתקן המים נותן מים לשתות | What need does the school water fountain meet?<br>Lighting / Drinking / Heating / Transportation<br>💡 The fountain gives us water to drink | Drinking |
| sci4#236 | Input, process and output | חיישן מדליק אור כשמחשיך. איזה חלק במערכת הוא?<br>פלט / בקרה / תוצר / חומר גלם<br>💡 הבקרה בודקת ומפעילה את המערכת | A sensor switches on a lamp when it gets dark. Which system part is this?<br>Output / Control / Product / Raw material<br>💡 Control checks and runs the system | Control |
| sci4#245 | Lever, pulley and wheel | איזו מכונה פשוטה היא פותחן בקבוקים?<br>מישור משופע / בורג / גלגלת / מנוף<br>💡 הפותחן נשען על המכסה ומרים אותו | Which simple machine is a bottle opener?<br>An inclined plane / A screw / A pulley / A lever<br>💡 The opener rests on the cap and lifts it | A lever |
| sci4#257 | Choosing a material by its properties | מה מהבאים נמשך למגנט?<br>עיפרון עץ / מסמר ברזל / כדור גומי / כוס זכוכית<br>💡 ברזל נמשך למגנט | Which of these is attracted to a magnet?<br>A wooden pencil / An iron nail / A rubber ball / A glass cup<br>💡 Iron is attracted to a magnet | An iron nail |
| sci4#278 | Review | איזו מכונה עוזרת להרים מלט לקומה גבוהה?<br>מספריים / בורג / גלגלת / פותחן<br>💡 חבל וגלגל מרימים משא כבד | Which machine helps lift cement to a high floor?<br>Scissors / A screw / A pulley / A bottle opener<br>💡 A rope and a wheel lift a heavy load | A pulley |
