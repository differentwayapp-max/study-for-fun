# Practice set: English, grade 4 (כיתה ד') – the whole year, foundation level (Israeli curriculum, Band I / pre-A1):
# sounds and rhymes, short vowels, sh · ch · th, ABC (light) and sight words, the core vocabulary
# (family, feelings, colors, numbers 1–20, body, clothes, animals, food, school things, classroom instructions,
# days of the week), short sentences (I am / have / like / can, there is / are, this / these, plurals -s)
# and three very short reading passages.
# Organised by fine topics (≈20 questions each) so a parent can tick only what the test covers.
# Run: python3 -I tools/build_set.py tools/sets/en4.py
import re

SR, VW, DG, AB = "Rhymes & sounds", "Short vowels", "sh · ch · th", "ABC & sight words"
FF, CN, BC, AN, FD = "Family & feelings", "Colors & numbers", "Body & clothes", "Animals", "Food"
SC, DY, IA, TH, RD = "School & instructions", "Days of the week", "I am · have · like · can", "There is · this · plurals", "Reading"

SET = dict(name="English ד' – full year", grade=3, subject="אנגלית",
           title="Sounds · Words · Short sentences · Reading",
           desc="אנגלית לכיתה ד' – כל השנה: חרוזים וצלילים, תנועות קצרות, sh ch th, מילים בסיסיות, משפטים קצרים וקטעי קריאה קצרים",
           desc_en="Grade 4 English, the whole year: rhymes and sounds, short vowels, sh ch th, core words, short sentences and short reading passages",
           tags=["Rhymes", "Short vowels", "sh ch th", "Sight words", "Family", "Colors & numbers", "Body & clothes",
                 "Animals & food", "Days", "I am / I can", "There is / are", "Reading"],
           examDate="", dailyGoal=2, perRound=10,
           topics=[SR, VW, DG, AB, FF, CN, BC, AN, FD, SC, DY, IA, TH, RD])
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
C.append(("Rhymes: cat – hat", [SR], [
 Q(SR, "Which word rhymes with cat?", ["hat", "cup", "dog", "sun"], 0, "cat – hat: שתיהן נגמרות ב-at", PW("🐈", "cat")),
 Q(SR, "Which word rhymes with dog?", ["frog", "duck", "pig", "bed"], 0, "dog – frog: שתיהן נגמרות ב-og", PW("🐕", "dog")),
 Q(SR, "Which word rhymes with sun?", ["run", "sit", "bus", "ten"], 0, "sun – run: שתיהן נגמרות ב-un", PW("☀️", "sun")),
 Q(SR, "Which word rhymes with pen?", ["hen", "pin", "cup", "pan"], 0, "pen – hen: שתיהן נגמרות ב-en", PW("🖊️", "pen")),
 Q(SR, "Which word rhymes with bed?", ["red", "bad", "bee", "big"], 0, "bed – red: שתיהן נגמרות ב-ed", PW("🛏️", "bed")),
 Q(SR, "Which word rhymes with pig?", ["big", "bag", "pen", "dog"], 0, "pig – big: שתיהן נגמרות ב-ig", PW("🐖", "pig")),
 Q(SR, "Which word rhymes with box?", ["fox", "bus", "bag", "fish"], 0, "box – fox: שתיהן נגמרות ב-ox", PW("📦", "box")),
 Q(SR, "Which word rhymes with cake?", ["snake", "cat", "duck", "cup"], 0, "cake – snake: שתיהן נגמרות ב-ake", PW("🍰", "cake")),
 Q(SR, "Which word rhymes with moon?", ["spoon", "man", "mom", "map"], 0, "moon – spoon: שתיהן נגמרות ב-oon", PW("🌙", "moon")),
 Q(SR, "Which word does NOT rhyme?", ["dog", "cat", "hat", "bat"], 0, "cat, hat, bat נגמרות ב-at; dog לא", ROW("🐈", "🎩", "🦇", "🐕")),
 Q(SR, "Which word does NOT rhyme?", ["bus", "goat", "boat", "coat"], 0, "goat, boat, coat נגמרות ב-oat", ROW("🐐", "⛵", "🧥", "🚌")),
 Q(SR, "Which word does NOT rhyme?", ["pig", "ten", "hen", "pen"], 0, "ten, hen, pen נגמרות ב-en", ROW("🔟", "🐔", "🖊️", "🐖")),
]))

C.append(("Sounds: first & last", [SR], [
 Q(SR, "Which word starts like dog?", ["duck", "cat", "pig", "sun"], 0, "dog ו-duck מתחילות בצליל d", PW("🐕", "dog")),
 Q(SR, "Which word starts like sun?", ["sock", "bus", "cup", "nose"], 0, "sun ו-sock מתחילות בצליל s", PW("☀️", "sun")),
 Q(SR, "Which word starts like ball?", ["bed", "doll", "pen", "hat"], 0, "ball ו-bed מתחילות בצליל b", PW("⚽", "ball")),
 Q(SR, "Which word starts like fish?", ["fox", "van", "pig", "ship"], 0, "fish ו-fox מתחילות בצליל f", PW("🐟", "fish")),
 Q(SR, "Which word starts with m?", ["milk", "nose", "hat", "sun"], 0, "milk מתחילה ב-m", BIG("m")),
 Q(SR, "What is the first sound in pen?", ["p", "b", "e", "n"], 0, "pen מתחילה בצליל p", PW("🖊️", "pen")),
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
 Q(DG, "Which word starts with ch?", ["chair", "shoe", "thumb", "cat"], 0, "ch-air = chair (כיסא)", BIG("ch")),
 Q(DG, "Which word starts with th?", ["three", "tree", "shoe", "chips"], 0, "three מתחילה ב-th; tree רק ב-t", BIG("th")),
 Q(DG, "Which word ends with sh?", ["fish", "fun", "chin", "shop"], 0, "fi-sh נגמרת ב-sh; shop מתחילה ב-sh", TXT("…sh")),
 Q(DG, "Which word ends with ch?", ["watch", "chop", "cat", "wash"], 0, "wat-ch נגמרת ב-ch", TXT("…ch")),
 Q(DG, "Which sound starts ship and shell?", ["sh", "s", "ch", "h"], 0, "sh-ip, sh-ell", ROW("🚢", "🐚")),
 Q(DG, "Which sound starts cheese and chips?", ["ch", "sh", "c", "th"], 0, "ch-eese, ch-ips", ROW("🧀", "🍟")),
 Q(DG, "Which sound starts three and thumb?", ["th", "t", "sh", "f"], 0, "th-ree, th-umb", ROW("3️⃣", "👍")),
 Q(DG, "Which word has th?", ["mouth", "mouse", "house", "much"], 0, "mou-th = פה", BIG("th")),
 Q(DG, "Read the sounds: sh – o – p", ["shop", "chop", "stop", "ship"], 0, "sh-o-p = shop (חנות)", TXT("sh-o-p")),
 Q(DG, "Read the sounds: ch – i – n", ["chin", "shin", "thin", "chip"], 0, "ch-i-n = chin (סנטר)", TXT("ch-i-n")),
]))

# ───────────── ABC & sight words ─────────────
C.append(("ABC: order & letters", [AB], [
 Q(AB, "What comes after D?", ["E", "F", "C", "B"], 0, "C D E", TXT("C, D, ?")),
 Q(AB, "What comes before M?", ["L", "N", "K", "O"], 0, "L M N", TXT("?, M, N")),
 Q(AB, "What comes between R and T?", ["S", "U", "Q", "P"], 0, "R S T", TXT("R, ?, T")),
 Q(AB, "האות הגדולה של {g}?", ["G", "Q", "J", "C"], 0, "g קטנה = G גדולה", BIG("g")),
 Q(AB, "האות הקטנה של {B}?", ["b", "d", "p", "q"], 0, "B גדולה = b קטנה", BIG("B")),
 Q(AB, "האות הקטנה של {R}?", ["r", "n", "h", "k"], 0, "R גדולה = r קטנה", BIG("R")),
 Q(AB, "Which word comes first in ABC order?", ["apple", "dog", "cat", "egg"], 0, "a לפני c, d, e", ROW("🍎", "🐕", "🐈", "🥚")),
 Q(AB, "Which word comes first in ABC order?", ["ball", "pen", "sun", "hat"], 0, "b לפני h, p, s", ROW("⚽", "🖊️", "☀️", "🎩")),
 Q(AB, "Which letter is a vowel?", ["e", "b", "t", "m"], 0, "התנועות: a e i o u", TXT("b, e, t, m")),
 Q(AB, "How many letters are in the ABC?", ["26", "24", "22", "20"], 0, "מ-A עד Z יש 26 אותיות", TXT("A B C … Z")),
]))

C.append(("Sight words", [AB], [
 Q(AB, "אני = ?", ["I", "you", "he", "we"], 0, "אני = I (תמיד באות גדולה)", "🙋"),
 Q(AB, "אתה / את = ?", ["you", "I", "we", "they"], 0, "אתה / את = you", "👉"),
 Q(AB, "הוא = ?", ["he", "she", "it", "we"], 0, "הוא = he", "👦"),
 Q(AB, "היא = ?", ["she", "he", "they", "it"], 0, "היא = she", "👧"),
 Q(AB, "אנחנו = ?", ["we", "they", "you", "he"], 0, "אנחנו = we", "👪"),
 Q(AB, "הם = ?", ["they", "we", "he", "she"], 0, "הם = they", ROW("👦", "👧", "👦")),
 Q(AB, "כן = ?", ["yes", "no", "and", "the"], 0, "כן = yes", "👍"),
 Q(AB, "לא = ?", ["no", "yes", "go", "so"], 0, "לא = no", "👎"),
 Q(AB, "חתול וכלב = {a cat ___ a dog}", ["and", "or", "is", "the"], 0, "ו... = and", ROW("🐈", "🐕")),
 Q(AB, "Look ___ the cat!", ["at", "on", "in", "up"], 0, "look at = תסתכל על", ROW("👀", "🐈")),
 Q(AB, "שלי = ?", ["my", "me", "you", "your"], 0, "שלי = my (my bag = התיק שלי)", ROW("🙋", "🎒")),
 Q(AB, "למעלה = ?", ["up", "down", "in", "on"], 0, "למעלה = up, למטה = down", "⬆️"),
]))

# ───────────── Family & feelings ─────────────
C.append(("My family", [FF], [
 Q(FF, "אמא = ?", ["mother", "father", "sister", "brother"], 0, "אמא = mother (mom)", "👩"),
 Q(FF, "אבא = ?", ["father", "mother", "brother", "baby"], 0, "אבא = father (dad)", "👨"),
 Q(FF, "אח = ?", ["brother", "sister", "father", "grandpa"], 0, "אח = brother", "👦"),
 Q(FF, "אחות = ?", ["sister", "brother", "mother", "grandma"], 0, "אחות = sister", "👧"),
 Q(FF, "סבתא = ?", ["grandma", "grandpa", "mother", "sister"], 0, "סבתא = grandma", "👵"),
 Q(FF, "סבא = ?", ["grandpa", "grandma", "father", "brother"], 0, "סבא = grandpa", "👴"),
 Q(FF, "תינוק = ?", ["baby", "boy", "girl", "brother"], 0, "תינוק = baby", "👶"),
 Q(FF, "My mother's mother is my ___.", ["grandma", "sister", "aunt", "baby"], 0, "אמא של אמא = סבתא = grandma", ROW("👵", "👩")),
 Q(FF, "Mom, Dad and me – we are a ___.", ["family", "school", "friend", "house"], 0, "משפחה = family", "👪"),
 Q(FF, "He is my ___.", ["brother", "sister", "mother", "grandma"], 0, "he = הוא ← brother", "👦"),
]))

C.append(("Feelings", [FF], [
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
 Q(CN, "What color is it?", ["red", "blue", "green", "black"], 0, "תות אדום = red", "🍓"),
 Q(CN, "What color is it?", ["purple", "yellow", "white", "pink"], 0, "ענבים סגולים = purple", "🍇"),
 Q(CN, "What color is it?", ["green", "red", "brown", "orange"], 0, "ברוקולי ירוק = green", "🥦"),
 Q(CN, "The sun is ___.", ["yellow", "blue", "black", "purple"], 0, "השמש צהובה = yellow", "☀️"),
 Q(CN, "The sky is ___.", ["blue", "red", "brown", "pink"], 0, "השמיים כחולים = blue", "🌤️"),
 Q(CN, "Snow is ___.", ["white", "black", "green", "red"], 0, "שלג לבן = white", "⛄"),
 Q(CN, "ורוד = ?", ["pink", "purple", "red", "white"], 0, "ורוד = pink", "🌸"),
 Q(CN, "שחור = ?", ["black", "brown", "blue", "white"], 0, "שחור = black", "⚫"),
 Q(CN, "חום = ?", ["brown", "black", "gray", "orange"], 0, "חום = brown", "🍫"),
 Q(CN, "Red and yellow make ___.", ["orange", "green", "purple", "brown"], 0, "אדום + צהוב = כתום", ROW("🔴", "➕", "💛")),
 Q(CN, "Blue and yellow make ___.", ["green", "orange", "pink", "black"], 0, "כחול + צהוב = ירוק", ROW("🔵", "➕", "💛")),
]))

C.append(("Numbers 1–10", [CN], [
 Q(CN, "How many?", ["seven", "six", "eight", "five"], 0, "סופרים: seven = 7", COUNT(("⭐", 7))),
 Q(CN, "How many?", ["three", "tree", "two", "four"], 0, "three = 3 (tree = עץ)", COUNT(("🍎", 3))),
 Q(CN, "How many?", ["one", "two", "ten", "nine"], 0, "one = 1", COUNT(("🎈", 1))),
 Q(CN, "How many?", ["nine", "five", "nineteen", "six"], 0, "סופרים: nine = 9", COUNT(("🌸", 5), ("🌸", 4))),
 Q(CN, "How many eyes do you have?", ["two", "one", "three", "four"], 0, "שתי עיניים = two eyes", "👀"),
 Q(CN, "6 = ?", ["six", "sixteen", "seven", "five"], 0, "6 = six", TXT("6")),
 Q(CN, "8 = ?", ["eight", "eighteen", "nine", "three"], 0, "8 = eight", TXT("8")),
 Q(CN, "How many legs does a dog have?", ["four", "two", "six", "eight"], 0, "לכלב 4 רגליים = four", "🐕"),
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
 Q(BC, "אף = ?", ["nose", "ear", "eye", "mouth"], 0, "אף = nose", "👃"),
 Q(BC, "This is my ___.", ["ear", "eye", "nose", "hand"], 0, "אוזן = ear", "👂"),
 Q(BC, "I see with my ___.", ["eyes", "ears", "nose", "legs"], 0, "רואים בעיניים = eyes", "👀"),
 Q(BC, "I hear with my ___.", ["ears", "eyes", "hands", "feet"], 0, "שומעים באוזניים = ears", ROW("👂", "🎵")),
 Q(BC, "I eat with my ___.", ["mouth", "nose", "ears", "eyes"], 0, "אוכלים בפה = mouth", ROW("👄", "🍎")),
 Q(BC, "I walk with my ___.", ["feet", "ears", "eyes", "nose"], 0, "הולכים ברגליים = feet", ROW("🚶", "🦶")),
 Q(BC, "יד = ?", ["hand", "head", "leg", "foot"], 0, "יד (כף יד) = hand", "✋"),
 Q(BC, "רגל = ?", ["leg", "arm", "hand", "ear"], 0, "רגל = leg", "🦵"),
 Q(BC, "זרוע = ?", ["arm", "leg", "ear", "nose"], 0, "זרוע = arm", "💪"),
 Q(BC, "שיניים = ?", ["teeth", "feet", "eyes", "ears"], 0, "שן = tooth, שיניים = teeth", "🦷"),
 Q(BC, "I have ten ___.", ["fingers", "eyes", "ears", "noses"], 0, "10 אצבעות = ten fingers", COUNT(("🖐️", 2))),
]))

C.append(("Clothes", [BC], [
 Q(BC, "חולצה = ?", ["shirt", "skirt", "shoes", "socks"], 0, "חולצה = shirt", "👕"),
 Q(BC, "This is a ___.", ["dress", "shirt", "coat", "hat"], 0, "שמלה = dress", "👗"),
 Q(BC, "These are my ___.", ["pants", "socks", "shoes", "hats"], 0, "מכנסיים = pants", "👖"),
 Q(BC, "גרביים = ?", ["socks", "shoes", "shirts", "hats"], 0, "גרביים = socks", "🧦"),
 Q(BC, "נעליים = ?", ["shoes", "socks", "hats", "coats"], 0, "נעליים = shoes", COUNT(("👟", 2))),
 Q(BC, "כובע = ?", ["hat", "cat", "coat", "bag"], 0, "כובע = hat", "🧢"),
 Q(BC, "צעיף = ?", ["scarf", "shirt", "skirt", "sock"], 0, "צעיף = scarf", "🧣"),
 Q(BC, "It's cold. Put on your ___.", ["coat", "shorts", "swimsuit", "sandals"], 0, "קר ← מעיל = coat", ROW("❄️", "🥶")),
 Q(BC, "I wear gloves on my ___.", ["hands", "feet", "head", "ears"], 0, "כפפות על הידיים = hands", "🧤"),
 Q(BC, "I wear a hat on my ___.", ["head", "hand", "foot", "leg"], 0, "כובע על הראש = head", "👒"),
]))

# ───────────── Animals ─────────────
C.append(("Animals: what is it?", [AN], [
 Q(AN, "What is this?", ["monkey", "lion", "dog", "cow"], 0, "קוף = monkey", "🐒"),
 Q(AN, "What is this?", ["elephant", "horse", "giraffe", "bear"], 0, "פיל = elephant", "🐘"),
 Q(AN, "What is this?", ["giraffe", "zebra", "horse", "elephant"], 0, "ג'ירפה = giraffe", "🦒"),
 Q(AN, "פרה = ?", ["cow", "horse", "sheep", "pig"], 0, "פרה = cow", "🐄"),
 Q(AN, "סוס = ?", ["horse", "cow", "dog", "house"], 0, "סוס = horse (house = בית)", "🐎"),
 Q(AN, "This is a ___.", ["rabbit", "mouse", "cat", "dog"], 0, "ארנב = rabbit", "🐇"),
 Q(AN, "This is a ___.", ["frog", "fish", "duck", "bird"], 0, "צפרדע = frog", "🐸"),
 Q(AN, "This is a ___.", ["sheep", "cow", "pig", "horse"], 0, "כבשה = sheep", "🐑"),
 Q(AN, "דוב = ?", ["bear", "bird", "bee", "lion"], 0, "דוב = bear", "🐻"),
 Q(AN, "עכבר = ?", ["mouse", "house", "horse", "cat"], 0, "עכבר = mouse", "🐭"),
 Q(AN, "דבורה = ?", ["bee", "bird", "bear", "frog"], 0, "דבורה = bee", "🐝"),
]))

C.append(("Animals: what can they do?", [AN], [
 Q(AN, "Which animal can fly?", ["bird", "dog", "cow", "fish"], 0, "ציפור עפה = bird", ROW("🐦", "🐕", "🐄", "🐟")),
 Q(AN, "Which animal lives in the sea?", ["fish", "cow", "horse", "lion"], 0, "דג חי בים = fish", "🌊"),
 Q(AN, "A cow gives us ___.", ["milk", "eggs", "bread", "water"], 0, "פרה נותנת חלב = milk", "🐄"),
 Q(AN, "A hen gives us ___.", ["eggs", "milk", "cheese", "apples"], 0, "תרנגולת מטילה ביצים = eggs", "🐔"),
 Q(AN, "Which animal says \"moo\"?", ["cow", "dog", "cat", "duck"], 0, "הפרה עושה moo", TXT("Moo!")),
 Q(AN, "Which animal says \"woof\"?", ["dog", "cat", "cow", "sheep"], 0, "הכלב עושה woof", TXT("Woof!")),
 Q(AN, "Which animal says \"meow\"?", ["cat", "dog", "duck", "pig"], 0, "החתול עושה meow", TXT("Meow!")),
 Q(AN, "Which animal is very big?", ["elephant", "mouse", "bee", "frog"], 0, "הפיל גדול מאוד", ROW("🐘", "🐭", "🐝", "🐸")),
 Q(AN, "תרנגולת = ?", ["hen", "pen", "horse", "duck"], 0, "תרנגולת = hen", "🐔"),
 Q(AN, "ברווז = ?", ["duck", "dog", "frog", "fish"], 0, "ברווז = duck", "🦆"),
 Q(AN, "Which animal lives on a farm?", ["cow", "lion", "tiger", "monkey"], 0, "פרה חיה בחווה = cow", "🚜"),
]))

# ───────────── Food ─────────────
C.append(("Food words", [FD], [
 Q(FD, "This is a ___.", ["banana", "carrot", "lemon", "potato"], 0, "בננה = banana", "🍌"),
 Q(FD, "This is an ___.", ["apple", "egg", "orange", "onion"], 0, "תפוח = apple", "🍎"),
 Q(FD, "לחם = ?", ["bread", "milk", "cake", "rice"], 0, "לחם = bread", "🍞"),
 Q(FD, "גבינה = ?", ["cheese", "chips", "cherry", "cake"], 0, "גבינה = cheese", "🧀"),
 Q(FD, "חלב = ?", ["milk", "water", "juice", "bread"], 0, "חלב = milk", "🥛"),
 Q(FD, "ביצה = ?", ["egg", "leg", "bag", "cake"], 0, "ביצה = egg", "🥚"),
 Q(FD, "עוגה = ?", ["cake", "cookie", "candy", "bread"], 0, "עוגה = cake", "🍰"),
 Q(FD, "גזר = ?", ["carrot", "cucumber", "tomato", "banana"], 0, "גזר = carrot", "🥕"),
 Q(FD, "This is a ___.", ["tomato", "potato", "cherry", "lemon"], 0, "עגבנייה = tomato", "🍅"),
 Q(FD, "מים = ?", ["water", "milk", "juice", "rice"], 0, "מים = water", "💧"),
 Q(FD, "This is a ___.", ["pizza", "salad", "sandwich", "cake"], 0, "פיצה = pizza", "🍕"),
 Q(FD, "גלידה = ?", ["ice cream", "cake", "cookie", "candy"], 0, "גלידה = ice cream", "🍦"),
]))

C.append(("Food: fruit, drinks, who eats what", [FD], [
 Q(FD, "Which is a drink?", ["milk", "bread", "egg", "cake"], 0, "חלב שותים = drink", ROW("🥛", "🍞", "🥚", "🍰")),
 Q(FD, "Which is a fruit?", ["banana", "carrot", "bread", "cheese"], 0, "בננה היא פרי = fruit", ROW("🍌", "🥕", "🍞", "🧀")),
 Q(FD, "Which is a vegetable?", ["cucumber", "apple", "banana", "cake"], 0, "מלפפון הוא ירק = cucumber", ROW("🥒", "🍎", "🍌", "🍰")),
 Q(FD, "Which is NOT a drink?", ["pizza", "milk", "water", "juice"], 0, "פיצה אוכלים, לא שותים", ROW("🍕", "🥛", "💧")),
 Q(FD, "תפוז = ?", ["orange", "apple", "banana", "grapes"], 0, "תפוז = orange", "🍊"),
 Q(FD, "ענבים = ?", ["grapes", "cherries", "apples", "plums"], 0, "ענבים = grapes", "🍇"),
 Q(FD, "Monkeys like ___.", ["bananas", "milk", "pizza", "cheese"], 0, "קופים אוהבים בננות", "🐒"),
 Q(FD, "Rabbits like ___.", ["carrots", "fish", "pizza", "milk"], 0, "ארנבים אוהבים גזר", "🐇"),
 Q(FD, "Bees make ___.", ["honey", "milk", "eggs", "bread"], 0, "דבורים מכינות דבש = honey", "🐝"),
 Q(FD, "I'm hungry. Can I have a ___?", ["sandwich", "water", "juice", "milk"], 0, "רעב ← אוכלים כריך = sandwich", "🍽️"),
]))

# ───────────── School & instructions ─────────────
C.append(("School things", [SC], [
 Q(SC, "These are ___.", ["pencils", "rulers", "books", "bags"], 0, "עפרונות = pencils", COUNT(("✏️", 3))),
 Q(SC, "This is a ___.", ["ruler", "pencil", "book", "bag"], 0, "סרגל = ruler", "📏"),
 Q(SC, "מספריים = ?", ["scissors", "ruler", "pencil", "glue"], 0, "מספריים = scissors", "✂️"),
 Q(SC, "ילקוט = ?", ["bag", "book", "box", "pen"], 0, "ילקוט = (school) bag", "🎒"),
 Q(SC, "ספר = ?", ["book", "box", "bag", "bed"], 0, "ספר = book", "📕"),
 Q(SC, "מחברת = ?", ["notebook", "book", "pencil", "table"], 0, "מחברת = notebook", "📓"),
 Q(SC, "מורה = ?", ["teacher", "student", "mother", "friend"], 0, "מורה = teacher", "👩‍🏫"),
 Q(SC, "בית ספר = ?", ["school", "class", "house", "shop"], 0, "בית ספר = school", "🏫"),
 Q(SC, "I write with a ___.", ["pen", "book", "ruler", "bag"], 0, "כותבים בעט = pen", "🖊️"),
 Q(SC, "This is a ___.", ["crayon", "ruler", "book", "bag"], 0, "צבע (עפרון שעווה) = crayon", "🖍️"),
 Q(SC, "דלת = ?", ["door", "floor", "box", "desk"], 0, "דלת = door", "🚪"),
]))

C.append(("Classroom instructions", [SC], [
 Q(SC, "פתחו את הספר = {___ your book.}", ["Open", "Close", "Sit", "Stand"], 0, "לפתוח = open", "📖"),
 Q(SC, "סגרו את הדלת = {___ the door.}", ["Close", "Open", "Sit", "Look"], 0, "לסגור = close", "🚪"),
 Q(SC, "שבו! = {___ down!}", ["Sit", "Stand", "Look", "Open"], 0, "Sit down = שבו", "💺"),
 Q(SC, "קומו! = {___ up!}", ["Stand", "Sit", "Close", "Open"], 0, "Stand up = קומו", "🙋"),
 Q(SC, "Point to the ___.", ["door", "book", "bag", "pen"], 0, "Point to = הצביעו על", ROW("👉", "🚪")),
 Q(SC, "Listen = ?", ["תקשיבו", "תכתבו", "תקראו", "תשבו"], 0, "listen = להקשיב", "👂"),
 Q(SC, "Write = ?", ["תכתבו", "תקראו", "תקשיבו", "תציירו"], 0, "write = לכתוב", ROW("✍️", "📓")),
 Q(SC, "תקראו = ?", ["Read", "Write", "Draw", "Listen"], 0, "לקרוא = read", "📖"),
 Q(SC, "Draw = ?", ["תציירו", "תכתבו", "תקראו", "תסגרו"], 0, "draw = לצייר", ROW("🖍️", "🐈")),
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
 Q(IA, "I ___ happy.", ["am", "have", "is", "are"], 0, "I am happy = אני שמח", "😀"),
 Q(IA, "I ___ two cats.", ["have", "am", "is", "has"], 0, "יש לי = I have", COUNT(("🐈", 2))),
 Q(IA, "I ___ two brothers.", ["have", "am", "is", "has"], 0, "יש לי = I have", COUNT(("👦", 2))),
 Q(IA, "I ___ two eyes.", ["have", "am", "is", "has"], 0, "יש לי = I have", "👀"),
 Q(IA, "יש לי = ?", ["I have", "I am", "I like", "I can"], 0, "יש לי = I have", ROW("🙋", "🎒")),
 Q(IA, "I'm = ?", ["I am", "I have", "I can", "I like"], 0, "I'm = I am (אני)", TXT("I'm")),
 Q(IA, "Which is correct?", ["I am Dana.", "I is Dana.", "I are Dana.", "I has Dana."], 0, "I ← am", "👧"),
 Q(IA, "Which is correct?", ["I have pens.", "I has pens.", "I haves pens.", "I having pens."], 0, "I ← have", COUNT(("🖊️", 3))),
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
 Q(TH, "Which is only ONE thing?", ["ball", "balls", "pens", "cats"], 0, "ball בלי s = כדור אחד", "⚽"),
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
 Q(RD, "Where does Max play?", ["in the garden", "in the house", "at school", "in the park"], 0, "play in the garden = בגינה", "🏡"),
 Q(RD, "When do they go to Grandma?", ["on Saturday", "on Sunday", "on Monday", "every day"], 0, "On Saturday we go to their house", "📅"),
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
 Q(RD, "Why can't Sam play on Tuesday?", ["homework", "he is sick", "it rains", "he is sad"], 0, "he has a lot of homework", "📓"),
 Q(RD, "Where does Sam ride his bike?", ["in the park", "at school", "in the pool", "at home"], 0, "he rides his bike in the park", "🚲"),
 Q(RD, "What do Sam and Mom make?", ["pizza", "a cake", "salad", "bread"], 0, "They make pizza", ROW("👩", "👦", "🍳")),
 Q(RD, "How does Sam feel on Saturday?", ["tired", "hungry", "angry", "scared"], 0, "On Saturday Sam is tired", "🛋️"),
 Q(RD, "What is Sam's favorite animal?", ["the tiger", "the lion", "the dog", "the cat"], 0, "His favorite animal is the tiger", "📖"),
 Q(RD, "What can tigers do?", ["swim", "fly", "read", "talk"], 0, "they can swim, too", "🐅"),
], P3))

# ───────────── Review ─────────────
C.append(("חזרה כללית", [SR, VW, DG, AB, FF, CN, BC, AN, FD, SC, DY, IA, TH], [
 Q(SR, "Which word rhymes with king?", ["ring", "kite", "kid", "rain"], 0, "king – ring: נגמרות ב-ing", PW("🤴", "king")),
 Q(VW, "r_d (אדום)", ["e", "a", "i", "o"], 0, "r-e-d = red", "🔴"),
 Q(DG, "_ell (צדף)", ["sh", "ch", "th", "s"], 0, "sh-ell = shell", "🐚"),
 Q(AB, "What comes after K?", ["L", "J", "M", "N"], 0, "J K L", TXT("J, K, ?")),
 Q(FF, "My father's father is my ___.", ["grandpa", "grandma", "brother", "baby"], 0, "אבא של אבא = סבא = grandpa", ROW("👴", "👨")),
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
KINDS = {c[0]: "abc" for c in C if c[2][0][0] in (SR, VW, DG) or c[0].startswith("ABC")}
KINDS.update({c[0]: "gram" for c in C if c[2][0][0] in (IA, TH)})
KINDS.update({c[0]: "word" for c in C if c[2][0][0] in (FF, CN, BC, AN, FD, SC, DY) or c[0] == "Sight words"})
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
