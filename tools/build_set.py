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
    for topic, q, opts, ans, expl, sc in items:
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
        qs.append({"topic": topic, "question": q, "options": opts, "answer": ans,
                   "explanation": expl, "emoji": scn[0]["e"], "scene": scn, "ch": ci})

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

if warns and not __import__("os").environ.get("SFF_QUIET"): print("\n".join("warning: " + w for w in warns), file=sys.stderr)
if errors:
    print("\n".join(errors)); sys.exit(1)
if __import__("os").environ.get("SFF_DRY"):   # check only, write nothing (safe to run many builds at once)
    print(f"ok (dry): {len(qs)} questions"); sys.exit(0)

riddle = sum(1 for q in qs if re.fullmatch(r"[A-Za-z0-9 '\-]{2,14}", q["options"][q["answer"]]))
import hashlib
ver = hashlib.sha1(json.dumps([SET, chapters, qs], ensure_ascii=False, sort_keys=True).encode()).hexdigest()[:10]   # changes only when the content changes
payload = {"v": 1, "ver": ver, "src": src.stem, **SET, "group": "", **({"words": word_list} if word_list else {}), "chapters": chapters, "questions": qs,
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
    seen_ch.add(q["ch"]); samples.append({"q": q["question"], "e": "".join(it["e"] for it in q["scene"][:2])})
entry = {"id": code_name, "ver": ver, "subject": SET["subject"], "grade": SET["grade"], "title": SET.get("title", SET["name"]),
         "desc": SET.get("desc", ""), "desc_en": SET.get("desc_en", ""), "tags": SET.get("tags", SET["topics"]), "questions": len(qs), "chapters": len(chapters),
         "reading": sum(1 for c in chapters if c.get("text")), "words": len(word_list), "samples": samples, "status": "ready"}
catalog["sets"] = [e for e in catalog["sets"] if e.get("id") != code_name] + [entry]
cat_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=1), encoding="utf-8")
print(f"OK  words {len(word_list)}/{len(word_list)} practised")
print(f"OK  {len(qs)} questions · {len(chapters)} chapters · riddle-ready {riddle}")
print(f"CODE  SFF1@{sid}")
