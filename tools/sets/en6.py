# Practice set: English, grade 6 (כיתה ו') – consolidating Band I, a step above grade 5:
# Present Simple vs Present Progressive (time words), can / there is / are / have got, plurals (also irregular),
# pronouns and possessives, prepositions of place and time, question words and making questions,
# the Past Simple (was / were, regular -ed, common irregular verbs, didn't, Did…?), Band I vocabulary
# (family, routines, jobs, school subjects, sports, food, places, weather, feelings), writing
# (and / but / because, which sentence fits, order of sentences, capital letters) and four reading passages.
# Added (curriculum coverage): this · that · these · those, commands (Open… / Don't…), describing people, clothes, telling the time.
# Organised by fine topics (≈20 questions each) so a parent can tick only what the test covers.
# Run: python3 -I tools/build_set.py tools/sets/en6.py
import re

PG, CT, PL = "Present Simple / Progressive", "can · there is / are · have got", "Plurals"
PN, PR, QW = "Pronouns & possessives", "Prepositions: place & time", "Questions & question words"
PW, PI, PD = "Past: was / were · -ed", "Past: irregular verbs", "Past: didn't · Did…?"
VP, VS, VW = "Words: family, routines & jobs", "Words: school, sports & food", "Words: places, weather & feelings"
WR, RD = "Writing: sentences & connectors", "Reading"
TH, IM = "this · that · these · those", "Commands: Open… / Don't…"
DP, CL, TM = "Describing people", "Words: clothes", "Telling the time"

SET = dict(name="English ו'", grade=5, subject="אנגלית",
           title="Grammar · Past Simple · Time · Band I words · Reading",
           desc="אנגלית לכיתה ו' – חיזוק Band I: Present Simple מול Progressive, can, there is, have got, רבים, כינויי גוף ושייכות, מילות יחס, שאלות, Past Simple (was/were, ‎-ed, פעלים חריגים, didn't, Did?), this/that/these/those, ציווי, תיאור אנשים, בגדים, אמירת השעה, אוצר מילים, כתיבה וארבעה קטעי קריאה",
           desc_en="Grade 6 English, consolidating Band I: Present Simple vs Progressive, can, there is, have got, plurals, pronouns, prepositions, questions, the Past Simple (was/were, -ed, irregular verbs, didn't, Did?), this/that/these/those, commands, describing people, clothes, telling the time, Band I words, writing and four reading passages",
           tags=["Present Simple / Progressive", "can · there is", "have got", "Plurals", "Pronouns", "Prepositions",
                 "Questions", "Past Simple", "this / these", "Commands", "Describing people", "Clothes", "Telling the time",
                 "Band I words", "Writing", "Reading"],
           examDate="", dailyGoal=2, perRound=10,
           topics=[PG, CT, PL, PN, PR, QW, PW, PI, PD, VP, VS, VW, TH, IM, DP, CL, TM, WR, RD])
MAX_Q_WORDS = 12
ANSWER_IN_Q_OK = True    # short answers ("is", "in", "on") are letters inside other words of the question; every item checked by hand


def W(s): return re.sub(r"\{([^}]*)\}", lambda m: "⁦" + m.group(1) + "⁩", s)
def Q(t, q, opts, ans, expl, sc): return (t, W(q), opts, ans, W(expl), sc)

def ROW(*es):
    """The things the question talks about, side by side."""
    n = len(es); s = min(40, 125 / n); step = min(92 / n, s / 1.6 * 1.35)
    return [(e, round(50 + (j - (n - 1) / 2) * step, 1), 52, round(s)) for j, e in enumerate(es)]

def ON(top, base):   "the first thing sitting on the second";   return [(base, 50, 64, 50), (top, 50, 26, 28)]
def UNDER(low, top): "the first thing under the second";        return [(top, 50, 34, 52), (low, 50, 78, 22)]
def NEXT(a, b):      "two things side by side";                 return [(a, 30, 56, 36), (b, 70, 56, 36)]

def CARD(*lines):
    """English sentences on a card, one under the other (left-to-right text, ≤ 16 characters a line)."""
    n = len(lines); L = max(len(l) for l in lines)
    s = round(min(14, 72 / n, 150 / (0.6 * L + 0.8)), 1)
    return [(l, 50, round(12 + 76 * (i + .5) / n, 1), s) for i, l in enumerate(lines)]


C = []

# ───────────── Present Simple / Progressive ─────────────
C.append(("Now or every day?", [PG], [
 Q(PG, "Look! The baby ___.", ["is sleeping", "sleeps", "sleep", "are sleeping"], 0, "Look! = עכשיו ← is sleeping", ROW("👶", "😴")),
 Q(PG, "My mom always ___ coffee in the morning.", ["drinks", "is drinking", "drink", "drinking"], 0, "always ← הרגל: drinks", ROW("👩", "☕")),
 Q(PG, "Shh! We ___ a test right now.", ["are writing", "write", "writes", "is writing"], 0, "right now ← are + ing", ROW("📝", "🤫")),
 Q(PG, "Tom ___ his bike to school every day.", ["rides", "is riding", "ride", "riding"], 0, "every day ← הרגל: rides", ROW("👦", "🚲", "🏫")),
 Q(PG, "Listen! Somebody ___ on the door.", ["is knocking", "knocks", "knock", "are knocking"], 0, "Listen! = עכשיו ← is knocking", ROW("🚪", "👂")),
 Q(PG, "It never ___ in Eilat in the summer.", ["rains", "is raining", "rain", "raining"], 0, "never ← הרגל: rains", ROW("🏜️", "☀️")),
 Q(PG, "Which time words go with \"is playing\"?", ["at the moment", "every day", "usually", "on Sundays"], 0, "at the moment = ברגע זה", TXT("is playing")),
 Q(PG, "Which time word goes with \"plays\"?", ["usually", "now", "right now", "at the moment"], 0, "usually = בדרך כלל ← הרגל", TXT("plays")),
 Q(PG, "The children ___ football in the garden at the moment.", ["are playing", "play", "plays", "is playing"], 0, "at the moment + רבים ← are playing", ROW("🧒", "🧒", "🌳")),
 Q(PG, "My grandparents ___ us every Saturday.", ["visit", "are visiting", "visits", "visiting"], 0, "every Saturday ← הרגל, רבים בלי s", ROW("👴", "👵", "🏠")),
 Q(PG, "Look! He is ___ in the pool.", ["swimming", "swiming", "swims", "swim"], 0, "swim ← מכפילים m: swimming", ROW("👦", "🏊")),
]))

C.append(("Present: questions and negatives", [PG], [
 Q(PG, "___ your sister playing the piano now?", ["Is", "Does", "Are", "Do"], 0, "now + she ← Is", ROW("👧", "🎹")),
 Q(PG, "___ your brother play basketball?", ["Does", "Is", "Do", "Are"], 0, "he + פועל רגיל ← Does", ROW("👦", "🏀")),
 Q(PG, "Sorry, I can't talk now. I ___ dinner.", ["am eating", "eat", "eats", "eating"], 0, "קורה עכשיו ← am eating", ROW("🍽️", "📞")),
 Q(PG, "She ___ meat. She is a vegetarian.", ["doesn't eat", "isn't eat", "don't eat", "not eat"], 0, "הרגל קבוע ← doesn't eat", ROW("👩", "🥗")),
 Q(PG, "They ___ watching TV now. They are sleeping.", ["aren't", "don't", "isn't", "doesn't"], 0, "they + ing ← aren't", ROW("📺", "😴")),
 Q(PG, "What ___ you doing? I'm painting.", ["are", "do", "is", "does"], 0, "you + doing ← are", ROW("🧒", "🎨")),
 Q(PG, "What ___ he do on Fridays?", ["does", "is", "do", "are"], 0, "הרגל + he ← does", ROW("👦", "📅")),
 Q(PG, "Which is correct about dancing?", ["She is dancing.", "She dancing.", "She is dance.", "She are dancing."], 0, "she ← is + ing", "💃"),
 Q(PG, "Which is correct about walking?", ["He usually walks.", "He usually walk.", "He usually walking.", "Usually he walk."], 0, "usually ← Present Simple, he ← s", "🚶"),
 Q(PG, "Does she like cats? Yes, she ___.", ["does", "is", "likes", "do"], 0, "Does ← Yes, she does", ROW("👧", "🐈")),
 Q(PG, "Are they swimming? No, they ___.", ["aren't", "don't", "isn't", "doesn't"], 0, "Are ← No, they aren't", ROW("👫", "🏖️")),
]))

# ───────────── can · there is / are · have got ─────────────
C.append(("can · have got", [CT], [
 Q(CT, "Fish ___ swim, but they can't walk.", ["can", "can't", "are", "have"], 0, "דגים יודעים לשחות ← can", "🐟"),
 Q(CT, "My grandpa is ninety. He ___ run fast.", ["can't", "can", "isn't", "hasn't"], 0, "הוא לא מסוגל ← can't", "👴"),
 Q(CT, "___ you play the guitar? Yes, I can.", ["Can", "Do", "Are", "Have"], 0, "Yes, I can ← Can you…?", "🎸"),
 Q(CT, "She can ___ three languages.", ["speak", "speaks", "speaking", "to speak"], 0, "אחרי can ← צורת בסיס", ROW("👩", "💬")),
 Q(CT, "I ___ got a new bike.", ["have", "has", "am", "is"], 0, "I ← have got", "🚲"),
 Q(CT, "My sister ___ got long hair. It goes down to her back.", ["has", "have", "is", "does"], 0, "she ← has got", "👱‍♀️"),
 Q(CT, "___ you got a pet? Yes, I have.", ["Have", "Has", "Do", "Are"], 0, "you ← Have you got…?", ROW("🐕", "🐈")),
 Q(CT, "Has he got a phone? No, he ___.", ["hasn't", "haven't", "doesn't", "isn't"], 0, "Has he ← No, he hasn't", ROW("👦", "📱")),
 Q(CT, "We haven't ___ a car.", ["got", "get", "gets", "getting"], 0, "haven't got = אין לנו", "🚗"),
 Q(CT, "Which is correct?", ["She's got cats.", "She've got cats.", "She's get cats.", "She haves cats."], 0, "she has got = she's got", ROW("👧", "🐈", "🐈")),
]))

C.append(("there is · there are", [CT], [
 Q(CT, "There ___ a big tree in our yard. I sit under it.", ["is", "are", "am", "have"], 0, "עץ אחד ← There is", ROW("🌳", "🏡")),
 Q(CT, "There ___ thirty students in my class.", ["are", "is", "am", "has"], 0, "30 = רבים ← There are", "🏫"),
 Q(CT, "There isn't ___ milk in the fridge.", ["any", "a", "some", "many"], 0, "בשלילה ← any", ROW("🥛", "❌")),
 Q(CT, "___ there any apples on the table?", ["Are", "Is", "Do", "Have"], 0, "apples = רבים ← Are there", COUNT(("🍎", 3))),
 Q(CT, "Is there a pool at your school? No, there ___.", ["isn't", "aren't", "doesn't", "not"], 0, "Is there ← No, there isn't", ROW("🏫", "🏊")),
 Q(CT, "How many cookies are there?", ["There are five.", "There is five.", "There are four.", "There is four."], 0, "חמש עוגיות, רבים ← There are", COUNT(("🍪", 5))),
 Q(CT, "There are many ___ in the zoo.", ["animals", "animal", "an animal", "animales"], 0, "many ← שם עצם ברבים", ROW("🦁", "🐘", "🦒")),
 Q(CT, "Which sentence about books is correct?", ["There are books.", "There is books.", "There are book.", "There am books."], 0, "רבים ← There are + books", COUNT(("📕", 3))),
 Q(CT, "There ___ no clouds in the sky today.", ["are", "is", "am", "be"], 0, "clouds = רבים ← are", "☀️"),
 Q(CT, "There is ___ orange on the plate.", ["an", "a", "two", "some"], 0, "לפני תנועה ← an", "🍊"),
]))

# ───────────── Plurals ─────────────
C.append(("Plurals: -s · -es · -ies · -ves", [PL], [
 Q(PL, "I have two ___ and a cat.", ["brothers", "brother", "brotheres", "brotheries"], 0, "רוב המילים ← מוסיפים s", ROW("👦", "👦", "🐈")),
 Q(PL, "There are three ___ on the table.", ["boxes", "boxs", "box", "boxies"], 0, "אחרי x ← es", COUNT(("📦", 3))),
 Q(PL, "My mom has two ___.", ["watches", "watchs", "watch", "watchies"], 0, "אחרי ch ← es", COUNT(("⌚", 2))),
 Q(PL, "The ___ are crying.", ["babies", "babys", "babyes", "baby"], 0, "y אחרי עיצור ← ies", COUNT(("👶", 2))),
 Q(PL, "There are seven ___ in a week.", ["days", "daies", "dayes", "day"], 0, "y אחרי תנועה ← רק s", "🗓️"),
 Q(PL, "I need two ___ for the soup.", ["potatoes", "potatos", "potato", "potatoies"], 0, "potato ← מוסיפים es", COUNT(("🥔", 2))),
 Q(PL, "She washes the ___ after dinner.", ["dishes", "dishs", "dish", "dishies"], 0, "אחרי sh ← es", COUNT(("🍽️", 3))),
 Q(PL, "Which plural is NOT correct?", ["boxs", "cities", "keys", "buses"], 0, "box ← boxes, לא boxs", ROW("📦", "🏙️", "🔑", "🚌")),
 Q(PL, "In autumn the ___ fall from the trees.", ["leaves", "leafs", "leafes", "leaf"], 0, "f ← ves: leaf – leaves", "🍂"),
 Q(PL, "There are many ___ in our city.", ["libraries", "librarys", "libraryes", "library"], 0, "y אחרי עיצור ← ies", ROW("🏙️", "📖")),
]))

C.append(("Irregular plurals", [PL], [
 Q(PL, "Two ___ are talking.", ["women", "womans", "woman", "womens"], 0, "woman – women", COUNT(("👩", 2))),
 Q(PL, "The ___ are playing in the park.", ["children", "childs", "childrens", "child"], 0, "child – children", ROW("🧒", "🧒", "🌳")),
 Q(PL, "I walked a lot. My ___ hurt.", ["feet", "foots", "feets", "foot"], 0, "foot – feet", COUNT(("🦶", 2))),
 Q(PL, "Brush your ___ before bed.", ["teeth", "tooths", "teeths", "tooth"], 0, "tooth – teeth", "😁"),
 Q(PL, "There are three ___ in the kitchen!", ["mice", "mouses", "mices", "mouse"], 0, "mouse – mice", COUNT(("🐁", 3))),
 Q(PL, "The farmer has twenty ___.", ["sheep", "sheeps", "sheepes", "sheepies"], 0, "sheep – sheep (אותה מילה)", COUNT(("🐑", 3))),
 Q(PL, "Look at those two ___! They're very tall.", ["men", "mans", "mens", "man"], 0, "man – men", COUNT(("👨", 2))),
 Q(PL, "Which pair is correct?", ["child – children", "foot – foots", "mouse – mouses", "tooth – tooths"], 0, "child – children (יוצא דופן)", ROW("🧒", "🧒", "🧒")),
 Q(PL, "One person, two ___.", ["people", "person", "peoples", "persons"], 0, "person – people", "👥"),
 Q(PL, "One goose, two ___.", ["geese", "gooses", "goose", "geeses"], 0, "goose – geese (כמו tooth – teeth)", TXT("goose → ?")),
]))

# ───────────── Pronouns & possessives ─────────────
C.append(("Pronouns: she · her · them", [PN], [
 Q(PN, "Dana is my friend. ___ lives near me.", ["She", "Her", "He", "They"], 0, "Dana = היא, לפני הפועל ← She", "👧"),
 Q(PN, "I love my grandparents. I visit ___ every week.", ["them", "they", "their", "us"], 0, "אחרי הפועל, רבים ← them", ROW("👴", "👵")),
 Q(PN, "Can you help ___? I can't open the door.", ["me", "I", "my", "mine"], 0, "אחרי help ← me", "🚪"),
 Q(PN, "This is Mr. Cohen. Do you know ___?", ["him", "he", "his", "them"], 0, "אחרי know, הוא ← him", "👨"),
 Q(PN, "Ben and I are brothers. ___ live in Haifa.", ["We", "Us", "They", "Our"], 0, "Ben and I = אנחנו ← We", ROW("👦", "👦")),
 Q(PN, "The cat is hungry. Please feed ___.", ["it", "its", "they", "them"], 0, "חתול = it, אחרי הפועל ← it", "🐈"),
 Q(PN, "Look at those birds! ___ are beautiful.", ["They", "Them", "It", "Their"], 0, "birds = הן, לפני הפועל ← They", COUNT(("🐦", 3))),
 Q(PN, "Mom called my sister and ___. We both came.", ["me", "I", "my", "mine"], 0, "אחרי called ← me", ROW("👩", "📞")),
 Q(PN, "\"Tom and Lea are late.\" Tom and Lea = ?", ["They", "Them", "We", "She"], 0, "שניים, לפני הפועל ← They", ROW("👦", "👧", "⏰")),
 Q(PN, "Give the book to ___. She wants it.", ["her", "she", "hers", "him"], 0, "she ← אחרי to: her", "📕"),
]))

C.append(("Possessives: my · mine · their", [PN], [
 Q(PN, "This is Noa. ___ hair is red.", ["Her", "She", "His", "Hers"], 0, "השיער שלה ← Her", "👩‍🦰"),
 Q(PN, "Dan is sad. ___ dog is sick.", ["His", "He", "Her", "Him"], 0, "הכלב שלו ← His", ROW("👦", "🐕")),
 Q(PN, "We love ___ new house. We moved in last week.", ["our", "us", "we", "ours"], 0, "הבית שלנו ← our + שם עצם", "🏡"),
 Q(PN, "The dog is eating ___ food.", ["its", "it's", "it", "their"], 0, "האוכל שלו (של הכלב) ← its", ROW("🐕", "🦴")),
 Q(PN, "Is this your pen? Yes, it's ___.", ["mine", "my", "me", "I"], 0, "שלי בסוף המשפט ← mine", "🖊️"),
 Q(PN, "This bag is Ron's. It's ___.", ["his", "him", "he", "her"], 0, "של רון = שלו ← his", "🎒"),
 Q(PN, "Dan and I bought these shoes. They're ___.", ["ours", "our", "us", "we"], 0, "שלנו בסוף המשפט ← ours", COUNT(("👟", 2))),
 Q(PN, "The children are in ___ classroom.", ["their", "there", "they", "them"], 0, "הכיתה שלהם ← their", "🏫"),
 Q(PN, "Is this ___ phone, Maya?", ["your", "you", "yours", "you're"], 0, "שלך + שם עצם ← your", "📱"),
 Q(PN, "This is Rina's book. The book is ___.", ["hers", "her", "she", "his"], 0, "של רינה = שלה ← hers", "📗"),
]))

# ───────────── Prepositions ─────────────
C.append(("Prepositions of place", [PR], [
 Q(PR, "The ball is ___ the box.", ["on", "under", "in", "between"], 0, "הכדור על הקופסה ← on", ON("⚽", "📦")),
 Q(PR, "The shoes are ___ the bed.", ["under", "on", "in", "between"], 0, "הנעליים מתחת למיטה ← under", UNDER("👟", "🛏️")),
 Q(PR, "The bank is ___ the school and the bakery.", ["between", "under", "behind", "on"], 0, "בין שני דברים ← between", ROW("🏫", "🏦", "🥖")),
 Q(PR, "The car is ___ the house.", ["next to", "under", "on", "between"], 0, "ליד ← next to", NEXT("🏠", "🚗")),
 Q(PR, "I live ___ Jerusalem.", ["in", "on", "at", "under"], 0, "עיר ← in", "🏙️"),
 Q(PR, "The clock hangs ___ the wall above the board.", ["on", "in", "at", "under"], 0, "על הקיר ← on", "🕒"),
 Q(PR, "Put the milk ___ the fridge.", ["in", "on", "at", "between"], 0, "בתוך המקרר ← in", "🥛"),
 Q(PR, "The teacher stands ___ the children.", ["in front of", "under", "between", "on"], 0, "מול הילדים ← in front of", [("🧒", 25, 34, 24), ("🧒", 50, 34, 24), ("🧒", 75, 34, 24), ("👩‍🏫", 50, 74, 40)]),
 Q(PR, "מאחורי = ?", ["behind", "in front of", "next to", "between"], 0, "מאחורי = behind", TXT("מאחורי")),
 Q(PR, "The cat is ___ the two dogs.", ["between", "under", "on", "in"], 0, "באמצע, בין שניים ← between", ROW("🐕", "🐈", "🐕")),
]))

C.append(("Prepositions of time", [PR], [
 Q(PR, "My birthday is ___ the fifth of May.", ["on", "in", "at", "to"], 0, "תאריך ← on", "🎂"),
 Q(PR, "The shops close ___ midnight.", ["at", "in", "on", "to"], 0, "at midnight = בחצות", ROW("🏪", "🕛")),
 Q(PR, "We have English ___ Sunday.", ["on", "in", "at", "to"], 0, "יום ← on", "📅"),
 Q(PR, "I do my homework ___ the afternoon.", ["in", "on", "at", "to"], 0, "in the afternoon", ROW("📓", "🕓")),
 Q(PR, "We go to bed ___ night.", ["at", "in", "on", "to"], 0, "at night", "🌙"),
 Q(PR, "It is very hot ___ the summer.", ["in", "on", "at", "to"], 0, "עונה ← in", "☀️"),
 Q(PR, "The party is ___ Friday evening.", ["on", "in", "at", "to"], 0, "יום (גם עם ערב) ← on", "🎉"),
 Q(PR, "My grandpa was born ___ 1950.", ["in", "on", "at", "to"], 0, "שנה ← in", TXT("1950")),
 Q(PR, "The film starts ___ half past six.", ["at", "in", "on", "to"], 0, "שעה ← at", "🎬"),
 Q(PR, "Which is correct?", ["in the morning", "on the morning", "at the morning", "in morning"], 0, "in the morning = בבוקר", "🌅"),
]))

# ───────────── Questions ─────────────
C.append(("Question words", [QW], [
 Q(QW, "___ does the film start? At seven.", ["When", "Where", "Who", "What"], 0, "זמן ← When", "🎬"),
 Q(QW, "___ does your uncle work? In a hospital.", ["Where", "When", "Who", "How"], 0, "מקום ← Where", ROW("👨", "🏥")),
 Q(QW, "___ is that man? He's my uncle.", ["Who", "What", "Where", "Which"], 0, "אדם ← Who", "👨"),
 Q(QW, "___ are you sad? Because my cat is sick.", ["Why", "What", "How", "Who"], 0, "Because ← Why", "😢"),
 Q(QW, "___ old is your sister? She is nine.", ["How", "What", "Who", "Which"], 0, "גיל ← How old", "👧"),
 Q(QW, "___ pencils have you got? Three.", ["How many", "How much", "How old", "What"], 0, "מספר ← How many", COUNT(("✏️", 3))),
 Q(QW, "___ is your phone number? 054-1234567.", ["What", "Who", "Where", "When"], 0, "מספר טלפון ← What", "📱"),
 Q(QW, "___ book is yours, the red or the blue?", ["Which", "Who", "Where", "How"], 0, "בחירה בין שניים ← Which", ROW("📕", "📘")),
 Q(QW, "___ do you go to school? By bus.", ["How", "What", "Where", "When"], 0, "איך ← How", "🚌"),
 Q(QW, "___ bag is this? It's Dan's.", ["Whose", "Who", "Who's", "Where"], 0, "של מי ← Whose", "🎒"),
]))

C.append(("Making questions", [QW], [
 Q(QW, "Which question about \"ready\" is correct?", ["Is she ready?", "Are she ready?", "Ready is she?", "Is ready she?"], 0, "בשאלה is בא לפני she", "👩"),
 Q(QW, "Which question about swimming is correct?", ["Does he swim?", "Do he swim?", "Does he swims?", "Does swim he?"], 0, "he ← Does + פועל בלי s", "🏊"),
 Q(QW, "Which question about dancing is correct?", ["Can you dance?", "Can you dancing?", "You can dancing?", "Can dance you?"], 0, "Can בא לפני you", "💃"),
 Q(QW, "Where ___ your parents work?", ["do", "does", "are", "is"], 0, "parents = רבים ← do", ROW("👨", "👩")),
 Q(QW, "Where ___ he going now?", ["is", "does", "are", "do"], 0, "now + he ← is", "🚶"),
 Q(QW, "___ do you get up? At seven o'clock.", ["What time", "Where", "Who", "How many"], 0, "שעה ← What time", "⏰"),
 Q(QW, "Which question goes with \"I'm fine, thanks\"?", ["How are you?", "Who are you?", "Where are you?", "What are you?"], 0, "How are you? = מה שלומך?", "🙂"),
 Q(QW, "Which question goes with \"He's a pilot\"?", ["What's his job?", "Where is he?", "How is he?", "Who's his job?"], 0, "pilot = מקצוע ← What's his job?", "👨‍✈️"),
 Q(QW, "\"No, she doesn't.\" – Which question?", ["Does she sing?", "Is she singing?", "Can she sing?", "Do she sing?"], 0, "doesn't ← Does she…?", "🎤"),
 Q(QW, "\"Yes, I can.\" – Which question?", ["Can you ski?", "Do you ski?", "Are you skiing?", "Did you ski?"], 0, "can ← Can you…?", "⛷️"),
]))

# ───────────── Past: was / were · -ed ─────────────
C.append(("Past: was · were", [PW], [
 Q(PW, "Yesterday I ___ at home all day. I didn't go out.", ["was", "were", "am", "is"], 0, "I בעבר ← was", "🏠"),
 Q(PW, "We ___ at the beach last Saturday.", ["were", "was", "are", "be"], 0, "we בעבר ← were", "🏖️"),
 Q(PW, "Last night the film ___ very funny. We laughed a lot.", ["was", "were", "are", "be"], 0, "the film = it, עבר ← was", "🎬"),
 Q(PW, "My parents ___ in London last year.", ["were", "was", "are", "is"], 0, "parents = רבים, עבר ← were", ROW("👨", "👩", "✈️")),
 Q(PW, "___ you tired yesterday?", ["Were", "Was", "Are", "Did"], 0, "you בעבר ← Were", "😴"),
 Q(PW, "Was it cold yesterday? No, it ___.", ["wasn't", "weren't", "isn't", "didn't"], 0, "Was it ← No, it wasn't", "🌡️"),
 Q(PW, "Last Saturday the shops ___ closed.", ["were", "was", "are", "did"], 0, "shops = רבים, עבר ← were", "🏪"),
 Q(PW, "Where ___ Dan yesterday?", ["was", "were", "did", "is"], 0, "Dan = he, עבר ← was", "👦"),
 Q(PW, "Two days ago it ___ my birthday. I got a bike!", ["was", "were", "is", "did"], 0, "ago = עבר ← was", "🎂"),
 Q(PW, "Which is correct?", ["They were happy.", "They was happy.", "They wasn't happy.", "They be happy."], 0, "they בעבר ← were", "😊"),
]))

C.append(("Past: -ed verbs", [PW], [
 Q(PW, "Yesterday I ___ (play) football with my friends.", ["played", "play", "plays", "playing"], 0, "yesterday ← עבר: played", "⚽"),
 Q(PW, "We ___ a funny film last night.", ["watched", "watch", "watches", "watching"], 0, "last night ← עבר: watched", "📺"),
 Q(PW, "Last Friday she ___ her room.", ["cleaned", "clean", "cleans", "cleaning"], 0, "last Friday ← עבר: cleaned", "🧹"),
 Q(PW, "Past of \"hurry\"?", ["hurried", "hurryed", "hured", "hurries"], 0, "y אחרי עיצור ← ied", TXT("hurry → ?")),
 Q(PW, "Past of \"shop\"?", ["shopped", "shoped", "shopt", "shops"], 0, "מכפילים את p ← shopped", TXT("shop → ?")),
 Q(PW, "Past of \"smile\"?", ["smiled", "smileed", "smilied", "smiles"], 0, "מסתיים ב-e ← מוסיפים רק d", TXT("smile → ?")),
 Q(PW, "Past of \"stay\"?", ["stayed", "staied", "staid", "stays"], 0, "y אחרי תנועה ← ed", TXT("stay → ?")),
 Q(PW, "Last night the baby ___ (cry) a lot.", ["cried", "cryed", "cries", "crying"], 0, "cry ← cried", "👶"),
 Q(PW, "Two years ago we ___ to a new house.", ["moved", "move", "moves", "moving"], 0, "ago ← עבר: moved", ROW("🚚", "🏡")),
 Q(PW, "Yesterday I ___ to school with Dan.", ["walked", "walk", "walking", "walks"], 0, "yesterday ← עבר: walked", "🚶"),
 Q(PW, "I ___ my grandma on the phone yesterday.", ["called", "call", "calls", "calling"], 0, "yesterday ← עבר: called", ROW("👵", "📞")),
]))

# ───────────── Past: irregular verbs ─────────────
C.append(("Irregular verbs: went · saw · ate", [PI], [
 Q(PI, "Yesterday we ___ (go) to the zoo.", ["went", "goed", "go", "gone"], 0, "go ← went", ROW("🦁", "🐒")),
 Q(PI, "At the zoo I ___ a big lion.", ["saw", "seed", "see", "sees"], 0, "see ← saw", ROW("👀", "🦁")),
 Q(PI, "Last night we ___ (eat) pizza.", ["ate", "eated", "eat", "eats"], 0, "eat ← ate", "🍕"),
 Q(PI, "Last week she ___ (have) a great party.", ["had", "haved", "has", "have"], 0, "have ← had", "🎉"),
 Q(PI, "Dad ___ (buy) me a new ball yesterday.", ["bought", "buyed", "buys", "buy"], 0, "buy ← bought", ROW("👨", "⚽")),
 Q(PI, "Past of \"write\"?", ["wrote", "writed", "writted", "writes"], 0, "write ← wrote", TXT("write → ?")),
 Q(PI, "Past of \"come\"?", ["came", "comed", "come", "comes"], 0, "come ← came", TXT("come → ?")),
 Q(PI, "Yesterday I ___ (do) my homework after school.", ["did", "doed", "do", "does"], 0, "do ← did", "📓"),
 Q(PI, "Last Friday we ___ (make) a cake for Mom.", ["made", "maked", "make", "makes"], 0, "make ← made", ROW("🎂", "👩")),
 Q(PI, "Last night Tom ___ (tell) his sister a story.", ["told", "telled", "tell", "tells"], 0, "tell ← told", ROW("👦", "👧", "🌙")),
]))

C.append(("Irregular verbs: swam · took · got", [PI], [
 Q(PI, "Past of \"drink\"?", ["drank", "drinked", "drunk", "drinks"], 0, "drink ← drank", TXT("drink → ?")),
 Q(PI, "Past of \"get\"?", ["got", "getted", "gets", "geted"], 0, "get ← got", TXT("get → ?")),
 Q(PI, "Past of \"take\"?", ["took", "taked", "takes", "tooked"], 0, "take ← took", TXT("take → ?")),
 Q(PI, "Last summer I ___ in the sea every day.", ["swam", "swim", "swims", "swimmed"], 0, "swim ← swam", ROW("🏊", "🌊")),
 Q(PI, "Yesterday she ___ up at six.", ["got", "get", "gets", "getted"], 0, "get up ← got up", "⏰"),
 Q(PI, "Last week we ___ (take) the bus to Haifa.", ["took", "take", "takes", "taked"], 0, "take ← took", "🚌"),
 Q(PI, "Yesterday the children ___ a song in class.", ["sang", "singed", "sing", "sings"], 0, "sing ← sang", ROW("🧒", "🎵")),
 Q(PI, "Yesterday I ___ a race and won!", ["ran", "run", "runs", "running"], 0, "run ← ran", "🏃"),
 Q(PI, "Which pair is correct?", ["go – went", "see – seed", "eat – eated", "have – haved"], 0, "go – went (פועל חריג)", TXT("now → past")),
 Q(PI, "I ___ my keys yesterday. I can't find them!", ["lost", "losed", "lose", "loses"], 0, "lose ← lost", "🔑"),
]))

# ───────────── Past: didn't · Did…? ─────────────
C.append(("Past: didn't", [PD], [
 Q(PD, "I ___ go to school yesterday. I was sick.", ["didn't", "don't", "wasn't", "doesn't"], 0, "yesterday + פועל ← didn't", "🤒"),
 Q(PD, "She didn't ___ (eat) her lunch.", ["eat", "ate", "eats", "eating"], 0, "אחרי didn't ← צורת בסיס", "🥪"),
 Q(PD, "We didn't ___ the film. It was boring.", ["like", "liked", "likes", "liking"], 0, "אחרי didn't ← צורת בסיס", "🎬"),
 Q(PD, "He didn't ___ (do) his homework last night.", ["do", "did", "does", "done"], 0, "אחרי didn't ← do", "📓"),
 Q(PD, "Last week they ___ come to the party.", ["didn't", "weren't", "don't", "doesn't"], 0, "last week + פועל ← didn't", "🎉"),
 Q(PD, "I saw Dan. → I didn't ___ Dan.", ["see", "saw", "seen", "sees"], 0, "didn't + see (לא saw)", ROW("👀", "👦")),
 Q(PD, "Which is correct?", ["She didn't go.", "She didn't went.", "She not went.", "She doesn't went."], 0, "didn't + צורת בסיס", "🚶‍♀️"),
 Q(PD, "Last month it ___ rain at all.", ["didn't", "wasn't", "doesn't", "isn't"], 0, "last month + פועל ← didn't", ROW("☀️", "🌵")),
 Q(PD, "We ___ at home yesterday. We were at the park.", ["weren't", "didn't", "wasn't", "aren't"], 0, "we + מקום, בלי פועל ← weren't", "🌳"),
 Q(PD, "Yesterday Mom ___ buy milk.", ["didn't", "wasn't", "don't", "weren't"], 0, "yesterday + פועל ← didn't", "🥛"),
]))

C.append(("Past: Did…? questions", [PD], [
 Q(PD, "___ you see the game last night?", ["Did", "Do", "Were", "Was"], 0, "last night + פועל ← Did", "⚽"),
 Q(PD, "Did she ___ the bus yesterday?", ["take", "took", "takes", "taking"], 0, "אחרי Did ← צורת בסיס", "🚌"),
 Q(PD, "Did you like the cake? Yes, I ___.", ["did", "do", "was", "liked"], 0, "Did ← Yes, I did", "🎂"),
 Q(PD, "Did they win? No, they ___.", ["didn't", "don't", "weren't", "wasn't"], 0, "Did ← No, they didn't", ROW("⚽", "🥈")),
 Q(PD, "Where ___ you go last summer?", ["did", "do", "were", "was"], 0, "last summer + go ← did", "✈️"),
 Q(PD, "What did you ___ for breakfast?", ["eat", "ate", "eats", "eating"], 0, "אחרי did ← צורת בסיס", "🥣"),
 Q(PD, "___ your friends at the party last night?", ["Were", "Did", "Was", "Do"], 0, "רבים + מקום, בלי פועל ← Were", "🎉"),
 Q(PD, "Which question is correct?", ["Did he call?", "Did he called?", "Does he called?", "Did called he?"], 0, "Did + פועל בלי ed", "📞"),
 Q(PD, "\"Yes, he did.\" – Which question?", ["Did he win?", "Is he winning?", "Does he win?", "Can he win?"], 0, "did ← Did he…?", ROW("👦", "🥇")),
 Q(PD, "How ___ you get to Eilat last year?", ["did", "do", "were", "was"], 0, "last year + get ← did", ROW("✈️", "🏜️")),
]))

# ───────────── Words: family, routines & jobs ─────────────
C.append(("Family", [VP], [
 Q(VP, "My mother's mother is my ___.", ["grandmother", "aunt", "cousin", "sister"], 0, "אמא של אמא = סבתא", TXT("mom's mom")),
 Q(VP, "My father's brother is my ___.", ["uncle", "cousin", "grandfather", "nephew"], 0, "אח של אבא = דוד = uncle", TXT("dad's brother")),
 Q(VP, "My uncle's son is my ___.", ["cousin", "brother", "uncle", "nephew"], 0, "בן של הדוד = בן דוד = cousin", TXT("uncle's son")),
 Q(VP, "My mom's sister is my ___.", ["aunt", "cousin", "niece", "grandma"], 0, "אחות של אמא = דודה = aunt", TXT("mom's sister")),
 Q(VP, "My parents are my mother and my ___.", ["father", "brother", "uncle", "son"], 0, "parents = הורים = אמא ואבא", "👪"),
 Q(VP, "Dan is Rina's son. Rina is Dan's ___.", ["mother", "sister", "aunt", "daughter"], 0, "Dan הבן שלה ← היא אמא שלו", ROW("👩", "👦")),
 Q(VP, "בת (של אמא ואבא) = ?", ["daughter", "son", "sister", "aunt"], 0, "בת = daughter, בן = son", ROW("👨", "👩", "👧")),
 Q(VP, "My father's father is my ___.", ["grandfather", "uncle", "cousin", "brother"], 0, "אבא של אבא = סבא", TXT("dad's dad")),
 Q(VP, "Which word is NOT a family member?", ["teacher", "cousin", "aunt", "uncle"], 0, "teacher = מורה, לא משפחה", "👪"),
 Q(VP, "בעל = ?", ["husband", "wife", "son", "uncle"], 0, "בעל = husband, אישה = wife", "🤵"),
]))

C.append(("Daily routine", [VP], [
 Q(VP, "Every morning I ___ my teeth.", ["brush", "wash", "cut", "take"], 0, "brush my teeth = לצחצח שיניים", "🦷"),
 Q(VP, "Every morning Dad ___ me to school by car.", ["takes", "makes", "does", "goes"], 0, "take me to school = לקחת אותי", ROW("👨", "🚗", "🏫")),
 Q(VP, "I ___ my homework in the afternoon.", ["do", "make", "take", "play"], 0, "do homework = להכין שיעורים", "📓"),
 Q(VP, "I wake up and ___ out of bed.", ["get", "take", "put", "make"], 0, "get out of bed = לקום מהמיטה", "🛏️"),
 Q(VP, "I get ___ and go to school.", ["dressed", "dress", "dressing", "clothes"], 0, "get dressed = להתלבש", ROW("👕", "👖")),
 Q(VP, "At night I ___ to bed at ten. (הולך)", ["go", "get", "take", "make"], 0, "go to bed = ללכת לישון", "🌙"),
 Q(VP, "Mom ___ dinner for the family.", ["cooks", "washes", "sleeps", "drives"], 0, "cook dinner = לבשל ארוחת ערב", ROW("👩", "🍽️")),
 Q(VP, "I ___ my face with cold water every morning.", ["wash", "brush", "take", "cut"], 0, "wash my face = לשטוף פנים", ROW("💧", "🌅")),
 Q(VP, "First I wake up, then I ___ breakfast. (אוכל)", ["have", "do", "take", "go"], 0, "have breakfast = לאכול ארוחת בוקר", "🥣"),
 Q(VP, "I ___ the dog in the park every evening.", ["walk", "go", "ride", "drive"], 0, "walk the dog = לטייל עם הכלב", "🐕"),
]))

C.append(("Jobs", [VP], [
 Q(VP, "A ___ helps sick people in a hospital.", ["doctor", "pilot", "farmer", "driver"], 0, "doctor = רופא", ROW("🤒", "🏥")),
 Q(VP, "A ___ flies a plane.", ["pilot", "driver", "cook", "farmer"], 0, "pilot = טייס", "✈️"),
 Q(VP, "A ___ teaches children at school.", ["teacher", "nurse", "baker", "dentist"], 0, "teacher = מורה", "🏫"),
 Q(VP, "A ___ makes food in a restaurant.", ["cook", "pilot", "dentist", "farmer"], 0, "cook = טבח", ROW("🍲", "🍽️")),
 Q(VP, "A ___ grows vegetables and fruit.", ["farmer", "firefighter", "singer", "nurse"], 0, "farmer = חקלאי", ROW("🥕", "🍎")),
 Q(VP, "A ___ puts out fires.", ["firefighter", "pilot", "waiter", "dentist"], 0, "firefighter = כבאי", "🔥"),
 Q(VP, "A ___ checks your teeth.", ["dentist", "farmer", "driver", "singer"], 0, "dentist = רופא שיניים", "🦷"),
 Q(VP, "A ___ brings food to your table.", ["waiter", "pilot", "farmer", "dentist"], 0, "waiter = מלצר", "🍽️"),
 Q(VP, "A ___ drives a bus.", ["driver", "pilot", "singer", "baker"], 0, "driver = נהג", "🚌"),
 Q(VP, "A ___ helps people and catches thieves.", ["police officer", "doctor", "cook", "teacher"], 0, "police officer = שוטר", ROW("🏃", "💰")),
]))

# ───────────── Words: school, sports & food ─────────────
C.append(("School subjects", [VS], [
 Q(VS, "In ___ we learn about numbers.", ["math", "history", "art", "music"], 0, "math = חשבון / מתמטיקה", TXT("7 × 8 = ?")),
 Q(VS, "In ___ we draw and paint.", ["art", "science", "math", "history"], 0, "art = אומנות", "🎨"),
 Q(VS, "In ___ we sing songs.", ["music", "geography", "math", "science"], 0, "music = מוזיקה", "🎵"),
 Q(VS, "In ___ we learn about maps and countries.", ["geography", "history", "art", "music"], 0, "geography = גאוגרפיה", "🗺️"),
 Q(VS, "In ___ we learn about plants and animals.", ["science", "history", "math", "art"], 0, "science = מדעים", ROW("🌱", "🐞")),
 Q(VS, "In ___ we learn about kings and the past.", ["history", "geography", "math", "PE"], 0, "history = היסטוריה", "👑"),
 Q(VS, "In ___ we run and play games.", ["PE", "art", "math", "music"], 0, "PE = חינוך גופני (ספורט)", "🏃"),
 Q(VS, "Schoolwork that you do at home is called ___.", ["homework", "classroom", "lesson", "timetable"], 0, "homework = שיעורי בית", ROW("📓", "🏠")),
 Q(VS, "מערכת שעות = ?", ["timetable", "homework", "test", "break"], 0, "מערכת שעות = timetable", "🗓️"),
 Q(VS, "הפסקה (בבית הספר) = ?", ["break", "lesson", "test", "class"], 0, "הפסקה = break", "🔔"),
]))

C.append(("Sports", [VS], [
 Q(VS, "You kick the ball in ___.", ["football", "tennis", "basketball", "swimming"], 0, "football = כדורגל", "🦶"),
 Q(VS, "You need a racket for ___.", ["tennis", "football", "swimming", "running"], 0, "racket = מחבט ← tennis", ROW("🎾", "⚽", "🏊", "🏃")),
 Q(VS, "In ___ you throw the ball into a basket.", ["basketball", "football", "tennis", "swimming"], 0, "basketball = כדורסל", "🧺"),
 Q(VS, "You need a pool for ___.", ["swimming", "skiing", "cycling", "running"], 0, "swimming = שחייה", ROW("🏊", "⛷️", "🚴", "🏃")),
 Q(VS, "You need snow for ___.", ["skiing", "swimming", "cycling", "tennis"], 0, "skiing = סקי", "❄️"),
 Q(VS, "The sport with a bike is ___.", ["cycling", "running", "skiing", "swimming"], 0, "cycling = רכיבה על אופניים", "🚲"),
 Q(VS, "We ___ basketball after school.", ["play", "go", "do", "make"], 0, "משחק עם כדור ← play", "🏀"),
 Q(VS, "I ___ swimming every Friday.", ["go", "play", "do", "make"], 0, "go + ing: go swimming", "🏊"),
 Q(VS, "לנצח (במשחק) = ?", ["win", "lose", "play", "throw"], 0, "לנצח = win, להפסיד = lose", "🥇"),
 Q(VS, "קבוצה (בספורט) = ?", ["team", "game", "ball", "coach"], 0, "קבוצה = team", COUNT(("⚽", 1), ("🏃", 5))),
]))

C.append(("Food", [VS], [
 Q(VS, "Which one is a vegetable?", ["carrot", "banana", "apple", "cake"], 0, "carrot = גזר, ירק", ROW("🥕", "🍌", "🍎", "🍰")),
 Q(VS, "Which one is a fruit?", ["grapes", "potato", "carrot", "cucumber"], 0, "grapes = ענבים, פרי", ROW("🍇", "🥔", "🥕", "🥒")),
 Q(VS, "Cows give us ___.", ["milk", "juice", "eggs", "bread"], 0, "פרה ← חלב = milk", "🐄"),
 Q(VS, "Chickens give us ___.", ["eggs", "milk", "cheese", "bread"], 0, "תרנגולת ← ביצים = eggs", "🐔"),
 Q(VS, "I eat ___ with a spoon.", ["soup", "bread", "an apple", "pizza"], 0, "soup = מרק, אוכלים בכף", "🥄"),
 Q(VS, "Breakfast, lunch and ___.", ["dinner", "dessert", "snack", "kitchen"], 0, "dinner = ארוחת ערב", "🍽️"),
 Q(VS, "Ice cream is ___.", ["sweet", "salty", "sour", "hot"], 0, "sweet = מתוק", "🍦"),
 Q(VS, "Lemons are ___.", ["sour", "sweet", "salty", "hot"], 0, "sour = חמוץ", "🍋"),
 Q(VS, "I'm thirsty. Can I have some ___ from the tap?", ["water", "bread", "rice", "cheese"], 0, "thirsty = צמא ← water", ROW("🚰", "🍞", "🍚", "🧀")),
 Q(VS, "ארוחת בוקר = ?", ["breakfast", "lunch", "dinner", "dessert"], 0, "ארוחת בוקר = breakfast", ROW("🥣", "🌅")),
 Q(VS, "The meal at noon, between breakfast and dinner, is ___.", ["lunch", "supper", "dessert", "menu"], 0, "lunch = ארוחת צהריים", ROW("🥪", "🕛")),
]))

# ───────────── Words: places, weather & feelings ─────────────
C.append(("Places", [VW], [
 Q(VW, "Shh! People are reading and borrowing books in the ___.", ["library", "bank", "bakery", "hospital"], 0, "library = ספרייה", "📖"),
 Q(VW, "Sick people go to the ___.", ["hospital", "museum", "cinema", "airport"], 0, "hospital = בית חולים", "🤒"),
 Q(VW, "You see old things and art in a ___.", ["museum", "zoo", "pool", "market"], 0, "museum = מוזיאון", ROW("🏺", "🖼️")),
 Q(VW, "Planes take off at the ___.", ["airport", "bus stop", "library", "beach"], 0, "airport = שדה תעופה", "🛫"),
 Q(VW, "You buy fruit and vegetables at the ___.", ["market", "bank", "post office", "cinema"], 0, "market = שוק", ROW("🍎", "🥕", "🍌")),
 Q(VW, "You swim and play in the sand at the ___.", ["beach", "library", "bank", "airport"], 0, "beach = חוף ים", ROW("🏖️", "📖", "🏦", "🛫")),
 Q(VW, "You wait for the train at the ___.", ["station", "airport", "beach", "office"], 0, "station = תחנה", "🚆"),
 Q(VW, "You watch a film at the ___.", ["cinema", "museum", "library", "bank"], 0, "cinema = קולנוע", "🎬"),
 Q(VW, "You buy bread and cakes at the ___.", ["bakery", "bank", "library", "station"], 0, "bakery = מאפייה", ROW("🥖", "🍰")),
 Q(VW, "שכונה = ?", ["neighborhood", "street", "city", "country"], 0, "שכונה = neighborhood", "🏘️"),
]))

C.append(("Weather", [VW], [
 Q(VW, "It's ___ today. Take an umbrella – the streets are wet.", ["rainy", "sunny", "hot", "dry"], 0, "rainy = גשום", "🌂"),
 Q(VW, "שמשי = ?", ["sunny", "cloudy", "snowy", "rainy"], 0, "שמשי = sunny", "☀️"),
 Q(VW, "There are a lot of clouds. It's ___.", ["cloudy", "sunny", "windy", "hot"], 0, "cloudy = מעונן", "☁️"),
 Q(VW, "My hat flew away! It's very ___.", ["windy", "sunny", "snowy", "cloudy"], 0, "windy = יש רוח חזקה", ROW("😮", "🎩")),
 Q(VW, "It's 40 degrees. It's very ___.", ["hot", "cold", "cool", "freezing"], 0, "40 מעלות = חם מאוד = hot", TXT("40°")),
 Q(VW, "קפוא = ?", ["freezing", "hot", "warm", "sunny"], 0, "freezing = קפוא, קר מאוד", TXT("-5°")),
 Q(VW, "The opposite of hot is ___.", ["cold", "warm", "sunny", "dry"], 0, "ההפך מ-hot = cold", TXT("hot ↔ ?")),
 Q(VW, "Look! The mountain is white. There's ___.", ["snow", "sun", "rain", "wind"], 0, "snow = שלג (לבן)", "🏔️"),
 Q(VW, "סערה = ?", ["storm", "rainbow", "cloud", "wind"], 0, "סערה = storm", "⛈️"),
 Q(VW, "After the rain I can see a ___.", ["rainbow", "storm", "snow", "wind"], 0, "rainbow = קשת בענן", ROW("🌧️", "☀️")),
]))

C.append(("Feelings", [VW], [
 Q(VW, "I have a big test tomorrow. I'm ___ about it.", ["worried", "bored", "hungry", "sleepy"], 0, "worried = מודאג", ROW("📝", "📅")),
 Q(VW, "I didn't eat all day. I'm very ___.", ["hungry", "thirsty", "angry", "scared"], 0, "hungry = רעב", "🍽️"),
 Q(VW, "The opposite of happy is ___.", ["sad", "hungry", "tired", "proud"], 0, "sad = עצוב, happy = שמח", TXT("happy ↔ ?")),
 Q(VW, "There's nothing to do. I'm ___.", ["bored", "excited", "scared", "hungry"], 0, "bored = משועמם", ROW("🛋️", "⏰")),
 Q(VW, "My brother broke my toy. I'm ___ with him!", ["angry", "happy", "bored", "proud"], 0, "angry = כועס", ROW("👦", "🧸")),
 Q(VW, "There's a big spider on my bed! I'm ___.", ["scared", "bored", "proud", "hungry"], 0, "scared = מפחד", "🕷️"),
 Q(VW, "I ran ten kilometers. I'm ___.", ["tired", "bored", "scared", "cold"], 0, "tired = עייף", "🏃"),
 Q(VW, "Tomorrow we're going to Eilat! I'm so ___.", ["excited", "bored", "sad", "angry"], 0, "excited = נרגש", ROW("🧳", "🏖️")),
 Q(VW, "My goldfish died. I'm ___.", ["sad", "happy", "excited", "proud"], 0, "sad = עצוב", "🐠"),
 Q(VW, "I won first prize! My parents are ___ of me.", ["proud", "scared", "tired", "angry"], 0, "proud of = גאה ב…", "🥇"),
]))

# ───────────── this · that · these · those ─────────────
C.append(("this · these (near)", [TH], [
 Q(TH, "___ is my pencil, here in my hand.", ["This", "These", "Those", "They"], 0, "קרוב ויחיד ← This", ROW("✋", "✏️")),
 Q(TH, "Look at ___ shoes on my feet!", ["these", "this", "those", "that"], 0, "קרוב (על הרגליים) ורבים ← these", COUNT(("👟", 2))),
 Q(TH, "___ apples here are red.", ["These", "This", "Those", "That"], 0, "here + רבים ← These", COUNT(("🍎", 3))),
 Q(TH, "I have a cookie in my hand. ___ cookie is yummy.", ["This", "These", "Those", "That"], 0, "קרוב (ביד) ויחיד ← This", ROW("✋", "🍪")),
 Q(TH, "Plural of \"this\"?", ["these", "those", "thises", "this's"], 0, "this (יחיד) – these (רבים)", TXT("this → ?")),
 Q(TH, "Which is correct?", ["These are books.", "This are books.", "These is books.", "These book are."], 0, "these + are + שם עצם ברבים", COUNT(("📕", 3))),
 Q(TH, "Mom, ___ is my friend Tom. He's in my class.", ["this", "these", "they", "it's"], 0, "מציגים אדם אחד ← this is", ROW("👩", "👦")),
 Q(TH, "These ___ my parents.", ["are", "is", "am", "be"], 0, "these = רבים ← are", ROW("👨", "👩")),
 Q(TH, "Are ___ your keys? I found them here.", ["these", "this", "that", "it"], 0, "keys = רבים, קרוב ← these", COUNT(("🔑", 2))),
 Q(TH, "this = ?", ["זה (קרוב)", "אלה (קרובים)", "ההוא (רחוק)", "ההם (רחוקים)"], 0, "this = זה, these = אלה", TXT("this")),
 Q(TH, "these = ?", ["אלה (קרובים)", "זה (קרוב)", "ההוא (רחוק)", "ההם (רחוקים)"], 0, "these = אלה, כמה דברים קרובים", TXT("these")),
]))

C.append(("that · those (far)", [TH], [
 Q(TH, "Look at ___ bird up in the sky!", ["that", "those", "these", "them"], 0, "רחוק ויחיד ← that", ROW("👆", "🐦")),
 Q(TH, "___ mountains over there are very high.", ["Those", "That", "This", "These"], 0, "over there + רבים ← Those", ROW("🏔️", "🏔️")),
 Q(TH, "Who is ___ man over there?", ["that", "those", "these", "this"], 0, "רחוק ויחיד ← that", "👨"),
 Q(TH, "Plural of \"that\"?", ["those", "these", "thats", "thoses"], 0, "that (יחיד) – those (רבים)", TXT("that → ?")),
 Q(TH, "___ stars far away are so bright.", ["Those", "That", "These", "This"], 0, "far away + רבים ← Those", COUNT(("⭐", 3))),
 Q(TH, "The ball is far away. Is ___ your ball?", ["that", "this", "those", "these"], 0, "far away ויחיד ← that", "⚽"),
 Q(TH, "Near: these. Far: ___.", ["those", "this", "here", "that's"], 0, "רבים: these קרוב, those רחוק", TXT("these / ?")),
 Q(TH, "Which is correct?", ["Those are cars.", "Those is cars.", "That are cars.", "Those car are."], 0, "those + are + רבים", ROW("🚗", "🚗")),
 Q(TH, "___ house over there is my grandma's.", ["That", "Those", "These", "This"], 0, "over there ויחיד ← That", ROW("🏠", "👵")),
 Q(TH, "Are ___ your shoes over there, by the door?", ["those", "this", "that", "these"], 0, "over there + shoes (רבים) ← those", ROW("🚪", "👟", "👟")),
]))

# ───────────── Commands: Open… / Don't… ─────────────
C.append(("Commands: Open the door!", [IM], [
 Q(IM, "It's hot in here. ___ the window, please.", ["Open", "Opens", "Opening", "To open"], 0, "ציווי ← פועל בסיס, בלי s", ROW("🥵", "🏠")),
 Q(IM, "___ the door, please. It's cold.", ["Close", "Closes", "Closing", "Closed"], 0, "ציווי מתחיל בפועל בסיס", ROW("🚪", "❄️")),
 Q(IM, "Teacher: \"___ your books to page 20.\"", ["Open", "Opens", "Opened", "Opening"], 0, "הוראה ← פועל בסיס: Open", ROW("👩‍🏫", "📖")),
 Q(IM, "Which sentence is NOT a command?", ["She sits down.", "Sit down, please.", "Open the door.", "Don't run."], 0, "She sits down = תיאור, לא ציווי", ROW("👩‍🏫", "🧒")),
 Q(IM, "Please ___ quiet in the library.", ["be", "are", "is", "being"], 0, "ציווי של to be ← be", ROW("📖", "🤫")),
 Q(IM, "Mom: \"___ your room now, please!\"", ["Clean", "Cleans", "Cleaning", "Cleaned"], 0, "ציווי ← Clean (בסיס)", ROW("🧹", "🛏️")),
 Q(IM, "How do you tell the class \"שבו!\"?", ["Sit down!", "Stand up!", "Sits down!", "Sitting down!"], 0, "sit down = לשבת, stand up = לקום", ROW("👩‍🏫", "🧒", "🧒")),
 Q(IM, "___ left at the bank. The park is there.", ["Turn", "Turns", "Turning", "Turned"], 0, "הוראות דרך ← ציווי: Turn", ROW("🏦", "⬅️")),
 Q(IM, "___ a picture of your family.", ["Draw", "Draws", "Drawing", "Drew"], 0, "הוראה במבחן ← Draw (בסיס)", ROW("🖍️", "👪")),
 Q(IM, "Which of these is a polite command?", ["Please sit down.", "Please sits down.", "Please sat down.", "Please sitting down."], 0, "Please + פועל בסיס ← בקשה מנומסת", ROW("🙏", "🧒")),
]))

C.append(("Commands: Don't run!", [IM], [
 Q(IM, "___ run in the corridor!", ["Don't", "Doesn't", "Not", "No"], 0, "ציווי שלילי ← Don't + פועל", ROW("🏃", "🚫")),
 Q(IM, "Don't ___ in class. Put your hand up.", ["shout", "shouts", "shouting", "shouted"], 0, "אחרי Don't ← פועל בסיס", ROW("📢", "🚫")),
 Q(IM, "The water is deep. ___ swim here!", ["Don't", "Doesn't", "Not", "No"], 0, "אסור לשחות ← Don't swim", ROW("🌊", "🚫")),
 Q(IM, "What does this sign say?", ["Don't smoke.", "Smoke here.", "Don't eat.", "Don't run."], 0, "🚭 = אסור לעשן", "🚭"),
 Q(IM, "Don't ___ the oven! It's hot.", ["touch", "touches", "touching", "touched"], 0, "Don't + פועל בסיס", ROW("🔥", "✋")),
 Q(IM, "Don't ___ late for school!", ["be", "are", "is", "being"], 0, "Don't be = אל תהיה", ROW("⏰", "🏫")),
 Q(IM, "\"אל תשכח!\" = ?", ["Don't forget!", "Not forget!", "You forget!", "Doesn't forget!"], 0, "אל + פועל ← Don't + פועל", "🎒"),
 Q(IM, "It's a library. ___ talk loudly.", ["Don't", "Do", "Please", "Let's"], 0, "בספרייה שומרים על שקט ← Don't", ROW("📖", "🤫")),
 Q(IM, "___ careful! The floor is wet.", ["Be", "Don't", "Is", "Being"], 0, "ציווי של to be ← Be careful", ROW("💧", "⚠️")),
 Q(IM, "Pool rule: ___ near the water – the floor is slippery!", ["Don't run", "Doesn't run", "Not run", "Don't running"], 0, "כלל ← Don't + פועל בסיס", ROW("🏃", "🚫")),
]))

# ───────────── Describing people ─────────────
C.append(("What does he look like?", [DP], [
 Q(DP, "My dad is ___. He is 1.90 meters!", ["tall", "short", "young", "old"], 0, "1.90 מטר ← גבוה = tall", ROW("👨", "📏")),
 Q(DP, "My baby brother is one year old. He is very ___.", ["young", "old", "tall", "strong"], 0, "בן שנה ← young = צעיר", "👶"),
 Q(DP, "Grandpa is eighty. He is ___.", ["old", "young", "new", "little"], 0, "בן שמונים ← old = זקן", "👴"),
 Q(DP, "What color is Dana's hair?", ["blond", "black", "red", "gray"], 0, "blond = שיער בהיר, צהוב", "👱‍♀️"),
 Q(DP, "What color is his hair?", ["red", "blond", "black", "white"], 0, "שיער כתום-אדום = red hair", "👨‍🦰"),
 Q(DP, "Grandpa has no hair. He is ___.", ["bald", "blond", "tall", "young"], 0, "bald = קירח, בלי שיער", "👨‍🦲"),
 Q(DP, "Opposite of tall?", ["short", "old", "thin", "new"], 0, "tall – short = גבוה – נמוך", TXT("tall ↔ ?")),
 Q(DP, "Opposite of old (for a person)?", ["young", "new", "short", "tall"], 0, "אדם: old – young; חפץ: old – new", TXT("old ↔ ?")),
 Q(DP, "He has a ___. Look at his chin!", ["beard", "bag", "bed", "bird"], 0, "beard = זקן (שיער על הפנים)", "🧔"),
 Q(DP, "She can't see well, so she wears ___.", ["glasses", "gloves", "a scarf", "boots"], 0, "glasses = משקפיים, עוזרים לראות", ROW("👩", "👀")),
]))

C.append(("What is she like?", [DP], [
 Q(DP, "My sister always helps people. She is ___.", ["kind", "lazy", "rude", "angry"], 0, "עוזרת לכולם ← kind = טובת לב", ROW("👧", "🤝")),
 Q(DP, "He never does his homework. He is ___.", ["lazy", "clever", "kind", "funny"], 0, "lazy = עצלן", ROW("👦", "📓")),
 Q(DP, "Tom always tells jokes. He is ___.", ["funny", "sad", "shy", "quiet"], 0, "מספר בדיחות ← funny = מצחיק", ROW("👦", "💬")),
 Q(DP, "She doesn't talk to new people. She is ___.", ["shy", "noisy", "funny", "rude"], 0, "shy = ביישן, מתבייש", ROW("👧", "👥")),
 Q(DP, "Which of these words describes hair?", ["curly", "kind", "lazy", "funny"], 0, "curly hair = שיער מתולתל", "💇"),
 Q(DP, "Which word is NOT about how a person looks?", ["kind", "tall", "blond", "thin"], 0, "kind = אופי, לא מראה", ROW("👩", "👨")),
 Q(DP, "\"What does he look like?\" – Which answer fits?", ["He's very tall.", "He's a doctor.", "He likes pizza.", "He's fine, thanks."], 0, "look like = איך הוא נראה", "👨"),
 Q(DP, "\"What is she like?\" – Which answer fits?", ["She's very kind.", "She's twelve.", "She likes cats.", "She's at school."], 0, "What is she like? = מה האופי שלה", "👩"),
 Q(DP, "Opposite of fat?", ["thin", "tall", "short", "young"], 0, "fat – thin = שמן – רזה", TXT("fat ↔ ?")),
 Q(DP, "She has ___. It goes down to her back.", ["long hair", "hair long", "longs hair", "a long hairs"], 0, "תואר לפני שם העצם: long hair", "👩"),
]))

# ───────────── Words: clothes ─────────────
C.append(("Clothes", [CL], [
 Q(CL, "I wear a ___ on my head.", ["hat", "shoe", "sock", "shirt"], 0, "hat = כובע", ROW("👒", "👞", "🧦", "👕")),
 Q(CL, "A ___ is a long, warm jacket for winter.", ["coat", "shorts", "sandals", "T-shirt"], 0, "coat = מעיל, שומר מהקור", "❄️"),
 Q(CL, "You wear ___ on your feet, inside your shoes.", ["socks", "gloves", "hats", "scarves"], 0, "socks = גרביים", ROW("🦶", "👟")),
 Q(CL, "You wear ___ on your hands in winter.", ["gloves", "socks", "boots", "glasses"], 0, "gloves = כפפות", ROW("👐", "❄️")),
 Q(CL, "A ___ is a top and a skirt in one piece.", ["dress", "shirt", "coat", "scarf"], 0, "dress = שמלה", ROW("👗", "👕", "🧥", "🧣")),
 Q(CL, "For work, Dad wears a ___ under his shirt collar.", ["tie", "skirt", "dress", "sock"], 0, "tie = עניבה", ROW("👨", "💼")),
 Q(CL, "In summer I wear ___ (short trousers) and a T-shirt.", ["shorts", "a coat", "gloves", "boots"], 0, "קיץ ← shorts = מכנסיים קצרים", ROW("☀️", "👕")),
 Q(CL, "___ are blue trousers for every day.", ["Jeans", "Shoes", "Socks", "Hats"], 0, "jeans = מכנסי ג'ינס", ROW("👖", "👟", "🧦", "👒")),
 Q(CL, "You wear a ___ around your neck when it's cold.", ["scarf", "belt", "ring", "sock"], 0, "scarf = צעיף", ROW("🧣", "💍", "🧦")),
 Q(CL, "Rain ___ keep my feet dry.", ["boots", "hats", "scarves", "gloves"], 0, "rain boots = מגפי גשם", ROW("🌧️", "🦶")),
]))

C.append(("Wearing clothes", [CL], [
 Q(CL, "Today Noa ___ a red dress.", ["is wearing", "wear", "are wearing", "wearing"], 0, "היום, עכשיו + she ← is wearing", "👗"),
 Q(CL, "It's cold outside. ___ your coat!", ["Put on", "Take off", "Put in", "Take on"], 0, "put on = ללבוש", ROW("❄️", "🧥")),
 Q(CL, "It's hot in here. ___ your sweater.", ["Take off", "Put on", "Wear on", "Take on"], 0, "take off = להוריד בגד", ROW("🥵", "👕")),
 Q(CL, "These shoes are too small. I need a bigger ___.", ["size", "color", "shop", "price"], 0, "size = מידה", "👟"),
 Q(CL, "\"What are you wearing?\" – Which answer fits?", ["A blue T-shirt.", "At home.", "I'm fine.", "Yes, I am."], 0, "wearing = לובש ← עונים בבגד", "👧"),
 Q(CL, "One sock, two ___.", ["socks", "sockes", "sock", "socken"], 0, "רבים ← מוסיפים s", COUNT(("🧦", 2))),
 Q(CL, "My new jeans ___ blue.", ["are", "is", "am", "be"], 0, "jeans תמיד ברבים ← are", "👖"),
 Q(CL, "A ___ keeps my trousers up.", ["belt", "tie", "scarf", "glove"], 0, "belt = חגורה", "👖"),
 Q(CL, "At my school we all wear a ___.", ["uniform", "umbrella", "pocket", "backpack"], 0, "uniform = תלבושת אחידה", ROW("🏫", "👧", "👦")),
 Q(CL, "Which is NOT clothes?", ["umbrella", "shirt", "skirt", "jacket"], 0, "umbrella = מטרייה, לא בגד", ROW("☂️", "👕", "👗", "🧥")),
]))

# ───────────── Telling the time ─────────────
C.append(("What time is it? o'clock · half past", [TM], [
 Q(TM, "What time is it?", ["three o'clock", "nine o'clock", "half past three", "twelve o'clock"], 0, "הקטן על 3, הגדול על 12", "🕒"),
 Q(TM, "What time is it?", ["half past six", "six o'clock", "half past twelve", "twelve o'clock"], 0, "הגדול על 6 = חצי ← half past six", "🕡"),
 Q(TM, "half past = ?", ["וחצי", "ורבע", "רבע ל-", "בדיוק"], 0, "half = חצי ← half past = וחצי", TXT("half past")),
 Q(TM, "o'clock = ?", ["שעה עגולה", "וחצי", "ורבע", "רבע ל-"], 0, "seven o'clock = שבע בדיוק", TXT("7:00")),
 Q(TM, "School starts at 8:00. That's ___.", ["eight o'clock", "half past eight", "eight past", "o'clock eight"], 0, "8:00 ← eight o'clock", "🕗"),
 Q(TM, "What ___ is it? – It's ten o'clock.", ["time", "day", "clock", "watch"], 0, "What time is it? = מה השעה?", "🕙"),
 Q(TM, "The film starts at half past seven. When is that?", ["7:30", "6:30", "7:00", "8:30"], 0, "half past seven = שבע וחצי", "🎬"),
 Q(TM, "It's 12:00. It's ___.", ["twelve o'clock", "two o'clock", "half past twelve", "twelve past"], 0, "12:00 ← twelve o'clock", "🕛"),
]))

C.append(("quarter past · quarter to", [TM], [
 Q(TM, "7:15 = ?", ["quarter past seven", "quarter to seven", "half past seven", "seven fifteen past"], 0, "15 דקות אחרי 7 ← quarter past", TXT("7:15")),
 Q(TM, "7:45 = ?", ["quarter to eight", "quarter past seven", "quarter to seven", "half past eight"], 0, "15 דקות לפני 8 ← quarter to eight", TXT("7:45")),
 Q(TM, "quarter past = ?", ["ורבע", "רבע ל-", "וחצי", "בדיוק"], 0, "quarter = רבע, past = אחרי", TXT("quarter past")),
 Q(TM, "quarter to = ?", ["רבע ל-", "ורבע", "וחצי", "בדיוק"], 0, "to = לפני ← רבע לפני השעה", TXT("quarter to")),
 Q(TM, "It's quarter past three. Which time is it?", ["3:15", "3:45", "2:45", "3:30"], 0, "past = אחרי 3 ← 3:15", TXT("quarter", "past 3")),
 Q(TM, "It's quarter to five. Which time is it?", ["4:45", "5:15", "5:45", "4:15"], 0, "רבע לפני 5 ← 4:45", TXT("quarter", "to 5")),
 Q(TM, "Lunch is at 1:30. That's ___.", ["half past one", "quarter past one", "half past two", "one o'clock"], 0, "1:30 ← half past one", "🍽️"),
 Q(TM, "It's 3:00. What time is it in a quarter of an hour?", ["3:15", "3:45", "3:30", "2:45"], 0, "רבע שעה = 15 דקות ← 3:15", TXT("3:00", "+ ¼ hour")),
 Q(TM, "How many minutes are in half an hour?", ["30", "15", "60", "45"], 0, "חצי מ-60 = 30", "⏳"),
 Q(TM, "My piano lesson is ___ quarter past four.", ["at", "in", "on", "to"], 0, "שעה מדויקת ← at", "🎹"),
 Q(TM, "It's 8:45. It's ___.", ["quarter to nine", "quarter past nine", "quarter to eight", "half past eight"], 0, "8:45 = רבע לפני 9 ← quarter to nine", TXT("8:45")),
 Q(TM, "The bus comes at 5:45. That's ___.", ["quarter to six", "quarter past six", "quarter to five", "half past five"], 0, "5:45 = רבע לפני 6 ← quarter to six", TXT("5:45")),
 Q(TM, "It's 10:45. It's quarter ___ eleven.", ["to", "past", "for", "at"], 0, "רבע לפני 11 ← quarter to", TXT("10:45")),
]))

# ───────────── Writing ─────────────
C.append(("Connectors: and · but · because", [WR], [
 Q(WR, "I like apples ___ bananas.", ["and", "but", "because", "or"], 0, "and = ו… (מוסיף עוד דבר)", ROW("🍎", "🍌")),
 Q(WR, "I like cats, ___ I don't like dogs.", ["but", "because", "or", "so"], 0, "but = אבל (ניגוד)", ROW("🐈", "👍", "🐕", "👎")),
 Q(WR, "I'm hungry ___ I didn't eat breakfast.", ["because", "but", "and", "or"], 0, "because = כי (סיבה)", "🍽️"),
 Q(WR, "She can sing, ___ she can't dance.", ["but", "because", "or", "so"], 0, "can מול can't ← but", ROW("🎤", "💃")),
 Q(WR, "We stayed at home ___ it was raining.", ["because", "but", "and", "or"], 0, "הגשם הוא הסיבה ← because", ROW("🏠", "🌧️")),
 Q(WR, "Tom is tall, ___ he can't reach the top shelf.", ["but", "because", "or", "so"], 0, "גבוה אבל לא מגיע ← but", ROW("👨", "📚")),
 Q(WR, "I have a dog ___ a cat.", ["and", "but", "because", "so"], 0, "and = גם וגם", ROW("🐕", "🐈")),
 Q(WR, "Why are you happy? ___ it's my birthday!", ["Because", "But", "And", "Or"], 0, "Why? ← Because", "🎂"),
 Q(WR, "Which of these fits? The film was long, ___ it was good.", ["but", "because", "or", "so"], 0, "long (חיסרון) מול good ← but", "🎬"),
 Q(WR, "Which word gives a reason?", ["because", "and", "but", "or"], 0, "because = כי, נותן סיבה", TXT("Why?")),
 Q(WR, "I put on my coat ___ it was cold.", ["because", "but", "or", "so"], 0, "הקור הוא הסיבה ← because", ROW("🧥", "❄️")),
]))

C.append(("Sentences and their order", [WR], [
 Q(WR, "Which sentence about Dan is correct?", ["Dan lives here.", "dan lives here.", "Dan lives here", "Dan here lives."], 0, "אות גדולה בשם, ונקודה בסוף", ROW("👦", "🏠")),
 Q(WR, "Which sentence about music is correct?", ["I like music.", "i like music.", "I like music", "I music like."], 0, "I תמיד באות גדולה, ונקודה בסוף", "🎵"),
 Q(WR, "Which word needs a capital letter? \"We visited london.\"", ["london", "visited", "we", "none"], 0, "שם של עיר ← London", ROW("✈️", "🇬🇧")),
 Q(WR, "Put the sentences in the right order.", ["B, A, C", "A, B, C", "C, B, A", "B, C, A"], 0, "לפי השעות: 6, 7, 8", CARD("A. I ate at 7.", "B. I woke at 6.", "C. I left at 8.")),
 Q(WR, "\"My Dog\": which sentence does NOT belong?", ["3", "1", "2", "4"], 0, "משפט 3 לא מדבר על הכלב", CARD("1. I have a dog.", "2. He is brown.", "3. I like math.", "4. He can run.")),
 Q(WR, "Choose the best ending: I was thirsty, so I…", ["drank some water", "ate some bread", "went to sleep", "read a book"], 0, "thirsty = צמא ← שותים", "🥵"),
 Q(WR, "Choose the best ending: It was cold, so I…", ["wore a coat", "ate ice cream", "went swimming", "opened the window"], 0, "קר ← לובשים מעיל", "❄️"),
 Q(WR, "\"I love animals.\" Which of these sentences comes next?", ["I have cats.", "I hate dogs.", "I like math.", "It is Monday."], 0, "ממשיכים לדבר על בעלי חיים", ROW("🐈", "🐕")),
 Q(WR, "Put the email in the right order.", ["B, C, A", "A, B, C", "C, A, B", "A, C, B"], 0, "פותחים בשלום, מסיימים ב-Bye", CARD("A. Bye, Maya.", "B. Hi, Dan!", "C. How are you?")),
 Q(WR, "Which is a full sentence about dogs?", ["Dogs can swim.", "Can swim dogs.", "Swim dogs.", "Dogs swimming."], 0, "נושא + פועל, לפי הסדר", "🐕"),
]))

# ───────────── Reading (four passages) ─────────────
P1 = """
My New School

Hi! My name is Yoav, and I am twelve years old. This year I am in sixth grade at a new school in Ra'anana. My family moved here in the summer.

My new school is very big. There are thirty children in my class, and there is a great library on the second floor. I go to school by bike every morning. Classes start at eight o'clock.

My favorite subject is science, because I love animals and plants. I don't like math very much, but my math teacher, Mr. Levi, is very nice. He always helps me.

I have got a new friend. His name is Eitan. He can play the guitar, and he is teaching me now! After school we often play basketball in the park.

Right now I am writing this email in my room. My little sister is sleeping, so I am very quiet.
"""
C.append(("📖 Reading: My New School", [RD], [
 Q(RD, "How old is Yoav?", ["twelve", "eleven", "ten", "thirteen"], 0, "I am twelve years old", "👦"),
 Q(RD, "When did Yoav's family move?", ["in the summer", "last winter", "last week", "in the spring"], 0, "My family moved here in the summer", "🚚"),
 Q(RD, "On which floor is the library?", ["the second", "the first", "the third", "the top"], 0, "on the second floor = בקומה השנייה", ROW("📖", "🏫")),
 Q(RD, "How does Yoav go to school?", ["by bike", "by bus", "on foot", "by car"], 0, "I go to school by bike", ROW("🚲", "🚌", "🚶", "🚗")),
 Q(RD, "Why does Yoav like science?", ["he loves animals", "it is easy", "Eitan likes it", "Mr. Levi helps"], 0, "because I love animals and plants", "🔬"),
 Q(RD, "Who is Mr. Levi?", ["his math teacher", "his science teacher", "his father", "his friend"], 0, "my math teacher, Mr. Levi", "👨"),
 Q(RD, "What can Eitan do?", ["play the guitar", "play the piano", "speak French", "draw animals"], 0, "He can play the guitar", ROW("🎸", "🎹", "🗣️", "🎨")),
 Q(RD, "What do the boys often do after school?", ["play basketball", "play football", "do homework", "read books"], 0, "we often play basketball in the park", ROW("🏀", "⚽", "📓", "📖")),
 Q(RD, "What is Yoav doing right now?", ["writing an email", "playing basketball", "reading a book", "sleeping"], 0, "Right now I am writing this email", ROW("📧", "🏀", "📖", "😴")),
 Q(RD, "Why is Yoav very quiet?", ["his sister's sleeping", "he is tired", "he is sick", "Mom is working"], 0, "My little sister is sleeping", "🤫"),
], P1))

P2 = """
A Day at the Sea

Last Friday was a hot and sunny day, so Maya and her family went to the beach in Tel Aviv. They got up early and took the train. It wasn't crowded, and the trip was short.

At the beach, Maya and her brother Omer swam in the sea and built a big sandcastle. Dad read a newspaper under an umbrella, and Mom took a lot of photos. At one o'clock they were hungry. They ate sandwiches and watermelon, and they drank cold lemonade.

In the afternoon, Omer lost his blue hat. Everybody looked for it, but they didn't find it. Omer was sad. Then Maya saw something blue in the water. It was the hat! Omer was very happy.

They went home at five o'clock. Maya was tired, but she wasn't sad. "It was the best day of the summer," she said.
"""
C.append(("📖 Reading: A Day at the Sea", [RD], [
 Q(RD, "When did the family go to the beach?", ["last Friday", "last Saturday", "yesterday", "last Sunday"], 0, "Last Friday was a hot and sunny day", "🏖️"),
 Q(RD, "What was the weather like?", ["hot and sunny", "cold and rainy", "cloudy", "windy"], 0, "a hot and sunny day", ROW("☀️", "🌧️", "☁️", "💨")),
 Q(RD, "How did they get to the beach?", ["by train", "by car", "by bus", "on foot"], 0, "They got up early and took the train", ROW("🚆", "🚗", "🚌", "🚶")),
 Q(RD, "What did Maya and Omer build?", ["a sandcastle", "a boat", "a house", "a snowman"], 0, "built a big sandcastle", ROW("👧", "👦", "🏖️")),
 Q(RD, "What did Mom do at the beach?", ["took photos", "read a newspaper", "swam", "slept"], 0, "Mom took a lot of photos", ROW("👩", "🏖️")),
 Q(RD, "What did they drink?", ["lemonade", "water", "orange juice", "milk"], 0, "they drank cold lemonade", ROW("🍋", "💧", "🍊", "🥛")),
 Q(RD, "What did Omer lose?", ["his hat", "his ball", "his shoes", "his bag"], 0, "Omer lost his blue hat", ROW("🧢", "⚽", "👟", "👜")),
 Q(RD, "Who found the hat?", ["Maya", "Omer", "Dad", "Mom"], 0, "Maya saw something blue in the water", ROW("🔍", "🧢")),
 Q(RD, "Where was the hat?", ["in the water", "under the umbrella", "in a bag", "on the train"], 0, "something blue in the water", "🧢"),
 Q(RD, "How did Maya feel at the end?", ["tired but happy", "sad and tired", "angry", "bored"], 0, "tired, but not sad – the best day", ROW("👧", "🌅")),
 Q(RD, "\"It wasn't crowded\" means:", ["היו מעט אנשים", "היה קר מאוד", "היה רועש מאוד", "לא היה מקום"], 0, "crowded = מלא אנשים", "🚆"),
], P2))

P3 = """
Jobs in My Family

Everybody in my family works hard. My mother, Ruth, is a doctor. She works in a big hospital in Jerusalem. She helps sick children, and sometimes she works at night. My father, David, is a cook. He has got a small restaurant near our house. People love his fish and his chocolate cake.

My grandfather was a farmer for forty years. He grew oranges and vegetables. Now he is old, and he doesn't work, but he still has a small garden. Every morning he waters his tomatoes.

My aunt Shira is a pilot. She flies big planes to many countries. She isn't at home very often, but she always sends us photos.

And me? I'm eleven, and I don't know what I want to be. Maybe a vet, because I love animals. Or maybe a cook, like Dad!
"""
C.append(("📖 Reading: Jobs in My Family", [RD], [
 Q(RD, "What is Ruth's job?", ["doctor", "nurse", "cook", "pilot"], 0, "My mother, Ruth, is a doctor", "👩"),
 Q(RD, "Where does Ruth work?", ["in a hospital", "in a restaurant", "in a school", "on a farm"], 0, "She works in a big hospital", ROW("🏥", "🍽️", "🏫", "🚜")),
 Q(RD, "When does Ruth sometimes work?", ["at night", "on Saturdays", "in the morning", "in the summer"], 0, "sometimes she works at night", ROW("🌙", "📅", "🌅", "☀️")),
 Q(RD, "What do people love at David's restaurant?", ["fish and cake", "pizza and pasta", "soup and salad", "meat and rice"], 0, "his fish and his chocolate cake", "🍽️"),
 Q(RD, "What did Grandpa grow?", ["oranges and vegetables", "apples and bananas", "only flowers", "grapes and lemons"], 0, "He grew oranges and vegetables", ROW("👴", "🌱")),
 Q(RD, "What does Grandpa do every morning?", ["waters his tomatoes", "works all day", "cooks breakfast", "drives to work"], 0, "Every morning he waters his tomatoes", ROW("👴", "🌅")),
 Q(RD, "Who is a pilot?", ["Shira", "Ruth", "David", "Grandpa"], 0, "My aunt Shira is a pilot", "✈️"),
 Q(RD, "Why isn't Shira at home very often?", ["she flies planes", "she works nights", "she is sick", "she hates home"], 0, "She flies big planes to many countries", "🏠"),
 Q(RD, "Who doesn't work now?", ["Grandpa", "Shira", "David", "Ruth"], 0, "Now he is old, and he doesn't work", ROW("👴", "👩", "👨", "👩‍✈️")),
 Q(RD, "What does the writer want to be?", ["not sure yet", "a doctor", "a pilot", "a farmer"], 0, "I don't know… maybe a vet or a cook", "🧒"),
 Q(RD, "A vet is a doctor for ___.", ["animals", "children", "teeth", "plants"], 0, "vet = וטרינר, רופא לבעלי חיים", "👨‍⚕️"),
], P3))

P4 = """
The Lost Phone

On Monday, Ben came home from school and looked for his phone. It wasn't in his bag. It wasn't in his pocket. Ben was worried. "Did I leave it on the bus?" he asked his mom.

Ben's mom called the bus company, but they didn't have the phone. Then Ben remembered something. At lunch, he sat in the school garden with his friend Noam. Maybe the phone was there!

The next morning, Ben ran to school early. It rained all night, and the grass was wet. He looked under every bench, but he didn't find anything. Ben was very sad.

In the first lesson, his English teacher, Mrs. Green, smiled at him. "Is this yours, Ben?" she asked. She had his phone! "The school guard found it in the garden yesterday," she said. "He gave it to me."

Ben was so happy. "Thank you!" he said. Now he always checks his bag before he goes home.
"""
C.append(("📖 Reading: The Lost Phone", [RD], [
 Q(RD, "On which day did Ben lose his phone?", ["on Monday", "on Sunday", "on Friday", "on Tuesday"], 0, "On Monday, Ben came home…", "📱"),
 Q(RD, "Where did Ben look first?", ["in his bag", "on the bus", "in the garden", "under a bench"], 0, "It wasn't in his bag", ROW("🎒", "🚌", "🌳")),
 Q(RD, "Ben couldn't find his phone. He was ___.", ["worried", "happy", "bored", "excited"], 0, "Ben was worried = מודאג", ROW("👦", "📱")),
 Q(RD, "Who called the bus company?", ["Ben's mom", "Ben", "Noam", "Mrs. Green"], 0, "Ben's mom called the bus company", "📞"),
 Q(RD, "Where did Ben eat lunch on Monday?", ["in the garden", "in the classroom", "on the bus", "at home"], 0, "he sat in the school garden", ROW("🌳", "🏫", "🚌", "🏠")),
 Q(RD, "What was the weather like that night?", ["rainy", "sunny", "snowy", "hot"], 0, "It rained all night", ROW("🌧️", "☀️", "❄️")),
 Q(RD, "Did Ben find the phone in the garden?", ["No, he didn't.", "Yes, he did.", "No, he wasn't.", "Yes, he was."], 0, "he didn't find anything", ROW("🌳", "🔍")),
 Q(RD, "Who found the phone?", ["the school guard", "Mrs. Green", "Noam", "Ben's mom"], 0, "The school guard found it", ROW("📱", "🌳")),
 Q(RD, "Who gave the phone back to Ben?", ["Mrs. Green", "the guard", "Noam", "his mom"], 0, "his teacher, Mrs. Green, had his phone", ROW("👦", "📱")),
 Q(RD, "What does Ben always do now?", ["checks his bag", "takes the bus", "calls his mom", "sits outside"], 0, "Now he always checks his bag", ROW("👦", "🏠")),
 Q(RD, "You sit on a ___ in the garden.", ["bench", "pocket", "phone", "lesson"], 0, "bench = ספסל", ROW("🌳", "🌷")),
], P4))

# ───────────── Review ─────────────
C.append(("חזרה כללית", [PG, CT, PL, PN, PR, QW, PW, PI, PD, VP, VS, VW, WR], [
 Q(PG, "Shh! Grandpa ___ in the living room.", ["is sleeping", "sleeps", "sleep", "are sleeping"], 0, "Shh! = עכשיו ← is sleeping", ROW("👴", "😴")),
 Q(PG, "She usually ___ the bus, but today she's walking.", ["takes", "is taking", "take", "taking"], 0, "usually ← הרגל: takes", ROW("🚌", "🚶‍♀️")),
 Q(CT, "My cousins ___ got a big dog.", ["have", "has", "are", "is"], 0, "cousins = רבים ← have got", "🐕"),
 Q(CT, "There ___ two bananas in my bag.", ["are", "is", "am", "has"], 0, "שתיים = רבים ← There are", COUNT(("🍌", 2))),
 Q(PL, "one knife, two ___", ["knives", "knifes", "knive", "knifies"], 0, "fe ← ves: knife – knives", COUNT(("🔪", 2))),
 Q(PN, "Dad bought ___ a present. We love it!", ["us", "we", "our", "ours"], 0, "אחרי bought, אנחנו ← us", "🎁"),
 Q(PR, "Our English lesson ends ___ ten o'clock.", ["at", "in", "on", "to"], 0, "שעה ← at", "🕙"),
 Q(QW, "___ do you play tennis? Twice a week.", ["How often", "How many", "What", "Where"], 0, "כמה פעמים ← How often", "🎾"),
 Q(PW, "Last week's test ___ easy.", ["was", "were", "is", "did"], 0, "test = it, עבר ← was", ROW("📝", "😊")),
 Q(PW, "Past of \"carry\"?", ["carried", "carryed", "caried", "carries"], 0, "y אחרי עיצור ← ied", TXT("carry → ?")),
 Q(PI, "Last summer we ___ to London.", ["flew", "flied", "fly", "flyed"], 0, "fly ← flew", "✈️"),
 Q(PI, "Yesterday I ___ my friend at the mall.", ["met", "meeted", "meet", "meets"], 0, "meet ← met", ROW("👫", "🛍️")),
 Q(PD, "___ Dana call you yesterday?", ["Did", "Does", "Was", "Is"], 0, "yesterday + call ← Did", ROW("👧", "📞")),
 Q(PD, "I didn't ___ TV last night.", ["watch", "watched", "watches", "watching"], 0, "אחרי didn't ← צורת בסיס", "📺"),
 Q(VP, "My aunt's daughter is my ___.", ["cousin", "sister", "aunt", "niece"], 0, "בת של דודה = בת דודה = cousin", TXT("aunt's daughter")),
 Q(VS, "You play ___ with a small ball on a table.", ["table tennis", "basketball", "football", "swimming"], 0, "table tennis = טניס שולחן", ROW("🏓", "🏀", "⚽", "🏊")),
 Q(VW, "My best friend moved away. I'm ___.", ["sad", "proud", "excited", "bored"], 0, "sad = עצוב", ROW("🚚", "👋")),
 Q(VW, "Let's go to the beach! It's ___ and hot.", ["sunny", "snowy", "rainy", "freezing"], 0, "hot + beach ← sunny", "🏖️"),
 Q(WR, "I went to bed early ___ I was tired.", ["because", "but", "or", "so"], 0, "עייפות היא הסיבה ← because", ROW("🛏️", "😴")),
 Q(WR, "Which sentence is correct?", ["Noa can swim.", "noa can swim.", "Noa can swim", "Noa swim can."], 0, "אות גדולה בשם, ונקודה בסוף", ROW("👧", "🏊")),
]))

# station type on the map
KINDS = {c[0]: "gram" for c in C if c[1][0] in (PG, CT, PL, PN, PR, QW, PW, PI, PD, WR, TH, IM, TM)}
KINDS.update({c[0]: "word" for c in C if c[1][0] in (VP, VS, VW, DP, CL)})
KINDS.update({c[0]: "read" for c in C if c[1][0] == RD})
KINDS["חזרה כללית"] = "rev"

# Band I words taught in this set – every one is a correct answer somewhere (build_set.py checks).
WORD_LIST = """grandmother|grandfather|uncle|aunt|cousin|father|mother|daughter|husband|
brush|take|homework|get|dressed|go|cook|wash|have|breakfast|walk|
doctor|pilot|teacher|farmer|firefighter|dentist|waiter|driver|police officer|
math|art|music|geography|science|history|PE|timetable|break|
football|tennis|basketball|swimming|skiing|cycling|play|win|team|
carrot|grapes|milk|eggs|soup|dinner|sweet|sour|water|lunch|
library|hospital|museum|airport|market|beach|station|cinema|bakery|neighborhood|
rainy|sunny|cloudy|windy|hot|freezing|cold|snow|storm|rainbow|
worried|hungry|happy|bored|angry|scared|tired|excited|sad|proud|
hat|coat|socks|gloves|dress|tie|jeans|scarf|boots|uniform|
tall|young|bald|beard|glasses|kind|lazy|funny|shy|thin""".replace("\n", "").split("|")
