"""Build a practice set into a share code the app can import.

Usage:  python3 -I tools/build_set.py tools/sets/<file>.py
Writes  public/share/<id>.txt  (an SFF1: code). In the app: New practice → 🔗 → type  SFF1@<id>  → Import.
Checks the same rules the app uses (clean, needsPic, riddleOK) so no AI pass is needed after import.
"""
import base64, json, pathlib, random, re, secrets, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import pic_rules   # the picture must show the answer itself; no emoji newer than 2019

src = pathlib.Path(sys.argv[1])
def COUNT(*rows, top=10, bottom=84):
    """Counting picture: each row is (emoji, n). Lays the emoji out one by one, evenly, inside the frame.
    COUNT(("🍎", 3))  ·  COUNT(("🐟", 3), ("🐟", 3))  ·  COUNT(("🍎", 2), ("🍎", 2), ("🍎", 2))  (groups of 2)"""
    split = []                                                     # more than 6 in a row gets too small: wrap into rows of ≤ 6
    for e, n in rows:
        k = -(-n // 6); per = -(-n // k)
        split += [(e, min(per, n - i * per)) for i in range(k)]
    rows = split
    r, out = len(rows), []
    for i, (e, n) in enumerate(rows):
        s = min(44, 0.75 * (bottom - top) / r, 125 / n)          # font size in % of the frame height (the frame is 16:10)
        y = top + (bottom - top) * (i + .5) / r
        step = min(92 / n, s / 1.6 * 1.35)                        # % of the width between neighbours
        for j in range(n): out.append((e, round(50 + (j - (n - 1) / 2) * step, 1), round(y, 1), round(s)))
    return out

def TXT(*lines, s=None):
    """A number card instead of a decoration: TXT("12 → ?")  ·  TXT("5 + 3", "= ?"). Shown big, left-to-right."""
    n = len(lines); z = s or min(34, 70 / n, 140 / max(len(l) for l in lines))
    return [(l, 50, round(14 + 70 * (i + .5) / n, 1), round(z)) for i, l in enumerate(lines)]

class OptRow(list):
    """A picture row whose pictures ARE the options (made by OPTS) – the only kind of row the build may shuffle."""
def OPTS(*es, y=52):
    """The options as pictures, side by side, in the same order as the question's options (picture k = option k; fewer
    pictures = the first options). The build moves them so the answer is not always in the same place:
    Q(..., ["כלב", "חתול", "דג", "ציפור"], ..., OPTS("🐕", "🐈", "🐟", "🐦"))"""
    n = len(es); s = min(40, 125 / n); step = min(92 / n, s / 1.6 * 1.35)
    return OptRow((e, round(50 + (j - (n - 1) / 2) * step, 1), y, round(s)) for j, e in enumerate(es))

ns = {"COUNT": COUNT, "TXT": TXT, "OPTS": OPTS}
exec(src.read_text(encoding="utf-8"), ns)
SET, C = ns["SET"], ns["C"]

def bases(e):
    """How many separate emoji are in e (ZWJ sequences, skin tones, keycaps and flags count as one)."""
    n, cps, i = 0, [ord(c) for c in e], 0
    while i < len(cps):
        c = cps[i]
        if c in (0xFE0F, 0xFE0E, 0x20E3) or 0x1F3FB <= c <= 0x1F3FF or (i and cps[i - 1] == 0x200D) or c == 0x200D: i += 1; continue
        if 0x1F1E6 <= c <= 0x1F1FF and i + 1 < len(cps) and 0x1F1E6 <= cps[i + 1] <= 0x1F1FF: i += 1
        n += 1; i += 1
    return n
EMOJI_RE = re.compile("[\u2300-\u23FF\u2600-\u27BF\u2B00-\u2BFF\U0001F000-\U0001FAFF\uFE0F\u20E3\u200D]")   # arrows (→) and math signs (−) are text
def is_text(e): return not EMOJI_RE.search(e)          # a picture item that is a number card / short text, e.g. "12 → ?"
# a picture that has nothing to do with the question: only allowed next to other, real items
GENERIC = set("🤔 ❓ ❔ 🔢 ➕ ➖ ✖️ ➗ 🧮 💯 ✏️ 📝 ✍️ 🔍 📚 💭 ✨ 🎯 🏆".split())
def words(t): return len(str(t).split())
def scene(s):
    if isinstance(s, str): return [{"e": s, "x": 50, "y": 52, "s": 56}]
    return [{"e": e, "x": x, "y": y, "s": z} for e, x, y, z in s]

errors, warns, qs, chapters = [], [], [], []
SRC_OPTS = []   # each question's options in the source order (the English file lists them so)
# core facts (tools/core_facts.json: set id → question texts): they come back in later stations as review questions, in another game
_nq = lambda t: re.sub(r"[\s\u0591-\u05C7\u2066-\u2069]", "", str(t))
try: CORE_Q = {_nq(t) for t in json.loads((pathlib.Path(__file__).resolve().parent / "core_facts.json").read_text(encoding="utf-8")).get(src.stem.replace("_", "-"), [])}
except FileNotFoundError: CORE_Q = set()
rng = random.Random(src.stem)   # same file → same option order
prng = random.Random(src.stem + ":pictures")   # a separate stream, so the option order above never changes because of pictures
# a picture of the options side by side must not always have the answer in the same place (the source files list the answer
# first, so it was always the left picture). Kept in place: sequences / patterns (repeats, ❓, arrows, signs), COUNT, text cards.
KEEP_ORDER = set("❓ ❔ ➡️ ⬅️ ⬆️ ⬇️ ↔️ ↕️ ➕ ➖ ✖️ ➗ 🟰 ⏩ ⏪ 🔜 🔁 🔄 ▶️ ◀️".split()) | {"➡", "⬅", "⬆", "⬇", "↔", "▶", "◀"}
pic_stats = {"rows": 0, "rows_answer_first": 0, "cards": 0}
answer_slot, slot_bags, rows_by_n = {}, {}, {}
POSITION_RE = re.compile(r"מימין|משמאל|ראשון|ראשונה|שני|שנייה|שלישי|רביעי|אחרון|אחרונה|במקום|בתור|לפני|אחרי|באמצע|\b(first|second|third|last|before|after|left|right|order|next to|between)\b", re.I)
def option_picture_row(scn):
    items = [it for it in scn if not is_text(it["e"])]
    if len(items) < 2 or len(items) != len(scn): return None
    if len({round(it["y"]) for it in items}) != 1 or len({it["e"] for it in items}) != len(items): return None
    if any(it["e"] in KEEP_ORDER or EMOJI_RE.sub("", it["e"]).strip() or "\u20e3" in it["e"] for it in items): return None
    return sorted(items, key=lambda it: it["x"]) == items and items or None
for ci, chap in enumerate(C):
    title, topics, items = chap[:3]
    text = chap[3].strip() if len(chap) > 3 and isinstance(chap[3], str) else ""
    kind = (ns.get("KINDS") or {}).get(title, "")          # optional station type on the map (abc / gram / word / read / rev)
    chapters.append({"title": title, "topics": topics, "count": len(items), **({"text": text} if text else {}), **({"kind": kind} if kind else {})})
    if text and not 80 <= words(text) <= 300: errors.append(f"ch{ci+1}: passage has {words(text)} words")
    for topic, q, opts, ans, expl, sc, *lv in items:                 # an optional 7th field: 2 = a test-level question ("⭐ שלב מבחן")
        lvl = lv[0] if lv else 1
        if lvl not in (1, 2): errors.append(f"ch{ci+1} «{q}»: level must be 1 or 2")
        tag = f"ch{ci+1} «{q}» → {opts[ans]}"
        if topic not in SET["topics"]: errors.append(f"{tag}: unknown topic {topic}")
        if len(opts) != 4 or len({o.strip() for o in opts}) != 4: errors.append(f"{tag}: need 4 different options")
        if words(q) > ns.get("MAX_Q_WORDS", 6): errors.append(f"{tag}: question > {ns.get('MAX_Q_WORDS', 6)} words")
        if any(words(o) > 3 for o in opts): errors.append(f"{tag}: option > 3 words")
        if words(expl) > 10: errors.append(f"{tag}: explanation > 10 words")
        if not ns.get("ANSWER_IN_Q_OK") and opts[ans].lower() in q.lower(): errors.append(f"{tag}: question gives the answer away")
        for prob in pic_rules.check(q, opts[ans], sc): errors.append(f"{tag}: {prob}")
        # the picture must not give the answer away: a picture of the right option alone (and none of the others)
        if not pic_rules.PIC_DEPENDENT.match(q.replace("⁦", "").replace("⁩", "").strip()):
            pe = {it[0] if not isinstance(it, str) else it for it in ([sc] if isinstance(sc, str) else (sc or []))}
            em = lambda o: [c for c in EMOJI_RE.sub(lambda m: "\0" + m.group(0) + "\0", o).split("\0") if c and EMOJI_RE.match(c)]
            mine, others = em(opts[ans]), [e for i, o in enumerate(opts) if i != ans for e in em(o)]
            if mine and any(e in pe for e in mine) and not any(e in pe for e in others):
                errors.append(f"{tag}: the picture shows the answer – show all the options, or the question's data")
        src_opts = opts; right = opts[ans]; opts = opts[:]; rng.shuffle(opts); ans = opts.index(right)   # answer not always first
        scn = scene(sc)
        # the option pictures move (the source lists the answer first, so it was always the left picture): only a row made
        # by OPTS(...), or a row whose every picture is written in an option – never a story row, and never when the
        # question is about place or order (first / right / before …). The answer's picture takes the next place of a shuffled
        # rotation (every place gets it about equally often); the other pictures fill the other places at random.
        row = option_picture_row(scn)
        positional = POSITION_RE.search(q.replace("⁦", "").replace("⁩", ""))
        if row and not (isinstance(sc, OptRow) or all(any(it["e"] in o for o in src_opts) for it in row)): row = None
        if isinstance(sc, OptRow) and not row: errors.append(f"{tag}: OPTS(...) needs 2–4 different emoji in one row")
        if row and len(row) > len(opts): row = None
        if row and positional: row = None
        before = [(it["e"], it["x"]) for it in scn]
        if row:
            xs = sorted(it["x"] for it in row)
            src_ans = src_opts.index(right)
            if src_ans < len(row):   # the answer is drawn: rotate its place
                bag = slot_bags.setdefault(len(xs), [])
                if not bag: bag.extend(range(len(xs))); prng.shuffle(bag)
                target = bag.pop(); rest = [i for i in range(len(xs)) if i != target]; prng.shuffle(rest)
                for k, it in enumerate(row): it["x"] = xs[target] if k == src_ans else xs[rest.pop()]
                pic_stats["rows"] += 1; pic_stats["rows_answer_first"] += target == 0
                answer_slot[(len(xs), target)] = answer_slot.get((len(xs), target), 0) + 1; rows_by_n[len(xs)] = rows_by_n.get(len(xs), 0) + 1
            else:
                order = list(range(len(row))); prng.shuffle(order)
                for k, it in enumerate(row): it["x"] = xs[order[k]]
            if __import__("os").environ.get("SFF_PICLIST"): print("SHUF\t" + q + "\t" + " ".join(it["e"] for it in sorted(row, key=lambda it: it["x"])), file=sys.stderr)
        if positional and [(it["e"], it["x"]) for it in scn] != before: errors.append(f"{tag}: the question is about place or order, but its picture was moved")
        # option cards listed one under the other (each card is one of the options): the same, top to bottom
        cards = [it for it in scn if is_text(it["e"])]
        nrm_o = lambda t: re.sub(r"[\s\u2066-\u2069]", "", str(t))
        if len(cards) == len(scn) == len(opts) and len({round(c["x"]) for c in cards}) == 1 and all(nrm_o(c["e"]) in map(nrm_o, src_opts) for c in cards):
            ys = sorted(c["y"] for c in cards); src_n = [nrm_o(o) for o in src_opts]
            for c in cards: c["y"] = ys[opts.index(src_opts[src_n.index(nrm_o(c["e"]))])]
            pic_stats["cards"] += 1
        # a text card in the picture must not give the answer away: a card that IS the answer is an error; a card that holds
        # the answer and none of the other options (and the answer is not in the question) is a warning – fine only when
        # the card is the question's own data (a table, a sentence to read)
        nrm = lambda t: (lambda x: x if len(x) == 1 else x.lower())(re.sub(r"[\s\u2066-\u2069.,!?:;'\"()]", "", str(t)))   # one letter keeps its case
        has = lambda card, o: re.search(r"(?<![\w\u0590-\u05FF])" + re.escape(str(o).strip().lower()) + r"(?![\w\u0590-\u05FF])", card.lower()) is not None
        cards = [it["e"] for it in scn if is_text(it["e"])]
        data = any(has(c, o) for c in cards for o in opts if o != right) or has(q, right)   # the other options are on the cards too (a table) / the question names it
        for it in scn:
            if not is_text(it["e"]) or not nrm(right) or data: continue
            if nrm(it["e"]) == nrm(right) and len(cards) == 1: errors.append(f"{tag}: the picture card \"{it['e']}\" is the answer – show the question's data or all the options")
            elif nrm(it["e"]) == nrm(right) or has(it["e"], right):
                warns.append(f"{tag}: the picture card \"{it['e']}\" holds the answer – fine only if it is the question's own data")
        # emoji options: a picture of only two options, one of them the answer, points at the answer
        oem = [[c for c in o if EMOJI_RE.match(c)] for o in opts]
        if all(oem):
            shown = [i for i, e in enumerate(oem) if any(x in [it["e"] for it in scn] for x in e)]
            if len(shown) == 2 and opts.index(right) in shown: warns.append(f"{tag}: the picture shows only two options, one of them the answer")
        if not 1 <= len(scn) <= 12 or any(len(it["e"]) > 4 and not is_text(it["e"]) for it in scn): errors.append(f"{tag}: bad scene")
        if len(scn) == 1 and scn[0]["e"] in GENERIC: errors.append(f"{tag}: the picture is decoration ({scn[0]['e']}) – show what the question is about, or the numbers as a card (TXT)")
        for it in scn:
            if is_text(it["e"]):
                if len(it["e"]) > 16: errors.append(f"{tag}: picture text too long \"{it['e']}\"")
                if "→" in it["e"] and re.search(r"[\u0590-\u05FF]", it["e"]):   # a Hebrew card is drawn right-to-left: the arrow would point back
                    errors.append(f"{tag}: Hebrew card with → \"{it['e']}\" – write it with ←")
                hw = it["s"] * .3 * len(it["e"]) / 1.6
                if it["x"] - hw < 1 or it["x"] + hw > 99: errors.append(f"{tag}: picture text \"{it['e']}\" is too wide")
                continue
            if bases(it["e"]) != 1: errors.append(f"{tag}: one emoji per picture item – \"{it['e']}\" (use COUNT for several)")
            hw, hh = it["s"] * .62 / 1.6, it["s"] * .5                # half width / height of the emoji, in % of the frame
            if it["x"] - hw < -1 or it["x"] + hw > 101 or it["y"] - hh < -1 or it["y"] + hh > 101: errors.append(f"{tag}: \"{it['e']}\" is outside the frame")
        is_core = _nq(q) in CORE_Q
        SRC_OPTS.append(src_opts)
        qs.append({"topic": topic, "question": q, "options": opts, "answer": ans, **({"core": True} if is_core else {}),
                   "explanation": expl, "emoji": scn[0]["e"], "scene": scn, "ch": ci, **({"lvl": 2} if lvl == 2 else {})})

# the answer's place among the option pictures must look random (it was always the left one)
for (n_, slot_), c_ in answer_slot.items():
    if rows_by_n[n_] >= 10 and c_ > max(.4, 1.6 / n_) * rows_by_n[n_]:
        errors.append(f"option pictures: the answer is in place {slot_ + 1} of {n_} in {c_} of {rows_by_n[n_]} rows – too often")
if __import__("os").environ.get("SFF_PICSTATS"): print("pictures:", json.dumps({**pic_stats, "answer_slot": {f"{n}:{k + 1}": v for (n, k), v in answer_slot.items()}}), file=sys.stderr)

seen = {}
for q in qs:
    k = (q["question"], q["options"][q["answer"]])
    if k in seen: errors.append(f"duplicate: {k}")
    seen[k] = 1

# every word of the source list (WORD_LIST) must be a correct answer somewhere
answers = " | ".join(q["options"][q["answer"]] for q in qs).lower()
def practised(w): return re.search(r"\b" + re.escape(w.lower()) + r"(s|es|ed|d|ing)?\b", answers) is not None
word_list = list(ns.get("WORD_LIST", []))
missing = [w for w in word_list if not practised(w)]
if missing: errors.append(f"words not practised ({len(missing)}): " + ", ".join(missing))

# the same question (and answer) in the set of the same subject one grade below or above: a warning (DUP vs <id>)
def _dup_key(q, a):
    t = lambda x: re.sub(r"[\s\u0591-\u05C7\u2066-\u2069.,!?:;'\"()\-–_]", "", str(x)).lower()
    return t(q) + "|" + t(a)
def _num_key(q, a):   # the numbers of the question (at least two) + the same answer
    n = re.findall(r"\d+(?:[.,]\d+)?", str(q))
    return "|".join(n) + "=>" + re.sub(r"[\s\u2066-\u2069]", "", str(a)).lower() if len(n) >= 2 else None
try:
    _share = pathlib.Path(__file__).resolve().parent.parent / "public" / "share"
    _me = src.stem.replace("_", "-")
    for _e in json.loads((_share / "catalog.json").read_text(encoding="utf-8")).get("sets", []):
        if _e.get("id") == _me or _e.get("subject") != SET["subject"]: continue   # every set of the same subject
        _d = json.loads(base64.b64decode((_share / f"{_e['id']}.txt").read_text(encoding="utf-8")[5:]))
        _theirs = {_dup_key(x["question"], x["options"][x["answer"]]) for x in _d["questions"]}
        _nums = {_num_key(x["question"], x["options"][x["answer"]]) for x in _d["questions"]} - {None}
        for q in qs:
            if _dup_key(q["question"], q["options"][q["answer"]]) in _theirs: warns.append(f"DUP vs {_e['id']}: «{q['question']}» → {q['options'][q['answer']]}")
            elif _num_key(q["question"], q["options"][q["answer"]]) in _nums: warns.append(f"DUP vs {_e['id']} (same numbers, same answer): «{q['question']}» → {q['options'][q['answer']]}")
except Exception as _ex: warns.append(f"duplicate check skipped: {_ex}")

# ---------- the English version (tools/sets_en/<id>.json) – shown in the app's English mode; the Hebrew stays the key ----------
HE_RE = re.compile(r"[֐-׿]")
EN_PATH = pathlib.Path(__file__).resolve().parent / "sets_en" / f"{src.stem.replace('_', '-')}.json"
EN_SUBJECT = SET["subject"] == "אנגלית"        # an English set keeps the Hebrew that is the exercise (translation, meaning hints)
HEB_SUBJECT = SET["subject"].startswith("עברית")   # a Hebrew set: only its name gets English
def q_hash(q):    # what the translation was made from: the question, its options (source order), explanation and picture text
    i = qs.index(q)
    return hashlib.sha1(json.dumps([q["question"], SRC_OPTS[i], q["explanation"], [it["e"] for it in q["scene"] if is_text(it["e"])]], ensure_ascii=False).encode()).hexdigest()[:8]
import hashlib
def en_entry(q):
    i = qs.index(q)
    return {"he": q["question"], "a": q["options"][q["answer"]], "h": q_hash(q), "ho": SRC_OPTS[i], "hx": q["explanation"],
            "hsc": {str(k): it["e"] for k, it in enumerate(q["scene"]) if is_text(it["e"])}}
def en_key(he, a): return he.strip() + "\u0001" + a.strip()
EN = json.loads(EN_PATH.read_text(encoding="utf-8")) if EN_PATH.exists() else None
EN_OUT = None
if __import__("os").environ.get("SFF_EN_DUMP"):
    # a skeleton for the translator: every question with its Hebrew, and the English already written (kept); then stop
    old = {en_key(e.get("he", ""), e.get("a", "")): e for e in (EN or {}).get("questions", [])}
    out = {"set": {"name": "", "title": "", "tags": [""] * len(SET.get("tags", []))} | ((EN or {}).get("set") or {}),
           "set_he": {"name": SET["name"], "title": SET.get("title", ""), "tags": SET.get("tags", [])},
           "labels": {t: ((EN or {}).get("labels") or {}).get(t, "") for t in list(dict.fromkeys(SET["topics"] + [c["title"] for c in chapters]))},
           "texts": {str(i): ((EN or {}).get("texts") or {}).get(str(i), "") for i, c in enumerate(chapters) if c.get("text")},
           "texts_he": {str(i): c["text"] for i, c in enumerate(chapters) if c.get("text")},
           "questions": []}
    for q in qs:
        e = en_entry(q); o = old.get(en_key(e["he"], e["a"]), {})
        keep = lambda t: "" if HE_RE.search(str(t)) else t      # text with no Hebrew (numbers, an English sentence) is copied as it is
        out["questions"].append({**e, "q": o.get("q", keep(e["he"])), "o": o.get("o", [keep(x) for x in e["ho"]]), "x": o.get("x", keep(e["hx"])),
                                 "sc": o.get("sc", {k: ("" if HE_RE.search(v) else re.sub(r"([\d?)])\s+:\s+([\d?(])", r"\1 ÷ \2", v)) for k, v in e["hsc"].items()
                                                    if HE_RE.search(v) or re.search(r"[\d?)]\s+:\s+[\d?(]", v)}),   # a Hebrew card, or a division card ("24 : 4" → "24 ÷ 4"; a ratio stays ":")
                                 **({"stale": True} if o and o.get("h") != e["h"] else {})})
    dst = pathlib.Path(__import__("os").environ["SFF_EN_DUMP"]); dst.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"EN skeleton: {len(qs)} questions → {dst}"); sys.exit(0)
if EN is not None:
    en_err = lambda m: errors.append("EN " + m)
    has_he = lambda t: bool(HE_RE.search(str(t)))
    lim_q = ns.get("MAX_Q_WORDS_EN", -(-3 * ns.get("MAX_Q_WORDS", 6) // 2))
    es = EN.get("set") or {}
    if not str(es.get("name", "")).strip(): en_err("set: no English name")
    if not HEB_SUBJECT:
        if not str(es.get("title", "")).strip(): en_err("set: no English title")
        if len(es.get("tags") or []) != len(SET.get("tags", [])): en_err("set: tags – one English tag for each tag")
    labels = {k: v for k, v in (EN.get("labels") or {}).items() if str(v).strip()}
    if not HEB_SUBJECT:
        for t in list(dict.fromkeys(SET["topics"] + [c["title"] for c in chapters])):
            if t not in labels: en_err(f"label missing: «{t}»")
            elif not EN_SUBJECT and has_he(labels[t]): en_err(f"label «{t}» → «{labels[t]}» has Hebrew")
    texts = {k: v for k, v in (EN.get("texts") or {}).items() if str(v).strip()}
    for i, c in enumerate(chapters):
        if c.get("text") and not HEB_SUBJECT and not EN_SUBJECT and str(i) not in texts: en_err(f"ch{i+1}: the reading passage has no English")
    by = {en_key(e.get("he", ""), e.get("a", "")): e for e in EN.get("questions", [])}
    used, n_en = set(), 0
    for q in ([] if HEB_SUBJECT else qs):
        k = en_key(q["question"], q["options"][q["answer"]]); e = by.get(k); i = qs.index(q)
        tag = f"ch{q['ch']+1} «{q['question']}»"
        if not e or not str(e.get("q", "")).strip(): en_err(f"{tag}: no English"); continue
        used.add(k)
        if e.get("h") != q_hash(q): en_err(f"{tag}: the Hebrew changed since it was translated – check the English, then dump again (h)"); continue
        noiso = lambda t: re.sub(r"[\u2066-\u2069]", "", str(t)).strip()   # English reads left to right: no direction marks (else "⁦5⁩" ≠ "5" in the games)
        eo = [noiso(o) for o in (e.get("o") or [])]
        if len(eo) != 4 or len(set(eo)) != 4 or not all(eo): en_err(f"{tag}: need 4 different English options"); continue
        eq, ex = noiso(e["q"]), noiso(e.get("x", ""))
        ea = eo[SRC_OPTS[i].index(q["options"][q["answer"]])]
        if not EN_SUBJECT and any(has_he(t) for t in [eq, ex, *eo]): en_err(f"{tag}: Hebrew left in the English")
        if words(eq) > lim_q: en_err(f"{tag}: English question > {lim_q} words")
        if any(words(o) > 4 for o in eo): en_err(f"{tag}: English option > 4 words")
        if words(ex) > 14: en_err(f"{tag}: English explanation > 14 words")
        if not ns.get("ANSWER_IN_Q_OK") and re.search(r"(?<!\w)" + re.escape(ea.lower()) + r"(?!\w)", eq.lower()): en_err(f"{tag}: the English question gives the answer away ({ea})")
        # the picture's text cards: each Hebrew card needs its English; only text cards may be replaced
        sc = {str(a): noiso(b) for a, b in (e.get("sc") or {}).items() if noiso(b)}
        for a, b in sc.items():
            if not a.isdigit() or int(a) >= len(q["scene"]) or not is_text(q["scene"][int(a)]["e"]): en_err(f"{tag}: sc {a} is not a text card of the picture"); continue
            if len(b) > 16: en_err(f"{tag}: English card too long \"{b}\"")
            if "←" in b and not has_he(b): en_err(f"{tag}: English card with ← \"{b}\" – write it with →")
            if not EN_SUBJECT and has_he(b): en_err(f"{tag}: Hebrew left on the card \"{b}\"")
        if not EN_SUBJECT:
            for k2, it in enumerate(q["scene"]):
                if is_text(it["e"]) and has_he(it["e"]) and str(k2) not in sc: en_err(f"{tag}: the card \"{it['e']}\" has no English")
        cards = [sc.get(str(k2), it["e"]) for k2, it in enumerate(q["scene"]) if is_text(it["e"])]
        if len(cards) == 1 and cards[0].strip().lower() == ea.lower() and ea.lower() not in eq.lower() and q["scene"] and len([x for x in q["scene"] if is_text(x["e"])]) == len(q["scene"]):
            en_err(f"{tag}: the English card \"{cards[0]}\" is the answer")
        q["en"] = {"k": q["question"].strip(), "q": eq, "o": [eo[SRC_OPTS[i].index(o)] for o in q["options"]], "x": ex, **({"sc": sc} if sc else {})}
        n_en += 1
    extra = [e.get("he") for k, e in by.items() if k not in used] if not HEB_SUBJECT else []
    if extra: warns.append(f"EN: {len(extra)} English entr(ies) for questions not in the set (old?) – e.g. «{extra[0]}»")
    # match / memory: the English answer cards of a chapter – two different answers that look the same in English
    for ci in range(len(chapters)):
        m, r = {}, {}
        for q in qs:
            if q["ch"] != ci or "en" not in q: continue
            he, en = q["options"][q["answer"]].strip().lower(), q["en"]["o"][q["answer"]].strip().lower()
            if en in m and m[en] != he: warns.append(f"EN ch{ci+1}: «{m[en]}» and «{he}» are both «{en}» in English – a match / memory line to either is accepted")
            m.setdefault(en, he)
            if he in r and r[he] != en: warns.append(f"EN ch{ci+1}: «{he}» is «{r[he]}» in one question and «{en}» in another – the same answer should be the same English text")
            r.setdefault(he, en)
    if str(es.get("name", "")).strip(): labels.setdefault(SET["name"], str(es["name"]).strip())   # the set's name (a catalog preview, the add screen)
    EN_OUT = {"labels": labels, **({"texts": texts} if texts else {}), "name": str(es.get("name", "")).strip(), "title": str(es.get("title", "")).strip(),
              "tags": [str(t).strip() for t in (es.get("tags") or [])]}
    print(f"EN: {n_en}/{len(qs)} questions in English", file=sys.stderr)

_missing = CORE_Q - {_nq(q["question"]) for q in qs}
if _missing: warns.append(f"core_facts.json: {len(_missing)} question(s) not found in the set (reworded?)")
if warns and not __import__("os").environ.get("SFF_QUIET"): print("\n".join("warning: " + w for w in warns), file=sys.stderr)
if errors:
    print("\n".join(errors)); sys.exit(1)
if __import__("os").environ.get("SFF_DRY"):   # check only, write nothing (safe to run many builds at once)
    print(f"ok (dry): {len(qs)} questions"); sys.exit(0)

riddle = sum(1 for q in qs if re.fullmatch(r"[A-Za-z0-9 '\-]{2,14}", q["options"][q["answer"]]))
import hashlib
ver = hashlib.sha1(json.dumps([SET, chapters, qs] + ([EN_OUT] if EN_OUT else []), ensure_ascii=False, sort_keys=True).encode()).hexdigest()[:10]   # changes only when the content changes
payload = {"v": 1, "ver": ver, "src": src.stem, **SET, "group": "", **({"words": word_list} if word_list else {}), "chapters": chapters, "questions": qs, **({"en": EN_OUT} if EN_OUT else {}),
           "qa": {"checked": len(qs), "passed": len(qs), "fixed": 0, "dropped": 0, **ns.get("QA", {})}}   # QA = {"fixed": n}: questions reworded after review
code = "SFF1:" + base64.b64encode(json.dumps(payload, ensure_ascii=False).encode("utf-8")).decode()
sid = src.stem.replace("_", "-") + "-" + secrets.token_hex(3)
out = pathlib.Path(__file__).resolve().parent.parent / "public" / "share" / f"{sid}.txt"
out.parent.mkdir(exist_ok=True)
# codes already handed out stay valid and always bring the latest version (import updates in place)
# only this set's own codes (<name>-<6 hex>.txt) – "math7-*" must not catch math7-nov26's files
aliases = {p for p in out.parent.glob(src.stem.replace("_", "-") + "-*.txt") if re.fullmatch(re.escape(src.stem.replace("_", "-")) + r"-[0-9a-f]{6}", p.stem)}
for a in ns.get("OLD_CODES", []): aliases.add(out.parent / f"{a}.txt")
aliases.add(out.parent / f"{src.stem.replace('_', '-')}.txt")   # stable name used by the in-app share link (/?add=<name>)
for f in aliases | {out}: f.write_text(code, encoding="utf-8")
# catalog entry (public/share/catalog.json) – what the in-app catalog shows
cat_path = out.parent / "catalog.json"
try: catalog = json.loads(cat_path.read_text(encoding="utf-8"))
except Exception: catalog = {"sets": []}
code_name = src.stem.replace("_", "-")
samples, seen_ch = [], set()
for q in qs:                                   # one sample from different chapters, pictures first
    if q["ch"] in seen_ch or len(samples) >= 3 or ("text" in chapters[q["ch"]]): continue
    seen_ch.add(q["ch"]); samples.append({"q": q["question"], "e": "".join(it["e"] for it in q["scene"][:2]), **({"q_en": q["en"]["q"]} if "en" in q else {})})
entry = {"id": code_name, "ver": ver, "subject": SET["subject"], "grade": SET["grade"], "title": SET.get("title", SET["name"]),
         "desc": SET.get("desc", ""), "desc_en": SET.get("desc_en", ""), "tags": SET.get("tags", SET["topics"]), "questions": len(qs), "chapters": len(chapters),
         "reading": sum(1 for c in chapters if c.get("text")), "words": len(word_list), "samples": samples, "status": "ready",
         **({"name_en": EN_OUT["name"], "title_en": EN_OUT["title"] or EN_OUT["name"], "tags_en": EN_OUT["tags"] or SET.get("tags", SET["topics"])} if EN_OUT else {})}
catalog["sets"] = [e for e in catalog["sets"] if e.get("id") != code_name] + [entry]
cat_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=1), encoding="utf-8")
print(f"OK  words {len(word_list)}/{len(word_list)} practised")
print(f"OK  {len(qs)} questions · {len(chapters)} chapters · riddle-ready {riddle}")
print(f"CODE  SFF1@{sid}")
