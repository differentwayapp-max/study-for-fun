/* Study for fun – interface language (Hebrew / English).
   The app is written in Hebrew. In English mode this layer translates the interface text on screen
   (text, placeholder, aria-label, title, alt) as it appears. Learning content – questions, answers,
   explanations, reading passages, word lists – is never translated: those elements are listed in SKIP.
   Unknown strings stay as they are and are collected in window.__i18nMissing (for checking). */
(function () {
  const W = window, D = document, HE = /[֐-׿]/;
  let lang = null;
  try { lang = localStorage.getItem('sff_lang'); } catch (e) {}
  if (lang !== 'he' && lang !== 'en') lang = /^he\b/i.test(navigator.language || '') || !navigator.language ? 'he' : 'en';

  const GR = { "א'": 1, "ב'": 2, "ג'": 3, "ד'": 4, "ה'": 5, "ו'": 6, "ז'": 7, "ח'": 8, "ט'": 9, "י'": 10, 'י"א': 11, 'י"ב': 12 };
  const GRX = `(י"א|י"ב|[א-ט]'|י')`;

  // exact interface strings (the Hebrew "core": first to last Hebrew letter)
  const T = {
    'הורה': 'Parent', 'ילד/ה': 'Kid', 'מנהל': 'Admin', 'ילדים': 'Kids', 'פידבק': 'Feedback',
    'גביעים': 'Trophies', 'ימים ברצף': 'Day streak', 'שם': 'Name', 'כיתה': 'Grade', 'שמירה': 'Save',
    'מדיניות פרטיות': 'Privacy policy', 'מחיקת חשבון': 'Delete account', 'יציאה': 'Sign out', 'מצב הורה': 'Parent mode',
    'הקודם': 'Previous', 'הבא': 'Next', 'לינק לילד': 'Kid link', 'עריכה': 'Edit', 'נועה': 'Emma', 'צבע': 'Colour',
    'שם הילד/ה': "Kid's name", 'למשל: עמודים 12–14, תרגילים 3–8': 'e.g. pages 12–14, exercises 3–8',
    'אפשר להעתיק לכאן שאלות מדף עבודה או מאתר': 'Paste questions from a worksheet or a website',
    'למשל: גם תשובה 2 נכונה / יש שגיאת כתיב / ההסבר לא נכון': 'e.g. answer 2 is also right / a spelling mistake / the explanation is wrong',
    'סגירה': 'Close', 'למסך הבית – הבנייה ממשיכה': 'Home – building continues', 'מחיקת התרגול': 'Delete practice set',
    'השם שלי': 'My name', 'חזרה': 'Back', 'צליל': 'Sound', 'ביטול': 'Cancel', 'למי': 'Who', 'נושאים': 'Topics',
    'חומר': 'Material', 'סיכום': 'Summary', 'למי ובאיזה מקצוע': 'Who and which subject', 'ילד/ה חדש/ה': 'New kid',
    'מקצוע': 'Subject', 'אנגלית': 'English', 'מתמטיקה': 'Math', 'עברית / לשון': 'Hebrew', 'מדעים': 'Science',
    'היסטוריה': 'History', 'תנ"ך': 'Bible', 'אחר': 'Other', 'תאריך המבחן': 'Test date', 'קוד שיתוף': 'Share code',
    'מילוי דוגמה': 'Fill in an example', 'המשך': 'Continue', 'הוספה': 'Add', 'ייבוא': 'Import',
    'נושאים למבחן': 'Test topics', 'נושא בכל שורה': 'One topic per line', 'דפי דוגמה': 'Sample pages', 'דף דוגמה': 'Sample page',
    'לא חובה': 'Optional', 'צילום': 'Camera', 'תמונות': 'Photos', 'קישור': 'Link', 'טקסט': 'Text',
    'באילו עמודים יש שאלות מתאימות': 'Which pages have suitable questions', 'טקסט של שאלות לדוגמה': 'Sample questions (text)',
    'מוכן': 'Ready', 'מבחן': 'Test', 'לא הוזן': 'Not set', 'בלי דפי דוגמה': 'No sample pages', 'הגדרות': 'Settings',
    'שאלות במקצה': 'Questions per round', 'פרקים ביום': 'Chapters a day', 'אין תאריך מבחן': 'No test date', 'פרקים': 'Chapters',
    'חזרה כללית': 'General review', 'בנו את התרגול': 'Build the practice set', 'פחות': 'Less', 'יותר': 'More',
    'טקסט מודבק': 'pasted text', 'נקבע ידנית': 'Set manually', 'ילד/ה (דוגמה)': 'Kid (example)',
    'איפוס התקדמות': 'Reset progress', 'למחוק': 'Delete', 'לאפס את כל ההתקדמות': 'Reset all progress',
    'העתקה': 'Copy', 'הועתק': 'Copied', 'מילים מהדף': 'Words from the worksheet', 'לשחק': 'Play', 'שיתוף': 'Share',
    'תחרות': 'Competition', 'לינק לתרגול': 'Practice set link', 'העתקת לינק': 'Copy link',
    'הורה אחר: פותח → כניסה עם Google → בוחר ילד/ה → ייבוא': 'Another parent: opens it → Sign in with Google → picks a kid → Import',
    'השאלות': 'Questions', 'דוח QA': 'QA report', 'דיווח': 'Report', 'מחיקה': 'Delete', 'מחיקת החשבון': 'Delete account',
    'יימחקו לצמיתות: הילדים, התרגולים, ההתקדמות והפידבק – גם מהטלפונים של הילדים. אי אפשר לשחזר.':
      "Permanently deleted: kids, practice sets, progress and feedback – from the kids' phones too. This can't be undone.",
    'כדי לאשר, כתבו': 'To confirm, type', 'מחיקה לצמיתות': 'Delete permanently', 'נמחק': 'Deleted',
    'לא הצליח – נסו שוב': "Didn't work – try again",
    'מה לא נכון': "What's wrong", 'שליחה לבדיקה': 'Send for checking', 'כתבו בקצרה מה לא נכון.': "Briefly write what's wrong.",
    'בודק את הדיווח': 'Checking the report', 'בדקנו – השאלה תקינה.': 'Checked – the question is fine.', 'תודה! זו אכן שגיאה.': "Thanks! That's indeed a mistake.",
    'תרגולים שהושלמו': 'Rounds completed', 'שאלות שנענו': 'Questions answered', 'הצלחה כללית': 'Overall success', 'ימים עם תרגול': 'Days with practice',
    'מילים לחיזוק': 'Words to practise', 'טעות': 'Mistake', 'טעות אחת': 'One mistake', 'היום': 'Today', 'אתמול': 'Yesterday',
    'ענתה במקום': 'Answered instead', 'סט חיזוק': 'Review set', 'יושבות טוב': 'Known well', 'עוד לא תורגלו': 'Not practised yet',
    'לחיצה על מילה = פירוט': 'Tap a word for details', 'אין טעויות': 'No mistakes', 'אין טעויות עדיין': 'No mistakes yet',
    'הכול': 'All', 'אוצר מילים': 'Vocabulary', 'דקדוק': 'Grammar',
    'לקראת המבחנים': 'Upcoming tests', 'תאריך': 'Date', 'כדאי לחזק': 'Worth strengthening',
    'בנו סט חיזוק לנושאים האלה': 'Build a review set for these topics',
    'נושא נחשב "לחזק" מתחת ל-60% הצלחה, ו"כמעט שם" בין 60% ל-80%, כשיש לפחות 3 שאלות בנושא.':
      'A topic is "to strengthen" below 60% success and "almost there" between 60% and 80%, with at least 3 questions in the topic.',
    'נושאים שכבר יושבים טוב': 'Topics already solid',
    'עדיין אין נושא עם 80% הצלחה ומעלה (ולפחות 3 שאלות). זה יופיע כאן כשיגיע.': 'No topic at 80% success or more yet (with at least 3 questions). It will show up here.',
    '80% הצלחה ומעלה, על בסיס לפחות 3 שאלות. כדאי לחזור עליהם מדי פעם כדי לשמור על הידע.': '80% success or more, based on at least 3 questions. Review them now and then to keep them fresh.',
    'אין נושא שדורש חיזוק כרגע': 'No topic needs strengthening right now',
    'בחלק מהנושאים יש עדיין מעט שאלות – עוד כמה תרגולים יתנו תמונה ברורה יותר.': 'Some topics still have few questions – a few more rounds will give a clearer picture.',
    'כל הנושאים מעל 80%. אפשר לעבור לחומר חדש.': 'All topics above 80%. Time for new material.',
    'הצלחה לפי נושא': 'Success by topic', 'נושא': 'Topic', 'שאלות': 'Questions', 'הצלחה': 'Success', 'מגמה': 'Trend',
    'כמעט שם': 'Almost there', 'יציב': 'Steady', 'משתפר': 'Improving', 'ירידה': 'Dropping', 'לחזק': 'Strengthen',
    'שולט/ת': 'Mastered', 'מעט נתונים': 'Little data', 'תרגולים אחרונים': 'Recent rounds', 'מתי': 'When', 'תרגול': 'Practice',
    'תוצאה': 'Result', 'השמעה': 'Play', 'כל הילדים': 'All kids', 'כל המקצועות': 'All subjects', 'ימים אחרונים': 'last days',
    'מאז ומעולם': 'All time', 'חזרה על טעויות': 'mistakes review',
    'דיווחים': 'Reports', 'אומתו כשגיאה': 'Confirmed as mistakes', 'נדחו (השאלה תקינה)': 'Rejected (question is fine)',
    'אין דיווחים עדיין.': 'No reports yet.', 'שאלה': 'Question', 'הדיווח': 'Report', 'שגיאה אומתה': 'Mistake confirmed', 'תקין': 'Fine',
    'בחירה מתשובות': 'Multiple choice', 'משחק הזיכרון': 'Memory', 'התאמה בקו': 'Match the lines', 'חידות': 'Riddles',
    'איות': 'Spelling', 'קטע קריאה': 'Reading passage', 'מיקס': 'Mix', 'א': 'A', 'ב': 'B', 'ג': 'C', 'ד': 'D',
    'הקראה': 'Read aloud', 'למה': 'Why', 'הסבר': 'Explanation', 'דיווח על טעות': 'Report a mistake', 'השאלה הקודמת': 'Previous question',
    'וואו': 'Wow', 'כל הכבוד': 'Well done', 'מעולה': 'Great', 'בדיוק': 'Exactly', 'יופי': 'Nice', 'אלופים': 'Champion',
    'לסיכום': 'Summary', 'כל הקווים נכונים מהניסיון הראשון': 'All lines right on the first try', 'הסברים': 'Explanations',
    'לסיבוב הבא': 'Next round', 'רמז': 'Hint', 'ניקוי': 'Clear', 'השמעת המילה': 'Play the word', 'הקראת הקטע': 'Read the passage aloud',
    'התחלה טובה – ממשיכים': 'Good start – keep going', 'עבודה טובה': 'Good job', 'מושלם': 'Perfect', 'הטעויות': 'Mistakes', 'עוד': 'More',
    'חזרה לשאלה': 'Back to question', 'סיום': 'Finish',
    'תרגול מוכן': 'Ready practice set', 'לשלוח לילד': 'Send to kid', 'פתיחה': 'Open', 'דוגמה': 'Example', 'שותף איתך': 'Shared with you',
    'מתמיד/ה השבוע': 'Most consistent this week', 'קיבלת את הגביע של היום': "You won today's trophy",
    'הגביע של היום כבר שלך – וממשיכים': "Today's trophy is already yours – keep going", 'הגביע של היום הושג': "Today's trophy won",
    'התרגול יהיה מוכן בעוד כ-15 דקות': 'The practice set will be ready in about 15 minutes', 'לנסות שוב': 'Try again',
    'כניסה עם': 'Sign in with', 'מההורה': 'from a parent', 'בכניסה את/ה מאשר/ת את': 'By signing in you accept the', 'מדיניות הפרטיות': 'privacy policy',
    'סמנו והעתיקו ידנית': 'Select and copy manually', 'סמנו את הקוד והעתיקו ידנית': 'Select the code and copy it manually',
    'בחרו קודם ילד/ה': 'Pick a kid first', 'בחרו ילד/ה': 'Pick a kid', 'הוסיפו ילד/ה': 'Add a kid',
    'הקוד לא תקין – בדקו שהועתק במלואו': "The code isn't valid – check it was copied in full", 'הלינק לתרגול לא תקין': "The practice link isn't valid",
    'ההתקדמות נשמרה': 'progress kept', 'כיסוי': 'Coverage', 'מוכן ✨': 'Ready ✨',
    'לא הוזן תאריך מבחן – ברירת מחדל של 2 מקצים ביום': 'No test date – default of 2 rounds a day',
    'לוח האלופים': 'Leaderboard', 'תחרות ידידותית': 'Friendly competition', 'נקודות': 'Points', 'עוד אין תרגולים בקבוצה.': 'No practice in the group yet.',
    'כל תרגול = 10 נקודות, כל גביע יומי = עוד 5. מתאמנים, צוברים, מצליחים ביחד!': 'Each round = 10 points, each daily trophy = 5 more. Practise, collect, succeed together!',
    'ממשיכים להתאמן – התרגול הבא יזכה בנקודות ללוח האלופים': 'Keep practising – the next round earns leaderboard points',
    'להפוך לשאלות תמונה': 'Turn into picture questions', 'לכל התרגולים': 'for all practice sets', 'הוסר': 'Remove',
    'מנוע הבינה המלאכותית לא זמין בתצוגה הזו.': "The AI engine isn't available here.", 'האימות האוטומטי לא זמין בתצוגה הזו.': "Automatic checking isn't available here.",
    'יותר מדי בקשות. נסו שוב בעוד דקה.': 'Too many requests. Try again in a minute.', 'הבדיקה נכשלה. נסו שוב.': 'The check failed. Try again.',
    'בחרו מקצוע.': 'Pick a subject.', 'כתבו לפחות נושא אחד למבחן.': 'Write at least one test topic.', 'בחרו ילד/ה בשלב הראשון.': 'Pick a kid in the first step.',
    'בחרו לאיזה ילד התרגול (או הוסיפו ילד חדש).': 'Pick which kid the practice set is for (or add a new kid).',
    'גוששים': 'Explorers', 'חוקרים': 'Researchers', 'משימות': 'Missions', 'מאסטר': 'Master',
    'מבחן: ': 'Test: ', 'חזרה ביום שלפני': 'review the day before', 'בונה ובודק': 'Building and checking',
    'בניית תרגול חדש עם AI תיפתח בקרוב': 'Building a new practice set with AI is coming soon',
    'בינתיים אפשר להוסיף תרגול מוכן עם 🔗 קוד שיתוף (בשלב הראשון)': 'Meanwhile you can add a ready practice set with a 🔗 share code (in step 1)',
    'בקרוב': 'Coming soon',
    'הדרך למבחן': 'Road to the test', 'אין חיבור לתרגולים שלך': "Can't reach your practice sets",
    'באייפון מופעל "מצב נעילה" (Lockdown). ב-Safari: aA ← הגדרות אתר ← לכבות מצב נעילה לאתר הזה.': 'Lockdown Mode is on on this iPhone. In Safari: aA → Website Settings → turn off Lockdown Mode for this site.',
    'בדקו שיש אינטרנט ונסו שוב.': 'Check the internet connection and try again.', 'למפה': 'To the map', 'עוד אין משחקים בטווח הזה': 'No games in this period yet', 'כשהילד/ה ישחקו – יופיעו כאן מה הם יודעים ומה כדאי לתרגל שוב.': 'Once your kid plays, you will see here what they know and what to practise again.', 'תרגולים מוכנים': 'Ready practice sets', 'כל הכיתות': 'All grades', 'כיתות אחרות': 'Other grades', 'קטע קריאה': 'Reading passage',
    'בנייה מהחומר שלכם': 'Build from your own material', 'חסר תרגול': 'Missing a practice set', 'בנייה עם AI מהחומר שלכם – בקרוב': 'Building with AI from your material – coming soon',
    'תאריך המבחן': 'Test date', '(לא חובה)': '(optional)', 'מה אני יודע': 'What I know', 'עברתי': 'Passed', 'לנסות שוב': 'Try again', 'פרקים לנסות שוב': 'Chapters to try again', 'לתרגל שוב': 'Practise again',
    'לתרגל אותן עכשיו': 'Practise them now', 'אני יודע': 'I know', 'אין מה לתרגל שוב – כל הכבוד': 'Nothing to practise again – well done', 'עוד לא שיחקת – מתחילים': "You haven't played yet – let's start",
    'המבחן היום': 'Test today', 'היעד של היום: פרק': "Today's goal: chapter", 'היעד של היום': "Today's goal", 'היעד של היום הושג': "Today's goal reached", 'ממשיכים קדימה': 'Keep going', 'סיימת הכול': 'All done', 'מקדים': 'Ahead', 'המבחן': 'Test', 'בזמן': 'On time', 'מילים': 'Words', 'קריאה': 'Reading', 'חזרה למבחן': 'Review', 'קדימה': "Let's go",
    'חזרה על הטעויות': 'Mistakes review', 'יום המבחן': 'Test day', 'מחר': 'Tomorrow',
    'יום ראשון': 'Sunday', 'יום שני': 'Monday', 'יום שלישי': 'Tuesday', 'יום רביעי': 'Wednesday', 'יום חמישי': 'Thursday', 'יום שישי': 'Friday', 'יום שבת': 'Saturday',
    'צריך את הלינק מההורה': 'You need the link from your parent', 'בקשו מההורה לשלוח שוב את הלינק, ופתחו אותו בטלפון הזה': 'Ask your parent to send the link again, and open it on this phone',
    'ביום': 'a day', 'אב עברית / לשון': 'אב Hebrew', 'אב Hebrew': 'אב Hebrew', '🛡️ דוח QA': '🛡️ QA report', '🛡️🖼️ QA לכל התרגולים': '🛡️🖼️ QA for all practice sets',
    'העלאת תמונות לא זמינה כאן – הדביקו את הטקסט של הדפים.': "Photo upload isn't available here – paste the text of the pages.",
    'בגרסה המלאה האפליקציה תקרא רק את העמודים שציינתם. באב-הטיפוס היא לא יכולה לפתוח קישורים – צלמו את העמודים או הדביקו את השאלות.':
      "The app reads only the pages you list. It can't open links here – take photos of the pages or paste the questions.",
    'נקודות: 10 לכל תרגול שהושלם (עד 5 ביום, כדי לעודד תרגול בריא ולא מרתון), ו-5 לכל גביע יומי. תרגול בלי אף תשובה נכונה או עם פחות מ-30% הצלחה לא מזכה בנקודות – ולא מוצג.':
      'Points: 10 per completed round (up to 5 a day, to encourage healthy practice rather than a marathon), and 5 per daily trophy. A round with no right answers or under 30% success earns no points – and is not shown.',
    'הצגת ילדים לדוגמה (לראות איך הטבלה נראית עם קבוצה)': 'Show example kids (to see the table with a group)',
    'כשהורים נוספים שקיבלו את התרגול יפעילו תחרות, הילדים שלהם יופיעו כאן (בגרסה המלאה, דרך השרת).': 'When other parents who got this practice set turn on competition, their kids will show up here.'
  };
  Object.keys(GR).forEach(g => { T[g] = 'Grade ' + GR[g]; });

  const tr = s => (s && HE.test(s)) ? translate(s) : s;
  // patterns for text with numbers or names in it
  const P = [
    [new RegExp(`^כיתה ${GRX}(.*)$`), (m, g, rest) => `Grade ${GR[g]}${tr(rest)}`],
    [/^(שאלה|חידה|מילה|סיבוב) (\d+) מתוך (\d+)$/, (m, w, a, b) => `${{ 'שאלה': 'Question', 'חידה': 'Riddle', 'מילה': 'Word', 'סיבוב': 'Round' }[w]} ${a} of ${b}`],
    [/^פרק (\d+)$/, (m, n) => `Chapter ${n}`],
    [/^עוד אין תרגול ל(.+) – ההורה מוסיף\/ה מהקטלוג$/, (m, n) => `No practice set for ${n} yet – the parent adds one from the catalog`],
    [/^הטלפון עוד לא מחובר לילד\/ה$/, () => 'This phone is not connected to a kid yet'],
    [/^(📚 )?פרקי התרגול – לפי הסדר במסלול של (.+)$/, (m, e, n) => `${e || ''}The chapters – in order on ${n}'s road`],
    [/^(⭐ )?(\d+) עברו$/, (m, e, n) => `${e || ''}${n} passed`],
    [/^⭐ = עבר\/ה את הפרק \(70% ומעלה\) · ❓ = מספר השאלות בפרק$/, () => '⭐ = chapter passed (70%+) · ❓ = questions in the chapter'],
    [/^✨ (תרגול עודכן|(\d+) תרגולים עודכנו) – ההתקדמות נשמרה$/, (m, a, n) => `✨ ${n ? n + ' practice sets' : 'Practice set'} updated – progress kept`],
    [/^🎲 דוגמה – עוד אין תרגול ל(.+)$/, (m, n) => `🎲 Example – no practice set for ${n} yet`],
    [/^🎲 דוגמה – עוד אין תרגול$/, () => '🎲 Example – no practice set yet'],
    [/^מתאים ל(.+)$/, (m, n) => `Right for ${n}`],
    [/^✓ כבר אצל (.+)$/, (m, n) => `✓ Already with ${n}`],
    [/^＋ הוספה ל(.+)$/, (m, n) => `＋ Add for ${n}`],
    [/^עוד אין תרגול מוכן לכיתה (.+)$/, (m, g) => `No ready practice set for grade ${GR[g] || g} yet`],
    [/^(\d+) (מילים)$/, (m, n) => `${n} words`],
    [/^פרק (\d+) · (\d+)%$/, (m, n, p) => `Chapter ${n} · ${p}%`],
    [/^היעד של היום: פרק (\d+)( ✓)?$/, (m, n, c) => `Today's goal: chapter ${n}${c || ''}`],
    [/^(עברתי|לנסות שוב|עוד) (\d+)$/, (m, w, n) => `${{ 'עברתי': 'Passed', 'לנסות שוב': 'Try again', 'עוד': 'Left' }[w]} ${n}`],
    [/^קלף (\d+)$/, (m, n) => `Card ${n}`],
    [/^＋ תרגול ל(.+)$/, (m, n) => `＋ Practice set for ${n}`],
    [/^(\d+) פרקים(.*)$/, (m, n, r) => `${n} chapters${tr(r)}`],
    [/^(\d+) שאלות(.*)$/, (m, n, r) => `${n} questions${tr(r)}`],
    [/^(\d+) (מילים|מילה)$/, (m, n, w) => `${n} ${w === 'מילה' ? 'word' : 'words'}`],
    [/^(\d+) תמונות$/, (m, n) => `${n} photos`],
    [/^(\d+) תרגולים$/, (m, n) => `${n} rounds`],
    [/^(\d+)\/(\d+) פרקים$/, (m, a, b) => `${a}/${b} chapters`],
    [/^(\d+) פרקים ביום כדי להספיק$/, (m, n) => `${n} chapters a day to make it`],
    [/^(\d+)\/(\d+) משחקים$/, (m, a, b) => `${a}/${b} games`],
    [/^(\d+)\/(\d+) היום$/, (m, a, b) => `${a}/${b} today`],
    [/^(\d+) משחקים היום$/, (m, n) => `${n} games today`],
    [/^(🏆 )?(\d+)\/(\d+) משחקים היום לגביע$/, (m, t, a, b) => `${t || ''}${a}/${b} games today for the trophy`],
    [/^עוד (\d+) ימים למבחן$/, (m, n) => `${n} days to the test`],
    [/^המבחן מחר!$/, () => 'Test tomorrow!'], [/^המבחן היום – בהצלחה!$/, () => 'Test today – good luck!'], [/^המבחן עבר$/, () => 'Test is over'],
    [/^(\d+) ימים אחרונים$/, (m, n) => `Last ${n} days`],
    [/^(\d+) ביום$/, (m, n) => `${n} a day`],
    [/^~?15 דק׳$/, () => '~15 min'],
    [/^כמעט! התשובה: (.+)$/, (m, a) => `Almost! The answer: ${a}`],
    [/^התשובה היא: (.+)$/, (m, a) => `The answer is: ${a}`],
    [/^(.+?)!? (\d+) ברצף!$/, (m, a, n) => `${tr(a)}! ${n} in a row!`],
    [/^פתרת! \(עם (\d+) (רמז|רמזים)\)$/, (m, n, w) => `Solved! (with ${n} hint${n === '1' ? '' : 's'})`],
    [/^זוגות: (.+)$/, (m, v) => `Pairs: ${v}`], [/^מהלכים: (.+)$/, (m, v) => `Moves: ${v}`],
    [/^מצאת את כל (\d+) הזוגות ב-(\d+) מהלכים!$/, (m, a, b) => `You found all ${a} pairs in ${b} moves!`],
    [/^חיברת הכול! (\d+) מתוך (\d+) מהניסיון הראשון$/, (m, a, b) => `All connected! ${a} of ${b} on the first try`],
    [/^(נוסף|עודכן): (.+)$/, (m, w, r) => `${w === 'נוסף' ? 'Added' : 'Updated'}: ${tr(r)}`],
    [/^(.*)— 🔗 לשלוח לילד$/, (m, a) => `${a}— 🔗 Send to kid`],
    [/^מבחן: (.+)$/, (m, r) => `Test: ${tr(r)}`],
    [/^(\d+) מקצים מכסים את כל החומר פעם אחת ב-(\d+) ימים, ובערב שלפני המבחן – מקצה חזרה נוסף$/, (m, a, b) => `${a} rounds cover all the material once in ${b} days, plus a review round the evening before the test`],
    [/^המבחן (היום|מחר) – כל החומר \((\d+) מקצים\) ועוד מקצה חזרה$/, (m, d, n) => `Test ${d === 'היום' ? 'today' : 'tomorrow'} – all the material (${n} rounds) plus a review round`],
    [/^(\d+) פרקים עד (.+) \+ חזרה ביום שלפני$/, (m, n, d) => `${n} chapters by ${d} + review the day before`],
    [/^\+(\d+)( ועוד (\d+) על הגביע)? נקודות ללוח האלופים של הקבוצה(.*)$/, (m, a, x, b, r) => `+${a}${b ? ` and ${b} for the trophy` : ''} points on the group leaderboard${r}`],
    [/^משהו השתבש בבנייה: (.*)$/, (m, r) => `Something went wrong while building: ${r}`],
    [/^לא ניתן אישור לשימוש ב-(.*)$/, (m, r) => `No permission to use ${r}`]
  ];

  const cache = new Map(); const missing = W.__i18nMissing = new Set();
  function translate(s) {
    if (cache.has(s)) return cache.get(s);
    const lead = s.match(/^\s*/)[0], trail = s.match(/\s*$/)[0], t = s.trim();
    let out = null;
    if (T[t] != null) out = T[t];
    if (out == null) for (const [re, fn] of P) { const m = t.match(re); if (m) { out = fn(...m); break; } }
    if (out == null && t.includes(' · ')) { const parts = t.split(' · ').map(x => HE.test(x) ? translate(x) : x); if (!parts.some(x => HE.test(x))) out = parts.join(' · '); }
    if (out == null) {                                  // non-Hebrew edges (emoji, numbers, punctuation) stay as they are
      const a = t.search(HE), b = t.length - [...t].reverse().join('').search(HE);
      const core = t.slice(a, b), pre = t.slice(0, a), post = t.slice(b);
      if (core !== t) { const c = T[core] != null ? T[core] : null;
        if (c != null) out = pre + c + post;
        else { for (const [re, fn] of P) { const m = core.match(re); if (m) { out = pre + fn(...m) + post; break; } } } }
    }
    if (out == null) { missing.add(t); out = t; }
    else out = out.replace(/[‹›]/g, c => c === '‹' ? '›' : '‹');   // "next / back" arrows point the other way in English
    const r = lead + out + trail; cache.set(s, r); return r;
  }

  // learning content – never translated
  const SKIP = '.qbox,.opts .opt,.passage .ptext,.expl,.mcard .f,.mitem,.slots,.tiles,.wchips,.wchip,.wdetail .hint,.q-list .q>:not(.meta),#rQA,#repQ,.ttile b,[translate="no"]';
  const ALLOW = '.key,.expl>b:first-child';
  const ATTRS = ['placeholder', 'aria-label', 'title', 'alt'];
  const skipEl = el => !!el && !el.matches(ALLOW) && !!el.closest(SKIP) && !(el.closest('.expl') && el.matches('.expl>b:first-child'));
  let busy = false;
  function fixText(n) { const el = n.parentElement; if (!el || el.closest('script,style') || skipEl(el)) return; const v = n.nodeValue; if (!HE.test(v)) return; const o = translate(v); if (o !== v) n.nodeValue = o; }
  function fixAttrs(el) { if (el.classList && el.classList.contains('langbtn')) { if (el.textContent !== 'עב') el.textContent = 'עב'; return; } if (skipEl(el)) return; for (const a of ATTRS) { const v = el.getAttribute && el.getAttribute(a); if (v && HE.test(v)) { const o = translate(v); if (o !== v) el.setAttribute(a, o); } } }
  function walk(root) {
    if (root.nodeType === 3) return fixText(root);
    if (root.nodeType !== 1) return;
    fixAttrs(root);
    const w = D.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let n; while ((n = w.nextNode())) { if (n.nodeType === 3) fixText(n); else fixAttrs(n); }
  }
  function run(muts) {
    if (busy) return; busy = true;
    try { for (const m of muts) { if (m.type === 'characterData') fixText(m.target); else if (m.type === 'attributes') fixAttrs(m.target); else m.addedNodes.forEach(walk); } }
    finally { busy = false; }
  }
  const mo = new MutationObserver(run);

  function apply() {
    const h = D.documentElement; h.lang = lang; h.dir = lang === 'he' ? 'rtl' : 'ltr';
    if (lang === 'en' && !D.getElementById('i18n-ltr')) { const st = D.createElement('style'); st.id = 'i18n-ltr';
      st.textContent = '.carhead{flex-direction:row-reverse}'; D.head.appendChild(st); }
    D.querySelectorAll('.langbtn').forEach(b => b.textContent = lang === 'he' ? 'EN' : 'עב');
    if (lang === 'en') { mo.observe(D.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS }); if (D.body) walk(D.body); D.title = 'Study for fun'; }
  }
  W.SFF_LANG = () => lang;
  W.sffT = s => lang === 'en' ? tr(s) : s;
  W.setLang = l => { if (l === lang) return; try { localStorage.setItem('sff_lang', l); } catch (e) {} location.reload(); };
  W.toggleLang = () => W.setLang(lang === 'he' ? 'en' : 'he');
  D.documentElement.lang = lang; D.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', apply); else apply();
})();
