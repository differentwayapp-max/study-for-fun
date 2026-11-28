# Practice set: English, grade 7 – start of grade 7 review: Present Simple + a word review (weather, nature, actions, describing words) and a reading passage.
# Run: python3 -I tools/build_set.py tools/sets/en7_nov26.py
PS, WE, NP, AW, DW, EW, UN = "Present Simple", "Weather words", "Nature & places", "Action words", "Describing words", "Everyday words", "Unseen"

SET = dict(name="English ז' – start of grade 7 review", grade=6, subject="אנגלית",
           title="Start of grade 7 review · Present Simple · Words",
           desc="חזרה לתחילת כיתה ז': Present Simple (has, does, don't, שאלות, always / never), כ-110 מילים (מזג אוויר, טבע ומקומות, פעולות, תיאור) וקטע קריאה",
           desc_en="Start of grade 7 review: Present Simple (has, does, don't, questions, always / never), about 110 words (weather, nature and places, actions, describing words) and a reading passage",
           tags=["Present Simple", "has / does", "always / never", "Weather", "Nature", "Unseen"],
           examDate="", dailyGoal=2, perRound=13,
           topics=[PS, WE, NP, AW, DW, EW, UN])
MAX_Q_WORDS = 10

# (title, topics, [ (topic, question, [options], answer_index, explanation, scene) ])
# scene: list of (emoji, x, y, size)  — or a single emoji string → centered.
def Q(t, q, opts, ans, expl, sc, lvl=1):
    r = (t, q, opts, ans, expl, sc)
    return r + (2,) if lvl == 2 else r          # lvl=2: a test-level question (a 7th field 2 – "⭐ שלב מבחן")
def Q2(*a): return Q(*a, lvl=2)
def ROW(*es):
    """The things the question talks about, side by side."""
    n = len(es); s = min(40, 125 / n); step = min(92 / n, s / 1.6 * 1.35)
    return [(e, round(50 + (j - (n - 1) / 2) * step, 1), 52, round(s)) for j, e in enumerate(es)]

C = []

C.append(("Present Simple: he / she / it", [PS], [
 (PS, "She ___ to the pool every Monday.", ["go", "goes", "going", "gone"], 1, "she ← מוסיפים es: goes", [("👧", 32, 55, 40), ("🏊‍♀️", 72, 55, 40)]),
 (PS, "He ___ with his toys.", ["play", "plays", "playing", "to play"], 1, "he ← מוסיפים s: plays", [("👦", 35, 50, 42), ("🧸", 68, 62, 26), ("🚂", 82, 35, 20)]),
 (PS, "The sun ___ in the east.", ["rise", "rises", "rising", "to rise"], 1, "השמש = it ← rises", [("🌅", 50, 52, 60)]),
 (PS, "My cat ___ fish for dinner.", ["eat", "eats", "eating", "to eat"], 1, "החתול = it ← eats", [("🐈", 35, 55, 44), ("🐟", 72, 60, 30)]),
 (PS, "They ___ in the river.", ["swim", "swims", "swimming", "to swim"], 0, "they = רבים ← בלי s", [("🏊", 32, 55, 34), ("🏊‍♀️", 68, 55, 34), ("🌊", 50, 82, 30)]),
 (PS, "It ___ a lot in winter.", ["rain", "rains", "raining", "to rain"], 1, "it ← rains", [("🌧️", 40, 45, 48), ("❄️", 75, 30, 22)]),
 (PS, "Grandpa ___ the news every evening.", ["watch", "watches", "watchs", "watching"], 1, "אחרי ch מוסיפים es", [("👴", 30, 55, 40), ("📺", 70, 52, 38), ("🌙", 85, 18, 18)]),
 (PS, "I ___ up at seven.", ["wake", "wakes", "waking", "to wake"], 0, "I ← בלי s", [("⏰", 35, 50, 40), ("🛏️", 70, 62, 40)]),
 (PS, "The baby ___ because it's sad.", ["cry", "crys", "cries", "crying"], 2, "y אחרי עיצור ← ies", [("👶", 50, 52, 52), ("💧", 70, 40, 14)]),
 (PS, "We ___ time in the park.", ["spend", "spends", "spending", "to spend"], 0, "we = רבים ← בלי s", [("👪", 40, 60, 44), ("🌳", 78, 45, 40)]),
 (PS, "Snow ___ in spring.", ["melt", "melts", "melting", "to melt"], 1, "השלג = it ← melts", [("☀️", 25, 25, 30), ("⛄", 60, 60, 46)]),
 (PS, "The farmer ___ apples to shops.", ["sell", "sells", "selling", "to sell"], 1, "farmer = he ← sells", [("👨‍🌾", 30, 55, 44), ("🍎", 62, 66, 22), ("🏪", 80, 35, 26)]),
 (PS, "Mom ___ eggs in a pan.", ["fry", "frys", "fries", "frying"], 2, "y אחרי עיצור ← ies", [("👩", 32, 55, 40), ("🍳", 70, 58, 38)]),
 Q2(PS, "Look! The cat ___ on my bed.", ["is sleeping", "sleeps", "sleep", "sleeping"], 0, "Look! ← קורה עכשיו: is + ing", ROW("🐈", "🛏️")),
 Q2(PS, "Every Friday, Mom ___ a cake for us.", ["bakes", "is baking", "bake", "baking"], 0, "every Friday = הרגל ← Present Simple", ROW("👩", "🎂", "📅")),
 Q2(PS, "Shh! Grandpa ___ the news right now.", ["is watching", "watches", "watch", "watching"], 0, "right now ← is + ing", ROW("👴", "📺")),
 Q2(PS, "Find the mistake: 'He go to school by bus.'", ["go → goes", "He → His", "by → in", "bus → buses"], 0, "he ← מוסיפים es: goes", ROW("👦", "🚌", "🏫")),
 Q2(PS, "She ___ tea, but her brother ___ coffee.", ["drinks, drinks", "drink, drinks", "drinks, drink", "drinking, drinks"], 0, "she / brother ← שניהם עם s", ROW("👧", "🍵", "👦", "☕")),
]))

C.append(("Weather", [WE], [
 (WE, "What is falling?", ["rain", "snow", "wind", "ice"], 0, "גשם = rain", "🌧️"),
 (WE, "What is this?", ["cloud", "sea", "roof", "field"], 0, "ענן = cloud", "☁️"),
 (WE, "What is this?", ["snow", "rain", "heat", "shade"], 0, "שלג = snow", [("🌨️", 30, 30, 30), ("⛄", 58, 60, 50)]),
 (WE, "רוח = ?", ["wind", "wave", "ice", "cloud"], 0, "רוח = wind", [("🍃", 35, 45, 30), ("💨", 65, 50, 34)]),
 (WE, "Rain, thunder and wind: a ___.", ["storm", "river", "heat", "scarf"], 0, "סערה = storm", [("⛈️", 50, 40, 50), ("💨", 75, 72, 26)]),
 (WE, "קרח = ?", ["ice", "snow", "bone", "hole"], 0, "קרח = ice", "⛸️"),
 (WE, "חום = ?", ["heat", "ice", "wind", "shade"], 0, "חום = heat", [("☀️", 30, 30, 34), ("🥵", 62, 60, 40)]),
 (WE, "Five degrees below zero. It's ___.", ["freezing", "warm", "pleasant", "strange"], 0, "מתחת לאפס = קפוא = freezing", [("🌡️", 50, 50, 50)]),
 (WE, "מזג אוויר = ?", ["weather", "season", "sea", "sweat"], 0, "מזג אוויר = weather", "🌦️"),
 (WE, "עונה = ?", ["season", "sailor", "scarf", "skin"], 0, "עונה = season", [("🌸", 25, 35, 24), ("☀️", 75, 35, 24), ("🍂", 25, 72, 24), ("❄️", 75, 72, 24)]),
 (WE, "It is 30 ___.", ["degrees", "zeros", "rivers", "waves"], 0, "30° = 30 מעלות", [("🌡️", 50, 50, 50)]),
 (WE, "It rains. My coat is ___.", ["wet", "curly", "low", "famous"], 0, "רטוב = wet", [("🧥", 45, 58, 44), ("💧", 70, 35, 16), ("🌧️", 50, 18, 26)]),
 (WE, "Sunny and warm: a ___ day.", ["pleasant", "curly", "heavy", "worried"], 0, "נעים = pleasant", [("🌤️", 40, 35, 40), ("😊", 68, 66, 30)]),
]))

C.append(("Present Simple: don't / doesn't", [PS], [
 (PS, "She ___ like snow.", ["don't", "doesn't", "isn't", "aren't"], 1, "she ← doesn't", [("👧", 35, 55, 40), ("❄️", 70, 35, 24), ("👎", 72, 70, 20)]),
 (PS, "They ___ live in the city.", ["don't", "doesn't", "isn't", "not"], 0, "they ← don't", [("👫", 30, 60, 38), ("🏙️", 72, 50, 40), ("❌", 72, 50, 20)]),
 (PS, "He doesn't ___ chicken.", ["eat", "eats", "eating", "ate"], 0, "אחרי doesn't ← בלי s", [("👦", 35, 55, 40), ("🍗", 70, 55, 28), ("❌", 70, 55, 16)]),
 (PS, "I ___ go fishing.", ["don't", "doesn't", "am not", "not"], 0, "I ← don't", [("🎣", 45, 50, 46), ("❌", 70, 30, 20)]),
 (PS, "It ___ snow in Eilat.", ["don't", "doesn't", "isn't", "aren't"], 1, "it ← doesn't", [("🏜️", 50, 55, 56), ("☀️", 78, 22, 22)]),
 (PS, "We ___ swim in winter.", ["don't", "doesn't", "isn't", "aren't"], 0, "we ← don't", [("🏊", 40, 60, 36), ("❄️", 72, 30, 26), ("❌", 40, 60, 18)]),
 (PS, "My dog doesn't ___ up trees.", ["climb", "climbs", "climbing", "climbed"], 0, "אחרי doesn't ← בלי s", [("🐕", 32, 62, 38), ("🌳", 72, 50, 44)]),
 (PS, "Dad ___ wear a scarf.", ["doesn't", "don't", "isn't", "aren't"], 0, "dad = he ← doesn't", [("👨", 38, 55, 40), ("🧣", 72, 55, 30), ("❌", 72, 55, 16)]),
 (PS, "You ___ need a coat.", ["don't", "doesn't", "isn't", "not"], 0, "you ← don't", [("🧥", 40, 55, 40), ("☀️", 75, 25, 28)]),
 (PS, "Cats ___ fly.", ["don't", "doesn't", "isn't", "aren't"], 0, "cats = רבים ← don't", [("🐈", 35, 65, 36), ("🐦", 70, 30, 26)]),
 (PS, "She doesn't ___ TV.", ["watch", "watches", "watching", "watched"], 0, "אחרי doesn't ← בלי s", [("👧", 32, 55, 38), ("📺", 70, 52, 36), ("❌", 70, 52, 16)]),
 (PS, "Which sentence about him is correct?", ["He don't play", "He doesn't play", "He not play", "He doesn't plays"], 1, "he ← doesn't + פועל בלי s", [("👦", 50, 50, 46)]),
 (PS, "Which sentence about her is correct?", ["She don't swim", "She doesn't swims", "She doesn't swim", "She not swim"], 2, "she ← doesn't + פועל בלי s", [("👧", 40, 50, 40), ("🏊‍♀️", 72, 62, 24), ("❌", 72, 62, 30)]),
 Q2(PS, "'Dana likes snow.' Negative: Dana ___ snow.", ["doesn't like", "don't like", "doesn't likes", "isn't like"], 0, "doesn't + פועל בלי s", ROW("👧", "⛄")),
 Q2(PS, "'They live in Eilat.' Negative: They ___ in Eilat.", ["don't live", "doesn't live", "don't lives", "aren't live"], 0, "they ← don't + צורת בסיס", ROW("👫", "🏜️")),
 Q2(PS, "I ___ TV now. I'm doing my homework.", ["am not watching", "don't watching", "not watching", "isn't watching"], 0, "now ← am not + ing", ROW("📺", "📓")),
]))

C.append(("Nature & places", [NP], [
 (NP, "What is this?", ["mountain", "river", "field", "roof"], 0, "הר = mountain", "🏔️"),
 (NP, "ים = ?", ["sea", "river", "field", "hole"], 0, "ים = sea", [("🌊", 40, 60, 44), ("⛵", 70, 35, 22), ("🏖️", 22, 30, 22)]),
 (NP, "נהר = ?", ["river", "roof", "sea", "road"], 0, "נהר = river", [("🏞️", 50, 52, 56)]),
 (NP, "שדה = ?", ["field", "park", "city", "hole"], 0, "שדה = field", [("🌾", 35, 60, 38), ("🐄", 70, 58, 32)]),
 (NP, "What is this?", ["city", "field", "earth", "pool"], 0, "עיר = city", "🏙️"),
 (NP, "כדור הארץ = ?", ["planet Earth", "the moon", "the sun", "a city"], 0, "כדור הארץ = planet Earth", "🌍"),
 (NP, "On a map, up = ?", ["north", "south", "east", "west"], 0, "למעלה במפה = צפון", [("🧭", 50, 55, 46), ("⬆️", 50, 18, 20)]),
 (NP, "The sun rises in the ___.", ["east", "west", "north", "south"], 0, "השמש זורחת במזרח", [("🌅", 50, 52, 56)]),
 (NP, "The sun sets in the ___.", ["west", "east", "north", "south"], 0, "השמש שוקעת במערב", [("🌇", 50, 52, 56)]),
 (NP, "בריכת שחייה = ?", ["swimming pool", "river", "sea", "hole"], 0, "בריכת שחייה = swimming pool", [("🏊‍♀️", 50, 50, 50)]),
 (NP, "What is this?", ["park", "field", "roof", "sidewalk"], 0, "פארק = park", [("🌳", 22, 50, 34), ("⛲", 50, 58, 36), ("🌳", 78, 50, 34)]),
 (NP, "גג = ?", ["roof", "ground", "hole", "floor"], 0, "גג = roof", [("🏠", 50, 58, 54), ("⬆️", 50, 15, 18)]),
 (NP, "חור = ?", ["hole", "bone", "roof", "shade"], 0, "חור = hole", [("🐇", 40, 50, 30), ("🕳️", 62, 70, 40)]),
]))

C.append(("Present Simple: questions", [PS], [
 (PS, "___ she like ice cream?", ["Do", "Does", "Is", "Are"], 1, "she ← Does", [("👧", 35, 55, 40), ("🍦", 70, 50, 32)]),
 (PS, "___ they play football?", ["Do", "Does", "Is", "Am"], 0, "they ← Do", [("👫", 35, 55, 40), ("⚽", 70, 70, 24)]),
 (PS, "Does he ___ fishing?", ["go", "goes", "going", "went"], 0, "אחרי Does ← בלי s", [("👦", 35, 55, 40), ("🎣", 70, 50, 32)]),
 (PS, "___ you wake up early?", ["Do", "Does", "Is", "Are"], 0, "you ← Do", [("⏰", 50, 50, 46)]),
 (PS, "Does it ___ in winter?", ["rain", "rains", "raining", "rained"], 0, "אחרי Does ← בלי s", [("🌧️", 45, 45, 46), ("❄️", 75, 30, 20)]),
 (PS, "Where ___ he live?", ["does", "do", "is", "are"], 0, "he ← does", [("👦", 35, 55, 38), ("🏠", 70, 55, 38), ("❓", 50, 18, 20)]),
 (PS, "What ___ you eat?", ["do", "does", "are", "is"], 0, "you ← do", [("🍽️", 50, 55, 44), ("❓", 75, 25, 20)]),
 (PS, "When ___ the sun rise?", ["does", "do", "is", "are"], 0, "השמש = it ← does", [("🌅", 45, 55, 46), ("⏰", 78, 25, 20)]),
 (PS, "___ your dad cook?", ["Does", "Do", "Is", "Are"], 0, "dad = he ← Does", [("👨‍🍳", 50, 52, 50)]),
 (PS, "Do fish ___ in the sea?", ["live", "lives", "living", "lived"], 0, "אחרי do ← בלי s", [("🐟", 40, 55, 34), ("🌊", 60, 75, 36)]),
 (PS, "Which question about her is correct?", ["Do she sing?", "Does she sing?", "Does she sings?", "Is she sing?"], 1, "she ← Does + פועל בלי s", [("👧", 40, 55, 40), ("🎤", 70, 50, 26)]),
 (PS, "Which question about them is correct?", ["Does they run?", "Do they runs?", "Do they run?", "Are they run?"], 2, "they ← Do + פועל בלי s", [("🏃", 35, 55, 36), ("🏃‍♀️", 68, 55, 36)]),
 (PS, "Does Dana ___ a coat?", ["wear", "wears", "wearing", "wore"], 0, "אחרי Does ← בלי s", [("👧", 35, 55, 40), ("🧥", 70, 55, 32)]),
 Q2(PS, "'She works in a bank.' – Where ___ she work?", ["does", "do", "is", "works"], 0, "she ← Where does she work?", ROW("👩", "🏦")),
 Q2(PS, "'We eat at six.' – When ___ you eat?", ["do", "does", "are", "is"], 0, "you ← When do you…?", ROW("🍽️", "🕕")),
 Q2(PS, "What ___ your brother doing now? – Sleeping.", ["is", "does", "are", "do"], 0, "brother = he ← is he doing", ROW("👦", "😴")),
 Q2(PS, "___ he usually walk to school?", ["Does", "Is", "Do", "Are"], 0, "usually = הרגל ← Does he walk", ROW("👦", "🚶", "🏫")),
 Q2(PS, "Find the mistake: 'Does she likes pizza?'", ["likes → like", "Does → Do", "she → her", "pizza → pizzas"], 0, "אחרי Does ← פועל בלי s", ROW("👧", "🍕")),
]))

C.append(("Action words", [AW], [
 (AW, "להגיע = ?", ["arrive", "leave", "divide", "destroy"], 0, "להגיע = arrive", [("🏃‍♀️", 35, 55, 40), ("🏁", 72, 45, 32)]),
 (AW, "לעזוב = ?", ["leave", "stay", "arrive", "rise"], 0, "לעזוב = leave", [("🚪", 40, 52, 46), ("👋", 72, 40, 26)]),
 (AW, "Ice ___ in the sun.", ["melts", "rises", "sets", "fries"], 0, "נמס = melts", [("☀️", 25, 25, 30), ("⛄", 55, 55, 38), ("💧", 75, 75, 18)]),
 (AW, "לטגן = ?", ["fry", "melt", "solve", "shine"], 0, "לטגן = fry", "🍳"),
 (AW, "What is the hobby?", ["go fishing", "hang out", "lie down", "put on"], 0, "ללכת לדוג = go fishing", [("🎣", 40, 50, 44), ("🐟", 72, 72, 24)]),
 (AW, "לשכב = ?", ["lie down", "wake up", "get on", "put on"], 0, "לשכב = lie down", [("🛌", 50, 55, 54)]),
 (AW, "ללבוש = ?", ["put on", "take off", "turn off", "roll down"], 0, "ללבוש = put on", [("🧥", 45, 55, 44), ("➡️", 75, 55, 22)]),
 (AW, "להוריד (בגד) = ?", ["take off", "put on", "turn on", "get on"], 0, "להוריד = take off", [("🧥", 55, 55, 44), ("⬅️", 25, 55, 22)]),
 (AW, "להדליק = ?", ["turn on", "turn off", "take off", "set"], 0, "להדליק = turn on", [("💡", 50, 50, 50)]),
 (AW, "לפתור = ?", ["solve", "divide", "predict", "destroy"], 0, "לפתור = solve", [("🧩", 45, 55, 44), ("✅", 75, 30, 22)]),
 (AW, "לחזות = ?", ["predict", "divide", "spend", "mean"], 0, "לחזות = predict", "🔮"),
 (AW, "לחלק = ?", ["divide", "destroy", "fry", "hope"], 0, "לחלק = divide", [("🍕", 45, 55, 46), ("🔪", 75, 35, 22)]),
 (AW, "להרוס = ?", ["destroy", "solve", "rise", "stay"], 0, "להרוס = destroy", [("💥", 50, 45, 50), ("🧱", 50, 78, 24)]),
]))

C.append(("Describing words", [DW], [
 (DW, "מסוכן = ?", ["dangerous", "famous", "pleasant", "special"], 0, "מסוכן = dangerous", [("⚠️", 30, 35, 30), ("🦈", 58, 60, 46)]),
 (DW, "מפורסם = ?", ["famous", "heavy", "strange", "worried"], 0, "מפורסם = famous", [("🌟", 30, 30, 26), ("🎤", 60, 58, 42)]),
 (DW, "כבד = ?", ["heavy", "low", "close", "free"], 0, "כבד = heavy", "🏋️"),
 (DW, "How does he feel?", ["worried", "pleasant", "sticky", "curly"], 0, "מודאג = worried", "😟"),
 (DW, "How does she feel?", ["surprised", "worried", "freezing", "heavy"], 0, "מופתע = surprised", [("😲", 40, 50, 46), ("🎁", 75, 70, 26)]),
 (DW, "מוזר = ?", ["strange", "special", "sticky", "extreme"], 0, "מוזר = strange", "👽"),
 (DW, "Her hair is ___.", ["curly", "heavy", "low", "famous"], 0, "מתולתל = curly", "👩‍🦱"),
 (DW, "דביק = ?", ["sticky", "curly", "extreme", "close"], 0, "דביק = sticky", "🍯"),
 (DW, "מיוחד = ?", ["special", "strange", "several", "opposite"], 0, "מיוחד = special", "⭐"),
 (DW, "חופשי = ?", ["free", "low", "wet", "warm"], 0, "חופשי = free", [("🕊️", 50, 45, 50)]),
 (DW, "נמוך = ?", ["low", "close", "heavy", "free"], 0, "נמוך = low", [("⬇️", 50, 50, 46)]),
 (DW, "ההפך = ?", ["opposite", "outside", "extreme", "several"], 0, "ההפך = opposite (hot ↔ cold)", [("⬆️", 35, 50, 36), ("⬇️", 65, 50, 36)]),
 (DW, "קיצוני = ?", ["extreme", "famous", "pleasant", "worried"], 0, "קיצוני = extreme", [("🧗", 45, 55, 46), ("🔥", 75, 30, 22)]),
]))

C.append(("Everyday words", [EW], [
 (EW, "What is this?", ["finger", "chin", "bone", "skin"], 0, "אצבע = finger", "☝️"),
 (EW, "What is this?", ["bone", "skin", "ice", "fan"], 0, "עצם = bone", "🦴"),
 (EW, "What is this?", ["scarf", "coat", "fan", "roof"], 0, "צעיף = scarf", "🧣"),
 (EW, "What is this?", ["coat", "scarf", "cover", "cloud"], 0, "מעיל = coat", "🧥"),
 (EW, "Who is he?", ["farmer", "sailor", "fan", "pilot"], 0, "חקלאי = farmer", [("👨‍🌾", 40, 55, 44), ("🚜", 75, 65, 28)]),
 (EW, "Who is he?", ["sailor", "farmer", "fan", "pilot"], 0, "מלח = sailor", [("🧔", 35, 55, 40), ("⛵", 70, 50, 34), ("⚓", 50, 85, 18)]),
 (EW, "What is this?", ["ice cream cone", "ice", "snow", "bone"], 0, "גביע גלידה = ice cream cone", "🍦"),
 (EW, "מאוורר = ?", ["fan", "coat", "roof", "hole"], 0, "מאוורר = fan", [("🥵", 38, 52, 44), ("💨", 72, 50, 32)]),
 (EW, "צל = ?", ["shade", "shine", "sweat", "snow"], 0, "צל = shade", [("🌳", 45, 45, 50), ("⛱️", 75, 70, 24)]),
 (EW, "What is this?", ["wave", "wind", "river", "field"], 0, "גל = wave", [("🌊", 45, 55, 50), ("🏄", 70, 35, 24)]),
 (EW, "זיעה = ?", ["sweat", "skin", "sea", "snow"], 0, "זיעה = sweat", [("🥵", 45, 55, 46), ("💦", 75, 35, 22)]),
 (EW, "חופשה = ?", ["vacation", "advice", "season", "solution"], 0, "חופשה = vacation", [("🏖️", 45, 58, 46), ("✈️", 75, 25, 22)]),
 (EW, "פתרון = ?", ["solution", "problem", "advice", "hope"], 0, "פתרון = solution", [("💡", 40, 45, 40), ("✅", 70, 65, 26)]),
]))


# Unseen – Band II level (~190 words), built on the Word Review list and written in Present Simple.
PASSAGE = """
Weather Watcher

Lia is thirteen years old. She lives with her family in a small city near the mountains in the north. Her father is a farmer, so the weather is very important to him. Every morning, Lia wakes up early and checks the temperature outside. Then she writes it in a special notebook.

In the summer, the heat is extreme. It is often 35 degrees! Lia and her friends spend time at the swimming pool or sit in the shade of a big tree. In the winter, it is freezing. Sometimes there is snow on the ground and ice on the roof. Lia puts on her warm coat and her scarf before she leaves the house.

Lia wants to be a weather scientist. She hopes to predict storms and help farmers. "When a storm arrives, it can destroy a whole field," she says. "If farmers know about it early, they can protect their plants."

Lia's dream is to visit the South Pole. "It is probably the coldest place on earth," she says. "I can't wait!"
"""

C.append(("📖 Unseen: Weather Watcher", [UN], [
 (UN, "How old is Lia?", ["13", "12", "14", "30"], 0, "בשורה הראשונה: thirteen = 13", [("👧", 50, 52, 50)]),
 (UN, "Where does Lia live?", ["near the mountains", "near the sea", "in the desert", "on an island"], 0, "near the mountains in the north", OPTS("🏔️", "🌊", "🏜️", "🏝️")),
 (UN, "What is her father's job?", ["farmer", "sailor", "teacher", "scientist"], 0, "Her father is a farmer", OPTS("👨‍🌾", "⚓", "👨‍🏫", "👨‍🔬")),
 (UN, "What does Lia check every morning?", ["the temperature", "the news", "her phone", "the river"], 0, "checks the temperature outside", OPTS("🌡️", "📰", "📱", "🏞️")),
 (UN, "What is the summer like?", ["very hot", "freezing", "rainy", "windy"], 0, "the heat is extreme = חום קיצוני", OPTS("☀️", "❄️", "🌧️", "💨")),
 (UN, "Where do the friends swim?", ["at the pool", "in the sea", "in the river", "at school"], 0, "at the swimming pool", "🏊"),
 (UN, "Where is the ice?", ["on the roof", "in the pool", "on the tree", "in the river"], 0, "ice on the roof", OPTS("🏠", "🏊", "🌳", "🏞️")),
 (UN, "What does Lia wear in winter?", ["coat and scarf", "hat and gloves", "a swimsuit", "sunglasses"], 0, "her warm coat and her scarf", [("👙", 16, 50, 24), ("🧢", 38, 38, 24), ("🧤", 38, 70, 24), ("🧥", 62, 38, 24), ("🧣", 62, 70, 24), ("🕶️", 84, 50, 22)]),
 (UN, "What does Lia want to be?", ["weather scientist", "farmer", "teacher", "sailor"], 0, "Lia wants to be a weather scientist", OPTS("👩‍🔬", "👩‍🌾", "👩‍🏫", "⛵")),
 (UN, "What can a storm do?", ["destroy a field", "help farmers", "melt the snow", "cool the city"], 0, "it can destroy a whole field", "⛈️"),
 (UN, "\"predict\" means:", ["לחזות", "להרוס", "להגן", "לבדוק"], 0, "predict storms = לחזות סערות", OPTS("🔮", "💥", "🛡️", "🔍")),
 (UN, "What is the South Pole?", ["the coldest place", "the hottest place", "a small city", "a big field"], 0, "probably the coldest place on earth", OPTS("❄️", "🔥", "🏘️", "🌾")),
 (UN, "\"I can't wait!\" – Lia is:", ["excited", "worried", "sad", "bored"], 0, "I can't wait! = מתרגשת", OPTS("🤩", "😟", "😢", "😑")),
 Q2(UN, "'Then she writes it in a special notebook.' 'it' is:", ["the temperature", "the notebook", "the morning", "the city"], 0, "checks the temperature… writes it", ROW("📓", "✏️")),
 Q2(UN, "'it can destroy a whole field' – 'it' is:", ["a storm", "a farmer", "the snow", "the shade"], 0, "When a storm arrives, it can destroy", ROW("🌾", "💥")),
 Q2(UN, "Why is the weather important to Lia's father?", ["he's a farmer", "he likes snow", "he's a scientist", "he's a sailor"], 0, "Her father is a farmer, so…", ROW("👨", "🌦️")),
 Q2(UN, "What does Lia do right after checking the temperature?", ["writes it down", "wakes up early", "wears her coat", "goes to school"], 0, "Then she writes it in a notebook", ROW("👧", "🕐")),
 Q2(UN, "When does Lia put on her coat?", ["before leaving home", "after school", "in the summer", "at the pool"], 0, "before she leaves the house", ROW("👧", "🚪")),
], PASSAGE))

C.append(("חזרה כללית", [PS, WE, NP, AW, DW, EW, UN], [
 (EW, "עצה = ?", ["advice", "hope", "problem", "opposite"], 0, "עצה = advice", [("🧓", 35, 55, 40), ("💬", 70, 35, 28)]),
 (EW, "תקווה = ?", ["hope", "hole", "heat", "ice"], 0, "תקווה = hope", [("🙏", 40, 55, 40), ("🌈", 70, 30, 30)]),
 (NP, "בחוץ = ?", ["outdoors", "indoors", "below", "through"], 0, "בחוץ = outdoors", [("🏕️", 45, 55, 46), ("🌳", 78, 50, 28)]),
 (NP, "בפנים = ?", ["indoors", "outdoors", "outside", "above"], 0, "בפנים = indoors", [("🏠", 45, 55, 46), ("🛋️", 75, 70, 22)]),
 (NP, "מתחת = ?", ["below", "through", "close", "several"], 0, "מתחת = below", [("📦", 50, 35, 30), ("⬇️", 50, 72, 26)]),
 (DW, "כמה (כמות) = ?", ["several", "certainly", "probably", "luckily"], 0, "כמה = several", [("🍎", 30, 50, 24), ("🍎", 50, 50, 24), ("🍎", 70, 50, 24)]),
 (DW, "כנראה = ?", ["probably", "certainly", "luckily", "really"], 0, "כנראה = probably", "🤷"),
 (DW, "למרבה המזל = ?", ["luckily", "really", "probably", "certainly"], 0, "למרבה המזל = luckily", "🍀"),
 (PS, "He ___ in Haifa.", ["live", "lives", "living", "to live"], 1, "he ← lives", [("👦", 35, 55, 40), ("🏙️", 70, 50, 36)]),
 (PS, "___ it snow here?", ["Does", "Do", "Is", "Are"], 0, "it ← Does", [("❄️", 45, 45, 44), ("❓", 75, 25, 20)]),
 (PS, "We ___ like storms.", ["don't", "doesn't", "isn't", "aren't"], 0, "we ← don't", [("⛈️", 45, 45, 46), ("👎", 75, 72, 22)]),
 (AW, "תלוי ב... = ?", ["it depends on", "feel like", "make plans", "can't wait"], 0, "תלוי ב... = it depends on", "🤷"),
 (AW, "לא יכול לחכות = ?", ["can't wait", "feel like", "hold a record", "hang out"], 0, "לא יכול לחכות = can't wait", [("🤩", 45, 50, 46), ("⏳", 75, 30, 22)]),
]))

# The word list – every word must be practised (build_set.py checks).
WORD_LIST = """arrive|below|capital|check|city|cloud|coat|dangerous|divide|earth|east|famous|feel like|field|finger|free|get on|ground|heat|heavy|it depends on|low|mountain|north|park|predict|probably|rain|rise|river|sea|season|set|several|solve|south|spend|stay|strange|surprised|through|vacation|wake up|warm|weather|west|wind|worried|zero|advice|back|bone|can't wait|certainly|chin|close|cover|curly|degree|destroy|extreme|fall|fan|farmer|for example|freezing|fry|go fishing|hang out|hold a record|hole|hope|ice|ice cream cone|indoors|in the right|kind of|leave|lie down|luckily|make plans|mean|melt|opposite|outdoors|outside|pleasant|problem|put on|really|roll down|roof|sailor|scarf|shade|shine|sidewalk|skin|snow|solution|special|sticky|storm|sweat|swimming pool|take off|temperature|the whole|turn off|turn on|wave|wet""".split("|")

# ---- coverage: every Word Review word is a correct answer somewhere ----
def _ch(title): return next(c for c in C if c[0] == title)[2]
_ch("Nature & places").extend([
 (NP, "בירה (עיר) = ?", ["capital", "city", "field", "earth"], 0, "ירושלים היא ה-capital", [("🏛️", 50, 55, 50), ("⭐", 78, 25, 18)]),
 (NP, "On a map, down = ?", ["south", "north", "east", "west"], 0, "למטה במפה = דרום", [("🧭", 50, 45, 46), ("⬇️", 50, 82, 20)]),
 (NP, "קרקע = ?", ["ground", "roof", "hole", "sea"], 0, "קרקע = ground", [("🌱", 50, 50, 40), ("👇", 50, 82, 26)]),
])
_ch("Action words").extend([
 (AW, "לבדוק = ?", ["check", "set", "stay", "fall"], 0, "לבדוק = check", [("🔍", 45, 50, 46), ("✅", 75, 30, 22)]),
 (AW, "I ___ and open my eyes.", ["wake up", "lie down", "get on", "hang out"], 0, "wake up = להתעורר", [("⏰", 35, 45, 36), ("🛏️", 70, 62, 38)]),
])
_ch("Describing words").extend([
 (DW, "קרוב = ?", ["close", "low", "free", "heavy"], 0, "קרוב = close", [("🏠", 38, 55, 34), ("🏠", 62, 55, 34)]),
 (DW, "חמים (נעים) = ?", ["warm", "wet", "low", "sticky"], 0, "חמים = warm", [("☕", 40, 55, 40), ("🧣", 72, 45, 30)]),
])
_ch("Everyday words").extend([
 (EW, "סנטר = ?", ["chin", "skin", "bone", "finger"], 0, "סנטר = chin", [("🧑", 50, 42, 50), ("👆", 50, 82, 22)]),
 (EW, "עור = ?", ["skin", "bone", "chin", "scarf"], 0, "עור = skin", "✋"),
 (EW, "גב = ?", ["back", "chin", "bone", "skin"], 0, "גב = back", TXT("גב")),
])
_i = next(i for i, c in enumerate(C) if c[0].startswith("📖"))
C.insert(_i, ("Phrases", [AW, DW], [
 (AW, "I ___ ice cream.", ["feel like", "hang out", "can't wait", "make plans"], 0, "מתחשק לי = I feel like", [("😋", 40, 55, 40), ("🍦", 72, 50, 32)]),
 (AW, "לעלות על (אוטובוס) = ?", ["get on", "take off", "turn on", "roll down"], 0, "לעלות על = get on", [("🚶", 30, 58, 34), ("🚌", 68, 55, 44)]),
 (AW, "לבלות (עם חברים) = ?", ["hang out", "make plans", "lie down", "put on"], 0, "לבלות = hang out", [("👫", 40, 55, 40), ("🍕", 72, 60, 26)]),
 (AW, "How do you ___ your weekends?", ["spend", "set", "stay", "fall"], 0, "spend the weekend = לבלות את הסופ״ש", [("👪", 45, 55, 46), ("📅", 78, 25, 20)]),
 (AW, "לתכנן תוכניות = ?", ["make plans", "hang out", "hold a record", "go fishing"], 0, "לתכנן = make plans", [("🗓️", 45, 52, 44), ("✏️", 75, 65, 22)]),
 (AW, "להחזיק בשיא = ?", ["hold a record", "make plans", "roll down", "feel like"], 0, "להחזיק בשיא = hold a record", [("🏆", 45, 50, 46), ("🥇", 75, 30, 22)]),
 (AW, "להוריד (חלון) = ?", ["roll down", "turn off", "take off", "get on"], 0, "להוריד חלון = roll down", [("🚗", 50, 55, 50), ("⬇️", 75, 30, 20)]),
 (AW, "לכבות = ?", ["turn off", "turn on", "put on", "set"], 0, "לכבות = turn off", [("💡", 45, 50, 44), ("❌", 70, 30, 22)]),
 (DW, "סוג של = ?", ["kind of", "for example", "the whole", "in the right"], 0, "סוג של = kind of", [("🍎", 35, 55, 30), ("🍐", 65, 55, 30)]),
 (DW, "כל ה... (כל הפיצה) = ?", ["the whole", "kind of", "several", "opposite"], 0, "the whole pizza = כל הפיצה", "🍕"),
 (DW, "להיות צודק = to be ___", ["in the right", "kind of", "the whole", "for example"], 0, "צודק = in the right", "👍"),
 (DW, "לדוגמה = ?", ["for example", "kind of", "the whole", "really"], 0, "לדוגמה = for example", "💡"),
]))
C.insert(_i + 1, ("More words", [NP, DW, AW, EW], [
 (NP, "מדרכה = ?", ["sidewalk", "roof", "field", "river"], 0, "מדרכה = sidewalk", [("🚶", 40, 55, 40), ("🏘️", 72, 40, 30)]),
 (NP, "מחוץ ל... = ?", ["outside", "indoors", "below", "through"], 0, "מחוץ ל = outside", [("🚪", 35, 55, 40), ("🌳", 72, 50, 36)]),
 (NP, "דרך (עוברים) = ?", ["through", "below", "outside", "close"], 0, "דרך = through", "🚇"),
 (DW, "באמת = ?", ["really", "luckily", "probably", "certainly"], 0, "באמת = really", "😮"),
 (DW, "בוודאי = ?", ["certainly", "really", "luckily", "probably"], 0, "בוודאי = certainly", "✅"),
 (DW, "אפס = ?", ["zero", "several", "degree", "low"], 0, "0 = zero", "0️⃣"),
 (AW, "להישאר = ?", ["stay", "leave", "arrive", "fall"], 0, "להישאר = stay", [("🏠", 45, 55, 46), ("🛋️", 72, 70, 22)]),
 (AW, "ליפול = ?", ["fall", "rise", "stay", "shine"], 0, "ליפול = fall", [("🍂", 50, 35, 34), ("⬇️", 50, 75, 24)]),
 (AW, "לזהור (השמש) = ?", ["shine", "set", "fall", "melt"], 0, "לזהור = shine", [("☀️", 50, 48, 50), ("✨", 78, 25, 20)]),
 (AW, "לשקוע (השמש) = ?", ["set", "rise", "shine", "fall"], 0, "השמש שוקעת = the sun sets", "🌇"),
 (AW, "What does this word ___?", ["mean", "set", "stay", "fall"], 0, "mean = פירושו", [("🤔", 40, 55, 40), ("💬", 72, 35, 26)]),
 (EW, "כיסוי / כריכה = ?", ["cover", "coat", "roof", "fan"], 0, "כריכה = cover", "📕"),
 (EW, "בעיה = ?", ["problem", "solution", "advice", "hope"], 0, "בעיה = problem", [("😟", 40, 55, 40), ("❗", 72, 35, 26)]),
]))

# ---- Present Simple scope check: has/does, short answers, adverbs of frequency ----
_u = next(i for i, c in enumerate(C) if c[0].startswith("📖"))
C.insert(_u, ("Present Simple: has, does, always…", [PS], [
 (PS, "Noa ___ long curly hair.", ["has", "have", "haves", "having"], 0, "Noa = she ← has (לא haves)", [("👩‍🦱", 50, 52, 50)]),
 (PS, "My dad ___ the dishes.", ["does", "do", "dos", "doing"], 0, "he ← does (לא dos)", [("👨", 35, 55, 40), ("🍽️", 70, 55, 32)]),
 (PS, "My grandparents ___ a big garden.", ["have", "has", "haves", "having"], 0, "grandparents = they ← have", [("👴", 25, 58, 30), ("👵", 45, 58, 30), ("🏡", 75, 52, 40)]),
 (PS, "Does he swim? No, he ___.", ["doesn't", "don't", "isn't", "not"], 0, "Does ← No, he doesn't", [("👦", 40, 55, 40), ("🏊", 72, 60, 26), ("❌", 72, 60, 14)]),
 (PS, "Do they ski? No, they ___.", ["don't", "doesn't", "aren't", "not"], 0, "Do they ← No, they don't", [("⛷️", 45, 50, 46), ("❌", 75, 30, 18)]),
 (PS, "100%: I ___ walk to school.", ["always", "never", "sometimes", "often"], 0, "100% = always = תמיד", [("🚶", 35, 55, 40), ("🏫", 72, 50, 34)]),
 (PS, "0%: She ___ eats fish.", ["never", "always", "usually", "often"], 0, "0% = never = אף פעם", [("👧", 35, 55, 40), ("🐟", 70, 55, 28), ("🚫", 70, 55, 16)]),
 (PS, "לפעמים = ?", ["sometimes", "always", "never", "usually"], 0, "לפעמים = sometimes", [("🌦️", 50, 50, 50)]),
 (PS, "בדרך כלל = ?", ["usually", "never", "always", "sometimes"], 0, "בדרך כלל = usually", [("⏰", 50, 50, 46)]),
 (PS, "Which is correct?", ["He always walks", "He always walk", "He walk always", "Always he walk"], 0, "always לפני הפועל, ו-s ל-he", [("🚶", 50, 50, 46)]),
 (PS, "The museum ___ at ten.", ["opens", "open", "opening", "to open"], 0, "the museum = it ← opens", [("🏛️", 45, 55, 46), ("🕙", 78, 25, 20)]),
 (PS, "My parents ___ in Haifa.", ["work", "works", "working", "to work"], 0, "parents = רבים ← בלי s", [("👫", 40, 58, 38), ("🏙️", 75, 50, 32)]),
 (PS, "She ___ English very well.", ["speaks", "speak", "speaking", "to speak"], 0, "she ← speaks", [("👧", 40, 55, 40), ("💬", 72, 35, 26)]),
 Q2(PS, "I usually ___ to school, but today it's raining.", ["walk", "am walking", "walks", "walking"], 0, "usually = הרגל ← Present Simple", ROW("🚶", "🏫", "🌧️")),
 Q2(PS, "She usually walks, but today she ___ the bus.", ["is taking", "takes", "take", "taking"], 0, "today, לא כרגיל ← is + ing", ROW("👧", "🚌")),
 Q2(PS, "Yesterday she walked, but she usually ___ the bus.", ["takes", "took", "is taking", "take"], 0, "usually = הרגל ← takes", ROW("👧", "🚌", "🚶")),
 Q2(PS, "Listen! The birds ___ in the garden.", ["are singing", "sing", "sings", "singing"], 0, "Listen! ← קורה עכשיו: are + ing", ROW("🐦", "🌳", "👂")),
 Q2(PS, "My sister ___ her teeth twice a day.", ["brushes", "is brushing", "brush", "brushing"], 0, "twice a day = הרגל ← brushes", ROW("👧", "🦷")),
]))
OLD_CODES = ["en7-nov26-9eaa62", "en7-nov26-333b7b", "en7-nov26-1adab8"]
