# Practice set: English, grade 4 – ABC, colors, animals, prepositions, verbs, missing letter.
# Run: python3 -I tools/build_set.py tools/sets/en4_nov26.py
AB, CO, AN, PR, VE, ML, RV = "Alphabet", "Colors", "Animals", "Prepositions", "Verbs", "Missing letter", "Review"

SET = dict(name="English – ABC, Colors, Animals", grade=3, subject="אנגלית",
           title="ABC · Colors · Animals", desc="אותיות, צבעים, חיות, מילות יחס ופעלים",
           desc_en="Letters, colors, animals, prepositions and verbs",
           tags=["ABC", "Colors", "Animals", "Prepositions", "Verbs", "Missing letter"],
           examDate="", dailyGoal=2, perRound=11,
           topics=[AB, CO, AN, PR, VE, ML])

def L(ch, size=70): return [(ch, 50, 52, size)]          # a big letter as the picture
def seq(*cs): return [(c, 14 + i * 24, 52, 30) for i, c in enumerate(cs)]

C = []
# ---- all 26 letters, big ↔ small (questions in Hebrew so the question never shows the answer) ----
LOOK = {"a": "oeu", "b": "dpq", "c": "eoa", "d": "bpq", "e": "aoc", "f": "tlj", "g": "qjy", "h": "nkb", "i": "jrt", "j": "igy",
        "k": "hxy", "l": "ejt", "m": "nwu", "n": "mhu", "o": "aec", "p": "qbd", "q": "pgd", "r": "nvt", "s": "zcx", "t": "flj",
        "u": "vnw", "v": "uwy", "w": "mvu", "x": "kyz", "y": "vgj", "z": "sxn"}
def bigsmall(letters, start_small):
    out = []
    for n, ch in enumerate(letters):
        small = (n + start_small) % 2 == 0           # alternate: show BIG → ask small, show small → ask BIG
        if small: q, opts, pic, ex = "האות הקטנה?", [ch] + list(LOOK[ch]), ch.upper(), f"{ch.upper()} גדולה = {ch} קטנה"
        else:     q, opts, pic, ex = "האות הגדולה?", [ch.upper()] + [x.upper() for x in LOOK[ch]], ch, f"{ch} קטנה = {ch.upper()} גדולה"
        out.append((AB, q, opts, 0, ex, [(pic, 50, 52, 70)]))
    return out
C.append(("ABC: big & small A–M", [AB], bigsmall("abcdefghijklm", 0)))
C.append(("ABC: big & small N–Z", [AB], bigsmall("nopqrstuvwxyz", 1)))

C.append(("ABC: order & first letter", [AB], [
 (AB, "What comes next?", ["D", "E", "F", "B"], 0, "A B C D", seq("A", "B", "C", "❓")),
 (AB, "What comes next?", ["I", "J", "K", "E"], 0, "F G H I", seq("F", "G", "H", "❓")),
 (AB, "What comes next?", ["Q", "R", "S", "T"], 0, "N O P Q", seq("N", "O", "P", "❓")),
 (AB, "What comes next?", ["Z", "A", "V", "U"], 0, "W X Y Z – סוף ה-ABC", seq("W", "X", "Y", "❓")),
 (AB, "Starts with?", ["d", "b", "g", "p"], 0, "dog מתחיל ב-d", [("🐕", 50, 52, 56)]),
 (AB, "Starts with?", ["f", "p", "t", "v"], 0, "fish מתחיל ב-f", [("🐟", 50, 52, 56)]),
 (AB, "Starts with?", ["o", "a", "u", "c"], 0, "octopus מתחיל ב-o", [("🐙", 50, 52, 56)]),
 (AB, "Starts with?", ["l", "i", "j", "y"], 0, "lion מתחיל ב-l", [("🦁", 50, 52, 56)]),
 (AB, "Starts with B:", ["bird", "cat", "fish", "dog"], 0, "bird מתחיל ב-B", [("B", 30, 50, 40), ("🐦", 70, 52, 36)]),
 (AB, "Starts with M:", ["monkey", "cat", "dog", "lion"], 0, "monkey מתחיל ב-M", [("M", 30, 50, 40), ("🐒", 70, 52, 36)]),
 (AB, "Starts with E:", ["elephant", "tiger", "bird", "fish"], 0, "elephant מתחיל ב-E", [("E", 30, 50, 40), ("🐘", 70, 52, 36)]),
]))


WORDS = [("a","apple","🍎"),("a","ant","🐜"),("b","banana","🍌"),("b","bird","🐦"),("c","cat","🐈"),("c","car","🚗"),
  ("d","dog","🐕"),("d","duck","🦆"),("e","egg","🥚"),("e","elephant","🐘"),("f","fish","🐟"),("f","frog","🐸"),
  ("g","giraffe","🦒"),("g","grapes","🍇"),("h","house","🏠"),("h","hat","🎩"),("i","ice cream","🍦"),("i","island","🏝️"),
  ("j","juice","🧃"),("j","jacket","🧥"),("k","koala","🐨"),("k","key","🔑"),("l","lion","🦁"),("l","lemon","🍋"),
  ("m","monkey","🐒"),("m","moon","🌙"),("n","nose","👃"),("n","nut","🥜"),("o","octopus","🐙"),("o","orange","🍊"),
  ("p","pizza","🍕"),("p","pen","🖊️"),("q","queen","👑"),("q","question","❓"),("r","rabbit","🐇"),("r","rain","🌧️"),
  ("s","sun","☀️"),("s","snake","🐍"),("t","tiger","🐅"),("t","tree","🌳"),("u","umbrella","☂️"),("u","unicorn","🦄"),
  ("v","violin","🎻"),("v","van","🚐"),("w","watch","⌚"),("w","whale","🐳"),("x","fox","🦊"),("x","box","📦"),
  ("y","yes","👍"),("y","yellow","💛"),("z","zebra","🦓"),("z","zero","0️⃣")]
def letter_words(lo, hi):
    out = []
    pool = [w for _, w, _ in WORDS]
    for i, (L, w, e) in enumerate(WORDS):
        if not (lo <= L <= hi): continue
        # three distractors that do NOT start with (or, for X, contain) the letter
        bad = [x for x in pool if (L not in x if L == "x" else not x.startswith(L))]
        d = [bad[(i * 7 + k * 11) % len(bad)] for k in range(3)]
        k = 3
        while len(set(d)) < 3: d = list(dict.fromkeys(d)) + [bad[(i * 7 + k * 11) % len(bad)]]; d = d[:3]; k += 1
        if L == "x": q, ex = "Has the letter X:", f"{w} – יש בה x"
        else:        q, ex = f"{L.upper()} is for…", ("queen = מלכה, מתחיל ב-Q" if w == "queen" else f"{w} מתחיל ב-{L.upper()}")
        out.append((AB, q, [w] + d, 0, ex, [(L.upper(), 26, 50, 40), (e, 70, 52, 40)]))
    return out
C.append(("Two words for each letter A–F", [AB], letter_words("a", "f")))
C.append(("Two words for each letter G–M", [AB], letter_words("g", "m")))
C.append(("Two words for each letter N–S", [AB], letter_words("n", "s")))
C.append(("Two words for each letter T–Z", [AB], letter_words("t", "z")))

C.append(("Colors", [CO], [
 (CO, "What color is it?", ["red", "blue", "green", "black"], 0, "אדום = red", [("🍓", 50, 52, 56)]),
 (CO, "What color is it?", ["green", "red", "brown", "orange"], 0, "ירוק = green", [("🥦", 50, 52, 56)]),
 (CO, "What color is it?", ["gray", "purple", "orange", "blue"], 0, "אפור = gray", [("🐘", 50, 52, 56)]),
 (CO, "What color is it?", ["brown", "green", "red", "purple"], 0, "חום = brown", [("🐻", 50, 52, 56)]),
 (CO, "What color is it?", ["blue", "black", "orange", "gray"], 0, "כחול = blue", [("🔵", 50, 52, 56)]),
 (CO, "What color is it?", ["orange", "purple", "green", "brown"], 0, "כתום = orange", [("🍊", 50, 52, 56)]),
 (CO, "What color is it?", ["purple", "red", "gray", "blue"], 0, "סגול = purple", [("🍇", 50, 52, 56)]),
 (CO, "What color is it?", ["black", "brown", "blue", "green"], 0, "שחור = black", [("⬛", 50, 52, 56)]),
 (CO, "אדום = ?", ["red", "orange", "purple", "brown"], 0, "אדום = red", [("🔴", 50, 52, 50)]),
 (CO, "כחול = ?", ["blue", "black", "gray", "green"], 0, "כחול = blue", [("💙", 50, 52, 50)]),
 (CO, "חום = ?", ["brown", "black", "gray", "orange"], 0, "חום = brown", [("🌰", 50, 52, 50)]),
]))

C.append(("Animals", [AN], [
 (AN, "What is this?", ["dog", "cat", "lion", "fish"], 0, "כלב = dog", "🐕"),
 (AN, "What is this?", ["cat", "dog", "tiger", "bird"], 0, "חתול = cat", "🐈"),
 (AN, "What is this?", ["lion", "tiger", "monkey", "dog"], 0, "אריה = lion", "🦁"),
 (AN, "What is this?", ["alligator", "fish", "elephant", "octopus"], 0, "תנין = alligator", "🐊"),
 (AN, "What is this?", ["tiger", "lion", "cat", "giraffe"], 0, "נמר (טיגריס) = tiger", "🐅"),
 (AN, "What is this?", ["bird", "fish", "ladybird", "monkey"], 0, "ציפור = bird", "🐦"),
 (AN, "What is this?", ["ladybird", "bird", "octopus", "cat"], 0, "פרת משה רבנו = ladybird", "🐞"),
 (AN, "What is this?", ["monkey", "giraffe", "lion", "dog"], 0, "קוף = monkey", "🐒"),
 (AN, "What is this?", ["octopus", "fish", "alligator", "bird"], 0, "תמנון = octopus", "🐙"),
 (AN, "What is this?", ["elephant", "giraffe", "tiger", "monkey"], 0, "פיל = elephant", "🐘"),
 (AN, "What is this?", ["giraffe", "elephant", "lion", "alligator"], 0, "ג'ירפה = giraffe", "🦒"),
 (AN, "What is this?", ["fish", "octopus", "bird", "cat"], 0, "דג = fish", "🐟"),
]))

C.append(("Prepositions", [PR], [
 (PR, "The cat is ___ the box.", ["on", "in", "under", "next to"], 0, "החתול על הקופסה = on", [("📦", 50, 66, 50), ("🐈", 50, 30, 30)]),
 (PR, "The cat is ___ the chair.", ["under", "on", "in", "next to"], 0, "החתול מתחת לכיסא = under", [("🪑", 50, 42, 52), ("🐈", 50, 80, 22)]),
 (PR, "The cat is ___ the dog.", ["next to", "on", "under", "in"], 0, "החתול ליד הכלב = next to", [("🐈", 34, 60, 32), ("🐕", 68, 60, 32)]),
 (PR, "The dog is ___ the tree.", ["in front of", "on", "in", "on top of"], 0, "הכלב לפני העץ = in front of", [("🌳", 50, 40, 62), ("🐕", 50, 62, 30)]),
 (PR, "The bird is ___ the house.", ["on top of", "under", "in", "in front of"], 0, "הציפור מעל הבית – על הגג = on top of", [("🏠", 50, 64, 48), ("🐦", 50, 36, 22)]),
 (PR, "על = ?", ["on", "in", "under", "next to"], 0, "על = on", [("📕", 50, 68, 40), ("🍎", 50, 36, 26)]),
 (PR, "בתוך = ?", ["in", "on", "under", "next to"], 0, "בתוך = in (הילד בתוך האמבטיה)", [("🛀", 50, 52, 56)]),
 (PR, "מעל = ?", ["on top of", "under", "next to", "in front of"], 0, "מעל = on top of (הציפור מעל העץ)", [("🌳", 50, 64, 50), ("🐦", 50, 22, 22)]),
 (PR, "מתחת = ?", ["under", "on", "in", "next to"], 0, "מתחת = under", [("☂️", 50, 34, 44), ("🧒", 50, 74, 28)]),
 (PR, "ליד = ?", ["next to", "under", "in", "on"], 0, "ליד = next to", [("🧒", 36, 58, 32), ("🧒", 64, 58, 32)]),
 (PR, "לפני = ?", ["in front of", "next to", "on top of", "under"], 0, "לפני = in front of", [("🏠", 50, 40, 54), ("🚗", 50, 62, 34)]),
]))

C.append(("Verbs", [VE], [
 (VE, "Which verb?", ["run", "swim", "sleep", "eat"], 0, "לרוץ = run", [("🏃", 50, 52, 56)]),
 (VE, "Which verb?", ["swim", "fly", "run", "jump"], 0, "לשחות = swim", [("🏊", 50, 52, 56)]),
 (VE, "Which verb?", ["fly", "swim", "jump", "drink"], 0, "לעוף = fly", [("🕊️", 50, 40, 52), ("☁️", 22, 24, 22)]),
 (VE, "Which verb?", ["sleep", "eat", "cut", "run"], 0, "לישון = sleep", [("😴", 50, 52, 56)]),
 (VE, "Which verb?", ["eat", "drink", "sleep", "cut"], 0, "לאכול = eat", [("😋", 38, 52, 40), ("🍕", 70, 58, 30)]),
 (VE, "Which verb?", ["drink", "eat", "swim", "fly"], 0, "לשתות = drink", [("🥤", 50, 52, 56)]),
 (VE, "Which verb?", ["cut", "jump", "drink", "sleep"], 0, "לגזור = cut", [("✂️", 40, 48, 44), ("📄", 70, 58, 32)]),
 (VE, "Which verb?", ["jump", "run", "fly", "swim"], 0, "לקפוץ = jump", [("🐸", 50, 50, 56)]),
 (VE, "לשתות = ?", ["drink", "eat", "cut", "sleep"], 0, "לשתות = drink", [("🧃", 50, 52, 50)]),
 (VE, "לקפוץ = ?", ["jump", "eat", "run", "fly"], 0, "לקפוץ = jump", [("🐸", 50, 52, 50)]),
 (VE, "לישון = ?", ["sleep", "eat", "jump", "cut"], 0, "לישון = sleep", [("🛌", 50, 52, 54)]),
]))

C.append(("Missing letter", [ML], [
 (ML, "c_t", ["a", "i", "e", "y"], 0, "c-a-t = cat", [("🐈", 50, 52, 56)]),
 (ML, "d_g", ["o", "e", "y", "w"], 0, "d-o-g = dog", [("🐕", 50, 52, 56)]),
 (ML, "f_sh", ["i", "a", "e", "u"], 0, "f-i-s-h = fish", [("🐟", 50, 52, 56)]),
 (ML, "b_rd", ["i", "o", "u", "e"], 0, "b-i-r-d = bird", [("🐦", 50, 52, 56)]),
 (ML, "l_on", ["i", "e", "a", "u"], 0, "l-i-o-n = lion", [("🦁", 50, 52, 56)]),
 (ML, "ti_er", ["g", "j", "q", "p"], 0, "t-i-g-e-r = tiger", [("🐅", 50, 52, 56)]),
 (ML, "monk_y", ["e", "a", "i", "o"], 0, "monkey = קוף", [("🐒", 50, 52, 56)]),
 (ML, "elep_ant", ["h", "k", "n", "f"], 0, "elephant = פיל", [("🐘", 50, 52, 56)]),
 (ML, "j_mp", ["u", "a", "o", "i"], 0, "j-u-m-p = jump", [("🐸", 50, 52, 56)]),
 (ML, "s_im", ["w", "v", "m", "u"], 0, "s-w-i-m = swim", [("🏊", 50, 52, 56)]),
 (ML, "_reen", ["g", "q", "c", "b"], 0, "g-r-e-e-n = green", [("💚", 50, 52, 50)]),
]))

C.append(("Review", [AN, CO, VE], [
 (AN, "כלב = ?", ["dog", "cat", "bird", "fish"], 0, "כלב = dog", [("🐕", 50, 52, 50)]),
 (AN, "פיל = ?", ["elephant", "giraffe", "lion", "tiger"], 0, "פיל = elephant", [("🐘", 50, 52, 50)]),
 (AN, "ג'ירפה = ?", ["giraffe", "elephant", "monkey", "alligator"], 0, "ג'ירפה = giraffe", [("🦒", 50, 52, 50)]),
 (AN, "פרת משה רבנו = ?", ["ladybird", "bird", "octopus", "fish"], 0, "פרת משה רבנו = ladybird", [("🐞", 50, 52, 50)]),
 (AN, "תנין = ?", ["alligator", "octopus", "tiger", "lion"], 0, "תנין = alligator", [("🐊", 50, 52, 50)]),
 (CO, "ירוק = ?", ["green", "gray", "blue", "brown"], 0, "ירוק = green", [("🍏", 50, 52, 50)]),
 (CO, "סגול = ?", ["purple", "orange", "red", "black"], 0, "סגול = purple", [("💜", 50, 52, 50)]),
 (CO, "אפור = ?", ["gray", "green", "black", "brown"], 0, "אפור = gray", [("🐘", 50, 52, 50)]),
 (VE, "לרוץ = ?", ["run", "swim", "jump", "fly"], 0, "לרוץ = run", [("🏃‍♀️", 50, 52, 50)]),
 (VE, "לגזור = ?", ["cut", "eat", "drink", "run"], 0, "לגזור = cut", [("✂️", 50, 52, 50)]),
 (VE, "לאכול = ?", ["eat", "drink", "sleep", "fly"], 0, "לאכול = eat", [("🍎", 50, 52, 50)]),
]))

WORD_LIST = """on|in|on top of|under|in front of|next to|red|green|black|gray|brown|blue|orange|purple|dog|cat|lion|alligator|tiger|bird|ladybird|monkey|octopus|elephant|giraffe|fish|drink|cut|jump|run|eat|swim|fly|sleep""".split("|")

# station type on the map
KINDS = {"ABC: big & small A–M": "abc", "ABC: big & small N–Z": "abc", "ABC: order & first letter": "abc", "Missing letter": "abc", "Prepositions": "gram",
         "Two words for each letter A–F": "abc", "Two words for each letter G–M": "abc", "Two words for each letter N–S": "abc", "Two words for each letter T–Z": "abc"}

QA = {"fixed": 12}   # reworded after the independent review
