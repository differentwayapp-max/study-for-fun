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
WORD_LIST = """on|in|on top of|under|in front of|next to|red|green|black|gray|brown|blue|orange|purple|dog|cat|lion|alligator|tiger|bird|ladybird|monkey|octopus|elephant|giraffe|fish|drink|cut|jump|run|eat|swim|fly|sleep""".split("|")
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


# First letter – ONLY words from the class vocabulary (WORD_LIST). Letters with no class word
# (h, k, q, v, w, x, y, z) are practised in the big & small and the order chapters.
PIC = {"alligator": "🐊", "black": "⚫", "brown": "🌰", "blue": "🔵", "bird": "🐦", "cat": "🐈", "cut": "✂️", "dog": "🐕",
       "drink": "🥤", "elephant": "🐘", "eat": "🍽️", "fish": "🐟", "fly": "✈️", "green": "💚", "gray": "", "giraffe": "🦒",
       "in": "", "in front of": "", "jump": "🤸", "lion": "🦁", "ladybird": "🐞", "monkey": "🐒", "next to": "", "on": "",
       "on top of": "", "orange": "🍊", "octopus": "🐙", "purple": "💜", "red": "🔴", "run": "🏃", "swim": "🏊", "sleep": "😴",
       "tiger": "🐅", "under": ""}
HEB = {"gray": "אפור", "in": "בתוך", "in front of": "לפני", "next to": "ליד", "on": "על", "on top of": "מעל", "under": "מתחת"}
def first_letter(lo, hi):
    out, pool = [], ["alligator", "black", "cat", "dog", "elephant", "fish", "green", "jump", "lion", "monkey", "orange",
                     "purple", "red", "swim", "tiger", "under", "bird", "drink", "giraffe", "octopus", "sleep", "run", "eat", "fly"]
    words = [w for w in WORD_LIST if lo <= w[0] <= hi]
    for i, w in enumerate(words):
        L = w[0]
        bad = [x for x in pool if x[0] != L]
        d = []
        k = 0
        while len(d) < 3: x = bad[(i * 5 + k * 7) % len(bad)]; k += 1; d += [x] if x not in d else []
        heb = HEB.get(w)
        ex = f"{w} = {heb}, מתחיל ב-{L.upper()}" if heb else f"{w} מתחיל ב-{L.upper()}"
        sc = [(L.upper(), 26, 50, 40), (PIC[w], 70, 52, 40)] if PIC[w] else [(L.upper(), 50, 50, 56)]
        out.append((AB, f"{L.upper()} is for…" if PIC[w] else f"{L.upper()} is for… ({heb})", [w] + d, 0, ex, sc))
    return out
C.append(("First letter A–D", [AB], first_letter("a", "d")))
C.append(("First letter E–L", [AB], first_letter("e", "l")))
C.append(("First letter M–O", [AB], first_letter("m", "o")))
C.append(("First letter P–U", [AB], first_letter("p", "u")))

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
 (VE, "קופצים גבוה = ?", ["jump", "run", "fly", "swim"], 0, "לקפוץ = jump", [("🤸", 50, 50, 56)]),
 (VE, "לשתות = ?", ["drink", "eat", "cut", "sleep"], 0, "לשתות = drink", [("🧃", 50, 52, 50)]),
 (VE, "לקפוץ = ?", ["jump", "eat", "run", "fly"], 0, "לקפוץ = jump", [("🤸", 50, 52, 50)]),
 (VE, "לישון = ?", ["sleep", "eat", "jump", "cut"], 0, "לישון = sleep", [("🛌", 50, 52, 54)]),
]))

C.append(("Missing letter", [ML], [
 (ML, "c_t (חתול)", ["a", "i", "e", "y"], 0, "c-a-t = cat", [("🐈", 50, 52, 56)]),
 (ML, "d_g (כלב)", ["o", "e", "y", "w"], 0, "d-o-g = dog", [("🐕", 50, 52, 56)]),
 (ML, "f_sh (דג)", ["i", "a", "e", "u"], 0, "f-i-s-h = fish", [("🐟", 50, 52, 56)]),
 (ML, "b_rd (ציפור)", ["i", "o", "u", "e"], 0, "b-i-r-d = bird", [("🐦", 50, 52, 56)]),
 (ML, "l_on (אריה)", ["i", "e", "a", "u"], 0, "l-i-o-n = lion", [("🦁", 50, 52, 56)]),
 (ML, "ti_er (נמר)", ["g", "j", "q", "p"], 0, "t-i-g-e-r = tiger", [("🐅", 50, 52, 56)]),
 (ML, "monk_y (קוף)", ["e", "a", "i", "o"], 0, "monkey = קוף", [("🐒", 50, 52, 56)]),
 (ML, "elep_ant (פיל)", ["h", "k", "n", "f"], 0, "elephant = פיל", [("🐘", 50, 52, 56)]),
 (ML, "j_mp (לקפוץ)", ["u", "a", "o", "i"], 0, "j-u-m-p = jump", [("🤸", 50, 52, 56)]),
 (ML, "s_im (לשחות)", ["w", "v", "m", "u"], 0, "s-w-i-m = swim", [("🏊", 50, 52, 56)]),
 (ML, "_reen (ירוק)", ["g", "q", "c", "b"], 0, "g-r-e-e-n = green", [("💚", 50, 52, 50)]),
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


# station type on the map
KINDS = {"ABC: big & small A–M": "abc", "ABC: big & small N–Z": "abc", "ABC: order & first letter": "abc", "Missing letter": "abc", "Prepositions": "gram",
         "First letter A–D": "abc", "First letter E–L": "abc", "First letter M–O": "abc", "First letter P–U": "abc"}

QA = {"fixed": 12}   # reworded after the independent review
