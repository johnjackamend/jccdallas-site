#!/usr/bin/env python3
"""Add a J Collective post from a plain-text file.
Usage: python3 tools/add_post.py "<title>" <slug> <YYYY-MM-DD> "<category>" body.txt
Body: paragraphs separated by blank lines. Category must match an existing one (author/thumbnail are copied from the
most recent post in that category). Writes data/blog.json, j-collective/<slug>/index.html, the listing card, and sitemap.xml."""
import json, re, html, os, sys
from datetime import datetime
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(root)
SITE = "https://www.jccdallas.org"
title, slug, ymd, category, bodyfile = sys.argv[1:6]
paras = [p.strip() for p in re.split(r"\n\s*\n", open(bodyfile, encoding="utf-8").read().strip()) if p.strip()]
e = lambda x: html.escape(x, quote=True)
body = "".join(f"<p>{e(p).replace(chr(10), '<br>')}</p>" for p in paras)
posts = json.load(open("data/blog.json", encoding="utf-8"))
assert not any(p["slug"] == slug for p in posts), "slug exists"
ref = next(p for p in posts if p["category"] == category)
d = datetime.strptime(ymd, "%Y-%m-%d")
new = dict(title=title, slug=slug, date=d.strftime("%a %b %d %Y 00:00:00 GMT+0000 (Coordinated Universal Time)"),
           category=category, author=ref["author"], authorPhoto=ref["authorPhoto"], hero=ref["hero"], thumb=ref["thumb"], body=body)
posts.insert(0, new); json.dump(posts, open("data/blog.json", "w", encoding="utf-8"), indent=1, ensure_ascii=False)

def excerpt(b):
    t = re.sub(r"<[^>]+>", " ", b); t = html.unescape(t); t = re.sub(r"\s+", " ", t).strip()
    return (t[:155].rsplit(" ", 1)[0].rstrip(",.;:") + "…") if len(t) > 155 else t
fdate = f"{d.strftime('%B')} {d.day}, {d.year}"
s = open(f"j-collective/{ref['slug']}/index.html", encoding="utf-8").read()
T = ref["title"]
s = s.replace(e(T), e(title)).replace(T, title)
s = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{e(excerpt(body))}">', s, count=1)
s = re.sub(r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{e(excerpt(body))}">', s, count=1)
s = s.replace(f"{SITE}/j-collective/{ref['slug']}", f"{SITE}/j-collective/{slug}")
s = re.sub(r'<p class="lede">[^<]*</p>', f'<p class="lede">{e(" · ".join(x for x in [category, ref["author"], fdate] if x))}</p>', s, count=1)
a = s.index('<div class="split"><div class="prose">') + len('<div class="split"><div class="prose">'); b = s.index('</div><div><div class="aside"><h4>About the author</h4>')
s = s[:a] + body + s[b:]
a = s.index('<div class="related">') + len('<div class="related">'); b = s.index('<a href="/j-collective">All posts</a>')
rel = [q for q in posts if q["slug"] != slug and q["category"] == category][:2]
s = s[:a] + "".join(f'<a href="/j-collective/{q["slug"]}">{e(q["title"])}</a>' for q in rel) + s[b:]
os.makedirs(f"j-collective/{slug}", exist_ok=True); open(f"j-collective/{slug}/index.html", "w", encoding="utf-8").write(s)

L = open("j-collective/index.html", encoding="utf-8").read()
card = (f'<a class="area" href="/j-collective/{slug}"><div class="pic"><img src="{e(new["thumb"])}" alt="" loading="lazy"></div>'
        f'<div class="in"><span style="font-size:12.5px;font-weight:700;color:var(--pink)">{e(category)}</span><h3>{e(title)}</h3>'
        f'<p>{fdate}{" · " + e(ref["author"]) if ref["author"] else ""}</p><span class="go">Read</span></div></a>')
k = '<div class="areas" id="blogGrid">'; assert L.count(k) == 1
open("j-collective/index.html", "w", encoding="utf-8").write(L.replace(k, k + card))
sm = open("sitemap.xml", encoding="utf-8").read(); assert f"/j-collective/{slug}<" not in sm
open("sitemap.xml", "w", encoding="utf-8").write(sm.replace("</urlset>", f"<url><loc>{SITE}/j-collective/{slug}</loc><lastmod>{ymd}</lastmod></url>\n</urlset>"))
print(f"{SITE}/j-collective/{slug}")
