"""Picture rules for practice sets (used by build_set.py).

1. A question that relies on its picture (\"What is this?\", \"Which verb?\", \"X is for…\", a missing-letter word …)
   must show the ANSWER itself. Its emoji must be on the APPROVED list for that answer – otherwise the build stops
   and says so. Fix it with a clearer picture (then add the pair here after checking it) or put the Hebrew meaning
   in the question, e.g. \"j_mp (לקפוץ)\" – a question with Hebrew in it does not rely on the picture.
   (Why: 🐸 for \"jump\" made kids think \"frog\".)
2. No emoji newer than 2019 anywhere – older phones show an empty box.
"""
import re

PIC_DEPENDENT = re.compile(r"^(What is this\?|Which verb\?|What color is it\?|Which animal\?|[A-Z] is for…|Starts with [A-Z]:|Starts with\?"
                           r"|How does (he|she) feel\?|[A-Za-z_]*_[A-Za-z_]*)$")
HEBREW = re.compile(r"[֐-׿]")

# answer → emojis that show exactly that word (checked by hand; one picture, one word)
APPROVED = {
    # animals
    "dog": "🐕🐶", "cat": "🐈🐱", "lion": "🦁", "alligator": "🐊", "tiger": "🐅🐯", "bird": "🐦", "ladybird": "🐞",
    "monkey": "🐒🐵", "octopus": "🐙", "elephant": "🐘", "giraffe": "🦒", "fish": "🐟",
    # colors (objects whose color is not in doubt)
    "red": "🔴🍓", "blue": "🔵💙", "green": "💚🥦🍏", "purple": "💜🍇", "black": "⚫", "orange": "🍊", "brown": "🐻", "gray": "🐘",
    # verbs: someone doing the action
    "run": "🏃", "swim": "🏊", "sleep": "😴🛌", "fly": "🕊️",
    # no emoji shows these clearly – use a sentence or the Hebrew meaning: jump, drink, eat, cut
    # grade 7 nouns
    "rain": "🌧️", "cloud": "☁️", "snow": "❄️⛄", "storm": "⛈️", "mountain": "🏔️", 
    "city": "🏙️", "earth": "🌍", "worried": "😟", "surprised": "😲", "finger": "☝️", "bone": "🦴",
    "scarf": "🧣", "coat": "🧥", "ice cream cone": "🍦", "wave": "🌊", "park": "⛲",
}
# emoji newer than 2019 (Unicode 12+) or known to render badly on older phones
TOO_NEW_SEQ = {"🧑‍🌾", "🧑‍🍳", "🧑‍🏫", "🧑‍🎓", "🧑‍⚕️", "🧑‍💻", "🧑‍🚀", "🧑‍🎨", "🧑‍🔧", "🧑‍🚒"}   # gender-neutral jobs: Emoji 12.1 (late 2019)
TOO_NEW = set("🪑🪭🛝🪁🪀🟦🟥🟫🟩🟪🟧🟨🟢🩻🪼🫏🪿🪸🫧🧇🦘🩶🪢🫖🪴🪨🪵🛖🫐🫒🫑🫓🫔🫕🦬🦣🦫🦤🪶🦭🪲🪳🪰🪱🫀🫁🥷🫂🪄🪅🪆🧋🛻🛼🪃🪓🪔🪕🦯🦽🦾🧃🧉🧊🧄🧅🦩🦥🦦🦨🦪🧆🧈🧏🧍🧎🪐🪂🤿🥽🥼🦺🩰🩱🩲🩳🩸🩹🩺")

def emojis(scene):
    items = [scene] if isinstance(scene, str) else [e for e, *_ in scene]
    return [e for e in items if not re.fullmatch(r"[A-Za-z]", e)]

def check(question, answer, scene):
    """Return a list of problems (empty when the picture is fine)."""
    out, ems = [], emojis(scene)
    new = [e for e in ems if e in TOO_NEW_SEQ or any(ch in TOO_NEW for ch in e)]
    if new: out.append(f"emoji newer than 2019: {''.join(new)}")
    q = question.replace("⁦", "").replace("⁩", "").strip()
    if not HEBREW.search(q) and PIC_DEPENDENT.match(q):
        a = answer.strip().lower()
        if len(a) == 1:   # "Starts with?" → the picture must be an approved word that starts with that letter
            ok = "".join(v for w, v in APPROVED.items() if w.startswith(a))
        else:
            ok = APPROVED.get(a, "")
        if not any(e in ok for e in ems):
            out.append(f"the picture {''.join(ems) or '(none)'} does not clearly show \"{answer}\" – use an approved picture or add the Hebrew meaning to the question")
    return out
