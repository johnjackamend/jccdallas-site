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
.wx-promo{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);background:var(--purple-dark);border-radius:var(--r-card);overflow:hidden;text-decoration:none;color:#fff;box-shadow:0 20px 50px rgba(0,0,0,.18)}
.wx-promo img{width:100%;height:100%;min-height:240px;object-fit:cover;display:block}
.wx-promo .in{padding:38px 40px;display:flex;flex-direction:column;justify-content:center;gap:10px}
.wx-promo .kicker{font:700 12.5px/1 var(--body);letter-spacing:.14em;text-transform:uppercase;color:#f7d08a}
.wx-promo h2{color:#fff;margin:0;font-size:34px}.wx-promo p{margin:0 0 8px;color:rgba(255,255,255,.85);font-size:16px}
.wx-promo .btn{align-self:flex-start}.wx-promo:hover .btn{filter:brightness(1.08)}
@media (max-width:820px){.wx-promo{grid-template-columns:1fr}.wx-promo img{min-height:180px;max-height:220px}.wx-promo .in{padding:26px 24px}.wx-promo h2{font-size:28px}}
.wx-paths{grid-template-columns:repeat(4,minmax(0,1fr))}
@media (max-width:1000px){.wx-paths{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:560px){.wx-paths{grid-template-columns:1fr}}
.wx-paths .area .pic{aspect-ratio:16/7;display:grid;place-items:center;font:700 44px var(--display);color:#fff}
.wx-paths .area:nth-child(1) .pic{background:linear-gradient(135deg,#d40058,#ff6fa5)}
.wx-paths .area:nth-child(2) .pic{background:linear-gradient(135deg,#400186,#7a4fd0)}
.wx-paths .area:nth-child(3) .pic{background:linear-gradient(135deg,#05c3dd,#0a7fa8)}
.wx-paths .area:nth-child(4) .pic{background:linear-gradient(135deg,#f8485e,#ad1aac)}
.wx-filter{position:sticky;top:0;z-index:4;background:rgba(255,255,255,.96);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border-bottom:1px solid var(--line);padding:14px 0 10px}
.wx-bar{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.wx-search{flex:1 1 320px;display:flex;align-items:center;gap:10px;border:1.5px solid var(--line);border-radius:var(--r-pill);background:#fff;padding:0 16px;height:44px;min-width:0}
.wx-search svg{width:20px;height:20px;color:var(--purple);flex:none}
.wx-search input{border:0;outline:0;background:0;font:500 15px var(--body);color:var(--ink);width:100%;min-width:0}
.wx-search:focus-within{border-color:var(--purple);box-shadow:0 0 0 4px var(--purple-tint)}
.wx-bar .fsel select{height:44px;padding:0 38px 0 16px}
.wx-count{display:flex;align-items:center;gap:12px;margin-top:8px;font-size:14px;color:var(--ink-soft)}
.wx-count .chip{padding:6px 12px;font-size:13px}
.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
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
@media (max-width:720px){.wx-filter{position:static}.wx-bar .fsel{flex:1 1 30%}.wx-paths .area .pic{aspect-ratio:16/6;font-size:34px}}
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
LABEL = {"social": "Big Energy Events", "emerg": "READY Academy (Emergency Training)", "gecc": "Early Childhood", "seniors": "Seniors & Active Adults"}

cat_opts = '<option value="all">All Categories</option>' + "".join(f'<option value="{c}">{LABEL.get(c, catLabel[c])}</option>' for c in cats)
aud_opts = '<option value="all">Anyone</option><option value="kids">Kids</option><option value="teens">Teens</option><option value="adults">Adults</option><option value="seniors">Active Adults</option>'
MON = [("2026-12","December 2026"),("2027-01","January 2027"),("2027-02","February 2027"),("2027-03","March 2027"),("2027-04","April 2027"),("2027-05","May 2027"),("2027-06","June 2027")]
mon_opts = '<option value="all">All Months</option>' + "".join(f'<option value="{v}">{l}</option>' for v, l in MON)
sections = "".join(f'<div class="wx-cat" id="cat-{c}" data-cat="{c}"><h3>{LABEL.get(c, catLabel[c])}</h3>' + (f'<p class="sub">{SUB[c]}</p>' if c in SUB else '') +
                   f'<div data-programs="tag:winter;cat:{c}" data-limit="{0 if c == "social" else 6}" data-more="expand" data-empty=""></div></div>' for c in cats)


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
    <div class="acts"><a class="btn pink" href="#season">Explore the Season</a><a class="btn on-dark" href="#calendar">Winter Calendar</a><a class="btn on-dark" href="/holidays-at-the-j">Holidays at The J</a></div>
  </div>
</section>
<div class="facts" aria-label="Winter at a glance">
  <div class="wrap"><div class="fact"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg><div><b>{n_total} programs and events</b><span>December through June, all in one calendar</span></div></div><div class="fact"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M15 4.5a3.5 3.5 0 0 1 0 7M17 13.5a6.5 6.5 0 0 1 4.5 6.5"/></svg><div><b>Every age</b><span>Preschool through active adults</span></div></div><div class="fact"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg><div><b>Holiday hours</b><span><a href="#holidays">Christmas, New Year's, and more</a></span></div></div><div class="fact"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg><div><b>Members and non-members</b><span>Most programs open to the whole community</span></div></div></div>
</div>
<section class="sec" id="holidays-promo" style="padding-bottom:0">
  <div class="wrap"><a class="wx-promo" href="/holidays-at-the-j"><img src="/assets/holidays/header.jpg" alt=""><div class="in"><span class="kicker">Now through January 1</span><h2>Holidays at The J</h2><p>Hanukkah lighting, the Holiday Market, Vodkas &amp; Latkes, the Pancake Breakfast, and holiday hours, all on one page.</p><span class="btn pink">See the Holiday Lineup</span></div></a></div>
</section>
<section class="sec" id="season">
<div class="wx-filter"><div class="wrap">
  <div class="wx-bar"><label class="wx-search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><span class="sr-only">Search winter programs</span><input id="wxQ" type="search" placeholder="Search the season, e.g. swim, Mahj, camp, pickleball" autocomplete="off"></label>
  <div class="fsel"><label class="sr-only" for="wxCat">Category</label><select id="wxCat">{cat_opts}</select></div>
  <div class="fsel"><label class="sr-only" for="wxAud">Who it is for</label><select id="wxAud">{aud_opts}</select></div>
  <div class="fsel"><label class="sr-only" for="wxMon">Month</label><select id="wxMon">{mon_opts}</select></div></div>
  <div class="wx-count"><span id="wxCount" role="status">Loading the season…</span><button type="button" class="chip" id="wxClear" data-reset hidden>Clear filters</button></div>
</div></div>
  <div class="wrap" id="seasonList">{sections}
  <p class="pempty" id="seasonEmpty" hidden>Nothing matches that combination yet. <button type="button" class="chip" data-reset>Reset filters</button></p>
  </div>
</section>
<section class="sec soft" id="calendar">
  <div class="wrap">
<div class="sec-head"><div><h2>Winter Calendar</h2><p class="lede">Pick a day to see what is on. Purple marks are programs, pink marks are events.</p></div></div>
<div data-programs="tag:winter" data-view="calendar" data-month="2026-12" data-title="Winter at The J calendar" data-empty="Nothing scheduled here right now."></div>
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
  var secs=document.querySelectorAll('.wx-cat'),selCat=document.getElementById('wxCat'),selAud=document.getElementById('wxAud'),selMon=document.getElementById('wxMon'),q=document.getElementById('wxQ'),count=document.getElementById('wxCount'),clear=document.getElementById('wxClear');
  var D=null,t=null;
  function norm(x){{return (x||'').toLowerCase();}}
  function inMonth(p,ym){{
    if(ym==='all')return true;
    var y=+ym.slice(0,4),m=+ym.slice(5,7)-1,n=new Date(y,m+1,0).getDate();
    for(var d=1;d<=n;d++){{if(window.jdPrograms.occursOn(p,new Date(y,m,d)))return true;}}
    return false;
  }}
  function textMatch(p,s){{if(!s)return true;return norm(p.t+' '+(p.desc||'')+' '+(p.dates||'')+' '+(p.days||'')+' '+(p.ages||'')).indexOf(s)>-1;}}
  function apply(){{
    var cat=selCat.value,aud=selAud.value,mon=selMon.value,s=norm(q.value).trim(),active=cat!=='all'||aud!=='all'||mon!=='all'||!!s;
    clear.hidden=!active;
    secs.forEach(function(sec){{
      var c=sec.getAttribute('data-cat'),el=sec.querySelector('[data-programs]');
      var spec='tag:winter;cat:'+c+(aud!=='all'?';aud:'+aud:'');
      var lim=(s||mon!=='all'||cat!=='all')?'0':'6';
      if(el.getAttribute('data-programs')!==spec||el.getAttribute('data-limit')!==lim){{el.setAttribute('data-programs',spec);el.setAttribute('data-limit',lim);window.jdPrograms.mount(el);}}
    }});
    clearTimeout(t);t=setTimeout(function(){{
      var shown=0,total=0;
      secs.forEach(function(sec){{
        var c=sec.getAttribute('data-cat'),vis=0;
        sec.querySelectorAll('.pcard').forEach(function(card){{
          var p=D&&D.P.filter(function(x){{return x.id===+card.getAttribute('data-id');}})[0];
          var ok=!!p&&textMatch(p,s)&&inMonth(p,mon);
          card.hidden=!ok; if(ok)vis++;
        }});
        var more=sec.querySelector('.pmore'); if(more)more.hidden=!!(s||mon!=='all');
        var on=(cat==='all'||c===cat)&&vis>0; sec.classList.toggle('hide',!on); if(on){{shown++;total+=vis;}}
      }});
      document.getElementById('seasonEmpty').hidden=shown>0;
      count.textContent=active?(total+' result'+(total===1?'':'s')+(shown>1?' in '+shown+' categories':'')):'Showing the whole season. Search or filter to narrow it down.';
    }},380);
  }}
  [selCat,selAud,selMon].forEach(function(el){{el.addEventListener('change',apply);}});
  q.addEventListener('input',function(){{clearTimeout(t);t=setTimeout(apply,200);}});
  document.addEventListener('click',function(e){{
    if(e.target.closest('[data-reset]')){{selCat.value='all';selAud.value='all';selMon.value='all';q.value='';apply();}}
    var g=e.target.closest('[data-go-aud]');if(g&&g.getAttribute('data-go-aud')){{selAud.value=g.getAttribute('data-go-aud');selCat.value='all';apply();}}
  }});
  var nav=document.getElementById('jdnav'),fbar=document.querySelector('.wx-filter'),tick=false;
  function stickTop(){{tick=false;if(nav&&fbar)fbar.style.top=(window.innerWidth>720?Math.max(0,Math.round(nav.getBoundingClientRect().bottom)):0)+'px';}}
  window.addEventListener('resize',stickTop);window.addEventListener('scroll',function(){{if(!tick){{tick=true;requestAnimationFrame(stickTop);}}}},{{passive:true}});stickTop();
  function boot(){{if(!window.jdPrograms)return setTimeout(boot,80);window.jdPrograms.load(function(d){{D=d;apply();}});}}
  boot();window.addEventListener('load',stickTop);
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
