#!/usr/bin/env python3
"""Build /winter-preview/index.html from the aquatics page shell (head, nav, findband, footer) + Winter at The J content."""
import json, os, re
os.chdir("/home/claude/jccdallas-site")
src = open("aquatics/index.html", encoding="utf-8").read()
D = json.load(open("data/programs.json", encoding="utf-8"))
W = [p for p in D["P"] if "winter" in (p.get("tags") or [])]
catLabel = {c["id"]: c["label"] for c in D["CATS"]}

head = src[:src.find("</head>")]
nav = src[src.find("<body"):src.find('<section class="dhero')]
tail = src[src.find('<section class="sec findband"'):]

# ---- head ----
head = re.sub(r"<title>[^<]*</title>", "<title>Winter at The J 2026–27 | Aaron Family JCC of Dallas</title>", head)
head = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="Winter at The J 2026–27: every program, class, and event at the Aaron Family JCC of Dallas from December through spring, with dates and one-click registration.">', head)
head = re.sub(r'<meta property="og:title" content="[^"]*">', '<meta property="og:title" content="Winter at The J 2026–27 | Aaron Family JCC of Dallas">', head)
head = re.sub(r'<meta property="og:description" content="[^"]*">', '<meta property="og:description" content="Every program, class, and event at The J this winter, in one place.">', head)
head = re.sub(r'<meta property="og:image" content="[^"]*">', '<meta property="og:image" content="https://www.jccdallas.org/assets/aquatics/swim-teams-hero.jpg">', head)
head = re.sub(r'<meta property="og:url" content="[^"]*">', '<meta property="og:url" content="https://www.jccdallas.org/winter-preview">', head)
head = re.sub(r'<link rel="canonical" href="[^"]*">', '<link rel="canonical" href="https://www.jccdallas.org/winter-preview">', head)
head = head.replace('<meta name="twitter:card" content="summary_large_image">', '<meta name="twitter:card" content="summary_large_image">\n<meta name="robots" content="noindex, nofollow">')
head += """<style>
.wx-hero{background:radial-gradient(60% 90% at 85% 15%,rgba(214,37,152,.5) 0%,rgba(214,37,152,0) 60%),radial-gradient(50% 80% at 10% 100%,rgba(107,65,181,.6) 0%,rgba(107,65,181,0) 60%),var(--purple-dark)}
.wx-hero .eyebrow{display:inline-block;font:700 12.5px/1 var(--body);letter-spacing:.14em;text-transform:uppercase;color:#fff;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.25);border-radius:var(--r-pill);padding:9px 14px;margin-bottom:18px}
.wx-paths{grid-template-columns:repeat(4,minmax(0,1fr))}
@media (max-width:1000px){.wx-paths{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:560px){.wx-paths{grid-template-columns:1fr}}
.wx-paths .area .pic{aspect-ratio:16/7;display:grid;place-items:center;font:700 44px var(--display);color:#fff}
.wx-paths .area:nth-child(1) .pic{background:linear-gradient(135deg,#d40058,#ff6fa5)}
.wx-paths .area:nth-child(2) .pic{background:linear-gradient(135deg,#400186,#7a4fd0)}
.wx-paths .area:nth-child(3) .pic{background:linear-gradient(135deg,#05c3dd,#0a7fa8)}
.wx-paths .area:nth-child(4) .pic{background:linear-gradient(135deg,#f8485e,#ad1aac)}
.wx-filter{position:sticky;top:0;z-index:4;background:rgba(255,255,255,.94);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border-bottom:1px solid var(--line);padding:12px 0}
.wx-filter .wrap{display:flex;flex-direction:column;gap:8px}
.wx-filter .row{display:flex;gap:8px;flex-wrap:nowrap;align-items:center;overflow-x:auto;scrollbar-width:none;padding-bottom:2px;-webkit-overflow-scrolling:touch}
.wx-filter .row::-webkit-scrollbar{display:none}
.wx-filter .chip{white-space:nowrap;flex:none}
.wx-filter .lbl{font-size:13px;font-weight:700;color:var(--ink-mute);margin-right:4px;min-width:64px}
.wx-filter .chip.on{background:var(--purple);border-color:var(--purple);color:#fff}
.wx-filter .chip.on.a{background:var(--pink);border-color:var(--pink)}
.wx-cat{padding:34px 0 6px}
.wx-cat.hide{display:none}
.wx-cat h3{font-size:24px;margin:0 0 4px}
.wx-cat .sub{color:var(--ink-soft);margin:0 0 18px;font-size:15px}
.wx-cat .pempty{display:none}
.wx-dates{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px}
.wx-dates li{list-style:none;background:#fff;border:1px solid var(--line);border-radius:18px;padding:16px 18px}
.wx-dates li b{display:block;color:var(--purple);font-size:13px;letter-spacing:.06em;text-transform:uppercase;margin-bottom:4px}
.wx-dates li span{font-weight:600}
.wx-dates li small{display:block;color:var(--ink-soft);margin-top:3px}
.pcard .pic.ph{display:grid;place-items:center;background:linear-gradient(135deg,var(--purple) 0%,#6b41b5 60%,var(--pink) 140%)}
.pcard .pic.ph .phl{color:#fff;font:700 17px/1.25 var(--display);text-align:center;padding:18px 22px;text-shadow:0 1px 8px rgba(0,0,0,.25)}
.pcard .pic.ph::after{content:"Photo coming soon";position:absolute;left:12px;bottom:10px;font:600 11px var(--body);color:rgba(255,255,255,.8);letter-spacing:.04em}
.pcard .pic.ph .tag{z-index:1}
@media (max-width:720px){.wx-filter{position:static}.wx-paths .area .pic{aspect-ratio:16/6;font-size:34px}}
</style>
"""
nav = nav.replace('<body class="dept dept-aquatics">', '<body class="dept dept-winter">', 1)

# ---- category order and audience chips ----
ORDER = ["social", "bookfest", "comedy", "seniors", "member", "dining", "holiday", "learning", "fitness", "aqua-a", "aqua-y", "racq-a", "racq-y", "sport-a", "sport-y", "gym-y", "mahj", "arts-y", "active", "clubj", "gecc", "camp", "emerg"]
present = {}
for p in W:
    present.setdefault(p["cat"], 0); present[p["cat"]] += 1
    for c in p.get("also") or []: present.setdefault(c, 0)
cats = [c for c in ORDER if c in present]
assert set(cats) >= {c for c in present if present[c] > 0}, set(present) - set(cats)
SUB = {"social": "The big nights and signature events of the season.", "bookfest": "Margot Rosenberg Pulitzer Dallas Jewish BookFest, winter authors.", "mahj": "Classes, leagues, theme nights, and the 2027 tournament.",
       "fitness": "Fitness events are free unless noted; members register in the My J app.", "learning": "Wednesday courses meet 11:00 AM to 12:30 PM in the Board Room.", "holiday": "Purim, Israel Independence Day, and holiday treats.",
       "emerg": "READY Academy at The J: American Red Cross courses and the December blood drive."}
LABEL = {"social": "Big Energy Events", "emerg": "READY Academy (Emergency Training)", "gecc": "GECC Enrichment & Early Childhood", "seniors": "Seniors & Active Adults"}

chips_cat = '<button class="chip on" data-cat="all">All</button>' + "".join(f'<button class="chip" data-cat="{c}">{LABEL.get(c, catLabel[c])}</button>' for c in cats)
chips_aud = '<button class="chip on a" data-aud="all">Everyone</button><button class="chip" data-aud="kids">Kids</button><button class="chip" data-aud="teens">Teens</button><button class="chip" data-aud="adults">Adults</button><button class="chip" data-aud="seniors">Active Adults</button>'
sections = "".join(f'<div class="wx-cat" id="cat-{c}" data-cat="{c}"><h3>{LABEL.get(c, catLabel[c])}</h3>' + (f'<p class="sub">{SUB[c]}</p>' if c in SUB else '') +
                   f'<div data-programs="tag:winter;cat:{c}" data-limit="6" data-more="expand" data-empty=""></div></div>' for c in cats)

HIGHLIGHTS = [q["id"] for q in W if q["t"] in ("Vodkas & Latkes", "Margot Rosenberg Pulitzer Dallas Jewish BookFest", "2027 Mahj Tournament", "Comedy at The J", "Senior Expo 2027", "Bagel Run 2027", "Annual Meeting 2027", "January Membership Special", "Angela's Coffee House")]
assert len(HIGHLIGHTS) == 9, HIGHLIGHTS

hol = [("Fri, Dec 4 – Fri, Dec 11", "Hanukkah (Nights 1–8)", "Regular programming"), ("Thu, Dec 24", "Christmas Eve", "5 am to 4 pm"), ("Fri, Dec 25", "Christmas Day", "7 am to 1 pm"),
       ("Thu, Dec 31", "New Year's Eve", "Closes at 6 pm"), ("Fri, Jan 1", "New Year's Day", "10 am to 4 pm"), ("Mon, Jan 18", "Martin Luther King Jr. Day", "Regular hours; no regular programming, School Day Out runs"),
       ("Sat, Jan 23", "Tu B'Shevat", "Regular hours"), ("Tue, Mar 23", "Purim", "Regular hours"), ("Wed, Apr 21 – Fri, Apr 23; Tue, Apr 27 – Thu, Apr 29", "Passover", "Regular hours; Business Office closed Apr 22 and Apr 28"),
       ("Tue, May 4", "Yom HaShoah", "Regular hours"), ("Tue, May 11", "Yom Hazikaron", "Regular hours"), ("Wed, May 12", "Yom HaAtzmaut", "Regular hours"), ("Tue, May 25", "Lag B'Omer", "Regular hours"), ("Mon, May 31", "Memorial Day", "5 am to 6 pm")]
hol_rows = "".join(f"<tr><td>{d}</td><td>{h}</td><td>{t}</td></tr>" for d, h, t in hol)

dates = [("Dec 1", "Winter begins", "Masters Swim, Open Tennis Drills, Road to 1000 Pushups, First Aid/CPR courses"), ("Dec 10", "Vodkas & Latkes", "Holiday Market in the lobby from 2 pm"),
         ("Dec 21", "Winter Breaktacular", "Club J, one day or the whole break"), ("Jan 1–31", "January Membership Special", "No registration fee, February free"),
         ("Jan 5", "Registration day", "GECC preschool enrollment opens; Beginner Mahj Session 1 starts"), ("Jan 11", "Summer camp priority registration", "Members Jan 19, non-members Jan 25"),
         ("Jan 24", "All Camps Open House", "1:00 to 3:00 PM, JCC Lobby"), ("Feb 14", "NMJL card deadline", "Order your 2027 Mah Jongg card"), ("Feb 22", "Hamantaschen pre-orders open", "J Gourmet"),
         ("Mar 7", "2027 Mahj Tournament", "Check-in 11:30 AM"), ("Mar 16", "Senior Expo", "Zale Auditorium"), ("May 9", "Bagel Run 2027", "Runners, walkers, and cheering sections")]
date_items = "".join(f"<li><b>{d}</b><span>{t}</span><small>{s}</small></li>" for d, t, s in dates)

n_total = len(W)
main = f"""<section class="dhero no-img wx-hero">
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span>Winter at The J</span></nav>
    <span class="eyebrow">December 2026 through spring 2027</span>
    <h1>Winter at The J 2026–27</h1>
    <p class="lede">Every program, class, and event at The J this season, in one place. Pick who it is for, open the calendar, or scroll the whole season and register in one click.</p>
    <div class="acts"><a class="btn pink" href="#season">Explore the Season</a><a class="btn on-dark" href="#calendar">Winter Calendar</a></div>
  </div>
</section>
<div class="facts" aria-label="Winter at a glance">
  <div class="wrap"><div class="fact"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg><div><b>{n_total} programs and events</b><span>December through June, all in one calendar</span></div></div><div class="fact"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M15 4.5a3.5 3.5 0 0 1 0 7M17 13.5a6.5 6.5 0 0 1 4.5 6.5"/></svg><div><b>Every age</b><span>Preschool through active adults</span></div></div><div class="fact"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg><div><b>Holiday hours</b><span><a href="#holidays">Christmas, New Year's, and more</a></span></div></div><div class="fact"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg><div><b>Members and non-members</b><span>Most programs open to the whole community</span></div></div></div>
</div>
<section class="sec" id="start">
  <div class="wrap">
<div class="sec-head"><div><h2>Start Here</h2><p class="lede">Tell us who you are shopping for and we will narrow the season down.</p></div></div>
<div class="areas wx-paths"><a class="area" href="#season" data-go-aud="kids"><div class="pic">Kids</div><div class="in"><h3>For Kids &amp; Families</h3><p>Club J breaks, gymnastics, swim, youth sports, JPAS, GECC, and camp registration.</p><span class="go">Show kids &amp; family programs</span></div></a><a class="area" href="#season" data-go-aud="adults"><div class="pic">Adults</div><div class="in"><h3>For Adults</h3><p>Fitness, racquet sports, leagues, Jewish learning, J Mahj, BookFest, and the big nights.</p><span class="go">Show adult programs</span></div></a><a class="area" href="#season" data-go-aud="seniors"><div class="pic">55+</div><div class="in"><h3>For Active Adults</h3><p>Senior Expo, Wednesday courses, Masters Swim, Legends League, and more.</p><span class="go">Show active adult programs</span></div></a><a class="area" href="/membership" data-go-aud=""><div class="pic">Join</div><div class="in"><h3>New to The J?</h3><p>Join in January with no registration fee and get February free.</p><span class="go">See the January special</span></div></a></div>
  </div>
</section>
<section class="sec soft" id="highlights">
  <div class="wrap">
<div class="sec-head"><div><h2>Season Highlights</h2><p class="lede">The nights, celebrations, and traditions the whole community turns out for.</p></div><a class="btn ghost" href="#season">See the full season</a></div>
<div data-programs="tag:winter;id:{','.join(map(str, HIGHLIGHTS))}" data-empty="Highlights are being finalized."></div>
  </div>
</section>
<section class="sec" id="calendar">
  <div class="wrap">
<div class="sec-head"><div><h2>Winter Calendar</h2><p class="lede">Pick a day to see what is on. Purple marks are programs, pink marks are events.</p></div></div>
<div data-programs="tag:winter" data-view="calendar" data-month="2026-12" data-title="Winter at The J calendar" data-empty="Nothing scheduled here right now."></div>
  </div>
</section>
<section class="sec soft" id="season" style="padding-top:0">
<div class="wx-filter"><div class="wrap"><div class="row"><span class="lbl">Show</span>{chips_cat}</div><div class="row"><span class="lbl">For</span>{chips_aud}</div></div></div>
  <div class="wrap" id="seasonList">{sections}
  <p class="pempty" id="seasonEmpty" hidden>Nothing matches that combination yet. <button type="button" class="chip" data-reset>Reset filters</button></p>
  </div>
</section>
<section class="sec" id="holidays">
  <div class="wrap">
<div class="split"><div><h2>Holiday Hours</h2><p class="lede" style="margin-top:14px">Building hours follow the Sports &amp; Fitness holiday schedule. On every other day The J keeps regular hours.</p>
<div style="margin-top:22px" class="price-wrap"><table class="price"><thead><tr><th>Date</th><th>Holiday</th><th>Hours</th></tr></thead><tbody>{hol_rows}</tbody></table></div>
<p style="margin-top:12px;color:var(--ink-soft);font-size:14.5px">Full campus calendar, including Business Office hours, on the <a href="/about/#holidays">About page</a>. Pool hours are on the <a href="/aquatics/hours">Aquatics hours page</a>.</p></div>
<div><div class="aside"><h4>Dates to Know</h4><ul class="wx-dates" style="grid-template-columns:1fr;padding:0;margin:0">{date_items}</ul></div></div></div>
  </div>
</section>
<section class="ctaband">
  <div class="wrap"><div><h2>Not Sure Where to Start?</h2><p>Call us, stop by the front desk, or ask the search below in plain language. We will point you to the right program.</p></div><div class="acts"><a class="btn on-dark" href="tel:2147392737">(214) 739-2737</a><a class="btn on-dark" href="/contact">Contact The J</a></div></div>
</section>
<script>
(function(){{
  var cats=document.querySelectorAll('.wx-filter [data-cat]'),auds=document.querySelectorAll('.wx-filter [data-aud]'),secs=document.querySelectorAll('.wx-cat');
  var cat='all',aud='all';
  function apply(){{
    cats.forEach(function(b){{b.classList.toggle('on',b.getAttribute('data-cat')===cat)}});
    auds.forEach(function(b){{b.classList.toggle('on',b.getAttribute('data-aud')===aud)}});
    var any=false;
    secs.forEach(function(s){{
      var c=s.getAttribute('data-cat'),el=s.querySelector('[data-programs]');
      var spec='tag:winter;cat:'+c+(aud!=='all'?';aud:'+aud:'');
      if(el.getAttribute('data-programs')!==spec){{el.setAttribute('data-programs',spec);window.jdPrograms&&window.jdPrograms.mount(el);}}
      s.classList.toggle('hide',cat!=='all'&&c!==cat);
    }});
    // hide sections that rendered empty (after mount settles)
    setTimeout(function(){{
      var shown=0;
      secs.forEach(function(s){{var el=s.querySelector('[data-programs]');var empty=!el.querySelector('.pcard');var c=s.getAttribute('data-cat');var vis=!(cat!=='all'&&c!==cat)&&!empty;s.classList.toggle('hide',!vis);if(vis)shown++;}});
      document.getElementById('seasonEmpty').hidden=shown>0;
    }},350);
  }}
  cats.forEach(function(b){{b.addEventListener('click',function(){{cat=b.getAttribute('data-cat');apply();}});}});
  auds.forEach(function(b){{b.addEventListener('click',function(){{aud=b.getAttribute('data-aud');apply();}});}});
  document.addEventListener('click',function(e){{var r=e.target.closest('[data-reset]');if(r){{cat='all';aud='all';apply();}}
    var g=e.target.closest('[data-go-aud]');if(g&&g.getAttribute('data-go-aud')){{aud=g.getAttribute('data-go-aud');cat='all';apply();}}}});
  var nav=document.getElementById('jdnav'),fbar=document.querySelector('.wx-filter'),tick=false;
  function stickTop(){{tick=false;if(nav&&fbar)fbar.style.top=(window.innerWidth>720?Math.max(0,Math.round(nav.getBoundingClientRect().bottom)):0)+'px';}}
  function onScroll(){{if(!tick){{tick=true;requestAnimationFrame(stickTop);}}}}
  window.addEventListener('resize',stickTop);window.addEventListener('scroll',onScroll,{{passive:true}});stickTop();
  window.addEventListener('load',function(){{setTimeout(apply,400);stickTop();}});
}})();
</script>
"""
page = head + "</head>\n" + nav + main + tail
page = page.replace('data-programs="tag:winter', 'data-programs="tag:winter')  # no-op guard
os.makedirs("winter-preview", exist_ok=True)
open("winter-preview/index.html", "w", encoding="utf-8").write(page)
# noindex headers + robots
h = open("_headers", encoding="utf-8").read()
if "/winter-preview/*" not in h:
    open("_headers", "w", encoding="utf-8").write(h.rstrip("\n") + "\n\n/winter-preview/*\n  X-Robots-Tag: noindex, nofollow\n")
r = open("robots.txt", encoding="utf-8").read()
if "/winter-preview/" not in r:
    open("robots.txt", "w", encoding="utf-8").write(r.replace("Disallow: /staff-portal/", "Disallow: /staff-portal/\nDisallow: /winter-preview/", 1))
print("built", n_total, "entries,", len(cats), "categories")
