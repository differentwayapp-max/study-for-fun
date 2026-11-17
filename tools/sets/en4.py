# Practice set: English, grade 4 (כיתה ד') – the whole year, foundation level (Israeli curriculum, Band I / pre-A1):
# sounds and rhymes, short vowels, magic e (cake, kite, bike), sh · ch · th, ABC (light) and sight words,
# greetings and basic talk, the core vocabulary (family, feelings, colors, numbers 1–20, body, clothes, animals,
# food, school things, classroom instructions, days of the week), short sentences (I am / have / like / can,
# Do you like…? Yes, I do, he / she has, his / her, there is / are, this / these, plurals -s),
# in / on / under / next to, question words (What / Where / Who / How old) and three very short reading passages.
# Organised by fine topics (≈20 questions each) so a parent can tick only what the test covers.
# Run: python3 -I tools/build_set.py tools/sets/en4.py
import re

SR, VW, DG, AB = "Rhymes & sounds", "Short vowels", "sh · ch · th", "ABC & sight words"
FF, CN, BC, AN, FD = "Family & feelings", "Colors & numbers", "Body & clothes", "Animals", "Food"
SC, DY, IA, TH, RD = "School & instructions", "Days of the week", "I am · have · like · can", "There is · this · plurals", "Reading"
ME, GR, DL, HS = "Magic e", "Greetings & talk", "Do you like…?", "has · his · her"
PR, QW = "Where? in · on · under · next to", "Question words"

SET = dict(name="English ד' – full year", grade=3, subject="אנגלית",
           title="Sounds · Words · Sentences · Questions · Reading",
           desc="אנגלית לכיתה ד' – כל השנה: חרוזים וצלילים, תנועות קצרות ו-magic e, sh ch th, ברכות ושיחה, מילים בסיסיות, משפטים קצרים (has, his/her, Do you like), מילות יחס, מילות שאלה וקטעי קריאה קצרים",
           desc_en="Grade 4 English, the whole year: rhymes and sounds, short vowels and magic e, sh ch th, greetings and basic talk, core words, short sentences (has, his/her, Do you like), in/on/under/next to, question words and short reading passages",
           tags=["Rhymes", "Short vowels", "Magic e", "sh ch th", "Sight words", "Greetings", "Family", "Colors & numbers",
                 "Body & clothes", "Animals & food", "Days", "I am / I can", "Do you like?", "has / his / her",
                 "There is / are", "in / on / under", "Question words", "Reading"],
           examDate="", dailyGoal=2, perRound=10,
           topics=[SR, VW, ME, DG, AB, GR, FF, CN, BC, AN, FD, SC, DY, IA, DL, HS, TH, PR, QW, RD])
MAX_Q_WORDS = 9
ANSWER_IN_Q_OK = True    # sound/letter answers ("s", "a") are letters of the question's words; every item checked by hand


def W(s): return re.sub(r"\{([^}]*)\}", lambda m: "⁦" + m.group(1) + "⁩", s)
def Q(t, q, opts, ans, expl, sc): return (t, W(q), opts, ans, W(expl), sc)

def ROW(*es):
    """The things to choose from (or the things the question talks about), side by side."""
    n = len(es); s = min(40, 125 / n); step = min(92 / n, s / 1.6 * 1.35)
    return [(e, round(50 + (j - (n - 1) / 2) * step, 1), 52, round(s)) for j, e in enumerate(es)]

def PW(e, w):
    """The object on the left, its English word on a card on the right."""
    return [(e, 24, 52, 38), (w, 70, 52, round(min(26, 140 / len(w))))]

def BIG(ch): return [(ch, 50, 52, 64)]        # one big letter / sound card


C = []

# ───────────── Rhymes & sounds ─────────────
C.append(("Rhymes & sounds", [SR], [
 Q(SR, "Which word rhymes with sun?", ["run", "sit", "bus", "ten"], 0, "sun – run: שתיהן נגמרות ב-un", PW("☀️", "sun")),
 Q(SR, "Which word rhymes with pen?", ["hen", "pin", "cup", "pan"], 0, "pen – hen: שתיהן נגמרות ב-en", PW("🖊️", "pen")),
 Q(SR, "Which word rhymes with cake?", ["snake", "cat", "duck", "cup"], 0, "cake – snake: שתיהן נגמרות ב-ake", PW("🍰", "cake")),
 Q(SR, "Which word rhymes with moon?", ["spoon", "man", "mom", "map"], 0, "moon – spoon: שתיהן נגמרות ב-oon", PW("🌙", "moon")),
 Q(SR, "Which word does NOT rhyme?", ["bus", "goat", "boat", "coat"], 0, "goat, boat, coat נגמרות ב-oat", ROW("🐐", "⛵", "🧥", "🚌")),
 Q(SR, "Which word does NOT rhyme?", ["pig", "ten", "hen", "pen"], 0, "ten, hen, pen נגמרות ב-en", ROW("🔟", "🐔", "🖊️", "🐖")),
 Q(SR, "Which word starts like dog?", ["duck", "cat", "pig", "sun"], 0, "dog ו-duck מתחילות בצליל d", PW("🐕", "dog")),
 Q(SR, "Which word starts with m?", ["milk", "nose", "hat", "sun"], 0, "milk מתחילה ב-m", BIG("m")),
 Q(SR, "What is the last sound in bus?", ["s", "b", "n", "t"], 0, "bus נגמרת בצליל s", PW("🚌", "bus")),
 Q(SR, "What is the last sound in dog?", ["g", "d", "t", "p"], 0, "dog נגמרת בצליל g", PW("🐕", "dog")),
 Q(SR, "What is the last sound in ten?", ["n", "t", "m", "e"], 0, "ten נגמרת בצליל n", PW("🔟", "ten")),
 Q(SR, "Which word ends with t?", ["cat", "bus", "pen", "dog"], 0, "c-a-t: הצליל האחרון הוא t", BIG("t")),
 Q(SR, "Which two words start the same?", ["bus, bed", "cat, dog", "sun, pen", "fish, hat"], 0, "bus ו-bed מתחילות בצליל b", ROW("🚌", "🛏️", "🐈", "🐕")),
]))

# ───────────── Short vowels ─────────────
C.append(("Short vowels: a · e · i", [VW], [
 Q(VW, "h_t (כובע)", ["a", "e", "i", "o"], 0, "h-a-t = hat", "🎩"),
 Q(VW, "b_d (מיטה)", ["e", "a", "i", "u"], 0, "b-e-d = bed", "🛏️"),
 Q(VW, "p_g (חזיר)", ["i", "a", "e", "o"], 0, "p-i-g = pig", "🐖"),
 Q(VW, "m_p (מפה)", ["a", "o", "u", "e"], 0, "m-a-p = map", "🗺️"),
 Q(VW, "t_n (עשר)", ["e", "a", "i", "u"], 0, "t-e-n = ten", "🔟"),
 Q(VW, "s_x (שש)", ["i", "a", "o", "e"], 0, "s-i-x = six", "6️⃣"),
 Q(VW, "h_n (תרנגולת)", ["e", "a", "i", "u"], 0, "h-e-n = hen", "🐔"),
 Q(VW, "Which word has a short a?", ["bag", "bed", "pig", "sun"], 0, "b-a-g: באמצע a", ROW("👜", "🛏️", "🐖", "☀️")),
 Q(VW, "Which word has a short i?", ["fish", "bed", "cat", "box"], 0, "f-i-sh: באמצע i", ROW("🐟", "🛏️", "🐈", "📦")),
 Q(VW, "Read the sounds: p – i – g", ["pig", "peg", "big", "pin"], 0, "p-i-g ביחד = pig", TXT("p-i-g")),
]))

C.append(("Short vowels: o · u", [VW], [
 Q(VW, "b_x (קופסה)", ["o", "a", "i", "u"], 0, "b-o-x = box", "📦"),
 Q(VW, "f_x (שועל)", ["o", "a", "i", "u"], 0, "f-o-x = fox", "🦊"),
 Q(VW, "s_n (שמש)", ["u", "o", "a", "i"], 0, "s-u-n = sun", "☀️"),
 Q(VW, "b_s (אוטובוס)", ["u", "a", "o", "e"], 0, "b-u-s = bus", "🚌"),
 Q(VW, "c_p (ספל)", ["u", "a", "o", "i"], 0, "c-u-p = cup", "☕"),
 Q(VW, "d_ck (ברווז)", ["u", "o", "a", "e"], 0, "d-u-ck = duck", "🦆"),
 Q(VW, "s_ck (גרב)", ["o", "u", "a", "i"], 0, "s-o-ck = sock", "🧦"),
 Q(VW, "Which word has a short u?", ["bus", "box", "bag", "bed"], 0, "b-u-s: באמצע u", ROW("🚌", "📦", "👜", "🛏️")),
 Q(VW, "Which word has a short o?", ["dog", "duck", "bed", "pig"], 0, "d-o-g: באמצע o", ROW("🐕", "🦆", "🛏️", "🐖")),
 Q(VW, "Read the sounds: d – o – g", ["dog", "dig", "dug", "bog"], 0, "d-o-g ביחד = dog", TXT("d-o-g")),
 Q(VW, "Which vowel is in cat, hat and map?", ["a", "e", "i", "o"], 0, "c-a-t, h-a-t, m-a-p: כולן עם a", TXT("cat", "hat", "map")),
]))

# ───────────── Magic e (long vowels) ─────────────
C.append(("Magic e: cake · kite · bike", [ME], [
 Q(ME, "c_ke (עוגה)", ["a", "e", "i", "o"], 0, "c-a-ke: ה-e בסוף שקטה, וה-a ארוכה", "🍰"),
 Q(ME, "b_ke (אופניים)", ["i", "a", "o", "u"], 0, "b-i-ke: ה-e בסוף שקטה, וה-i ארוכה", "🚲"),
 Q(ME, "k_te (עפיפון)", ["i", "a", "o", "u"], 0, "k-i-te = kite: i ארוכה כמו בשם האות", "🌬️"),
 Q(ME, "b_ne (עצם)", ["o", "a", "i", "u"], 0, "b-o-ne = bone: o ארוכה", "🦴"),
 Q(ME, "r_se (ורד)", ["o", "a", "i", "e"], 0, "r-o-se = rose: o ארוכה", "🌹"),
 Q(ME, "c_be (קובייה)", ["u", "a", "o", "i"], 0, "c-u-be = cube: u ארוכה", "🎲"),
 Q(ME, "kit + e = ?", ["kite", "kit", "cute", "kid"], 0, "e בסוף משנה: kit ← kite", TXT("kit + e")),
 Q(ME, "Which word has a long a, like cake?", ["lake", "cat", "map", "bag"], 0, "l-a-ke: e בסוף ← a ארוכה", PW("🍰", "cake")),
 Q(ME, "Which number has a long i, like bike?", ["five", "big", "pig", "sit"], 0, "f-i-ve: e בסוף ← i ארוכה", PW("🚲", "bike")),
 Q(ME, "In \"cake\", the last e is ___.", ["silent", "loud", "short", "long"], 0, "את ה-e בסוף לא שומעים – היא שקטה", "🍰"),
]))

C.append(("Magic e: read & match", [ME], [
 Q(ME, "עפיפון = ?", ["kite", "kit", "cat", "cake"], 0, "kite: i ארוכה ו-e שקטה בסוף", "🌬️"),
 Q(ME, "אופניים = ?", ["bike", "big", "bake", "bag"], 0, "bike: i ארוכה ו-e שקטה בסוף", "🚲"),
 Q(ME, "h_me (בית)", ["o", "a", "i", "u"], 0, "h-o-me = home: o ארוכה", "🏠"),
 Q(ME, "n_se (אף)", ["o", "a", "i", "u"], 0, "n-o-se = nose: o ארוכה", "👃"),
 Q(ME, "f_ve (חמש)", ["i", "a", "o", "u"], 0, "f-i-ve = five: i ארוכה", "5️⃣"),
 Q(ME, "n_ne (תשע)", ["i", "a", "o", "u"], 0, "n-i-ne = nine: i ארוכה", "9️⃣"),
 Q(ME, "Which word rhymes with bike?", ["like", "big", "back", "bake"], 0, "bike – like: שתיהן נגמרות ב-ike", PW("🚲", "bike")),
 Q(ME, "Which word rhymes with rose?", ["nose", "rock", "red", "run"], 0, "rose – nose: שתיהן נגמרות ב-ose", PW("🌹", "rose")),
 Q(ME, "Which word rhymes with kite?", ["white", "kit", "cat", "hot"], 0, "kite – white: שתיהן נגמרות בצליל ite", TXT("kite")),
 Q(ME, "Which word has NO magic e?", ["dog", "five", "home", "cake"], 0, "d-o-g: אין e בסוף, o קצרה", ROW("🐕", "5️⃣", "🏠", "🍰")),
]))

# ───────────── sh · ch · th ─────────────
C.append(("sh · ch · th: which sound?", [DG], [
 Q(DG, "_ip (אונייה)", ["sh", "ch", "th", "s"], 0, "sh-i-p = ship", "🚢"),
 Q(DG, "fi_ (דג)", ["sh", "ch", "th", "s"], 0, "f-i-sh = fish", "🐟"),
 Q(DG, "_eese (גבינה)", ["ch", "sh", "th", "c"], 0, "ch-eese = cheese", "🧀"),
 Q(DG, "_ree (שלוש)", ["th", "sh", "ch", "t"], 0, "th-ree = three", "3️⃣"),
 Q(DG, "_erry (דובדבן)", ["ch", "sh", "th", "c"], 0, "ch-erry = cherry", "🍒"),
 Q(DG, "_umb (אגודל)", ["th", "sh", "ch", "f"], 0, "th-umb = thumb", "👍"),
 Q(DG, "_oe (נעל)", ["sh", "ch", "th", "s"], 0, "sh-oe = shoe", "👟"),
 Q(DG, "ba_ (אמבטיה)", ["th", "sh", "ch", "t"], 0, "ba-th = bath", "🛁"),
 Q(DG, "_ips (צ'יפס)", ["ch", "sh", "th", "s"], 0, "ch-ips = chips", "🍟"),
 Q(DG, "Which word starts with sh?", ["sheep", "cheese", "three", "sun"], 0, "sh-eep = sheep", ROW("🐑", "🧀", "3️⃣", "☀️")),
]))

C.append(("sh · ch · th words", [DG], [
 Q(DG, "It starts with ch. You sit on it.", ["chair", "shoe", "thumb", "cat"], 0, "ch-air = chair (כיסא)", BIG("ch")),
 Q(DG, "Which word starts with th?", ["three", "tree", "shoe", "chips"], 0, "three מתחילה ב-th; tree רק ב-t", BIG("th")),
 Q(DG, "Which word ends with sh?", ["fish", "fun", "chin", "shop"], 0, "fi-sh נגמרת ב-sh; shop מתחילה ב-sh", TXT("…sh")),
 Q(DG, "Which word ends with ch?", ["watch", "chop", "cat", "wash"], 0, "wat-ch נגמרת ב-ch", TXT("…ch")),
 Q(DG, "Which sound starts ship and shell?", ["sh", "s", "ch", "h"], 0, "sh-ip, sh-ell", ROW("🚢", "🐚")),
 Q(DG, "Which sound starts cheese and chips?", ["ch", "sh", "c", "th"], 0, "ch-eese, ch-ips", ROW("🧀", "🍟")),
 Q(DG, "Which sound starts three and thumb?", ["th", "t", "sh", "f"], 0, "th-ree, th-umb", ROW("3️⃣", "👍")),
 Q(DG, "Which word ends with th?", ["mouth", "mouse", "house", "much"], 0, "mou-th = פה: נגמרת ב-th", TXT("…th")),
 Q(DG, "Read the sounds: sh – o – p", ["shop", "chop", "stop", "ship"], 0, "sh-o-p = shop (חנות)", TXT("sh-o-p")),
 Q(DG, "Read the sounds: ch – i – n", ["chin", "shin", "thin", "chip"], 0, "ch-i-n = chin (סנטר)", TXT("ch-i-n")),
]))

# ───────────── ABC & sight words ─────────────
C.append(("ABC & sight words", [AB], [
 Q(AB, "What comes after D?", ["E", "F", "C", "B"], 0, "C D E", TXT("C, D, ?")),
 Q(AB, "What comes before M?", ["L", "N", "K", "O"], 0, "L M N", TXT("?, M, N")),
 Q(AB, "What comes between R and T?", ["S", "U", "Q", "P"], 0, "R S T", TXT("R, ?, T")),
 Q(AB, "האות הגדולה של {g}?", ["G", "Q", "J", "C"], 0, "g קטנה = G גדולה", BIG("g")),
 Q(AB, "האות הקטנה של {R}?", ["r", "n", "h", "k"], 0, "R גדולה = r קטנה", BIG("R")),
 Q(AB, "Which of these letters is a vowel?", ["e", "b", "t", "m"], 0, "התנועות: a e i o u", TXT("b, e, t, m")),
 Q(AB, "אני = ?", ["I", "you", "he", "we"], 0, "אני = I (תמיד באות גדולה)", "🙋"),
 Q(AB, "הם = ?", ["they", "we", "he", "she"], 0, "הם = they", ROW("👦", "👧", "👦")),
 Q(AB, "חתול וכלב = {a cat ___ a dog}", ["and", "or", "is", "the"], 0, "ו... = and", ROW("🐈", "🐕")),
 Q(AB, "Look ___ the cat!", ["at", "on", "in", "up"], 0, "look at = תסתכל על", ROW("👀", "🐈")),
 Q(AB, "שלי = ?", ["my", "me", "you", "your"], 0, "שלי = my (my bag = התיק שלי)", ROW("🙋", "🎒")),
 Q(AB, "למעלה = ?", ["up", "down", "in", "on"], 0, "למעלה = up, למטה = down", "⬆️"),
]))

# ───────────── Greetings & talk ─────────────
C.append(("Greetings: what do you say?", [GR], [
 Q(GR, "You meet a friend. You say: ___", ["Hello!", "Goodbye!", "Good night!", "Sorry!"], 0, "כשנפגשים אומרים Hello", ROW("👦", "👧")),
 Q(GR, "You go home after school. You say: ___", ["Goodbye!", "Hello!", "Good morning!", "Sorry!"], 0, "כשהולכים אומרים Goodbye = להתראות", ROW("🏫", "🏠")),
 Q(GR, "You step on a friend's foot. You say: ___", ["Sorry!", "Thank you!", "Hello!", "Good night!"], 0, "פגעתי במישהו ← מתנצלים: Sorry", ROW("👟", "😬")),
 Q(GR, "It's night. You go to bed. You say: ___", ["Good night!", "Good morning!", "Hello!", "Thank you!"], 0, "הולכים לישון ← Good night", ROW("🛏️", "🌙")),
 Q(GR, "בבקשה = ?", ["Please", "Thank you", "Sorry", "Goodbye"], 0, "כשמבקשים משהו אומרים please", ROW("🙋", "💧")),
 Q(GR, "Thank you! – ___", ["You're welcome.", "Sorry.", "Goodbye.", "Good night."], 0, "עונים לתודה: You're welcome = אין בעד מה", ROW("🎁", "🙂")),
 Q(GR, "{Thank you very much!} = ?", ["תודה רבה!", "בבקשה!", "סליחה!", "להתראות!"], 0, "very much = מאוד, הרבה ← תודה רבה", ROW("🎁", "🙋", "😬", "👋")),
 Q(GR, "{See you tomorrow!} = ?", ["נתראה מחר!", "בוקר טוב!", "תודה רבה!", "מה שלומך?"], 0, "see you = נתראה, tomorrow = מחר", ROW("👦", "👧")),
 Q(GR, "It's your friend's birthday. You say: Happy ___!", ["birthday", "morning", "night", "sorry"], 0, "ליום הולדת אומרים Happy birthday", "🎂"),
 Q(GR, "{Good evening!} = ?", ["ערב טוב!", "בוקר טוב!", "לילה טוב!", "יום טוב!"], 0, "evening = ערב ← ערב טוב", ROW("🌅", "🌆", "🌙", "☀️")),
]))

C.append(("Let's talk: How are you?", [GR], [
 Q(GR, "How are you? – I'm ___, thank you.", ["fine", "nine", "Dan", "five"], 0, "How are you = מה שלומך ← I'm fine", ROW("👧", "👦")),
 Q(GR, "How is your mom? – ___ is fine, thanks.", ["She", "He", "I", "It"], 0, "mom = בת ← She is fine", "👩"),
 Q(GR, "What's your name? – ___ name is Dana.", ["My", "I", "Me", "Your"], 0, "השם שלי = My name", ROW("👧", "📛")),
 Q(GR, "Nice to ___ you!", ["meet", "eat", "sit", "read"], 0, "Nice to meet you = נעים להכיר", ROW("👦", "👧")),
 Q(GR, "Hi, Dan! How ___ you?", ["are", "is", "am", "do"], 0, "you ← are: How are you?", ROW("👧", "👦")),
 Q(GR, "I'm sorry I'm late. – That's ___.", ["fine", "late", "sorry", "bye"], 0, "That's fine = זה בסדר", "⏰"),
 Q(GR, "Do you want milk? – No, ___ you.", ["thank", "please", "sorry", "hello"], 0, "מסרבים יפה: No, thank you", "🥛"),
 Q(GR, "Do you want some cake? – Yes, ___!", ["please", "sorry", "goodbye", "hello"], 0, "מסכימים יפה: Yes, please", "🍰"),
 Q(GR, "Where are you from? – I'm from ___.", ["Israel", "happy", "nine", "Dana"], 0, "from = מאיפה ← שם של מקום", ROW("👦", "👧")),
 Q(GR, "Good ___! Time to get up!", ["morning", "night", "bye", "please"], 0, "קמים בבוקר ← Good morning", ROW("⏰", "🛏️")),
]))

# ───────────── Family & feelings ─────────────
C.append(("Family & feelings", [FF], [
 Q(FF, "סבתא = ?", ["grandma", "grandpa", "mother", "sister"], 0, "סבתא = grandma", "👵"),
 Q(FF, "My mother's mother is my ___.", ["grandma", "sister", "aunt", "baby"], 0, "אמא של אמא = סבתא = grandma", ROW("👩", "👧")),
 Q(FF, "Mom, Dad and me – we are a ___.", ["family", "school", "friend", "house"], 0, "משפחה = family", ROW("👩", "👨", "👦")),
 Q(FF, "He is my ___.", ["brother", "sister", "mother", "grandma"], 0, "he = הוא ← brother", "👦"),
 Q(FF, "She is ___.", ["happy", "sad", "angry", "tired"], 0, "שמחה = happy", "😀"),
 Q(FF, "He is ___.", ["sad", "happy", "hungry", "hot"], 0, "עצוב = sad", "😢"),
 Q(FF, "He is ___.", ["angry", "happy", "tired", "cold"], 0, "כועס = angry", "😠"),
 Q(FF, "I want to sleep. I am ___.", ["tired", "hungry", "angry", "happy"], 0, "רוצה לישון = עייף = tired", "😴"),
 Q(FF, "I want to eat. I am ___.", ["hungry", "thirsty", "tired", "sad"], 0, "רוצה לאכול = רעב = hungry", "🍽️"),
 Q(FF, "I want water. I am ___.", ["thirsty", "hungry", "tired", "happy"], 0, "רוצה לשתות = צמא = thirsty", "💧"),
 Q(FF, "שמח = ?", ["happy", "sad", "angry", "scared"], 0, "שמח = happy", "😊"),
 Q(FF, "מפחד = ?", ["scared", "happy", "hungry", "tired"], 0, "מפחד = scared", "😨"),
 Q(FF, "It's my birthday! I am ___.", ["happy", "sad", "angry", "scared"], 0, "יום הולדת – שמחים!", "🎂"),
 Q(FF, "There is a big snake! I am ___.", ["scared", "hungry", "thirsty", "tired"], 0, "נחש גדול – מפחדים", "🐍"),
]))

# ───────────── Colors & numbers ─────────────
C.append(("Colors", [CN], [
 Q(CN, "The sun is ___.", ["yellow", "blue", "black", "purple"], 0, "השמש צהובה = yellow", "☀️"),
 Q(CN, "ורוד = ?", ["pink", "purple", "red", "white"], 0, "ורוד = pink", "🌸"),
 Q(CN, "שחור = ?", ["black", "brown", "blue", "white"], 0, "שחור = black", "⚫"),
 Q(CN, "Red and yellow make ___.", ["orange", "green", "purple", "brown"], 0, "אדום + צהוב = כתום", ROW("🔴", "➕", "💛")),
 Q(CN, "Blue and yellow make ___.", ["green", "orange", "pink", "black"], 0, "כחול + צהוב = ירוק", ROW("🔵", "➕", "💛")),
 Q(CN, "What color is the heart?", ["blue", "red", "pink", "green"], 0, "לב כחול = blue", "💙"),
 Q(CN, "What color are grapes?", ["purple", "blue", "red", "yellow"], 0, "ענבים סגולים = purple", "🍇"),
]))

C.append(("Numbers 1–10", [CN], [
 Q(CN, "How many legs does a spider have?", ["eight", "six", "four", "ten"], 0, "לעכביש 8 רגליים = eight", "🕷️"),
 Q(CN, "How many legs does a bee have?", ["six", "eight", "four", "two"], 0, "לדבורה (חרק) 6 רגליים = six", "🐝"),
 Q(CN, "How many noses do you have?", ["one", "two", "three", "ten"], 0, "לכל אחד אף אחד = one", "👃"),
 Q(CN, "How many?", ["seven", "six", "eight", "five"], 0, "סופרים: seven = 7", COUNT(("⭐", 7))),
 Q(CN, "How many?", ["three", "tree", "two", "four"], 0, "three = 3 (tree = עץ)", COUNT(("🍎", 3))),
 Q(CN, "How many?", ["nine", "five", "nineteen", "six"], 0, "סופרים: nine = 9", COUNT(("🌸", 5), ("🌸", 4))),
 Q(CN, "How many eyes do you have?", ["two", "one", "three", "four"], 0, "שתי עיניים = two eyes", "👀"),
 Q(CN, "five + five = ?", ["ten", "nine", "fifteen", "five"], 0, "5 + 5 = 10 = ten", TXT("5 + 5")),
 Q(CN, "two + two = ?", ["four", "two", "five", "twenty"], 0, "2 + 2 = 4 = four", TXT("2 + 2")),
 Q(CN, "What comes after nine?", ["ten", "eight", "eleven", "nineteen"], 0, "אחרי 9 בא 10 = ten", TXT("9 → ?")),
]))

C.append(("Numbers 11–20", [CN], [
 Q(CN, "12 = ?", ["twelve", "twenty", "eleven", "two"], 0, "12 = twelve", TXT("12")),
 Q(CN, "13 = ?", ["thirteen", "thirty", "three", "twelve"], 0, "13 = thirteen", TXT("13")),
 Q(CN, "14 = ?", ["fourteen", "forty", "four", "eleven"], 0, "14 = fourteen", TXT("14")),
 Q(CN, "15 = ?", ["fifteen", "fifty", "five", "eleven"], 0, "15 = fifteen", TXT("15")),
 Q(CN, "16 = ?", ["sixteen", "sixty", "six", "seventeen"], 0, "16 = sixteen", TXT("16")),
 Q(CN, "18 = ?", ["eighteen", "eighty", "eight", "eleven"], 0, "18 = eighteen", TXT("18")),
 Q(CN, "20 = ?", ["twenty", "twelve", "two", "ten"], 0, "20 = twenty", TXT("20")),
 Q(CN, "How many?", ["eleven", "twelve", "ten", "seven"], 0, "6 + 5 = 11 = eleven", COUNT(("🐟", 6), ("🐟", 5))),
 Q(CN, "What comes after sixteen?", ["seventeen", "fifteen", "eighteen", "seven"], 0, "אחרי 16 בא 17 = seventeen", TXT("16 → ?")),
 Q(CN, "Which number is the biggest?", ["nineteen", "nine", "sixteen", "eleven"], 0, "19 = nineteen – הכי גדול", TXT("9 · 11", "16 · 19")),
]))

# ───────────── Body & clothes ─────────────
C.append(("My body", [BC], [
 Q(BC, "This is my ___.", ["ear", "eye", "nose", "hand"], 0, "אוזן = ear", "👂"),
 Q(BC, "I hear with my two ___.", ["ears", "eyes", "hands", "feet"], 0, "שומעים באוזניים = ears", "🎵"),
 Q(BC, "I eat and talk with my ___.", ["mouth", "nose", "ears", "eyes"], 0, "אוכלים ומדברים בפה = mouth", ROW("🍎", "🍞")),
 Q(BC, "I wear shoes on my ___.", ["feet", "ears", "eyes", "nose"], 0, "נעליים נועלים על כפות הרגליים = feet", "👟"),
 Q(BC, "An owl has two big ___.", ["eyes", "ears", "legs", "hands"], 0, "לינשוף שתי עיניים גדולות = eyes", "🦉"),
 Q(BC, "A horse has four long ___.", ["legs", "eyes", "noses", "hands"], 0, "לסוס ארבע רגליים = legs", "🐎"),
 Q(BC, "זרוע = ?", ["arm", "leg", "ear", "nose"], 0, "זרוע = arm", "💪"),
 Q(BC, "שיניים = ?", ["teeth", "feet", "eyes", "ears"], 0, "שן = tooth, שיניים = teeth", "🦷"),
 Q(BC, "I have ten ___.", ["fingers", "eyes", "ears", "noses"], 0, "10 אצבעות = ten fingers", TXT("10")),
]))

C.append(("Clothes", [BC], [
 Q(BC, "חולצה = ?", ["shirt", "skirt", "shoes", "socks"], 0, "חולצה = shirt", "👕"),
 Q(BC, "This is a ___.", ["dress", "shirt", "coat", "hat"], 0, "שמלה = dress", "👗"),
 Q(BC, "These are my ___.", ["pants", "socks", "shoes", "hats"], 0, "מכנסיים = pants", "👖"),
 Q(BC, "גרביים = ?", ["socks", "shoes", "shirts", "hats"], 0, "גרביים = socks", "🧦"),
 Q(BC, "נעליים = ?", ["shoes", "socks", "hats", "coats"], 0, "נעליים = shoes", COUNT(("👟", 2))),
 Q(BC, "כובע = ?", ["hat", "cat", "coat", "bag"], 0, "כובע = hat", "🧢"),
 Q(BC, "צעיף = ?", ["scarf", "shirt", "skirt", "sock"], 0, "צעיף = scarf", "🧣"),
 Q(BC, "It's cold. I wear my ___ over my shirt.", ["coat", "shorts", "swimsuit", "sandals"], 0, "קר ← מעיל = coat", ROW("❄️", "🥶")),
 Q(BC, "I wear gloves on my ___.", ["hands", "feet", "head", "ears"], 0, "כפפות על הידיים = hands", "🧤"),
 Q(BC, "I wear a hat on my ___.", ["head", "hand", "foot", "leg"], 0, "כובע על הראש = head", "👒"),
]))

# ───────────── Animals ─────────────
C.append(("Animals", [AN], [
 Q(AN, "פרה = ?", ["cow", "horse", "sheep", "pig"], 0, "פרה = cow", "🐄"),
 Q(AN, "סוס = ?", ["horse", "cow", "dog", "house"], 0, "סוס = horse (house = בית)", "🐎"),
 Q(AN, "This is a ___.", ["rabbit", "mouse", "cat", "dog"], 0, "ארנב = rabbit", "🐇"),
 Q(AN, "This is a ___.", ["sheep", "cow", "pig", "horse"], 0, "כבשה = sheep", "🐑"),
 Q(AN, "דוב = ?", ["bear", "bird", "bee", "lion"], 0, "דוב = bear", "🐻"),
 Q(AN, "עכבר = ?", ["mouse", "house", "horse", "cat"], 0, "עכבר = mouse", "🐭"),
 Q(AN, "Which animal says \"woof\"?", ["dog", "cat", "cow", "sheep"], 0, "הכלב עושה woof", TXT("Woof!")),
 Q(AN, "Which animal says \"meow\"?", ["cat", "dog", "duck", "pig"], 0, "החתול עושה meow", TXT("Meow!")),
 Q(AN, "Which animal is the biggest?", ["elephant", "mouse", "bee", "frog"], 0, "הפיל גדול מאוד", ROW("🐘", "🐭", "🐝", "🐸")),
 Q(AN, "תרנגולת = ?", ["hen", "pen", "horse", "duck"], 0, "תרנגולת = hen", "🐔"),
 Q(AN, "ברווז = ?", ["duck", "dog", "frog", "fish"], 0, "ברווז = duck", "🦆"),
 Q(AN, "Which animal says \"moo\"?", ["cow", "lion", "tiger", "monkey"], 0, "הפרה עושה moo", TXT("Moo!")),
]))

# ───────────── Food ─────────────
C.append(("Food", [FD], [
 Q(FD, "חלב = ?", ["milk", "water", "juice", "bread"], 0, "חלב = milk", "🥛"),
 Q(FD, "גזר = ?", ["carrot", "cucumber", "tomato", "banana"], 0, "גזר = carrot", "🥕"),
 Q(FD, "This is a ___.", ["tomato", "potato", "cherry", "lemon"], 0, "עגבנייה = tomato", "🍅"),
 Q(FD, "גלידה = ?", ["ice cream", "cake", "cookie", "candy"], 0, "גלידה = ice cream", "🍦"),
 Q(FD, "Which of these is a vegetable?", ["cucumber", "apple", "banana", "cake"], 0, "מלפפון הוא ירק = cucumber", ROW("🥒", "🍎", "🍌", "🍰")),
 Q(FD, "Which of these is NOT a drink?", ["pizza", "milk", "water", "juice"], 0, "פיצה אוכלים, לא שותים", ROW("🍕", "🥛", "💧")),
 Q(FD, "ענבים = ?", ["grapes", "cherries", "apples", "plums"], 0, "ענבים = grapes", "🍇"),
 Q(FD, "Monkeys love long yellow ___.", ["bananas", "milk", "pizza", "cheese"], 0, "קופים אוהבים בננות", "🐒"),
 Q(FD, "Bees make ___.", ["honey", "milk", "eggs", "bread"], 0, "דבורים מכינות דבש = honey", "🐝"),
 Q(FD, "Bread and cheese and bread make a ___.", ["sandwich", "water", "juice", "milk"], 0, "לחם, גבינה ולחם ← כריך = sandwich", ROW("🍞", "🧀", "🍞")),
]))

# ───────────── School & instructions ─────────────
C.append(("School things", [SC], [
 Q(SC, "ילקוט = ?", ["bag", "book", "box", "pen"], 0, "ילקוט = (school) bag", "🎒"),
 Q(SC, "ספר = ?", ["book", "box", "bag", "bed"], 0, "ספר = book", "📕"),
 Q(SC, "בית ספר = ?", ["school", "class", "house", "shop"], 0, "בית ספר = school", "🏫"),
 Q(SC, "I write in ink with a ___.", ["pen", "book", "ruler", "bag"], 0, "כותבים בדיו בעט = pen", ROW("🖊️", "📕", "📏", "🎒")),
 Q(SC, "This is a ___.", ["crayon", "ruler", "book", "bag"], 0, "צבע (עפרון שעווה) = crayon", "🖍️"),
 Q(SC, "דלת = ?", ["door", "floor", "box", "desk"], 0, "דלת = door", "🚪"),
]))

C.append(("Classroom instructions", [SC], [
 Q(SC, "פתחו את הספר = {___ your book.}", ["Open", "Close", "Sit", "Stand"], 0, "לפתוח = open", "📖"),
 Q(SC, "שבו! = {___ down!}", ["Sit", "Stand", "Look", "Open"], 0, "Sit down = שבו", "💺"),
 Q(SC, "קומו! = {___ up!}", ["Stand", "Sit", "Close", "Open"], 0, "Stand up = קומו", "🙋"),
 Q(SC, "Point to the ___.", ["door", "book", "bag", "pen"], 0, "Point to = הצביעו על", ROW("👉", "🚪")),
 Q(SC, "Listen = ?", ["תקשיבו", "תכתבו", "תקראו", "תשבו"], 0, "listen = להקשיב", ROW("👂", "✍️", "📖", "💺")),
 Q(SC, "Write = ?", ["תכתבו", "תקראו", "תקשיבו", "תציירו"], 0, "write = לכתוב", ROW("✍️", "📖", "👂", "🖍️")),
 Q(SC, "תקראו = ?", ["Read", "Write", "Draw", "Listen"], 0, "לקרוא = read", "📖"),
 Q(SC, "Draw = ?", ["תציירו", "תכתבו", "תקראו", "תסגרו"], 0, "draw = לצייר", ROW("🖍️", "✍️", "📖", "🚪")),
 Q(SC, "Raise your ___.", ["hand", "foot", "bag", "book"], 0, "הרימו את היד = raise your hand", "🙋"),
 Q(SC, "שקט! = ?", ["Be quiet!", "Sit down!", "Stand up!", "Look!"], 0, "שקט = Be quiet", "🤫"),
 Q(SC, "הסתכלו על הלוח = {___ at the board.}", ["Look", "Listen", "Sit", "Close"], 0, "להסתכל = look", "👀"),
]))

# ───────────── Days of the week ─────────────
def DAY(h): return [("📅", 30, 52, 40), (h, 70, 52, 34)]
C.append(("Days of the week", [DY], [
 Q(DY, "יום ראשון = ?", ["Sunday", "Monday", "Saturday", "Friday"], 0, "יום ראשון = Sunday", DAY("א'")),
 Q(DY, "יום שני = ?", ["Monday", "Sunday", "Tuesday", "Thursday"], 0, "יום שני = Monday", DAY("ב'")),
 Q(DY, "יום שלישי = ?", ["Tuesday", "Thursday", "Wednesday", "Monday"], 0, "יום שלישי = Tuesday", DAY("ג'")),
 Q(DY, "יום רביעי = ?", ["Wednesday", "Tuesday", "Friday", "Sunday"], 0, "יום רביעי = Wednesday", DAY("ד'")),
 Q(DY, "יום חמישי = ?", ["Thursday", "Tuesday", "Friday", "Saturday"], 0, "יום חמישי = Thursday", DAY("ה'")),
 Q(DY, "יום שישי = ?", ["Friday", "Saturday", "Sunday", "Thursday"], 0, "יום שישי = Friday", DAY("ו'")),
 Q(DY, "שבת = ?", ["Saturday", "Sunday", "Friday", "Monday"], 0, "שבת = Saturday", "🕯️"),
 Q(DY, "How many days are in a week?", ["seven", "five", "six", "ten"], 0, "בשבוע 7 ימים = seven", TXT("Sun … Sat")),
 Q(DY, "Which is NOT a day?", ["Monkey", "Monday", "Sunday", "Friday"], 0, "Monkey = קוף, לא יום", "📅"),
 Q(DY, "In Israel, the school week starts on ___.", ["Sunday", "Monday", "Saturday", "Friday"], 0, "השבוע בבית הספר מתחיל ביום ראשון", "🏫"),
]))

C.append(("Days: before & after", [DY], [
 Q(DY, "What comes after Monday?", ["Tuesday", "Sunday", "Thursday", "Wednesday"], 0, "אחרי Monday בא Tuesday", TXT("Monday → ?")),
 Q(DY, "What comes after Thursday?", ["Friday", "Wednesday", "Saturday", "Tuesday"], 0, "אחרי Thursday בא Friday", TXT("Thursday → ?")),
 Q(DY, "What comes before Sunday?", ["Saturday", "Monday", "Friday", "Thursday"], 0, "לפני Sunday בא Saturday", TXT("? → Sunday")),
 Q(DY, "What comes before Wednesday?", ["Tuesday", "Thursday", "Monday", "Friday"], 0, "לפני Wednesday בא Tuesday", TXT("? → Wednesday")),
 Q(DY, "Today is Friday. Tomorrow is ___.", ["Saturday", "Thursday", "Sunday", "Monday"], 0, "מחר = היום שאחרי", TXT("Friday → ?")),
 Q(DY, "Today is Tuesday. Yesterday was ___.", ["Monday", "Wednesday", "Sunday", "Thursday"], 0, "אתמול = היום שלפני", TXT("? → Tuesday")),
 Q(DY, "Sunday, Monday, ___, Wednesday", ["Tuesday", "Thursday", "Friday", "Saturday"], 0, "Sunday, Monday, Tuesday, Wednesday", TXT("Sun Mon ? Wed")),
 Q(DY, "Thursday, Friday, ___", ["Saturday", "Sunday", "Monday", "Wednesday"], 0, "אחרי Friday בא Saturday", TXT("Thu Fri ?")),
 Q(DY, "Which day starts with W?", ["Wednesday", "Tuesday", "Monday", "Friday"], 0, "W-ednesday = יום רביעי", BIG("W")),
 Q(DY, "Which day has the word \"sun\" in it?", ["Sunday", "Saturday", "Monday", "Friday"], 0, "Sun-day: sun = שמש", "☀️"),
]))

# ───────────── I am · have · like · can ─────────────
C.append(("I am · I have", [IA], [
 Q(IA, "I ___ a girl.", ["am", "is", "are", "have"], 0, "I ← am", "👧"),
 Q(IA, "I ___ ten years old.", ["am", "have", "is", "are"], 0, "גיל: I am ten (לא have)", ROW("🎂", "🔟")),
 Q(IA, "I ___ two cats.", ["have", "am", "is", "has"], 0, "יש לי = I have", COUNT(("🐈", 2))),
 Q(IA, "I ___ two brothers.", ["have", "am", "is", "has"], 0, "יש לי = I have", COUNT(("👦", 2))),
 Q(IA, "I ___ two eyes.", ["have", "am", "is", "has"], 0, "יש לי = I have", "👀"),
 Q(IA, "יש לי = ?", ["I have", "I am", "I like", "I can"], 0, "יש לי = I have", ROW("🙋", "🎒")),
 Q(IA, "I'm = ?", ["I am", "I have", "I can", "I like"], 0, "I'm = I am (אני)", TXT("I'm")),
 Q(IA, "Which sentence about Dana is correct?", ["I am Dana.", "I is Dana.", "I are Dana.", "I has Dana."], 0, "I ← am", "👧"),
 Q(IA, "Which sentence about pens is correct?", ["I have pens.", "I has pens.", "I haves pens.", "I having pens."], 0, "I ← have", COUNT(("🖊️", 3))),
 Q(IA, "You ___ my friend.", ["are", "am", "is", "has"], 0, "you ← are", ROW("👦", "👧")),
]))

C.append(("I like · I can", [IA], [
 Q(IA, "אני אוהב פיצה = {I ___ pizza.}", ["like", "can", "am", "have"], 0, "אוהב = like", "🍕"),
 Q(IA, "I ___ swim.", ["can", "like", "am", "have"], 0, "I can swim = אני יודע לשחות", "🏊"),
 Q(IA, "A fish can ___.", ["swim", "fly", "run", "sing"], 0, "דג יכול לשחות = swim", "🐟"),
 Q(IA, "A bird can ___.", ["fly", "read", "write", "cook"], 0, "ציפור יכולה לעוף = fly", "🐦"),
 Q(IA, "A cat can't ___.", ["fly", "run", "jump", "eat"], 0, "can't = לא יכול; חתול לא עף", "🐈"),
 Q(IA, "Can you jump? Yes, I ___.", ["can", "am", "like", "have"], 0, "Can you…? Yes, I can.", "🤸"),
 Q(IA, "Can a dog fly? No, it ___.", ["can't", "can", "isn't", "not"], 0, "כלב לא עף ← No, it can't", "🐕"),
 Q(IA, "אני לא אוהב חלב = {I don't ___ milk.}", ["like", "can", "am", "have"], 0, "I don't like = אני לא אוהב", ROW("🥛", "👎")),
 Q(IA, "אני יכול = ?", ["I can", "I like", "I am", "I have"], 0, "יכול = can", "💪"),
 Q(IA, "אני אוהב = ?", ["I like", "I can", "I have", "I am"], 0, "אוהב = like", "❤️"),
 Q(IA, "Which is correct?", ["I can swim.", "I can swims.", "I cans swim.", "I can swimming."], 0, "אחרי can – הפועל בלי s", "🏊"),
]))

# ───────────── Do you like…? · has · his · her ─────────────
C.append(("Do you like…? Yes, I do", [DL], [
 Q(DL, "Do you like pizza? Yes, I ___.", ["do", "am", "like", "can"], 0, "Do you…? ← Yes, I do", ROW("🍕", "👍")),
 Q(DL, "Do you like milk? No, I ___.", ["don't", "not", "am not", "do"], 0, "No ← I don't (= do not)", ROW("🥛", "👎")),
 Q(DL, "___ you like cats? Yes, I do.", ["Do", "Are", "Is", "Am"], 0, "שואלים אם אוהבים ← Do you like", "🐈"),
 Q(DL, "Do you like bananas? Say yes.", ["Yes, I do.", "Yes, I am.", "Yes, I like.", "Yes, I can."], 0, "Do you like…? ← Yes, I do", ROW("🍌", "👍")),
 Q(DL, "Do you like snakes? Say no.", ["No, I don't.", "No, I not.", "No, I am.", "No, I do."], 0, "לא אוהבים ← No, I don't", ROW("🐍", "👎")),
 Q(DL, "{Do you like apples?} = ?", ["אתה אוהב תפוחים?", "יש לך תפוחים?", "אתה רוצה תפוחים?", "איפה התפוחים?"], 0, "Do you like = אתה אוהב", "🍎"),
 Q(DL, "Do you like ___? Yes! They're my favorite fruit.", ["apples", "bread", "cheese", "milk"], 0, "fruit = פרי ← apples", "🍎"),
 Q(DL, "I like cake, but I ___ like carrots.", ["don't", "do", "am", "not"], 0, "לא אוהב ← don't like", ROW("🍰", "👍", "🥕", "👎")),
 Q(DL, "I like ___, but I don't like cheese.", ["bread", "cheese", "milk", "eggs"], 0, "אוהב לחם, לא אוהב גבינה", ROW("🍞", "👍", "🧀", "👎")),
 Q(DL, "Do you like milk? ___, I do.", ["Yes", "No", "Not", "Do"], 0, "I do = אני כן אוהב ← Yes", ROW("🥛", "👍")),
]))

C.append(("Do · Are · Can: short answers", [DL], [
 Q(DL, "Do you have a dog? Yes, I ___.", ["do", "am", "can", "has"], 0, "Do you have…? ← Yes, I do", "🐕"),
 Q(DL, "Do you have a bike? No, I ___.", ["don't", "am not", "can't", "not"], 0, "Do you…? ← No, I don't", ROW("🚲", "👎")),
 Q(DL, "___ you have a sister? Yes, I do.", ["Do", "Are", "Can", "Is"], 0, "Yes, I do ← שאלו Do", "👧"),
 Q(DL, "Do you have a ___? I want to write.", ["pencil", "cake", "ball", "sock"], 0, "כותבים בעיפרון = pencil", ROW("✍️", "📓")),
 Q(DL, "Can you swim? Yes, I ___.", ["can", "do", "am", "does"], 0, "Can you…? ← Yes, I can", "🏊"),
 Q(DL, "Are you happy? Yes, I ___.", ["am", "do", "can", "is"], 0, "Are you…? ← Yes, I am", "😀"),
 Q(DL, "Are you tired? No, I'm ___.", ["not", "don't", "no", "isn't"], 0, "Are you…? ← No, I'm not", "🙂"),
 Q(DL, "Do you and Dan like pizza? Yes, ___ do.", ["we", "they", "he", "I"], 0, "you and Dan = אתם ← עונים we", ROW("👦", "👦", "🍕")),
 Q(DL, "___ you like music? Yes, I do.", ["Do", "Are", "Can", "Is"], 0, "התשובה Yes, I do ← השאלה עם Do", "🎵"),
 Q(DL, "___ you hungry? Yes, I am.", ["Are", "Do", "Can", "Is"], 0, "התשובה Yes, I am ← השאלה עם Are", "🍽️"),
 Q(DL, "___ you fly? No, I can't.", ["Can", "Do", "Are", "Is"], 0, "התשובה No, I can't ← השאלה עם Can", "🐦"),
]))

C.append(("he has · she has", [HS], [
 Q(HS, "He ___ a dog.", ["has", "have", "is", "am"], 0, "he ← has (יש לו)", ROW("👦", "🐕")),
 Q(HS, "She ___ a red bag.", ["has", "have", "is", "are"], 0, "she ← has (יש לה)", ROW("👧", "🎒")),
 Q(HS, "I ___ a cat.", ["have", "has", "am", "is"], 0, "I ← have; he / she ← has", ROW("🙋", "🐈")),
 Q(HS, "Dan ___ two sisters.", ["has", "have", "is", "are"], 0, "Dan = he ← has", ROW("👦", "👧", "👧")),
 Q(HS, "Mia ___ a baby brother.", ["has", "have", "is", "am"], 0, "Mia = she ← has", ROW("👧", "👶")),
 Q(HS, "Dan's brother is one. He is a ___.", ["baby", "grandpa", "father", "teacher"], 0, "בן שנה = תינוק = baby", ROW("👦", "1️⃣")),
 Q(HS, "יש לו = ?", ["he has", "he have", "she has", "I have"], 0, "יש לו = he has", "👦"),
 Q(HS, "יש לה = ?", ["she has", "she have", "he has", "she is"], 0, "יש לה = she has", "👧"),
 Q(HS, "Which is correct?", ["She has hats.", "She have hats.", "She haves hats.", "She is hats."], 0, "she ← has", "👒"),
 Q(HS, "The dog ___ four legs.", ["has", "have", "is", "are"], 0, "the dog = it ← has", "🐕"),
 Q(HS, "We ___ a big house.", ["have", "has", "is", "am"], 0, "we ← have; he / she ← has", ROW("👪", "🏠")),
]))

C.append(("his · her", [HS], [
 Q(HS, "This is Dan. ___ bag is red.", ["His", "Her", "He", "Has"], 0, "של Dan (בן) = שלו ← His", ROW("👦", "🎒")),
 Q(HS, "This is Mia. ___ hat is pink.", ["Her", "His", "She", "He"], 0, "של Mia (בת) = שלה ← Her", ROW("👧", "👒")),
 Q(HS, "Tom has a sister. ___ name is Noa.", ["Her", "His", "She", "He"], 0, "השם של האחות = שלה ← Her", ROW("👦", "👧")),
 Q(HS, "Dana has a brother. ___ name is Ben.", ["His", "Her", "He", "She"], 0, "השם של האח = שלו ← His", ROW("👧", "👦")),
 Q(HS, "{his} = ?", ["שלו", "שלה", "הוא", "היא"], 0, "his = שלו (של בן)", "👦"),
 Q(HS, "{her} = ?", ["שלה", "שלו", "היא", "הוא"], 0, "her = שלה (של בת)", "👧"),
 Q(HS, "He is my dad. ___ name is David.", ["His", "Her", "He", "My"], 0, "dad = בן ← His name", "👨"),
 Q(HS, "She is my grandma. ___ name is Ruth.", ["Her", "His", "She", "He"], 0, "grandma = בת ← Her name", "👵"),
 Q(HS, "Mia plays with ___ cat.", ["her", "his", "she", "he"], 0, "Mia בת ← her cat", ROW("👧", "🐈")),
 Q(HS, "Ben plays with ___ dog.", ["his", "her", "he", "she"], 0, "Ben בן ← his dog", ROW("👦", "🐕")),
]))

# ───────────── There is · this · plurals ─────────────
C.append(("Plurals: one cat, two cats", [TH], [
 Q(TH, "one cat, two ___", ["cats", "cat", "cates", "a cat"], 0, "יותר מאחד ← מוסיפים s", COUNT(("🐈", 2))),
 Q(TH, "one dog, three ___", ["dogs", "dog", "doges", "a dogs"], 0, "יותר מאחד ← מוסיפים s", COUNT(("🐕", 3))),
 Q(TH, "one book, four ___", ["books", "book", "bookes", "a book"], 0, "יותר מאחד ← מוסיפים s", COUNT(("📕", 4))),
 Q(TH, "one egg, two ___", ["eggs", "egg", "an egg", "egges"], 0, "יותר מאחד ← מוסיפים s", COUNT(("🥚", 2))),
 Q(TH, "one box, two ___", ["boxes", "boxs", "box", "boxies"], 0, "אחרי x מוסיפים es", COUNT(("📦", 2))),
 Q(TH, "How many?", ["five apples", "five apple", "a apples", "fives apple"], 0, "חמישה ← apples עם s", COUNT(("🍎", 5))),
 Q(TH, "I have two ___.", ["hands", "hand", "handes", "a hand"], 0, "שתיים ← hands עם s", COUNT(("✋", 2))),
 Q(TH, "six ___", ["birds", "bird", "a bird", "birdes"], 0, "שש ← birds עם s", COUNT(("🐦", 6))),
 Q(TH, "Which word means \"more than one\"?", ["pens", "pen", "a pen", "one pen"], 0, "pens עם s = כמה עטים", COUNT(("🖊️", 3))),
 Q(TH, "Which is only ONE thing?", ["ball", "balls", "pens", "cats"], 0, "ball בלי s = כדור אחד", TXT("1")),
]))

C.append(("There is / are · this / these", [TH], [
 Q(TH, "There ___ a cat.", ["is", "are", "am", "be"], 0, "אחד ← There is", "🐈"),
 Q(TH, "There ___ two dogs.", ["are", "is", "am", "be"], 0, "יותר מאחד ← There are", COUNT(("🐕", 2))),
 Q(TH, "There ___ three apples.", ["are", "is", "am", "be"], 0, "יותר מאחד ← There are", COUNT(("🍎", 3))),
 Q(TH, "There ___ one sun.", ["is", "are", "am", "be"], 0, "אחד ← There is", "☀️"),
 Q(TH, "How many ducks? There are ___.", ["four", "three", "five", "two"], 0, "סופרים: four = 4", COUNT(("🦆", 4))),
 Q(TH, "There are five ___.", ["stars", "star", "a star", "stares"], 0, "five ← stars עם s", COUNT(("⭐", 5))),
 Q(TH, "___ is my bag.", ["This", "These", "They", "We"], 0, "אחד ← This is", ROW("👉", "🎒")),
 Q(TH, "___ are my pencils.", ["These", "This", "Is", "It"], 0, "כמה ← These are", COUNT(("✏️", 3))),
 Q(TH, "This ___ a book.", ["is", "are", "am", "have"], 0, "This ← is", "📕"),
 Q(TH, "These ___ my shoes.", ["are", "is", "am", "has"], 0, "These ← are", COUNT(("👟", 2))),
 Q(TH, "Which is correct?", ["These are cats.", "These is cats.", "This are cats.", "This cats are."], 0, "These ← are + cats עם s", COUNT(("🐈", 3))),
 Q(TH, "יש (דבר אחד) = ?", ["There is", "There are", "These are", "I am"], 0, "יש (אחד) = There is", "🐈"),
]))

# ───────────── Where? in · on · under · next to ─────────────
def ON(top, base):   "the first thing sitting on the second";   return [(base, 50, 64, 50), (top, 50, 30, 28)]
def UNDER(low, top): "the first thing under the second";        return [(top, 50, 36, 52), (low, 50, 76, 22)]
def NEXT(a, b):      "two things side by side";                 return [(a, 32, 56, 36), (b, 68, 56, 36)]
def INSIDE(small, big): "the first thing inside the second";    return [(big, 50, 54, 60), (small, 52, 60, 28)]

C.append(("Where? in · on · under", [PR], [
 Q(PR, "The dog is ___ the box.", ["on", "under", "in", "next to"], 0, "הכלב על הקופסה ← on", ON("🐕", "📦")),
 Q(PR, "The ball is ___ the bed.", ["under", "on", "in", "next to"], 0, "הכדור מתחת למיטה ← under", UNDER("⚽", "🛏️")),
 Q(PR, "The fish is ___ the sea.", ["in", "on", "under", "next to"], 0, "הדג בתוך הים ← in", INSIDE("🐠", "🌊")),
 Q(PR, "The bird is ___ the car.", ["on", "in", "under", "next to"], 0, "הציפור על המכונית ← on", ON("🐦", "🚗")),
 Q(PR, "The boy is ___ the umbrella.", ["under", "on", "in", "next to"], 0, "הילד מתחת למטרייה ← under", UNDER("👦", "☂️")),
 Q(PR, "The boy is ___ the bath.", ["in", "on", "under", "next to"], 0, "הילד בתוך האמבטיה ← in", "🛀"),
 Q(PR, "Dad is ___ bed. He is sleeping.", ["in", "under", "next to", "up"], 0, "שוכבים בתוך המיטה ← in bed", "🛌"),
 Q(PR, "What is under the book?", ["a notebook", "a cup", "a pen", "a ball"], 0, "המחברת מתחת לספר = notebook", UNDER("📓", "📕")),
 Q(PR, "What is on the book?", ["scissors", "a pen", "a cup", "a ball"], 0, "המספריים על הספר = scissors", ON("✂️", "📕")),
 Q(PR, "Where is the cat? It is ___ the bed.", ["under", "on", "in", "next to"], 0, "החתול מתחת למיטה ← under", UNDER("🐈", "🛏️")),
]))

C.append(("Where is it? next to · in · on · under", [PR], [
 Q(PR, "The dog is ___ the cat.", ["next to", "on", "under", "in"], 0, "הכלב ליד החתול ← next to", NEXT("🐕", "🐈")),
 Q(PR, "ליד = ?", ["next to", "under", "on", "in"], 0, "ליד = next to (העץ ליד הבית)", NEXT("🌳", "🏠")),
 Q(PR, "What is on the flower?", ["a bee", "a bird", "a frog", "a fish"], 0, "הדבורה על הפרח = bee", ON("🐝", "🌻")),
 Q(PR, "Where is the ball?", ["under the bed", "on the bed", "in the bag", "on the dog"], 0, "הכדור מתחת למיטה ← under the bed", UNDER("⚽", "🛏️")),
 Q(PR, "Where is the bird?", ["on the house", "in the house", "under the house", "in the sea"], 0, "הציפור על הבית ← on the house", ON("🐦", "🏠")),
 Q(PR, "Where is the fish?", ["in the sea", "on the bed", "under the car", "in the bag"], 0, "הדג בתוך הים ← in the sea", INSIDE("🐠", "🌊")),
 Q(PR, "בתוך הילקוט = {The book is ___ the bag.}", ["in", "on", "under", "next to"], 0, "בתוך = in", ROW("📕", "🎒")),
 Q(PR, "What is on the bread?", ["cheese", "an egg", "a cake", "honey"], 0, "הגבינה על הלחם = cheese", ON("🧀", "🍞")),
 Q(PR, "What is next to the tree?", ["a giraffe", "a cat", "a dog", "a bird"], 0, "הג'ירפה ליד העץ = giraffe", NEXT("🦒", "🌳")),
 Q(PR, "Where is Dan? He is ___ the tree.", ["under", "on", "in", "next to"], 0, "דן יושב מתחת לעץ ← under", UNDER("👦", "🌳")),
]))

# ───────────── Question words ─────────────
C.append(("What · Where · Who · How old", [QW], [
 Q(QW, "___ is your name? – My name is Tom.", ["What", "Where", "Who", "How old"], 0, "שואלים על שם ← What", ROW("👦", "📛")),
 Q(QW, "___ is the cat? It is under the bed.", ["Where", "What", "Who", "How old"], 0, "שואלים על מקום ← Where", UNDER("🐈", "🛏️")),
 Q(QW, "___ is she? She is my sister.", ["Who", "Where", "What", "How old"], 0, "שואלים על אדם ← Who", "👧"),
 Q(QW, "___ are you? I am nine.", ["How old", "Who", "Where", "What"], 0, "שואלים על גיל ← How old", ROW("👦", "9️⃣")),
 Q(QW, "___ is this? It is a pencil.", ["What", "Who", "Where", "How old"], 0, "שואלים על דבר ← What", ROW("👉", "✏️")),
 Q(QW, "___ is my bag? It is on the chair.", ["Where", "Who", "What", "How old"], 0, "שואלים על מקום ← Where", "🎒"),
 Q(QW, "___ is he? He is my grandpa.", ["Who", "What", "Where", "How old"], 0, "שואלים על אדם ← Who", "👴"),
 Q(QW, "{Where} = ?", ["איפה", "מי", "מה", "בן כמה"], 0, "where = איפה (שואלים על מקום)", ROW("👦", "📦", "🗺️", "🎂")),
 Q(QW, "{Who} = ?", ["מי", "מה", "איפה", "בן כמה"], 0, "who = מי (שואלים על אדם)", ROW("👦", "📦", "🗺️", "🎂")),
 Q(QW, "מה = ?", ["What", "Who", "Where", "How old"], 0, "מה = What (What is it?)", TXT("?")),
]))

C.append(("Questions & answers", [QW], [
 Q(QW, "What is your name?", ["I'm Dan.", "I'm nine.", "In the park.", "My sister."], 0, "שאלו על שם ← I'm Dan", "👦"),
 Q(QW, "How old are you?", ["I'm ten.", "I'm Dan.", "At school.", "My mother."], 0, "שאלו על גיל ← I'm ten", "👦"),
 Q(QW, "Where is the dog?", ["Under the bed.", "It's brown.", "It's Max.", "I'm nine."], 0, "שאלו על מקום ← Under the bed", UNDER("🐕", "🛏️")),
 Q(QW, "Who is she?", ["My mother.", "In the house.", "She is happy.", "A pencil."], 0, "שאלו מי ← עונים באדם", "👩"),
 Q(QW, "What is it?", ["It's a ruler.", "It's Monday.", "It's in Haifa.", "It's ten."], 0, "שאלו מה ← עונים בדבר", "📏"),
 Q(QW, "Who is he?", ["My father.", "In the car.", "He is tall.", "A book."], 0, "שאלו מי ← עונים באדם", "👨"),
 Q(QW, "How old is Grandpa?", ["He is seventy.", "He is tall.", "At home.", "My grandpa."], 0, "שאלו על גיל ← עונים במספר", "👴"),
 Q(QW, "Where do you live?", ["In Tel Aviv.", "I'm Dana.", "I'm ten.", "My mom."], 0, "שאלו איפה ← עונים במקום", "👧"),
 Q(QW, "Which question? Answer: Dana.", ["What's your name?", "Where is Dana?", "Who is he?", "What is it?"], 0, "Dana הוא שם ← What's your name?", "👧"),
 Q(QW, "Which question? Answer: In the bag.", ["Where is it?", "Who is he?", "What's your name?", "Who are you?"], 0, "In the bag הוא מקום ← Where", "🎒"),
 Q(QW, "Which question? Answer: My brother.", ["Who is he?", "Where is he?", "What is it?", "Where are you?"], 0, "My brother הוא אדם ← Who", "👦"),
]))

# ───────────── Reading (three very short passages) ─────────────
P1 = """
My Family

Hi! My name is Tom. I am nine years old. I live in a big house with my family. I have a mother, a father and a little sister. My sister's name is Mia. She is five. We have a dog. His name is Max. Max is brown and white. He likes to run and play in the garden. My grandma and grandpa live near us. On Saturday we go to their house. Grandma makes a big chocolate cake. I like cake! I am very happy with my family.
"""
C.append(("📖 Reading: My Family", [RD], [
 Q(RD, "How old is Tom?", ["nine", "five", "ten", "seven"], 0, "I am nine years old", "👦"),
 Q(RD, "Who is Mia?", ["his sister", "his mother", "his dog", "his grandma"], 0, "My sister's name is Mia", "👧"),
 Q(RD, "How old is Mia?", ["five", "nine", "six", "four"], 0, "She is five", ROW("👧", "🎂")),
 Q(RD, "What is Max?", ["a dog", "a cat", "a boy", "a bird"], 0, "We have a dog. His name is Max", TXT("Max")),
 Q(RD, "What color is Max?", ["brown and white", "black and white", "all black", "all white"], 0, "Max is brown and white", "🎨"),
 Q(RD, "Where does Max play?", ["in the garden", "in the house", "at school", "in the park"], 0, "play in the garden = בגינה", "🐕"),
 Q(RD, "When do they go to Grandma's?", ["on Saturday", "on Sunday", "on Monday", "every day"], 0, "On Saturday we go to their house", "📅"),
 Q(RD, "What does Grandma make?", ["a cake", "a pizza", "a salad", "bread"], 0, "Grandma makes a big chocolate cake", "👵"),
 Q(RD, "How does Tom feel?", ["happy", "sad", "angry", "scared"], 0, "I am very happy", "👪"),
], P1))

P2 = """
At School

It is Monday. Dana is at school. Her classroom is big and nice. There are twenty children in her class. Their teacher's name is Ruth. In the English lesson, Ruth says, "Open your books, please." Dana opens her book. There is a picture of a big green frog in it. "Point to the frog," says Ruth. Dana can read the word "frog"! In her bag, Dana has three pencils, a ruler and a red notebook. At ten o'clock the children eat. Dana eats a sandwich and an apple. She drinks water.
"""
C.append(("📖 Reading: At School", [RD], [
 Q(RD, "What day is it?", ["Monday", "Sunday", "Friday", "Tuesday"], 0, "It is Monday", "📅"),
 Q(RD, "How many children are in the class?", ["twenty", "twelve", "ten", "two"], 0, "twenty children = 20 ילדים", "🏫"),
 Q(RD, "Who is Ruth?", ["the teacher", "Dana's sister", "Dana's mom", "a girl"], 0, "Their teacher's name is Ruth", "🏫"),
 Q(RD, "What does Ruth say first?", ["Open your books", "Close the door", "Sit down", "Stand up"], 0, "Open your books, please", "📖"),
 Q(RD, "What is in the picture?", ["a frog", "a dog", "a fish", "a cat"], 0, "a picture of a big green frog", "🖼️"),
 Q(RD, "What color is the frog?", ["green", "red", "brown", "yellow"], 0, "a big green frog", "🖼️"),
 Q(RD, "How many pencils does Dana have?", ["three", "two", "one", "four"], 0, "three pencils = 3 עפרונות", "🎒"),
 Q(RD, "What color is Dana's notebook?", ["red", "green", "blue", "yellow"], 0, "a red notebook", "📓"),
 Q(RD, "What does Dana eat?", ["a sandwich", "pizza", "a cake", "rice"], 0, "Dana eats a sandwich and an apple", "🍽️"),
 Q(RD, "What does Dana drink?", ["water", "milk", "juice", "tea"], 0, "She drinks water", "🥤"),
], P2))

P3 = """
Sam's Week

Sam is ten. He likes sports. On Sunday he swims in the pool. On Monday he plays football with his friends. On Tuesday he can't play, because he has a lot of homework. On Wednesday he plays basketball. On Thursday he rides his bike in the park. On Friday he helps his mom in the kitchen. They make pizza. On Saturday Sam is tired. He sits on the sofa and reads a book about animals. His favorite animal is the tiger. "Tigers are big and strong," he says. "And they can swim, too!"
"""
C.append(("📖 Reading: Sam's Week", [RD], [
 Q(RD, "How old is Sam?", ["ten", "nine", "twelve", "two"], 0, "Sam is ten", "👦"),
 Q(RD, "What does Sam do on Sunday?", ["swims", "reads", "plays football", "rides his bike"], 0, "On Sunday he swims in the pool", TXT("Sunday")),
 Q(RD, "When does Sam play football?", ["on Monday", "on Sunday", "on Friday", "on Wednesday"], 0, "On Monday he plays football", "⚽"),
 Q(RD, "Why can't Sam play on Tuesday?", ["homework", "he is sick", "it rains", "he is sad"], 0, "he has a lot of homework", TXT("Tuesday")),
 Q(RD, "Where does Sam ride his bike?", ["in the park", "at school", "in the pool", "at home"], 0, "he rides his bike in the park", "🚲"),
 Q(RD, "What do Sam and Mom make?", ["pizza", "a cake", "salad", "bread"], 0, "They make pizza", ROW("👩", "👦", "🍳")),
 Q(RD, "How does Sam feel on Saturday?", ["tired", "hungry", "angry", "scared"], 0, "On Saturday Sam is tired", TXT("Saturday")),
 Q(RD, "What is Sam's favorite animal?", ["the tiger", "the lion", "the dog", "the cat"], 0, "His favorite animal is the tiger", "📖"),
 Q(RD, "What can tigers do?", ["swim", "fly", "read", "talk"], 0, "they can swim, too", "🐅"),
], P3))

# ───────────── Review ─────────────
C.append(("חזרה כללית", [SR, VW, DG, AB, FF, CN, BC, AN, FD, SC, DY, IA, TH], [
 Q(SR, "Which word rhymes with king?", ["ring", "kite", "kid", "rain"], 0, "king – ring: נגמרות ב-ing", PW("👑", "king")),
 Q(VW, "r_d (אדום)", ["e", "a", "i", "o"], 0, "r-e-d = red", "🔴"),
 Q(DG, "_ell (צדף)", ["sh", "ch", "th", "s"], 0, "sh-ell = shell", "🐚"),
 Q(AB, "What comes after K?", ["L", "J", "M", "N"], 0, "J K L", TXT("J, K, ?")),
 Q(FF, "My father's father is my ___.", ["grandpa", "grandma", "brother", "baby"], 0, "אבא של אבא = סבא = grandpa", ROW("👨", "👦")),
 Q(FF, "She is ___.", ["scared", "happy", "hungry", "tired"], 0, "מפחדת = scared", "😱"),
 Q(CN, "What color is a banana?", ["yellow", "blue", "purple", "black"], 0, "בננה צהובה = yellow", "🍌"),
 Q(CN, "17 = ?", ["seventeen", "seventy", "seven", "eleven"], 0, "17 = seventeen", TXT("17")),
 Q(BC, "I have two ___.", ["ears", "noses", "mouths", "heads"], 0, "שתי אוזניים = two ears", COUNT(("👂", 2))),
 Q(BC, "שמלה = ?", ["dress", "desk", "shirt", "sock"], 0, "שמלה = dress", "👗"),
 Q(AN, "What is this?", ["lion", "tiger", "bear", "horse"], 0, "אריה = lion", "🦁"),
 Q(FD, "Which is NOT food?", ["shoe", "bread", "egg", "rice"], 0, "נעל לא אוכלים!", ROW("👟", "🍞", "🥚", "🍚")),
 Q(SC, "סגרו את הספר = {___ your book.}", ["Close", "Open", "Read", "Draw"], 0, "לסגור = close", "📕"),
 Q(DY, "Today is Sunday. Tomorrow is ___.", ["Monday", "Saturday", "Tuesday", "Friday"], 0, "אחרי Sunday בא Monday", TXT("Sunday → ?")),
 Q(IA, "I ___ ride a bike.", ["can", "am", "like", "have"], 0, "I can ride = אני יודע לרכוב", "🚲"),
 Q(IA, "Which is correct?", ["I am nine.", "I is nine.", "I are nine.", "I has nine."], 0, "I ← am", ROW("🎂", "9️⃣")),
 Q(TH, "one bus, two ___", ["buses", "bus", "buss", "a bus"], 0, "אחרי s מוסיפים es", COUNT(("🚌", 2))),
 Q(TH, "There ___ two cats.", ["are", "is", "am", "be"], 0, "יותר מאחד ← There are", COUNT(("🐈", 2))),
]))

# station type on the map
KINDS = {c[0]: "abc" for c in C if c[2][0][0] in (SR, VW, ME, DG) or c[0].startswith("ABC")}
KINDS.update({c[0]: "gram" for c in C if c[2][0][0] in (IA, DL, HS, TH, PR, QW)})
KINDS.update({c[0]: "word" for c in C if c[2][0][0] in (GR, FF, CN, BC, AN, FD, SC, DY)})
KINDS["חזרה כללית"] = "rev"

# The year's target words – every one must be a correct answer somewhere (build_set.py checks).
WORD_LIST = """I|you|he|she|we|they|my|yes|no|and|at|up|
mother|father|brother|sister|grandma|grandpa|baby|family|happy|sad|angry|tired|hungry|thirsty|scared|
red|blue|green|yellow|purple|pink|black|white|brown|orange|
one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|
nose|ear|eye|mouth|feet|hand|leg|arm|teeth|finger|head|shirt|dress|pants|sock|shoe|hat|scarf|coat|
monkey|elephant|giraffe|cow|horse|rabbit|frog|sheep|bear|mouse|bee|bird|fish|hen|duck|dog|cat|lion|
banana|apple|bread|cheese|milk|egg|cake|carrot|tomato|water|pizza|ice cream|cucumber|grapes|sandwich|honey|
pencil|ruler|scissors|bag|book|notebook|teacher|school|pen|crayon|door|open|close|sit|stand|read|look|be quiet|hand|
Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday""".replace("\n", "").split("|")
WORD_LIST = list(dict.fromkeys(WORD_LIST))
