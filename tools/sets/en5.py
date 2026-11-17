# Practice set: English, grade 5 (כיתה ה') – the whole year, Band I level (Israeli curriculum):
# am / is / are and have / has, Present Simple (he / she / it -s, don't / doesn't, questions),
# Present Progressive (am / is / are + -ing), can / can't and there is / there are, plurals (regular and
# common irregular), subject and object pronouns and possessives, prepositions of place and time,
# question words, a first look at the Past Simple (was / were, regular -ed, basic irregular verbs:
# went, ate, saw, had), telling the time (o'clock, half past, quarter past), Band I vocabulary
# (daily routine and time words, home, food and clothes, weather, hobbies and places in town)
# and three short reading passages (with inference questions).
# Organised by fine topics (≈20 questions each) so a parent can tick only what the test covers.
# Run: python3 -I tools/build_set.py tools/sets/en5.py
import re

BE, PS, PG = "am · is · are · have · has", "Present Simple", "Present Progressive"
CT, PL, PN = "can · there is / are", "Plurals", "Pronouns & possessives"
PP, QW, PA = "Prepositions: place & time", "Question words", "Past: was / were · -ed"
VD, VH, VT = "Words: daily routine & time", "Words: home, food & clothes", "Words: weather, hobbies & town"
RD = "Reading"
PI, TM = "Past: went · ate · saw · had", "Telling the time"

SET = dict(name="English ה'", grade=4, subject="אנגלית",
           title="Grammar · Band I words · Reading",
           desc="אנגלית לכיתה ה' – כל השנה: am/is/are ו-have/has, Present Simple ו-Present Progressive, can ו-there is, רבים, כינויי גוף ושייכות, מילות יחס, מילות שאלה, היכרות ראשונה עם עבר (‎-ed ופעלים לא רגילים: went, ate, saw, had), אמירת השעה (half past, quarter past), אוצר מילים Band I ושלושה קטעי קריאה",
           desc_en="Grade 5 English, the whole year: am/is/are and have/has, Present Simple and Present Progressive, can and there is, plurals, pronouns and possessives, prepositions, question words, a first look at the past (-ed and irregular verbs: went, ate, saw, had), telling the time (half past, quarter past), Band I words and three reading passages",
           tags=["am / is / are", "Present Simple", "Present Progressive", "can / there is", "Plurals",
                 "Pronouns", "Prepositions", "Question words", "Past: was / -ed", "Past: went / ate",
                 "Telling the time", "Band I words", "Reading"],
           examDate="", dailyGoal=2, perRound=10,
           topics=[BE, PS, PG, CT, PL, PN, PP, QW, PA, PI, VD, TM, VH, VT, RD])
MAX_Q_WORDS = 12
ANSWER_IN_Q_OK = True    # short answers ("is", "in", "on") are letters inside other words of the question; every item checked by hand


def W(s): return re.sub(r"\{([^}]*)\}", lambda m: "⁦" + m.group(1) + "⁩", s)
def Q(t, q, opts, ans, expl, sc): return (t, W(q), opts, ans, W(expl), sc)

def ROW(*es):
    """The things the question talks about, side by side."""
    n = len(es); s = min(40, 125 / n); step = min(92 / n, s / 1.6 * 1.35)
    return [(e, round(50 + (j - (n - 1) / 2) * step, 1), 52, round(s)) for j, e in enumerate(es)]

def PW(e, w):
    """The object on the left, the given word on a card on the right."""
    return [(e, 24, 52, 38), (w, 66, 52, round(min(24, 120 / len(w))))]

def ON(top, base):   "the first thing sitting on the second";   return [(base, 50, 64, 50), (top, 50, 30, 28)]
def UNDER(low, top): "the first thing under the second";        return [(top, 50, 36, 52), (low, 50, 76, 22)]
def NEXT(a, b):      "two things side by side";                 return [(a, 32, 56, 36), (b, 68, 56, 36)]


C = []

# ───────────── am · is · are · have · has ─────────────
C.append(("am · is · are", [BE], [
 Q(BE, "My brother is eight, and I ___ eleven.", ["am", "is", "are", "be"], 0, "I ← am", PW("👦", "11")),
 Q(BE, "She ___ my best friend.", ["is", "am", "are", "be"], 0, "she ← is", "👭"),
 Q(BE, "They ___ in the park.", ["are", "is", "am", "be"], 0, "they ← are", ROW("👫", "🌳")),
 Q(BE, "The dog ___ hungry.", ["is", "are", "am", "be"], 0, "the dog = it ← is", ROW("🐕", "🦴")),
 Q(BE, "We ___ happy today.", ["are", "is", "am", "be"], 0, "we ← are", ROW("👪", "😊")),
 Q(BE, "You ___ a good student.", ["are", "is", "am", "be"], 0, "you ← are", ROW("🧒", "⭐")),
 Q(BE, "I ___ not tired.", ["am", "is", "are", "be"], 0, "I ← am not", "😃"),
 Q(BE, "Tom and Dan ___ brothers.", ["are", "is", "am", "be"], 0, "שניים = they ← are", ROW("👦", "👦")),
 Q(BE, "___ you ready?", ["Are", "Is", "Am", "Be"], 0, "שאלה עם you ← Are", ROW("🎒", "⏰")),
 Q(BE, "Is she a teacher? Yes, she ___.", ["is", "are", "am", "does"], 0, "Is she...? ← Yes, she is", "👩‍🏫"),
 Q(BE, "Which is correct?", ["It is cold.", "It are cold.", "It am cold.", "It be cold."], 0, "it ← is", ROW("🥶", "❄️")),
 Q(BE, "My cats ___ black.", ["are", "is", "am", "has"], 0, "cats = רבים ← are", COUNT(("🐈", 2))),
]))

C.append(("have · has", [BE], [
 Q(BE, "I ___ a new bike.", ["have", "has", "am", "is"], 0, "I ← have", "🚲"),
 Q(BE, "He ___ a new ball.", ["has", "have", "is", "are"], 0, "he ← has", ROW("👦", "⚽")),
 Q(BE, "She ___ long hair.", ["has", "have", "is", "are"], 0, "she ← has", "👧"),
 Q(BE, "We ___ two dogs.", ["have", "has", "are", "is"], 0, "we ← have", COUNT(("🐕", 2))),
 Q(BE, "My cat ___ green eyes.", ["has", "have", "is", "are"], 0, "the cat = it ← has", ROW("🐈", "👀")),
 Q(BE, "They ___ a big house.", ["have", "has", "is", "am"], 0, "they ← have", ROW("👪", "🏠")),
 Q(BE, "Dana ___ a little brother.", ["has", "have", "is", "are"], 0, "Dana = she ← has", ROW("👧", "👶")),
 Q(BE, "Do you have a pen? Yes, I ___.", ["do", "does", "am", "is"], 0, "Do you...? ← Yes, I do", "🖊️"),
 Q(BE, "Which is correct?", ["It has wings.", "It have wings.", "It haves wings.", "It is wings."], 0, "it ← has", "🐦"),
 Q(BE, "יש לה = ?", ["She has", "She have", "She is", "Her has"], 0, "יש לה = She has", ROW("👧", "🎁")),
 Q(BE, "Mom and Dad ___ a car.", ["have", "has", "is", "are"], 0, "שניים = they ← have", ROW("👫", "🚗")),
 Q(BE, "A spider ___ eight legs.", ["has", "have", "is", "are"], 0, "a spider = it ← has", PW("🕷️", "8")),
]))

# ───────────── Present Simple ─────────────
C.append(("Present Simple: he plays", [PS], [
 Q(PS, "He ___ football and scores goals.", ["plays", "play", "playing", "playes"], 0, "he ← plays", ROW("👦", "⚽")),
 Q(PS, "I ___ milk in the morning.", ["drink", "drinks", "drinking", "drinkes"], 0, "I ← בלי s", ROW("🥛", "🌅")),
 Q(PS, "She ___ to school by bus.", ["goes", "go", "gos", "going"], 0, "she + go ← goes", ROW("👧", "🚌")),
 Q(PS, "My mom ___ TV at night.", ["watches", "watch", "watchs", "watching"], 0, "אחרי ch מוסיפים es", ROW("👩", "📺")),
 Q(PS, "They ___ in Tel Aviv. It is their home.", ["live", "lives", "living", "lifes"], 0, "they ← בלי s", ROW("👫", "🏙️")),
 Q(PS, "The baby ___ when she is hungry.", ["cries", "crys", "cry", "crying"], 0, "y אחרי עיצור ← ies", "👶"),
 Q(PS, "Dan ___ his teeth every morning.", ["brushes", "brush", "brushs", "brushing"], 0, "אחרי sh מוסיפים es", ROW("👦", "🦷")),
 Q(PS, "We ___ dinner at seven.", ["eat", "eats", "eating", "eates"], 0, "we ← בלי s", ROW("🍽️", "🕖")),
 Q(PS, "The shop ___ at nine.", ["opens", "open", "opening", "opend"], 0, "the shop = it ← opens", ROW("🏪", "🕘")),
 Q(PS, "My dog is tired. He ___ in his bed.", ["sleeps", "sleep", "sleeping", "sleepes"], 0, "the dog = he / it ← sleeps", ROW("🐕", "🛏️")),
 Q(PS, "Which is correct?", ["She reads books.", "She readed books.", "She reading books.", "She reades books."], 0, "she ← reads", ROW("👧", "📚")),
 Q(PS, "Lea ___ the piano.", ["plays", "play", "plaies", "playing"], 0, "y אחרי תנועה ← רק s", "🎹"),
]))

C.append(("Present Simple: don't · doesn't · Do?", [PS], [
 Q(PS, "I ___ like fish.", ["don't", "doesn't", "isn't", "not"], 0, "I ← don't", ROW("🐟", "👎")),
 Q(PS, "He ___ eat meat. He eats only vegetables.", ["doesn't", "don't", "isn't", "not"], 0, "he ← doesn't", ROW("👦", "🍖")),
 Q(PS, "She doesn't ___ coffee.", ["drink", "drinks", "drinking", "drank"], 0, "אחרי doesn't ← בלי s", ROW("👩", "☕")),
 Q(PS, "They ___ walk to school. They go by bus.", ["don't", "doesn't", "aren't", "isn't"], 0, "they ← don't", ROW("👫", "🏫")),
 Q(PS, "___ you like pizza?", ["Do", "Does", "Are", "Is"], 0, "you ← Do", "🍕"),
 Q(PS, "___ she play tennis?", ["Does", "Do", "Is", "Are"], 0, "she ← Does", ROW("👧", "🎾")),
 Q(PS, "Does he ___ English?", ["speak", "speaks", "speaking", "spoke"], 0, "אחרי Does ← בלי s", ROW("👦", "💬")),
 Q(PS, "Do they live here? Yes, they ___.", ["do", "does", "are", "is"], 0, "Do ← Yes, they do", ROW("👫", "🏠")),
 Q(PS, "Does your cat swim? No, it ___.", ["doesn't", "don't", "isn't", "not"], 0, "Does ← No, it doesn't", ROW("🐈", "🌊")),
 Q(PS, "My dad ___ work on Saturday. He rests at home.", ["doesn't", "don't", "isn't", "not"], 0, "dad = he ← doesn't", ROW("👨", "🗓️")),
 Q(PS, "Which is correct?", ["He doesn't run.", "He don't run.", "He doesn't runs.", "He not run."], 0, "he ← doesn't + פועל בלי s", "🏃"),
 Q(PS, "We ___ have a car.", ["don't", "doesn't", "aren't", "not"], 0, "we ← don't", ROW("🚗", "❌")),
]))

# ───────────── Present Progressive ─────────────
C.append(("Present Progressive: is playing", [PG], [
 Q(PG, "Look! The boy ___ running.", ["is", "are", "am", "does"], 0, "the boy = he ← is + ing", "🏃"),
 Q(PG, "I am ___ a book. I am on page 5.", ["reading", "read", "reads", "readed"], 0, "am + ing ← reading", "📖"),
 Q(PG, "They ___ swimming in the pool.", ["are", "is", "am", "do"], 0, "they ← are + ing", ROW("🏊", "🏊‍♀️")),
 Q(PG, "She is ___ a cake.", ["making", "makeing", "make", "makes"], 0, "make ← מורידים e: making", ROW("👩", "🎂")),
 Q(PG, "He is ___ in the sea, like a fish.", ["swimming", "swiming", "swim", "swims"], 0, "swim ← מכפילים m: swimming", ROW("🏊", "🌊")),
 Q(PG, "We ___ eating lunch now.", ["are", "is", "am", "do"], 0, "we ← are", ROW("👪", "🍝")),
 Q(PG, "Listen! The baby ___.", ["is crying", "cries", "crying", "are crying"], 0, "Listen! = עכשיו ← is crying", "👶"),
 Q(PG, "Shh! Dad ___ sleeping.", ["is", "are", "am", "does"], 0, "dad = he ← is", ROW("👨", "😴")),
 Q(PG, "It ___ raining now.", ["is", "are", "am", "does"], 0, "it ← is", "🌧️"),
 Q(PG, "The cat is ___ on the sofa.", ["sitting", "siting", "sit", "sits"], 0, "sit ← מכפילים t: sitting", ON("🐈", "🛋️")),
 Q(PG, "Is he riding a bike? Yes, he ___.", ["is", "does", "are", "has"], 0, "Is he...? ← Yes, he is", ROW("👦", "🚲")),
 Q(PG, "Are you writing? No, I ___.", ["am not", "are not", "is not", "don't"], 0, "Are you...? ← No, I am not", ROW("✏️", "📓")),
]))

C.append(("Now or every day?", [PG], [
 Q(PG, "I ___ football now.", ["am playing", "play", "plays", "playing"], 0, "now ← am playing", ROW("⚽", "⏰")),
 Q(PG, "She ___ to school every day.", ["walks", "is walking", "walking", "walk"], 0, "every day ← הרגל: walks", ROW("👧", "🏫")),
 Q(PG, "Look! It ___.", ["is snowing", "snows", "snowing", "snow"], 0, "Look! = עכשיו ← is snowing", "🌨️"),
 Q(PG, "He usually ___ tea.", ["drinks", "is drinking", "drinking", "drink"], 0, "usually ← הרגל: drinks", "🍵"),
 Q(PG, "We ___ TV right now.", ["are watching", "watch", "watches", "is watching"], 0, "right now ← are watching", "📺"),
 Q(PG, "Dad ___ the car every Friday.", ["washes", "is washing", "washing", "wash"], 0, "every Friday ← הרגל: washes", ROW("👨", "🚗")),
 Q(PG, "Which time word goes with \"is playing\"?", ["now", "every day", "usually", "always"], 0, "is playing ← קורה עכשיו: now", TXT("is playing")),
 Q(PG, "Which time word goes with \"plays\"?", ["every day", "now", "right now", "at the moment"], 0, "plays ← הרגל: every day", TXT("plays")),
 Q(PG, "Listen! The birds ___.", ["are singing", "sing", "sings", "is singing"], 0, "Listen! + birds ← are singing", COUNT(("🐦", 2))),
 Q(PG, "Which is correct?", ["She is reading.", "She reading.", "She is read.", "She are reading."], 0, "she ← is + reading", ROW("👧", "📖")),
 Q(PG, "My brother ___ his homework now.", ["is doing", "does", "do", "doing"], 0, "now ← is doing", ROW("👦", "📓")),
 Q(PG, "On Fridays we ___ pizza.", ["eat", "are eating", "eats", "eating"], 0, "On Fridays = כל שישי ← eat", "🍕"),
]))

# ───────────── can · there is / are ─────────────
C.append(("can · can't", [CT], [
 Q(CT, "A fish ___ swim.", ["can", "can't", "is", "has"], 0, "דג יודע לשחות ← can", "🐟"),
 Q(CT, "A dog ___ fly.", ["can't", "can", "is", "does"], 0, "כלב לא יכול לעוף ← can't", "🐕"),
 Q(CT, "Birds ___ fly.", ["can", "can't", "are", "has"], 0, "ציפורים יכולות לעוף ← can", "🐦"),
 Q(CT, "I can ___ a bike.", ["ride", "rides", "riding", "to ride"], 0, "אחרי can ← צורת בסיס", "🚲"),
 Q(CT, "She can ___ a song very well.", ["sing", "sings", "singing", "to sing"], 0, "אחרי can ← בלי s", ROW("👧", "🎤")),
 Q(CT, "___ you swim? Yes, I can.", ["Can", "Do", "Are", "Is"], 0, "Yes, I can ← Can you...?", "🏊"),
 Q(CT, "Can a cat read? No, it ___.", ["can't", "can", "doesn't", "isn't"], 0, "Can...? ← No, it can't", ROW("🐈", "📖")),
 Q(CT, "A baby ___ drive a car.", ["can't", "can", "does", "is"], 0, "תינוק לא יכול לנהוג ← can't", ROW("👶", "🚗")),
 Q(CT, "Which is correct?", ["He can jump.", "He cans jump.", "He can jumps.", "He can jumping."], 0, "can + פועל בלי s", ROW("👦", "⬆️")),
 Q(CT, "לא יכול = ?", ["can't", "can", "don't", "isn't"], 0, "לא יכול = can't", "🚫"),
 Q(CT, "A penguin can swim, but it ___ fly.", ["can't", "can", "isn't", "aren't"], 0, "פינגווין לא יכול לעוף ← can't", "🐧"),
 Q(CT, "Can you ___ English?", ["speak", "speaks", "speaking", "spoke"], 0, "אחרי can ← צורת בסיס", "💬"),
]))

C.append(("there is · there are", [CT], [
 Q(CT, "There ___ a cat on the bed.", ["is", "are", "am", "be"], 0, "אחד ← There is", ON("🐈", "🛏️")),
 Q(CT, "How many apples ___ there? Five.", ["are", "is", "am", "do"], 0, "apples = רבים ← are there", COUNT(("🍎", 5))),
 Q(CT, "There ___ two cars in the street.", ["are", "is", "am", "be"], 0, "שתיים ← There are", COUNT(("🚗", 2))),
 Q(CT, "There is ___ egg in the box.", ["an", "a", "two", "some"], 0, "לפני תנועה (egg) ← an", "🥚"),
 Q(CT, "How many birds? There are ___.", ["four", "three", "five", "two"], 0, "סופרים: four = 4", COUNT(("🐦", 4))),
 Q(CT, "___ there a park near your house?", ["Is", "Are", "Am", "Do"], 0, "a park = אחד ← Is there", ROW("🏠", "🌳")),
 Q(CT, "Are there any cookies? Yes, there ___.", ["are", "is", "am", "do"], 0, "Are there? ← Yes, there are", COUNT(("🍪", 3))),
 Q(CT, "Is there any milk? No, there ___.", ["isn't", "aren't", "don't", "not"], 0, "Is there? ← No, there isn't", ROW("🥛", "❌")),
 Q(CT, "There ___ any kids in the park.", ["aren't", "isn't", "no", "don't"], 0, "kids = רבים ← aren't", ROW("🌳", "❌")),
 Q(CT, "Which is correct?", ["There are cats.", "There is cats.", "There are cat.", "There am cats."], 0, "רבים ← There are + cats", COUNT(("🐈", 3))),
 Q(CT, "There ___ a big tree in our garden.", ["is", "are", "has", "have"], 0, "עץ אחד ← There is", ROW("🌳", "🏡")),
 Q(CT, "There ___ seven days in a week.", ["are", "is", "has", "am"], 0, "7 ימים = רבים ← are", "🗓️"),
]))

# ───────────── Plurals ─────────────
C.append(("Plurals: -s · -es · -ies", [PL], [
 Q(PL, "one book, two ___", ["books", "bookes", "book", "bookies"], 0, "רוב המילים ← מוסיפים s", COUNT(("📕", 2))),
 Q(PL, "one box, three ___", ["boxes", "boxs", "box", "boxies"], 0, "אחרי x ← es", COUNT(("📦", 3))),
 Q(PL, "one baby, two ___", ["babies", "babys", "babyes", "baby"], 0, "y אחרי עיצור ← ies", COUNT(("👶", 2))),
 Q(PL, "one fox, two ___", ["foxes", "foxs", "fox", "foxies"], 0, "אחרי x ← es", COUNT(("🦊", 2))),
 Q(PL, "one boy, four ___", ["boys", "boies", "boyes", "boy"], 0, "y אחרי תנועה ← רק s", COUNT(("👦", 4))),
 Q(PL, "one watch, two ___", ["watches", "watchs", "watch", "watchies"], 0, "אחרי ch ← es", COUNT(("⌚", 2))),
 Q(PL, "one dish, three ___", ["dishes", "dishs", "dish", "dishies"], 0, "אחרי sh ← es", COUNT(("🍽️", 3))),
 Q(PL, "one city, two ___", ["cities", "citys", "cityes", "city"], 0, "y אחרי עיצור ← ies", COUNT(("🏙️", 2))),
 Q(PL, "one key, two ___", ["keys", "kies", "keyes", "key"], 0, "y אחרי תנועה ← רק s", COUNT(("🔑", 2))),
 Q(PL, "one tomato, three ___", ["tomatoes", "tomatos", "tomato", "tomatoss"], 0, "tomato ← מוסיפים es", COUNT(("🍅", 3))),
 Q(PL, "Which of these words is plural?", ["bags", "bag", "a bag", "one bag"], 0, "רבים = יותר מאחד ← s", "👜"),
 Q(PL, "one dress, two ___", ["dresses", "dresss", "dressies", "dress"], 0, "אחרי ss ← es", COUNT(("👗", 2))),
]))

C.append(("Irregular plurals: man – men", [PL], [
 Q(PL, "one man, two ___", ["men", "mans", "mens", "manes"], 0, "man – men (יוצא דופן)", COUNT(("👨", 2))),
 Q(PL, "one woman, three ___", ["women", "womans", "womens", "woman"], 0, "woman – women (יוצא דופן)", COUNT(("👩", 3))),
 Q(PL, "one child, many ___", ["children", "childs", "childrens", "childes"], 0, "child – children (יוצא דופן)", COUNT(("🧒", 4))),
 Q(PL, "one foot, two ___", ["feet", "foots", "feets", "footes"], 0, "foot – feet (יוצא דופן)", COUNT(("🦶", 2))),
 Q(PL, "one tooth, many ___", ["teeth", "tooths", "teeths", "toothes"], 0, "tooth – teeth (יוצא דופן)", "🦷"),
 Q(PL, "one mouse, two ___", ["mice", "mouses", "mices", "mouse"], 0, "mouse – mice (יוצא דופן)", COUNT(("🐁", 2))),
 Q(PL, "one sheep, three ___", ["sheep", "sheeps", "sheepes", "sheepies"], 0, "sheep – sheep (אותה מילה)", COUNT(("🐑", 3))),
 Q(PL, "one fish, two ___", ["fish", "fishs", "fishies", "fishen"], 0, "fish – fish (אותה מילה)", COUNT(("🐟", 2))),
 Q(PL, "Tom and Mia are ___. They are seven.", ["children", "child", "childs", "childrens"], 0, "רבים של child ← children", ROW("👦", "👧")),
 Q(PL, "Which plural is NOT correct?", ["mans", "men", "women", "feet"], 0, "נכון: men, לא mans", ROW("👨", "👩", "🦶")),
 Q(PL, "I brush my ___ every day.", ["teeth", "tooths", "teeths", "toothes"], 0, "רבים של tooth ← teeth", ROW("🦷", "🌅")),
 Q(PL, "The cat sees three ___ (mouse).", ["mice", "mouses", "mices", "mouse"], 0, "רבים של mouse ← mice", ROW("🐈", "🐁", "🐁", "🐁")),
]))

# ───────────── Pronouns & possessives ─────────────
C.append(("Pronouns: I – me · he – him", [PN], [
 Q(PN, "Dan is my friend. ___ is ten.", ["He", "She", "It", "They"], 0, "Dan = בן ← He", "👦"),
 Q(PN, "Mia is nice. I like ___.", ["her", "she", "him", "they"], 0, "Mia = בת, אחרי הפועל ← her", "👧"),
 Q(PN, "This is my friend Tom. Please call ___.", ["him", "he", "his", "her"], 0, "Tom = בן, אחרי הפועל ← him", ROW("👦", "📞")),
 Q(PN, "Dana and I are friends. ___ play together.", ["We", "They", "Us", "She"], 0, "Dana and I = אנחנו ← We", "👭"),
 Q(PN, "Where is the ball? I can't see ___.", ["it", "him", "she", "them"], 0, "ball = דבר אחד ← it", "⚽"),
 Q(PN, "The kids are here. Look at ___!", ["them", "they", "their", "us"], 0, "kids = הם, אחרי at ← them", ROW("🧒", "🧒")),
 Q(PN, "Can you help ___? I'm lost.", ["me", "I", "my", "mine"], 0, "אותי / לי = me", ROW("🙋", "🗺️")),
 Q(PN, "Mom loves ___ – me and my sister.", ["us", "we", "our", "them"], 0, "me and my sister = אותנו ← us", ROW("👩", "👧", "👧")),
 Q(PN, "אותנו = ?", ["us", "we", "our", "them"], 0, "אותנו = us", "👪"),
 Q(PN, "הם / הן = ?", ["they", "them", "their", "there"], 0, "הם / הן = they", "👫"),
 Q(PN, "The cat is hungry. Give ___ its food.", ["it", "its", "they", "we"], 0, "the cat = it", ROW("🐈", "🍽️")),
 Q(PN, "I → ___ (אותי)", ["me", "my", "mine", "I'm"], 0, "I → me = אותי", "🙋"),
]))

C.append(("my · your · his · her", [PN], [
 Q(PN, "I have a dog. ___ dog is brown.", ["My", "Me", "I", "Mine"], 0, "שלי + שם עצם ← My", ROW("🙋", "🐕")),
 Q(PN, "Tom has a bike. ___ bike is red.", ["His", "Her", "He", "Him"], 0, "של Tom = שלו ← His", ROW("👦", "🚲")),
 Q(PN, "Lea has a cat. ___ cat is white.", ["Her", "His", "She", "Hers"], 0, "של Lea = שלה ← Her", ROW("👧", "🐈")),
 Q(PN, "Is this ___ bag, Dan? Yes, it's mine.", ["your", "you", "yours", "you're"], 0, "שלך + שם עצם ← your", "🎒"),
 Q(PN, "We love ___ school. We learn a lot there.", ["our", "us", "we", "ours"], 0, "שלנו + שם עצם ← our", "🏫"),
 Q(PN, "They live in a big house. ___ house is new.", ["Their", "They", "There", "Them"], 0, "שלהם ← Their", ROW("👪", "🏠")),
 Q(PN, "In autumn the tree loses ___ leaves.", ["its", "it's", "it", "it is"], 0, "its = שלו (של דבר)", ROW("🌳", "🍂")),
 Q(PN, "שלה = ?", ["her", "his", "she", "your"], 0, "שלה = her", "👧"),
 Q(PN, "שלו = ?", ["his", "her", "he", "him"], 0, "שלו = his", "👦"),
 Q(PN, "I am Dana. ___ name is Dana.", ["My", "Me", "I", "Your"], 0, "השם שלי ← My name", ROW("👧", "📛")),
 Q(PN, "Which is correct?", ["her hat", "she hat", "hers hat", "her's hat"], 0, "שלה + שם עצם ← her", "👒"),
 Q(PN, "Tom and Dan have a ball. They play with ___ ball.", ["their", "them", "they", "there"], 0, "של Tom ו-Dan ← their", ROW("👦", "👦", "⚽")),
]))

# ───────────── Prepositions: place & time ─────────────
C.append(("Where? in · on · under · next to", [PP], [
 Q(PP, "The cat is ___ the box.", ["on", "in", "under", "at"], 0, "החתול על הקופסה ← on", ON("🐈", "📦")),
 Q(PP, "The dog is ___ the bed.", ["under", "on", "in", "at"], 0, "הכלב מתחת למיטה ← under", [("🛏️", 50, 40, 56), ("🐕", 50, 68, 20)]),
 Q(PP, "The baby is ___ the bath.", ["in", "on", "at", "under"], 0, "בתוך האמבטיה ← in", "🛀"),
 Q(PP, "The chair is ___ the table.", ["next to", "on", "under", "in"], 0, "הכיסא ליד השולחן ← next to", NEXT("💺", "🍽️")),
 Q(PP, "The girl is ___ the umbrella.", ["under", "on", "in", "at"], 0, "הילדה מתחת למטרייה ← under", UNDER("👧", "☂️")),
 Q(PP, "The shop is ___ the bank.", ["next to", "under", "in", "on"], 0, "החנות ליד הבנק ← next to", NEXT("🏪", "🏦")),
 Q(PP, "לידי = ?", ["next to me", "next to you", "under me", "on me"], 0, "לידי = next to me", NEXT("🐕", "🙋")),
 Q(PP, "על הספר = ?", ["on the book", "under the book", "in the book", "at the book"], 0, "על הספר = on the book", ON("🍎", "📕")),
 Q(PP, "מתחתיו = ?", ["under it", "on it", "in it", "next to it"], 0, "מתחתיו = under it", UNDER("📦", "🛏️")),
 Q(PP, "I live ___ Haifa.", ["in", "on", "at", "under"], 0, "בעיר ← in", "🏙️"),
 Q(PP, "The picture is ___ the wall.", ["on", "in", "under", "at"], 0, "על הקיר ← on the wall", "🖼️"),
]))

C.append(("When? in · on · at", [PP], [
 Q(PP, "My birthday is ___ May.", ["in", "on", "at", "to"], 0, "חודש ← in", ROW("🎂", "📅")),
 Q(PP, "We have English ___ Monday.", ["on", "in", "at", "to"], 0, "יום ← on", "🗓️"),
 Q(PP, "School starts ___ eight o'clock.", ["at", "in", "on", "to"], 0, "שעה ← at", ROW("🏫", "🕗")),
 Q(PP, "It is cold ___ winter.", ["in", "on", "at", "to"], 0, "עונה ← in", "❄️"),
 Q(PP, "I go to bed ___ night.", ["at", "in", "on", "to"], 0, "at night = בלילה", ROW("🛏️", "🌙")),
 Q(PP, "We swim in the sea ___ summer.", ["in", "on", "at", "to"], 0, "עונה ← in", ROW("🏊", "☀️")),
 Q(PP, "The party is ___ Friday.", ["on", "in", "at", "to"], 0, "יום ← on", "🎉"),
 Q(PP, "I drink milk ___ the morning.", ["in", "on", "at", "to"], 0, "in the morning = בבוקר", ROW("🥛", "🌅")),
 Q(PP, "The film starts ___ 6:30.", ["at", "in", "on", "to"], 0, "שעה ← at", ROW("🎬", "🕡")),
 Q(PP, "Which is correct?", ["on Sunday", "in Sunday", "at Sunday", "to Sunday"], 0, "יום בשבוע ← on", "📆"),
 Q(PP, "Which is correct?", ["at 5 o'clock", "on 5 o'clock", "in 5 o'clock", "to 5 o'clock"], 0, "שעה ← at", "🕔"),
 Q(PP, "The flowers open ___ spring.", ["in", "on", "at", "to"], 0, "עונה ← in", "🌸"),
]))

# ───────────── Question words ─────────────
C.append(("Who · What · Where", [QW], [
 Q(QW, "___ is your teacher? Ms. Cohen.", ["Who", "What", "Where", "When"], 0, "שואלים על אדם ← Who", "👩‍🏫"),
 Q(QW, "___ is your name? Dana.", ["What", "Who", "Where", "How"], 0, "מה השם? ← What", ROW("👧", "📛")),
 Q(QW, "___ do you live? In Haifa.", ["Where", "What", "Who", "When"], 0, "מקום ← Where", "🏙️"),
 Q(QW, "___ is in the box? A ball.", ["What", "Who", "Where", "Why"], 0, "דבר ← What", ROW("📦", "⚽")),
 Q(QW, "___ is the bus stop? Next to the bank.", ["Where", "What", "Who", "When"], 0, "מקום ← Where", ROW("🚏", "🏦")),
 Q(QW, "___ is that boy? My brother.", ["Who", "What", "Where", "How"], 0, "אדם ← Who", "👦"),
 Q(QW, "___ do you eat for breakfast? Eggs.", ["What", "Where", "Who", "Why"], 0, "מה אוכלים? ← What", "🍳"),
 Q(QW, "איפה = ?", ["Where", "When", "What", "Who"], 0, "איפה = Where", "🗺️"),
 Q(QW, "מי = ?", ["Who", "What", "Why", "How"], 0, "מי = Who", ROW("👦", "👧")),
 Q(QW, "Who is at the door?", ["My mom", "At five", "In the kitchen", "A red ball"], 0, "Who ← עונים אדם", "🚪"),
 Q(QW, "Where is Grandpa?", ["In the garden", "At ten", "A big cake", "My uncle"], 0, "Where ← עונים מקום", "👴"),
]))

C.append(("When · Why · How many", [QW], [
 Q(QW, "___ is your birthday? In June.", ["When", "Where", "Who", "Why"], 0, "זמן ← When", "🎂"),
 Q(QW, "___ are you sad? Because I'm sick.", ["Why", "When", "What", "Where"], 0, "Because ← השאלה Why", "😢"),
 Q(QW, "___ cats do you have? Two.", ["How many", "How", "What", "When"], 0, "מספר ← How many", COUNT(("🐈", 2))),
 Q(QW, "___ do you get up? At seven.", ["When", "Where", "Who", "Why"], 0, "זמן ← When", "⏰"),
 Q(QW, "How many legs do two dogs have?", ["eight", "four", "six", "two"], 0, "4 + 4 = 8 רגליים", COUNT(("🐕", 2))),
 Q(QW, "Why do you wear a coat?", ["Because it's cold", "In the winter", "A warm coat", "My mother"], 0, "Why ← עונים Because", "🧥"),
 Q(QW, "מתי = ?", ["When", "Where", "Why", "Who"], 0, "מתי = When", "📅"),
 Q(QW, "למה = ?", ["Why", "What", "Who", "When"], 0, "למה = Why", "🤷"),
 Q(QW, "When is the party?", ["On Friday", "At home", "Three kids", "With Dan"], 0, "When ← עונים זמן", "🎉"),
 Q(QW, "How many books are there?", ["five", "blue", "on the desk", "yes"], 0, "How many ← עונים מספר", COUNT(("📕", 5))),
 Q(QW, "___ old are you? I'm eleven.", ["How", "What", "Who", "How many"], 0, "שואלים גיל ← How old", TXT("11")),
]))

# ───────────── Past: was / were · -ed ─────────────
C.append(("was · were", [PA], [
 Q(PA, "Yesterday I ___ at home.", ["was", "were", "am", "is"], 0, "I בעבר ← was", ROW("🏠", "📅")),
 Q(PA, "They ___ at the beach last week.", ["were", "was", "are", "is"], 0, "they בעבר ← were", "🏖️"),
 Q(PA, "She ___ sick yesterday.", ["was", "were", "is", "are"], 0, "she בעבר ← was", "🤒"),
 Q(PA, "We ___ happy at the party last night.", ["were", "was", "are", "is"], 0, "we בעבר ← were", "🎉"),
 Q(PA, "The weather ___ hot yesterday.", ["was", "were", "is", "are"], 0, "it בעבר ← was", "☀️"),
 Q(PA, "You ___ late yesterday.", ["were", "was", "are", "is"], 0, "you בעבר ← were", "⏰"),
 Q(PA, "___ you at school yesterday?", ["Were", "Was", "Are", "Did"], 0, "you בעבר ← Were", "🏫"),
 Q(PA, "Was it cold? Yes, it ___.", ["was", "were", "is", "did"], 0, "Was it...? ← Yes, it was", "❄️"),
 Q(PA, "The dogs ___ hungry last night.", ["were", "was", "are", "is"], 0, "dogs = רבים בעבר ← were", ROW("🐕", "🐕", "🌙")),
 Q(PA, "Past of is?", ["was", "were", "been", "ised"], 0, "is ← was", TXT("is → ?")),
 Q(PA, "Past of are?", ["were", "was", "ared", "been"], 0, "are ← were", TXT("are → ?")),
 Q(PA, "My grandpa ___ a teacher in 1970.", ["was", "were", "is", "are"], 0, "1970 = עבר, he ← was", ROW("👴", "🏫")),
]))

C.append(("Past Simple: -ed", [PA], [
 Q(PA, "Yesterday I ___ football and scored a goal.", ["played", "play", "plays", "playing"], 0, "Yesterday ← עבר: played", "⚽"),
 Q(PA, "She ___ TV last night.", ["watched", "watch", "watches", "watching"], 0, "last night ← עבר: watched", "📺"),
 Q(PA, "We ___ our grandma last Sunday.", ["visited", "visit", "visits", "visiting"], 0, "last Sunday ← עבר: visited", "👵"),
 Q(PA, "Past of dance?", ["danced", "danceed", "dancd", "dances"], 0, "מסתיים ב-e ← מוסיפים רק d", TXT("dance → ?")),
 Q(PA, "Past of study?", ["studied", "studyed", "studys", "studed"], 0, "y אחרי עיצור ← ied", TXT("study → ?")),
 Q(PA, "Past of stop?", ["stopped", "stoped", "stopt", "stops"], 0, "מכפילים p ← stopped", TXT("stop → ?")),
 Q(PA, "Past of play?", ["played", "plaied", "plaid", "plays"], 0, "y אחרי תנועה ← ed", TXT("play → ?")),
 Q(PA, "Last week it ___ a lot.", ["rained", "rains", "rain", "raining"], 0, "Last week ← עבר: rained", "🌧️"),
 Q(PA, "He ___ the door with a key two minutes ago.", ["opened", "opens", "open", "opening"], 0, "ago = לפני ← עבר", "🚪"),
 Q(PA, "Which form of walk is past?", ["walked", "walk", "walks", "walking"], 0, "ed בסוף ← עבר", "🚶"),
 Q(PA, "Which time word is for the past?", ["yesterday", "tomorrow", "now", "every day"], 0, "yesterday = אתמול", "📅"),
 Q(PA, "I ___ my room yesterday.", ["cleaned", "clean", "cleans", "cleaning"], 0, "yesterday ← עבר: cleaned", "🧹"),
]))

C.append(("Past: went · ate · saw · had", [PI], [
 Q(PI, "Yesterday I ___ to the park.", ["went", "goed", "go", "goes"], 0, "go בעבר ← went (לא goed)", "🌳"),
 Q(PI, "Past of go?", ["went", "goed", "goes", "wented"], 0, "go ← went: פועל לא רגיל, בלי ed", TXT("go → ?")),
 Q(PI, "Past of eat?", ["ate", "eated", "eats", "eat"], 0, "eat ← ate: פועל לא רגיל", TXT("eat → ?")),
 Q(PI, "Past of see?", ["saw", "seed", "sees", "seeing"], 0, "see ← saw: פועל לא רגיל", TXT("see → ?")),
 Q(PI, "Past of have?", ["had", "haved", "has", "having"], 0, "have / has ← had", TXT("have → ?")),
 Q(PI, "We ___ (eat) pizza for dinner yesterday.", ["ate", "eated", "eat", "eats"], 0, "yesterday ← עבר: eat ← ate", "🍕"),
 Q(PI, "Last night we ___ a funny film.", ["saw", "seed", "see", "sees"], 0, "last night ← עבר: see ← saw", "🎬"),
 Q(PI, "She ___ a bad cold last week.", ["had", "haved", "has", "have"], 0, "last week ← עבר: has ← had", "🤧"),
 Q(PI, "אכלתי = ?", ["I ate", "I eat", "I eated", "I eats"], 0, "אכלתי = עבר ← I ate", "🍎"),
 Q(PI, "ראיתי = ?", ["I saw", "I see", "I seed", "I sees"], 0, "ראיתי = עבר ← I saw", "👀"),
 Q(PI, "Which form of go is past?", ["went", "go", "goes", "going"], 0, "went = הלך (עבר של go)", "🚶"),
]))

C.append(("Past: more irregular verbs", [PI], [
 Q(PI, "Dad ___ home at six yesterday.", ["came", "comed", "comes", "come"], 0, "yesterday ← עבר: come ← came", ROW("👨", "🏠")),
 Q(PI, "I ___ my homework last night.", ["did", "doed", "do", "does"], 0, "last night ← עבר: do ← did", "📓"),
 Q(PI, "Yesterday we ___ under a big tree.", ["sat", "sitted", "sit", "sits"], 0, "yesterday ← עבר: sit ← sat", "🌳"),
 Q(PI, "Mom ___ (make) a cake last week.", ["made", "maked", "makes", "make"], 0, "last week ← עבר: make ← made", "🎂"),
 Q(PI, "Yesterday Tom ___ (have) a big breakfast.", ["had", "has", "haved", "have"], 0, "yesterday ← עבר: had", "🍳"),
 Q(PI, "Which sentence is correct?", ["I went home.", "I goed home.", "I wented home.", "I gone home."], 0, "go בעבר ← went, בלי ed", "🏠"),
 Q(PI, "Did you see the lion? Yes, I ___ it.", ["saw", "see", "seed", "sees"], 0, "עבר: see ← saw", "🦁"),
 Q(PI, "Yesterday I didn't ___ to school.", ["go", "went", "goes", "goed"], 0, "אחרי didn't ← צורת הבסיס: go", "🏫"),
 Q(PI, "___ you see the film yesterday?", ["Did", "Do", "Does", "Are"], 0, "שאלה בעבר ← Did + see", "🎬"),
 Q(PI, "Which is NOT past: eat, went, saw, had?", ["eat", "went", "saw", "had"], 0, "eat = הווה. העבר שלו: ate", "📅"),
]))

# ───────────── Words: daily routine & time ─────────────
C.append(("Daily routine", [VD], [
 Q(VD, "להתעורר = ?", ["wake up", "get dressed", "go to bed", "brush"], 0, "להתעורר = wake up", ROW("⏰", "🛏️")),
 Q(VD, "להתלבש = ?", ["get dressed", "get up", "take a shower", "go home"], 0, "להתלבש = get dressed", ROW("👕", "👖")),
 Q(VD, "I ___ my teeth.", ["brush", "wash", "eat", "comb"], 0, "לצחצח שיניים = brush my teeth", "🦷"),
 Q(VD, "I ___ a shower every evening.", ["take", "make", "do", "go"], 0, "take a shower = להתקלח", "🚿"),
 Q(VD, "לאכול ארוחת בוקר = ?", ["have breakfast", "have dinner", "have lunch", "go to bed"], 0, "ארוחת בוקר = breakfast", ROW("🥣", "🌅")),
 Q(VD, "I ___ my homework after school.", ["do", "make", "go", "take"], 0, "do homework = להכין שיעורים", "📓"),
 Q(VD, "At night I ___ to bed.", ["go", "get", "do", "make"], 0, "go to bed = ללכת לישון", ROW("🛏️", "🌙")),
 Q(VD, "ארוחת ערב = ?", ["dinner", "lunch", "breakfast", "dessert"], 0, "ארוחת ערב = dinner", ROW("🍝", "🌙")),
 Q(VD, "I ___ my hands before I eat.", ["wash", "brush", "take", "do"], 0, "wash my hands = לשטוף ידיים", ROW("👐", "🍽️")),
 Q(VD, "Every morning I ___ the bus to school.", ["take", "do", "make", "have"], 0, "take the bus = לנסוע באוטובוס", "🚌"),
 Q(VD, "ארוחת צהריים = ?", ["lunch", "dinner", "breakfast", "dessert"], 0, "ארוחת צהריים = lunch", "🥪"),
 Q(VD, "לקום (מהמיטה) = ?", ["get up", "go to bed", "get dressed", "sit down"], 0, "לקום = get up", ROW("🛏️", "🚶")),
 Q(VD, "שיעורי בית = ?", ["homework", "housework", "hometown", "hobby"], 0, "שיעורי בית = homework", ROW("📓", "✏️")),
]))

C.append(("Time words", [VD], [
 Q(VD, "אתמול = ?", ["yesterday", "tomorrow", "today", "tonight"], 0, "אתמול = yesterday", "📅"),
 Q(VD, "מחר = ?", ["tomorrow", "yesterday", "today", "always"], 0, "מחר = tomorrow", "📆"),
 Q(VD, "What day comes after Monday?", ["Tuesday", "Sunday", "Wednesday", "Thursday"], 0, "Monday ← Tuesday", TXT("Monday → ?")),
 Q(VD, "There are seven days in a ___.", ["week", "month", "year", "day"], 0, "7 ימים = שבוע = week", "🗓️"),
 Q(VD, "There are twelve months in a ___.", ["year", "week", "day", "month"], 0, "12 חודשים = שנה = year", TXT("12")),
 Q(VD, "בוקר = ?", ["morning", "evening", "night", "afternoon"], 0, "בוקר = morning", "🌅"),
 Q(VD, "ערב = ?", ["evening", "morning", "afternoon", "noon"], 0, "ערב = evening", "🌇"),
 Q(VD, "The clock says 3:00. It is three ___.", ["o'clock", "hours", "times", "clock"], 0, "שלוש בדיוק = three o'clock", TXT("3:00")),
 Q(VD, "שבוע הבא = ?", ["next week", "last week", "this week", "every week"], 0, "הבא = next", "🗓️"),
 Q(VD, "תמיד = ?", ["always", "never", "sometimes", "usually"], 0, "תמיד = always", TXT("100%")),
 Q(VD, "אף פעם = ?", ["never", "always", "often", "sometimes"], 0, "אף פעם = never", TXT("0%")),
 Q(VD, "The month after March is ___.", ["April", "May", "February", "June"], 0, "March ← April", TXT("March → ?")),
]))

# ───────────── Telling the time ─────────────
C.append(("Telling the time: half past", [TM], [
 Q(TM, "What time is it?", ["half past seven", "half past eight", "seven o'clock", "half past six"], 0, "7 ועוד 30 דקות = half past seven", PW("🕢", "7:30")),
 Q(TM, "What time is it?", ["half past four", "half past five", "four o'clock", "quarter past four"], 0, "4 ועוד חצי שעה = half past four", PW("🕟", "4:30")),
 Q(TM, "What time is it?", ["eleven o'clock", "half past eleven", "seven o'clock", "quarter past eleven"], 0, "11 בדיוק = eleven o'clock", PW("🕚", "11:00")),
 Q(TM, "How many minutes are in half an hour?", ["thirty", "fifteen", "sixty", "forty-five"], 0, "שעה = 60 דקות. חצי שעה = 30", TXT("½ hour")),
 Q(TM, "Which clock shows half past nine?", ["9:30", "9:15", "10:30", "9:00"], 0, "half past nine = 9 וחצי = 9:30", TXT("half past", "nine")),
 Q(TM, "{half past two} = ?", ["2:30", "2:15", "3:30", "2:00"], 0, "half past = וחצי: 2:30", TXT("half past", "two")),
 Q(TM, "שמונה וחצי = ?", ["half past eight", "half past seven", "eight o'clock", "quarter past eight"], 0, "וחצי = half past: half past eight", TXT("8:30")),
 Q(TM, "School starts at 8:30. It starts at ___.", ["half past eight", "half past nine", "eight o'clock", "quarter past eight"], 0, "8:30 = half past eight", PW("🏫", "8:30")),
 Q(TM, "Breakfast is half an hour after 7:00. When?", ["half past seven", "half past six", "eight o'clock", "quarter past seven"], 0, "7:00 ועוד 30 דקות = 7:30", PW("🥣", "7:00")),
 Q(TM, "What time is it?", ["half past twelve", "twelve o'clock", "half past one", "quarter past twelve"], 0, "12 ועוד 30 דקות = half past twelve", PW("🕧", "12:30")),
]))

C.append(("Telling the time: quarter past", [TM], [
 Q(TM, "What time is it?", ["quarter past five", "quarter past six", "half past five", "five o'clock"], 0, "5 ועוד 15 דקות = quarter past five", TXT("5:15")),
 Q(TM, "How many minutes are in a quarter of an hour?", ["fifteen", "thirty", "twenty-five", "sixty"], 0, "רבע שעה = 60 : 4 = 15 דקות", TXT("¼ hour")),
 Q(TM, "Which clock shows quarter past ten?", ["10:15", "10:30", "11:15", "10:45"], 0, "quarter past = ורבע: 10:15", TXT("quarter past", "ten")),
 Q(TM, "שבע ורבע = ?", ["quarter past seven", "quarter past six", "half past seven", "seven o'clock"], 0, "ורבע = quarter past: quarter past seven", TXT("7:15")),
 Q(TM, "The bus comes at 8:15. It comes at ___.", ["quarter past eight", "quarter past nine", "half past eight", "eight o'clock"], 0, "8:15 = quarter past eight", PW("🚌", "8:15")),
 Q(TM, "It is 3:00. Fifteen minutes later it is ___.", ["quarter past three", "half past three", "quarter past four", "three o'clock"], 0, "3:00 ועוד 15 דקות = 3:15", TXT("3:00", "+ 15 min")),
 Q(TM, "{quarter past two} = ?", ["2:15", "2:30", "3:15", "2:45"], 0, "quarter past = ורבע: 2:15", TXT("quarter past", "two")),
 Q(TM, "What time is it?", ["quarter past twelve", "half past twelve", "twelve o'clock", "quarter past two"], 0, "12 ועוד 15 דקות = quarter past twelve", TXT("12:15")),
 Q(TM, "What time is it?", ["half past nine", "quarter past nine", "nine o'clock", "half past ten"], 0, "9 ועוד 30 דקות = half past nine", PW("🕤", "9:30")),
 Q(TM, "Which of these times comes first in the morning?", ["quarter past seven", "half past seven", "eight o'clock", "half past eight"], 0, "7:15 לפני 7:30, 8:00 ו-8:30", ROW("🌅", "⏰")),
]))

# ───────────── Words: home, food & clothes ─────────────
C.append(("At home", [VH], [
 Q(VH, "מטבח = ?", ["kitchen", "bedroom", "bathroom", "garden"], 0, "מטבח = kitchen", "🍳"),
 Q(VH, "חדר שינה = ?", ["bedroom", "kitchen", "living room", "bathroom"], 0, "חדר שינה = bedroom", "🛏️"),
 Q(VH, "חדר אמבטיה = ?", ["bathroom", "bedroom", "kitchen", "garden"], 0, "חדר אמבטיה = bathroom", "🛁"),
 Q(VH, "We sit on the sofa in the ___.", ["living room", "bathroom", "garden", "shower"], 0, "סלון = living room", ROW("🛋️", "📺")),
 Q(VH, "ספה = ?", ["sofa", "bed", "table", "door"], 0, "ספה = sofa", "🛋️"),
 Q(VH, "דלת פתוחה = ?", ["an open door", "a door open", "an open floor", "a open door"], 0, "תואר לפני שם עצם: an open door", "🚪"),
 Q(VH, "שולחן = ?", ["table", "chair", "bed", "sofa"], 0, "שולחן = table", "🍽️"),
 Q(VH, "כיסא = ?", ["chair", "table", "bed", "sofa"], 0, "כיסא = chair", "💺"),
 Q(VH, "Flowers grow in the ___.", ["garden", "kitchen", "bathroom", "bedroom"], 0, "גינה = garden", "🌷"),
 Q(VH, "At night I sleep in my ___ under a blanket. (מיטה)", ["bed", "bath", "door", "table"], 0, "ישנים במיטה = bed", "😴"),
 Q(VH, "Which is NOT a room?", ["garden", "kitchen", "bedroom", "bathroom"], 0, "גינה היא לא חדר", ROW("🌳", "🍳", "🛏️", "🛁")),
]))

C.append(("Food & clothes", [VH], [
 Q(VH, "לחם טרי = ?", ["fresh bread", "bread fresh", "fresh bed", "fish bread"], 0, "תואר לפני שם עצם: fresh bread", "🍞"),
 Q(VH, "גבינה צהובה = ?", ["yellow cheese", "cheese yellow", "yellow chicken", "yellow cake"], 0, "תואר לפני שם עצם: yellow cheese", "🧀"),
 Q(VH, "Which is a fruit?", ["banana", "carrot", "bread", "egg"], 0, "בננה היא פרי", ROW("🍌", "🥕", "🍞", "🥚")),
 Q(VH, "Which is a drink?", ["water", "rice", "cheese", "salad"], 0, "מים = שותים", ROW("🚰", "🍚", "🧀", "🥗")),
 Q(VH, "ירקות = ?", ["vegetables", "fruit", "sweets", "drinks"], 0, "ירקות = vegetables", ROW("🥕", "🥦", "🍅")),
 Q(VH, "I'm thirsty. I want some ___.", ["water", "bread", "cheese", "rice"], 0, "צמא ← שותים מים", ROW("🚰", "🍞", "🧀", "🍚")),
 Q(VH, "I'm hungry. Can I have a cheese ___?", ["sandwich", "coat", "pencil", "chair"], 0, "רעב ← אוכלים כריך", ROW("🥪", "🧥", "✏️", "💺")),
 Q(VH, "In winter I wear a warm ___ over my sweater.", ["coat", "T-shirt", "swimsuit", "sandal"], 0, "מעיל חם = warm coat", ROW("🧥", "👕", "👙", "👡")),
 Q(VH, "מכנסיים = ?", ["pants", "shirt", "shoes", "socks"], 0, "מכנסיים = pants", "👖"),
 Q(VH, "I wear ___ over my socks.", ["shoes", "gloves", "hats", "shirts"], 0, "מעל הגרביים = נעליים", ROW("👟", "🧤", "🎩", "👕")),
 Q(VH, "הכובע שלי = ?", ["my hat", "hat my", "my hot", "me hat"], 0, "שלי לפני שם העצם: my hat", "🎩"),
 Q(VH, "גרביים חמות = ?", ["warm socks", "socks warm", "warm shoes", "warm sock"], 0, "תואר לפני שם עצם: warm socks", "🧦"),
 Q(VH, "It's hot. I wear ___ with short sleeves.", ["a T-shirt", "a scarf", "gloves", "boots"], 0, "שרוולים קצרים ← a T-shirt", ROW("👕", "🧣", "🧤", "👢")),
 Q(VH, "Which is NOT clothing?", ["banana", "dress", "coat", "sock"], 0, "בננה לא לובשים!", ROW("🍌", "👗", "🧥", "🧦")),
]))

# ───────────── Words: weather, hobbies & town ─────────────
C.append(("Weather & hobbies", [VT], [
 Q(VT, "It's ___ today. I'm wet! Take an umbrella.", ["rainy", "sunny", "hot", "dry"], 0, "גשום = rainy", "🌂"),
 Q(VT, "It's ___. Wear a hat and sunglasses.", ["sunny", "rainy", "snowy", "cloudy"], 0, "שמשי = sunny", ROW("👒", "🕶️")),
 Q(VT, "Snow is ___.", ["cold", "hot", "green", "sweet"], 0, "שלג קר = cold", "❄️"),
 Q(VT, "It's ___. My hat flies away!", ["windy", "sunny", "hot", "cloudy"], 0, "יש רוח = windy", [("🧒", 40, 64, 40), ("👒", 66, 26, 26)]),
 Q(VT, "מעונן = ?", ["cloudy", "rainy", "sunny", "windy"], 0, "מעונן = cloudy", "☁️"),
 Q(VT, "I like to ___ pictures.", ["draw", "swim", "cook", "ride"], 0, "לצייר = draw", "🖼️"),
 Q(VT, "Dan plays the ___.", ["guitar", "football", "swimming", "bike"], 0, "מנגנים ב-the guitar", ROW("🎸", "⚽", "🏊", "🚲")),
 Q(VT, "My hobby is ___. I love books.", ["reading", "swimming", "dancing", "cooking"], 0, "אוהב ספרים ← reading", ROW("📖", "❤️")),
 Q(VT, "She likes ___. She goes to the pool.", ["swimming", "singing", "drawing", "reading"], 0, "בריכה ← swimming", ROW("🏊‍♀️", "🎤", "🎨", "📖")),
 Q(VT, "תחביב = ?", ["hobby", "holiday", "homework", "house"], 0, "תחביב = hobby", ROW("🎸", "⚽", "🎨")),
 Q(VT, "לבשל = ?", ["cook", "clean", "catch", "cut"], 0, "לבשל = cook", "🍳"),
 Q(VT, "לרקוד = ?", ["dance", "draw", "drive", "dive"], 0, "לרקוד = dance", "💃"),
]))

C.append(("Places in town", [VT], [
 Q(VT, "A big shop with all kinds of food is a ___.", ["supermarket", "library", "school", "hospital"], 0, "סופרמרקט = supermarket", ROW("🛒", "📚", "🏫", "🏥")),
 Q(VT, "Doctors work in a ___.", ["hospital", "bank", "park", "cinema"], 0, "בית חולים = hospital", "👨‍⚕️"),
 Q(VT, "You borrow books from the ___.", ["library", "bank", "zoo", "bakery"], 0, "ספרייה = library", "📖"),
 Q(VT, "You see a film at the ___.", ["cinema", "library", "post office", "bank"], 0, "קולנוע = cinema", "🎬"),
 Q(VT, "You see lions at the ___.", ["zoo", "bank", "bakery", "pool"], 0, "גן חיות = zoo", "🦁"),
 Q(VT, "You swim at the ___.", ["pool", "bank", "library", "bakery"], 0, "בריכה = pool", "🏊"),
 Q(VT, "תחנת אוטובוס = ?", ["bus stop", "bookshop", "car park", "playground"], 0, "תחנת אוטובוס = bus stop", "🚏"),
 Q(VT, "You keep money in the ___.", ["bank", "park", "zoo", "shop"], 0, "בנק = bank", "💰"),
 Q(VT, "רחוב = ?", ["street", "store", "school", "square"], 0, "רחוב = street", ROW("🚦", "🚗")),
 Q(VT, "Children play on the swings at the ___.", ["park", "bank", "post office", "hospital"], 0, "פארק = park", ROW("🌳", "🏦", "📮", "🏥")),
 Q(VT, "חנות = ?", ["shop", "ship", "sheep", "shoe"], 0, "חנות = shop", "🏪"),
 Q(VT, "A shop that bakes bread is a ___.", ["bakery", "bank", "library", "hospital"], 0, "מאפייה = bakery", ROW("🥖", "🏦", "📖", "🏥")),
]))

# ───────────── Reading (three short passages) ─────────────
P1 = """
A Busy Morning

Noa is eleven years old. She lives in Haifa with her parents and her little brother, Ben. Every morning, Noa gets up at half past six. First, she takes a shower and gets dressed. Then she has breakfast with her family in the kitchen. She usually eats bread with cheese and drinks a glass of milk. Ben doesn't like milk. He drinks orange juice. At a quarter past seven, Noa brushes her teeth and puts her books in her bag. Her school is not far from her house, so she walks there with her best friend, Maya. School starts at eight o'clock. Noa's favorite subject is English, because she loves reading stories. After school, she does her homework and plays the guitar.
"""
C.append(("📖 Reading: A Busy Morning", [RD], [
 Q(RD, "How old is Noa?", ["eleven", "ten", "twelve", "six"], 0, "Noa is eleven years old", "👧"),
 Q(RD, "Who is Ben?", ["her brother", "her father", "her friend", "her dog"], 0, "her little brother, Ben", "👦"),
 Q(RD, "When does Noa get up?", ["at 6:30", "at 7:15", "at 8:00", "at 6:00"], 0, "half past six = 6:30", "⏰"),
 Q(RD, "What does Noa eat for breakfast?", ["bread and cheese", "eggs", "a sandwich", "cornflakes"], 0, "eats bread with cheese", ROW("🍽️", "🌅")),
 Q(RD, "What does Ben drink?", ["orange juice", "milk", "water", "tea"], 0, "He drinks orange juice", ROW("🥤", "🥛", "🚰", "🍵")),
 Q(RD, "How does Noa go to school?", ["she walks", "by bus", "by car", "by bike"], 0, "she walks there with Maya", "🏫"),
 Q(RD, "Who is Maya?", ["her best friend", "her sister", "her teacher", "her mother"], 0, "her best friend, Maya", "👭"),
 Q(RD, "When does school start?", ["at eight", "at seven", "at nine", "at six"], 0, "School starts at eight o'clock", "🏫"),
 Q(RD, "Why does Noa like English?", ["she loves stories", "it's easy", "she likes Maya", "it's short"], 0, "because she loves reading stories", ROW("👧", "🏫")),
 Q(RD, "What does Noa play?", ["the guitar", "football", "the piano", "tennis"], 0, "plays the guitar", ROW("🎸", "⚽", "🎹", "🎾")),
 Q(RD, "Is Noa late for school?", ["No, she isn't.", "Yes, she is.", "Yes, every day.", "She is sick."], 0, "ב-7:15 היא מוכנה, הבית קרוב, ובית הספר ב-8:00", ROW("⏰", "🏫")),
 Q(RD, "What is the text mostly about?", ["Noa's morning", "Noa's school", "Ben's breakfast", "Maya's family"], 0, "הטקסט מספר מה נועה עושה בבוקר", "👧"),
], P1))

P2 = """
A Rainy Saturday

It is Saturday morning, and it is raining. Tom and his sister, Lily, are at home. Their mom is reading a newspaper in the living room. Their dad is cooking pancakes in the kitchen. Tom is sitting on the sofa next to the window. He is watching the rain. "I'm bored," he says. "We can't play in the park today." Lily has an idea. "Let's build a house from boxes!" There are three big boxes under her bed. The children take the boxes to the living room. They cut a door and two windows. Now the cat is sleeping in the box house! Dad comes in with a plate of pancakes. "The pancakes are ready!" he says. Everybody is happy.
"""
C.append(("📖 Reading: A Rainy Saturday", [RD], [
 Q(RD, "What day is it?", ["Saturday", "Friday", "Sunday", "Monday"], 0, "It is Saturday morning", "📅"),
 Q(RD, "What is the weather like?", ["rainy", "sunny", "windy", "snowy"], 0, "it is raining = גשום", ROW("🌧️", "☀️", "💨", "🌨️")),
 Q(RD, "What is Mom doing?", ["reading a newspaper", "cooking", "sleeping", "watching TV"], 0, "Mom is reading a newspaper", "👩"),
 Q(RD, "Where is Dad?", ["in the kitchen", "in the garden", "in the park", "in the bedroom"], 0, "Dad is cooking in the kitchen", "👨"),
 Q(RD, "Where is Tom sitting?", ["on the sofa", "on the bed", "on the floor", "in a box"], 0, "sitting on the sofa", "👦"),
 Q(RD, "Why is Tom bored?", ["can't play outside", "he is sick", "no television", "Lily is sleeping"], 0, "We can't play in the park", ROW("👦", "😐")),
 Q(RD, "Whose idea is the box house?", ["Lily's", "Tom's", "Mom's", "Dad's"], 0, "Lily has an idea", ROW("💡", "📦")),
 Q(RD, "How many boxes are there?", ["three", "two", "four", "one"], 0, "three big boxes", ROW("👧", "📦")),
 Q(RD, "Where are the boxes?", ["under Lily's bed", "in the kitchen", "in the garden", "on the sofa"], 0, "under her bed", "📦"),
 Q(RD, "Who is sleeping in the box house?", ["the cat", "Tom", "Lily", "the dog"], 0, "the cat is sleeping in the box house", ROW("📦", "😴")),
 Q(RD, "\"bored\" means:", ["משועמם", "עייף", "שמח", "רעב"], 0, "bored = משועמם", TXT("bored")),
 Q(RD, "What will the family do now?", ["eat pancakes", "go to school", "play outside", "cook pancakes"], 0, "Dad: The pancakes are ready! ← עכשיו אוכלים", ROW("🥞", "👪")),
 Q(RD, "Which is the best new title?", ["The Box House", "A Sunny Day", "In the Park", "Dad's New Car"], 0, "רוב הסיפור על בית הקופסאות", ROW("📦", "☀️", "🌳", "🚗")),
], P2))

P3 = """
Our Trip to the Zoo

Last Friday was a great day. My class visited the zoo in Jerusalem. We were very excited! The weather was sunny and warm. First, we walked to the lions. There were two big lions and three small cubs. The cubs played in the grass. Then we visited the monkeys. One monkey jumped on a tree and looked at us. My friend Adam laughed a lot. At twelve o'clock we were hungry, so we sat under a big tree and ate our sandwiches. After lunch, we watched the penguins. They were very funny! I liked the penguins best. At three o'clock we were tired, and we traveled back to school by bus. It was the best trip of the year.
"""
C.append(("📖 Reading: Our Trip to the Zoo", [RD], [
 Q(RD, "When did the class visit the zoo?", ["last Friday", "last Sunday", "yesterday", "last summer"], 0, "Last Friday was a great day", "🗓️"),
 Q(RD, "Where is the zoo?", ["in Jerusalem", "in Haifa", "in Eilat", "in Tel Aviv"], 0, "the zoo in Jerusalem", "🦁"),
 Q(RD, "What was the weather like?", ["sunny and warm", "rainy", "cold and windy", "snowy"], 0, "The weather was sunny and warm", ROW("🌤️", "🌧️", "💨", "🌨️")),
 Q(RD, "How many big lions were there?", ["two", "three", "five", "one"], 0, "two big lions and three cubs", ROW("🦁", "🌿")),
 Q(RD, "What did one monkey do?", ["It jumped.", "It slept.", "It ate.", "It sang."], 0, "One monkey jumped on a tree", "🐒"),
 Q(RD, "Who laughed a lot?", ["Adam", "the teacher", "the monkey", "the lions"], 0, "My friend Adam laughed a lot", "😂"),
 Q(RD, "Where did they eat lunch?", ["under a tree", "on the bus", "at school", "near the lions"], 0, "we sat under a big tree", "🥪"),
 Q(RD, "Which animals did the writer like best?", ["the penguins", "the lions", "the monkeys", "the cubs"], 0, "I liked the penguins best", ROW("🐧", "🐒", "🦁")),
 Q(RD, "How did they go back to school?", ["by bus", "on foot", "by train", "by car"], 0, "we traveled back by bus", "🏫"),
 Q(RD, "How did they feel at three o'clock?", ["tired", "hungry", "bored", "sad"], 0, "At three o'clock we were tired", "🕒"),
 Q(RD, "\"cubs\" means:", ["גורים", "קופים", "עצים", "אריות"], 0, "cubs = גורים (אריות קטנים)", TXT("cubs")),
 Q(RD, "How many lions were there in all?", ["five", "two", "three", "six"], 0, "שני אריות גדולים ושלושה גורים: 2 + 3 = 5", ROW("🦁", "🌿")),
 Q(RD, "Why do you think the writer liked the penguins best?", ["They were funny.", "They were big.", "They were sleeping.", "They ate sandwiches."], 0, "They were very funny! – לכן אהב אותם", "🐧"),
 Q(RD, "Did the writer enjoy the trip?", ["Yes, very much.", "No, it rained.", "No, too boring.", "Only the bus."], 0, "It was the best trip of the year", ROW("🚌", "🦁")),
], P3))

# ───────────── Review ─────────────
C.append(("חזרה כללית", [BE, PS, PG, CT, PL, PN, PP, QW, PA, VD, VH, VT], [
 Q(BE, "My friends ___ at the cinema now.", ["are", "is", "am", "be"], 0, "friends = רבים ← are", ROW("👫", "🎬")),
 Q(BE, "Ben ___ two sisters.", ["has", "have", "is", "are"], 0, "Ben = he ← has", ROW("👦", "👧", "👧")),
 Q(PS, "My cat ___ milk every morning.", ["drinks", "drink", "drinking", "drinkes"], 0, "the cat = it ← drinks", ROW("🐈", "🥛")),
 Q(PS, "___ your brother like football?", ["Does", "Do", "Is", "Are"], 0, "your brother = he ← Does", ROW("👦", "⚽")),
 Q(PG, "Look! The children ___ in the snow.", ["are playing", "is playing", "play", "plays"], 0, "Look! + children ← are playing", ROW("🧒", "⛄")),
 Q(PG, "She is ___ a letter now.", ["writing", "writeing", "write", "writes"], 0, "write ← מורידים e: writing", "✉️"),
 Q(CT, "A cow ___ fly.", ["can't", "can", "isn't", "aren't"], 0, "פרה לא יכולה לעוף ← can't", "🐄"),
 Q(CT, "There ___ a cake in the kitchen.", ["is", "are", "am", "have"], 0, "עוגה אחת ← There is", "🎂"),
 Q(PL, "one glass, two ___", ["glasses", "glasss", "glassies", "glass"], 0, "אחרי ss ← es", COUNT(("🥛", 2))),
 Q(PL, "Two ___ are at the door.", ["men", "mans", "man", "mens"], 0, "רבים של man ← men", ROW("👨", "👨", "🚪")),
 Q(PN, "This is my grandma. I love ___.", ["her", "she", "his", "they"], 0, "grandma = היא, אחרי love ← her", "👵"),
 Q(PN, "Tom and Dan, is this ___ ball?", ["your", "you", "yours", "you're"], 0, "שלכם + שם עצם ← your", "⚽"),
 Q(PP, "We have a test ___ Thursday.", ["on", "in", "at", "to"], 0, "יום ← on", ROW("📝", "📅")),
 Q(PP, "The mouse is ___ the cat.", ["next to", "in", "on", "at"], 0, "העכבר ליד החתול ← next to", NEXT("🐁", "🐈")),
 Q(QW, "___ is your mom? She's at work.", ["Where", "Who", "What", "When"], 0, "מקום ← Where", "👩"),
 Q(QW, "___ apples are there? Six.", ["How many", "How", "What", "Which"], 0, "מספר ← How many", COUNT(("🍎", 6))),
 Q(PA, "Last night we ___ at home.", ["were", "was", "are", "is"], 0, "we בעבר ← were", ROW("🏠", "🌙")),
 Q(PA, "Past of jump?", ["jumped", "jumpt", "jumpped", "jumps"], 0, "jump ← jumped", TXT("jump → ?")),
 Q(VD, "I have breakfast in the ___.", ["morning", "night", "evening", "afternoon"], 0, "ארוחת בוקר ← morning", "🥣"),
 Q(VH, "שמלה חדשה = ?", ["a new dress", "a dress new", "a new desk", "new a dress"], 0, "תואר לפני שם עצם: a new dress", "👗"),
 Q(VT, "It's cold and ___. Look at the snow!", ["snowy", "sunny", "hot", "dry"], 0, "שלג ← snowy", "⛄"),
 Q(VT, "You send letters at the ___.", ["post office", "bakery", "zoo", "pool"], 0, "דואר = post office", "✉️"),
]))

# station type on the map
KINDS = {c[0]: "gram" for c in C if c[1][0] in (BE, PS, PG, CT, PL, PN, PP, QW, PA, PI)}
KINDS.update({c[0]: "word" for c in C if c[1][0] in (VD, TM, VH, VT)})
KINDS.update({c[0]: "read" for c in C if c[1][0] == RD})
KINDS["חזרה כללית"] = "rev"

# Band I words taught in this set – every one is a correct answer somewhere (build_set.py checks).
WORD_LIST = """wake up|get dressed|brush|take|breakfast|dinner|lunch|wash|get up|homework|
yesterday|tomorrow|week|year|morning|evening|o'clock|next week|always|never|Tuesday|April|
kitchen|bedroom|bathroom|living room|sofa|door|table|chair|garden|bed|
bread|cheese|banana|juice|vegetables|water|sandwich|coat|pants|shoes|hat|socks|T-shirt|dress|
rainy|sunny|cold|windy|cloudy|snowy|draw|guitar|reading|swimming|hobby|cook|dance|
supermarket|hospital|library|cinema|zoo|pool|bus stop|bank|street|park|shop|bakery|post office""".replace("\n", "").split("|")
