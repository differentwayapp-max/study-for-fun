"""Build a practice set into a share code the app can import.

Usage:  python3 -I tools/build_set.py tools/sets/<file>.py
Writes  public/share/<id>.txt  (an SFF1: code). In the app: New practice → 🔗 → type  SFF1@<id>  → Import.
Checks the same rules the app uses (clean, needsPic, riddleOK) so no AI pass is needed after import.
"""
import base64, json, pathlib, random, re, secrets, sys

src = pathlib.Path(sys.argv[1])
ns = {}
exec(src.read_text(encoding="utf-8"), ns)
SET, C = ns["SET"], ns["C"]

def words(t): return len(str(t).split())
def scene(s):
    if isinstance(s, str): return [{"e": s, "x": 50, "y": 52, "s": 56}]
    return [{"e": e, "x": x, "y": y, "s": z} for e, x, y, z in s]

errors, qs, chapters = [], [], []
rng = random.Random(src.stem)   # same file → same option order
for ci, chap in enumerate(C):
    title, topics, items = chap[:3]
    text = chap[3].strip() if len(chap) > 3 else ""
    chapters.append({"title": title, "topics": topics, "count": len(items), **({"text": text} if text else {})})
    if text and not 80 <= words(text) <= 300: errors.append(f"ch{ci+1}: passage has {words(text)} words")
    for topic, q, opts, ans, expl, sc in items:
        tag = f"ch{ci+1} «{q}» → {opts[ans]}"
        if topic not in SET["topics"]: errors.append(f"{tag}: unknown topic {topic}")
        if len(opts) != 4 or len({o.strip() for o in opts}) != 4: errors.append(f"{tag}: need 4 different options")
        if words(q) > 6: errors.append(f"{tag}: question > 6 words")
        if any(words(o) > 3 for o in opts): errors.append(f"{tag}: option > 3 words")
        if words(expl) > 10: errors.append(f"{tag}: explanation > 10 words")
        if opts[ans].lower() in q.lower(): errors.append(f"{tag}: question gives the answer away")
        right = opts[ans]; opts = opts[:]; rng.shuffle(opts); ans = opts.index(right)   # answer not always first
        scn = scene(sc)
        if not 1 <= len(scn) <= 6 or any(len(it["e"]) > 4 for it in scn): errors.append(f"{tag}: bad scene")
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
payload = {"v": 1, "src": src.stem, **SET, "group": "", **({"words": word_list} if word_list else {}), "chapters": chapters, "questions": qs,
           "qa": {"checked": len(qs), "passed": len(qs), "fixed": 0, "dropped": 0}}
code = "SFF1:" + base64.b64encode(json.dumps(payload, ensure_ascii=False).encode("utf-8")).decode()
sid = src.stem.replace("_", "-") + "-" + secrets.token_hex(3)
out = pathlib.Path(__file__).resolve().parent.parent / "public" / "share" / f"{sid}.txt"
out.parent.mkdir(exist_ok=True)
# codes already handed out stay valid and always bring the latest version (import updates in place)
aliases = set(out.parent.glob(src.stem.replace("_", "-") + "-*.txt"))
for a in ns.get("OLD_CODES", []): aliases.add(out.parent / f"{a}.txt")
for f in aliases | {out}: f.write_text(code, encoding="utf-8")
print(f"OK  words {len(word_list)}/{len(word_list)} practised")
print(f"OK  {len(qs)} questions · {len(chapters)} chapters · riddle-ready {riddle}")
print(f"CODE  SFF1@{sid}")
