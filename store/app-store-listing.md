# App Store – מה להעתיק לטפסים

החלטות (28.11): חשבון Apple Developer **אישי** עכשיו (העסק נרשם בינואר → העברת האפליקציה לחשבון העסקי, App Transfer).
אפליקציית האייפון: `apple/` (Capacitor), נבנית בענן (GitHub Actions → `.github/workflows/ios.yml`). אייפון בלבד, לאורך.

## לפני ההגשה – חובה
1. ✅ `GoogleService-Info.plist` ב-`apple/` (28.11).
2. ✅ Apple מופעל ב-Firebase (28.11) – הכפתור מופיע באפליקציית האייפון (אפל מחייבת אותו, סעיף 4.8). לדפדפן: Services ID + מפתח מ-Apple Developer → `APPLE_SIGNIN=true`. **צריך פריסה של המערכת לפני TestFlight.**
3. קובץ Universal Links: `public/.well-known/apple-app-site-association` עם ה-Team ID (נוצר כשהחשבון מאושר) – כך קישור ילד נפתח באפליקציה.
4. מדיניות הפרטיות: להוסיף "כניסה עם Apple" (שם ומייל, או מייל מוסתר של אפל) לצד Google.
5. סודות ב-GitHub (Settings → Secrets → Actions): `APPLE_TEAM_ID`, `ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_KEY_P8` → Actions → iOS → Run workflow → upload ✓ → TestFlight.

## פרטי האפליקציה (App Store Connect → Apps → ➕ New App)
| שדה | מה לרשום |
|---|---|
| Platform | iOS |
| Name (עד 30) | Study for fun (אם תפוס: `Study for fun – תרגול למבחן`) |
| Primary language | Hebrew |
| Bundle ID | app.dway.studyforfun |
| SKU | studyforfun-ios |
| User access | Full access |
| Subtitle (עד 30) | תרגול למבחנים דרך משחק |
| Category | Education (ראשית). משנית: אין |
| Privacy Policy URL | https://study-for-fun-7b03c.web.app/privacy.html |
| Support URL | https://d-way-app.web.app/contact |
| Marketing URL | https://d-way-app.web.app/ |
| Copyright | 2026 D-WAY |
| Price | Free |

**Made for Kids (קטגוריית ילדים): לא.** האפליקציה מתאימה לילדים, אבל קטגוריית Kids של אפל אוסרת קישורים החוצה ושיתוף (וואטסאפ, הזמנת מבוגרים) בלי "שער הורים", וההורה מנהל בה הכול. מסמנים Education ודירוג 4+.

## Promotional text (עד 170, אפשר לשנות בלי גרסה חדשה)
התרגול הסתיים? האפליקציה בונה לבד תרגול רק מהטעויות של הילד – בחינם, בלחיצה. בלי פרסומות, אף פעם.

## Description
אותו תיאור מלא כמו בגוגל פליי (`store/play-listing.md` → "תיאור מלא"), מ"Study for fun – למידה חוויתית..." עד "by D-WAY".

## Keywords (עד 100 תווים, פסיקים בלי רווחים)
מבחן,תרגול,אנגלית,מתמטיקה,שיעורי בית,בית ספר,ילדים,חינוך,לימוד,הורים,מורה,משחק,מילים,כיתה

## English (localization – optional)
- Subtitle: Test practice through games
- Promotional text: Practice done? The app builds a set from the kid's mistakes only – free, in one tap. No ads, ever.
- Keywords: test,practice,english,math,homework,school,kids,education,learning,parents,teacher,game,vocabulary
- Description: the English text in `store/play-listing.md`.

## צילומי מסך
- **iPhone 6.9"** (1320 × 2868), 5 לפי הסדר: `store/apple/iphone69_1_main.png` … `iphone69_5_family.png`. באנגלית: `store/apple/en/`.
  נוצרים מצילומי גוגל פליי (`store/play/`): אחרי `node tools/store_shots.js` מריצים `python3 -I tools/apple_shots.py`.
- iPad: לא צריך (האפליקציה לאייפון בלבד).
- App icon: נכלל בתוך האפליקציה (1024, `apple/ios/App/App/Assets.xcassets/AppIcon.appiconset/`).

## Age rating (שאלון)
כל השאלות (אלימות, מין, שפה, סמים, הימורים, אימה, תוכן רפואי): **None / No**.
- Unrestricted web access: **No** (האפליקציה פותחת רק את המערכת שלנו).
- User-generated content: **No** (אין תוכן שמשתמשים מפרסמים לאחרים).
- Messaging / chat: **No**. Advertising: **No**. Gambling / contests: **No**.
- תוצאה צפויה: **4+**.

## App Privacy ("תווית התזונה")
**Data used to track you: אין.** (בלי פרסום ובלי מעקב בין אפליקציות.)
**Data linked to you:**
| סוג | מטרה |
|---|---|
| Contact Info → Name | App Functionality |
| Contact Info → Email Address | App Functionality |
| User Content → Other User Content (דיווח תקלה, הערות מורה, חתימת הסכמה) | App Functionality |
| Usage Data → Product Interaction (תוצאות משחקים) | App Functionality |
| Identifiers → User ID (מזהה החשבון) | App Functionality |

צילומי החומר והקבצים **לא** מסומנים: אצל אפל "נאסף" = נשמר מעבר לטיפול בבקשה. הם נקראים בשרת ונמחקים מיד.

## App Review Information
- Sign-in required: **Yes** – אותו חשבון Gmail לבודקים מגוגל פליי ("פרטי הכניסה"), עם ילד ותרגול מוכן.
- Notes:
```
Parents sign in with Google or Apple (the phone's own sign-in sheet). Use the Google account above: the family already has a kid ("Dani") with a practice set – open the kid → the map → any station to play.
Kids never sign in: the parent sends a personal link (kid → "Kid link"); opened on a kid's phone, the kid only plays.
Native features: Sign in with Apple / Google, and a daily practice reminder (local notification) offered on a kid's phone.
No purchases, no ads, no tracking. Account deletion: menu ☰ → Account → Delete account.
```
- Contact: השם, טלפון ו-differentway.app@gmail.com.

## Export compliance
כבר בקובץ (`ITSAppUsesNonExemptEncryption = NO`) – אפל לא תשאל.

⚠️ כשייפתח תשלום על תרגולים: באייפון חייבים לגבות דרך In-App Purchase של אפל (15%–30%), ולעדכן כאן ובתווית הפרטיות.
