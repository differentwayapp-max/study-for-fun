"""Build the user guide and the terms of use pages from their Markdown texts.

Usage:  python3 -I tools/build_docs.py
Reads   tools/docs/guide-he.md, guide-en.md, terms-he.md, terms-en.md, consent-he.md, consent-en.md
Writes  public/guide.html, public/terms.html, public/consent.html  (same look as privacy.html; Hebrew + English, ?lang=he|en
        picks the language; the guide gets a clickable table of contents; the terms page shows its "In short" part on top),
        and public/consent.json – the parents' consent letter for the app: {v, he: {title, html}, en: {...}}.
        In the letter, {שם המורה}/{teacher name}, {שם הקבוצה}/{group name} and {תאריך}/{date} become empty
        <span class="ph-teacher|ph-group|ph-date"> that the app (or ?t=…&g=… on consent.html) fills in as plain text.
        The letter's version is the "גרסה X.Y" line of consent-he.md – CONSENT_VERSION in index.html must be the same.
The terms version (TERMS_VERSION in index.html) is the date in terms-he.md – change both together.
Only a small Markdown subset is used: #, ##, ### headings, "- " lists, **bold**, paragraphs. All text is HTML-escaped.
"""
import html, json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
DOCS = ROOT / "tools" / "docs"


PH = {"{שם המורה}": "teacher", "{teacher name}": "teacher", "{שם הקבוצה}": "group", "{group name}": "group", "{תאריך}": "date", "{date}": "date"}


def inline(t):
    t = html.escape(t, quote=False)
    for k, v in PH.items():
        t = t.replace(html.escape(k, quote=False), f'<span class="ph-{v}"></span>')
    t = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", t)
    # the privacy policy is mentioned by name – link it (same language)
    t = re.sub(r"(מדיניות הפרטיות|privacy policy)", r'<a href="/privacy.html">\1</a>', t)
    return t


def md(text, lang, toc):
    """→ (title, body html, list of (id, heading) for the table of contents)"""
    out, items, title, in_list = [], [], "", False
    def close():
        nonlocal in_list
        if in_list: out.append("</ul>"); in_list = False
    for line in text.splitlines():
        s = line.rstrip()
        if not s.strip(): close(); continue
        if s.startswith("# "):
            close(); title = s[2:].strip(); continue
        if s.startswith("## "):
            close(); h = s[3:].strip(); hid = f"{lang}-s{len(items) + 1}"; items.append((hid, h))
            out.append(f'<h2 id="{hid}">{inline(h)}</h2>'); continue
        if s.startswith("### "):
            close(); out.append(f"<h3>{inline(s[4:].strip())}</h3>"); continue
        if s.startswith("- "):
            if not in_list: out.append("<ul>"); in_list = True
            out.append(f"<li>{inline(s[2:].strip())}</li>"); continue
        close(); out.append(f"<p>{inline(s.strip())}</p>")
    close()
    return title, "\n".join(out), items


PAGE = """<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title_he} · Study for fun</title>
<meta name="robots" content="index">
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Varela+Round&display=swap" rel="stylesheet">
<style>
:root{{--bg:#E4F1FF;--card:#fff;--ink:#1B2A4A;--muted:#5B6785;--sun:#F2A63B;--blue:#2F6BFF;--line:2px solid #1B2A4A}}
*{{box-sizing:border-box}}
html{{scroll-behavior:smooth}}
body{{margin:0;background:var(--bg) radial-gradient(#c9dcf5 1px,transparent 1px) 0 0/22px 22px;color:var(--ink);font-family:"Varela Round",Arial,sans-serif;line-height:1.75;overflow-x:hidden}}
main{{max-width:760px;margin:0 auto;padding:20px 16px 60px}}
.card{{background:var(--card);border:var(--line);border-radius:24px;box-shadow:0 5px 0 var(--ink);padding:22px;overflow-wrap:anywhere}}
h1,h2,h3,.top a,button{{font-family:Fredoka,Arial,sans-serif}}
h1{{margin:0 0 2px;font-size:27px;line-height:1.3}}
h2{{font-size:20px;margin:28px 0 4px;scroll-margin-top:12px}}
h3{{font-size:17px;margin:14px 0 2px}}
p{{margin:6px 0}}
.muted{{color:var(--muted);font-size:14px}}
.top{{display:flex;align-items:center;gap:10px;margin-bottom:14px}}
.top a{{color:var(--ink);font-weight:600;text-decoration:none;margin-inline-end:auto}}
button{{border:var(--line);background:#fff;border-radius:999px;padding:4px 14px;font-weight:600;cursor:pointer;font-size:15px;box-shadow:0 3px 0 var(--ink);color:var(--ink)}}
ul{{padding-inline-start:22px;margin:4px 0}}
li{{margin:3px 0}}
a{{color:var(--blue)}}
.toc{{background:#F3F6FF;border:1.5px solid #D8DDEA;border-radius:16px;padding:10px 14px;margin:14px 0 4px}}
.toc b{{display:block;margin-bottom:4px}}
.toc ol{{margin:0;padding-inline-start:22px}}.toc li{{margin:2px 0}}.toc a{{text-decoration:none}}
.note{{background:#FFF6E3;border:1.5px dashed var(--sun);border-radius:14px;padding:10px 14px;margin-top:12px}}
.note h2{{margin:0 0 2px;font-size:17px}}
.updated{{margin-top:22px}}
[data-l]{{display:none}}
html[lang=he] [data-l=he], html[lang=en] [data-l=en]{{display:block}}
</style>
</head>
<body>
<main>
  <div class="top">
    <a href="/" data-l="he">→ חזרה ל-Study for fun</a><a href="/" data-l="en">← Back to Study for fun</a>
    <button onclick="setLang(document.documentElement.lang==='he'?'en':'he')"><span data-l="he">English</span><span data-l="en">עברית</span></button>
  </div>
{cards}
</main>
<script>
function setLang(l){{ document.documentElement.lang=l; document.documentElement.dir=l==='he'?'rtl':'ltr';
  document.title=(l==='he'?{t_he}:{t_en})+' · Study for fun'; try{{ localStorage.setItem('sff_lang',l); }}catch(e){{}} }}
(function(){{ let l=new URLSearchParams(location.search).get('lang'); if(l!=='he'&&l!=='en'){{ try{{ l=localStorage.getItem('sff_lang'); }}catch(e){{}} }}
  setLang(l==='en'?'en':'he'); }})();
</script>
</body>
</html>
"""


def card(lang, text, kind):
    title, body, items = md(text, lang, kind == "guide")
    dir_ = "rtl" if lang == "he" else "ltr"
    head = f'<h1>{inline(title)}</h1>\n<div class="muted">Study for fun · by D-WAY</div>'
    if kind == "guide":
        toc = "".join(f'<li><a href="#{i}">{inline(h)}</a></li>' for i, h in items)
        head += f'\n<nav class="toc" aria-label="{"תוכן עניינים" if lang == "he" else "Contents"}"><b>{"📑 תוכן עניינים" if lang == "he" else "📑 Contents"}</b><ol>{toc}</ol></nav>'
    else:
        # the short version ("בקצרה" / "In short") on top, in a highlighted box; the "last updated" line at the bottom
        body = re.sub(r'(<h2 id="[^"]+">(?:בקצרה|In short)</h2>\n<p>.*?</p>)', r'<div class="note">\1</div>', body, count=1, flags=re.S)
        body = re.sub(r"<p>((?:עודכן לאחרונה|Last updated):.*?)</p>", r'<p class="muted updated">\1</p>', body)
    return f'  <div class="card" data-l="{lang}" dir="{dir_}">\n{head}\n{body}\n  </div>', title


for kind in ("guide", "terms", "consent"):
    he, t_he = card("he", (DOCS / f"{kind}-he.md").read_text(encoding="utf-8"), kind)
    en, t_en = card("en", (DOCS / f"{kind}-en.md").read_text(encoding="utf-8"), kind)
    strip = lambda t: re.sub(r"\s*–\s*Study for fun$", "", re.sub(r"^[^\w֐-׿]+", "", t)).strip()
    page = PAGE.format(title_he=html.escape(strip(t_he)), cards=he + "\n" + en,
                       t_he=json.dumps(strip(t_he), ensure_ascii=False), t_en=json.dumps(strip(t_en), ensure_ascii=False))
    if kind == "consent":
        # a printable letter: the placeholders are filled from ?t=<teacher>&g=<group> (as text) and today's date
        page = page.replace("</body>", """<style>.ph-teacher:empty::before,.ph-group:empty::before{content:'______'}@media print{.top{display:none}body{background:#fff}.card{border:0;box-shadow:none}}</style>
<script>(function(){ const q=new URLSearchParams(location.search), d=new Date();
  const put=(c,v)=>document.querySelectorAll('.ph-'+c).forEach(e=>{ e.textContent=v; });
  if(q.get('t')) put('teacher',q.get('t').slice(0,60)); if(q.get('g')) put('group',q.get('g').slice(0,60));
  put('date',d.getDate()+'.'+(d.getMonth()+1)+'.'+d.getFullYear()); if(q.get('print')) setTimeout(()=>print(),600); })();</script>
</body>""")
        ver = re.search(r"גרסה\s+([0-9.]+)", (DOCS / "consent-he.md").read_text(encoding="utf-8")).group(1)
        body = lambda c: re.sub(r'^\s*<div class="card"[^>]*>\n', "", c).rsplit("</div>", 1)[0]
        (ROOT / "public" / "consent.json").write_text(json.dumps({"v": ver, "he": {"title": strip(t_he), "html": body(he)}, "en": {"title": strip(t_en), "html": body(en)}}, ensure_ascii=False), encoding="utf-8")
        print("public/consent.json (v" + ver + ")")
    (ROOT / "public" / f"{kind}.html").write_text(page, encoding="utf-8")
    print(f"public/{kind}.html")
