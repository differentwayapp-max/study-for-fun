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

ns = {"COUNT": COUNT, "TXT": TXT}
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
EMOJI_RE = re.compile("[\u2190-\u2BFF\U0001F000-\U0001FAFF\uFE0F\u20E3]")
def is_text(e): return not EMOJI_RE.search(e)          # a picture item that is a number card / short text, e.g. "12 → ?"
# a picture that has nothing to do with the question: only allowed next to other, real items
GENERIC = set("🤔 ❓ ❔ 🔢 ➕ ➖ ✖️ ➗ 🧮 💯 ✏️ 📝 ✍️ 🔍 📚 💭 ✨ 🎯 🏆".split())
def words(t): return len(str(t).split())
def scene(s):
    if isinstance(s, str): return [{"e": s, "x": 50, "y": 52, "s": 56}]
    return [{"e": e, "x": x, "y": y, "s": z} for e, x, y, z in s]

errors, qs, chapters = [], [], []
rng = random.Random(src.stem)   # same file → same option order
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
        right = opts[ans]; opts = opts[:]; rng.shuffle(opts); ans = opts.index(right)   # answer not always first
        scn = scene(sc)
        if not 1 <= len(scn) <= 12 or any(len(it["e"]) > 4 for it in scn): errors.append(f"{tag}: bad scene")
        if len(scn) == 1 and scn[0]["e"] in GENERIC: errors.append(f"{tag}: the picture is decoration ({scn[0]['e']}) – show what the question is about, or the numbers as a card (TXT)")
        for it in scn:
            if is_text(it["e"]):
                if len(it["e"]) > 16: errors.append(f"{tag}: picture text too long \"{it['e']}\"")
                hw = it["s"] * .3 * len(it["e"]) / 1.6
                if it["x"] - hw < 1 or it["x"] + hw > 99: errors.append(f"{tag}: picture text \"{it['e']}\" is too wide")
                continue
            if bases(it["e"]) != 1: errors.append(f"{tag}: one emoji per picture item – \"{it['e']}\" (use COUNT for several)")
            hw, hh = it["s"] * .62 / 1.6, it["s"] * .5                # half width / height of the emoji, in % of the frame
            if it["x"] - hw < -1 or it["x"] + hw > 101 or it["y"] - hh < -1 or it["y"] + hh > 101: errors.append(f"{tag}: \"{it['e']}\" is outside the frame")
        qs.append({"topic": topic, "question": q, "options": opts, "answer": ans,
                   "explanation": expl, "emoji": scn[0]["e"], "scene": scn, "ch": ci})

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

if errors:
    print("\n".join(errors)); sys.exit(1)

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
aliases = set(out.parent.glob(src.stem.replace("_", "-") + "-*.txt"))
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
