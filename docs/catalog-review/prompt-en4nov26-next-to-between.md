הוסף לתרגול האנגלית של כיתה ד' שנבנה מדף העבודה (`tools/sets/en4_nov26.py`, בקטלוג `en4-nov26`) תרגול של **next to** ו-**between** (ריפו study-for-fun).

## מה יש היום
- בפרק 10 (Prepositions) יש שתי שאלות על next to: "The cat is ___ the dog." ו-"ליד = ?". בפרק 6 יש "N is for… (ליד)".
- **between לא מופיע בכלל בסט הזה.** הוא מופיע ב-en6 (כיתה ו'), ואסור להעתיק משם: "The bank is ___ the school and the bakery", "The cat is ___ the two dogs".
- **בדיקת מאגר ההתלבטויות מצאה ש-"ליד = ?" זהה ל-en4#321.** אם תשנה אותה, שנה ב-en4_nov26 לשאלת משפט עם next to, ולא לשאלת תרגום.

## מה להוסיף
1. **פרק חדש: "Prepositions: between"** (נושא PR), 10 שאלות:
   - **כחצי:** השלמת משפט עם ✔ between. המסיחים: on / in / under. **לא** next to (ראו "התנגשויות" למטה). כל משפט במבנה X and Y, והתמונה מציירת את הפריט באמצע. דוגמאות, לא להעתיק כמו שהן:
     - "Dan sits ___ Mom and Dad." 👩 👦 👨
     - "The apple is ___ the banana and the orange." 🍌 🍎 🍊
     - "The star is ___ the moon and the sun." 🌙 ⭐ ☀️
   - **כחצי:** "מה נמצא בין…?". התשובה היא חפץ, והמסיחים הם חפצים אחרים (חלקם מצוירים במקום אחר בתמונה). דוגמאות:
     - "What is between the two cars?" 🚗 🚲 🚗 ✔ a bike
     - "Who is between the cat and the dog?" 🐈 🐦 🐕 ✔ a bird
   - שאלת תרגום אחת: "בין = ?" ✔ between. המסיחים: behind / under / on.
2. **next to: 4 שאלות חדשות בפרק 10**, משפטים עם עצם אחד, כך ש-between לא דקדוקי שם:
   - "My house is ___ the school." 🏫 🏠
   - "The dog is ___ the door." 🚪 🐕
   - "The lamp is ___ the bed." 🛏️ 💡
   - ועוד אחת.

   המסיחים: between / under / in. השאלות נבדלות מ-en4 ומ-en6.
3. **עדכונים בסט:** להוסיף `between` ל-`WORD_LIST`, ול-`tags`/`desc`/`desc_en` ("…מילות יחס כולל next to ו-between").

## כללים
- **סדר הציורים הוא התשובה.** אלה תמונות מיקום, ולכן אסור שהערבוב יזיז אותן:
  - לא להשתמש ב-`OPTS(...)`.
  - לוודא שהשאלות האלה נחשבות "שאלות מיקום" ב-`build_set.py`. אם צריך, להוסיף `between|next to|ליד|בין` לרשימת מילות המיקום.
  - אחרי הבנייה, לבדוק ב-json שסדר ה-x נשמר.
- **התנגשויות במשחק ההתאמה:**
  - בפרק של between, אף שאלה לא תענה next to.
  - בפרק 10, אף שאלה לא תענה between.
  - "Dan sits next to Mom and Dad" דקדוקי, ולכן next to ו-between לא יופיעו כתשובות באותו פרק.
- **התמונה לא מסגירה:** בשאלות "What is between…?" מציירים גם את המסיחים או חפצים אחרים, לא רק את התשובה.
- **אין שאלה זהה** לשום שאלה בסטים en3–en8 (בדיקת הכפילויות ב-`build_set.py` צריכה לעבור נקי). עקרונות התוכן נמצאים ב-`docs/catalog-review/principles.md`. אם יש בריפו את הכישור `build-practice-set`, לפעול לפיו.
- **הבנייה:**
  - `SFF_DRY=1 python3 -I tools/build_set.py tools/sets/en4_nov26.py`, ואז build.
  - כשהאפליקציה מוגשת: `IDS=en4-nov26 node tools/tests/local_scenes.js`, וצריך 0 bad scenes.
  - להריץ את `tools/tests/local_*.js`.
- **בסוף:**
  - commit ו-push.
  - **לא להריץ `tools/deploy.sh` לפני שאני מאשרת.**
  - לצרף רשימה של השאלות החדשות: שאלה, תשובה, מסיחים ותמונה.
