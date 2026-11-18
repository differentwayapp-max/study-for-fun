# Practice set: English, grade 7 (כיתה ז') – the whole year, Band II level (Israeli curriculum):
# Past Simple (regular, irregular, negatives, questions), Past Progressive with when / while,
# the future (will / going to), comparatives and superlatives, as … as, adverbs (quickly / well), too / enough, modals (can, could, must, should, have to),
# quantifiers, connectors, Band II vocabulary (feelings & jobs, travel & technology, the environment)
# and four reading passages (Unseen).
# Present Simple, weather and nature words are in the separate set en7_nov26 and are not repeated here.
# Organised by fine topics (≈20 questions each) so a parent can tick only what the test covers.
# Run: python3 -I tools/build_set.py tools/sets/en7.py
import re

PR, PI, PN = "Past Simple: regular verbs", "Past Simple: irregular verbs", "Past Simple: negatives & questions"
PP, FU, CS = "Past Progressive · when / while", "Future: will / going to", "Comparatives & superlatives"
MD, QT, CN = "Modals: can · must · should · have to", "Quantifiers: much · many · some · any", "Connectors"
VF, VT, VE = "Words: feelings & jobs", "Words: travel & technology", "Words: the environment"
UN = "Unseen"
AA, AV, TE = "as … as · not as … as", "Adverbs: quickly · well", "too · enough"

SET = dict(name="English ז' – full year", grade=6, subject="אנגלית",
           title="Past · Future · Comparing · Adverbs · Modals · Band II words · Unseen",
           desc="אנגלית לכיתה ז' – כל השנה: Past Simple ו-Past Progressive, will ו-going to, השוואות, as … as, תארי פועל, too ו-enough, פעלים מודאליים, כמתים, מילות קישור, אוצר מילים Band II וארבעה קטעי Unseen",
           desc_en="Grade 7 English, the whole year: Past Simple and Past Progressive, will and going to, comparatives and superlatives, as … as, adverbs, too and enough, modals, quantifiers, connectors, Band II words and four Unseen passages",
           tags=["Past Simple", "Past Progressive", "will / going to", "Comparatives", "as … as", "Adverbs", "too / enough", "Modals", "Quantifiers",
                 "Connectors", "Band II words", "Unseen"],
           examDate="", dailyGoal=2, perRound=10,
           topics=[PR, PI, PN, PP, FU, CS, AA, AV, TE, MD, QT, CN, VF, VT, VE, UN])
MAX_Q_WORDS = 12


def W(s): return re.sub(r"\{([^}]*)\}", lambda m: "⁦" + m.group(1) + "⁩", s)
def Q(t, q, opts, ans, expl, sc): return (t, W(q), opts, ans, W(expl), sc)

def ROW(*es):
    """The things the question talks about, side by side."""
    n = len(es); s = min(40, 125 / n); step = min(92 / n, s / 1.6 * 1.35)
    return [(e, round(50 + (j - (n - 1) / 2) * step, 1), 52, round(s)) for j, e in enumerate(es)]

def PW(e, w):
    """The object on the left, the given word / number on a card on the right."""
    return [(e, 24, 52, 38), (w, 66, 52, round(min(24, 120 / len(w))))]


C = []

# ───────────── Past Simple: regular verbs ─────────────
C.append(("Past Simple: -ed", [PR], [
 Q(PR, "Yesterday I ___ my room.", ["cleaned", "clean", "cleans", "cleaning"], 0, "yesterday ← עבר: cleaned", ROW("🧹", "🛏️")),
 Q(PR, "She ___ the bus, so she walked home.", ["missed", "miss", "misses", "missing"], 0, "she walked ← עבר: missed (פספסה)", ROW("👧", "🚌")),
 Q(PR, "We ___ football yesterday.", ["played", "play", "plays", "playing"], 0, "yesterday ← played", ROW("⚽", "👫")),
 Q(PR, "Past of prefer?", ["preferred", "prefered", "preferd", "prefers"], 0, "הטעמה בסוף + עיצור ← מכפילים: preferred", PW("👍", "prefer → ?")),
 Q(PR, "Past of reply?", ["replied", "replyed", "replies", "replid"], 0, "y אחרי עיצור ← ied", PW("💬", "reply → ?")),
 Q(PR, "Past of destroy?", ["destroyed", "destroied", "destroid", "destroys"], 0, "y אחרי תנועה ← רק ed", PW("💥", "destroy → ?")),
 Q(PR, "Past of decide?", ["decided", "decideed", "decidded", "deciding"], 0, "נגמר ב-e ← מוסיפים רק d", PW("🤔", "decide → ?")),
 Q(PR, "Last summer they ___ at a hotel in Eilat.", ["stayed", "stay", "stays", "staying"], 0, "last summer ← עבר: stayed", ROW("🏨", "🏖️")),
 Q(PR, "He ___ his grandma at her house two days ago.", ["visited", "visit", "visits", "visiting"], 0, "ago = לפני ← עבר", ROW("👦", "👵")),
 Q(PR, "The little girl ___ when she fell off her bike.", ["cried", "cryed", "cries", "crying"], 0, "y אחרי עיצור ← ied", ROW("👧", "🚲")),
]))

C.append(("Past Simple: time words & spelling", [PR], [
 Q(PR, "Which day is in the past?", ["yesterday", "tomorrow", "now", "every day"], 0, "yesterday = אתמול ← עבר", ROW("📅", "⬅️")),
 Q(PR, "Which week is in the past?", ["last week", "next week", "every week", "tomorrow"], 0, "last week = בשבוע שעבר", ROW("📅", "⬅️")),
 Q(PR, "I ___ TV last night.", ["watched", "watch", "watches", "watching"], 0, "last night ← watched", ROW("📺", "🌙")),
 Q(PR, "Which is NOT a past verb?", ["walks", "walked", "opened", "laughed"], 0, "walks = הווה; השאר עבר", ROW("🚶", "🚪", "😂")),
 Q(PR, "Past of plan?", ["planned", "planed", "planing", "plans"], 0, "תנועה קצרה + n ← מכפילים: planned", PW("🗓️", "plan → ?")),
 Q(PR, "Past of worry?", ["worried", "worryed", "worries", "woried"], 0, "y אחרי עיצור ← ied", PW("😟", "worry → ?")),
 Q(PR, "Past of enjoy?", ["enjoyed", "enjoied", "enjoys", "enjoid"], 0, "y אחרי תנועה ← רק ed", PW("😊", "enjoy → ?")),
 Q(PR, "My dad ___ dinner on the stove an hour ago.", ["cooked", "cook", "cooks", "cooking"], 0, "an hour ago ← עבר: cooked", ROW("👨‍🍳", "🍲")),
 Q(PR, "In 2020 we ___ to a new city.", ["moved", "move", "moves", "moving"], 0, "2020 כבר עבר ← moved", PW("🚚", "2020")),
 Q(PR, "Ron ___ the door and went in.", ["opened", "opens", "open", "opening"], 0, "went בעבר ← גם opened בעבר", ROW("🚪", "🚶")),
]))

# ───────────── Past Simple: irregular verbs ─────────────
C.append(("Irregular verbs: go – went", [PI], [
 Q(PI, "Past of go?", ["went", "goed", "gone", "goes"], 0, "go – went (פועל לא רגיל)", PW("🚶", "go → ?")),
 Q(PI, "Past of eat?", ["ate", "eated", "eaten", "eats"], 0, "eat – ate", PW("🍔", "eat → ?")),
 Q(PI, "Past of see?", ["saw", "seed", "seen", "sees"], 0, "see – saw", PW("👀", "see → ?")),
 Q(PI, "Past of buy?", ["bought", "buyed", "brought", "buys"], 0, "buy – bought (brought = הביא)", PW("🛒", "buy → ?")),
 Q(PI, "Past of choose?", ["chose", "choosed", "chosen", "chooses"], 0, "choose – chose", PW("👉", "choose → ?")),
 Q(PI, "Past of understand?", ["understood", "understanded", "understands", "understand"], 0, "understand – understood", PW("💡", "understand → ?")),
 Q(PI, "Past of forget?", ["forgot", "forgetted", "forgets", "forgeted"], 0, "forget – forgot", PW("🤷", "forget → ?")),
 Q(PI, "Past of think?", ["thought", "thinked", "taught", "thinks"], 0, "think – thought (taught = לימד)", PW("💭", "think → ?")),
 Q(PI, "Past of have?", ["had", "haved", "has", "having"], 0, "have – had", PW("🎁", "have → ?")),
 Q(PI, "Past of make?", ["made", "maked", "makes", "making"], 0, "make – made", PW("🎂", "make → ?")),
]))

C.append(("Irregular verbs in sentences", [PI], [
 Q(PI, "Yesterday we ___ to the beach by bus.", ["went", "go", "goes", "gone"], 0, "yesterday ← went", ROW("🏖️", "🌊")),
 Q(PI, "She ___ a letter last week.", ["wrote", "writes", "write", "written"], 0, "last week ← wrote", ROW("👧", "✉️")),
 Q(PI, "I ___ a strange dream last night.", ["had", "have", "has", "haved"], 0, "last night ← had", ROW("😴", "💭")),
 Q(PI, "They ___ all the pizza – the box is empty!", ["ate", "eat", "eats", "eated"], 0, "the box is empty ← עבר: ate", ROW("🍕", "🍽️")),
 Q(PI, "He paid 900 ₪ and ___ a new phone.", ["bought", "buys", "buy", "buyed"], 0, "paid ← עבר: bought", ROW("👦", "📱")),
 Q(PI, "Last Friday we ___ a lion at the zoo.", ["saw", "see", "sees", "seen"], 0, "last Friday ← saw", ROW("🦁", "🎟️")),
 Q(PI, "Past of break?", ["broke", "breaked", "broken", "breaks"], 0, "break – broke", PW("🥚", "break → ?")),
 Q(PI, "Past of swim?", ["swam", "swimmed", "swum", "swims"], 0, "swim – swam", PW("🏊", "swim → ?")),
 Q(PI, "Past of tell?", ["told", "telled", "tells", "taled"], 0, "tell – told", PW("🗣️", "tell → ?")),
 Q(PI, "Which base verb is irregular?", ["sleep", "walk", "play", "open"], 0, "sleep – slept, בלי ed", ROW("😴", "🚶", "⚽", "🚪")),
 Q(PI, "Last year my sister ___ a prize.", ["won", "winned", "wins", "win"], 0, "win – won", ROW("👧", "🏆")),
]))

# ───────────── Past Simple: negatives & questions ─────────────
C.append(("Past Simple: didn't · wasn't · weren't", [PN], [
 Q(PN, "I was sick, so I ___ go to school on Monday.", ["didn't", "don't", "wasn't", "doesn't"], 0, "עבר + פועל ← didn't", ROW("🤒", "🏫")),
 Q(PN, "She didn't ___ her homework, so the teacher was angry.", ["do", "did", "does", "doing"], 0, "אחרי didn't ← צורת בסיס", ROW("👧", "📓")),
 Q(PN, "We ran, but we didn't ___ the bus.", ["catch", "caught", "catches", "catching"], 0, "אחרי didn't ← צורת בסיס", ROW("🏃", "🚌")),
 Q(PN, "Which is correct?", ["He didn't swim", "He didn't swam", "He not swam", "He don't swam"], 0, "didn't + צורת בסיס", ROW("🏊", "❌")),
 Q(PN, "They ___ like the film last night.", ["didn't", "don't", "doesn't", "weren't"], 0, "last night ← didn't", ROW("🎬", "👎")),
 Q(PN, "She taught us. → She didn't ___ us.", ["teach", "taught", "thought", "teaches"], 0, "didn't + teach (לא taught)", ROW("👩‍🏫", "👫")),
 Q(PN, "He ___ eat breakfast this morning.", ["didn't", "doesn't", "don't", "wasn't"], 0, "הבוקר כבר עבר ← didn't", ROW("🥣", "❌")),
 Q(PN, "We ___ at home yesterday.", ["weren't", "wasn't", "didn't", "aren't"], 0, "we ← weren't", ROW("🏠", "❌")),
 Q(PN, "It ___ cold yesterday. It was hot.", ["wasn't", "weren't", "didn't", "isn't"], 0, "it ← wasn't", ROW("☀️", "🌡️")),
 Q(PN, "I ___ very tired last night, so I slept early.", ["was", "were", "did", "am"], 0, "I ← was", ROW("😴", "🌙")),
]))

C.append(("Past Simple: questions", [PN], [
 Q(PN, "___ you and your friends enjoy the trip yesterday?", ["Did", "Do", "Does", "Were"], 0, "שאלה בעבר + פועל ← Did", ROW("🚌", "👫")),
 Q(PN, "Did she ___ the cake?", ["make", "made", "makes", "making"], 0, "אחרי Did ← צורת בסיס", ROW("👧", "🎂")),
 Q(PN, "How long ___ your family stay in Eilat last summer?", ["did", "were", "was", "does"], 0, "last summer + stay ← did", ROW("🏨", "🏖️")),
 Q(PN, "What did he ___ to you?", ["say", "said", "says", "saying"], 0, "אחרי did ← צורת בסיס", ROW("👦", "💬")),
 Q(PN, "___ they at the party?", ["Were", "Did", "Was", "Does"], 0, "they ← Were", ROW("🎉", "👫")),
 Q(PN, "___ your brother at school yesterday?", ["Was", "Were", "Did", "Does"], 0, "brother = he ← Was", ROW("👦", "🏫")),
 Q(PN, "Why ___ you leave early yesterday?", ["did", "were", "was", "does"], 0, "yesterday + פועל leave ← did", ROW("🚪", "🕓")),
 Q(PN, "___ it rain yesterday? – Yes, it rained.", ["Did", "Was", "Does", "Is"], 0, "שאלה בעבר ← Did", ROW("🌧️", "☔")),
 Q(PN, "When ___ the film start last night?", ["did", "does", "was", "do"], 0, "last night ← did", ROW("🎬", "🕗")),
 Q(PN, "Which question is correct?", ["Did you swim?", "Did you swam?", "Do you swam?", "Was you swim?"], 0, "Did + צורת בסיס", ROW("🏊", "❓")),
 Q(PN, "Who ___ the window with a ball? – Tom did.", ["broke", "did broke", "break", "breaked"], 0, "שאלה על מי שעשה ← בלי did", ROW("⚽", "💥")),
]))

# ───────────── Past Progressive ─────────────
C.append(("Past Progressive: was / were + -ing", [PP], [
 Q(PP, "At 8 pm yesterday, I ___ TV.", ["was watching", "were watching", "am watching", "watching"], 0, "I ← was + ing", ROW("📺", "🕗")),
 Q(PP, "They ___ football at 5 o'clock yesterday.", ["were playing", "was playing", "are playing", "play"], 0, "they ← were + ing", ROW("⚽", "🕔")),
 Q(PP, "She was ___ a letter.", ["writing", "write", "wrote", "writes"], 0, "was + פועל עם ing", ROW("👧", "✉️")),
 Q(PP, "What ___ you doing at noon yesterday?", ["were", "was", "did", "are"], 0, "you ← were", ROW("🕛", "❓")),
 Q(PP, "The dog ___ sleeping, so we were quiet.", ["was", "were", "did", "does"], 0, "dog = it ← was", ROW("🐕", "🛋️")),
 Q(PP, "We ___ not listening to the teacher.", ["were", "was", "did", "does"], 0, "we ← were", ROW("👫", "🙉")),
 Q(PP, "It ___ raining all morning, so we stayed inside.", ["was", "were", "did", "does"], 0, "it ← was + ing", ROW("🌧️", "☔")),
 Q(PP, "Which is correct?", ["I was cooking", "I were cooking", "I was cook", "I cooking was"], 0, "I + was + פועל עם ing", ROW("🍳", "👩")),
 Q(PP, "Past Progressive מתאר…", ["פעולה שנמשכה בעבר", "פעולה בעתיד", "הרגל קבוע", "בקשה מנומסת"], 0, "was/were + ing = באמצע פעולה בעבר", TXT("was + ing")),
 Q(PP, "Were you sleeping? No, I ___.", ["wasn't", "weren't", "didn't", "don't"], 0, "I ← wasn't", ROW("😴", "❌")),
]))

C.append(("When or while?", [PP], [
 Q(PP, "I was walking home. Suddenly it ___ to rain.", ["started", "starts", "start", "starting"], 0, "פעולה קצרה באמצע ← Past Simple", ROW("🚶", "🌧️")),
 Q(PP, "___ I was cooking, the phone rang.", ["While", "During", "So", "Because"], 0, "while + פעולה ארוכה (was + ing)", ROW("🍳", "📞")),
 Q(PP, "She was reading when the lights ___ out.", ["went", "were going", "go", "goes"], 0, "when + פעולה קצרה ← Past Simple", ROW("📖", "💡")),
 Q(PP, "While we ___ dinner, Dad came home.", ["were eating", "was eating", "are eating", "eats"], 0, "while + we ← were + ing", ROW("🍽️", "👨")),
 Q(PP, "He fell while he ___ to the bus.", ["was running", "were running", "runs", "is running"], 0, "while + he ← was + ing", ROW("🏃", "🤕")),
 Q(PP, "When the teacher came in, the kids ___ to each other.", ["were talking", "was talking", "talk", "are talking"], 0, "kids = רבים ← were + ing", ROW("👩‍🏫", "💬")),
 Q(PP, "I ___ a shower when you called.", ["was having", "were having", "have", "am having"], 0, "I ← was + ing", ROW("🚿", "📞")),
 Q(PP, "The cat ___ in its bed when I opened the door.", ["was sleeping", "were sleeping", "sleeps", "is sleeping"], 0, "cat = it ← was + ing", ROW("🐈", "🚪")),
 Q(PP, "While Noa was swimming, she ___ a fish.", ["saw", "was see", "sees", "see"], 0, "פעולה קצרה בעבר ← saw", ROW("🏊‍♀️", "🐟")),
 Q(PP, "What were they doing? They ___ a game.", ["were playing", "was playing", "are playing", "play"], 0, "they ← were + ing", ROW("🎲", "👫")),
]))

# ───────────── Future ─────────────
C.append(("Future: will · won't", [FU], [
 Q(FU, "Take an umbrella. I think it ___ rain tomorrow.", ["will", "is", "was", "did"], 0, "I think + עתיד ← will", ROW("🌧️", "📅")),
 Q(FU, "She will ___ you later.", ["call", "calls", "called", "calling"], 0, "אחרי will ← צורת בסיס", ROW("👧", "📞")),
 Q(FU, "They said yes! They ___ come to the party.", ["will", "are", "did", "was"], 0, "הם הסכימו + עתיד ← will", ROW("🎉", "👍")),
 Q(FU, "I'm thirsty. – I ___ get you some water.", ["will", "am", "did", "was"], 0, "החלטה ברגע הדיבור ← will", ROW("🥵", "💧")),
 Q(FU, "will not = ?", ["won't", "wasn't", "weren't", "don't"], 0, "will not = won't", TXT("will not")),
 Q(FU, "In 2050 people ___ live on Mars, and I'll visit them!", ["will", "did", "were", "was"], 0, "תחזית לעתיד ← will", PW("🚀", "2050")),
 Q(FU, "Can you come tomorrow? – Sure, I ___ be there.", ["will", "did", "was", "am"], 0, "tomorrow ← will + be", ROW("📅", "👍")),
 Q(FU, "Which is correct?", ["He will swim", "He will swims", "He wills swim", "He will swimming"], 0, "will + צורת בסיס", ROW("🏊", "📅")),
 Q(FU, "The phone is ringing. – I ___ answer it! Hello?", ["will", "am", "did", "was"], 0, "החלטה ברגע הדיבור ← will", ROW("📞", "🔔")),
 Q(FU, "Don't worry, I ___ tell anyone.", ["won't", "wasn't", "weren't", "isn't"], 0, "won't = לא + עתיד", ROW("🤫", "🔒")),
]))

C.append(("Future: going to", [FU], [
 Q(FU, "Look at the clouds! It ___ to rain.", ["is going", "are going", "will", "going"], 0, "רואים סימן עכשיו ← is going to", ROW("☁️", "🌧️")),
 Q(FU, "We ___ going to visit Paris next week.", ["are", "is", "am", "will"], 0, "we ← are going to", ROW("✈️", "🗼")),
 Q(FU, "I'm going to ___ a cake for Mom.", ["bake", "bakes", "baked", "baking"], 0, "going to + צורת בסיס", ROW("🎂", "👩")),
 Q(FU, "He ___ going to play football.", ["is", "are", "am", "will"], 0, "he ← is going to", ROW("👦", "⚽")),
 Q(FU, "I bought tickets. I ___ see the show.", ["am going to", "will to", "am go to", "going to"], 0, "תוכנית שכבר החלטנו ← going to", ROW("🎟️", "🎭")),
 Q(FU, "Are you going to swim?", ["No, I'm not.", "No, I don't.", "No, I amn't.", "No, I isn't."], 0, "Are you…? ← No, I'm not", ROW("🏊", "❓")),
 Q(FU, "What ___ you going to do tomorrow?", ["are", "is", "will", "do"], 0, "you ← are going to", ROW("📅", "❓")),
 Q(FU, "Which sentence is about the future?", ["I will fly", "I flew", "I was flying", "I didn't fly"], 0, "will = עתיד", ROW("✈️", "📅")),
 Q(FU, "Look! He ___ fall!", ["is going to", "will to", "going to", "is will"], 0, "רואים שזה עומד לקרות ← is going to", ROW("🧗", "⚠️")),
 Q(FU, "They ___ going to sell their old car.", ["are", "is", "am", "will"], 0, "they ← are going to", ROW("🚗", "💵")),
]))

# ───────────── Comparatives & superlatives ─────────────
C.append(("Comparatives: bigger than", [CS], [
 Q(CS, "A cat is ___ (big) than a mouse.", ["bigger", "biger", "more big", "biggest"], 0, "big ← bigger (מכפילים g)", ROW("🐈", "🐁")),
 Q(CS, "An elephant is ___ (heavy) than a dog.", ["heavier", "heavyer", "more heavy", "heaviest"], 0, "heavy ← heavier (y ← ier)", ROW("🐘", "🐕")),
 Q(CS, "This book is ___ (interesting) than that one.", ["more interesting", "interestinger", "most interesting", "interesting"], 0, "מילה ארוכה ← more", ROW("📕", "📘")),
 Q(CS, "Comparative of good?", ["better", "gooder", "best", "more good"], 0, "good – better – best", PW("👍", "good → ?")),
 Q(CS, "Comparative of bad?", ["worse", "badder", "worst", "more bad"], 0, "bad – worse – worst", PW("👎", "bad → ?")),
 Q(CS, "Winter is ___ (cold) than summer.", ["colder", "more cold", "coldest", "cold"], 0, "cold ← colder", ROW("❄️", "☀️")),
 Q(CS, "A plane is ___ (fast) than a car.", ["faster", "more fast", "fastest", "fast"], 0, "fast ← faster", ROW("✈️", "🚗")),
 Q(CS, "Comparative of happy?", ["happier", "happyer", "happiest", "more happyer"], 0, "y אחרי עיצור ← ier", PW("😊", "happy → ?")),
 Q(CS, "Gold is ___ (expensive) than silver.", ["more expensive", "expensiver", "most expensive", "expensive"], 0, "מילה ארוכה ← more expensive", ROW("🥇", "🥈")),
 Q(CS, "My room is bigger ___ yours.", ["than", "then", "that", "from"], 0, "משווים ← than", ROW("🛏️", "🏠")),
]))

C.append(("Superlatives: the biggest", [CS], [
 Q(CS, "Everest is the ___ (high) mountain in the world.", ["highest", "higher", "most high", "high"], 0, "the + est = הכי", ROW("🏔️", "🌍")),
 Q(CS, "The cheetah is the ___ (fast) animal on land.", ["fastest", "faster", "most fast", "fast"], 0, "the fastest = הכי מהיר", ROW("🐆", "💨")),
 Q(CS, "Superlative of good?", ["best", "better", "goodest", "most good"], 0, "good – better – best", PW("👍", "good → ?")),
 Q(CS, "This is the ___ (bad) film of the year.", ["worst", "worse", "baddest", "most bad"], 0, "bad – worse – worst", ROW("🎬", "👎")),
 Q(CS, "Dana is the ___ (tall) girl in the class.", ["tallest", "taller", "most tall", "tall"], 0, "the + tallest", ROW("👧", "📏")),
 Q(CS, "Paris is the ___ beautiful city.", ["most", "more", "much", "best"], 0, "מילה ארוכה ← the most", ROW("🗼", "🌆")),
 Q(CS, "Superlative of big?", ["biggest", "bigest", "most big", "bigger"], 0, "מכפילים g ← biggest", PW("🐘", "big → ?")),
 Q(CS, "Superlative of funny?", ["funniest", "funnyest", "most funny", "funnier"], 0, "y אחרי עיצור ← iest", PW("😂", "funny → ?")),
 Q(CS, "Which is correct?", ["the most difficult", "the difficultest", "the more difficult", "most difficultest"], 0, "מילה ארוכה ← the most", ROW("🧩", "🤯")),
 Q(CS, "The Dead Sea is the ___ (low) place on Earth.", ["lowest", "lower", "most low", "low"], 0, "the lowest = הכי נמוך", ROW("🌊", "⬇️")),
]))

# ───────────── as … as · not as … as ─────────────
C.append(("as … as: the same", [AA], [
 Q(AA, "Dan is 12. Tom is 12 too. Dan is ___ Tom.", ["as old as", "older than", "the oldest", "as old than"], 0, "אותו גיל ← as old as", ROW("👦", "👦")),
 Q(AA, "Both bags weigh 5 kg. My bag is ___ yours.", ["as heavy as", "heavier than", "as heavy than", "the heaviest"], 0, "אותו משקל ← as heavy as", ROW("🎒", "🎒")),
 Q(AA, "A dog isn't as ___ as a horse.", ["big", "bigger", "biggest", "small"], 0, "כלב קטן מסוס ← not as big as", ROW("🐕", "🐎")),
 Q(AA, "Which is correct with tall?", ["as tall as", "as taller as", "as tall than", "so tall than"], 0, "as + תואר רגיל + as", ROW("👧", "👧")),
 Q(AA, "An elephant isn't as ___ as a cat.", ["light", "lighter", "lightest", "heavy"], 0, "פיל כבד מחתול ← not as light as", ROW("🐘", "🐈")),
 Q(AA, "This test was as ___ as last week's test.", ["easy", "easier", "easiest", "easily"], 0, "בין as ל-as ← תואר רגיל", ROW("📝", "📝")),
 Q(AA, "\"as fast as\" means:", ["מהיר באותה מידה", "מהיר יותר", "הכי מהיר", "פחות מהיר"], 0, "as … as = באותה מידה", TXT("as fast as")),
 Q(AA, "\"not as cold as\" means:", ["פחות קר", "קר יותר", "הכי קר", "קר באותה מידה"], 0, "not as … as = פחות … מ-", TXT("not as cold as")),
 Q(AA, "A bike isn't as fast as a car. The car is ___.", ["faster", "slower", "as slow", "the slowest"], 0, "האופניים איטיים יותר ← המכונית faster", ROW("🚲", "🚗")),
 Q(AA, "Haifa isn't as hot as Eilat. Eilat is ___.", ["hotter", "colder", "as cold", "the coldest"], 0, "חיפה פחות חמה ← אילת hotter", ROW("🏙️", "🏙️")),
]))

C.append(("not as … as: comparing", [AA], [
 Q(AA, "Noa and Mom are both 1.65 m. Noa is ___ Mom.", ["as tall as", "taller than", "the tallest", "as tall than"], 0, "אותו גובה ← as tall as", ROW("👧", "👩")),
 Q(AA, "Silver isn't as ___ as gold. Gold costs more.", ["expensive", "cheap", "more expensive", "expensiver"], 0, "כסף זול מזהב ← not as expensive", ROW("🥈", "🥇")),
 Q(AA, "Both drinks are 70°C. Tea is ___ coffee.", ["as hot as", "hotter than", "the hottest", "as hot than"], 0, "אותה טמפרטורה ← as hot as", ROW("🍵", "☕")),
 Q(AA, "Ben: 1.60 m. Dan: 1.50 m. Dan isn't as ___ as Ben.", ["tall", "short", "taller", "shorter"], 0, "דן נמוך יותר ← not as tall", ROW("👦", "🧒")),
 Q(AA, "My phone is as ___ as yours. Both cost 1,000 ₪.", ["expensive", "cheaper", "more expensive", "most expensive"], 0, "אותו מחיר; בין as ל-as תואר רגיל", ROW("📱", "📱")),
 Q(AA, "Is your room ___ mine? – Yes, it's the same size.", ["as big as", "bigger than", "the biggest", "as bigger as"], 0, "the same size ← as big as", ROW("🛏️", "❓")),
 Q(AA, "Which is correct with good?", ["as good as", "as better as", "as good than", "as best as"], 0, "good לא משתנה: as good as", "👍"),
 Q(AA, "\"I'm not as strong as my brother.\" Who is stronger?", ["האח", "הדובר", "שניהם שווים", "אף אחד"], 0, "not as strong as ← האח חזק יותר", ROW("🗣️", "👦")),
 Q(AA, "\"Noa is as clever as Maya.\" This means:", ["they're equally clever", "Noa is cleverer", "Maya is cleverer", "neither is clever"], 0, "as … as = באותה מידה", ROW("👧", "🧠")),
 Q(AA, "The new film isn't as ___ as the old one. It's worse.", ["good", "bad", "better", "best"], 0, "worse ← לא טוב כמו הישן", "🎬"),
]))

# ───────────── Adverbs ─────────────
C.append(("Adverbs: quickly · slowly · well", [AV], [
 Q(AV, "He is a quick runner. He runs ___.", ["quickly", "quick", "quicker", "quickest"], 0, "רץ איך? ← תואר הפועל: quickly", "🏃"),
 Q(AV, "The turtle is slow. It walks very ___.", ["slowly", "slow", "slowest", "slowness"], 0, "הולך איך? ← slowly", "🐢"),
 Q(AV, "Please speak ___. The baby is sleeping.", ["quietly", "quiet", "quieter", "quietest"], 0, "speak איך? ← quietly", ROW("👶", "🤫")),
 Q(AV, "Adverb of happy?", ["happily", "happyly", "happly", "happy"], 0, "y ← ily: happily", PW("😊", "happy → ?")),
 Q(AV, "Adverb of careful?", ["carefully", "carefuly", "carefull", "careful"], 0, "careful + ly = carefully", PW("⚠️", "careful → ?")),
 Q(AV, "Adverb of good?", ["well", "goodly", "good", "better"], 0, "good ← well (יוצא דופן)", PW("👍", "good → ?")),
 Q(AV, "She is a good singer. She sings ___.", ["well", "good", "goodly", "best"], 0, "שרה איך? ← well, לא good", "🎤"),
 Q(AV, "Adverb of easy?", ["easily", "easyly", "easly", "easy"], 0, "y ← ily: easily", PW("✅", "easy → ?")),
 Q(AV, "Which word is the adverb of loud?", ["loudly", "loud", "happy", "quick"], 0, "ly בסוף, עונה על איך? ← adverb", ROW("📢", "😊", "🏃")),
 Q(AV, "Drive ___ (careful)! The road is wet.", ["carefully", "careful", "care", "carefulness"], 0, "drive איך? ← carefully", ROW("🚗", "💧")),
]))

C.append(("Adjective or adverb?", [AV], [
 Q(AV, "She is a ___ (beauty) dancer.", ["beautiful", "beautifully", "beauty", "beautifuly"], 0, "לפני שם עצם ← adjective", "💃"),
 Q(AV, "She dances ___ (beauty).", ["beautifully", "beautiful", "beauty", "beautifuly"], 0, "אחרי פועל ← adverb", "💃"),
 Q(AV, "The man shouted ___ (angry).", ["angrily", "angry", "anger", "angryly"], 0, "shouted איך? ← angrily", "😠"),
 Q(AV, "My brother is very ___. He never makes noise.", ["quiet", "quietly", "quietness", "quietlier"], 0, "אחרי is ← adjective", "👦"),
 Q(AV, "Tom did ___ on the test. He got 100!", ["well", "good", "goodly", "best"], 0, "did איך? ← well", TXT("100")),
 Q(AV, "The test was ___. Everyone got 100.", ["easy", "easily", "ease", "easyly"], 0, "אחרי was ← adjective", ROW("📝", "😊")),
 Q(AV, "We finished ___ (quick) – in only ten minutes!", ["quickly", "quick", "slowly", "quickness"], 0, "סיימנו איך? מהר ← quickly", "⏱️"),
 Q(AV, "He answered all the questions ___ (correct).", ["correctly", "correct", "correction", "corrects"], 0, "answered איך? ← correctly", "✅"),
 Q(AV, "Which sentence with fast is correct?", ["She runs fast.", "She runs fastly.", "She fast runs.", "She run fastly."], 0, "fast הוא גם adverb, בלי ly", "🏃‍♀️"),
 Q(AV, "Which sentence with well is correct?", ["He plays well.", "He plays good.", "He well plays.", "He play goodly."], 0, "פועל + well (לא good)", "⚽"),
]))

# ───────────── too · enough ─────────────
C.append(("too + adjective", [TE], [
 Q(TE, "I can't drink this tea. It's ___ hot.", ["too", "enough", "very much", "so many"], 0, "too hot = חם מדי", "🍵"),
 Q(TE, "He can't reach the shelf. He is ___ short.", ["too", "enough", "very much", "much"], 0, "too short = נמוך מדי", ROW("👦", "📚")),
 Q(TE, "This bag is too ___ for me. I can't carry it.", ["heavy", "light", "heavily", "heaviest"], 0, "לא מצליח להרים ← too heavy", "🎒"),
 Q(TE, "\"too expensive\" means:", ["יקר מדי", "יקר מספיק", "לא יקר", "הכי יקר"], 0, "too = מדי, יותר ממה שצריך", TXT("too expensive")),
 Q(TE, "The shoes are too ___. I need a bigger size.", ["small", "big", "large", "long"], 0, "צריך מידה גדולה ← too small", "👟"),
 Q(TE, "It's too ___ to swim today. It's 5°C!", ["cold", "hot", "warm", "sunny"], 0, "5°C ← too cold", ROW("🏊", "🌡️")),
 Q(TE, "Which is correct?", ["too hot", "too much hot", "hot too much", "enough hot"], 0, "too + תואר", "🔥"),
 Q(TE, "I'm ___ tired to do my homework.", ["too", "enough", "so much", "very much"], 0, "too + תואר + to + פועל", ROW("😴", "📓")),
 Q(TE, "Grandpa is 90. He's too ___ to run fast.", ["old", "young", "short", "new"], 0, "בן 90 ← too old", ROW("👴", "🏃")),
 Q(TE, "The film was too ___. I fell asleep.", ["boring", "exciting", "funny", "short"], 0, "נרדמתי ← too boring", ROW("🎬", "😴")),
]))

C.append(("enough · not … enough", [TE], [
 Q(TE, "I'm not tall ___ to play basketball.", ["enough", "too", "very", "much"], 0, "תואר + enough = מספיק", "🏀"),
 Q(TE, "Is the water warm ___ for swimming?", ["enough", "too", "very", "much"], 0, "warm enough = חם מספיק", "🏊"),
 Q(TE, "We don't have ___ chairs for everyone.", ["enough", "too", "very", "so"], 0, "enough + שם עצם: enough chairs", "🎉"),
 Q(TE, "Which is correct?", ["old enough", "enough old", "too enough", "old too"], 0, "התואר בא לפני enough", "🎂"),
 Q(TE, "He is 16. He isn't old enough ___ drive.", ["to", "for", "that", "than"], 0, "old enough to + פועל", "🚗"),
 Q(TE, "\"big enough\" means:", ["גדול מספיק", "גדול מדי", "לא גדול", "הכי גדול"], 0, "enough = מספיק", TXT("big enough")),
 Q(TE, "I have ___ money to buy the book. Here!", ["enough", "too", "very", "not"], 0, "enough + שם עצם = מספיק כסף", ROW("💰", "📖")),
 Q(TE, "The box is too small. It isn't ___ enough.", ["big", "small", "bigger", "biggest"], 0, "too small = not big enough", "📦"),
 Q(TE, "The soup is too cold. It isn't ___ enough.", ["hot", "cold", "hotter", "hottest"], 0, "too cold = not hot enough", "🍲"),
 Q(TE, "She ran fast ___ to win the race.", ["enough", "too", "very", "so"], 0, "fast enough = מהר מספיק", ROW("🏃‍♀️", "🏆")),
]))

# ───────────── Modals ─────────────
C.append(("Modals: can · could · should", [MD], [
 Q(MD, "I ___ swim when I was five.", ["could", "can", "must", "should"], 0, "יכולת בעבר ← could", PW("🏊", "age 5")),
 Q(MD, "Penguins ___ fly.", ["can't", "can", "must", "should"], 0, "פינגווינים לא יכולים לעוף", ROW("🐧", "✈️")),
 Q(MD, "Wow! My little brother ___ ride a bike now!", ["can", "can't", "must", "should"], 0, "יכולת בהווה ← can", ROW("👦", "🚲")),
 Q(MD, "Which is more polite: ___ you help me?", ["Could", "Must", "Should", "Have"], 0, "בקשה מנומסת ← Could you…?", ROW("🙏", "📦")),
 Q(MD, "Advice: you look tired. You ___ go to bed.", ["should", "shouldn't", "mustn't", "can't"], 0, "עצה ← should", ROW("😴", "🛏️")),
 Q(MD, "Advice: you ___ eat so much candy.", ["shouldn't", "should", "must", "have to"], 0, "עצה לא לעשות ← shouldn't", ROW("🍬", "🦷")),
 Q(MD, "Advice: it's cold. You ___ take a coat.", ["should", "shouldn't", "can't", "mustn't"], 0, "עצה ← should", ROW("❄️", "🧥")),
 Q(MD, "should = ?", ["כדאי", "חייב", "יכול", "אסור"], 0, "should = כדאי (עצה)", TXT("should")),
 Q(MD, "could is the past of…", ["can", "must", "should", "will"], 0, "can ← could בעבר", TXT("could")),
 Q(MD, "Which is correct?", ["She can swim", "She cans swim", "She can swims", "She can swimming"], 0, "can + צורת בסיס", ROW("🏊‍♀️", "✅")),
]))

C.append(("Modals: must · mustn't · have to", [MD], [
 Q(MD, "You ___ wear a seatbelt in the car.", ["must", "mustn't", "can't", "doesn't"], 0, "חובה ← must", ROW("🚗", "👨")),
 Q(MD, "You ___ run near the pool. It's dangerous.", ["mustn't", "must", "should", "have to"], 0, "אסור ← mustn't", ROW("🏊", "⚠️")),
 Q(MD, "You ___ use your phone in the test.", ["mustn't", "must", "have to", "should"], 0, "אסור ← mustn't", ROW("📱", "📝")),
 Q(MD, "mustn't = ?", ["אסור", "לא חייב", "יכול", "כדאי"], 0, "mustn't = אסור", TXT("mustn't")),
 Q(MD, "don't have to = ?", ["לא חייבים", "אסור", "חייבים", "כדאי"], 0, "don't have to = לא חייבים", TXT("don't have to")),
 Q(MD, "must = ?", ["חייב", "יכול", "כדאי", "אסור"], 0, "must = חייב", TXT("must")),
 Q(MD, "Now I ___ to get up early on Sundays.", ["have", "has", "having", "haves"], 0, "I ← have to", ROW("⏰", "🛏️")),
 Q(MD, "Now she ___ to wear a uniform at school.", ["has", "have", "having", "is"], 0, "she ← has to", ROW("👧", "👕")),
 Q(MD, "We don't ___ to go to school on Saturday.", ["have", "must", "has", "should"], 0, "don't have to = לא חייבים", ROW("📅", "🏫")),
 Q(MD, "Last year I ___ to walk to school.", ["had", "have", "must", "has"], 0, "have to בעבר ← had to", ROW("🚶", "🏫")),
]))

# ───────────── Quantifiers ─────────────
C.append(("much · many · a lot of", [QT], [
 Q(QT, "How ___ apples are there?", ["many", "much", "a lot", "any"], 0, "נספרים (apples) ← many", COUNT(("🍎", 5))),
 Q(QT, "How ___ water do you drink?", ["much", "many", "a few", "few"], 0, "לא נספר (water) ← much", ROW("💧", "🥤")),
 Q(QT, "There isn't ___ milk.", ["much", "many", "a few", "these"], 0, "milk לא נספר ← much", ROW("🥛", "🥣")),
 Q(QT, "She has ___ of books – about 100!", ["a lot", "a little", "much", "any"], 0, "a lot of = הרבה", PW("📚", "100")),
 Q(QT, "There aren't ___ cars here.", ["many", "much", "a little", "a lot"], 0, "cars נספרים ← many", ROW("🚗", "🅿️")),
 Q(QT, "Which word goes with much?", ["money", "coins", "books", "cars"], 0, "much + לא נספר (money)", ROW("💵", "📕", "🚗")),
 Q(QT, "Which word goes with many?", ["students", "rice", "bread", "water"], 0, "many + נספר (students)", ROW("👦", "🍚", "🍞", "💧")),
 Q(QT, "How ___ money do you have?", ["much", "many", "lot", "few"], 0, "money לא נספר ← much", ROW("👛", "💵")),
 Q(QT, "There are ___ of people here.", ["a lot", "much", "many", "a little"], 0, "a lot of people = הרבה אנשים", ROW("👫", "👫", "👫")),
 Q(QT, "How many ___ are in your class?", ["students", "water", "money", "homework"], 0, "many + נספר ברבים", ROW("🏫", "📋")),
]))

C.append(("some · any · a few · a little", [QT], [
 Q(QT, "I bought ___ bread and ___ eggs.", ["some", "any", "many", "a few"], 0, "משפט חיובי, גם נספר וגם לא נספר ← some", ROW("🍞", "🍽️")),
 Q(QT, "Dad drank it all, so there isn't ___ juice left.", ["any", "many", "a few", "a lot"], 0, "שלילה, לא נשאר כלום ← any", ROW("👨", "🥤", "❌")),
 Q(QT, "I don't have ___ money – not even one shekel.", ["any", "some", "many", "a few"], 0, "שלילה ← any", ROW("👛", "❌")),
 Q(QT, "I have only ___ friends in Haifa – just three.", ["a few", "a little", "much", "any"], 0, "מעט + נספר ← a few", PW("👫", "3")),
 Q(QT, "Add only ___ salt to the soup.", ["a little", "a few", "many", "any"], 0, "מעט + לא נספר ← a little", ROW("🧂", "🍲")),
 Q(QT, "Can I have ___ tea and ___ cookies, please?", ["some", "any", "many", "a few"], 0, "בקשה (גם tea וגם cookies) ← some", ROW("☕", "🙏")),
 Q(QT, "Which word goes with a few?", ["books", "water", "sugar", "music"], 0, "a few + נספר (books)", ROW("📕", "💧", "🎵")),
 Q(QT, "Which word goes with a little?", ["milk", "eggs", "cups", "apples"], 0, "a little + לא נספר (milk)", ROW("🥛", "🥚", "🍎")),
 Q(QT, "There aren't ___ eggs in the fridge.", ["any", "some", "much", "a little"], 0, "שלילה + נספר ← any", ROW("🥚", "❌")),
 Q(QT, "Hurry! We don't have ___ time – only five minutes.", ["much", "many", "a few", "some"], 0, "time לא נספר ← much", ROW("⏰", "🏃")),
]))

# ───────────── Connectors ─────────────
C.append(("and · but · because · so", [CN], [
 Q(CN, "I like tea ___ coffee.", ["and", "but", "so", "because"], 0, "מוסיפים עוד דבר ← and", ROW("☕", "🍵")),
 Q(CN, "I like dogs, ___ I don't like cats.", ["but", "and", "so", "because"], 0, "ניגוד ← but", ROW("🐕", "🐈")),
 Q(CN, "I'm hungry, ___ I'm making a sandwich.", ["so", "but", "because", "although"], 0, "תוצאה ← so", ROW("😋", "🥪")),
 Q(CN, "I'm making a sandwich ___ I'm hungry.", ["because", "so", "but", "although"], 0, "סיבה ← because", ROW("🥪", "😋")),
 Q(CN, "It was raining, ___ we stayed home.", ["so", "because", "but", "although"], 0, "תוצאה ← so", ROW("🌧️", "🏠")),
 Q(CN, "We stayed home ___ it was raining.", ["because", "so", "but", "however"], 0, "סיבה ← because", ROW("🏠", "🌧️")),
 Q(CN, "He is rich, ___ he isn't happy.", ["but", "so", "because", "or"], 0, "ניגוד ← but", ROW("💰", "😞")),
 Q(CN, "so = ?", ["לכן", "כי", "אבל", "למרות ש"], 0, "so = לכן (תוצאה)", TXT("so")),
 Q(CN, "because = ?", ["כי", "לכן", "אבל", "או"], 0, "because = כי (סיבה)", TXT("because")),
 Q(CN, "Which word shows a result?", ["so", "because", "but", "and"], 0, "so = לכן ← תוצאה", TXT("result")),
]))

C.append(("although · however", [CN], [
 Q(CN, "___ it was cold, we went swimming.", ["Although", "Because", "So", "However"], 0, "למרות ש… ← Although", ROW("❄️", "🏊")),
 Q(CN, "It was cold. ___, we went swimming.", ["However", "Although", "Because", "So"], 0, "בתחילת משפט + פסיק ← However", ROW("🏊", "❄️")),
 Q(CN, "although = ?", ["למרות ש", "כי", "לכן", "וגם"], 0, "although = למרות ש", TXT("although")),
 Q(CN, "however = ?", ["עם זאת", "לכן", "כי", "וגם"], 0, "however = עם זאת, אולם", TXT("however")),
 Q(CN, "She was tired, ___ she finished her homework.", ["but", "so", "because", "however"], 0, "ניגוד בתוך המשפט ← but", ROW("😴", "📓")),
 Q(CN, "He studied hard, ___ he passed the test.", ["so", "but", "although", "however"], 0, "תוצאה ← so", ROW("📚", "✅")),
 Q(CN, "___ he is young, he is very wise.", ["Although", "However", "So", "Because"], 0, "למרות שהוא צעיר ← Although", ROW("👦", "🦉")),
 Q(CN, "I didn't go to the party ___ I was sick.", ["because", "so", "although", "however"], 0, "סיבה ← because", ROW("🤒", "🎉")),
 Q(CN, "Which three-letter word joins two opposite ideas?", ["but", "so", "because", "and"], 0, "but = אבל ← ניגוד", ROW("👍", "👎")),
 Q(CN, "The test was hard. ___, I got 100!", ["However", "Because", "So", "Although"], 0, "ניגוד בין משפטים ← However", PW("📝", "100")),
]))

# ───────────── Words: feelings & jobs ─────────────
C.append(("Feelings", [VF], [
 Q(VF, "גאה = ?", ["proud", "lonely", "nervous", "jealous"], 0, "גאה = proud", ROW("🏅", "😊")),
 Q(VF, "My hands shake before the test. I'm ___.", ["nervous", "proud", "grateful", "lonely"], 0, "לחוץ, עצבני = nervous", ROW("😬", "📝")),
 Q(VF, "בודד = ?", ["lonely", "lovely", "proud", "lucky"], 0, "בודד = lonely (lovely = מקסים)", ROW("😔", "🏝️")),
 Q(VF, "נבוך = ?", ["embarrassed", "excited", "jealous", "confident"], 0, "נבוך = embarrassed", ROW("😳")),
 Q(VF, "He wants his friend's new bike. He is ___.", ["jealous", "grateful", "calm", "proud"], 0, "מקנא = jealous", ROW("👦", "🚲")),
 Q(VF, "Thank you so much! I'm very ___.", ["grateful", "lonely", "jealous", "nervous"], 0, "אסיר תודה = grateful", ROW("🎁", "🙏")),
 Q(VF, "מאוכזב = ?", ["disappointed", "delighted", "confident", "surprised"], 0, "מאוכזב = disappointed", ROW("😞", "💔")),
 Q(VF, "בטוח בעצמו = ?", ["confident", "nervous", "embarrassed", "lonely"], 0, "בטוח בעצמו = confident", ROW("😎", "💪")),
 Q(VF, "רגוע = ?", ["calm", "angry", "upset", "jealous"], 0, "רגוע = calm", ROW("😌", "🧘")),
 Q(VF, "נרגש = ?", ["excited", "bored", "upset", "lonely"], 0, "נרגש = excited", ROW("🤩", "🎢")),
]))

C.append(("Jobs", [VF], [
 Q(VF, "Who builds bridges and machines?", ["an engineer", "a nurse", "a pilot", "a journalist"], 0, "מהנדס = engineer", ROW("🌉", "⚙️")),
 Q(VF, "The ___ landed the plane safely in the storm.", ["pilot", "nurse", "lawyer", "mechanic"], 0, "טייס = pilot", ROW("✈️", "⛈️")),
 Q(VF, "A ___ helps doctors in a hospital.", ["nurse", "pilot", "engineer", "journalist"], 0, "אחות = nurse", ROW("🏥", "💉")),
 Q(VF, "A ___ writes for a newspaper.", ["journalist", "firefighter", "mechanic", "nurse"], 0, "עיתונאי = journalist", ROW("📰", "✍️")),
 Q(VF, "A ___ fixes cars.", ["mechanic", "journalist", "pilot", "lawyer"], 0, "מכונאי = mechanic", ROW("🚗", "🔧")),
 Q(VF, "The ___ arrived quickly and put out the fire.", ["firefighter", "scientist", "nurse", "pilot"], 0, "כבאי = firefighter", ROW("🔥", "🏠")),
 Q(VF, "A ___ helps people in court.", ["lawyer", "mechanic", "nurse", "pilot"], 0, "עורך דין = lawyer", ROW("⚖️", "🏛️")),
 Q(VF, "Who designs buildings?", ["an architect", "a firefighter", "a nurse", "a waiter"], 0, "אדריכל = architect", ROW("🏢", "📐")),
 Q(VF, "A ___ does experiments in a lab.", ["scientist", "waiter", "pilot", "lawyer"], 0, "מדען = scientist", ROW("🔬", "🧪")),
 Q(VF, "Who brings you food in a restaurant?", ["a waiter", "a lawyer", "a pilot", "an architect"], 0, "מלצר = waiter", ROW("🍽️", "🍝")),
 Q(VF, "רופא שיניים = ?", ["dentist", "doctor", "nurse", "scientist"], 0, "רופא שיניים = dentist", ROW("🦷", "😁")),
]))

# ───────────── Words: travel & technology ─────────────
C.append(("Travel", [VT], [
 Q(VT, "דרכון = ?", ["passport", "ticket", "luggage", "journey"], 0, "דרכון = passport", ROW("🛂", "✈️")),
 Q(VT, "מזוודות, מטען = ?", ["luggage", "passenger", "flight", "souvenir"], 0, "מטען = luggage", ROW("🧳", "🛄")),
 Q(VT, "נוסע (במטוס או באוטובוס) = ?", ["passenger", "passport", "pilot", "tourist"], 0, "נוסע = passenger", ROW("🚌", "💺")),
 Q(VT, "We flew ___ – to another country.", ["abroad", "inside", "along", "below"], 0, "לחו״ל = abroad", ROW("✈️", "🌍")),
 Q(VT, "מסע, נסיעה ארוכה = ?", ["journey", "flight", "ticket", "map"], 0, "מסע = journey", ROW("🚂", "🗺️")),
 Q(VT, "The pilot said: 'Welcome to ___ 202 to London.'", ["flight", "luggage", "passport", "souvenir"], 0, "טיסה = flight", ROW("✈️", "🕔")),
 Q(VT, "I bought a ___ to remember the trip.", ["souvenir", "passport", "flight", "delay"], 0, "מזכרת = souvenir", ROW("🗽", "🛍️")),
 Q(VT, "יעד (המקום שאליו נוסעים) = ?", ["destination", "direction", "decision", "delay"], 0, "יעד = destination", ROW("📍", "🗺️")),
 Q(VT, "The train is late. There is a ___.", ["delay", "journey", "ticket", "souvenir"], 0, "עיכוב = delay", ROW("🚆", "⏰")),
 Q(VT, "תייר = ?", ["tourist", "passenger", "pilot", "waiter"], 0, "תייר = tourist", ROW("📸", "🗺️")),
 Q(VT, "The plane will ___ in Rome at six.", ["land", "fly", "leave", "drive"], 0, "לנחות = land", ROW("🛬", "🕕")),
]))

C.append(("Technology", [VT], [
 Q(VT, "סיסמה = ?", ["password", "keyboard", "website", "screen"], 0, "סיסמה = password", ROW("🔐", "💻")),
 Q(VT, "מקלדת = ?", ["keyboard", "screen", "mouse", "battery"], 0, "מקלדת = keyboard", ROW("⌨️")),
 Q(VT, "The ___ is low. Charge your phone!", ["battery", "screen", "password", "website"], 0, "סוללה = battery", ROW("📱", "⚠️")),
 Q(VT, "להוריד (קובץ) = ?", ["download", "upload", "delete", "print"], 0, "להוריד = download", ROW("⬇️", "💻")),
 Q(VT, "מסך = ?", ["screen", "keyboard", "battery", "device"], 0, "מסך = screen", ROW("🖥️")),
 Q(VT, "I ___ my photos to the class website.", ["upload", "download", "delete", "borrow"], 0, "להעלות לאתר = upload", ROW("📷", "⬆️")),
 Q(VT, "A phone, a tablet, a laptop – they are all ___.", ["devices", "websites", "passwords", "keyboards"], 0, "מכשירים = devices", ROW("📱", "💻")),
 Q(VT, "המצאה = ?", ["invention", "information", "instruction", "interview"], 0, "המצאה = invention", ROW("💡", "⚙️")),
 Q(VT, "My phone is dead. I need to ___ it.", ["charge", "close", "delete", "search"], 0, "להטעין = charge", ROW("🔌", "📱")),
 Q(VT, "אתר אינטרנט = ?", ["website", "keyboard", "battery", "message"], 0, "אתר = website", ROW("💻", "🌐")),
 Q(VT, "לחפש (באינטרנט) = ?", ["search", "delete", "send", "save"], 0, "לחפש = search", ROW("🔍", "💻")),
]))

# ───────────── Words: the environment ─────────────
C.append(("Environment words", [VE], [
 Q(VE, "סביבה = ?", ["environment", "energy", "entrance", "equipment"], 0, "סביבה = environment", ROW("🌳", "🌍")),
 Q(VE, "זיהום = ?", ["pollution", "solution", "population", "protection"], 0, "זיהום = pollution", ROW("🏭", "💨")),
 Q(VE, "למחזר = ?", ["recycle", "reduce", "refuse", "repeat"], 0, "למחזר = recycle", ROW("♻️")),
 Q(VE, "להגן על = ?", ["protect", "pollute", "produce", "prepare"], 0, "להגן = protect", ROW("🛡️", "🐢")),
 Q(VE, "אנרגיה סולארית = ___ energy", ["solar", "wind", "water", "nuclear"], 0, "סולארי = מהשמש = solar", ROW("☀️", "🔋")),
 Q(VE, "Animals that may disappear are ___.", ["endangered", "dangerous", "extinct", "enormous"], 0, "בסכנת הכחדה = endangered", ROW("🐼", "🐅")),
 Q(VE, "בזבוז, פסולת = ?", ["waste", "wave", "water", "wall"], 0, "בזבוז = waste", ROW("🗑️", "🍌")),
 Q(VE, "כוכב לכת = ?", ["planet", "plant", "plane", "plan"], 0, "כוכב לכת = planet", ROW("🌍", "🌙")),
 Q(VE, "להפחית = ?", ["reduce", "recycle", "reuse", "return"], 0, "להפחית = reduce", ROW("📉")),
 Q(VE, "Turn off the lights to save ___.", ["energy", "plastic", "waste", "pollution"], 0, "לחסוך באנרגיה = save energy", ROW("💡", "🔌")),
]))

C.append(("Saving the planet", [VE], [
 Q(VE, "Cars and factories cause air ___.", ["pollution", "oxygen", "energy", "recycling"], 0, "מכוניות ומפעלים ← זיהום", ROW("🚗", "🏭")),
 Q(VE, "Trees give us ___.", ["oxygen", "plastic", "pollution", "waste"], 0, "עצים נותנים חמצן = oxygen", ROW("🌳", "🌳")),
 Q(VE, "Use a bottle again = ___ it.", ["reuse", "reduce", "refuse", "remove"], 0, "להשתמש שוב = reuse", ROW("🥤", "🔁")),
 Q(VE, "We must ___ the forests.", ["protect", "pollute", "destroy", "waste"], 0, "צריך להגן על היערות", ROW("🌲", "🦌")),
 Q(VE, "יער = ?", ["forest", "field", "desert", "farm"], 0, "יער = forest", ROW("🌲", "🌲", "🌲")),
 Q(VE, "Plastic bags are bad for the ___ – the world around us.", ["environment", "energy", "entrance", "oxygen"], 0, "שקיות פלסטיק פוגעות בסביבה", ROW("🛍️", "🐢")),
 Q(VE, "אשפה, זבל = ?", ["rubbish", "rabbit", "ribbon", "robber"], 0, "אשפה = rubbish", ROW("🗑️")),
 Q(VE, "Global warming makes the Earth ___.", ["warmer", "colder", "smaller", "cleaner"], 0, "התחממות ← חם יותר = warmer", ROW("🌍", "🌡️")),
 Q(VE, "Don't ___ water! Close the tap.", ["waste", "save", "recycle", "protect"], 0, "לבזבז = waste", ROW("🚰", "💧")),
 Q(VE, "אקלים = ?", ["climate", "climb", "clean", "client"], 0, "אקלים = climate", ROW("🌡️", "🌦️")),
 Q(VE, "Which one is bad for the planet?", ["pollution", "recycling", "solar energy", "trees"], 0, "זיהום פוגע בכדור הארץ", ROW("🌍", "❓")),
]))

# ───────────── Unseen (Band II) ─────────────
P1 = """
The Lost Passport

Last summer, Noam and his family flew abroad for the first time. Their destination was London. Noam was very excited because he wanted to see Big Ben and ride on a red bus.

At the airport, there was a long line of passengers. While Noam's father was checking in the luggage, his mother looked in her bag for the passports. She found three passports, but there were four people in the family! Noam's passport was missing.

Everyone was nervous. "We can't fly without it," said Noam's father. Noam felt terrible. He held his passport in his hand that morning, so where was it now? He tried to remember. Then he remembered: he was buying a sandwich at the café when his phone rang. He put the passport down on the table to answer the call.

Noam ran back to the café. A waiter was standing next to the table, and he was holding a small blue book. "Is this yours?" he asked with a smile. Noam was so grateful that he thanked him three times.

The flight was two hours late because of a delay, but nobody cared. The family arrived in London that night, tired but happy.
"""

C.append(("📖 Unseen: The Lost Passport", [UN], [
 Q(UN, "Where did the family fly?", ["to London", "to Paris", "to Eilat", "to Rome"], 0, "Their destination was London", ROW("✈️", "🗺️")),
 Q(UN, "What did Noam want to ride on?", ["a red bus", "a bike", "a horse", "a boat"], 0, "ride on a red bus", ROW("👦", "🏙️")),
 Q(UN, "What was missing at the airport?", ["Noam's passport", "the luggage", "the tickets", "Noam's phone"], 0, "Noam's passport was missing", ROW("🛫", "❓")),
 Q(UN, "How did everyone feel?", ["nervous", "proud", "bored", "calm"], 0, "Everyone was nervous", ROW("👪", "🛫")),
 Q(UN, "What was Noam doing when his phone rang?", ["buying a sandwich", "checking the luggage", "boarding the plane", "reading a book"], 0, "he was buying a sandwich", ROW("👦", "📞")),
 Q(UN, "Where did Noam put the passport?", ["on the table", "in his bag", "on the floor", "in his pocket"], 0, "He put the passport down on the table", ROW("👦", "🛂")),
 Q(UN, "Who found the passport?", ["a waiter", "his father", "a pilot", "a passenger"], 0, "A waiter was holding a small blue book", ROW("🛂", "🔍")),
 Q(UN, "\"grateful\" means:", ["אסיר תודה", "כועס", "מבולבל", "עייף"], 0, "he thanked him three times ← אסיר תודה", TXT("grateful")),
 Q(UN, "Why was the flight late?", ["a delay", "Noam's passport", "bad weather", "the luggage"], 0, "late because of a delay", ROW("✈️", "⏰")),
 Q(UN, "How did the family feel in London?", ["tired but happy", "sad and angry", "nervous", "bored"], 0, "tired but happy", ROW("🇬🇧", "🌙")),
 Q(UN, "What is the story mostly about?", ["Noam's passport", "a Paris trip", "a rude waiter", "a long flight"], 0, "רוב הסיפור: הדרכון שאבד ונמצא", ROW("📖", "👦")),
 Q(UN, "Why didn't anyone care about the delay?", ["passport was found", "food was good", "they love airports", "plane was new"], 0, "הדרכון נמצא ← העיכוב כבר לא חשוב", ROW("✈️", "⏰")),
], P1))

P2 = """
The Young Inventor

When Tamar was eleven, her grandmother fell in the kitchen. She was alone at home, and she couldn't get up. She lay on the floor for two hours until a neighbor heard her.

Tamar was very upset. "There must be a better way to help old people," she thought. So she decided to build something.

For six months, Tamar worked on her invention after school. She read a lot of articles on science websites and asked an engineer from her town for advice. Her idea was a small device, like a watch. If the person falls, the watch sends a message to the family's phones. It also shows where the person is.

Building it wasn't easy. The first watch was too big and heavy, and the battery died after an hour. The second one didn't send any messages. Tamar was disappointed, but she didn't give up.

Finally, the third watch worked! Tamar's grandmother wore it every day. Last year, Tamar's invention won first prize in a national science competition. Now a company wants to make thousands of these watches.

"I'm going to study engineering at university," says Tamar. "I want to invent things that make people's lives better."
"""

C.append(("📖 Unseen: The Young Inventor", [UN], [
 Q(UN, "What happened to Tamar's grandmother?", ["She fell", "She got sick", "She got lost", "She was hungry"], 0, "her grandmother fell in the kitchen", ROW("👵", "🍳")),
 Q(UN, "How long was the grandmother on the floor?", ["two hours", "two days", "six months", "one hour"], 0, "She lay on the floor for two hours", ROW("👵", "⏰")),
 Q(UN, "How did Tamar feel about it?", ["upset", "proud", "bored", "jealous"], 0, "Tamar was very upset", ROW("👧", "👵")),
 Q(UN, "Who gave Tamar advice?", ["an engineer", "her grandmother", "a neighbor", "her teacher"], 0, "asked an engineer for advice", ROW("👧", "💬")),
 Q(UN, "What does the device look like?", ["a watch", "a phone", "a bag", "a ring"], 0, "a small device, like a watch", ROW("💡", "⚙️")),
 Q(UN, "What does the watch do when someone falls?", ["sends a message", "plays music", "turns off", "takes a photo"], 0, "the watch sends a message", ROW("⌚", "👵")),
 Q(UN, "What was wrong with the first watch?", ["big and heavy", "small and light", "cheap and ugly", "slow and quiet"], 0, "too big and heavy", ROW("⌚", "❌")),
 Q(UN, "\"give up\" means:", ["לוותר", "להמציא", "לנצח", "להתחיל"], 0, "didn't give up = לא ויתרה", TXT("give up")),
 Q(UN, "What did Tamar win last year?", ["first prize", "a watch", "a phone", "a trip"], 0, "won first prize in a competition", ROW("👧", "🔬")),
 Q(UN, "What is Tamar going to study?", ["engineering", "medicine", "music", "art"], 0, "I'm going to study engineering", ROW("🎓", "📚")),
 Q(UN, "What is the main idea of the story?", ["Tamar's helpful invention", "Grandma's kitchen", "a science website", "a broken battery"], 0, "הסיפור כולו על ההמצאה של תמר", ROW("📖", "💭")),
 Q(UN, "What can we learn from Tamar?", ["don't give up", "build big watches", "work alone", "avoid science"], 0, "נכשלה פעמיים והמשיכה עד שהצליחה", ROW("👧", "💭")),
], P2))

P3 = """
The Beach Clean-Up

Last Friday, my class went to the beach near our school. We weren't going there to swim. We were going to clean it.

When we arrived, I couldn't believe my eyes. There was rubbish everywhere: plastic bottles, bags and hundreds of bottle caps. Our teacher, Ms. Levi, told us that plastic is very dangerous for sea animals. Turtles often eat plastic bags because the bags look like jellyfish.

We worked in groups. While my group was collecting bottles, another group was counting the bags. Suddenly, my friend Yael shouted. A small turtle was lying on the sand, and its leg was stuck in an old fishing net. We called Ms. Levi, and she carefully cut the net. The turtle walked slowly back to the sea. Everyone cheered!

At lunchtime, we had twenty big bags of rubbish. We took them to a recycling center, so most of the plastic will get a second life.

I learned an important lesson that day. It isn't enough to pick up rubbish. We must also reduce the plastic we use. Now I take a metal bottle to school, and my family doesn't buy plastic bags anymore.
"""

C.append(("📖 Unseen: The Beach Clean-Up", [UN], [
 Q(UN, "Why did the class go to the beach?", ["to clean it", "to swim", "to fish", "to play football"], 0, "We were going to clean it", ROW("🏖️", "🏫")),
 Q(UN, "What was everywhere on the beach?", ["rubbish", "turtles", "people", "shells"], 0, "There was rubbish everywhere", ROW("🏖️", "👀")),
 Q(UN, "To turtles, plastic bags look like…", ["jellyfish", "fish nets", "bottles", "sand"], 0, "the bags look like jellyfish", ROW("🐢", "🛍️")),
 Q(UN, "What was the writer's group doing?", ["collecting bottles", "counting bags", "swimming", "eating lunch"], 0, "my group was collecting bottles", ROW("🏖️", "👫")),
 Q(UN, "What was wrong with the turtle?", ["It was stuck", "It was sick", "It was lost", "It was hungry"], 0, "its leg was stuck in a net", ROW("🐢", "🏖️")),
 Q(UN, "Who cut the net?", ["Ms. Levi", "Yael", "the writer", "a fisherman"], 0, "she carefully cut the net", ROW("✂️", "🐢")),
 Q(UN, "How many bags of rubbish did they have?", ["twenty", "ten", "two", "hundreds"], 0, "twenty big bags of rubbish", ROW("🗑️", "🛍️")),
 Q(UN, "Where did they take the bags?", ["a recycling center", "the sea", "the school", "a shop"], 0, "to a recycling center", ROW("🛍️", "🚚")),
 Q(UN, "\"reduce\" means:", ["להפחית", "למחזר", "לאסוף", "לזרוק"], 0, "reduce the plastic = להפחית בפלסטיק", TXT("reduce")),
 Q(UN, "What does the writer take to school now?", ["a metal bottle", "a plastic bag", "a plastic bottle", "a fishing net"], 0, "Now I take a metal bottle", ROW("🎒", "🏫")),
 Q(UN, "What is the writer's main message?", ["use less plastic", "turtles are cute", "sea swimming", "fishing is fun"], 0, "We must reduce the plastic we use", ROW("📖", "🏖️")),
 Q(UN, "Why did everyone cheer?", ["turtle got free", "lunch was ready", "the work ended", "Yael found shells"], 0, "הצב השתחרר וחזר לים", ROW("👫", "🙌")),
], P3))

P4 = """
One Week Without Screens

Last month, our school had a challenge: one week without screens. No phones, no computers and no TV. At first, I thought it was a terrible idea. I usually spend about five hours a day on my phone, and I couldn't imagine my life without it.

On the first day, I was bored and nervous. I kept looking for my phone, but it wasn't there. My mother was keeping it in her drawer. In the evening, I didn't know what to do, so I took out an old board game. My little brother and I played for two hours. It was the best evening in a long time.

On the third day, I started reading a book about a girl who travels around the world. I finished it in two days! I also went to the park with my friends every afternoon. We played football and talked much more than usual.

When the week ended, I got my phone back. I was happy to see it, but I didn't feel the same about it. Now I have a new rule: no phones at dinner and no screens after nine o'clock. I'm going to keep this rule, because I sleep better and I feel calmer.
"""

C.append(("📖 Unseen: One Week Without Screens", [UN], [
 Q(UN, "What was the school challenge?", ["a screen-free week", "a homework-free week", "a sugar-free week", "a sport-free week"], 0, "one week without screens", ROW("🏫", "📅")),
 Q(UN, "How many hours a day does the writer usually use the phone?", ["about five", "about two", "about nine", "about one"], 0, "about five hours a day", ROW("📱", "⏰")),
 Q(UN, "How did the writer feel on the first day?", ["bored and nervous", "calm and happy", "proud and excited", "tired and sick"], 0, "I was bored and nervous", ROW("👦", "📅")),
 Q(UN, "Where was the phone during the week?", ["in Mom's drawer", "in the park", "at school", "in a bag"], 0, "My mother was keeping it in her drawer", ROW("📱", "❓")),
 Q(UN, "What did the writer play with the brother?", ["a board game", "football", "computer games", "the piano"], 0, "I took out an old board game", ROW("👦", "🌙")),
 Q(UN, "What was the book about?", ["a traveling girl", "a football team", "a lost phone", "a school challenge"], 0, "a girl who travels around the world", ROW("📖", "❓")),
 Q(UN, "Who did the writer play football with?", ["friends", "the brother", "Mom", "a coach"], 0, "went to the park with my friends", ROW("⚽", "🌳")),
 Q(UN, "When are phones not allowed now?", ["at dinner", "at school", "in the morning", "in the park"], 0, "no phones at dinner", ROW("📵", "❓")),
 Q(UN, "Why is the writer going to keep the rule?", ["sleeps better", "gets money", "Mom says so", "it's easy"], 0, "because I sleep better and feel calmer", ROW("📵", "😊")),
 Q(UN, "\"challenge\" means:", ["אתגר", "משחק", "חופשה", "חוק"], 0, "challenge = אתגר", TXT("challenge")),
 Q(UN, "What is the main idea of the text?", ["a screen-free week", "a new phone", "a board game", "a trip abroad"], 0, "שבוע בלי מסכים ומה הכותב למד", ROW("📖", "💭")),
 Q(UN, "What does the writer do differently with screens now?", ["uses screens less", "bought a phone", "stopped reading", "plays outside less"], 0, "חוק חדש: פחות מסכים ← ישן טוב יותר", ROW("👦", "📅")),
], P4))

# ───────────── Review ─────────────
C.append(("חזרה כללית", [PR, PI, PN, PP, FU, CS, MD, QT, CN, VF, VT, VE], [
 Q(PR, "Past of try?", ["tried", "tryed", "tries", "trid"], 0, "y אחרי עיצור ← ied", PW("🏀", "try → ?")),
 Q(PI, "Past of catch?", ["caught", "catched", "cought", "catches"], 0, "catch – caught", PW("⚾", "catch → ?")),
 Q(PN, "Did you ___ your keys?", ["find", "found", "finds", "finding"], 0, "אחרי Did ← צורת בסיס", ROW("🔑", "❓")),
 Q(PP, "Yesterday at seven we ___ breakfast.", ["were having", "was having", "are having", "have"], 0, "we ← were + ing", ROW("🥣", "🕖")),
 Q(PP, "While I was sleeping, the phone ___.", ["rang", "ringed", "was ring", "rings"], 0, "פעולה קצרה בעבר: ring – rang", ROW("😴", "📞")),
 Q(FU, "Next year I ___ be thirteen.", ["will", "was", "am", "did"], 0, "next year ← will", PW("🎂", "13")),
 Q(FU, "We ___ going to fly to Rome in May.", ["are", "is", "will", "do"], 0, "we ← are going to", ROW("✈️", "🇮🇹")),
 Q(CS, "Comparative of easy?", ["easier", "easyer", "more easy", "easiest"], 0, "y אחרי עיצור ← ier", PW("👌", "easy → ?")),
 Q(CS, "A bike is ___ (slow) than a car.", ["slower", "slowest", "more slow", "slow"], 0, "slow ← slower", ROW("🚲", "🚗")),
 Q(MD, "You ___ touch that wire! It's dangerous.", ["mustn't", "must", "have to", "should"], 0, "אסור ← mustn't", ROW("🔌", "⚠️")),
 Q(MD, "I ___ ride a bike when I was six.", ["could", "can", "must", "will"], 0, "יכולת בעבר ← could", PW("🚲", "age 6")),
 Q(QT, "How ___ sugar do you want?", ["much", "many", "a few", "few"], 0, "sugar לא נספר ← much", ROW("☕", "🍬")),
 Q(QT, "There are ___ cookies left – just two.", ["a few", "a little", "much", "any"], 0, "מעט + נספר ← a few", COUNT(("🍪", 2))),
 Q(CN, "I was tired, ___ I went to bed early.", ["so", "because", "although", "however"], 0, "תוצאה ← so", ROW("😴", "🛏️")),
 Q(CN, "___ it was late, we kept playing.", ["Although", "Because", "So", "However"], 0, "למרות שהיה מאוחר ← Although", ROW("🌙", "🎲")),
 Q(VF, "She won the race! She feels very ___.", ["proud", "lonely", "jealous", "embarrassed"], 0, "גאה = proud", ROW("🏃‍♀️", "🏅")),
 Q(VT, "Show your ___ at the airport.", ["passport", "battery", "keyboard", "souvenir"], 0, "בשדה התעופה מראים דרכון", ROW("🛫", "🧳")),
 Q(VE, "Solar panels make energy from the ___.", ["sun", "wind", "sea", "moon"], 0, "solar = מהשמש", ROW("🔋", "🏠")),
]))

# station type on the map
KINDS = {c[0]: "gram" for c in C if c[1][0] in (PR, PI, PN, PP, FU, CS, AA, AV, TE, MD, QT, CN)}
KINDS.update({c[0]: "word" for c in C if c[1][0] in (VF, VT, VE)})
KINDS.update({c[0]: "read" for c in C if c[1][0] == UN})
KINDS["חזרה כללית"] = "rev"

# Band II words taught in this set – every one must be a correct answer somewhere (build_set.py checks).
WORD_LIST = """proud|nervous|lonely|embarrassed|jealous|grateful|disappointed|confident|calm|excited|
engineer|pilot|nurse|journalist|mechanic|firefighter|lawyer|architect|scientist|waiter|dentist|
passport|luggage|passenger|abroad|journey|flight|souvenir|destination|delay|tourist|land|
password|keyboard|battery|download|screen|upload|device|invention|charge|website|search|
environment|pollution|recycle|protect|solar|endangered|waste|planet|reduce|energy|oxygen|reuse|forest|rubbish|climate""".replace("\n", "").split("|")
