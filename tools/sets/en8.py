# Practice set: English, grade 8 (כיתה ח') – a step above grade 7 (Band II):
# Present Perfect (have/has + V3, ever/never/already/yet, since/for), Past Simple vs Present Perfect,
# Past Progressive with when / while, future forms (will / going to / present progressive for plans),
# the first conditional, comparatives & superlatives (irregular, as … as), modals (must / have to / should / might),
# quantifiers, relative pronouns (who / which / that), the passive (Present / Past Simple), used to, writing a paragraph and connectors,
# Band II vocabulary (environment & technology, health & travel, media & feelings), word building (un- / dis- / -ful / -less / -tion) and four longer Unseen passages.
# Grade 7 topics come back here a step higher; no question repeats one from en3–en7.
# Organised by fine topics (≈20 questions each) so a parent can tick only what the test covers.
# Run: python3 -I tools/build_set.py tools/sets/en8.py
import re

PF, PV, PP = "Present Perfect", "Past Simple or Present Perfect?", "Past Progressive · when / while"
FU, CI, CS = "Future: will · going to · plans", "First conditional: If … will", "Comparatives & superlatives"
MD, QT, RP = "Modals: must · have to · should · might", "Quantifiers", "Relative pronouns: who · which · that"
WR = "Paragraphs & connectors"
VE, VH, VM = "Words: environment & technology", "Words: health & travel", "Words: media & feelings"
UN = "Unseen"
PS, UT, WF = "Passive: is made · was built", "used to", "Word building: un- · -ful · -tion"

SET = dict(name="English ח'", grade=7, subject="אנגלית",
           title="Present Perfect · Conditionals · Passive · used to · Band II · Unseen",
           desc="אנגלית לכיתה ח': Present Perfect, עבר מול Present Perfect, Past Progressive, עתיד, משפטי תנאי, השוואות, פעלים מודאליים, כמתים, who/which/that, סביל (is made / was built), used to, כתיבת פסקה ומילות קישור, אוצר מילים Band II, גזירת מילים (un-, dis-, ‎-ful, ‎-less, ‎-tion) וארבעה קטעי Unseen ארוכים",
           desc_en="Grade 8 English: Present Perfect, Past Simple vs Present Perfect, Past Progressive, future forms, the first conditional, comparatives, modals, quantifiers, relative pronouns, the passive (is made / was built), used to, paragraphs and connectors, Band II words, word building (un-, dis-, -ful, -less, -tion) and four longer Unseen passages",
           tags=["Present Perfect", "since / for", "when / while", "will / going to", "If … will", "Modals",
                 "who / which / that", "Passive", "used to", "Connectors", "Band II words", "Word building", "Unseen"],
           examDate="", dailyGoal=2, perRound=10,
           topics=[PF, PV, PP, FU, CI, CS, MD, QT, RP, PS, UT, WR, VE, VH, VM, WF, UN])
MAX_Q_WORDS = 12


def W(s): return re.sub(r"\{([^}]*)\}", lambda m: "⁦" + m.group(1) + "⁩", s)
def Q(t, q, opts, ans, expl, sc, lvl=1):
    r = (t, W(q), opts, ans, W(expl), sc)
    return r + (2,) if lvl == 2 else r
def Q2(*a): return Q(*a, lvl=2)        # a test-level question (the level of a real grade-8 test)

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
 Q(PF, "They ___ (see) the new Spider-Man film.", ["have seen", "has seen", "have saw", "has saw"], 0, "they ← have + V3 (see-saw-seen)", ROW("🍿", "🎬")),
 Q(PF, "Third form (V3) of write?", ["written", "wrote", "writed", "writing"], 0, "write – wrote – written", PW("✍️", "write → ?")),
 Q(PF, "Third form (V3) of go?", ["gone", "went", "goed", "going"], 0, "go – went – gone", PW("🚶", "go → ?")),
 Q(PF, "Third form (V3) of eat?", ["eaten", "ate", "eated", "eating"], 0, "eat – ate – eaten", PW("🍽️", "eat → ?")),
 Q(PF, "Third form (V3) of buy?", ["bought", "buyed", "boughten", "buying"], 0, "buy – bought – bought", PW("🛒", "buy → ?")),
 Q(PF, "I have never ___ (ride) a horse.", ["ridden", "rode", "ride", "rided"], 0, "ride – rode – ridden", ROW("🐎", "🙅")),
 Q(PF, "___ you ever been to Paris?", ["Have", "Has", "Did", "Were"], 0, "you ← Have you ever been…?", ROW("🗼", "✈️")),
 Q(PF, "My brother ___ his phone. He can't find it.", ["has lost", "have lost", "has lose", "is lost"], 0, "he ← has + V3: has lost", ROW("👦", "📱", "❓")),
 Q(PF, "Oops! She ___ an egg.", ["has broken", "have broken", "has broke", "has break"], 0, "has + V3 (break-broke-broken)", ROW("👧", "🍳", "🥚")),
 Q2(PF, "This is the first time I ___ (eat) sushi. It's great!", ["have eaten", "ate", "eat", "am eating"], 0, "the first time ← have + V3", ROW("🍣", "😋")),
 Q2(PF, "\"She has lived here for five years.\" – How long ___ here?", ["has she lived", "did she live", "she has lived", "have she lived"], 0, "How long ← has she + V3", ROW("🏠", "⏳")),
 Q2(PF, "Find the mistake: \"She has went home.\"", ["went → gone", "has → have", "home → house", "She → Her"], 0, "אחרי has ← V3: gone", ROW("👧", "🏠")),
 Q2(PF, "We ___ any rain so far this winter. The ground is dry.", ["haven't had", "didn't have", "hasn't had", "don't have"], 0, "so far ← Present Perfect בשלילה", ROW("🌵", "☀️")),
]))

C.append(("ever · never · already · yet · since · for", [PF], [
 Q(PF, "I haven't finished my project ___.", ["yet", "already", "since", "ever"], 0, "בשלילה בסוף המשפט ← yet (עדיין לא)", ROW("📋", "⏳")),
 Q(PF, "We have ___ eaten lunch. We're full.", ["already", "yet", "ever", "since"], 0, "already = כבר", ROW("🍽️", "😌")),
 Q(PF, "I've ___ seen snow. I'd love to see it!", ["never", "ever", "already", "yet"], 0, "never = אף פעם לא", ROW("❄️", "🤩")),
 Q(PF, "Is this the first time you've ___ flown?", ["ever", "yet", "since", "for"], 0, "the first time + Present Perfect ← ever", ROW("✈️", "😬")),
 Q(PF, "She has lived here ___ 2020.", ["since", "for", "ago", "yet"], 0, "נקודת התחלה (שנה) ← since", PW("🏠", "2020")),
 Q(PF, "They have known each other ___ ten years.", ["for", "since", "ago", "already"], 0, "משך זמן ← for", ROW("👫", "📅")),
 Q(PF, "I have been sick ___ Monday.", ["since", "for", "ago", "yet"], 0, "Monday = נקודת התחלה ← since", ROW("🤒", "📅")),
 Q(PF, "He has played the guitar ___ a long time.", ["for", "since", "ago", "yet"], 0, "a long time = משך ← for", ROW("🎸", "⏳")),
 Q(PF, "How long ___ you lived in Haifa?", ["have", "has", "did", "are"], 0, "you ← have + lived", ROW("🏙️", "⏳")),
 Q(PF, "Which time goes with \"for\"?", ["three weeks", "last Sunday", "2015", "my birthday"], 0, "for + משך זמן: three weeks", PW("⏳", "for + ?")),
 Q2(PF, "Noa ___ her phone for two years. She ___ it in Paris.", ["has had, bought", "had, has bought", "has, has bought", "has, bought"], 0, "עד היום ← has had; קנתה פעם ← bought", ROW("📱", "🗼")),
 Q2(PF, "Find the mistake: \"I have lived here since five years.\"", ["since → for", "have → has", "lived → live", "here → there"], 0, "five years = משך זמן ← for", ROW("🏠", "📅")),
 Q2(PF, "It's been three years ___ we last met. I've missed you!", ["since", "for", "ago", "already"], 0, "It's been + זמן + since = עבר מאז", ROW("👭", "🤗")),
]))

# ───────────── Past Simple or Present Perfect? ─────────────
C.append(("Past Simple or Present Perfect?", [PV], [
 Q(PV, "We ___ about the trip the day before yesterday.", ["talked", "have talked", "has talked", "talk"], 0, "שלשום = זמן מוגדר בעבר ← Past Simple", ROW("🗣️", "🧳")),
 Q(PV, "I ___ to London twice in my life.", ["have been", "was", "am", "go"], 0, "in my life = ניסיון ← Present Perfect", ROW("🇬🇧", "✈️")),
 Q(PV, "She ___ to Rome in 2019.", ["went", "has gone", "has been", "goes"], 0, "in 2019 = זמן מוגדר ← Past Simple", ROW("🇮🇹", "📅")),
 Q(PV, "___ your parents meet at school or at work?", ["Did", "Have", "Has", "Were"], 0, "פגישה שקרתה פעם בעבר ← Past Simple: Did", ROW("👫", "🏫", "🏢")),
 Q(PV, "Which time word goes with Past Simple?", ["ago", "yet", "ever", "since"], 0, "ago = לפני ← Past Simple", PW("📅", "Past Simple")),
 Q(PV, "Which time word goes with Present Perfect?", ["yet", "ago", "yesterday", "last year"], 0, "yet ← Present Perfect", PW("⏳", "have + V3")),
 Q(PV, "When ___ you buy that phone?", ["did", "have", "has", "were"], 0, "שאלת When ← Past Simple", ROW("📱", "🛒")),
 Q(PV, "He ___ his leg last week.", ["broke", "has broken", "breaks", "have broken"], 0, "last week ← Past Simple", ROW("🦵", "🏥")),
 Q(PV, "We have ___ in Haifa since 2018.", ["lived", "live", "living", "lives"], 0, "since ← Present Perfect: have + V3 (lived)", PW("🏠", "since 2018")),
 Q(PV, "Yesterday I ___ that film.", ["saw", "have seen", "has seen", "seen"], 0, "yesterday ← Past Simple: saw", ROW("🎬", "📅")),
 Q2(PV, "I ___ Dana since 2019. We ___ at summer camp.", ["have known, met", "knew, have met", "know, have met", "know, met"], 0, "עד היום ← have known; נפגשנו פעם ← met", ROW("👭", "🏕️")),
 Q2(PV, "\"We met in 2015.\" – When ___?", ["did you meet", "have you met", "you met", "did you met"], 0, "שאלה על זמן בעבר ← did + פועל בסיס", ROW("👫", "📅")),
]))

C.append(("been or gone? just · ago · so far", [PV], [
 Q(PV, "Dan isn't here. He ___ to the shop.", ["has gone", "has been", "have gone", "is go"], 0, "has gone = הלך ועדיין שם", ROW("🏪", "🚶")),
 Q(PV, "The bus has ___ left. We missed it!", ["just", "yet", "ever", "ago"], 0, "just = הרגע", ROW("🚌", "🏃")),
 Q(PV, "I've lost my key. – When ___ you lose it?", ["did", "have", "has", "do"], 0, "When ← Past Simple: did", ROW("🔑", "❓")),
 Q(PV, "She ___ a doctor since 2015.", ["has been", "was", "is", "were"], 0, "since ← has been", ROW("👩‍⚕️", "🏥")),
 Q(PV, "Two years ___, we moved to Haifa.", ["ago", "since", "for", "yet"], 0, "לפני שנתיים = two years ago", ROW("🚚", "🏙️")),
 Q(PV, "I ___ the dishes an hour ago.", ["washed", "have washed", "wash", "has washed"], 0, "an hour ago ← Past Simple", ROW("🍽️", "🧽")),
 Q(PV, "Which of these time phrases needs Past Simple?", ["in 2010", "since 2010", "so far", "yet"], 0, "שנה מוגדרת בעבר ← Past Simple", ROW("📅", "⬅️")),
 Q(PV, "Which of these uses Present Perfect?", ["I have eaten", "I ate", "I was eating", "I eat"], 0, "have + V3 = Present Perfect", ROW("🍽️", "✅")),
 Q(PV, "It ___ a lot last winter.", ["rained", "has rained", "rains", "have rained"], 0, "last winter ← Past Simple", ROW("🌧️", "❄️")),
 Q(PV, "How many films ___ you seen this year?", ["have", "did", "has", "are"], 0, "seen = V3 ← have", ROW("🎬", "🍿")),
 Q2(PV, "Our team ___ five games so far. One more and we're champions!", ["has won", "wins", "have won", "was winning"], 0, "so far = עד עכשיו ← has + V3", ROW("⚽", "🏆")),
]))

# ───────────── Past Progressive · when / while ─────────────
C.append(("Past Progressive: was / were + -ing", [PP], [
 Q(PP, "At 8 p.m. yesterday, I ___ my homework.", ["was doing", "were doing", "have done", "am doing"], 0, "באמצע פעולה בעבר ← was + ing", ROW("📓", "🕗")),
 Q(PP, "They ___ football when it started to rain.", ["were playing", "was playing", "are playing", "play"], 0, "they ← were + ing", ROW("⚽", "🌧️")),
 Q(PP, "While she ___ (read), her phone rang.", ["was reading", "were reading", "is reading", "reads"], 0, "While + פעולה ארוכה ← she was reading", ROW("📖", "📱")),
 Q(PP, "I was walking home ___ I saw an accident.", ["when", "while", "during", "since"], 0, "פעולה קצרה שהפריעה ← when", ROW("🚶", "🚗")),
 Q(PP, "While we ___ eating, the lights went out.", ["were", "was", "are", "did"], 0, "we ← were + ing (While + פעולה ארוכה)", ROW("🍝", "💡")),
 Q(PP, "What were you doing at 9 last night?", ["I was sleeping", "I am sleeping", "I sleep", "I have slept"], 0, "שאלה ב-Past Progressive ← תשובה בו", ROW("🛌", "🕘")),
 Q(PP, "The sun ___ and the birds were singing.", ["was shining", "were shining", "shines", "is shining"], 0, "the sun ← was + ing", ROW("☀️", "🐦")),
 Q(PP, "I was cooking when he called. Which action was short?", ["calling", "cooking", "both", "neither"], 0, "הפעולה הקצרה ב-Past Simple", ROW("🍳", "📞")),
 Q(PP, "Which is correct? They ___.", ["were sleeping", "was sleeping", "sleeping", "were sleep"], 0, "they ← were + ing", ROW("😴", "😴")),
 Q(PP, "She burned her hand while she ___ dinner.", ["was cooking", "were cooking", "cooks", "is cooking"], 0, "while + was + ing", ROW("🍳", "✋")),
 Q2(PP, "While Dad was driving, we ___ (sing) all the way.", ["were singing", "was singing", "are singing", "sing"], 0, "שתי פעולות ארוכות במקביל ← we were + ing", ROW("🚗", "🎶")),
 Q2(PP, "\"I was waiting for the bus.\" – What ___ at 8?", ["were you doing", "was you doing", "are you doing", "you were doing"], 0, "שאלה ב-Past Progressive: were + you + doing", ROW("🚏", "🕗")),
 Q2(PP, "I ___ my homework when the lights ___ out.", ["was doing, went", "did, were going", "do, went", "was doing, goes"], 0, "פעולה ארוכה + פעולה קצרה שקטעה אותה", ROW("📓", "💡")),
]))

C.append(("when, while or during?", [PP], [
 Q(PP, "___ I was swimming, I lost my ring.", ["While", "During", "Since", "Because"], 0, "While + פעולה ארוכה", ROW("🏊", "💍")),
 Q(PP, "Our team scored twice ___ the second half.", ["during", "while", "when", "because"], 0, "During + שם עצם (the second half)", ROW("⚽", "🥅")),
 Q(PP, "We were watching TV when the doorbell ___.", ["rang", "was ringing", "rings", "ringing"], 0, "when + פעולה קצרה ← Past Simple: rang", ROW("📺", "🔔")),
 Q(PP, "___ the film, my phone rang.", ["During", "While", "When", "Since"], 0, "During + שם עצם (the film)", ROW("🎬", "📱")),
 Q(PP, "I met Dana ___ I was waiting for the bus.", ["while", "during", "for", "since"], 0, "while + פעולה ארוכה", ROW("🚏", "👋")),
 Q(PP, "Mom was cooking while Dad ___ the table.", ["was setting", "were setting", "is setting", "sets"], 0, "שתי פעולות ארוכות במקביל", ROW("🍳", "🍽️")),
 Q(PP, "When I arrived, my friends ___ for me.", ["were waiting", "was waiting", "wait", "are waiting"], 0, "friends = רבים ← were + ing", ROW("👫", "⏳")),
 Q(PP, "While I was reading, my sister ___ music.", ["was playing", "were playing", "plays", "is playing"], 0, "my sister ← was + ing", ROW("📖", "🎹")),
 Q(PP, "It ___ when we left the house.", ["was snowing", "snowing", "were snowing", "snows"], 0, "it ← was + ing", ROW("🏠", "❄️")),
 Q(PP, "I broke my arm while I ___ down the mountain.", ["was skiing", "were skiing", "skiing", "am skiing"], 0, "I ← was + ing", ROW("🏔️", "🦴")),
 Q2(PP, "Find the mistake: \"During I was eating, he called.\"", ["During → While", "eating → eat", "called → calls", "he → him"], 0, "אחרי During בא שם עצם, לא משפט", ROW("🍝", "📞")),
]))

# ───────────── Future ─────────────
C.append(("Future: will or going to?", [FU], [
 Q(FU, "The baby is yawning. She's ___ to fall asleep.", ["going", "will", "go", "gone"], 0, "רואים סימן ברור ← is going to", ROW("👶", "🛏️")),
 Q(FU, "This bag looks heavy. – Let me help! I ___ carry it.", ["will", "am going", "going to", "was"], 0, "החלטה של הרגע ← will", ROW("👜", "💪")),
 Q(FU, "Robots are getting smarter. I think they ___ do housework one day.", ["will", "are", "going to", "have"], 0, "I think + תחזית ← will", ROW("🤖", "🧹")),
 Q(FU, "We've bought the tickets. We ___ to visit Rome.", ["are going", "will", "going", "are go"], 0, "תוכנית שכבר החלטנו ← going to", ROW("🎫", "🇮🇹")),
 Q(FU, "I promise I ___ use your phone without asking.", ["won't", "wasn't", "am not", "not"], 0, "הבטחה ← won't = will not", ROW("📱", "🤝")),
 Q(FU, "I ___ my aunt tonight. It's in my diary.", ["am meeting", "meet", "met", "have met"], 0, "סידור קבוע ← am + ing", ROW("📅", "👩")),
 Q(FU, "What ___ you going to study at university?", ["are", "will", "do", "have"], 0, "you ← are going to", ROW("🎓", "📚")),
 Q(FU, "Someone's at the door. – Don't get up, I ___ open it!", ["will", "did", "have", "was"], 0, "החלטה של הרגע ← will", ROW("🚪", "🔔")),
 Q(FU, "\"We're flying to Eilat on Friday.\" It is about:", ["a future plan", "the past", "a habit", "a rule"], 0, "on Friday ← תוכנית לעתיד", ROW("✈️", "🏖️")),
 Q(FU, "Which sentence is a prediction?", ["It will rain", "I'm meeting Dan", "Close the door", "I went home"], 0, "תחזית ← will", ROW("🔮", "☀️")),
 Q2(FU, "Which is correct? The glass is at the edge! It ___ fall.", ["is going to", "will to", "going to", "is go to"], 0, "רואים סימן ברור ← is going to", ROW("🥛", "🍽️")),
 Q2(FU, "\"I'm meeting Ron at 5.\" – What ___ at 5?", ["are you doing", "will you doing", "do you doing", "you are doing"], 0, "סידור לעתיד ← What are you doing?", ROW("📅", "🕔")),
]))

C.append(("Future: questions & negatives", [FU], [
 Q(FU, "___ you help me with this heavy box?", ["Will", "Are", "Going", "Have"], 0, "בקשה ← Will you…?", ROW("📦", "🙏")),
 Q(FU, "She isn't ___ to come to the party.", ["going", "will", "go", "goes"], 0, "isn't going to = לא מתכוונת", ROW("🎉", "🙅")),
 Q(FU, "Don't worry. I'm sure you ___ pass the test.", ["will", "are", "going", "did"], 0, "I'm sure + תחזית ← will", ROW("📝", "👍")),
 Q(FU, "Are you ___ to visit Greece this summer?", ["going", "go", "will", "goes"], 0, "Are you going to…? = מתכוון?", ROW("🇬🇷", "☀️")),
 Q(FU, "Where ___ you going to stay?", ["are", "will", "do", "have"], 0, "you ← are going to", ROW("🏨", "❓")),
 Q(FU, "By 2040, most cars ___ be electric – no more petrol!", ["will", "are going", "did", "have"], 0, "תחזית רחוקה ← will", ROW("🚗", "🔌")),
 Q(FU, "Dana ___ her grandparents next weekend. She's packed already.", ["is visiting", "visited", "was visiting", "has visited"], 0, "סידור לעתיד ← is + ing", ROW("🧳", "👵")),
 Q(FU, "Watch out! You're ___ to fall!", ["going", "will", "go", "did"], 0, "רואים שזה עומד לקרות ← going to", ROW("⚠️", "🍌")),
 Q(FU, "The forecast says it ___ rain tomorrow. Take an umbrella!", ["will", "is", "was", "does"], 0, "תחזית ← will", ROW("📺", "🌧️")),
 Q(FU, "I ___ forget your birthday again. I promise!", ["won't", "don't", "am not", "didn't"], 0, "הבטחה ← won't", ROW("🎂", "🤞")),
 Q2(FU, "The timetable says the train ___ at 6:15 tomorrow.", ["leaves", "leave", "leaving", "is leave"], 0, "לוח זמנים ← Present Simple: leaves", ROW("🚆", "🕕")),
 Q2(FU, "I'll call you as soon as I ___ home.", ["get", "will get", "got", "getting"], 0, "אחרי as soon as ← הווה, לא will", ROW("🏠", "📞")),
 Q2(FU, "Find the mistake: \"He will comes tomorrow.\"", ["comes → come", "will → is", "tomorrow → today", "He → His"], 0, "אחרי will ← פועל בסיס בלי s", ROW("👦", "📅")),
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
 Q2(CI, "You'll miss the bus ___ you hurry.", ["unless", "if", "when", "so"], 0, "unless = אם לא", ROW("🚌", "🏃")),
 Q2(CI, "If it ___, we ___ inside.", ["rains, will stay", "will rain, stay", "rain, will stay", "rained, will stay"], 0, "If + הווה, will + פועל", ROW("🌧️", "🏠")),
 Q2(CI, "\"Unless you study, you'll fail.\" means:", ["אם לא תלמד", "אם תלמד", "כי למדת", "למרות שתלמד"], 0, "unless = אם לא", ROW("📚", "📝")),
]))

C.append(("First conditional: results", [CI], [
 Q(CI, "If you eat too much candy, ___.", ["you'll feel sick", "you felt sick", "you feeling sick", "you sick"], 0, "תוצאה ← will + פועל", ROW("🍬", "🤢")),
 Q(CI, "If they win the game, they ___ very happy.", ["will be", "are being", "were", "be"], 0, "תוצאה ← will be", ROW("⚽", "🏆")),
 Q(CI, "If you ___ that vase into pieces, Mom will be angry.", ["break", "will break", "broke", "breaking"], 0, "אחרי If ← הווה", ROW("🏺", "😠")),
 Q(CI, "If I ___ the competition, I'll buy a new bike.", ["win", "will win", "won", "winning"], 0, "אחרי If ← הווה: win", ROW("🏅", "🚲")),
 Q(CI, "If you ___ now, you'll catch the train.", ["leave", "left", "will leave", "leaving"], 0, "אחרי If ← הווה: leave", ROW("🚆", "🏃")),
 Q(CI, "What ___ you do if it rains tomorrow?", ["will", "did", "are", "would"], 0, "תנאי ראשון ← will", ROW("🌧️", "❓")),
 Q(CI, "If we don't recycle, there ___ more rubbish.", ["will be", "is be", "were", "has"], 0, "תוצאה בעתיד ← will be", ROW("♻️", "🗑️")),
 Q(CI, "Plants ___ if you don't water them.", ["will die", "died", "dying", "dies"], 0, "תוצאה ← will + פועל", ROW("🌱", "🚰")),
 Q(CI, "\"If you study, you'll pass.\" Which part is the condition?", ["studying", "passing", "both", "neither"], 0, "התנאי בא אחרי If", ROW("📚", "✅")),
 Q(CI, "If he ___, we'll start without him.", ["doesn't come", "won't come", "didn't come", "not comes"], 0, "אחרי If ← הווה בשלילה", ROW("⏰", "👥")),
 Q2(CI, "Look at the card. Which word is wrong?", ["will", "we'll", "stay", "home"], 0, "אחרי If ← הווה, בלי will: If it rains", TXT("If it will rain,", "we'll stay home.")),
 Q2(CI, "You can't come in ___ you have a ticket.", ["unless", "if", "so", "because"], 0, "unless = אלא אם, אם לא", ROW("🎫", "🚪")),
]))

# ───────────── Comparatives & superlatives ─────────────
C.append(("Irregular and long adjectives", [CS], [
 Q(CS, "Comparative of many?", ["more", "manier", "most", "much more"], 0, "many – more – the most", PW("👥", "many → ?")),
 Q(CS, "Superlative of bad?", ["the worst", "the baddest", "the worse", "the most bad"], 0, "bad – worse – the worst", PW("👎", "bad → ?")),
 Q(CS, "This is the ___ day of my life!", ["best", "better", "goodest", "most good"], 0, "the + הכי טוב ← best", ROW("🥳", "🎉")),
 Q(CS, "My cold is ___ (bad) today than yesterday.", ["worse", "worst", "badder", "more bad"], 0, "than ← השוואה: worse", ROW("🤧", "📅")),
 Q(CS, "Eilat is ___ from Haifa than Tel Aviv is.", ["farther", "farthest", "more far", "farer"], 0, "far – farther – the farthest", ROW("🗺️", "🚗")),
 Q(CS, "This phone is ___ (expensive) than that one.", ["more expensive", "expensiver", "most expensive", "the expensive"], 0, "מילה ארוכה ← more + expensive", ROW("📱", "💰")),
 Q(CS, "It's the ___ exciting film I've ever seen.", ["most", "more", "best", "much"], 0, "the most + מילה ארוכה", ROW("🎬", "🤩")),
 Q(CS, "A cheetah is ___ than a horse.", ["faster", "fastest", "more fast", "the faster"], 0, "than ← fast + er", ROW("🐆", "🐎")),
 Q(CS, "Comparative of heavy?", ["heavier", "heavyer", "more heavy", "heaviest"], 0, "y אחרי עיצור ← ier", PW("🏋️", "heavy → ?")),
 Q(CS, "Which pair is irregular?", ["good – better", "tall – taller", "big – bigger", "nice – nicer"], 0, "good – better: לא מוסיפים er", ROW("📏", "❓")),
 Q2(CS, "Look at the card. A bike is ___ than a car.", ["less expensive", "more expensive", "less expensiver", "least expensive"], 0, "less + תואר + than = פחות … מ-", TXT("bike: 500 ₪", "car: 90,000 ₪")),
]))

C.append(("as … as · the most · comparing facts", [CS], [
 Q(CS, "The box was ___ heavy that I couldn't lift it.", ["so", "such", "too", "very"], 0, "so + תואר + that = כל כך … ש", ROW("📦", "💪")),
 Q(CS, "Look at the card. My bag isn't ___ yours.", ["as heavy as", "as heavier as", "heavy as", "the heaviest"], 0, "not as … as = לא … כמו", TXT("mine: 3 kg", "yours: 5 kg")),
 Q(CS, "This is the ___ (comfortable) bed I've ever slept in.", ["most comfortable", "more comfortable", "comfortablest", "most comfortabler"], 0, "מילה ארוכה ← the most comfortable", ROW("🛏️", "😌")),
 Q(CS, "Look at the card. Who is the oldest?", ["Ben", "Ana", "Gil", "all the same"], 0, "15 הוא הגיל הגבוה ביותר", TXT("Ana – 13", "Ben – 15", "Gil – 14")),
 Q(CS, "Look at the card. Who is younger than Gil?", ["Ana", "Ben", "nobody", "both"], 0, "13 קטן מ-14", TXT("Ana – 13", "Ben – 15", "Gil – 14")),
 Q(CS, "The more you practice, the ___ (good) you get.", ["better", "good", "best", "well"], 0, "the more…, the better = ככל ש…", ROW("🎹", "📈")),
 Q(CS, "This test was ___ (easy) than the last one.", ["easier", "more easy", "easiest", "easyer"], 0, "easy ← easier", ROW("📝", "😊")),
 Q(CS, "She is the ___ student in our class.", ["most intelligent", "intelligentest", "more intelligent", "most intelligenter"], 0, "מילה ארוכה ← the most", ROW("👩‍🎓", "🏫")),
 Q(CS, "The new phone is much ___ (light) than the old one.", ["lighter", "lightest", "light", "more light"], 0, "much + השוואה: much lighter", ROW("📱", "⚖️")),
 Q(CS, "Who is ___ person in your family?", ["the youngest", "younger", "youngest than", "the younger"], 0, "מכל המשפחה ← the youngest", ROW("👪", "👶")),
 Q2(CS, "Jerusalem is one of the ___ in the world.", ["oldest cities", "oldest city", "older cities", "most old cities"], 0, "one of the + הכי + רבים", ROW("🕌", "🏛️")),
 Q2(CS, "Look at the card. Tom's bag is ___ as Dan's.", ["twice as heavy", "twice as heavier", "two as heavy", "twice heavy"], 0, "פי שניים = twice as … as", TXT("Tom: 10 kg", "Dan: 5 kg")),
 Q2(CS, "It was ___ a hot day that we stayed inside.", ["such", "so", "too", "very"], 0, "such + a + תואר + שם עצם", ROW("☀️", "🏠")),
]))

# ───────────── Modals ─────────────
C.append(("must · have to · should", [MD], [
 Q(MD, "Drivers ___ stop at a red light. There's no choice.", ["must", "mustn't", "might", "don't have to"], 0, "אין ברירה = חובה ← must", ROW("🚦", "🚗")),
 Q(MD, "It's only advice: you ___ revise tonight for the test.", ["should", "mustn't", "has to", "might"], 0, "רק עצה, לא חובה ← should", ROW("📚", "🌙")),
 Q(MD, "You ___ touch the paintings. It's a rule, not advice.", ["mustn't", "must", "should", "have to"], 0, "כלל = אסור ← mustn't", ROW("🖼️", "🏛️")),
 Q(MD, "No school tomorrow, so I ___ get up early.", ["don't have to", "mustn't", "must", "has to"], 0, "אין חובה ← don't have to", ROW("🛌", "⏰")),
 Q(MD, "___ your brother have to wear a uniform?", ["Does", "Has", "Must", "Is"], 0, "שאלה עם have to ← Does … have to?", ROW("👦", "👕", "🏫")),
 Q(MD, "\"You mustn't run here.\" means:", ["אסור לרוץ", "לא חייב לרוץ", "כדאי לרוץ", "אולי תרוץ"], 0, "mustn't = אסור", ROW("🏃", "🏫")),
 Q(MD, "\"You don't have to come.\" means:", ["לא חייב לבוא", "אסור לבוא", "כדאי לבוא", "אולי תבוא"], 0, "don't have to = לא חייבים", ROW("🚶", "🎉")),
 Q(MD, "Yesterday I ___ stay after school.", ["had to", "must", "have to", "musted"], 0, "עבר של must / have to ← had to", ROW("🏫", "🕓")),
 Q(MD, "It'll rain. Just advice: you ___ take an umbrella.", ["should", "shouldn't", "mustn't", "might not"], 0, "רק עצה ← should", ROW("☂️", "🌧️")),
 Q(MD, "You ___ drink so much cola. It's advice, not a rule.", ["shouldn't", "should", "have to", "might"], 0, "עצה שלילית ← shouldn't", ROW("🥤", "🦷")),
 Q2(MD, "Last year we ___ use phones in class. Now we can.", ["weren't allowed to", "aren't allowed to", "wasn't allowed to", "didn't allowed to"], 0, "עבר, we ← weren't allowed to (אסור היה)", ROW("📱", "🏫")),
 Q2(MD, "\"You needn't hurry.\" means:", ["לא צריך למהר", "אסור למהר", "כדאי למהר", "חייבים למהר"], 0, "needn't = לא צריך", ROW("🚶", "⏰")),
 Q2(MD, "Find the mistake: \"She musts wear glasses.\"", ["musts → must", "wear → wears", "glasses → glass", "She → Her"], 0, "must לא מקבל s", ROW("👩", "👓")),
]))

C.append(("might · advice · rules", [MD], [
 Q(MD, "Take a coat. It ___ be cold later – nobody knows.", ["might", "must", "has to", "should to"], 0, "אף אחד לא יודע ← אפשרות: might", ROW("🧥", "🌬️")),
 Q(MD, "I'm not sure. I ___ go to the party.", ["might", "must", "have to", "should"], 0, "לא בטוח ← might = אולי", ROW("🎉", "🤷")),
 Q(MD, "\"might\" means:", ["אולי", "חייב", "אסור", "צריך"], 0, "might = אולי", TXT("might")),
 Q(MD, "We ___ go to Eilat. It's possible, but we haven't decided.", ["might", "must", "have to", "mustn't"], 0, "עוד לא החלטנו ← might", ROW("🏖️", "🤔")),
 Q(MD, "Which modal gives advice?", ["should", "must", "might", "have to"], 0, "should = כדאי ← עצה", ROW("💬", "👍")),
 Q(MD, "Which modal shows possibility?", ["might", "must", "mustn't", "have to"], 0, "might = אולי ← אפשרות", ROW("🎲", "🤷")),
 Q(MD, "You ___ to be 17 to drive a car.", ["have", "must", "should", "might"], 0, "רק have לפני to", "🚗"),
 Q(MD, "Do I ___ to bring food on the trip?", ["have", "must", "should", "might"], 0, "Do I have to…? = האם חייב?", ROW("🥪", "🎒")),
 Q(MD, "Look at the sign. You ___ swim here.", ["mustn't", "don't have to", "might", "should"], 0, "השלט אוסר ← mustn't", [("🏊", 20, 52, 34), ("NO SWIMMING", 64, 52, 11)]),
 Q(MD, "My tooth hurts. – You ___ see a dentist.", ["should", "mustn't", "might not", "don't have"], 0, "עצה ← should", ROW("🦷", "😣")),
 Q2(MD, "Yesterday I ___ finish the test in time. Hooray!", ["was able to", "were able to", "am able to", "can"], 0, "הצלחתי פעם אחת בעבר ← was able to", ROW("📝", "🎉")),
 Q2(MD, "You ___ bring food, but you can if you want.", ["don't need to", "doesn't need to", "need not to", "don't need"], 0, "לא צריך, אבל מותר ← don't need to", ROW("🥪", "🎒")),
 Q2(MD, "Which is correct? Next year you ___ wear a uniform.", ["will have to", "will must", "will has to", "have to will"], 0, "עתיד של must ← will have to", ROW("👕", "🏫")),
]))

# ───────────── Quantifiers ─────────────
C.append(("too much · too many · enough · few", [QT], [
 Q(QT, "There are too ___ cars. The traffic is terrible!", ["many", "much", "little", "few"], 0, "cars נספר + יותר מדי ← too many", ROW("🚗", "🚙", "🚕")),
 Q(QT, "I drank too ___ coffee. I can't sleep.", ["much", "many", "few", "little"], 0, "coffee לא נספר ← too much", ROW("☕", "😵")),
 Q(QT, "The ice isn't thick ___ to walk on. Stay off!", ["enough", "much", "too", "very"], 0, "אחרי תואר: not thick enough = לא עבה מספיק", ROW("⛸️", "🚫")),
 Q(QT, "The hall is empty. Take ___ seat you like – just one.", ["any", "many", "a few", "much"], 0, "any + יחיד = איזה שתרצה", ROW("💺", "💺", "💺")),
 Q(QT, "I have ___ money – only five shekels.", ["a little", "a few", "many", "much"], 0, "money לא נספר + מעט ← a little", [("💰", 28, 52, 36), ("5 ₪", 68, 52, 22)]),
 Q(QT, "Very ___ people came. The hall was almost empty.", ["few", "little", "much", "a lot"], 0, "few = מעט מאוד (נספר)", ROW("🏟️", "👤")),
 Q(QT, "There's ___ water in the bottle. It's empty.", ["no", "any", "some", "many"], 0, "no = אין בכלל", ROW("🍶", "🚫")),
 Q(QT, "___ student got a book – all thirty of them!", ["Every", "All", "Many", "Few"], 0, "Every + יחיד: every student", ROW("📚", "👩‍🎓")),
 Q(QT, "How ___ time do we have?", ["much", "many", "few", "a few"], 0, "time לא נספר ← How much", ROW("⏰", "❓")),
 Q(QT, "I need ___ minutes to get ready – maybe five.", ["a few", "a little", "much", "little"], 0, "minutes נספר + מעט ← a few", ROW("👕", "⏱️")),
 Q2(QT, "Few people came, so the party was ___.", ["boring", "great", "crowded", "full"], 0, "few = מעט מאוד (כמעט אף אחד)", ROW("🎉", "👤")),
 Q2(QT, "Which is correct? ___ of the 20 guests came. Not one!", ["None", "Neither", "Every", "Either"], 0, "אף אחד מתוך הרבה ← None", ROW("🎂", "🚪")),
]))

C.append(("Countable or uncountable?", [QT], [
 Q(QT, "Which noun is uncountable?", ["information", "book", "idea", "apple"], 0, "information – אין information-s", OPTS("📰", "📕", "💡", "🍎")),
 Q(QT, "Which noun is countable?", ["egg", "money", "water", "advice"], 0, "egg – one egg, two eggs", OPTS("🥚", "💰", "💧", "💬")),
 Q(QT, "Can you give me some ___ about the trip?", ["information", "informations", "an information", "many information"], 0, "information לא נספר: בלי s ובלי an", ROW("🧳", "🙏")),
 Q(QT, "How ___ hours do you sleep?", ["many", "much", "little", "any"], 0, "hours נספר ← How many", ROW("😴", "🕙")),
 Q(QT, "We can't bake today. There isn't ___ flour.", ["much", "a few", "many", "few"], 0, "flour לא נספר ← much", ROW("🎂", "🥣")),
 Q(QT, "We have ___ of time. Don't hurry!", ["plenty", "many", "much", "few"], 0, "plenty of = הרבה, יותר ממספיק", ROW("⏳", "😌")),
 Q(QT, "The bus was full. There were too ___ people.", ["many", "much", "little", "few"], 0, "people נספר ← too many", ROW("🚌", "👥")),
 Q(QT, "I'd like ___ bread, please.", ["some", "many", "a few", "few"], 0, "בקשה + לא נספר ← some", ROW("🍞", "🙏")),
 Q(QT, "There are only ___ apples on the table.", ["a few", "a little", "much", "no"], 0, "שלושה תפוחים = a few", COUNT(("🍎", 3))),
 Q(QT, "___ of my parents are teachers.", ["Both", "Each", "Every", "Either"], 0, "שני ההורים ← Both … are", ROW("👨‍🏫", "👩‍🏫")),
 Q2(QT, "___ of my two friends came. I was alone.", ["Neither", "Both", "Either", "All"], 0, "אף אחד משניים ← Neither", ROW("👫", "😞")),
 Q2(QT, "Which is correct? ___ of the 30 students got a prize.", ["Each", "Every", "Much", "A little"], 0, "Each of + רבים (Every לא בא לפני of)", ROW("🏅", "👩‍🎓")),
]))

# ───────────── Relative pronouns ─────────────
C.append(("who · which · that", [RP], [
 Q(RP, "The girl ___ lives next door is my friend.", ["who", "which", "where", "what"], 0, "אדם ← who", ROW("👧", "🏠")),
 Q(RP, "This is the book ___ I told you about.", ["which", "who", "where", "whose"], 0, "דבר ← which", ROW("📕", "💬")),
 Q(RP, "A dentist is a person ___ looks after your teeth.", ["who", "which", "where", "when"], 0, "אדם ← who", ROW("🦷", "😁")),
 Q(RP, "I lost the watch ___ my dad gave me.", ["which", "who", "where", "whose"], 0, "דבר ← that / which", ROW("⌚", "🎁")),
 Q(RP, "The cake ___ she made was delicious.", ["which", "who", "whom", "where"], 0, "דבר ← which", ROW("🎂", "😋")),
 Q(RP, "For people we use:", ["who", "which", "where", "when"], 0, "who ← אנשים", ROW("👩", "👨")),
 Q(RP, "For things and animals we use:", ["which", "who", "whose", "when"], 0, "which ← דברים ובעלי חיים", ROW("📦", "🐈")),
 Q(RP, "\"that\" can be used for:", ["people and things", "only people", "only things", "only places"], 0, "that ← גם אנשים וגם דברים", TXT("that")),
 Q(RP, "The man ___ car was stolen called the police.", ["whose", "who", "which", "that"], 0, "של מי ← whose", ROW("🚗", "👮")),
 Q(RP, "Look! There's the dog ___ bit me!", ["which", "what", "where", "when"], 0, "בעל חיים ← that / which", ROW("🐕", "😣")),
 Q2(RP, "This is the café ___ we first met.", ["where", "which", "who", "whose"], 0, "מקום ← where", ROW("☕", "👫")),
 Q2(RP, "Which of these words can we leave out? Look at the card.", ["that", "film", "saw", "great"], 0, "that לפני נושא חדש (we) – אפשר להשמיט", TXT("The film that we", "saw was great.")),
]))

C.append(("Relative clauses: joining ideas", [RP], [
 Q(RP, "I have a friend ___ speaks four languages.", ["who", "which", "where", "what"], 0, "friend = אדם ← who", ROW("👦", "🗣️")),
 Q(RP, "We saw a film ___ was very scary.", ["which", "who", "where", "whose"], 0, "film = דבר ← which", ROW("🎬", "😱")),
 Q(RP, "A machine which washes clothes is a ___.", ["washing machine", "dishwasher", "fridge", "oven"], 0, "מכונה שמכבסת בגדים = washing machine", ROW("👕", "🧼")),
 Q(RP, "Water is a liquid ___ we all need.", ["which", "who", "where", "whose"], 0, "liquid = דבר ← which", ROW("💧", "🚰")),
 Q(RP, "\"The boy which won is my brother.\" Fix it:", ["which → who", "boy → boys", "won → win", "is → are"], 0, "boy = אדם ← who", ROW("🏆", "👦")),
 Q(RP, "The pizza ___ we ordered was cold.", ["which", "who", "whose", "where"], 0, "pizza = דבר ← which / that", ROW("🍕", "🥶")),
 Q(RP, "Is she the teacher ___ teaches you English?", ["who", "which", "whose", "where"], 0, "אדם ← who / that", ROW("👩‍🏫", "🔤")),
 Q(RP, "Do you know anyone ___ can fix computers?", ["who", "which", "whose", "where"], 0, "anyone = אדם ← who", ROW("💻", "🔧")),
 Q(RP, "These are the shoes ___ I bought yesterday.", ["which", "who", "whose", "where"], 0, "shoes = דברים ← which", ROW("👟", "🛍️")),
 Q(RP, "My aunt, ___ lives in London, is a nurse.", ["who", "that", "which", "where"], 0, "בין פסיקים, אדם ← who (לא that)", ROW("👩‍⚕️", "🇬🇧")),
 Q2(RP, "I have a friend ___ dad is a famous chef.", ["whose", "who", "which", "who's"], 0, "האבא שלו ← whose", ROW("👨‍🍳", "⭐")),
 Q2(RP, "Join the card's sentences: I met a boy ___ well.", ["who sings", "which sings", "he sings", "whose sings"], 0, "boy = אדם ← who + הפועל", TXT("I met a boy.", "He sings well.")),
 Q2(RP, "Join the card's sentences: This is a book ___ 900 pages.", ["which has", "who has", "it has", "whose has"], 0, "book = דבר ← which (במקום it)", TXT("This is a book.", "It has 900 pages")),
 Q2(RP, "Join the card's sentences: Here's the park ___ we play.", ["where", "which", "who", "there"], 0, "there = מקום ← where", TXT("Here's the park.", "We play there.")),
]))

# ───────────── Passive: is made · was built ─────────────
C.append(("Passive: is made · are spoken", [PS], [
 Q(PS, "Cheese ___ from milk.", ["is made", "makes", "is make", "made"], 0, "הגבינה לא עושה ← is + V3: is made", ROW("🥛", "🧀")),
 Q(PS, "English ___ in many countries.", ["is spoken", "speaks", "is speak", "are spoken"], 0, "שפה לא מדברת ← is spoken (speak-spoke-spoken)", ROW("💬", "🌍")),
 Q(PS, "These phones ___ (make) in China.", ["are made", "is made", "make", "are make"], 0, "phones = רבים ← are + V3", COUNT(("📱", 2))),
 Q(PS, "Active: People grow oranges. Passive: Oranges ___.", ["are grown", "grow", "are grew", "is grown"], 0, "oranges רבים ← are + V3 (grow-grew-grown)", ROW("🍊", "🌳")),
 Q(PS, "The classroom ___ every day.", ["is cleaned", "cleans", "is cleaning", "are cleaned"], 0, "הכיתה לא מנקה, מנקים אותה ← is cleaned", ROW("🏫", "🧹")),
 Q(PS, "Which sentence is passive?", ["Bread is baked.", "Mom bakes bread.", "Mom is baking.", "Bread smells good."], 0, "is + V3: עושים משהו ללחם", "🍞"),
 Q(PS, "Letters ___ every morning.", ["are delivered", "deliver", "are deliver", "is delivered"], 0, "מכתבים לא מחלקים ← are delivered", ROW("✉️", "📮")),
 Q(PS, "Is Hebrew ___ in Brazil? – No, it isn't.", ["spoken", "speak", "spoke", "speaking"], 0, "שאלה בסביל: Is + V3", ROW("🇧🇷", "💬")),
 Q(PS, "Football ___ all over the world.", ["is played", "plays", "is play", "are played"], 0, "כדורגל לא משחק ← is played", ROW("⚽", "🌍")),
 Q(PS, "Passive in the present: am / is / are + ___", ["V3", "V1", "-ing", "to + verb"], 0, "סביל בהווה: is/are + צורה שלישית", TXT("is + ?")),
 Q2(PS, "The museum ___ two million visitors a year.", ["gets", "is got", "is visited", "was visited"], 0, "המוזיאון מקבל מבקרים ← פעיל: gets", ROW("🏛️", "👥")),
 Q2(PS, "Active: They sell bread here. Passive: Bread ___ here.", ["is sold", "sells", "is sell", "are sold"], 0, "sell-sold-sold, bread יחיד ← is sold", ROW("🍞", "🏪")),
 Q2(PS, "Plastic bags ___ in this shop. Bring your own!", ["aren't given", "don't give", "isn't given", "not given"], 0, "שלילה בסביל ← aren't + V3", ROW("🛍️", "🚫")),
]))

C.append(("Passive: was built · were written", [PS], [
 Q(PS, "The pyramids ___ thousands of years ago.", ["were built", "built", "was built", "are built"], 0, "ago + רבים ← were + V3 (build-built-built)", ROW("🐪", "🏜️")),
 Q(PS, "This bridge ___ (build) in 1990.", ["was built", "built", "is built", "were built"], 0, "1990 = עבר, bridge יחיד ← was built", ROW("🌉", "📅")),
 Q(PS, "Harry Potter ___ by J.K. Rowling.", ["was written", "wrote", "was wrote", "is writing"], 0, "write-wrote-written ← was written", ROW("✍️", "📖")),
 Q(PS, "The telephone ___ (invent) by Bell in 1876.", ["was invented", "invented", "is invented", "were invented"], 0, "הטלפון לא המציא ← was invented", "☎️"),
 Q(PS, "My bike ___ yesterday! I can't find it.", ["was stolen", "stole", "was stole", "is stealing"], 0, "steal-stole-stolen ← was stolen", ROW("🚲", "❓")),
 Q(PS, "\"Romeo and Juliet\" was written ___ Shakespeare.", ["by", "from", "with", "of"], 0, "מי עשה את הפעולה ← by", "📖"),
 Q(PS, "Active: Someone cleaned the room. Passive: The room ___.", ["was cleaned", "cleaned", "is cleaned", "were cleaned"], 0, "עבר, room יחיד ← was + V3", ROW("🧹", "🛏️")),
 Q(PS, "When ___ this photo taken? – Last summer.", ["was", "were", "did", "is"], 0, "photo יחיד, last summer ← was … taken", "📷"),
 Q(PS, "The windows ___ during the storm last night.", ["were broken", "broken", "was broken", "are broken"], 0, "windows רבים, עבר ← were + V3", ROW("⛈️", "🏠")),
 Q(PS, "The thief ___ by the police.", ["was caught", "caught", "was catch", "catches"], 0, "catch-caught-caught ← was caught", "👮"),
 Q2(PS, "Active: The dog bit Tom. Passive: Tom ___ by the dog.", ["was bitten", "was bit", "is bitten", "bitten"], 0, "bite-bit-bitten ← was bitten", ROW("🐕", "👦")),
 Q2(PS, "___ the windows cleaned yesterday?", ["Were", "Was", "Did", "Are"], 0, "windows רבים, yesterday ← Were … cleaned", ROW("🏠", "🧽")),
 Q2(PS, "The letter ___ sent. It's still on the table.", ["wasn't", "didn't", "weren't", "doesn't"], 0, "שלילה בסביל ← wasn't + V3", ROW("✉️", "🛋️")),
 Q2(PS, "\"It was built in 1920.\" – When ___ built?", ["was it", "did it", "it was", "were it"], 0, "שאלה בסביל: When + was + it + V3", ROW("🏰", "📅")),
]))

# ───────────── used to ─────────────
C.append(("used to: things I did before", [UT], [
 Q(UT, "When I was little, I ___ cry a lot.", ["used to", "use to", "am used", "was use"], 0, "הרגל בעבר שנגמר ← used to", "👶"),
 Q(UT, "My dad ___ smoke, but he stopped.", ["used to", "uses to", "is used", "use to"], 0, "עשה פעם, היום כבר לא ← used to", "🚭"),
 Q(UT, "I used to ___ in Eilat. Now my home is in Haifa.", ["live", "lived", "living", "lives"], 0, "אחרי used to ← פועל בסיס", ROW("🏜️", "🏙️")),
 Q(UT, "\"I used to play football.\" Do I play now?", ["No, not now", "Yes, every day", "Yes, sometimes", "Yes, always"], 0, "used to = פעם כן, היום כבר לא", "⚽"),
 Q(UT, "There ___ be a cinema here. Now it's a bank.", ["used to", "uses to", "use", "was use"], 0, "היה פעם, היום כבר לא ← used to", ROW("🎬", "🏦")),
 Q(UT, "\"used to\" means:", ["פעם (וכבר לא)", "עכשיו", "בעתיד", "אף פעם"], 0, "used to ← הרגל בעבר שהשתנה", TXT("used to")),
 Q(UT, "Before phones, people ___ write letters.", ["used to", "use to", "are used", "using to"], 0, "הרגל בעבר ← used to + פועל בסיס", ROW("✉️", "📮")),
 Q(UT, "Grandma used to ___ us stories every night.", ["tell", "told", "telling", "tells"], 0, "used to + פועל בסיס: tell", ROW("👵", "📖")),
 Q(UT, "She ___ have long hair, but now it's short.", ["used to", "uses to", "is used", "use to"], 0, "פעם ארוך, היום קצר ← used to", "👩"),
 Q(UT, "Which is correct?", ["used to swim", "use to swam", "used to swam", "used swimming"], 0, "used to + פועל בסיס: swim", "🏊"),
 Q2(UT, "We ___ go to Eilat every summer. In 2020 we ___ Rome.", ["used to, visited", "use to, visited", "used to, visit", "were used, visited"], 0, "הרגל ← used to; פעם אחת ← visited", ROW("🏖️", "🇮🇹")),
 Q2(UT, "I ___ walk to school. I do it every day.", ["usually", "used to", "use to", "am used"], 0, "הרגל של היום ← usually (used to = רק בעבר)", ROW("🚶", "🏫")),
]))

C.append(("used to: negatives & questions", [UT], [
 Q(UT, "I ___ like vegetables, but now I love them.", ["didn't use to", "didn't used to", "not used to", "don't use to"], 0, "בשלילה: didn't use to (בלי d)", "🥦"),
 Q(UT, "___ you use to live in Tel Aviv?", ["Did", "Do", "Were", "Are"], 0, "שאלה בעבר ← Did + use to", "🏙️"),
 Q(UT, "\"Did you use to have a dog?\" Which answer is correct?", ["Yes, I did", "Yes, I used", "Yes, I was", "Yes, I do"], 0, "Did you…? ← Yes, I did", "🐕"),
 Q(UT, "He didn't ___ to wear glasses.", ["use", "used", "uses", "using"], 0, "אחרי didn't ← use, בלי d", ROW("👦", "👓")),
 Q(UT, "Thirty years ago, people ___ have smartphones.", ["didn't use to", "used to", "don't", "aren't"], 0, "פעם לא היו סמארטפונים ← didn't use to", "📱"),
 Q(UT, "My brother used to be shy, but now he's very ___.", ["friendly", "shy", "quiet", "afraid"], 0, "but = ניגוד ← פעם ביישן, היום חברותי", "👦"),
 Q(UT, "Where ___ your grandparents use to live?", ["did", "do", "were", "are"], 0, "שאלה על העבר ← did + use to", ROW("👴", "👵", "🏠")),
 Q(UT, "\"I didn't use to like tea.\" Do I like it now?", ["Yes, I do", "No, never", "No, I don't", "I hate it"], 0, "פעם לא אהבתי ← היום כן", "🍵"),
 Q(UT, "used to or Past Simple? I ___ to Paris last year.", ["went", "used to go", "use to go", "was used"], 0, "פעם אחת, last year ← Past Simple", ROW("🗼", "📅")),
 Q(UT, "Dinosaurs ___ live on Earth.", ["used to", "use to", "uses to", "are used"], 0, "חיו פעם, היום כבר לא ← used to", "🦕"),
 Q2(UT, "\"She used to live in Akko.\" – Where ___ use to live?", ["did she", "she did", "does she", "was she"], 0, "שאלה: Where + did + she + use to", ROW("👩", "🏘️")),
 Q2(UT, "Find the mistake: \"I didn't used to like fish.\"", ["used → use", "didn't → don't", "like → liked", "fish → fishes"], 0, "אחרי didn't ← use, בלי d", ROW("🐟", "🙅")),
]))

# ───────────── Word building ─────────────
C.append(("Word building: -tion · -ment · -ful · -less", [WF], [
 Q(WF, "Noun of invent?", ["invention", "inventful", "inventment", "inventless"], 0, "invent + ion ← שם עצם: invention (המצאה)", PW("💡", "invent → ?")),
 Q(WF, "Noun of pollute?", ["pollution", "pollutement", "polluteful", "pollutness"], 0, "pollute ← pollution = זיהום", PW("🏭", "pollute → ?")),
 Q(WF, "Noun of enjoy?", ["enjoyment", "enjoytion", "enjoyful", "enjoyness"], 0, "enjoy + ment = enjoyment (הנאה)", PW("😊", "enjoy → ?")),
 Q(WF, "Noun of inform?", ["information", "informful", "informless", "informent"], 0, "inform + ation = information (מידע)", PW("📢", "inform → ?")),
 Q(WF, "govern + ___ = government", ["-ment", "-ful", "-less", "-tion"], 0, "govern + ment = government (ממשלה)", TXT("govern + ?")),
 Q(WF, "A rainbow is very ___.", ["colorful", "colorless", "uncolor", "colortion"], 0, "ful = מלא ב- ← colorful = צבעוני", "🌈"),
 Q(WF, "Thank you! You were very ___.", ["helpful", "helpless", "unhelpful", "helpment"], 0, "help + ful = עוזר, מועיל", ROW("🤝", "😊")),
 Q(WF, "This knife doesn't cut. It's ___.", ["useless", "useful", "unuse", "usement"], 0, "less = בלי ← useless = חסר תועלת", "🔪"),
 Q(WF, "A ___ hero is never afraid.", ["fearless", "fearful", "unfear", "fearment"], 0, "fear + less = בלי פחד", "🦸"),
 Q(WF, "\"careless\" means:", ["לא זהיר", "זהיר מאוד", "אכפתי", "דאגה"], 0, "less = בלי ← בלי זהירות", TXT("careless")),
 Q2(WF, "Thank you for your ___ (kind).", ["kindness", "kindly", "kindful", "unkind"], 0, "kind + ness = שם עצם: טוּב לב", ROW("🎁", "🤝")),
 Q2(WF, "The team played ___ (bad) and lost.", ["badly", "bad", "worse", "badness"], 0, "איך שיחקו? ← תואר פועל: bad + ly", ROW("⚽", "😞")),
 Q2(WF, "The test was a big ___ for me. I got 100!", ["success", "succeed", "successful", "successfully"], 0, "a big + שם עצם ← success", PW("📝", "100")),
 Q2(WF, "In \"a careful driver\", careful is a/an:", ["adjective", "noun", "verb", "adverb"], 0, "מתאר את שם העצם driver ← adjective", ROW("🚗", "👨")),
]))

C.append(("Word building: un- · dis-", [WF], [
 Q(WF, "Opposite of happy?", ["unhappy", "dishappy", "happyless", "inhappy"], 0, "un + happy = לא שמח", PW("😊", "happy ↔ ?")),
 Q(WF, "Opposite of agree?", ["disagree", "unagree", "agreeless", "inagree"], 0, "dis + agree = לא מסכים", PW("👍", "agree ↔ ?")),
 Q(WF, "Opposite of appear?", ["disappear", "unappear", "appearless", "inappear"], 0, "dis + appear = להיעלם", PW("🎩", "appear ↔ ?")),
 Q(WF, "This shirt isn't comfortable. It's ___.", ["uncomfortable", "discomfortable", "comfortful", "incomfortable"], 0, "un + comfortable = לא נוח", "👕"),
 Q(WF, "The door is ___ (לא נעולה). Come in!", ["unlocked", "dislocked", "lockless", "inlocked"], 0, "un + locked = לא נעול", "🚪"),
 Q(WF, "He doesn't tell the truth. He is ___.", ["dishonest", "unhonest", "honestless", "inhonest"], 0, "dis + honest = לא ישר", "🤥"),
 Q(WF, "\"unfair\" means:", ["לא הוגן", "הוגן מאוד", "יריד", "הוגנות"], 0, "un = לא ← unfair = לא הוגן", TXT("unfair")),
 Q(WF, "It's ___ to swim here. There are sharks!", ["unsafe", "dissafe", "safeless", "insafe"], 0, "un + safe = לא בטוח", ROW("🦈", "🌊")),
 Q(WF, "Which prefix makes obey negative?", ["dis-", "un-", "-less", "-ful"], 0, "disobey = לא לציית", TXT("? + obey")),
 Q(WF, "Opposite of careful?", ["careless", "uncareful", "discareful", "carement"], 0, "ful (עם) ↔ less (בלי)", PW("⚠️", "careful ↔ ?")),
 Q2(WF, "If you work hard, you will ___ (success).", ["succeed", "success", "successful", "successfully"], 0, "אחרי will ← פועל: succeed", ROW("💪", "🏆")),
 Q2(WF, "Find the mistake: \"She sings beautiful.\"", ["beautiful → beautifully", "sings → sing", "She → Her", "sings → song"], 0, "איך היא שרה? ← beautifully", ROW("👩", "🎤")),
 Q2(WF, "___ (lucky), it started to rain during the picnic.", ["Unluckily", "Unlucky", "Luckless", "Disluckily"], 0, "un + lucky + ly = לרוע המזל", ROW("🧺", "🌧️")),
]))

# ───────────── Paragraphs & connectors ─────────────
C.append(("Writing a paragraph", [WR], [
 Q(WR, "Which sentence gives the main idea of a paragraph?", ["topic sentence", "supporting sentence", "concluding sentence", "a title"], 0, "משפט הנושא = הרעיון המרכזי", ROW("📄", "💡")),
 Q(WR, "A sentence that gives details and examples is a:", ["supporting sentence", "topic sentence", "title", "question"], 0, "משפט תומך = פרטים ודוגמאות", ROW("📄", "🔍")),
 Q(WR, "The last sentence, which sums up, is the:", ["concluding sentence", "topic sentence", "supporting sentence", "first sentence"], 0, "משפט הסיכום בסוף הפסקה", ROW("📄", "🏁")),
 Q(WR, "\"In addition, dogs protect our homes.\" This is a:", ["supporting sentence", "topic sentence", "concluding sentence", "title"], 0, "מוסיף סיבה ← משפט תומך", ROW("🐕", "🏠")),
 Q(WR, "A paragraph starts: \"Dogs make great pets.\" This is a:", ["topic sentence", "supporting sentence", "concluding sentence", "question"], 0, "רעיון כללי בהתחלה ← משפט נושא", ROW("🐕", "❤️")),
 Q(WR, "\"To sum up, dogs are wonderful pets.\" This is a:", ["concluding sentence", "topic sentence", "supporting sentence", "title"], 0, "To sum up ← משפט סיכום", ROW("🐕", "📄")),
 Q(WR, "Which phrase introduces an example?", ["for example", "however", "therefore", "although"], 0, "for example = לדוגמה", ROW("📄", "👉")),
 Q(WR, "Which phrase starts a conclusion?", ["In conclusion", "For example", "In addition", "However"], 0, "In conclusion = לסיכום", ROW("📄", "🏁")),
 Q(WR, "Which word adds another point?", ["Moreover", "However", "Although", "Therefore"], 0, "Moreover = יתרה מזו, בנוסף", ROW("📄", "➕")),
 Q(WR, "Put the paragraph parts in order:", ["A, C, B", "A, B, C", "C, A, B", "B, C, A"], 0, "נושא ← פרטים ← סיכום", TXT("A = topic", "B = conclusion", "C = details")),
 Q2(WR, "Which phrase starts an opinion?", ["In my opinion", "For example", "To sum up", "Best wishes"], 0, "In my opinion = לדעתי", ROW("💬", "🤔")),
 Q2(WR, "How can you end an informal email to a friend?", ["Best wishes", "Dear Dana", "In addition", "For example"], 0, "Best wishes = סיום של מייל", ROW("📧", "👋")),
 Q2(WR, "Which sentence does NOT belong in a paragraph about pets?", ["I hate Mondays.", "Dogs are loyal.", "Cats are clean.", "Fish are quiet."], 0, "סוטה מהנושא (חיות מחמד)", ROW("🐕", "🐈", "🐟")),
]))

C.append(("although · however · therefore · in addition", [WR], [
 Q(WR, "The tickets were expensive. ___, we bought them.", ["However", "Therefore", "Although", "Because"], 0, "ניגוד בין שני משפטים ← However", ROW("🎫", "💸")),
 Q(WR, "He didn't study. ___, he failed the test.", ["Therefore", "However", "Although", "In addition"], 0, "תוצאה ← Therefore = לכן", ROW("📚", "❌")),
 Q(WR, "___ she had a map, she got lost.", ["Although", "However", "Therefore", "In addition"], 0, "למרות ש… ← Although", ROW("🗺️", "😕")),
 Q(WR, "Swimming is fun. ___, it keeps you healthy.", ["In addition", "However", "Although", "Therefore"], 0, "מוסיפים יתרון ← In addition", ROW("🏊", "💪")),
 Q(WR, "\"therefore\" means:", ["לכן", "למרות ש", "בנוסף", "אולם"], 0, "therefore = לכן", TXT("therefore")),
 Q(WR, "\"Although it rained, we played.\" means:", ["שיחקנו למרות הגשם", "שיחקנו בגלל הגשם", "לא שיחקנו בגשם", "שיחקנו לפני הגשם"], 0, "although = למרות ש", ROW("🌧️", "⚽")),
 Q(WR, "\"in addition\" means:", ["בנוסף", "לכן", "אולם", "למרות ש"], 0, "in addition = בנוסף", TXT("in addition")),
 Q(WR, "The roads were icy. ___, the school was closed.", ["Therefore", "However", "Although", "But"], 0, "תוצאה ← Therefore", ROW("❄️", "🛣️", "🏫")),
 Q(WR, "The film got great reviews. ___, I found it boring.", ["However", "Therefore", "In addition", "Because"], 0, "ניגוד ← However", ROW("🎬", "😑")),
 Q(WR, "Which connector shows a result?", ["therefore", "although", "however", "in addition"], 0, "therefore = לכן ← תוצאה", ROW("➡️", "✅")),
 Q2(WR, "___ the rain, the game went on.", ["Despite", "Although", "However", "Because"], 0, "Despite + שם עצם = למרות", ROW("🌧️", "⚽")),
 Q2(WR, "The flight was late ___ the storm.", ["because of", "because", "so", "although"], 0, "because of + שם עצם = בגלל", ROW("✈️", "⛈️")),
 Q2(WR, "Which of these fits? He trained daily. ___, he won.", ["As a result", "However", "Although", "Despite this"], 0, "As a result = כתוצאה מכך", ROW("🏃", "🏆")),
 Q2(WR, "Which of these fits? Dana loves sport, ___ her brother hates it.", ["whereas", "because", "so", "therefore"], 0, "whereas = ואילו (ניגוד בין שניים)", ROW("👧", "⚽", "👦")),
]))

# ───────────── Words: environment & technology ─────────────
C.append(("The environment", [VE], [
 Q(VE, "בצורת = ?", ["drought", "flood", "storm", "desert"], 0, "בצורת = drought", ROW("☀️", "🥀")),
 Q(VE, "שיטפון, הצפה = ?", ["flood", "drought", "fire", "wave"], 0, "שיטפון = flood", ROW("🌊", "🏠")),
 Q(VE, "Dinosaurs are ___ – there are none left.", ["extinct", "endangered", "alive", "wild"], 0, "נכחדו = extinct", ROW("🦕", "🦖")),
 Q(VE, "Animals that live free in nature are called ___.", ["wildlife", "pets", "farm animals", "toys"], 0, "חיות בר = wildlife", ROW("🦌", "🦉", "🦊")),
 Q(VE, "בית גידול (של בעלי חיים) = ?", ["habitat", "habit", "harbor", "hobby"], 0, "בית גידול = habitat", ROW("🐸", "🌿")),
 Q(VE, "משאבים (מים, נפט, עצים) = ?", ["resources", "results", "reasons", "rules"], 0, "משאבים = resources", ROW("💧", "🛢️", "🌲")),
 Q(VE, "Sun and wind never run out. They are ___ energy sources.", ["renewable", "extinct", "harmful", "polluted"], 0, "מתחדשת = renewable", ROW("☀️", "💨")),
 Q(VE, "אסון = ?", ["disaster", "danger", "damage", "desert"], 0, "אסון = disaster", ROW("🌋", "🆘")),
 Q(VE, "Smoke from factories can ___ our lungs.", ["harm", "help", "save", "heal"], 0, "לפגוע = harm", ROW("🏭", "💨")),
 Q(VE, "Many animals can't ___ without water.", ["survive", "survey", "serve", "supply"], 0, "לשרוד = survive", ROW("🐪", "💧")),
 Q2(VE, "If we waste water, we'll run ___ of it.", ["out", "off", "away", "up"], 0, "run out of = ייגמר לנו", ROW("🚰", "💧")),
 Q2(VE, "Turn ___ the lights when you leave the room.", ["off", "up", "away", "in"], 0, "turn off = לכבות", ROW("💡", "🚪")),
]))

C.append(("Science & technology", [VE], [
 Q(VE, "מחקר = ?", ["research", "result", "report", "rescue"], 0, "מחקר = research", ROW("🔬", "📊")),
 Q(VE, "להמציא = ?", ["invent", "discover", "prevent", "explore"], 0, "להמציא = invent", ROW("💡", "⚙️")),
 Q(VE, "לגלות (משהו שכבר קיים) = ?", ["discover", "invent", "develop", "design"], 0, "לגלות = discover", ROW("🔭", "⭐")),
 Q(VE, "Edison ___ the light bulb.", ["invented", "discovered", "explored", "reported"], 0, "המציא דבר חדש = invented", ROW("💡", "👨‍🔬")),
 Q(VE, "מקוון, באינטרנט = ?", ["online", "offline", "on time", "outside"], 0, "באינטרנט = online", ROW("💻", "🌐")),
 Q(VE, "תוכנה = ?", ["software", "hardware", "keyboard", "network"], 0, "תוכנה = software", ROW("💻", "💾")),
 Q(VE, "A machine that does human jobs is a ___.", ["robot", "rocket", "robber", "ribbon"], 0, "רובוט = robot", ROW("🏭", "⚙️")),
 Q(VE, "Without Wi-Fi I can't ___ to the internet.", ["connect", "collect", "correct", "protect"], 0, "להתחבר = connect", ROW("📶", "💻")),
 Q(VE, "לפתח (מוצר, טכנולוגיה) = ?", ["develop", "deliver", "destroy", "describe"], 0, "לפתח = develop", ROW("👩‍💻", "📱")),
 Q(VE, "A small program on your phone is an ___.", ["app", "ape", "apple", "aim"], 0, "יישומון = app", ROW("📱", "👆")),
 Q2(VE, "Please pay ___ to the safety instructions.", ["attention", "interest", "care", "notice"], 0, "pay attention = לשים לב", ROW("🔬", "⚠️")),
 Q2(VE, "I forgot ___ my phone. Now it's dead.", ["to charge", "charge", "charged", "to charging"], 0, "forget + to + פועל = שכחתי לעשות", ROW("📱", "🔋")),
]))

# ───────────── Words: health & travel ─────────────
C.append(("Health", [VH], [
 Q(VH, "בריא = ?", ["healthy", "wealthy", "heavy", "happy"], 0, "בריא = healthy", ROW("🥗", "💪")),
 Q(VH, "Fruit and vegetables are part of a healthy ___.", ["diet", "diary", "dirt", "deal"], 0, "תזונה = diet", ROW("🍎", "🥦")),
 Q(VH, "פעילות גופנית = ?", ["exercise", "exam", "exit", "example"], 0, "פעילות גופנית = exercise", ROW("🏃", "🚴")),
 Q(VH, "I have a pain in my head. It's a ___.", ["headache", "toothache", "stomachache", "backache"], 0, "כאב ראש = headache", ROW("🤕", "💊")),
 Q(VH, "The doctor gave me ___ for my cough.", ["medicine", "magazine", "machine", "message"], 0, "תרופה = medicine", ROW("👨‍⚕️", "🤧")),
 Q(VH, "פצוע = ?", ["injured", "invited", "involved", "invented"], 0, "פצוע = injured", ROW("🤕", "🚑")),
 Q(VH, "חום (כשחולים) = ?", ["fever", "flavor", "favor", "feather"], 0, "חום גבוה = fever", ROW("🤒", "🌡️")),
 Q(VH, "Smoking is ___ for your health.", ["harmful", "helpful", "healthy", "careful"], 0, "מזיק = harmful", ROW("🚬", "🚭")),
 Q(VH, "לנוח = ?", ["rest", "test", "rush", "race"], 0, "לנוח = rest", ROW("🛋️", "😌")),
 Q(VH, "מחלה = ?", ["disease", "decrease", "desert", "degree"], 0, "מחלה = disease", ROW("🦠", "🤒")),
 Q2(VH, "Don't give ___! You can finish the race.", ["up", "away", "on", "at"], 0, "give up = לוותר", ROW("🏃", "🏁")),
 Q2(VH, "My dad stopped ___ last year. He feels healthier.", ["smoking", "smoke", "smoked", "smokes"], 0, "stop + ing = הפסיק לעשות", ROW("🚭", "👨")),
]))

C.append(("Travel", [VH], [
 Q(VH, "להזמין מראש (חדר, כרטיס) = ?", ["book", "borrow", "bring", "build"], 0, "להזמין מראש = to book", ROW("🏨", "🎫")),
 Q(VH, "זר, של ארץ אחרת = ?", ["foreign", "forest", "famous", "friendly"], 0, "זר = foreign", ROW("🌍", "🗣️")),
 Q(VH, "At the airport: Departures and ___.", ["Arrivals", "Arrives", "Passengers", "Flights"], 0, "נחיתות, הגעות = Arrivals", ROW("🛫", "🧳")),
 Q(VH, "המראה, יציאה = ?", ["departure", "delay", "destination", "direction"], 0, "יציאה = departure", ROW("🛫", "🕒")),
 Q(VH, "Our ___ showed us the old city.", ["guide", "guest", "gate", "goal"], 0, "מדריך טיולים = guide", ROW("🚶", "🏰")),
 Q(VH, "We went ___ – we saw museums and palaces.", ["sightseeing", "shopping", "sailing", "skiing"], 0, "סיור באתרים = sightseeing", ROW("📸", "🏛️")),
 Q(VH, "לחקור, לסייר = ?", ["explore", "explain", "export", "expect"], 0, "לחקור = explore", ROW("🧭", "🗺️")),
 Q(VH, "גבול (בין מדינות) = ?", ["border", "order", "board", "harbor"], 0, "גבול = border", ROW("🛂", "🚧")),
 Q(VH, "נוף = ?", ["view", "voice", "visit", "video"], 0, "נוף = view", ROW("🏞️", "👀")),
 Q(VH, "מקומי = ?", ["local", "lovely", "lonely", "loud"], 0, "מקומי = local", ROW("🏘️", "🧑")),
 Q2(VH, "Can you look ___ my cat while I'm away?", ["after", "for", "at", "up"], 0, "look after = לשמור על, לטפל", ROW("🐈", "🧳")),
 Q2(VH, "The plane took ___ at 6 a.m.", ["off", "up", "out", "on"], 0, "take off = להמריא", ROW("✈️", "🕕")),
 Q2(VH, "I'm looking forward to ___ Rome next month.", ["visiting", "visit", "visited", "to visit"], 0, "looking forward to + ing", ROW("🇮🇹", "📅")),
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
 Q(VM, "Fake news is news that is ___.", ["not true", "very new", "very long", "funny"], 0, "fake = מזויף, לא אמיתי", ROW("📰", "📱")),
 Q(VM, "צופים (בטלוויזיה) = ?", ["viewers", "readers", "listeners", "writers"], 0, "צופים = viewers", ROW("📺", "👀")),
 Q(VM, "A website where you share your thoughts is a ___.", ["blog", "bag", "bug", "plug"], 0, "יומן ברשת = blog", ROW("💻", "✍️")),
 Q2(VM, "The editor has to ___ a decision today.", ["make", "do", "give", "get"], 0, "make a decision = לקבל החלטה", ROW("📰", "✍️")),
]))

C.append(("More feelings", [VM], [
 Q(VM, "I found my lost dog. Phew! I feel ___ (הוקל לי).", ["relieved", "jealous", "bored", "ashamed"], 0, "הוקל לי = relieved", ROW("🐕", "🔍")),
 Q(VM, "מתוסכל = ?", ["frustrated", "frightened", "friendly", "famous"], 0, "מתוסכל = frustrated", ROW("😤", "🧩")),
 Q(VM, "סקרן = ?", ["curious", "careful", "cruel", "cheerful"], 0, "סקרן = curious", ROW("🧐", "📦")),
 Q(VM, "The noise all night made me ___ (מעוצבן).", ["annoyed", "relaxed", "proud", "grateful"], 0, "מעוצבן = annoyed", ROW("🔊", "🌙")),
 Q(VM, "מבוהל מאוד = ?", ["terrified", "terrific", "satisfied", "surprised"], 0, "מבוהל = terrified (terrific = נהדר)", ROW("😱", "👻")),
 Q(VM, "I got 100 on the test. I'm ___ with my work.", ["satisfied", "frustrated", "ashamed", "anxious"], 0, "מרוצה = satisfied", PW("📝", "100")),
 Q(VM, "He cheated in the game and felt ___.", ["ashamed", "proud", "curious", "relieved"], 0, "מתבייש = ashamed", ROW("🎲", "🃏")),
 Q(VM, "חרד, מודאג = ?", ["anxious", "angry", "ancient", "amazing"], 0, "חרד = anxious", ROW("😰", "📝")),
 Q(VM, "עליז, שמח = ?", ["cheerful", "careful", "colorful", "useful"], 0, "עליז = cheerful", ROW("😄", "🌻")),
 Q(VM, "I couldn't believe the news. I was ___.", ["shocked", "bored", "calm", "relaxed"], 0, "בהלם = shocked", ROW("📰", "❗")),
 Q2(VM, "I enjoy ___ to music after school.", ["listening", "to listen", "listen", "listened"], 0, "enjoy + ing", ROW("🎧", "😊")),
 Q2(VM, "We decided ___ a puppy. We were so excited!", ["to adopt", "adopting", "adopt", "adopted"], 0, "decide + to + פועל", ROW("🐶", "🤩")),
 Q2(VM, "I hope ___ the test. I studied hard!", ["to pass", "passing", "pass", "passed"], 0, "hope + to + פועל", ROW("📝", "🤞")),
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
 Q(UN, "What is the article mainly about?", ["screens and sleep", "buying phones", "school exams", "healthy food"], 0, "כל הקטע: מסכים פוגעים בשינה", ROW("📰", "🔍")),
 Q(UN, "How many hours of sleep do teens need?", ["8–10 hours", "6–7 hours", "5 hours", "12 hours"], 0, "between eight and ten hours", ROW("🛏️", "🌙")),
 Q(UN, "What does blue light tell the brain?", ["it is daytime", "it is night", "it is cold", "it is late"], 0, "tells the brain that it is still daytime", ROW("📱", "🧠")),
 Q(UN, "In paragraph 2, \"produces\" means:", ["מייצר", "מאבד", "שומר", "מודד"], 0, "the body produces = הגוף מייצר", TXT("produces")),
 Q(UN, "When does the body repair itself?", ["during sleep", "during school", "after meals", "in the morning"], 0, "the body repairs itself during sleep", ROW("💪", "🔧")),
 Q(UN, "Where should your phone be at night?", ["in another room", "next to you", "under the pillow", "in your hand"], 0, "leave your phone in another room", ROW("📱", "🌙")),
 Q(UN, "\"Lack of sleep\" means:", ["not enough sleep", "too much sleep", "deep sleep", "a short dream"], 0, "lack = חוסר", TXT("lack of sleep")),
 Q(UN, "Tom sleeps six hours a night. He probably:", ["can't concentrate", "feels very fresh", "never gets sick", "needs less sleep"], 0, "מי שלא ישן מספיק – מתקשה להתרכז", ROW("👦", "🛏️")),
 Q(UN, "Which tip is NOT in the article?", ["drink more water", "read a book", "use an alarm", "fixed bedtime"], 0, "על שתיית מים לא כתוב בקטע", ROW("💡", "❓")),
 Q(UN, "The writer's main purpose is to:", ["give advice", "tell a story", "sell phones", "make us laugh"], 0, "הכותב נותן עצות לשינה טובה", ROW("✍️", "😴")),
 Q2(UN, "In paragraph 2, \"This light\" refers to:", ["blue light", "daylight", "a lamp", "the sun"], 0, "give off blue light. This light…", ROW("📱", "🧠")),
 Q2(UN, "Which paragraph explains how to sleep better?", ["paragraph 4", "paragraph 1", "paragraph 2", "paragraph 3"], 0, "So what can you do? – העצות", ROW("📄", "🔍")),
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
 Q(UN, "What kind of text is this?", ["a letter", "a news article", "an advertisement", "a poem"], 0, "Dear Grandma… Love, Maya ← מכתב", ROW("📄", "🇮🇸")),
 Q(UN, "How long has the family been in Iceland?", ["four days", "a week", "two days", "a month"], 0, "We arrived four days ago", ROW("📅", "🇮🇸")),
 Q(UN, "What does Maya compare the landscape to?", ["another planet", "a desert", "a big city", "the sea"], 0, "looks like another planet", ROW("🏔️", "🌋")),
 Q(UN, "Who is Einar?", ["a local guide", "Maya's uncle", "a fisherman", "a pilot"], 0, "a local guide called Einar", ROW("🧔", "🇮🇸")),
 Q(UN, "How did Maya feel near the volcano?", ["a little nervous", "very bored", "very angry", "proud"], 0, "I was a little nervous", ROW("🌋", "👧")),
 Q(UN, "What happened while they were swimming?", ["it started snowing", "Dad's glasses broke", "they saw whales", "a volcano erupted"], 0, "We were swimming when it started to snow", ROW("♨️", "🏊")),
 Q(UN, "Why will Ben probably be hungry?", ["won't eat fish", "no food left", "he is sick", "lost his money"], 0, "Ben refuses to try the fish soup", ROW("👦", "🍽️")),
 Q(UN, "\"active\" volcanoes are volcanoes that:", ["can still erupt", "are very old", "are under snow", "are very small"], 0, "פעיל = עדיין יכול להתפרץ", ROW("🌋", "🇮🇸")),
 Q(UN, "Einar says they ___ see whales.", ["might not", "will surely", "must", "have already"], 0, "we might not see any = אולי לא", ROW("🐋", "⛵")),
 Q(UN, "Why did Maya write to Grandma?", ["to share news", "to get money", "to complain", "to invite her"], 0, "היא מספרת לסבתא על הטיול", ROW("✍️", "👵")),
 Q2(UN, "Which happened FIRST?", ["they arrived", "the snowy swim", "the boat trip", "the volcano walk"], 0, "We arrived four days ago – לפני הכול", ROW("📅", "🇮🇸")),
 Q2(UN, "\"they don't always come close\" – \"they\" refers to:", ["the whales", "the tourists", "the boats", "the guides"], 0, "whales… they don't always come close", ROW("🐋", "⛵")),
 Q2(UN, "Which of these is Maya's opinion?", ["Yesterday was best", "Iceland has volcanoes", "Einar guides them", "They're in Reykjavik"], 0, "the best day ← דעה של מאיה", ROW("👧", "✍️")),
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
 Q(UN, "\"dropped\" (paragraph 2) means:", ["ירד", "נעלם", "גדל", "נשבר"], 0, "the number has dropped = המספר ירד", TXT("has dropped")),
 Q(UN, "Without bees, apples would become:", ["more expensive", "cheaper", "bigger", "sweeter"], 0, "would become rare and expensive", ROW("🍎", "🐝")),
 Q(UN, "Why should you choose local plants?", ["bees know them", "they are cheaper", "they grow faster", "they smell nicer"], 0, "local bees know them best", ROW("🌻", "🌷")),
 Q(UN, "\"enormous\" in the last paragraph means:", ["very big", "very small", "very fast", "very old"], 0, "tiny ≠ enormous ← ענק", TXT("enormous")),
 Q(UN, "The writer wants readers to:", ["help protect bees", "buy more honey", "avoid bees", "become farmers"], 0, "everyone can help ← לעזור לדבורים", ROW("🐝", "✍️")),
 Q(UN, "What can you put out for bees on hot days?", ["water", "chemical sprays", "some honey", "a big garden"], 0, "put out a small dish of water", ROW("☀️", "🐝")),
 Q2(UN, "Which paragraph explains why bees are disappearing?", ["paragraph 2", "paragraph 1", "paragraph 3", "paragraph 4"], 0, "There are several reasons… – פסקה 2", ROW("🐝", "📉")),
 Q2(UN, "\"local bees know them best\" – \"them\" refers to:", ["local plants", "chemical sprays", "hot days", "the bees"], 0, "Choose local plants, because… them", ROW("🌻", "🐝")),
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
 Q(UN, "Where was the shark in the video?", ["in a street", "in the ocean", "in a pool", "in a river"], 0, "swimming down a city street", ROW("🦈", "📱")),
 Q(UN, "Why did Omer believe the video?", ["millions watched it", "Shira said so", "news reported it", "he saw sharks"], 0, "two million views ← חשב שזה אמיתי", ROW("📱", "👦")),
 Q(UN, "Who is Shira?", ["Omer's sister", "a news presenter", "Omer's teacher", "a journalist friend"], 0, "his sister Shira, who studies journalism", ROW("📱", "🦈")),
 Q(UN, "Where did the shark picture really come from?", ["an older picture", "a news website", "a flood video", "Omer's phone"], 0, "a different picture, taken years earlier", ROW("🦈", "🔍")),
 Q(UN, "\"reliable\" means:", ["שאפשר לסמוך עליו", "מהיר", "מפורסם", "חדש"], 0, "reliable website = אתר אמין", TXT("reliable")),
 Q(UN, "How did Omer feel when he learned the truth?", ["embarrassed", "proud", "bored", "relieved"], 0, "Omer felt embarrassed", ROW("👦", "📱")),
 Q(UN, "Why do some people make fake stories?", ["to get attention", "to help others", "to learn English", "to find sharks"], 0, "to get attention or make money", ROW("📰", "📱")),
 Q(UN, "What did Omer learn?", ["check before sharing", "never use phones", "sharks are dangerous", "news is fake"], 0, "עוצרים ובודקים לפני ששולחים", ROW("👦", "📱")),
 Q(UN, "The writer's main purpose is to:", ["teach a lesson", "sell a program", "describe sharks", "describe a city"], 0, "הסיפור מלמד לבדוק חדשות", ROW("✍️", "📖")),
 Q(UN, "\"views\" (paragraph 1) means:", ["times watched", "nice places", "opinions", "pictures"], 0, "two million views = נצפה שני מיליון פעם", TXT("2,000,000 views")),
 Q2(UN, "What did Shira and Omer do FIRST?", ["checked news sites", "searched the photo", "sent a message", "called the police"], 0, "First, they looked… on news websites", ROW("📱", "🔍")),
 Q2(UN, "\"he shared it with all his friends\" – \"it\" refers to:", ["the video", "his phone", "the street", "the shark"], 0, "saw a video… he shared it", ROW("📱", "👥")),
 Q2(UN, "Which of these is an opinion?", ["Omer was silly", "Omer shared it", "Shira studies journalism", "Two million watched"], 0, "silly = דעה של מישהו, לא עובדה", ROW("📰", "🤔")),
], P4))

# ───────────── Review ─────────────
C.append(("חזרה כללית", [PF, PV, PP, FU, CI, CS, MD, QT, RP, PS, UT, WR, VE, VH, VM, WF], [
 Q(PF, "Have you done your homework ___?", ["yet", "since", "ago", "never"], 0, "בשאלה בסוף המשפט ← yet", ROW("📓", "❓")),
 Q(PF, "Third form (V3) of take?", ["taken", "took", "taked", "taking"], 0, "take – took – taken", PW("✋", "take → ?")),
 Q(PV, "I ___ this book three times. I love it!", ["have read", "has read", "am reading", "reading"], 0, "ניסיון עד עכשיו ← have + V3", ROW("📖", "❤️")),
 Q(PV, "We ___ the new museum when it opened in 2022.", ["visited", "visit", "has visited", "have visited"], 0, "in 2022 = זמן מוגדר ← Past Simple", ROW("🏛️", "📅")),
 Q(PP, "What ___ you doing when I called?", ["were", "was", "did", "are"], 0, "you ← were + ing", ROW("📞", "❓")),
 Q(FU, "I've decided. I ___ learn to play the drums.", ["am going to", "will to", "going", "did"], 0, "החלטה מראש ← going to", ROW("🥁", "🎶")),
 Q(CI, "If you ___ me, I'll help you.", ["call", "will call", "called", "calling"], 0, "אחרי If ← הווה", ROW("📞", "🤝")),
 Q(CS, "Of all my friends, Dan lives the ___ (far) from school.", ["farthest", "farther", "most far", "farest"], 0, "far – farther – the farthest", ROW("🏠", "🏫")),
 Q(PS, "Paper ___ from trees.", ["is made", "is make", "makes", "made"], 0, "הנייר לא עושה ← is + V3: is made", ROW("🌳", "📄")),
 Q(MD, "It's very late. We ___ go home now.", ["should", "might not", "don't have to", "mustn't"], 0, "עצה ← should", ROW("🌙", "🏠")),
 Q(QT, "How ___ brothers do you have?", ["many", "much", "little", "a little"], 0, "brothers נספר ← How many", ROW("👦", "👦", "❓")),
 Q(RP, "The woman ___ helped us was very kind.", ["who", "which", "where", "whose"], 0, "אדם ← who", ROW("👩", "🤝")),
 Q(WR, "I was tired. ___, I finished my work.", ["However", "Therefore", "In addition", "Because"], 0, "ניגוד ← However", ROW("😴", "✅")),
 Q(WR, "It was late, ___ we took a taxi.", ["so", "although", "however", "because"], 0, "תוצאה בתוך המשפט ← so", ROW("🌙", "🚕")),
 Q(VE, "Polar bears may lose their ___ when ice melts.", ["habitat", "habit", "hobby", "harbor"], 0, "בית הגידול של הדובים = הקרח", ROW("🐻", "❄️", "💧")),
 Q(UT, "When he was young, my grandpa ___ work on a farm.", ["used to", "use to", "was use", "uses to"], 0, "הרגל בעבר שנגמר ← used to", ROW("👴", "🚜")),
 Q(VH, "Ask a ___ – he was born here and knows the way.", ["local", "tourist", "guest", "foreigner"], 0, "תושב המקום = a local", ROW("🗺️", "🧓")),
 Q(VH, "I have a fever. I need to ___ in bed.", ["rest", "race", "rush", "test"], 0, "לנוח במיטה = rest", ROW("🤒", "🛏️")),
 Q(WF, "He forgot his keys again. He's so ___.", ["careless", "careful", "uncareful", "careness"], 0, "less = בלי ← careless = לא זהיר", ROW("🔑", "🤦")),
 Q(VM, "Before the big test, I felt ___.", ["anxious", "cheerful", "relieved", "satisfied"], 0, "לפני מבחן ← חרד = anxious", ROW("📝", "⏰")),
]))

# station type on the map
KINDS = {c[0]: "gram" for c in C if c[1][0] in (PF, PV, PP, FU, CI, CS, MD, QT, RP, PS, UT, WR)}
KINDS.update({c[0]: "word" for c in C if c[1][0] in (VE, VH, VM, WF)})
KINDS.update({c[0]: "read" for c in C if c[1][0] == UN})
KINDS["חזרה כללית"] = "rev"

# Band II words taught in this set – every one must be a correct answer somewhere (build_set.py checks).
WORD_LIST = """drought|flood|extinct|wildlife|habitat|resources|renewable|disaster|harm|survive|
research|invent|discover|online|software|robot|connect|develop|app|
healthy|diet|exercise|headache|medicine|injured|fever|harmful|rest|disease|
book|foreign|arrival|departure|guide|sightseeing|explore|border|view|local|
advertisement|media|article|interview|headline|live|presenter|viewer|blog|
relieved|frustrated|curious|annoyed|terrified|satisfied|ashamed|anxious|cheerful|shocked|embarrassed""".replace("\n", "").split("|")
