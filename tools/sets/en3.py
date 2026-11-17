# Practice set: English, grade 3 (כיתה ג') – the first year of English (pre-A1):
# rhymes and first sounds, the ABC (letter names, letter sounds, capital & small, ABC order),
# vowel sounds (a e i o u), first reading of short CVC words, sight words, core vocabulary (family & body, colors & numbers 1–10,
# animals, food, school things), greetings and introductions, reading short sentences
# and short sentences / classroom instructions.
# Organised by fine topics (≈20 questions each) so a parent can tick only what the test covers.
# Run: python3 -I tools/build_set.py tools/sets/en3.py
import re

RH, LS, CS, AO = "Rhymes & first sounds", "Letter names & sounds", "Capital & small letters", "ABC order"
CV, SW, FB, CN = "Reading short words", "Sight words", "Family & body", "Colors & numbers 1–10"
AN, FD, SC, SI = "Animals", "Food", "School things", "Sentences & instructions"
VS, GR, RS = "Vowel sounds", "Greetings & introductions", "Reading sentences"

SET = dict(name="English ג'", grade=2, subject="אנגלית",
           title="ABC · First words · Short sentences",
           desc="אנגלית לכיתה ג' – שנה ראשונה: חרוזים וצלילים, שמות האותיות וצליליהן, צלילי התנועות, אותיות גדולות וקטנות, סדר ה-ABC, קריאת מילים קצרות, מילים ראשונות, ברכות והיכרות וקריאת משפטים קצרים",
           desc_en="Grade 3 English, the first year: rhymes and sounds, letter names and sounds, vowel sounds, capital and small letters, ABC order, reading short words, first words, greetings and introductions and reading short sentences",
           tags=["Rhymes", "Letters & sounds", "ABC order", "Short words", "Sight words", "Family & body",
                 "Colors & numbers", "Animals & food", "School", "I am / I have",
                 "Vowel sounds", "Hello & my name", "Reading sentences"],
           examDate="", dailyGoal=2, perRound=10,
           topics=[RH, LS, CS, AO, CV, SW, FB, CN, AN, FD, SC, SI, VS, GR, RS])
MAX_Q_WORDS = 8
ANSWER_IN_Q_OK = True    # letter / sound answers ("b", "a") are letters of the question's words; every item checked by hand


def W(s): return re.sub(r"\{([^}]*)\}", lambda m: "⁦" + m.group(1) + "⁩", s)
def Q(t, q, opts, ans, expl, sc): return (t, W(q), opts, ans, W(expl), sc)

def ROW(*es):
    """The things to choose from (or the things the question talks about), side by side."""
    n = len(es); s = min(40, 125 / n); step = min(92 / n, s / 1.6 * 1.35)
    return [(e, round(50 + (j - (n - 1) / 2) * step, 1), 52, round(s)) for j, e in enumerate(es)]

def PW(e, w):
    """The object on the left, its English word on a card on the right."""
    return [(e, 24, 52, 38), (w, 70, 52, round(min(26, 140 / len(w))))]

def BIG(ch): return [(ch, 50, 52, 64)]        # one big letter card


C = []

# ───────────── Rhymes & first sounds ─────────────
C.append(("Rhymes: cat – hat", [RH], [
 Q(RH, "Which word rhymes with cat?", ["hat", "cup", "dog", "sun"], 0, "cat – hat: שתיהן נגמרות ב-at", PW("🐈", "cat")),
 Q(RH, "Which word rhymes with dog?", ["frog", "pig", "bed", "cup"], 0, "dog – frog: שתיהן נגמרות ב-og", PW("🐕", "dog")),
 Q(RH, "Which word rhymes with sun?", ["fun", "sit", "bed", "map"], 0, "sun – fun: שתיהן נגמרות ב-un", PW("☀️", "sun")),
 Q(RH, "Which word rhymes with bed?", ["red", "bag", "big", "box"], 0, "bed – red: שתיהן נגמרות ב-ed", PW("🛏️", "bed")),
 Q(RH, "Which word rhymes with pig?", ["big", "pan", "pen", "dog"], 0, "pig – big: שתיהן נגמרות ב-ig", PW("🐖", "pig")),
 Q(RH, "Which word rhymes with hen?", ["ten", "hat", "hot", "sun"], 0, "hen – ten: שתיהן נגמרות ב-en", PW("🐔", "hen")),
 Q(RH, "Which word rhymes with box?", ["fox", "bus", "bag", "bed"], 0, "box – fox: שתיהן נגמרות ב-ox", PW("📦", "box")),
 Q(RH, "Which word rhymes with bug?", ["rug", "bus", "bag", "big"], 0, "bug – rug: שתיהן נגמרות ב-ug", PW("🐛", "bug")),
 Q(RH, "Which word does NOT rhyme?", ["dog", "cat", "hat", "bat"], 0, "cat, hat, bat נגמרות ב-at. dog לא", ROW("🐈", "🎩", "🦇", "🐕")),
 Q(RH, "Which word does NOT rhyme?", ["cup", "pen", "ten", "hen"], 0, "pen, ten, hen נגמרות ב-en. cup לא", ROW("🖊️", "🔟", "🐔", "☕")),
]))

C.append(("First sounds", [RH], [
 Q(RH, "Which word starts like ball?", ["bed", "doll", "pen", "hat"], 0, "ball ו-bed מתחילות בצליל b", PW("⚽", "ball")),
 Q(RH, "Which word starts like sun?", ["sock", "bus", "cup", "nose"], 0, "sun ו-sock מתחילות בצליל s", PW("☀️", "sun")),
 Q(RH, "Which word starts like milk?", ["map", "nap", "cap", "hat"], 0, "milk ו-map מתחילות בצליל m", PW("🥛", "milk")),
 Q(RH, "Which word starts like fish?", ["fox", "van", "pig", "dish"], 0, "fish ו-fox מתחילות בצליל f", PW("🐟", "fish")),
 Q(RH, "What is the first sound in dog?", ["d", "b", "g", "o"], 0, "dog מתחילה בצליל d", PW("🐕", "dog")),
 Q(RH, "What is the first sound in pen?", ["p", "b", "e", "n"], 0, "pen מתחילה בצליל p", PW("🖊️", "pen")),
 Q(RH, "What is the first sound in ten?", ["t", "d", "n", "e"], 0, "ten מתחילה בצליל t", PW("🔟", "ten")),
 Q(RH, "Which word starts with r?", ["red", "bed", "hat", "sun"], 0, "red מתחילה ב-r", BIG("r")),
 Q(RH, "Which two words start the same?", ["bus, bed", "cat, dog", "sun, pen", "hat, fish"], 0, "bus ו-bed מתחילות בצליל b", ROW("🚌", "🛏️", "🐈", "🐕")),
 Q(RH, "Which word starts like duck?", ["dog", "cup", "cap", "can"], 0, "duck ו-dog מתחילות בצליל d", PW("🦆", "duck")),
]))

# ───────────── Letter names & sounds ─────────────
C.append(("Letter names", [LS], [
 Q(LS, "איזו אות נקראת אֶם?", ["M", "N", "H", "W"], 0, "M נקראת אֶם", TXT("אֶם")),
 Q(LS, "איזו אות נקראת אֶן?", ["N", "M", "A", "E"], 0, "N נקראת אֶן", TXT("אֶן")),
 Q(LS, "איזו אות נקראת ג'יי?", ["J", "G", "Y", "I"], 0, "J נקראת ג'יי. G נקראת ג'י", TXT("ג'יי")),
 Q(LS, "איזו אות נקראת ג'י?", ["G", "J", "C", "Z"], 0, "G נקראת ג'י. J נקראת ג'יי", TXT("ג'י")),
 Q(LS, "איזו אות נקראת וַואי?", ["Y", "W", "V", "I"], 0, "Y נקראת וַואי", TXT("וַואי")),
 Q(LS, "איזו אות נקראת אַר?", ["R", "A", "L", "H"], 0, "R נקראת אַר", TXT("אַר")),
 Q(LS, "איזו אות נקראת אֶל?", ["L", "I", "E", "R"], 0, "L נקראת אֶל", TXT("אֶל")),
 Q(LS, "איך קוראים לאות {H}?", ["אֵייץ'", "אַר", "אֵיי", "אֶף"], 0, "H נקראת אֵייץ'", BIG("H")),
 Q(LS, "איך קוראים לאות {E}?", ["אִי", "אַיי", "אֵיי", "יוּ"], 0, "E נקראת אִי. I נקראת אַיי", BIG("E")),
 Q(LS, "איך קוראים לאות {I}?", ["אַיי", "אִי", "אֵיי", "וַואי"], 0, "I נקראת אַיי. E נקראת אִי", BIG("I")),
 Q(LS, "איך קוראים לאות {A}?", ["אֵיי", "אִי", "אַיי", "אוֹ"], 0, "A נקראת אֵיי", BIG("A")),
]))

C.append(("Letter sounds", [LS], [
 Q(LS, "איזה צליל עושה האות {B}?", ["ב", "ד", "פ", "מ"], 0, "B עושה ב, כמו ב-ball", BIG("B")),
 Q(LS, "איזה צליל עושה האות {M}?", ["מ", "נ", "ו", "ה"], 0, "M עושה מ, כמו ב-milk", BIG("M")),
 Q(LS, "איזה צליל עושה האות {S}?", ["ס", "ז", "צ", "ט"], 0, "S עושה ס, כמו ב-sun", BIG("S")),
 Q(LS, "איזה צליל עושה האות {D}?", ["ד", "ב", "ט", "ג"], 0, "D עושה ד, כמו ב-dog", BIG("D")),
 Q(LS, "איזה צליל עושה האות {L}?", ["ל", "ר", "נ", "י"], 0, "L עושה ל, כמו ב-lion", BIG("L")),
 Q(LS, "איזה צליל עושה האות {R}?", ["ר", "ל", "ה", "ו"], 0, "R עושה ר, כמו ב-red", BIG("R")),
 Q(LS, "איזו אות עושה את הצליל מ?", ["M", "N", "W", "H"], 0, "M עושה מ, כמו ב-mom", BIG("מ")),
 Q(LS, "איזו אות עושה את הצליל נ?", ["N", "M", "U", "H"], 0, "N עושה נ, כמו ב-nose", BIG("נ")),
 Q(LS, "איזו אות עושה את הצליל ה?", ["H", "A", "E", "R"], 0, "H עושה ה, כמו ב-hat", BIG("ה")),
 Q(LS, "איזו אות עושה את הצליל ז?", ["Z", "C", "J", "G"], 0, "Z עושה ז, כמו ב-zoo", BIG("ז")),
 Q(LS, "איזו אות עושה את הצליל י?", ["Y", "J", "G", "W"], 0, "Y עושה י, כמו ב-yes", BIG("י")),
]))

# ───────────── Capital & small letters ─────────────
C.append(("Capital & small: match", [CS], [
 Q(CS, "האות הקטנה של {B}?", ["b", "d", "p", "q"], 0, "B גדולה = b קטנה", BIG("B")),
 Q(CS, "האות הקטנה של {D}?", ["d", "b", "p", "q"], 0, "D גדולה = d קטנה", BIG("D")),
 Q(CS, "האות הקטנה של {N}?", ["n", "h", "m", "u"], 0, "N גדולה = n קטנה", BIG("N")),
 Q(CS, "האות הקטנה של {Q}?", ["q", "p", "g", "d"], 0, "Q גדולה = q קטנה", BIG("Q")),
 Q(CS, "האות הקטנה של {G}?", ["g", "q", "j", "y"], 0, "G גדולה = g קטנה", BIG("G")),
 Q(CS, "האות הגדולה של {a}?", ["A", "E", "O", "Q"], 0, "a קטנה = A גדולה", BIG("a")),
 Q(CS, "האות הגדולה של {e}?", ["E", "F", "A", "I"], 0, "e קטנה = E גדולה", BIG("e")),
 Q(CS, "האות הגדולה של {r}?", ["R", "P", "B", "K"], 0, "r קטנה = R גדולה", BIG("r")),
 Q(CS, "האות הגדולה של {h}?", ["H", "N", "K", "B"], 0, "h קטנה = H גדולה", BIG("h")),
 Q(CS, "האות הגדולה של {d}?", ["D", "B", "P", "Q"], 0, "d קטנה = D גדולה", BIG("d")),
]))

C.append(("Capital or small?", [CS], [
 Q(CS, "איזו אות היא גדולה?", ["G", "g", "b", "e"], 0, "G גדולה. g, b, e קטנות", TXT("g  b  G  e")),
 Q(CS, "איזו אות היא קטנה?", ["m", "M", "T", "K"], 0, "m קטנה. M, T, K גדולות", TXT("M  T  m  K")),
 Q(CS, "איזו אות היא גדולה?", ["R", "r", "a", "n"], 0, "R גדולה. r, a, n קטנות", TXT("r  a  n  R")),
 Q(CS, "איזו אות היא קטנה?", ["f", "F", "L", "E"], 0, "f קטנה. F, L, E גדולות", TXT("F  f  L  E")),
 Q(CS, "איזה זוג הוא אותה אות?", ["B b", "B d", "D b", "P q"], 0, "B גדולה ו-b קטנה – אותה אות", TXT("B d · D b", "P q · B b")),
 Q(CS, "איזה זוג הוא אותה אות?", ["T t", "T f", "L t", "M n"], 0, "T גדולה ו-t קטנה – אותה אות", TXT("T f · L t", "T t · M n")),
 Q(CS, "איזה זוג הוא אותה אות?", ["M m", "M n", "N m", "W m"], 0, "M גדולה ו-m קטנה – אותה אות", TXT("M n · N m", "W m · M m")),
 Q(CS, "איך כותבים נכון את השם דן?", ["Dan", "dan", "dAn", "daN"], 0, "שם מתחיל באות גדולה: Dan", "👦"),
 Q(CS, "איך כותבים נכון את השם מאיה?", ["Maya", "maya", "mAya", "mayA"], 0, "שם מתחיל באות גדולה: Maya", "👧"),
 Q(CS, "המילה {I} (אני) נכתבת…", ["תמיד גדולה", "תמיד קטנה", "גדולה או קטנה", "רק בהתחלה"], 0, "I = אני, תמיד באות גדולה", "🙋"),
]))

# ───────────── ABC order ─────────────
C.append(("ABC: what comes next?", [AO], [
 Q(AO, "What comes after B?", ["C", "D", "A", "E"], 0, "A B C", TXT("A, B, ?")),
 Q(AO, "What comes before E?", ["D", "F", "C", "B"], 0, "D E F", TXT("?, E, F")),
 Q(AO, "What comes after H?", ["I", "G", "J", "K"], 0, "G H I", TXT("G, H, ?")),
 Q(AO, "Which letter is missing?", ["M", "O", "J", "P"], 0, "K L M N", TXT("K, L, ?, N")),
 Q(AO, "Which letter is missing?", ["Q", "O", "S", "T"], 0, "P Q R", TXT("P, ?, R")),
 Q(AO, "Which letter is missing?", ["U", "V", "R", "W"], 0, "S T U", TXT("S, T, ?")),
 Q(AO, "Which letter is missing?", ["c", "e", "b", "f"], 0, "a b c d", TXT("a, b, ?, d")),
 Q(AO, "What is the first letter of the ABC?", ["A", "B", "Z", "E"], 0, "ה-ABC מתחיל ב-A", TXT("? B C D")),
 Q(AO, "What is the last letter of the ABC?", ["Z", "Y", "X", "W"], 0, "ה-ABC נגמר ב-Z", TXT("W X Y ?")),
 Q(AO, "How many letters are in the ABC?", ["26", "24", "22", "28"], 0, "מ-A עד Z יש 26 אותיות", TXT("A … Z")),
]))

C.append(("ABC order: words", [AO], [
 Q(AO, "Which word comes first in ABC order?", ["apple", "dog", "cat", "egg"], 0, "a לפני c, d, e", ROW("🍎", "🐕", "🐈", "🥚")),
 Q(AO, "Which word comes first in ABC order?", ["ball", "pen", "sun", "hat"], 0, "b לפני h, p, s", ROW("⚽", "🖊️", "☀️", "🎩")),
 Q(AO, "Which word comes first in ABC order?", ["cat", "dog", "fish", "sun"], 0, "c לפני d, f, s", ROW("🐈", "🐕", "🐟", "☀️")),
 Q(AO, "Which word comes last in ABC order?", ["sun", "bed", "hat", "pen"], 0, "s אחרי b, h, p", ROW("☀️", "🛏️", "🎩", "🖊️")),
 Q(AO, "Which word comes last in ABC order?", ["tree", "egg", "milk", "fish"], 0, "t אחרי e, f, m", ROW("🌳", "🥚", "🥛", "🐟")),
 Q(AO, "Which letters are in ABC order?", ["d e f", "d f e", "e d f", "f e d"], 0, "d, אחריה e, אחריה f", TXT("d f e · e d f", "f e d · d e f")),
 Q(AO, "Which letters are in ABC order?", ["l m n", "m l n", "n m l", "l n m"], 0, "l, אחריה m, אחריה n", TXT("m l n · n m l", "l n m · l m n")),
 Q(AO, "Which letter comes between F and H?", ["G", "E", "I", "J"], 0, "F G H", TXT("F, ?, H")),
 Q(AO, "Which letter comes before C?", ["B", "D", "A", "E"], 0, "B C D", TXT("?, C, D")),
 Q(AO, "Which letter comes after Y?", ["Z", "X", "W", "A"], 0, "X Y Z", TXT("X, Y, ?")),
]))

# ───────────── Reading short words (CVC) ─────────────
C.append(("Short words: the missing letter", [CV], [
 Q(CV, "c_t (חתול)", ["a", "o", "u", "i"], 0, "c-a-t = cat", "🐈"),
 Q(CV, "d_g (כלב)", ["o", "a", "i", "u"], 0, "d-o-g = dog", "🐕"),
 Q(CV, "s_n (שמש)", ["u", "a", "i", "o"], 0, "s-u-n = sun", "☀️"),
 Q(CV, "p_g (חזיר)", ["i", "a", "e", "u"], 0, "p-i-g = pig", "🐖"),
 Q(CV, "b_d (מיטה)", ["e", "a", "i", "u"], 0, "b-e-d = bed", "🛏️"),
 Q(CV, "h_t (כובע)", ["a", "o", "u", "i"], 0, "h-a-t = hat", "🎩"),
 Q(CV, "b_s (אוטובוס)", ["u", "a", "i", "e"], 0, "b-u-s = bus", "🚌"),
 Q(CV, "_ox (שועל)", ["f", "b", "s", "v"], 0, "f-o-x = fox", "🦊"),
 Q(CV, "ma_ (מפה)", ["p", "t", "n", "d"], 0, "m-a-p = map", "🗺️"),
 Q(CV, "cu_ (ספל)", ["p", "t", "b", "d"], 0, "c-u-p = cup", "☕"),
]))

C.append(("Short words: read it", [CV], [
 Q(CV, "Read the sounds: f-o-x", ["fox", "box", "fix", "six"], 0, "f-o-x ביחד = fox", TXT("f-o-x")),
 Q(CV, "Read the sounds: m-a-p", ["map", "mop", "cap", "man"], 0, "m-a-p ביחד = map", TXT("m-a-p")),
 Q(CV, "Read the sounds: s-i-x", ["six", "sit", "fix", "mix"], 0, "s-i-x ביחד = six", TXT("s-i-x")),
 Q(CV, "This is a ___.", ["box", "fox", "bus", "bag"], 0, "קופסה = box", "📦"),
 Q(CV, "This is a ___.", ["pen", "pin", "pan", "ten"], 0, "עט = pen", "🖊️"),
 Q(CV, "This is a ___.", ["hen", "ten", "hat", "pen"], 0, "תרנגולת = hen", "🐔"),
 Q(CV, "This is a ___.", ["bag", "bug", "big", "bed"], 0, "תיק = bag", "👜"),
 Q(CV, "This is a ___.", ["bug", "bag", "bus", "mug"], 0, "חרק = bug", "🐛"),
 Q(CV, "שש = ?", ["six", "sit", "sun", "fix"], 0, "שש = six", TXT("6")),
 Q(CV, "Which word is NOT an animal?", ["cup", "cat", "dog", "pig"], 0, "cup = ספל. השאר בעלי חיים", ROW("🐈", "🐕", "🐖", "☕")),
]))

# ───────────── Sight words ─────────────
C.append(("Little words", [SW], [
 Q(SW, "אני = ?", ["I", "you", "he", "a"], 0, "אני = I (תמיד באות גדולה)", "🙋"),
 Q(SW, "אתה / את = ?", ["you", "I", "he", "me"], 0, "אתה / את = you", "👉"),
 Q(SW, "הוא = ?", ["he", "she", "I", "you"], 0, "הוא = he", "👦"),
 Q(SW, "היא = ?", ["she", "he", "I", "we"], 0, "היא = she", "👧"),
 Q(SW, "אנחנו = ?", ["we", "he", "me", "she"], 0, "אנחנו = we", "👪"),
 Q(SW, "כן = ?", ["yes", "no", "go", "see"], 0, "כן = yes", "👍"),
 Q(SW, "לא = ?", ["no", "yes", "on", "in"], 0, "לא = no", "👎"),
 Q(SW, "שלי = ?", ["my", "me", "I", "you"], 0, "שלי = my (my bag = התיק שלי)", ROW("🙋", "🎒")),
 Q(SW, "חתול וכלב = {a cat ___ a dog}", ["and", "is", "the", "in"], 0, "ו... = and", ROW("🐈", "🐕")),
 Q(SW, "בתוך = ?", ["in", "on", "is", "it"], 0, "בתוך = in", ROW("🐈", "📦")),
 Q(SW, "על = ?", ["on", "in", "no", "at"], 0, "על = on", ROW("🐈", "🛏️")),
]))

C.append(("Sight words in sentences", [SW], [
 Q(SW, "I ___ a cat. (רואה)", ["see", "is", "go", "am"], 0, "רואה = see", ROW("👀", "🐈")),
 Q(SW, "I ___ to school. (הולך)", ["go", "see", "can", "is"], 0, "הולך = go", "🏫"),
 Q(SW, "I ___ swim. (יכול)", ["can", "is", "go", "see"], 0, "יכול = can", "🏊"),
 Q(SW, "I ___ pizza. (אוהב)", ["like", "see", "go", "can"], 0, "אוהב = like", "🍕"),
 Q(SW, "___ at the bird! (תסתכל)", ["Look", "Go", "Like", "Can"], 0, "תסתכל = look", "🐦"),
 Q(SW, "Is it a dog? ___, it is.", ["Yes", "No", "Is", "I"], 0, "זה כלב – כן! Yes, it is", "🐕"),
 Q(SW, "It ___ a dog.", ["is", "am", "are", "I"], 0, "It is = זה", "🐕"),
 Q(SW, "I have ___ dog.", ["a", "an", "is", "am"], 0, "I have a dog = יש לי כלב", "🐕"),
 Q(SW, "{Go!} = ?", ["לך!", "שב!", "תסתכל!", "בוא!"], 0, "Go = לך", TXT("Go!")),
 Q(SW, "{the} = ?", ["ה... (הכלב)", "ו... (וכלב)", "של", "גם"], 0, "the dog = הכלב", TXT("the dog")),
]))

# ───────────── Family & body ─────────────
C.append(("My family", [FB], [
 Q(FB, "אמא = ?", ["mother", "father", "sister", "baby"], 0, "אמא = mother (mom)", "👩"),
 Q(FB, "אבא = ?", ["father", "mother", "brother", "grandpa"], 0, "אבא = father (dad)", "👨"),
 Q(FB, "אח = ?", ["brother", "sister", "father", "baby"], 0, "אח = brother", "👦"),
 Q(FB, "אחות = ?", ["sister", "brother", "mother", "grandma"], 0, "אחות = sister", "👧"),
 Q(FB, "סבתא = ?", ["grandma", "grandpa", "mother", "sister"], 0, "סבתא = grandma", "👵"),
 Q(FB, "סבא = ?", ["grandpa", "grandma", "father", "brother"], 0, "סבא = grandpa", "👴"),
 Q(FB, "תינוק = ?", ["baby", "boy", "girl", "brother"], 0, "תינוק = baby", "👶"),
 Q(FB, "משפחה = ?", ["family", "school", "house", "friend"], 0, "משפחה = family", "👪"),
 Q(FB, "{mother} = ?", ["אמא", "אבא", "אחות", "סבתא"], 0, "mother = אמא", TXT("mother")),
 Q(FB, "{brother} = ?", ["אח", "אחות", "אבא", "סבא"], 0, "brother = אח", TXT("brother")),
]))

C.append(("My body", [FB], [
 Q(FB, "אף = ?", ["nose", "ear", "eye", "mouth"], 0, "אף = nose", "👃"),
 Q(FB, "אוזן = ?", ["ear", "eye", "nose", "hand"], 0, "אוזן = ear", "👂"),
 Q(FB, "עין = ?", ["eye", "ear", "arm", "leg"], 0, "עין = eye", "👁️"),
 Q(FB, "פה = ?", ["mouth", "nose", "hand", "head"], 0, "פה = mouth", "👄"),
 Q(FB, "יד = ?", ["hand", "head", "leg", "foot"], 0, "יד = hand", "✋"),
 Q(FB, "רגל = ?", ["leg", "arm", "ear", "eye"], 0, "רגל = leg", "🦵"),
 Q(FB, "ראש = ?", ["head", "hand", "hat", "ear"], 0, "ראש = head", "😀"),
 Q(FB, "I see with my ___.", ["eyes", "ears", "nose", "hands"], 0, "רואים בעיניים = eyes", "🌈"),
 Q(FB, "I hear with my ___.", ["ears", "eyes", "legs", "mouth"], 0, "שומעים באוזניים = ears", "🎵"),
 Q(FB, "I eat with my ___.", ["mouth", "nose", "ear", "leg"], 0, "אוכלים בפה = mouth", "🍎"),
]))

# ───────────── Colors & numbers 1–10 ─────────────
C.append(("Colors", [CN], [
 Q(CN, "What color is it?", ["red", "blue", "green", "black"], 0, "תות אדום = red", "🍓"),
 Q(CN, "What color is it?", ["purple", "yellow", "pink", "white"], 0, "ענבים סגולים = purple", "🍇"),
 Q(CN, "What color is it?", ["green", "red", "brown", "orange"], 0, "ברוקולי ירוק = green", "🥦"),
 Q(CN, "What color is it?", ["orange", "purple", "blue", "black"], 0, "תפוז כתום = orange", "🍊"),
 Q(CN, "The sun is ___.", ["yellow", "blue", "black", "green"], 0, "השמש צהובה = yellow", "☀️"),
 Q(CN, "The sky is ___.", ["blue", "red", "brown", "pink"], 0, "השמיים כחולים = blue", "🌤️"),
 Q(CN, "Snow is ___.", ["white", "black", "red", "green"], 0, "שלג לבן = white", "⛄"),
 Q(CN, "ורוד = ?", ["pink", "purple", "red", "white"], 0, "ורוד = pink", "🌸"),
 Q(CN, "שחור = ?", ["black", "brown", "blue", "white"], 0, "שחור = black", "⚫"),
 Q(CN, "חום = ?", ["brown", "black", "orange", "green"], 0, "חום = brown", "🐻"),
]))

C.append(("Numbers 1–10", [CN], [
 Q(CN, "How many?", ["three", "two", "four", "tree"], 0, "three = 3 (tree = עץ)", COUNT(("⭐", 3))),
 Q(CN, "How many?", ["five", "four", "six", "nine"], 0, "סופרים: five = 5", COUNT(("🍎", 5))),
 Q(CN, "How many?", ["one", "two", "ten", "nine"], 0, "one = 1", COUNT(("🎈", 1))),
 Q(CN, "How many?", ["two", "ten", "three", "one"], 0, "two = 2", COUNT(("👟", 2))),
 Q(CN, "How many?", ["seven", "six", "eight", "nine"], 0, "4 + 3 = 7 = seven", COUNT(("🐟", 4), ("🐟", 3))),
 Q(CN, "6 = ?", ["six", "seven", "five", "two"], 0, "6 = six", TXT("6")),
 Q(CN, "8 = ?", ["eight", "nine", "three", "two"], 0, "8 = eight", TXT("8")),
 Q(CN, "9 = ?", ["nine", "five", "one", "six"], 0, "9 = nine", TXT("9")),
 Q(CN, "10 = ?", ["ten", "two", "one", "nine"], 0, "10 = ten", TXT("10")),
 Q(CN, "How many legs does a dog have?", ["four", "two", "six", "five"], 0, "לכלב 4 רגליים = four", "🐕"),
 Q(CN, "What comes after four?", ["five", "three", "six", "seven"], 0, "אחרי 4 בא 5 = five", TXT("4 → ?")),
 Q(CN, "two + one = ?", ["three", "two", "four", "one"], 0, "2 + 1 = 3 = three", TXT("2 + 1")),
]))

# ───────────── Animals ─────────────
C.append(("Animals: what is it?", [AN], [
 Q(AN, "What is this?", ["dog", "cat", "cow", "pig"], 0, "כלב = dog", "🐕"),
 Q(AN, "What is this?", ["cat", "dog", "rabbit", "cow"], 0, "חתול = cat", "🐈"),
 Q(AN, "What is this?", ["fish", "bird", "frog", "duck"], 0, "דג = fish", "🐟"),
 Q(AN, "What is this?", ["bird", "fish", "bee", "frog"], 0, "ציפור = bird", "🐦"),
 Q(AN, "What is this?", ["lion", "tiger", "dog", "cat"], 0, "אריה = lion", "🦁"),
 Q(AN, "What is this?", ["monkey", "lion", "mouse", "cow"], 0, "קוף = monkey", "🐒"),
 Q(AN, "What is this?", ["elephant", "horse", "giraffe", "bear"], 0, "פיל = elephant", "🐘"),
 Q(AN, "This is a ___.", ["cow", "horse", "pig", "sheep"], 0, "פרה = cow", "🐄"),
 Q(AN, "This is a ___.", ["frog", "fish", "dog", "duck"], 0, "צפרדע = frog", "🐸"),
 Q(AN, "This is a ___.", ["duck", "dog", "hen", "bee"], 0, "ברווז = duck", "🦆"),
]))

C.append(("Animals: words & sounds", [AN], [
 Q(AN, "סוס = ?", ["horse", "house", "cow", "dog"], 0, "סוס = horse (house = בית)", "🐎"),
 Q(AN, "חזיר = ?", ["pig", "dog", "big", "cow"], 0, "חזיר = pig", "🐖"),
 Q(AN, "כבשה = ?", ["sheep", "ship", "cow", "pig"], 0, "כבשה = sheep (ship = אונייה)", "🐑"),
 Q(AN, "ארנב = ?", ["rabbit", "mouse", "cat", "horse"], 0, "ארנב = rabbit", "🐇"),
 Q(AN, "תרנגולת = ?", ["hen", "pen", "duck", "cow"], 0, "תרנגולת = hen", "🐔"),
 Q(AN, "דבורה = ?", ["bee", "bird", "bear", "fish"], 0, "דבורה = bee", "🐝"),
 Q(AN, "{dog} = ?", ["כלב", "חתול", "דג", "פרה"], 0, "dog = כלב", TXT("dog")),
 Q(AN, "Which animal says \"moo\"?", ["cow", "dog", "cat", "duck"], 0, "הפרה עושה moo", TXT("Moo!")),
 Q(AN, "Which animal says \"woof\"?", ["dog", "cat", "cow", "sheep"], 0, "הכלב עושה woof", TXT("Woof!")),
 Q(AN, "Which animal can fly?", ["bird", "dog", "cow", "fish"], 0, "ציפור עפה = bird", ROW("🐦", "🐕", "🐄", "🐟")),
 Q(AN, "Which animal lives in the sea?", ["fish", "cow", "cat", "horse"], 0, "דג חי בים = fish", "🌊"),
]))

# ───────────── Food ─────────────
C.append(("Food words", [FD], [
 Q(FD, "This is a ___.", ["banana", "apple", "carrot", "cake"], 0, "בננה = banana", "🍌"),
 Q(FD, "This is an ___.", ["apple", "egg", "orange", "onion"], 0, "תפוח = apple", "🍎"),
 Q(FD, "לחם = ?", ["bread", "milk", "cake", "egg"], 0, "לחם = bread", "🍞"),
 Q(FD, "חלב = ?", ["milk", "water", "bread", "cheese"], 0, "חלב = milk", "🥛"),
 Q(FD, "ביצה = ?", ["egg", "leg", "bag", "cake"], 0, "ביצה = egg", "🥚"),
 Q(FD, "עוגה = ?", ["cake", "cookie", "bread", "candy"], 0, "עוגה = cake", "🍰"),
 Q(FD, "גבינה = ?", ["cheese", "chips", "milk", "cake"], 0, "גבינה = cheese", "🧀"),
 Q(FD, "This is a ___.", ["carrot", "banana", "tomato", "cake"], 0, "גזר = carrot", "🥕"),
 Q(FD, "מים = ?", ["water", "milk", "juice", "bread"], 0, "מים = water", "💧"),
 Q(FD, "This is a ___.", ["pizza", "cake", "salad", "sandwich"], 0, "פיצה = pizza", "🍕"),
]))

C.append(("Food: eat & drink", [FD], [
 Q(FD, "Which is a drink?", ["milk", "bread", "egg", "cake"], 0, "חלב שותים = drink", ROW("🥛", "🍞", "🥚", "🍰")),
 Q(FD, "Which is a yellow fruit?", ["banana", "carrot", "bread", "cheese"], 0, "בננה היא פרי צהוב = fruit", ROW("🍌", "🥕", "🍞", "🧀")),
 Q(FD, "Which is NOT food?", ["book", "apple", "egg", "bread"], 0, "ספר לא אוכלים!", ROW("📕", "🍎", "🥚", "🍞")),
 Q(FD, "גלידה = ?", ["ice cream", "cake", "candy", "milk"], 0, "גלידה = ice cream", "🍦"),
 Q(FD, "תפוז = ?", ["orange", "apple", "banana", "grapes"], 0, "תפוז = orange", "🍊"),
 Q(FD, "Monkeys like ___.", ["bananas", "milk", "pizza", "cheese"], 0, "קופים אוהבים בננות", "🐒"),
 Q(FD, "Rabbits like ___.", ["carrots", "fish", "pizza", "milk"], 0, "ארנבים אוהבים גזר", "🐇"),
 Q(FD, "A cow gives us ___.", ["milk", "eggs", "bread", "water"], 0, "פרה נותנת חלב = milk", "🐄"),
 Q(FD, "A hen gives us ___.", ["eggs", "milk", "cheese", "apples"], 0, "תרנגולת מטילה ביצים = eggs", "🐔"),
 Q(FD, "{apple} = ?", ["תפוח", "בננה", "ביצה", "לחם"], 0, "apple = תפוח", TXT("apple")),
]))

# ───────────── School things ─────────────
C.append(("School things", [SC], [
 Q(SC, "This is a ___.", ["book", "bag", "box", "bed"], 0, "ספר = book", "📕"),
 Q(SC, "These are ___.", ["pencils", "pens", "books", "bags"], 0, "עפרונות = pencils", COUNT(("✏️", 3))),
 Q(SC, "This is a ___.", ["ruler", "pencil", "book", "bag"], 0, "סרגל = ruler", "📏"),
 Q(SC, "This is my ___.", ["bag", "book", "box", "pen"], 0, "ילקוט = (school) bag", "🎒"),
 Q(SC, "מספריים = ?", ["scissors", "ruler", "pencil", "pen"], 0, "מספריים = scissors", "✂️"),
 Q(SC, "מחברת = ?", ["notebook", "book", "pencil", "bag"], 0, "מחברת = notebook", "📓"),
 Q(SC, "מורה = ?", ["teacher", "mother", "sister", "friend"], 0, "מורה = teacher", "👩‍🏫"),
 Q(SC, "בית ספר = ?", ["school", "class", "house", "shop"], 0, "בית ספר = school", "🏫"),
 Q(SC, "I write with a ___.", ["pen", "book", "ruler", "bag"], 0, "כותבים בעט = pen", ROW("📏", "🖊️", "🎒", "📕")),
 Q(SC, "This is a ___.", ["crayon", "ruler", "book", "bag"], 0, "צבע (עפרון שעווה) = crayon", "🖍️"),
]))

C.append(("School: words & use", [SC], [
 Q(SC, "{book} = ?", ["ספר", "מחברת", "ילקוט", "עט"], 0, "book = ספר", TXT("book")),
 Q(SC, "{bag} = ?", ["ילקוט", "ספר", "קופסה", "עיפרון"], 0, "bag = ילקוט / תיק", TXT("bag")),
 Q(SC, "{teacher} = ?", ["מורה", "תלמיד", "אמא", "ספר"], 0, "teacher = מורה", TXT("teacher")),
 Q(SC, "{pencil} = ?", ["עיפרון", "עט", "סרגל", "מחברת"], 0, "pencil = עיפרון", TXT("pencil")),
 Q(SC, "I cut paper with ___.", ["scissors", "a pen", "a book", "a ruler"], 0, "גוזרים במספריים = scissors", ROW("🖊️", "📏", "✂️", "📕")),
 Q(SC, "I read a ___.", ["book", "pen", "ruler", "crayon"], 0, "קוראים ספר = book", ROW("🖊️", "📖", "📏", "🖍️")),
 Q(SC, "I color with a ___.", ["crayon", "ruler", "book", "bag"], 0, "צובעים בצבע = crayon", ROW("📏", "🎒", "🖍️", "📕")),
 Q(SC, "My books are in my ___.", ["bag", "pen", "ruler", "crayon"], 0, "הספרים בילקוט = bag", COUNT(("📕", 3))),
 Q(SC, "Which is NOT a school thing?", ["banana", "pen", "book", "ruler"], 0, "בננה אוכלים. השאר לבית הספר", ROW("🍌", "🖊️", "📕", "📏")),
 Q(SC, "עט = ?", ["pen", "pin", "pan", "bag"], 0, "עט = pen", "🖊️"),
]))

# ───────────── Sentences & instructions ─────────────
C.append(("I am · I have · This is", [SI], [
 Q(SI, "I ___ a girl.", ["am", "is", "are", "have"], 0, "I ← am: I am a girl", "👧"),
 Q(SI, "I ___ happy.", ["am", "have", "is", "are"], 0, "I am happy = אני שמח", "😀"),
 Q(SI, "I ___ a dog. (יש לי)", ["have", "am", "is", "are"], 0, "יש לי = I have", "🐕"),
 Q(SI, "I ___ two cats. (יש לי)", ["have", "am", "is", "are"], 0, "יש לי = I have", COUNT(("🐈", 2))),
 Q(SI, "This ___ a cat.", ["is", "am", "are", "I"], 0, "This is = זה", "🐈"),
 Q(SI, "___ is a book.", ["This", "I", "Am", "Have"], 0, "This is a book = זה ספר", "📕"),
 Q(SI, "My name ___ Dan.", ["is", "am", "are", "have"], 0, "My name is Dan = שמי דן", "👦"),
 Q(SI, "זה כלב = {___ a dog.}", ["This is", "I am", "I have", "I see"], 0, "זה = This is", "🐕"),
 Q(SI, "אני בת שמונה = {I ___ eight.}", ["am", "have", "is", "are"], 0, "גיל: I am eight", ROW("👧", "🎂")),
 Q(SI, "יש לי ילקוט = {___ a bag.}", ["I have", "I am", "This is", "I see"], 0, "יש לי = I have", "🎒"),
]))

C.append(("Classroom instructions", [SI], [
 Q(SI, "שבו! = {___ down!}", ["Sit", "Stand", "Look", "Open"], 0, "Sit down = שבו", "💺"),
 Q(SI, "קומו! = {___ up!}", ["Stand", "Sit", "Look", "Open"], 0, "Stand up = קומו", "⬆️"),
 Q(SI, "פתחו את הספר = {___ your book.}", ["Open", "Close", "Sit", "Look"], 0, "לפתוח = open", "📖"),
 Q(SI, "סגרו את הדלת = {___ the door.}", ["Close", "Open", "Sit", "Stand"], 0, "לסגור = close", "🚪"),
 Q(SI, "הקשיבו! = ?", ["Listen!", "Look!", "Sit!", "Go!"], 0, "להקשיב = listen", "👂"),
 Q(SI, "תסתכלו! = ?", ["Look!", "Listen!", "Write!", "Stand!"], 0, "להסתכל = look", "👀"),
 Q(SI, "{Raise your hand.} = ?", ["הרימו יד", "שבו", "קומו", "פתחו ספר"], 0, "Raise your hand = הרימו יד", TXT("Raise your hand.")),
 Q(SI, "{Be quiet!} = ?", ["שקט!", "שבו!", "קומו!", "הקשיבו!"], 0, "Be quiet = שקט", TXT("Be quiet!")),
 Q(SI, "{Write your name.} = ?", ["כתבו את השם", "קראו את הספר", "שבו בשקט", "סגרו את הדלת"], 0, "write = לכתוב, name = שם", TXT("Write your name.")),
 Q(SI, "{Close your book.} = ?", ["סגרו את הספר", "פתחו את הספר", "קראו את הספר", "שבו בשקט"], 0, "close = לסגור, book = ספר", TXT("Close your book.")),
]))

# ───────────── Vowel sounds ─────────────
C.append(("Vowel sounds: the middle sound", [VS], [
 Q(VS, "Same middle sound as cat?", ["bag", "bed", "big", "bug"], 0, "c-a-t, b-a-g: אותו צליל a באמצע", PW("🐈", "cat")),
 Q(VS, "Same middle sound as bed?", ["pen", "pin", "pan", "pot"], 0, "b-e-d, p-e-n: אותו צליל e באמצע", PW("🛏️", "bed")),
 Q(VS, "Same middle sound as pig?", ["six", "box", "bag", "bed"], 0, "p-i-g, s-i-x: אותו צליל i באמצע", PW("🐖", "pig")),
 Q(VS, "Same middle sound as dog?", ["box", "bus", "bag", "big"], 0, "d-o-g, b-o-x: אותו צליל o באמצע", PW("🐕", "dog")),
 Q(VS, "Same middle sound as sun?", ["bus", "bag", "big", "box"], 0, "s-u-n, b-u-s: אותו צליל u באמצע", PW("☀️", "sun")),
 Q(VS, "Same middle sound as map?", ["bag", "bed", "big", "bug"], 0, "m-a-p, b-a-g: אותו צליל a באמצע", PW("🗺️", "map")),
 Q(VS, "Which word has a different middle sound?", ["pig", "cat", "hat", "map"], 0, "cat, hat, map עם a. pig עם i", ROW("🐈", "🎩", "🗺️", "🐖")),
 Q(VS, "Which word has a different middle sound?", ["sun", "pen", "hen", "ten"], 0, "pen, hen, ten עם e. sun עם u", ROW("🖊️", "🐔", "🔟", "☀️")),
 Q(VS, "Which word has a different middle sound?", ["bed", "dog", "fox", "box"], 0, "dog, fox, box עם o. bed עם e", ROW("🐕", "🦊", "📦", "🛏️")),
 Q(VS, "Which word has a different middle sound?", ["cup", "map", "cat", "bag"], 0, "map, cat, bag עם a. cup עם u", ROW("🗺️", "🐈", "👜", "☕")),
]))

C.append(("Vowel sounds: change the sound", [VS], [
 Q(VS, "hat: change a to i.", ["hit", "hot", "hut", "hat"], 0, "h-a-t ← מחליפים a ב-i: hit", TXT("hat → h?t")),
 Q(VS, "pen: change e to i.", ["pin", "pan", "pen", "pig"], 0, "p-e-n ← מחליפים e ב-i: pin", TXT("pen → p?n")),
 Q(VS, "bag: change a to u.", ["bug", "big", "beg", "bag"], 0, "b-a-g ← מחליפים a ב-u: bug", TXT("bag → b?g")),
 Q(VS, "hot: change o to a.", ["hat", "hit", "hut", "hot"], 0, "h-o-t ← מחליפים o ב-a: hat", TXT("hot → h?t")),
 Q(VS, "cup: change u to a.", ["cap", "cop", "cup", "cut"], 0, "c-u-p ← מחליפים u ב-a: cap", TXT("cup → c?p")),
 Q(VS, "big: change i to a.", ["bag", "bug", "beg", "big"], 0, "b-i-g ← מחליפים i ב-a: bag", TXT("big → b?g")),
 Q(VS, "fox: change o to i.", ["fix", "fax", "fox", "six"], 0, "f-o-x ← מחליפים o ב-i: fix", TXT("fox → f?x")),
 Q(VS, "Which two have the middle sound a?", ["cat, hat", "cat, cut", "pen, pin", "dog, dig"], 0, "cat ו-hat – שתיהן עם a באמצע", TXT("_ a _")),
 Q(VS, "Which two have the middle sound i?", ["pig, six", "pig, bag", "bed, bud", "sun, sit"], 0, "pig ו-six – שתיהן עם i באמצע", TXT("_ i _")),
 Q(VS, "Which two have the middle sound u?", ["sun, bus", "sun, sit", "bus, bag", "cup, cap"], 0, "sun ו-bus – שתיהן עם u באמצע", TXT("_ u _")),
]))

# ───────────── Greetings & introductions ─────────────
C.append(("Hello! Goodbye!", [GR], [
 Q(GR, "שלום (כשנפגשים) = ?", ["Hello", "Goodbye", "Thank you", "Sorry"], 0, "כשנפגשים אומרים Hello", "👋"),
 Q(GR, "להתראות = ?", ["Goodbye", "Hello", "Please", "Good morning"], 0, "כשנפרדים אומרים Goodbye", ROW("👋", "🚪")),
 Q(GR, "בוקר טוב = ?", ["Good morning", "Good night", "Goodbye", "Thank you"], 0, "morning = בוקר, good = טוב", "🌅"),
 Q(GR, "לילה טוב = ?", ["Good night", "Good morning", "Hello", "Goodbye"], 0, "night = לילה: Good night", "🌙"),
 Q(GR, "תודה = ?", ["Thank you", "Please", "Sorry", "Hello"], 0, "תודה = Thank you", "🎁"),
 Q(GR, "{How are you?} = ?", ["מה שלומך?", "איך קוראים לך?", "בן כמה אתה?", "איפה אתה?"], 0, "How are you = מה שלומך", TXT("How are you?")),
 Q(GR, "{How are you?} – ___", ["I'm fine, thanks.", "I'm Dan.", "I'm eight.", "Goodbye!"], 0, "מה שלומך? – טוב, תודה: I'm fine", ROW("👧", "👦")),
 Q(GR, "{Goodbye!} = ?", ["להתראות!", "סליחה!", "תודה!", "בוקר טוב!"], 0, "Goodbye = להתראות", TXT("Goodbye!")),
 Q(GR, "בבוקר פוגשים את המורה. אומרים: ___", ["Good morning", "Good night", "Goodbye", "Thank you"], 0, "בבוקר, כשנפגשים: Good morning", ROW("🌅", "👩‍🏫")),
 Q(GR, "{Dan gives you a present.} You say: ___", ["Thank you", "Sorry", "Goodbye", "Good night"], 0, "מקבלים מתנה – אומרים תודה: Thank you", ROW("👦", "🎁")),
]))

C.append(("What's your name? How old are you?", [GR], [
 Q(GR, "{What's your name?} = ?", ["איך קוראים לך?", "בן כמה אתה?", "מה שלומך?", "איפה אתה גר?"], 0, "name = שם: What's your name = איך קוראים לך", "🙋"),
 Q(GR, "{What's your name?} – ___", ["I'm Dan.", "I'm fine.", "I'm eight.", "Thank you."], 0, "שואלים שם – עונים שם: I'm Dan", "👦"),
 Q(GR, "{How old are you?} = ?", ["בן כמה אתה?", "איך קוראים לך?", "מה שלומך?", "מה השעה?"], 0, "How old are you = בן כמה אתה", TXT("How old", "are you?")),
 Q(GR, "{How old are you?} – ___", ["I'm eight.", "I'm Dan.", "I'm fine.", "Goodbye."], 0, "שואלים גיל – עונים מספר: I'm eight", "👧"),
 Q(GR, "{My name is Maya.} = ?", ["קוראים לי מאיה", "מאיה חברה שלי", "אני אוהבת מאיה", "מאיה בת שמונה"], 0, "my name = השם שלי", "👧"),
 Q(GR, "איך שואלים חבר מה שלומו?", ["How are you?", "What's your name?", "Where are you?", "Goodbye!"], 0, "מה שלומך = How are you", "🙂"),
 Q(GR, "{Nice to meet you!} = ?", ["נעים להכיר!", "להתראות!", "מה שלומך?", "תודה רבה!"], 0, "Nice to meet you = נעים להכיר", TXT("Nice to", "meet you!")),
 Q(GR, "Hello, I'm Tom. – ___, I'm Maya.", ["Hi", "Bye", "Thanks", "Sorry"], 0, "Hi = Hello = שלום", ROW("👦", "👧")),
 Q(GR, "___ are you? – I'm fine.", ["How", "Who", "What", "Where"], 0, "מה שלומך? = How are you", "🙂"),
 Q(GR, "___ is your name? – Dan.", ["What", "How", "Who", "Where"], 0, "What is your name = איך קוראים לך", "👦"),
]))

# ───────────── Reading sentences ─────────────
C.append(("Read the card", [RS], [
 Q(RS, "What color is the hat?", ["red", "blue", "green", "black"], 0, "It is red – הכובע אדום", TXT("Dan has", "a hat.", "It is red.")),
 Q(RS, "How old is Maya?", ["eight", "nine", "seven", "ten"], 0, "I am eight = אני בת שמונה", TXT("I am Maya.", "I am eight.")),
 Q(RS, "Where is the cat?", ["in the box", "on the box", "on the bed", "in the bag"], 0, "in the box = בתוך הקופסה", TXT("The cat is", "in the box.")),
 Q(RS, "What is big?", ["the dog", "the cat", "the hat", "the bus"], 0, "It is big – הכלב גדול", TXT("I have", "a dog.", "It is big.")),
 Q(RS, "How many cats does Tom have?", ["two", "one", "three", "ten"], 0, "Tom has two cats = לטום שני חתולים", TXT("Tom has", "two cats.")),
 Q(RS, "Who has a ball?", ["my brother", "my sister", "my father", "my mother"], 0, "My brother has a ball = לאח שלי כדור", TXT("My brother", "has a ball.")),
 Q(RS, "Where is the bird?", ["on the tree", "in the box", "on the bed", "in the bag"], 0, "on the tree = על העץ", TXT("The bird is", "on the tree.")),
 Q(RS, "What am I?", ["a frog", "a dog", "a fish", "a bird"], 0, "ירוק וקופץ = צפרדע (frog)", TXT("I am green.", "I can jump.")),
 Q(RS, "What am I?", ["a banana", "an apple", "a carrot", "an egg"], 0, "צהובה, וקופים אוהבים אותה = banana", TXT("I am yellow.", "Monkeys", "like me.")),
 Q(RS, "What am I?", ["a dog", "a cat", "a cow", "a fish"], 0, "חיית מחמד שאומרת woof = dog", TXT("I am a pet.", "I say woof!")),
]))

C.append(("Read a sentence", [RS], [
 Q(RS, "{The dog is big.} = ?", ["הכלב גדול", "הכלב קטן", "החתול גדול", "הכלב שמח"], 0, "dog = כלב, big = גדול", ROW("🐈", "🐕")),
 Q(RS, "{I like milk.} = ?", ["אני אוהב חלב", "אני שותה מים", "אני אוהב לחם", "אני רואה חלב"], 0, "like = אוהב, milk = חלב", ROW("🍞", "🥛", "💧")),
 Q(RS, "{The cat is in the box.} = ?", ["החתול בתוך הקופסה", "החתול על הקופסה", "הכלב בתוך הקופסה", "החתול ליד הקופסה"], 0, "in = בתוך, box = קופסה", ROW("🐕", "🐈", "📦")),
 Q(RS, "{My sister is happy.} = ?", ["אחותי שמחה", "אחי שמח", "אמא שלי שמחה", "אחותי עצובה"], 0, "sister = אחות, happy = שמחה", ROW("👦", "👩", "👧")),
 Q(RS, "{I see a bird.} = ?", ["אני רואה ציפור", "אני רואה דג", "אני רואה כלב", "ציפור רואה אותי"], 0, "I see = אני רואה, bird = ציפור", ROW("🐟", "🐦", "🐕")),
 Q(RS, "{The sun is yellow.} = ?", ["השמש צהובה", "השמש אדומה", "הירח צהוב", "השמש גדולה"], 0, "sun = שמש, yellow = צהוב", ROW("🌙", "☀️")),
 Q(RS, "{This is my bag.} = ?", ["זה התיק שלי", "זה הספר שלי", "זה התיק שלך", "זה תיק גדול"], 0, "my bag = התיק שלי", ROW("📕", "🎒")),
 Q(RS, "{Look at the fish!} = ?", ["תסתכל על הדג!", "תאכל את הדג!", "תסתכל על הציפור!", "יש לי דג!"], 0, "look = להסתכל, fish = דג", ROW("🐦", "🐟")),
 Q(RS, "{Mom has a cake.} = ?", ["לאמא יש עוגה", "אמא אוכלת עוגה", "לאבא יש עוגה", "לאמא יש לחם"], 0, "has = יש לה, cake = עוגה", ROW("👨", "🍞", "🍰", "👩")),
 Q(RS, "{I can swim.} = ?", ["אני יכול לשחות", "אני יכול לרוץ", "אני רוצה לשחות", "אני לא שוחה"], 0, "can = יכול, swim = לשחות", ROW("🏃", "🏊")),
]))

# ───────────── Review ─────────────
C.append(("חזרה כללית", [RH, LS, CS, AO, CV, SW, FB, CN, AN, FD, SC, SI], [
 Q(RH, "Which word rhymes with man?", ["can", "map", "men", "mom"], 0, "man – can: שתיהן נגמרות ב-an", PW("👨", "man")),
 Q(RH, "What is the first sound in bag?", ["b", "d", "g", "p"], 0, "bag מתחילה בצליל b", PW("👜", "bag")),
 Q(LS, "איזו אות נקראת אֶס?", ["S", "X", "C", "F"], 0, "S נקראת אֶס", TXT("אֶס")),
 Q(LS, "איזה צליל עושה האות {P}?", ["פ", "ב", "ט", "ק"], 0, "P עושה פ, כמו ב-pen", BIG("P")),
 Q(CS, "האות הקטנה של {T}?", ["t", "f", "l", "i"], 0, "T גדולה = t קטנה", BIG("T")),
 Q(CS, "האות הגדולה של {b}?", ["B", "D", "P", "R"], 0, "b קטנה = B גדולה", BIG("b")),
 Q(AO, "What comes after M?", ["N", "L", "O", "W"], 0, "L M N", TXT("L, M, ?")),
 Q(AO, "Which word comes first in ABC order?", ["bus", "pig", "sun", "map"], 0, "b לפני m, p, s", ROW("🚌", "🐖", "☀️", "🗺️")),
 Q(CV, "r_n (לרוץ)", ["u", "a", "i", "e"], 0, "r-u-n = run", "🏃"),
 Q(CV, "Read the sounds: b-e-d", ["bed", "bad", "bid", "red"], 0, "b-e-d ביחד = bed", TXT("b-e-d")),
 Q(SW, "We ___ to school. (הולכים)", ["go", "see", "like", "can"], 0, "הולכים = go", "🏫"),
 Q(FB, "I smell with my ___.", ["nose", "ear", "eye", "hand"], 0, "מריחים באף = nose", "🌸"),
 Q(FB, "{sister} = ?", ["אחות", "אח", "אמא", "סבתא"], 0, "sister = אחות", TXT("sister")),
 Q(CN, "What color is it?", ["blue", "green", "black", "purple"], 0, "כחול = blue", "🔵"),
 Q(CN, "How many?", ["ten", "nine", "eight", "two"], 0, "5 + 5 = 10 = ten", COUNT(("🌸", 5), ("🌸", 5))),
 Q(AN, "What is this?", ["giraffe", "horse", "elephant", "lion"], 0, "ג'ירפה = giraffe", "🦒"),
 Q(FD, "Which is NOT a drink?", ["cake", "milk", "water", "juice"], 0, "עוגה אוכלים, לא שותים", ROW("🍰", "🥛", "💧")),
 Q(SC, "{ruler} = ?", ["סרגל", "עיפרון", "מספריים", "ספר"], 0, "ruler = סרגל", TXT("ruler")),
 Q(SI, "I ___ nine.", ["am", "is", "are", "have"], 0, "גיל: I am nine = אני בן תשע", TXT("9")),
 Q(SI, "{Open the door.} = ?", ["פתחו את הדלת", "סגרו את הדלת", "שבו בשקט", "קומו"], 0, "open = לפתוח, door = דלת", TXT("Open the door.")),
]))

# station type on the map
KINDS = {c[0]: "abc" for c in C if c[2][0][0] in (RH, LS, CS, AO, CV)}
KINDS.update({c[0]: "word" for c in C if c[2][0][0] in (SW, FB, CN, AN, FD, SC)})
KINDS.update({c[0]: "abc" for c in C if c[2][0][0] == VS})
KINDS.update({c[0]: "word" for c in C if c[2][0][0] == GR})
KINDS.update({c[0]: "gram" for c in C if c[2][0][0] in (SI, RS)})
KINDS["חזרה כללית"] = "rev"

# The year's target words – every one must be a correct answer somewhere (build_set.py checks).
WORD_LIST = """cat|dog|sun|pig|bed|hat|bus|fox|map|cup|six|box|pen|hen|bag|bug|
I|you|he|she|we|my|yes|no|and|in|on|see|go|can|like|look|is|a|
mother|father|brother|sister|grandma|grandpa|baby|family|nose|ear|eye|mouth|hand|leg|head|
red|blue|green|yellow|purple|pink|black|white|brown|orange|
one|two|three|four|five|six|seven|eight|nine|ten|
bird|fish|lion|monkey|elephant|cow|frog|duck|horse|sheep|rabbit|bee|
banana|apple|bread|milk|egg|cake|cheese|carrot|water|pizza|ice cream|
book|pencil|ruler|scissors|notebook|teacher|school|crayon|
am|have|this|sit|stand|open|close|listen""".replace("\n", "").split("|")
WORD_LIST = list(dict.fromkeys(WORD_LIST))
