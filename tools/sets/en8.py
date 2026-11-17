# Practice set: English, grade 8 (כיתה ח') – a step above grade 7 (Band II):
# Present Perfect (have/has + V3, ever/never/already/yet, since/for), Past Simple vs Present Perfect,
# Past Progressive with when / while, future forms (will / going to / present progressive for plans),
# the first conditional, comparatives & superlatives (irregular, as … as), modals (must / have to / should / might),
# quantifiers, relative pronouns (who / which / that), writing a paragraph and connectors,
# Band II vocabulary (environment & technology, health & travel, media & feelings) and four longer Unseen passages.
# The grade 7 sets (en7, en7_nov26) are not repeated here.
# Organised by fine topics (≈20 questions each) so a parent can tick only what the test covers.
# Run: python3 -I tools/build_set.py tools/sets/en8.py
import re

PF, PV, PP = "Present Perfect", "Past Simple or Present Perfect?", "Past Progressive · when / while"
FU, CI, CS = "Future: will · going to · plans", "First conditional: If … will", "Comparatives & superlatives"
MD, QT, RP = "Modals: must · have to · should · might", "Quantifiers", "Relative pronouns: who · which · that"
WR = "Paragraphs & connectors"
VE, VH, VM = "Words: environment & technology", "Words: health & travel", "Words: media & feelings"
UN = "Unseen"

SET = dict(name="English ח'", grade=7, subject="אנגלית",
           title="Present Perfect · Conditionals · Modals · Band II · Unseen",
           desc="אנגלית לכיתה ח': Present Perfect, עבר מול Present Perfect, Past Progressive, עתיד, משפטי תנאי, השוואות, פעלים מודאליים, כמתים, who/which/that, כתיבת פסקה ומילות קישור, אוצר מילים Band II וארבעה קטעי Unseen ארוכים",
           desc_en="Grade 8 English: Present Perfect, Past Simple vs Present Perfect, Past Progressive, future forms, the first conditional, comparatives, modals, quantifiers, relative pronouns, paragraphs and connectors, Band II words and four longer Unseen passages",
           tags=["Present Perfect", "since / for", "when / while", "will / going to", "If … will", "Modals",
                 "who / which / that", "Connectors", "Band II words", "Unseen"],
           examDate="", dailyGoal=2, perRound=10,
           topics=[PF, PV, PP, FU, CI, CS, MD, QT, RP, WR, VE, VH, VM, UN])
MAX_Q_WORDS = 12


def W(s): return re.sub(r"\{([^}]*)\}", lambda m: "⁦" + m.group(1) + "⁩", s)
def Q(t, q, opts, ans, expl, sc): return (t, W(q), opts, ans, W(expl), sc)

def ROW(*es):
    """The things the question talks about, side by side."""
    n = len(es); s = min(40, 125 / n); step = min(92 / n, s / 1.6 * 1.35)
    return [(e, round(50 + (j - (n - 1) / 2) * step, 1), 52, round(s)) for j, e in enumerate(es)]

def PW(e, w):
    """The object on the left, the given word / phrase on a card on the right."""
    return [(e, 22, 52, 36), (w, 64, 52, round(min(22, 110 / len(w))))]


C = []

# ───────────── Present Perfect ─────────────
C.append(("Present Perfect: have / has + V3", [PF], [
 Q(PF, "She ___ her homework, so she can watch TV.", ["has finished", "have finished", "has finish", "having finished"], 0, "she ← has + V3: has finished", ROW("👧", "📓", "📺")),
 Q(PF, "They ___ the new Spider-Man film.", ["have seen", "has seen", "have saw", "has saw"], 0, "they ← have + V3 (see-saw-seen)", ROW("🍿", "🎬")),
 Q(PF, "Third form (V3) of write?", ["written", "wrote", "writed", "writing"], 0, "write – wrote – written", PW("✍️", "write → ?")),
 Q(PF, "Third form (V3) of go?", ["gone", "went", "goed", "going"], 0, "go – went – gone", PW("🚶", "go → ?")),
 Q(PF, "Third form (V3) of eat?", ["eaten", "ate", "eated", "eating"], 0, "eat – ate – eaten", PW("🍽️", "eat → ?")),
 Q(PF, "Third form (V3) of buy?", ["bought", "buyed", "boughten", "buying"], 0, "buy – bought – bought", PW("🛒", "buy → ?")),
 Q(PF, "I have never ___ a horse.", ["ridden", "rode", "ride", "rided"], 0, "ride – rode – ridden", ROW("🐎", "🙅")),
 Q(PF, "___ you ever been to Paris?", ["Have", "Has", "Did", "Were"], 0, "you ← Have you ever been…?", ROW("🗼", "✈️")),
 Q(PF, "My brother ___ his phone. He can't find it.", ["has lost", "have lost", "has lose", "is lost"], 0, "he ← has + V3: has lost", ROW("👦", "📱", "❓")),
 Q(PF, "Oops! She ___ an egg.", ["has broken", "have broken", "has broke", "has break"], 0, "has + V3 (break-broke-broken)", ROW("👧", "🍳", "🥚")),
]))

C.append(("ever · never · already · yet · since · for", [PF], [
 Q(PF, "I haven't finished my project ___.", ["yet", "already", "since", "ever"], 0, "בשלילה בסוף המשפט ← yet (עדיין לא)", ROW("📋", "⏳")),
 Q(PF, "We have ___ eaten lunch. We're full.", ["already", "yet", "ever", "since"], 0, "already = כבר", ROW("🍽️", "😌")),
 Q(PF, "I've ___ seen snow. I'd love to see it!", ["never", "ever", "already", "yet"], 0, "never = אף פעם לא", ROW("❄️", "🤩")),
 Q(PF, "Have you ___ tried sushi? – No, not once.", ["ever", "yet", "since", "for"], 0, "בשאלה: ever = אי פעם", ROW("🍣", "❓")),
 Q(PF, "She has lived here ___ 2020.", ["since", "for", "ago", "yet"], 0, "נקודת התחלה (שנה) ← since", PW("🏠", "2020")),
 Q(PF, "They have known each other ___ ten years.", ["for", "since", "ago", "already"], 0, "משך זמן ← for", ROW("👫", "📅")),
 Q(PF, "I have been sick ___ Monday.", ["since", "for", "ago", "yet"], 0, "Monday = נקודת התחלה ← since", ROW("🤒", "📅")),
 Q(PF, "He has played the guitar ___ a long time.", ["for", "since", "ago", "yet"], 0, "a long time = משך ← for", ROW("🎸", "⏳")),
 Q(PF, "How long ___ you lived in Haifa?", ["have", "has", "did", "are"], 0, "you ← have + lived", ROW("🏙️", "⏳")),
 Q(PF, "Which time goes with \"for\"?", ["three weeks", "last Sunday", "2015", "my birthday"], 0, "for + משך זמן: three weeks", PW("⏳", "for + ?")),
]))

# ───────────── Past Simple or Present Perfect? ─────────────
C.append(("Past Simple or Present Perfect?", [PV], [
 Q(PV, "I ___ my grandma yesterday.", ["visited", "have visited", "has visited", "visit"], 0, "yesterday = זמן מוגדר בעבר ← Past Simple", ROW("👵", "📅")),
 Q(PV, "I ___ to London twice in my life.", ["have been", "was", "am", "go"], 0, "in my life = ניסיון ← Present Perfect", ROW("🇬🇧", "✈️")),
 Q(PV, "She ___ to Rome in 2019.", ["went", "has gone", "has been", "goes"], 0, "in 2019 = זמן מוגדר ← Past Simple", ROW("🇮🇹", "📅")),
 Q(PV, "___ you see the match last night?", ["Did", "Have", "Has", "Do"], 0, "last night ← Past Simple: Did", ROW("⚽", "🌙")),
 Q(PV, "Which word goes with Past Simple?", ["ago", "yet", "ever", "since"], 0, "ago = לפני ← Past Simple", PW("📅", "Past Simple")),
 Q(PV, "Which word goes with Present Perfect?", ["yet", "ago", "yesterday", "last year"], 0, "yet ← Present Perfect", PW("⏳", "have + V3")),
 Q(PV, "When ___ you buy that phone?", ["did", "have", "has", "were"], 0, "שאלת When ← Past Simple", ROW("📱", "🛒")),
 Q(PV, "He ___ his leg last week.", ["broke", "has broken", "breaks", "have broken"], 0, "last week ← Past Simple", ROW("🦵", "🏥")),
 Q(PV, "We ___ here since 2018.", ["have lived", "lived", "live", "are living"], 0, "since ← Present Perfect", PW("🏠", "since 2018")),
 Q(PV, "Yesterday I ___ that film.", ["saw", "have seen", "has seen", "seen"], 0, "yesterday ← Past Simple: saw", ROW("🎬", "📅")),
]))

C.append(("been or gone? just · ago · so far", [PV], [
 Q(PV, "Dan isn't here. He ___ to the shop.", ["has gone", "has been", "have gone", "is go"], 0, "has gone = הלך ועדיין שם", ROW("🏪", "🚶")),
 Q(PV, "The bus has ___ left. We missed it!", ["just", "yet", "ever", "ago"], 0, "just = הרגע", ROW("🚌", "🏃")),
 Q(PV, "I've lost my key. – When ___ you lose it?", ["did", "have", "has", "do"], 0, "When ← Past Simple: did", ROW("🔑", "❓")),
 Q(PV, "She ___ a doctor since 2015.", ["has been", "was", "is", "were"], 0, "since ← has been", ROW("👩‍⚕️", "🏥")),
 Q(PV, "Two years ___, we moved to Haifa.", ["ago", "since", "for", "yet"], 0, "לפני שנתיים = two years ago", ROW("🚚", "🏙️")),
 Q(PV, "I ___ the dishes an hour ago.", ["washed", "have washed", "wash", "has washed"], 0, "an hour ago ← Past Simple", ROW("🍽️", "🧽")),
 Q(PV, "Which time phrase needs Past Simple?", ["in 2010", "since 2010", "so far", "yet"], 0, "שנה מוגדרת בעבר ← Past Simple", ROW("📅", "⬅️")),
 Q(PV, "Which uses Present Perfect?", ["I have eaten", "I ate", "I was eating", "I eat"], 0, "have + V3 = Present Perfect", ROW("🍽️", "✅")),
 Q(PV, "It ___ a lot last winter.", ["rained", "has rained", "rains", "have rained"], 0, "last winter ← Past Simple", ROW("🌧️", "❄️")),
 Q(PV, "How many films ___ you seen this year?", ["have", "did", "has", "are"], 0, "seen = V3 ← have", ROW("🎬", "🍿")),
]))

# ───────────── Past Progressive · when / while ─────────────
C.append(("Past Progressive: was / were + -ing", [PP], [
 Q(PP, "At 8 p.m. yesterday, I ___ my homework.", ["was doing", "were doing", "have done", "am doing"], 0, "באמצע פעולה בעבר ← was + ing", ROW("📓", "🕗")),
 Q(PP, "They ___ football when it started to rain.", ["were playing", "was playing", "are playing", "play"], 0, "they ← were + ing", ROW("⚽", "🌧️")),
 Q(PP, "While she was reading, her phone ___.", ["rang", "was ring", "rings", "ringing"], 0, "פעולה קצרה ← Past Simple: rang", ROW("📖", "📱")),
 Q(PP, "I was walking home ___ I saw an accident.", ["when", "while", "during", "since"], 0, "פעולה קצרה שהפריעה ← when", ROW("🚶", "🚗")),
 Q(PP, "___ we were eating, the lights went out.", ["While", "During", "Since", "For"], 0, "While + פעולה ארוכה", ROW("🍝", "💡")),
 Q(PP, "What were you doing at 9 last night?", ["I was sleeping", "I am sleeping", "I sleep", "I have slept"], 0, "שאלה ב-Past Progressive ← תשובה בו", ROW("🛌", "🕘")),
 Q(PP, "The sun ___ and the birds were singing.", ["was shining", "were shining", "shined", "is shining"], 0, "the sun ← was + ing", ROW("☀️", "🐦")),
 Q(PP, "I was cooking when he called. Which action was short?", ["calling", "cooking", "both", "neither"], 0, "הפעולה הקצרה ב-Past Simple", ROW("🍳", "📞")),
 Q(PP, "Which is correct?", ["They were sleeping", "They was sleeping", "They sleeping", "They were sleep"], 0, "they ← were + ing", ROW("😴", "😴")),
 Q(PP, "She hurt her hand while she ___.", ["was cooking", "were cooking", "cooks", "is cooking"], 0, "while + was + ing", ROW("🔪", "🥕")),
]))

C.append(("when, while or during?", [PP], [
 Q(PP, "___ I was swimming, I lost my ring.", ["While", "During", "Since", "Because"], 0, "While + פעולה ארוכה", ROW("🏊", "💍")),
 Q(PP, "He fell ___ he was running.", ["while", "during", "since", "for"], 0, "while + was + ing", ROW("🏃", "🤕")),
 Q(PP, "We were watching TV ___ the doorbell rang.", ["when", "while", "during", "for"], 0, "when + פעולה קצרה", ROW("📺", "🔔")),
 Q(PP, "___ the film, my phone rang.", ["During", "While", "When", "Since"], 0, "During + שם עצם (the film)", ROW("🎬", "📱")),
 Q(PP, "I met Dana ___ I was waiting for the bus.", ["while", "during", "for", "since"], 0, "while + פעולה ארוכה", ROW("🚏", "👋")),
 Q(PP, "Mom was cooking while Dad ___ the table.", ["was setting", "were setting", "is setting", "sets"], 0, "שתי פעולות ארוכות במקביל", ROW("🍳", "🍽️")),
 Q(PP, "When I arrived, my friends ___ for me.", ["were waiting", "was waiting", "wait", "are waiting"], 0, "friends = רבים ← were + ing", ROW("👫", "⏳")),
 Q(PP, "While I was reading, my sister ___ music.", ["was playing", "were playing", "plays", "is playing"], 0, "my sister ← was + ing", ROW("📖", "🎹")),
 Q(PP, "It ___ when we left the house.", ["was snowing", "snowing", "were snowing", "snows"], 0, "it ← was + ing", ROW("🏠", "❄️")),
 Q(PP, "I broke my arm while I ___.", ["was skiing", "were skiing", "skiing", "am skiing"], 0, "I ← was + ing", ROW("⛷️", "🦴")),
]))

# ───────────── Future ─────────────
C.append(("Future: will or going to?", [FU], [
 Q(FU, "Look at those dark clouds! It ___ rain.", ["is going to", "will to", "is going", "going to"], 0, "רואים סימן ברור ← is going to", ROW("⛈️", "☁️")),
 Q(FU, "I'm thirsty. – Wait, I ___ get you some water!", ["will", "am going", "going to", "was"], 0, "החלטה של הרגע ← will", ROW("🥵", "🥛")),
 Q(FU, "I think robots ___ do our housework one day.", ["will", "are", "going to", "have"], 0, "I think + תחזית ← will", ROW("🤖", "🧹")),
 Q(FU, "We've bought the tickets. We ___ visit Rome.", ["are going to", "will to", "going to", "are go"], 0, "תוכנית שכבר החלטנו ← going to", ROW("🎫", "🇮🇹")),
 Q(FU, "I promise I ___ tell anyone your secret.", ["won't", "don't", "am not", "wasn't"], 0, "הבטחה ← won't = will not", ROW("🤐", "🤝")),
 Q(FU, "I ___ my aunt tonight. It's in my diary.", ["am meeting", "meet", "met", "have met"], 0, "סידור קבוע ← am + ing", ROW("📅", "👩")),
 Q(FU, "What ___ you going to study at university?", ["are", "will", "do", "have"], 0, "you ← are going to", ROW("🎓", "📚")),
 Q(FU, "The phone is ringing. – I ___ answer it!", ["will", "did", "have", "was"], 0, "החלטה של הרגע ← will", ROW("☎️", "🔔")),
 Q(FU, "\"We're flying to Eilat on Friday.\" It is about:", ["a future plan", "the past", "a habit", "a rule"], 0, "on Friday ← תוכנית לעתיד", ROW("✈️", "🏖️")),
 Q(FU, "Which sentence is a prediction?", ["It will rain", "I'm meeting Dan", "Close the door", "I went home"], 0, "תחזית ← will", ROW("🔮", "☀️")),
]))

C.append(("Future: questions & negatives", [FU], [
 Q(FU, "___ you help me with this heavy box?", ["Will", "Are", "Going", "Have"], 0, "בקשה ← Will you…?", ROW("📦", "🙏")),
 Q(FU, "She isn't ___ to come to the party.", ["going", "will", "go", "goes"], 0, "isn't going to = לא מתכוונת", ROW("🎉", "🙅")),
 Q(FU, "Don't worry. I'm sure you ___ pass the test.", ["will", "are", "going", "did"], 0, "I'm sure + תחזית ← will", ROW("📝", "👍")),
 Q(FU, "Next summer we ___ to visit Greece.", ["are going", "will", "going", "go"], 0, "are going to + פועל", ROW("🇬🇷", "☀️")),
 Q(FU, "Where ___ you going to stay?", ["are", "will", "do", "have"], 0, "you ← are going to", ROW("🏨", "❓")),
 Q(FU, "In 2050, people ___ live on Mars.", ["will", "are going", "did", "have"], 0, "תחזית רחוקה ← will", ROW("🚀", "🔴")),
 Q(FU, "Dana ___ her grandparents next weekend. She's packed already.", ["is visiting", "visited", "was visiting", "has visited"], 0, "סידור לעתיד ← is + ing", ROW("🧳", "👵")),
 Q(FU, "Watch out! You ___ fall!", ["are going to", "will to", "going", "did"], 0, "רואים שזה עומד לקרות ← going to", ROW("⚠️", "🍌")),
 Q(FU, "The forecast says it ___ rain tomorrow.", ["will", "is", "was", "does"], 0, "תחזית ← will", ROW("📺", "🌧️")),
 Q(FU, "I ___ forget your birthday again. I promise!", ["won't", "don't", "am not", "didn't"], 0, "הבטחה ← won't", ROW("🎂", "🤞")),
]))

# ───────────── First conditional ─────────────
C.append(("First conditional: If + present, will", [CI], [
 Q(CI, "If it rains, we ___ stay home.", ["will", "would", "are", "did"], 0, "If + הווה, will + פועל", ROW("🌧️", "🏠")),
 Q(CI, "If you ___ hard, you will pass.", ["study", "will study", "studied", "studies"], 0, "אחרי If ← הווה, בלי will", ROW("📚", "✅")),
 Q(CI, "If she ___ late, she'll lose her place.", ["is", "will be", "was", "be"], 0, "אחרי If ← הווה: is", ROW("⏰", "🏃‍♀️")),
 Q(CI, "If I see Tom, I ___ him.", ["will tell", "telling", "told", "am tell"], 0, "תוצאה ← will + פועל", ROW("👦", "💬")),
 Q(CI, "We'll go to the beach if the weather ___ nice.", ["is", "will be", "was", "be"], 0, "אחרי if ← הווה: is", ROW("🏖️", "☀️")),
 Q(CI, "If you don't hurry, you ___ late.", ["will be", "are", "were", "be"], 0, "תוצאה בעתיד ← will be", ROW("🏃", "⏰")),
 Q(CI, "If you touch the fire, you ___ yourself.", ["will burn", "burned", "burning", "have burn"], 0, "תוצאה ← will + פועל", ROW("🔥", "✋")),
 Q(CI, "If we ___ the bus, we'll take a taxi.", ["miss", "will miss", "missed", "missing"], 0, "אחרי If ← הווה", ROW("🚌", "🚕")),
 Q(CI, "If it ___, we'll go skiing.", ["snows", "will snow", "snowed", "snowing"], 0, "it ← snows (הווה עם s)", ROW("❄️", "⛷️")),
 Q(CI, "If I ___ time tomorrow, I'll call you.", ["have", "will have", "had", "having"], 0, "אחרי If ← הווה: have", ROW("⏰", "📞")),
]))

C.append(("First conditional: results", [CI], [
 Q(CI, "If you eat too much candy, ___.", ["you'll feel sick", "you felt sick", "you feeling sick", "you sick"], 0, "תוצאה ← will + פועל", ROW("🍬", "🤢")),
 Q(CI, "If they win the game, they ___ very happy.", ["will be", "are being", "were", "be"], 0, "תוצאה ← will be", ROW("⚽", "🏆")),
 Q(CI, "She'll be angry if you ___ her bike.", ["break", "will break", "broke", "breaking"], 0, "אחרי if ← הווה", ROW("😠", "🚲")),
 Q(CI, "If I ___ the competition, I'll buy a new bike.", ["win", "will win", "won", "winning"], 0, "אחרי If ← הווה: win", ROW("🏅", "🚲")),
 Q(CI, "If you ___ now, you'll catch the train.", ["leave", "left", "will leave", "leaving"], 0, "אחרי If ← הווה: leave", ROW("🚆", "🏃")),
 Q(CI, "What ___ you do if it rains tomorrow?", ["will", "did", "are", "would"], 0, "תנאי ראשון ← will", ROW("🌧️", "❓")),
 Q(CI, "If we don't recycle, there ___ more rubbish.", ["will be", "is be", "were", "has"], 0, "תוצאה בעתיד ← will be", ROW("♻️", "🗑️")),
 Q(CI, "Plants ___ if you don't water them.", ["will die", "died", "dying", "dies"], 0, "תוצאה ← will + פועל", ROW("🌱", "🚰")),
 Q(CI, "\"If you study, you'll pass.\" Which part is the condition?", ["studying", "passing", "both", "neither"], 0, "התנאי בא אחרי If", ROW("📚", "✅")),
 Q(CI, "If he ___, we'll start without him.", ["doesn't come", "won't come", "didn't come", "not comes"], 0, "אחרי If ← הווה בשלילה", ROW("⏰", "👥")),
]))

# ───────────── Comparatives & superlatives ─────────────
C.append(("Irregular and long adjectives", [CS], [
 Q(CS, "Comparative of good?", ["better", "gooder", "best", "more good"], 0, "good – better – the best", PW("👍", "good → ?")),
 Q(CS, "Superlative of bad?", ["the worst", "the baddest", "the worse", "the most bad"], 0, "bad – worse – the worst", PW("👎", "bad → ?")),
 Q(CS, "This is the ___ day of my life!", ["best", "better", "goodest", "most good"], 0, "the + הכי טוב ← best", ROW("🥳", "🎉")),
 Q(CS, "My cold is ___ today than yesterday.", ["worse", "worst", "badder", "more bad"], 0, "than ← השוואה: worse", ROW("🤧", "📅")),
 Q(CS, "Eilat is ___ from Haifa than Tel Aviv is.", ["farther", "farthest", "more far", "farer"], 0, "far – farther – the farthest", ROW("🗺️", "🚗")),
 Q(CS, "This phone is ___ than that one.", ["more expensive", "expensiver", "most expensive", "the expensive"], 0, "מילה ארוכה ← more + expensive", ROW("📱", "💰")),
 Q(CS, "It's the ___ exciting film I've ever seen.", ["most", "more", "best", "much"], 0, "the most + מילה ארוכה", ROW("🎬", "🤩")),
 Q(CS, "A cheetah is ___ than a horse.", ["faster", "fastest", "more fast", "the faster"], 0, "than ← fast + er", ROW("🐆", "🐎")),
 Q(CS, "Comparative of heavy?", ["heavier", "heavyer", "more heavy", "heaviest"], 0, "y אחרי עיצור ← ier", PW("🏋️", "heavy → ?")),
 Q(CS, "Which pair is irregular?", ["good – better", "tall – taller", "big – bigger", "nice – nicer"], 0, "good – better: לא מוסיפים er", ROW("📏", "❓")),
]))

C.append(("as … as · the most · comparing facts", [CS], [
 Q(CS, "Dan and Ron are both 1.60 m. Dan is ___ Ron.", ["as tall as", "taller than", "the tallest", "as taller as"], 0, "שווים ← as tall as", TXT("Dan: 1.60 m", "Ron: 1.60 m")),
 Q(CS, "Look at the card. My bag isn't ___ yours.", ["as heavy as", "as heavier as", "heavy as", "the heaviest"], 0, "not as … as = לא … כמו", TXT("mine: 3 kg", "yours: 5 kg")),
 Q(CS, "Everest is the ___ mountain in the world.", ["highest", "higher", "most high", "high"], 0, "the + est ← highest", ROW("🏔️", "🌍")),
 Q(CS, "Look at the card. Who is the oldest?", ["Ben", "Ana", "Gil", "all the same"], 0, "15 הוא הגיל הגבוה ביותר", TXT("Ana – 13", "Ben – 15", "Gil – 14")),
 Q(CS, "Look at the card. Who is younger than Gil?", ["Ana", "Ben", "nobody", "both"], 0, "13 קטן מ-14", TXT("Ana – 13", "Ben – 15", "Gil – 14")),
 Q(CS, "The more you practise, the ___ you get.", ["better", "good", "best", "well"], 0, "the more…, the better = ככל ש…", ROW("🎹", "📈")),
 Q(CS, "This test was ___ than the last one.", ["easier", "more easy", "easiest", "easyer"], 0, "easy ← easier", ROW("📝", "😊")),
 Q(CS, "She is the ___ student in our class.", ["most intelligent", "intelligentest", "more intelligent", "most intelligenter"], 0, "מילה ארוכה ← the most", ROW("👩‍🎓", "🏫")),
 Q(CS, "A plane is much ___ than a train.", ["faster", "fast", "fastest", "more fast"], 0, "much + השוואה: much faster", ROW("✈️", "🚆")),
 Q(CS, "Who is ___ person in your family?", ["the youngest", "younger", "youngest than", "the younger"], 0, "מכל המשפחה ← the youngest", ROW("👪", "👶")),
]))

# ───────────── Modals ─────────────
C.append(("must · have to · should", [MD], [
 Q(MD, "You ___ wear a seatbelt. It's the law.", ["must", "mustn't", "might", "don't have to"], 0, "חוק = חובה ← must", ROW("🚗", "👮")),
 Q(MD, "You look tired. You ___ go to bed early.", ["should", "mustn't", "has to", "might"], 0, "עצה ← should", ROW("😫", "🛏️")),
 Q(MD, "You ___ use phones during the test. It's not allowed.", ["mustn't", "must", "should", "have to"], 0, "not allowed = אסור ← mustn't", ROW("📵", "📝")),
 Q(MD, "Tomorrow is Saturday. I ___ get up early.", ["don't have to", "mustn't", "must", "has to"], 0, "אין חובה ← don't have to", ROW("🛌", "⏰")),
 Q(MD, "She ___ wear a uniform at her school.", ["has to", "have to", "must to", "haves to"], 0, "she ← has to", ROW("👧", "👕", "🏫")),
 Q(MD, "\"mustn't\" means:", ["אסור", "לא חייבים", "כדאי", "אולי"], 0, "mustn't = אסור", TXT("mustn't")),
 Q(MD, "\"don't have to\" means:", ["לא חייבים", "אסור", "צריך", "כדאי"], 0, "don't have to = לא חייבים", TXT("don't have to")),
 Q(MD, "Yesterday I ___ stay after school.", ["had to", "must", "have to", "musted"], 0, "עבר של must / have to ← had to", ROW("🏫", "🕓")),
 Q(MD, "It's going to rain. You ___ take an umbrella.", ["should", "shouldn't", "mustn't", "might not"], 0, "עצה ← should", ROW("☂️", "🌧️")),
 Q(MD, "You ___ eat so much sugar. It's bad for you.", ["shouldn't", "should", "have to", "might"], 0, "עצה שלילית ← shouldn't", ROW("🍭", "🦷")),
]))

C.append(("might · advice · rules", [MD], [
 Q(MD, "Take a coat. It ___ be cold later.", ["might", "must", "has to", "should to"], 0, "אפשרות ← might", ROW("🧥", "🌬️")),
 Q(MD, "I'm not sure. I ___ go to the party.", ["might", "must", "have to", "should"], 0, "לא בטוח ← might = אולי", ROW("🎉", "🤷")),
 Q(MD, "\"might\" means:", ["אולי", "חייב", "אסור", "צריך"], 0, "might = אולי", TXT("might")),
 Q(MD, "We ___ go to Eilat, but we haven't decided.", ["might", "must", "have to", "mustn't"], 0, "עוד לא החלטנו ← might", ROW("🏖️", "🤔")),
 Q(MD, "Which modal gives advice?", ["should", "must", "might", "have to"], 0, "should = כדאי ← עצה", ROW("💬", "👍")),
 Q(MD, "Which modal shows possibility?", ["might", "must", "mustn't", "have to"], 0, "might = אולי ← אפשרות", ROW("🎲", "🤷")),
 Q(MD, "You ___ to be 18 to drive a car.", ["have", "must", "should", "might"], 0, "רק have לפני to", ROW("🚗", "🔞")),
 Q(MD, "Do I ___ to bring food on the trip?", ["have", "must", "should", "might"], 0, "Do I have to…? = האם חייב?", ROW("🥪", "🎒")),
 Q(MD, "Look at the sign. You ___ swim here.", ["mustn't", "don't have to", "might", "should"], 0, "השלט אוסר ← mustn't", [("🏊", 20, 52, 34), ("NO SWIMMING", 64, 52, 11)]),
 Q(MD, "My tooth hurts. – You ___ see a dentist.", ["should", "mustn't", "might not", "don't have"], 0, "עצה ← should", ROW("🦷", "😣")),
]))

# ───────────── Quantifiers ─────────────
C.append(("too much · too many · enough · few", [QT], [
 Q(QT, "There are too ___ cars. The traffic is terrible!", ["many", "much", "little", "few"], 0, "cars נספר + יותר מדי ← too many", ROW("🚗", "🚙", "🚕")),
 Q(QT, "I drank too ___ coffee. I can't sleep.", ["much", "many", "few", "little"], 0, "coffee לא נספר ← too much", ROW("☕", "😵")),
 Q(QT, "We don't have ___ chairs for everyone.", ["enough", "much", "a little", "little"], 0, "enough = מספיק", ROW("💺", "👥")),
 Q(QT, "Is there ___ milk in the fridge?", ["any", "many", "a few", "few"], 0, "שאלה + לא נספר ← any", ROW("🥛", "❓")),
 Q(QT, "I have ___ money – only five shekels.", ["a little", "a few", "many", "much"], 0, "money לא נספר + מעט ← a little", [("💰", 28, 52, 36), ("5 ₪", 68, 52, 22)]),
 Q(QT, "Very ___ people came. The hall was almost empty.", ["few", "little", "much", "a lot"], 0, "few = מעט מאוד (נספר)", ROW("🏟️", "👤")),
 Q(QT, "There's ___ water in the bottle. It's empty.", ["no", "any", "some", "many"], 0, "no = אין בכלל", ROW("🍶", "🚫")),
 Q(QT, "___ student got a book – all thirty of them!", ["Every", "All", "Many", "Few"], 0, "Every + יחיד: every student", ROW("📚", "👩‍🎓")),
 Q(QT, "How ___ time do we have?", ["much", "many", "few", "a few"], 0, "time לא נספר ← How much", ROW("⏰", "❓")),
 Q(QT, "I need ___ minutes to get ready – maybe five.", ["a few", "a little", "much", "little"], 0, "minutes נספר + מעט ← a few", ROW("👕", "⏱️")),
]))

C.append(("Countable or uncountable?", [QT], [
 Q(QT, "Which noun is uncountable?", ["information", "book", "idea", "apple"], 0, "information – אין information-s", ROW("ℹ️", "📚")),
 Q(QT, "Which noun is countable?", ["coin", "money", "water", "advice"], 0, "coin – one coin, two coins", [("💰", 24, 52, 36), ("1, 2, 3…", 66, 52, 18)]),
 Q(QT, "Can you give me some ___?", ["advice", "advices", "an advice", "many advice"], 0, "advice לא נספר: בלי s ובלי an", ROW("💬", "🙏")),
 Q(QT, "How ___ hours do you sleep?", ["many", "much", "little", "any"], 0, "hours נספר ← How many", ROW("😴", "🕙")),
 Q(QT, "There isn't ___ sugar left.", ["much", "many", "few", "a few"], 0, "sugar לא נספר ← much", ROW("🍬", "☕")),
 Q(QT, "We have ___ of time. Don't hurry!", ["plenty", "many", "much", "few"], 0, "plenty of = הרבה, יותר ממספיק", ROW("⏳", "😌")),
 Q(QT, "The bus was full. There were too ___ people.", ["many", "much", "little", "few"], 0, "people נספר ← too many", ROW("🚌", "👥")),
 Q(QT, "I'd like ___ bread, please.", ["some", "many", "a few", "few"], 0, "בקשה + לא נספר ← some", ROW("🍞", "🙏")),
 Q(QT, "There are ___ apples on the table.", ["a few", "a little", "much", "no"], 0, "שלושה תפוחים = a few", COUNT(("🍎", 3))),
 Q(QT, "___ of my parents are teachers.", ["Both", "Each", "Every", "Either"], 0, "שני ההורים ← Both … are", ROW("👨‍🏫", "👩‍🏫")),
]))

# ───────────── Relative pronouns ─────────────
C.append(("who · which · that", [RP], [
 Q(RP, "The girl ___ lives next door is my friend.", ["who", "which", "where", "what"], 0, "אדם ← who", ROW("👧", "🏠")),
 Q(RP, "This is the book ___ I told you about.", ["which", "who", "where", "whose"], 0, "דבר ← which", ROW("📕", "💬")),
 Q(RP, "A dentist is a person ___ looks after your teeth.", ["who", "which", "where", "when"], 0, "אדם ← who", ROW("🦷", "😁")),
 Q(RP, "I lost the watch ___ my dad gave me.", ["that", "who", "where", "whose"], 0, "דבר ← that / which", ROW("⌚", "🎁")),
 Q(RP, "The cake ___ she made was delicious.", ["which", "who", "whom", "where"], 0, "דבר ← which", ROW("🎂", "😋")),
 Q(RP, "For people we use:", ["who", "which", "where", "when"], 0, "who ← אנשים", ROW("👩", "👨")),
 Q(RP, "For things and animals we use:", ["which", "who", "whose", "when"], 0, "which ← דברים ובעלי חיים", ROW("📦", "🐈")),
 Q(RP, "\"that\" can be used for:", ["people and things", "only people", "only things", "only places"], 0, "that ← גם אנשים וגם דברים", TXT("that")),
 Q(RP, "The man ___ car was stolen called the police.", ["whose", "who", "which", "that"], 0, "של מי ← whose", ROW("🚗", "👮")),
 Q(RP, "Look! There's the dog ___ bit me!", ["that", "what", "where", "when"], 0, "בעל חיים ← that / which", ROW("🐕", "😣")),
]))

C.append(("Relative clauses: joining ideas", [RP], [
 Q(RP, "I have a friend ___ speaks four languages.", ["who", "which", "where", "what"], 0, "friend = אדם ← who", ROW("👦", "🗣️")),
 Q(RP, "We saw a film ___ was very scary.", ["that", "who", "where", "whose"], 0, "film = דבר ← that", ROW("🎬", "😱")),
 Q(RP, "A machine which washes clothes is a ___.", ["washing machine", "dishwasher", "fridge", "oven"], 0, "מכונה שמכבסת בגדים = washing machine", ROW("👕", "🧼")),
 Q(RP, "Water is something ___ we all need.", ["that", "who", "where", "whose"], 0, "something = דבר ← that", ROW("💧", "🚰")),
 Q(RP, "\"The boy which won is my brother.\" Fix it:", ["which → who", "boy → boys", "won → win", "is → are"], 0, "boy = אדם ← who", ROW("🏆", "👦")),
 Q(RP, "The pizza ___ we ordered was cold.", ["that", "who", "whose", "where"], 0, "pizza = דבר ← that", ROW("🍕", "🥶")),
 Q(RP, "Who is the teacher ___ teaches you English?", ["that", "which", "whose", "where"], 0, "אדם ← that / who", ROW("👩‍🏫", "🔤")),
 Q(RP, "Do you know anyone ___ can fix computers?", ["who", "which", "whose", "where"], 0, "anyone = אדם ← who", ROW("💻", "🔧")),
 Q(RP, "These are the shoes ___ I bought yesterday.", ["which", "who", "whose", "where"], 0, "shoes = דברים ← which", ROW("👟", "🛍️")),
 Q(RP, "My aunt, ___ lives in London, is a nurse.", ["who", "that", "which", "where"], 0, "בין פסיקים, אדם ← who (לא that)", ROW("👩‍⚕️", "🇬🇧")),
]))

# ───────────── Paragraphs & connectors ─────────────
C.append(("Writing a paragraph", [WR], [
 Q(WR, "Which sentence gives the main idea of a paragraph?", ["topic sentence", "supporting sentence", "concluding sentence", "a title"], 0, "משפט הנושא = הרעיון המרכזי", ROW("📄", "💡")),
 Q(WR, "Sentences that give details and examples are:", ["supporting sentences", "topic sentences", "titles", "questions"], 0, "משפטים תומכים = פרטים ודוגמאות", ROW("📄", "🔍")),
 Q(WR, "The last sentence, which sums up, is the:", ["concluding sentence", "topic sentence", "supporting sentence", "first sentence"], 0, "משפט הסיכום בסוף הפסקה", ROW("📄", "🏁")),
 Q(WR, "\"In addition, dogs protect our homes.\" This is a:", ["supporting sentence", "topic sentence", "concluding sentence", "title"], 0, "מוסיף סיבה ← משפט תומך", ROW("🐕", "🏠")),
 Q(WR, "\"Dogs make great pets.\" This is a:", ["topic sentence", "supporting sentence", "concluding sentence", "question"], 0, "רעיון כללי בהתחלה ← משפט נושא", ROW("🐕", "❤️")),
 Q(WR, "\"To sum up, dogs are wonderful pets.\" This is a:", ["concluding sentence", "topic sentence", "supporting sentence", "title"], 0, "To sum up ← משפט סיכום", ROW("🐕", "🏁")),
 Q(WR, "Which phrase introduces an example?", ["for example", "however", "therefore", "although"], 0, "for example = לדוגמה", ROW("📄", "👉")),
 Q(WR, "Which phrase starts a conclusion?", ["In conclusion", "For example", "In addition", "However"], 0, "In conclusion = לסיכום", ROW("📄", "🏁")),
 Q(WR, "Which word adds another point?", ["Moreover", "However", "Although", "Therefore"], 0, "Moreover = יתרה מזו, בנוסף", ROW("📄", "➕")),
 Q(WR, "Put the paragraph parts in order:", ["A, C, B", "A, B, C", "C, A, B", "B, C, A"], 0, "נושא ← פרטים ← סיכום", TXT("A = topic", "B = conclusion", "C = details")),
]))

C.append(("although · however · therefore · in addition", [WR], [
 Q(WR, "It was raining. ___, we went to the beach.", ["However", "Therefore", "Although", "Because"], 0, "ניגוד בין שני משפטים ← However", ROW("🌧️", "🏖️")),
 Q(WR, "He didn't study. ___, he failed the test.", ["Therefore", "However", "Although", "In addition"], 0, "תוצאה ← Therefore = לכן", ROW("📚", "❌")),
 Q(WR, "___ it was cold, she didn't wear a coat.", ["Although", "However", "Therefore", "In addition"], 0, "למרות ש… ← Although", ROW("🥶", "🧥")),
 Q(WR, "Swimming is fun. ___, it keeps you healthy.", ["In addition", "However", "Although", "Therefore"], 0, "מוסיפים יתרון ← In addition", ROW("🏊", "💪")),
 Q(WR, "\"therefore\" means:", ["לכן", "למרות ש", "בנוסף", "אולם"], 0, "therefore = לכן", TXT("therefore")),
 Q(WR, "\"although\" means:", ["למרות ש", "לכן", "בנוסף", "אולם"], 0, "although = למרות ש", TXT("although")),
 Q(WR, "\"in addition\" means:", ["בנוסף", "לכן", "אולם", "למרות ש"], 0, "in addition = בנוסף", TXT("in addition")),
 Q(WR, "The roads were icy. ___, the school was closed.", ["Therefore", "However", "Although", "But"], 0, "תוצאה ← Therefore", ROW("❄️", "🛣️", "🏫")),
 Q(WR, "She is rich. ___, she isn't happy.", ["However", "Therefore", "In addition", "Because"], 0, "ניגוד ← However", ROW("💰", "😔")),
 Q(WR, "Which connector shows a result?", ["therefore", "although", "however", "in addition"], 0, "therefore = לכן ← תוצאה", ROW("➡️", "✅")),
]))

# ───────────── Words: environment & technology ─────────────
C.append(("The environment", [VE], [
 Q(VE, "בצורת = ?", ["drought", "flood", "storm", "desert"], 0, "בצורת = drought", ROW("🏜️", "☀️")),
 Q(VE, "שיטפון, הצפה = ?", ["flood", "drought", "fire", "wave"], 0, "שיטפון = flood", ROW("🌊", "🏠")),
 Q(VE, "Dinosaurs are ___ – there are none left.", ["extinct", "endangered", "alive", "wild"], 0, "נכחדו = extinct", ROW("🦕", "🦖")),
 Q(VE, "Animals that live free in nature are called ___.", ["wildlife", "pets", "farm animals", "toys"], 0, "חיות בר = wildlife", ROW("🦌", "🦉", "🦊")),
 Q(VE, "בית גידול (של בעלי חיים) = ?", ["habitat", "habit", "harbour", "hobby"], 0, "בית גידול = habitat", ROW("🐸", "🌿")),
 Q(VE, "משאבים (מים, נפט, עצים) = ?", ["resources", "results", "reasons", "rules"], 0, "משאבים = resources", ROW("💧", "🛢️", "🌲")),
 Q(VE, "Sun and wind energy never run out. They are ___.", ["renewable", "extinct", "harmful", "polluted"], 0, "מתחדשת = renewable", ROW("☀️", "💨")),
 Q(VE, "אסון = ?", ["disaster", "danger", "damage", "desert"], 0, "אסון = disaster", ROW("🌋", "🆘")),
 Q(VE, "Smoke from factories can ___ our lungs.", ["harm", "help", "save", "heal"], 0, "לפגוע = harm", ROW("🏭", "💨")),
 Q(VE, "Many animals can't ___ without water.", ["survive", "survey", "serve", "supply"], 0, "לשרוד = survive", ROW("🐪", "💧")),
]))

C.append(("Science & technology", [VE], [
 Q(VE, "מחקר = ?", ["research", "result", "report", "rescue"], 0, "מחקר = research", ROW("🔬", "📊")),
 Q(VE, "להמציא = ?", ["invent", "discover", "prevent", "explore"], 0, "להמציא = invent", ROW("💡", "⚙️")),
 Q(VE, "לגלות (משהו שכבר קיים) = ?", ["discover", "invent", "develop", "design"], 0, "לגלות = discover", ROW("🔭", "⭐")),
 Q(VE, "Edison ___ the light bulb.", ["invented", "discovered", "explored", "reported"], 0, "המציא דבר חדש = invented", ROW("💡", "👨‍🔬")),
 Q(VE, "מקוון, באינטרנט = ?", ["online", "offline", "on time", "outside"], 0, "באינטרנט = online", ROW("💻", "🌐")),
 Q(VE, "תוכנה = ?", ["software", "hardware", "keyboard", "network"], 0, "תוכנה = software", ROW("💻", "💾")),
 Q(VE, "A machine that does human jobs is a ___.", ["robot", "rocket", "robber", "ribbon"], 0, "רובוט = robot", ROW("🤖", "🏭")),
 Q(VE, "Without Wi-Fi I can't ___ to the internet.", ["connect", "collect", "correct", "protect"], 0, "להתחבר = connect", ROW("📶", "💻")),
 Q(VE, "לפתח (מוצר, טכנולוגיה) = ?", ["develop", "deliver", "destroy", "describe"], 0, "לפתח = develop", ROW("👩‍💻", "📱")),
 Q(VE, "A small program on your phone is an ___.", ["app", "ape", "apple", "aim"], 0, "יישומון = app", ROW("📱", "👆")),
]))

# ───────────── Words: health & travel ─────────────
C.append(("Health", [VH], [
 Q(VH, "בריא = ?", ["healthy", "wealthy", "heavy", "happy"], 0, "בריא = healthy", ROW("🥗", "💪")),
 Q(VH, "Fruit and vegetables are part of a healthy ___.", ["diet", "diary", "dirt", "deal"], 0, "תזונה = diet", ROW("🍎", "🥦")),
 Q(VH, "פעילות גופנית = ?", ["exercise", "exam", "exit", "example"], 0, "פעילות גופנית = exercise", ROW("🏃", "🚴")),
 Q(VH, "I have a ___. My head hurts.", ["headache", "toothache", "stomachache", "backache"], 0, "כאב ראש = headache", ROW("🤕", "💊")),
 Q(VH, "The doctor gave me ___ for my cough.", ["medicine", "magazine", "machine", "message"], 0, "תרופה = medicine", ROW("👨‍⚕️", "💊")),
 Q(VH, "פצוע = ?", ["injured", "invited", "involved", "invented"], 0, "פצוע = injured", ROW("🤕", "🚑")),
 Q(VH, "חום (כשחולים) = ?", ["fever", "flavor", "favor", "feather"], 0, "חום גבוה = fever", ROW("🤒", "🌡️")),
 Q(VH, "Smoking is ___ for your health.", ["harmful", "helpful", "healthy", "careful"], 0, "מזיק = harmful", ROW("🚬", "🚭")),
 Q(VH, "לנוח = ?", ["rest", "test", "rush", "race"], 0, "לנוח = rest", ROW("🛋️", "😌")),
 Q(VH, "מחלה = ?", ["disease", "decrease", "desert", "degree"], 0, "מחלה = disease", ROW("🦠", "🤒")),
]))

C.append(("Travel", [VH], [
 Q(VH, "להזמין מראש (חדר, כרטיס) = ?", ["book", "borrow", "bring", "build"], 0, "להזמין מראש = to book", ROW("🏨", "🎫")),
 Q(VH, "זר, של ארץ אחרת = ?", ["foreign", "forest", "famous", "friendly"], 0, "זר = foreign", ROW("🌍", "🗣️")),
 Q(VH, "At the airport: Departures and ___.", ["Arrivals", "Arrives", "Passengers", "Flights"], 0, "נחיתות, הגעות = Arrivals", ROW("🛫", "🛬")),
 Q(VH, "המראה, יציאה = ?", ["departure", "delay", "destination", "direction"], 0, "יציאה = departure", ROW("🛫", "🕒")),
 Q(VH, "Our ___ showed us the old city.", ["guide", "guest", "gate", "goal"], 0, "מדריך טיולים = guide", ROW("🚶", "🏰")),
 Q(VH, "We went ___ – we saw museums and palaces.", ["sightseeing", "shopping", "sailing", "skiing"], 0, "סיור באתרים = sightseeing", ROW("📸", "🏛️")),
 Q(VH, "לחקור, לסייר = ?", ["explore", "explain", "export", "expect"], 0, "לחקור = explore", ROW("🧭", "🗺️")),
 Q(VH, "גבול (בין מדינות) = ?", ["border", "order", "board", "harbour"], 0, "גבול = border", ROW("🛂", "🚧")),
 Q(VH, "נוף = ?", ["view", "voice", "visit", "video"], 0, "נוף = view", ROW("🏞️", "👀")),
 Q(VH, "מקומי = ?", ["local", "lovely", "lonely", "loud"], 0, "מקומי = local", ROW("🏘️", "🧑")),
]))

# ───────────── Words: media & feelings ─────────────
C.append(("Media", [VM], [
 Q(VM, "פרסומת = ?", ["advertisement", "announcement", "achievement", "appointment"], 0, "פרסומת = advertisement", ROW("📺", "🛍️")),
 Q(VM, "Instagram and TikTok are social ___.", ["media", "medicine", "meetings", "machines"], 0, "רשתות חברתיות = social media", ROW("📱", "👍")),
 Q(VM, "כתבה (בעיתון) = ?", ["article", "artist", "arrival", "angle"], 0, "כתבה = article", ROW("📰", "✍️")),
 Q(VM, "The singer gave an ___ to a journalist.", ["interview", "invention", "invitation", "instruction"], 0, "ראיון = interview", ROW("🎤", "📰")),
 Q(VM, "כותרת ראשית (בעיתון) = ?", ["headline", "headache", "deadline", "hairline"], 0, "כותרת = headline", ROW("📰", "❗")),
 Q(VM, "Millions watched the final ___ on TV, as it happened.", ["live", "alive", "life", "lively"], 0, "בשידור חי = live", ROW("📺", "⚽")),
 Q(VM, "מגיש, מנחה (בטלוויזיה) = ?", ["presenter", "president", "present", "prisoner"], 0, "מגיש = presenter", ROW("📺", "🎙️")),
 Q(VM, "Fake news is news that is ___.", ["not true", "very new", "very long", "funny"], 0, "fake = מזויף, לא אמיתי", ROW("📰", "❌")),
 Q(VM, "צופים (בטלוויזיה) = ?", ["viewers", "readers", "listeners", "writers"], 0, "צופים = viewers", ROW("📺", "👀")),
 Q(VM, "A website where you share your thoughts is a ___.", ["blog", "bag", "bug", "plug"], 0, "יומן ברשת = blog", ROW("💻", "✍️")),
]))

C.append(("More feelings", [VM], [
 Q(VM, "I found my lost dog! I feel so ___.", ["relieved", "jealous", "bored", "ashamed"], 0, "הוקל לי = relieved", ROW("🐕", "😌")),
 Q(VM, "מתוסכל = ?", ["frustrated", "frightened", "friendly", "famous"], 0, "מתוסכל = frustrated", ROW("😤", "🧩")),
 Q(VM, "סקרן = ?", ["curious", "careful", "cruel", "cheerful"], 0, "סקרן = curious", ROW("🧐", "📦")),
 Q(VM, "The noise all night made me ___.", ["annoyed", "relaxed", "proud", "grateful"], 0, "מעוצבן = annoyed", ROW("🔊", "😠")),
 Q(VM, "מבוהל מאוד = ?", ["terrified", "terrific", "satisfied", "surprised"], 0, "מבוהל = terrified (terrific = נהדר)", ROW("😱", "👻")),
 Q(VM, "I got 100 on the test. I'm ___ with my work.", ["satisfied", "frustrated", "ashamed", "anxious"], 0, "מרוצה = satisfied", ROW("📝", "😊")),
 Q(VM, "He cheated in the game and felt ___.", ["ashamed", "proud", "curious", "relieved"], 0, "מתבייש = ashamed", ROW("🎲", "😳")),
 Q(VM, "חרד, מודאג = ?", ["anxious", "angry", "ancient", "amazing"], 0, "חרד = anxious", ROW("😰", "📝")),
 Q(VM, "עליז, שמח = ?", ["cheerful", "careful", "colourful", "useful"], 0, "עליז = cheerful", ROW("😄", "🌻")),
 Q(VM, "I couldn't believe the news. I was ___.", ["shocked", "bored", "calm", "relaxed"], 0, "בהלם = shocked", ROW("😲", "📰")),
]))

# ───────────── Unseen ─────────────
P1 = """
Are Screens Stealing Your Sleep?

Most teenagers need between eight and ten hours of sleep every night. However, a recent survey found that many teens sleep only six or seven hours. Why is this happening? Experts say that one of the main reasons is the phone next to the bed.

Phones, tablets and computers give off blue light. This light tells the brain that it is still daytime, so the body produces less melatonin, the natural chemical that makes us feel sleepy. As a result, it takes longer to fall asleep. In addition, many teens keep checking messages and videos late at night, and each new message wakes the brain up again.

Lack of sleep can affect your health in many ways. Teens who don't sleep enough often find it hard to concentrate at school. They may feel moody or anxious, and they are more likely to get sick, because the body repairs itself during sleep.

So what can you do? First, stop using screens at least one hour before bedtime. Read a book or listen to quiet music instead. Second, leave your phone in another room and use a real alarm clock. Finally, try to go to bed at the same time every night, even at weekends.

Small changes like these can make a big difference. After a week or two, you will probably notice that you feel more awake, more cheerful and readier to learn.
"""

C.append(("📖 Unseen: Screens and Sleep", [UN], [
 Q(UN, "What is the article mainly about?", ["screens and sleep", "buying phones", "school exams", "healthy food"], 0, "כל הקטע: מסכים פוגעים בשינה", ROW("📱", "😴")),
 Q(UN, "How many hours of sleep do teens need?", ["8–10 hours", "6–7 hours", "5 hours", "12 hours"], 0, "between eight and ten hours", ROW("🛏️", "🕙")),
 Q(UN, "What does blue light tell the brain?", ["it is daytime", "it is night", "it is cold", "it is late"], 0, "tells the brain that it is still daytime", ROW("📱", "🧠")),
 Q(UN, "In paragraph 2, \"produces\" means:", ["מייצר", "מאבד", "שומר", "מודד"], 0, "the body produces = הגוף מייצר", TXT("produces")),
 Q(UN, "When does the body repair itself?", ["during sleep", "during school", "after meals", "in the morning"], 0, "the body repairs itself during sleep", ROW("😴", "🔧")),
 Q(UN, "Where should your phone be at night?", ["in another room", "next to you", "under the pillow", "in your hand"], 0, "leave your phone in another room", ROW("📱", "🚪")),
 Q(UN, "\"Lack of sleep\" means:", ["not enough sleep", "too much sleep", "deep sleep", "a short dream"], 0, "lack = חוסר", TXT("lack of sleep")),
 Q(UN, "Tom sleeps six hours a night. He probably:", ["can't concentrate", "feels very fresh", "never gets sick", "needs less sleep"], 0, "מי שלא ישן מספיק – מתקשה להתרכז", ROW("👦", "😫")),
 Q(UN, "Which tip is NOT in the article?", ["drink more water", "read a book", "use alarm clock", "fixed bedtime"], 0, "על שתיית מים לא כתוב בקטע", ROW("💡", "❓")),
 Q(UN, "The writer's main purpose is to:", ["give advice", "tell a story", "sell phones", "make us laugh"], 0, "הכותב נותן עצות לשינה טובה", ROW("✍️", "😴")),
], P1))

P2 = """
Greetings from Iceland

Dear Grandma,

Greetings from Iceland! We arrived in Reykjavik four days ago, and I have already filled half of my notebook with notes and drawings.

Iceland is not like anywhere I have ever been. The landscape looks like another planet: black sand beaches, huge glaciers and hot springs that steam in the cold air. On Tuesday we went sightseeing with a local guide called Einar. He told us that Iceland has more than 100 volcanoes, and some of them are still active. I was a little nervous when we walked near one, but Einar said it was safe.

Yesterday was the best day of the trip so far. We were swimming in a natural hot pool when it started to snow. Can you imagine? Warm water all around us and snowflakes on our heads! Dad laughed so much that he almost lost his glasses.

The only problem is the food. Everything is very expensive, and my brother Ben refuses to try the fish soup. Mom says he will be hungry until we go home.

Tomorrow we are going to take a boat trip to see whales. Einar says we might not see any, because they don't always come close to the shore. I really hope we are lucky.

I miss you and your cooking! I'll show you all my photos when we get back next Sunday.

Love,
Maya
"""

C.append(("📖 Unseen: Greetings from Iceland", [UN], [
 Q(UN, "What kind of text is this?", ["a letter", "a news article", "an advertisement", "a poem"], 0, "Dear Grandma… Love, Maya ← מכתב", ROW("✉️", "🇮🇸")),
 Q(UN, "How long has the family been in Iceland?", ["four days", "a week", "two days", "a month"], 0, "We arrived four days ago", ROW("📅", "🇮🇸")),
 Q(UN, "What does Maya compare the landscape to?", ["another planet", "a desert", "a big city", "the sea"], 0, "looks like another planet", ROW("🏔️", "🌋")),
 Q(UN, "Who is Einar?", ["a local guide", "Maya's uncle", "a fisherman", "a pilot"], 0, "a local guide called Einar", ROW("🚶", "🗺️")),
 Q(UN, "How did Maya feel near the volcano?", ["a little nervous", "very bored", "very angry", "proud"], 0, "I was a little nervous", ROW("🌋", "😬")),
 Q(UN, "What happened while they were swimming?", ["it started snowing", "Dad lost glasses", "they saw whales", "a volcano erupted"], 0, "We were swimming when it started to snow", ROW("♨️", "❄️")),
 Q(UN, "Why will Ben probably be hungry?", ["won't eat fish", "no food left", "he is sick", "lost his money"], 0, "Ben refuses to try the fish soup", ROW("🍲", "🙅")),
 Q(UN, "\"active\" volcanoes are volcanoes that:", ["can still erupt", "are very old", "are under snow", "are very small"], 0, "פעיל = עדיין יכול להתפרץ", ROW("🌋", "🔥")),
 Q(UN, "Einar says they ___ see whales.", ["might not", "will surely", "must", "have already"], 0, "we might not see any = אולי לא", ROW("🐋", "⛵")),
 Q(UN, "Why did Maya write to Grandma?", ["to share news", "to get money", "to complain", "to invite her"], 0, "היא מספרת לסבתא על הטיול", ROW("✍️", "👵")),
], P2))

P3 = """
Where Have All the Bees Gone?

When people think of bees, they often think of honey or of painful stings. However, bees do a much more important job. As they fly from flower to flower, they carry pollen, which plants need in order to produce fruit and seeds. Scientists say that about one third of the food we eat depends on bees and other insects that do this work. Without them, apples, almonds and many vegetables would become rare and expensive.

Unfortunately, the number of bees has dropped in many parts of the world. There are several reasons for this. First, farmers use chemicals to kill harmful insects, but these chemicals also harm bees. Second, cities and farms have replaced many fields of wild flowers, so bees have less food. In addition, climate change has made some seasons warmer and drier, and flowers sometimes open before the bees are ready.

The good news is that everyone can help. You don't need a big garden. Plant a few flowers on your balcony or in a pot by the window. Choose local plants, because local bees know them best. Avoid chemical sprays, and put out a small dish of water on hot days.

Bees are tiny, but their work is enormous. If we protect them, they will continue to protect our food.
"""

C.append(("📖 Unseen: Where Have All the Bees Gone?", [UN], [
 Q(UN, "This article is mainly about:", ["why bees matter", "making honey", "dangerous insects", "growing apples"], 0, "הקטע מסביר למה הדבורים חשובות", ROW("🐝", "🌸")),
 Q(UN, "What do bees carry from flower to flower?", ["pollen", "honey", "water", "seeds"], 0, "they carry pollen", ROW("🐝", "🌼")),
 Q(UN, "How much of our food depends on bees and insects?", ["about one third", "about half", "almost all", "very little"], 0, "about one third of the food", ROW("🍎", "🥕", "🐝")),
 Q(UN, "Which is NOT a reason for fewer bees?", ["too much honey", "chemicals", "fewer wild flowers", "climate change"], 0, "על דבש לא כתוב שזו סיבה", ROW("🐝", "📉")),
 Q(UN, "\"dropped\" (paragraph 2) means:", ["ירד", "נפל", "גדל", "נשבר"], 0, "the number has dropped = המספר ירד", TXT("has dropped")),
 Q(UN, "Without bees, apples would become:", ["more expensive", "cheaper", "bigger", "sweeter"], 0, "would become rare and expensive", ROW("🍎", "💰")),
 Q(UN, "Why should you choose local plants?", ["bees know them", "they are cheaper", "they grow faster", "they smell nicer"], 0, "local bees know them best", ROW("🌻", "🐝")),
 Q(UN, "\"enormous\" in the last paragraph means:", ["very big", "very small", "very fast", "very old"], 0, "tiny ≠ enormous ← ענק", TXT("enormous")),
 Q(UN, "The writer wants readers to:", ["help protect bees", "buy more honey", "avoid bees", "become farmers"], 0, "everyone can help ← לעזור לדבורים", ROW("🐝", "🛡️")),
 Q(UN, "What can you put out for bees on hot days?", ["water", "chemical sprays", "some honey", "a big garden"], 0, "put out a small dish of water", ROW("☀️", "🐝")),
], P3))

P4 = """
The Story That Wasn't True

Last month, Omer saw a video on social media that shocked him. It showed a huge shark swimming down a city street after a flood. The headline said: "Shark in the city! Stay indoors!" The video already had two million views, so Omer was sure it was real. Without thinking, he shared it with all his friends.

The next morning, his sister Shira, who studies journalism, saw the video on his phone. "Did you check this before you shared it?" she asked. Omer admitted that he hadn't.

Shira showed him how to check. First, they looked for the story on news websites, but none of them reported it. Then they searched for the photo online and discovered that the shark came from a different picture, taken years earlier in the ocean. Someone had put the two pictures together with a computer program.

Omer felt embarrassed. "Millions of people believed it," he said. "Why would anyone make something like this?" Shira explained that some people create fake stories to get attention, and others do it to make money from advertisements on their pages.

That evening, Omer sent another message to his friends. "Sorry, the shark video was fake," he wrote. "Before you share something, check if a reliable news website has reported it, and look at where the picture came from."

Now Omer always stops and thinks before he clicks "share".
"""

C.append(("📖 Unseen: The Story That Wasn't True", [UN], [
 Q(UN, "Where was the shark in the video?", ["in a street", "in the ocean", "in a pool", "in a river"], 0, "swimming down a city street", ROW("🦈", "🏙️")),
 Q(UN, "Why did Omer believe the video?", ["millions watched it", "Shira said so", "news reported it", "he saw sharks"], 0, "two million views ← חשב שזה אמיתי", ROW("📱", "👀")),
 Q(UN, "Who is Shira?", ["Omer's sister", "a news presenter", "Omer's teacher", "a journalist friend"], 0, "his sister Shira, who studies journalism", ROW("👧", "📰")),
 Q(UN, "Where did the shark picture really come from?", ["an older picture", "a news website", "a flood video", "Omer's phone"], 0, "a different picture, taken years earlier", ROW("🦈", "🌊")),
 Q(UN, "\"reliable\" means:", ["שאפשר לסמוך עליו", "מהיר", "מפורסם", "חדש"], 0, "reliable website = אתר אמין", TXT("reliable")),
 Q(UN, "How did Omer feel when he learned the truth?", ["embarrassed", "proud", "bored", "relieved"], 0, "Omer felt embarrassed", ROW("👦", "😳")),
 Q(UN, "Why do some people make fake stories?", ["to get attention", "to help others", "to learn English", "to find sharks"], 0, "to get attention or make money", ROW("📢", "💰")),
 Q(UN, "What did Omer learn?", ["check before sharing", "never use phones", "sharks are dangerous", "news is fake"], 0, "עוצרים ובודקים לפני ששולחים", ROW("🔍", "📤")),
 Q(UN, "The writer's main purpose is to:", ["teach a lesson", "sell a program", "describe sharks", "describe a city"], 0, "הסיפור מלמד לבדוק חדשות", ROW("✍️", "💡")),
 Q(UN, "\"views\" (paragraph 1) means:", ["times watched", "nice places", "opinions", "pictures"], 0, "two million views = נצפה שני מיליון פעם", TXT("2,000,000 views")),
], P4))

# ───────────── Review ─────────────
C.append(("חזרה כללית", [PF, PV, PP, FU, CI, CS, MD, QT, RP, WR, VE, VH, VM], [
 Q(PF, "Have you done your homework ___?", ["yet", "since", "ago", "never"], 0, "בשאלה בסוף המשפט ← yet", ROW("📓", "❓")),
 Q(PF, "Third form (V3) of take?", ["taken", "took", "taked", "taking"], 0, "take – took – taken", PW("✋", "take → ?")),
 Q(PV, "I ___ this book three times. I love it!", ["have read", "has read", "am reading", "reading"], 0, "ניסיון עד עכשיו ← have + V3", ROW("📖", "❤️")),
 Q(PV, "We ___ the museum last Sunday.", ["visited", "have visited", "visit", "has visited"], 0, "last Sunday ← Past Simple", ROW("🏛️", "📅")),
 Q(PP, "What ___ you doing when I called?", ["were", "was", "did", "are"], 0, "you ← were + ing", ROW("📞", "❓")),
 Q(FU, "I've decided. I ___ learn to play the drums.", ["am going to", "will to", "going", "did"], 0, "החלטה מראש ← going to", ROW("🥁", "🎶")),
 Q(CI, "If you ___ me, I'll help you.", ["call", "will call", "called", "calling"], 0, "אחרי If ← הווה", ROW("📞", "🤝")),
 Q(CS, "This is the ___ pizza in town!", ["best", "better", "goodest", "most good"], 0, "the best = הכי טוב", ROW("🍕", "🏆")),
 Q(CS, "My room is ___ than my sister's room.", ["bigger", "biger", "more big", "biggest"], 0, "big ← bigger (מכפילים g)", ROW("🛏️", "🏠")),
 Q(MD, "It's very late. We ___ go home now.", ["should", "might not", "don't have to", "mustn't"], 0, "עצה ← should", ROW("🌙", "🏠")),
 Q(QT, "How ___ brothers do you have?", ["many", "much", "little", "a little"], 0, "brothers נספר ← How many", ROW("👦", "👦", "❓")),
 Q(RP, "The woman ___ helped us was very kind.", ["who", "which", "where", "whose"], 0, "אדם ← who", ROW("👩", "🤝")),
 Q(WR, "I was tired. ___, I finished my work.", ["However", "Therefore", "In addition", "Because"], 0, "ניגוד ← However", ROW("😴", "✅")),
 Q(WR, "It was late, ___ we took a taxi.", ["so", "although", "however", "because"], 0, "תוצאה בתוך המשפט ← so", ROW("🌙", "🚕")),
 Q(VE, "Polar bears may lose their ___ when ice melts.", ["habitat", "habit", "hobby", "harbour"], 0, "בית הגידול של הדובים = הקרח", ROW("🐻", "❄️", "💧")),
 Q(VE, "Scientists do ___ to find new medicines.", ["research", "rescue", "results", "reports"], 0, "מחקר = research", ROW("🔬", "💊")),
 Q(VH, "Ask a ___ – he was born here and knows the way.", ["local", "tourist", "guest", "foreigner"], 0, "תושב המקום = a local", ROW("🗺️", "🧓")),
 Q(VH, "I have a fever. I need to ___ in bed.", ["rest", "race", "rush", "test"], 0, "לנוח במיטה = rest", ROW("🤒", "🛏️")),
 Q(VM, "I read an interesting ___ in the newspaper.", ["article", "artist", "arrival", "angle"], 0, "כתבה = article", ROW("📰", "👓")),
 Q(VM, "Before the big test, I felt ___.", ["anxious", "cheerful", "relieved", "satisfied"], 0, "לפני מבחן ← חרד = anxious", ROW("📝", "😰")),
]))

# station type on the map
KINDS = {c[0]: "gram" for c in C if c[1][0] in (PF, PV, PP, FU, CI, CS, MD, QT, RP, WR)}
KINDS.update({c[0]: "word" for c in C if c[1][0] in (VE, VH, VM)})
KINDS.update({c[0]: "read" for c in C if c[1][0] == UN})
KINDS["חזרה כללית"] = "rev"

# Band II words taught in this set – every one must be a correct answer somewhere (build_set.py checks).
WORD_LIST = """drought|flood|extinct|wildlife|habitat|resources|renewable|disaster|harm|survive|
research|invent|discover|online|software|robot|connect|develop|app|
healthy|diet|exercise|headache|medicine|injured|fever|harmful|rest|disease|
book|foreign|arrival|departure|guide|sightseeing|explore|border|view|local|
advertisement|media|article|interview|headline|live|presenter|viewer|blog|
relieved|frustrated|curious|annoyed|terrified|satisfied|ashamed|anxious|cheerful|shocked|embarrassed""".replace("\n", "").split("|")
