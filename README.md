# Study for fun · by D-WAY

אפליקציה לתרגול למבחנים דרך משחקים. ההורה בונה תרגול מהחומר של המבחן, והילד משחק.

## מבנה

```
study-for-fun/
├── public/                    האפליקציה (Firebase Hosting)
│   ├── index.html             כל האפליקציה + גשר ל-Firebase
│   ├── firebase-config.js     הגדרות הפרויקט ← למלא
│   ├── sw.js                  Service Worker – עובד גם בלי רשת
│   ├── manifest.webmanifest   התקנה כאפליקציה בטלפון
│   └── icons/                 אייקונים (192, 512, maskable, apple)
├── functions/                 שרת קטן שמדבר עם Claude (מפתח ה-API נשאר כאן)
│   ├── index.js
│   └── package.json
├── firestore.rules            מי רואה ומה (הורה / מכשיר של ילד)
├── firestore.indexes.json
├── firebase.json
├── .firebaserc                שם הפרויקט ← לעדכן
└── local-version/
    └── study_for_fun.html     אב הטיפוס המקורי (claude.ai), קובץ אחד
```

## איך זה עובד

| מי | כניסה | מה יכול |
|---|---|---|
| 👩 הורה | Google | בונה ילדים ותרגולים, רואה פידבק |
| 🧒 מכשיר של ילד | לינק מההורה (בלי סיסמה) | משחק, שומר התקדמות |

- **לינק לילד:** כרטיס הילד ← 🔗 ← `https://<האתר>/?f=<משפחה>&t=<קוד>#kid-<ילד>`
- **פעם אחת:** המכשיר מצטרף למשפחה (כניסה אנונימית + הקוד), ומאז נפתח ישר על הילד.
- **נתונים:** `families/{uid של ההורה}/…` ב-Firestore. ההתקדמות נשמרת גם על המכשיר (עובד בלי רשת).
- **AI:** הדפדפן קורא ל-`ask` (Cloud Function) ← Claude. רק הורה מחובר יכול לבנות.

## הקמה – פעם אחת

1. **פרויקט:** [console.firebase.google.com](https://console.firebase.google.com) ← פרויקט חדש.
2. **Authentication** ← Sign-in method ← להפעיל **Google** ו-**Anonymous**.
3. **Firestore Database** ← Create database (מומלץ אזור `eur3` / `europe-west`).
4. **Web app:** Project settings ← Your apps ← `</>` ← להעתיק את הערכים ל-`public/firebase-config.js`.
5. **`.firebaserc`:** להחליף את `study-for-fun` במזהה הפרויקט.
6. **תוכנית Blaze** (תשלום לפי שימוש) – נדרשת ל-Cloud Functions.
7. **מפתח Claude:** ב-[console.anthropic.com](https://console.anthropic.com) ← API key, ואז:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase functions:secrets:set ANTHROPIC_API_KEY
   ```
8. **העלאה:**
   ```bash
   cd functions && npm install && cd ..
   firebase deploy
   ```
   הכתובת: `https://<project-id>.web.app`

## עדכון

```bash
firebase deploy --only hosting      # שינוי באפליקציה
firebase deploy --only firestore    # שינוי בהרשאות
firebase deploy --only functions    # שינוי בשרת
```
אחרי שינוי באפליקציה – להעלות את `VERSION` ב-`public/sw.js` (למשל `sff-v2`), כדי שהטלפונים יקבלו את הגרסה החדשה.

## בדיקה מקומית

```bash
firebase emulators:start
```
או `local-version/study_for_fun.html` – נפתח ישר בדפדפן. נשמר רק בדפדפן הזה, וה-AI עובד רק בתוך claude.ai.

## עלויות (בערך)

- **Hosting + Firestore:** בחינם לשימוש משפחתי (מכסת Spark/Blaze החינמית).
- **Claude:** לפי שימוש. תרגול אחד = כ-10–20 קריאות (סריקה, פרק אחרי פרק, תמונות, QA).
- **מודלים:** `functions/index.js` ← `MODELS` (quick / default / complex).

## עוד לא בגרסה הזו

- 🏅 תחרות בין משפחות שונות (כרגע רק בתוך המשפחה).
- 🚩 דיווח שגיאה מהמכשיר של הילד (צריך הרשאת AI לילד).
- 🗑️ ניהול מכשירים מחוברים (לנתק טלפון).
