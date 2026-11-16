#!/usr/bin/env python3
"""Winter at The J 2026-27: tag existing programs, update their winter dates, add new entries. Idempotent-ish: run once."""
import json, os, subprocess
os.chdir("/home/claude/jccdallas-site")
D = json.load(open("data/programs.json", encoding="utf-8"))
by = {p["id"]: p for p in D["P"]}
assert not any("winter" in (p.get("tags") or []) for p in D["P"]), "already tagged"

if not any(c["id"] == "camp" for c in D["CATS"]):
    D["CATS"].append({"id": "camp", "label": "Camp"})
for pl in D["PILLARS"]:
    if pl["id"] == "kids" and "camp" not in pl["cats"]: pl["cats"].append("camp")

def tag(i, **kw):
    p = by[i]; p.setdefault("tags", []); p["tags"].append("winter"); p.update(kw); return p
def once(s): return [{"k": "once", "s": s}]
def span(s, e): return [{"k": "span", "s": s, "e": e}]
def weekly(s, e, d): return [{"k": "weekly", "s": s, "e": e, "d": d}]
def dates(*l): return [{"k": "dates", "list": list(l)}]

SITE = "https://www.jccdallas.org"
NEW = []
nid = max(by) + 1
def add(t, cat, type_, aud, ages, dates_, days, desc, reg, sch, sub=None, img="", loc="", also=None, noBtn=False, after=None):
    global nid
    p = dict(id=nid, t=t, cat=cat, type=type_, aud=aud, ages=ages, dates=dates_, days=days, img=img, desc=desc, reg=reg, sch=sch, sub=sub or [], tags=["winter"])
    if loc: p["loc"] = loc
    if also: p["also"] = also
    if noBtn: p["noBtn"] = True
    nid += 1; NEW.append((p, after)); return p

IMG = lambda i: by[i]["img"]

# ---------------- Big Energy ----------------
for i in (136, 137, 138, 150, 139, 140, 141, 142): tag(i)
tag(7, dates="October 2026 – March 2027", sch=span("2026-10-01", "2027-03-31"))
add("BookFest: Shai Davidai", "bookfest", "Event", ["adults"], "Adults", "Date to be announced", "", "Another must-see author is joining the BookFest lineup. Stay tuned for details!", SITE + "/bookfest", [], img=IMG(7), after=142)
add("BookFest: David Patterson", "bookfest", "Event", ["adults"], "Adults", "Date to be announced", "", "Another must-see author is joining the BookFest lineup. Stay tuned for details!", SITE + "/bookfest", [], img=IMG(7), after=142)
add("Vodkas & Latkes", "social", "Event", ["adults"], "21+", "Thursday, December 10, 2026", "7:00–10:00 PM", "Shake, stir, and celebrate the Festival of Lights! Vodkas & Latkes is The J's ultimate adults-only (21+) Hanukkah party, with a buzzing martini bar, crispy latkes and sufganiyot, last-minute holiday shopping, and an Ugly Sweater Contest with prizes on the line. $30 members, $36 non-members. Come early for the Holiday Market in the lobby (2:00–10:00 PM), with 15+ vendors and a special Israel Museum Trunk Show, open to the whole community.", "https://vodkaslatkes.eventive.org/schedule/6a34667817e74af783c241c7", once("2026-12-10"), loc="Zale Auditorium", after=10)
add("2027 Mahj Tournament", "social", "Event", ["adults"], "Adults", "Sunday, March 7, 2027", "Check-in 11:30 AM, play 1:00–5:30 PM", "Crack, bam, dot: it's tournament time! The 4th annual JCC Mah Jongg Tournament brings players together for an afternoon of serious strategy, friendly rivalry, and great prizes. Bring your National Mah Jongg League card and your luckiest tiles.", SITE + "/special-events/j-mahj", once("2027-03-07"), loc="Donsky Gyms", also=["mahj"], after=10)
tag(1)
add("Senior Expo 2027", "seniors", "Event", ["seniors", "adults"], "Active adults", "Tuesday, March 16, 2027", "", "Aging out loud! Dallas's premier senior wellness event celebrates living with energy, confidence, and joy at every age. Explore resources, connect with community partners, and discover what's next, because our seniors aren't slowing down, they're turning it up.", SITE + "/senior-expo", once("2027-03-16"), loc="Zale Auditorium", also=["social"], after=116)
add("Bagel Run 2027", "social", "Event", ["kids", "teens", "adults", "seniors"], "All ages", "Sunday, May 9, 2027", "", "Lace up and rise and shine! The Bagel Run is back: a morning of community, movement, and a well-earned bagel at the finish line. Runners, walkers, and cheering sections all welcome.", SITE + "/special-events/bagel-run", once("2027-05-09"), after=10)
add("Annual Meeting 2027", "social", "Event", ["adults"], "Adults", "Wednesday, June 2, 2027", "", "Celebrate a year of community at The J! Join us as we honor the people who make it all happen, look back on an incredible year, and share what's ahead.", SITE + "/annual-meeting", once("2027-06-02"), after=10)
add("Angela's Coffee House", "dining", "Program", ["adults", "seniors", "teens"], "Everyone", "Soft opening mid-December; Grand Opening in January", "", "Your new favorite spot is brewing! Angela's Coffee House is coming to The J with handcrafted coffee, seasonal sips, and a cozy place to catch up with friends before or after your workout. Grand Opening celebration coming this January.", "", [], noBtn=True, after=118)

# ---------------- Aquatics ----------------
for i in (11, 12, 13): tag(i)
tag(14, t="Masters Swim", dates="Year-round, starting December 1", desc="Masters Swim is back and better than ever! Train with purpose, push your pace, and find your people in the lane next to you in our revamped program for adult swimmers.")
tag(115, t="Winter Lenny Krayzelburg Swim Academy (LKSA)", dates="Winter season", desc="Teaching excellence one stroke at a time! The Lenny Krayzelburg Swim Academy's SwimRight Method builds water safety, real skills, and big confidence, with an award system that keeps kids excited for every lesson. Open to members and non-members.")
tag(16, days="Sundays 1:00–1:50 PM; Tuesdays and Thursdays 4:30–5:20 PM")
tag(17, days="Sundays 2:00–4:00 PM; weekdays from 5:00 PM")

# ---------------- Racquet ----------------
tag(25, dates="November 30 – February 28", sch=span("2026-11-30", "2027-02-28"), reg="https://jewishcommunitycenterofdallas2.my.site.com/#/app/program/list/DIV-001/?cat1=Racquet%20Sports&cat2=Tennis%20Drills",
    desc="Bring your A-game! Our pro-led Open Drills are fast-paced, high-energy sessions packed with live-ball drills, situational games, and competitive point play. You'll be grouped with players at your level, so every rally counts.")
tag(131, t="Saturday Beginner/Intermediate Pickleball Drill", dates="Saturdays, December 5 – February 28", days="8:30 AM", sch=weekly("2026-12-05", "2027-02-28", [6]),
    desc="Dink, drive, and have a blast! Start your Saturday on the court with a pro-led drill for new and developing players. You'll learn the rules, scoring, positioning, and core strokes, then put it all together in game play.")
add("Winter Team Cup Tennis Mixer", "racq-a", "Event", ["adults"], "Adults", "Sunday, January 24, 2027", "9:00 AM–12:00 PM", "Who will take home the Cup? Join a team, rally with J pros, and battle it out in a morning of friendly tennis competition. Then celebrate at the Cup presentation with snacks and drinks. $40 members, $50 non-members; limited to 48 players, so grab your spot!", "https://jewishcommunitycenterofdallas2.my.site.com/#/app/program/list//tennis?cat1=Racquet%20Sports", once("2027-01-24"), sub=["tennis"], img=IMG(26), loc="Tennis Courts", after=26)
add("TCD Pre-Season Tune-Up", "racq-a", "Event", ["adults"], "Adults", "Thursday, February 18, 2027", "9:30–11:30 AM", "Get match-ready before TCD season starts! This two-hour tune-up sharpens your doubles movement, positioning, and shot selection, with J pros rotating court to court so you get coaching from the whole team. Finish strong with competitive play. $40 members, $50 non-members.", SITE + "/racquet-sports/leagues-events", once("2027-02-18"), sub=["tennis"], img=IMG(22), loc="Tennis Courts", after=26)
add("Private Lessons & Private Groups", "racq-a", "Program", ["adults", "teens", "kids"], "All ages", "Year-round, by appointment", "", "Your game, your goals, your schedule. Book one-on-one time with a J pro, or round up your friends for a private group session built around exactly what you want to work on, in tennis or pickleball.", SITE + "/racquet-sports/private-lessons", [], sub=["tennis", "pickleball"], loc="Tennis Courts", after=26)
YT = "https://jewishcommunitycenterofdallas2.my.site.com/#/app/program/list/DIV-001/?cat1=Racquet%20Sports&cat2=Youth%20Tennis&cat3="
tag(18, dates="January 10 – May 6", sch=weekly("2027-01-10", "2027-05-06", [0]), reg=YT + "Red%20Ball")
tag(19, dates="January 10 – May 6", sch=weekly("2027-01-10", "2027-05-06", [0]), reg=YT + "Orange%20Ball")
tag(20, dates="January 10 – May 6", sch=weekly("2027-01-10", "2027-05-06", [0]), reg=YT + "Green%20Ball")
tag(21, dates="January 12 – May 4", sch=weekly("2027-01-12", "2027-05-06", [2]), reg=YT + "Tournament")

# ---------------- Adult Sports ----------------
tag(31, t="Sunday Mellow League (30+)", dates="Sundays, November 8 – March 21", sch=weekly("2026-11-08", "2027-03-21", [0]), reg=SITE + "/adult-sports/basketball",
    desc="Still got game? The Sunday Mellow League is real, competitive hoops for players 30+, without the chaos. Enjoy a 10-game season, playoffs for every team, certified officials, and online stats, plus a laid-back vibe that keeps players coming back.")
tag(105, dates="Mondays, November 30 – April 26", sch=weekly("2026-11-30", "2027-04-26", [1]), reg=SITE + "/adult-sports/basketball",
    desc="Rally the office and represent! The Monday Night Business League is The J's most competitive weeknight run. Bring your coworkers or your crew for a 10-game season and a playoff push where every team has a shot at the title.")
tag(29, t="Wednesday Legends League (50+)", dates="Wednesdays, February 10 – May 12", sch=weekly("2027-02-10", "2027-05-12", [3]), reg=SITE + "/adult-sports/basketball",
    desc="Legends never retire! Our 50+ Masters Plus league keeps the competition real at a pace that's just right. Lace up, hit the court, and show them how it's done.")
tag(30, t="Thursday Masters League (40+)", dates="Thursdays, March 4 – July 29", sch=weekly("2027-03-04", "2027-07-29", [4]), reg=SITE + "/adult-sports/basketball",
    desc="High-level hoops, serious fun, and clutch moments every week. The 40+ Thursday Masters League is one of The J's biggest and most competitive traditions, with a 10-game season, playoffs for all, certified officials, and online stats.")
add("Basketball Shooting Machine", "sport-a", "Program", ["adults", "teens"], "Teens and adults", "Year-round, rent with any court rental", "", "Stop chasing rebounds and start stacking reps! Our new Basketball Shooting Machine feeds you ball after ball, so you can perfect your form and shoot on repeat. Add it to any court rental.", SITE + "/adult-sports/basketball", [], img=IMG(97), loc="Donsky Gym", after=111)

# ---------------- Youth Sports ----------------
HF = SITE + "/youth-sports/preschool-sports"
add("High Five Sports Sampler", "sport-y", "Program", ["kids"], "Ages 3–6", "Mondays, January 11 – March 8", "", "Why pick one sport when you can play them all? Little athletes try basketball, soccer, baseball, football, and more, building coordination, teamwork, and a lifelong love of the game.", HF, weekly("2027-01-11", "2027-03-08", [1]), img=IMG(33), loc="Donsky Gym", after=37)
add("High Five Winter Ninja", "sport-y", "Program", ["kids"], "Kids", "Sundays, January 10 – February 7", "", "Run, jump, climb, and conquer the course! Our Kids Ninja Warrior classes are packed with obstacles that build strength, balance, agility, and confidence. Come ready to move and unleash your inner Ninja!", HF, weekly("2027-01-10", "2027-02-07", [0]), img=IMG(36), loc="Nature Scape (GECC)", after=37)
add("High Five J Ninja", "sport-y", "Program", ["kids"], "Kids", "Wednesdays, January 13 – March 10", "", "Run, jump, climb, and conquer the course! Our Kids Ninja Warrior classes are packed with obstacles that build strength, balance, agility, and confidence. Come ready to move and unleash your inner Ninja!", HF, weekly("2027-01-13", "2027-03-10", [3]), img=IMG(36), loc="Donsky Gym", after=37)
add("High Five Soccer Skills", "sport-y", "Program", ["kids"], "Ages 4–6", "Thursdays, January 14 – March 11", "", "Kick, dribble, and score! Young players learn passing, shooting, and ball control through fun drills and games that build skills, confidence, and new friendships. Perfect for first-timers.", HF, weekly("2027-01-14", "2027-03-11", [4]), img=IMG(35), loc="Donsky Gym", after=37)
add("High Five 4's Basketball Scrimmage", "sport-y", "Program", ["kids"], "Age 4", "Sundays, January 17 – February 21", "", "Game on, little ballers! Four-year-olds dribble, pass, and shoot their way through skill-building drills and real scrimmages in a fun, encouraging setting.", HF, weekly("2027-01-17", "2027-02-21", [0]), img=IMG(36), loc="Zale Auditorium", after=37)
add("JCC Maccabi Team Dallas Tryouts", "sport-y", "Event", ["teens"], "Ages 13–17", "January 3 – February 28", "Locations vary by sport", "Go for gold with Team Dallas! Try out for the JCC Maccabi Games and join 3,000 Jewish teen athletes (ages 13–17) from around the world for Olympic-style competition, travel, community service, and friendships that last a lifetime.", SITE + "/jcc-maccabi-games", span("2027-01-03", "2027-02-28"), after=37)

# ---------------- Gymnastics ----------------
GYM = SITE + "/youth-sports/gymnastics"
add("Winter/Spring Gymnastics Classes", "gym-y", "Program", ["kids"], "Kids", "January 11 – May 6", "Times vary by class", "Flip, tumble, and soar into the new year! Our gymnastics classes build strength, flexibility, and confidence through fundamentals and progressive skills, in a fun, encouraging gym where every gymnast can shine and make friends.", GYM, span("2027-01-11", "2027-05-06"), img=IMG(98), loc="Gymnastics Gym", after=144)
p = add("Gymnastics Late Nights", "gym-y", "Event", ["kids"], "Ages 5–13", "Saturdays: December 5, January 9 & February 13", "6:00–10:00 PM · $38 members, $48 non-members", "Parents' night out, kids' night IN the gym! Drop off the kids for four hours of gymnastics, open gym, themed games, snacks, and friends while you enjoy a well-deserved night to yourself. You go out. We've got the kids.", "", dates("2026-12-05", "2027-01-09", "2027-02-13"), img=IMG(39), loc="Gymnastics Gym", after=39)
p["sessions"] = [
    {"label": "Dec 5: Hanukkah-themed Late Night", "reg": "https://jewishcommunitycenterofdallas2.my.site.com/#/app/program/list/DIV-001/?instanceCode=INST-014251", "sch": {"k": "once", "s": "2026-12-05"}},
    {"label": "Jan 9: New Year's Eve-themed Late Night", "reg": "https://jewishcommunitycenterofdallas2.my.site.com/#/app/program/list/DIV-001/?instanceCode=INST-014252", "sch": {"k": "once", "s": "2027-01-09"}},
    {"label": "Feb 13: Valentine's Late Night", "reg": GYM, "sch": {"k": "once", "s": "2027-02-13"}}]
tag(151, dates="Monday, December 7 and Sunday, December 27", days="Ages 3–7: 10:00–11:30 AM both days · Ages 8–13: 1:00–2:30 PM (Dec 7), 11:45 AM–1:15 PM (Dec 27)", sch=dates("2026-12-07", "2026-12-27"))
add("Gymnastics Open Gym", "gym-y", "Program", ["kids"], "Toddlers through middle school", "November 29 – January 10", "Dec 27: 1:30–2:30 PM toddlers and preschoolers; 2:45–4:15 PM elementary and middle school", "Come play, move, and explore! Open Gym is a chance for kids to tumble, climb, swing, and jump on our equipment at their own pace. No experience or enrollment needed, just bring the energy! A grown-up stays with toddlers and preschoolers.", "https://jewishcommunitycenterofdallas2.my.site.com/#/app/program/list/DIV-001/?instanceCode=INST-014418", span("2026-11-29", "2027-01-10"), img=IMG(144), loc="Gymnastics Gym", after=151)

# ---------------- Jewish Learning ----------------
tag(155, t="Jewish Music: Forgotten and Rediscovered", dates="Wednesday, December 9, 2026", days="12:30–1:30 PM", reg="https://jewishmusic.eventive.org/schedule/6a861f73872fa6594fa49c1e",
    desc="Music lost, and music found. Experience a stirring 30-minute piano concert of works rooted in Jewish tradition, then discover the remarkable story of 20th-century Jewish music: its brilliant flourishing, its devastating losses, and its long-awaited revival.")
JL = SITE + "/jewish-life"; WED = "Wednesdays, 11:00 AM–12:30 PM"
add("Essen 'n Fressen: A Delicious Journey Through Jewish Foodways", "learning", "Program", ["adults", "seniors"], "Adults", "Wednesdays, January 6 – 27", WED, "Why does chicken soup heal the soul? Pull up a chair for a four-week feast of food history! From bagels, brisket, and babka to shakshuka, falafel, and bourekas, discover the stories, traditions, and flavors behind Ashkenazi, Sephardic, and Israeli cuisine.", JL, weekly("2027-01-06", "2027-01-27", [3]), img=IMG(45), loc="Board Room", after=46)
add("Shalom, Y'all! Jewish Life in the American South", "learning", "Program", ["adults", "seniors"], "Adults", "Wednesdays, February 3 – 24", WED, "Grits meet gefilte! Travel from Charleston and Savannah to New Orleans, Memphis, and Dallas to uncover more than 300 years of Southern Jewish history: the pioneers, merchants, congregations, and flavors that shaped the South.", JL, weekly("2027-02-03", "2027-02-24", [3]), img=IMG(107), loc="Board Room", after=46)
add("Lone Star Jews: A History of Jewish Life in Texas", "learning", "Program", ["adults", "seniors"], "Adults", "Wednesdays, March 10 – 31", WED, "Everything's bigger in Texas, including our history! Explore the remarkable story of Jewish Texans, from 1800s frontier merchants and the port of Galveston to today's thriving communities across the Lone Star State.", JL, weekly("2027-03-10", "2027-03-31", [3]), img=IMG(44), loc="Board Room", after=46)
add("Living Jewish Values: Exploring the Midot That Shape Our Lives", "learning", "Program", ["adults", "seniors"], "Adults", "Wednesdays from May 5", WED, "Kindness. Patience. Gratitude. Explore the midot, the timeless Jewish values that shape who we are and how we live, and discover how they can bring more meaning to every day.", "https://jewishcommunitycenterofdallas2.my.site.com/#/app/program/list/DIV-001/?instanceCode=INST-013618", weekly("2027-05-05", "2027-05-26", [3]), img=IMG(107), loc="Board Room", after=46)
add("Limmud", "learning", "Event", ["adults", "seniors", "teens"], "Everyone", "Sunday, April 11, 2027", "", "A day of Jewish learning, ideas, and conversation for everyone. Full lineup coming soon!", JL, once("2027-04-11"), after=46)
add("Challah Bake", "learning", "Event", ["adults", "kids", "teens"], "All ages", "Thursday, February 25, 2027", "", "Knead, braid, and bake! Roll up your sleeves for a hands-on challah bake and take home a fresh, golden loaf (and the know-how to make it again).", JL, once("2027-02-25"), after=46)

# ---------------- Holiday events ----------------
add("Purim Adult Event", "holiday", "Event", ["adults"], "Adults", "Tuesday, March 23, 2027", "", "Masks on, spirits high! Celebrate Purim the grown-up way with a festive night of costumes, revelry, and fun. More details coming soon.", JL, once("2027-03-23"), also=["social"], after=5)
add("Israel Independence Day Celebration", "holiday", "Event", ["kids", "teens", "adults", "seniors"], "All ages", "Sunday, May 16, 2027", "1:00–4:00 PM", "Raise the blue and white! Join the whole community for a joyful celebration of Israel's independence. Details coming soon.", SITE + "/israel-independence-day-at-the-j", once("2027-05-16"), also=["social"], after=5)
add("Hamantaschen Pre-Order (J Gourmet)", "holiday", "Program", ["adults"], "Everyone", "Pre-orders open February 22", "", "Purim's sweetest tradition, ready when you are! Pre-order J Gourmet's freshly baked hamantaschen for your Purim baskets and celebrations.", SITE + "/jgourmet", span("2027-02-22", "2027-03-23"), img=IMG(118), also=["dining"], after=5)

# ---------------- Fitness ----------------
FIT = SITE + "/fitness"
add("Group Fitness Class Schedule", "fitness", "Program", ["adults", "seniors"], "Members", "Winter–Spring schedule, through May 31", "", "New season, new energy! Find your favorite class, try something new, and sweat it out with our amazing instructors and community. The Winter–Spring Group Fitness schedule has something for every body.", SITE + "/fitness/group-fitness", [], img=IMG(109), loc="Group Fitness studios and pools", after=51)
tag(51, t="Group Reformer Classes", dates="Through May 31", desc="Dallas chic meets feel-good movement. Your new Pilates happy place offers private, semi-private, and group reformer classes that build strength, flexibility, balance, and alignment, with an amazing instructor team and that effortlessly elevated vibe. Come for the workout, stay for the people.")
tag(109, t="Flow Yoga, Weights & Reset", dates="Thursdays through May 27", days="4:15–5:00 PM", sch=weekly("2026-12-03", "2027-05-27", [4]),
    desc="The perfect balance of mindful movement and muscle! Flow through yoga sequences, build lean strength with weights, and finish with Renee's Signature Core Reset to recharge between school drop-off and evening activities. Members register in the My J app.")
add("Road to 1000 Pushups", "fitness", "Event", ["adults", "teens"], "Members", "December 1 – 31", "Fitness Floor", "1,000 pushups. One month. Are you in? Take on our December pushup challenge and push yourself further, because together feels good. See the fitness staff for details.", FIT, span("2026-12-01", "2026-12-31"), img=IMG(48), after=50)
add("Dance Awareness Celebration", "fitness", "Event", ["adults", "seniors", "teens"], "All levels", "Sunday, December 6, 2026", "1:00–4:00 PM · Free, register in the My J app", "Awareness never misses a beat! Our second annual Dance Awareness Celebration is an afternoon of music, movement, and joy for every level, led by our incredible dance fitness instructors. Feel the beat, find your rhythm, and bring your smile!", FIT, once("2026-12-06"), img=IMG(49), loc="Group Fitness Studio", after=50)
add("Candlelight Yoga & Stretch", "fitness", "Event", ["adults", "seniors"], "Adults", "Thursday, December 10, 2026", "7:30 PM · Free, register in the My J app", "Unwind in the glow. Celebrate National Stretching Day with an evening of deep breathing, mindful movement, and gentle stretching by candlelight with Renee.", FIT, once("2026-12-10"), img=IMG(47), loc="Mind Body Studio", after=50)
add("Love Yourself: Sound Bowl Self Care", "fitness", "Event", ["adults", "seniors"], "Adults", "Wednesday, February 3, 2027", "10:15 AM · Free, registration opens 7 days before in the My J app", "Pause the noise and tune into your own rhythm. Let crystal singing bowls wash over you as Marco guides you through gentle stretches and breathwork, a heart-opening reset for Heart Awareness Month.", FIT, once("2027-02-03"), img=IMG(47), loc="Mind Body Studio", after=50)
add("Heart Awareness Day", "fitness", "Event", ["adults", "seniors", "teens"], "Everyone", "Thursday, February 18, 2027", "All day", "All day. All red. All heart. Wear red to your workout and help us paint The J red for heart health!", FIT, once("2027-02-18"), img=IMG(48), after=50)

# ---------------- J Mahj ----------------
MJ = SITE + "/j-mahj"
tag(63, dates="December 1, December 17 & January 5", days="1:30–4:00 PM", sch=dates("2026-12-01", "2026-12-17", "2027-01-05"), reg=MJ + "/play",
    desc="Play with confidence! Sit down at the table with an experienced instructor by your side to answer questions, share pro tips, and help you sharpen your strategy, one rack at a time.")
by[63]["sessions"] = [
    {"label": "Tuesday, December 1", "reg": "https://jmahj.eventive.org/schedule/6abeb3fa1ca12aecddafc213", "sch": {"k": "once", "s": "2026-12-01"}},
    {"label": "December 17", "reg": "https://jmahj.eventive.org/schedule/6abeb4f3738aba4f4c9d1d5c", "sch": {"k": "once", "s": "2026-12-17"}},
    {"label": "Tuesday, January 5", "reg": "https://jewishcommunitycenterofdallas2.my.site.com/#/app/program/list/DIV-001/?instanceCode=INST-013966", "sch": {"k": "once", "s": "2027-01-05"}}]
tag(62, t="Beginner Mah Jongg Classes", dates="Tuesdays: January 5 – 26 · from February 2 · March 30 – April 20", days="Four sessions · $170", sch=dates("2027-01-05", "2027-01-12", "2027-01-19", "2027-01-26", "2027-02-02", "2027-02-09", "2027-02-16", "2027-02-23", "2027-03-30", "2027-04-06", "2027-04-13", "2027-04-20"), reg=MJ + "/lessons",
    desc="Always wanted to learn Mah Jongg? This is your moment! In just four fun sessions you'll go from \"what's a bam?\" to building hands, reading the card, and playing with confidence. Your new favorite game is waiting.")
by[62]["sessions"] = [
    {"label": "Session 1: Tuesdays, January 5 – 26", "reg": "https://jmahj.eventive.org/schedule/6ac3fa3ea7769de00f95c4b4", "sch": {"k": "weekly", "s": "2027-01-05", "e": "2027-01-26", "d": [2]}},
    {"label": "Session 2: Tuesdays from February 2", "reg": "https://jmahj.eventive.org/schedule/6ac40c91b0a0404af2fd0f2e", "sch": {"k": "weekly", "s": "2027-02-02", "e": "2027-02-23", "d": [2]}},
    {"label": "Session 3: Tuesdays, March 30 – April 20", "reg": "https://jmahj.eventive.org/schedule/6ac40cc4e36835cae5572fab", "sch": {"k": "weekly", "s": "2027-03-30", "e": "2027-04-20", "d": [2]}}]
add("Tournament Strategies Play", "mahj", "Event", ["adults"], "Adults", "Tuesday, February 2, 2027", "1:30–4:00 PM", "Tournament-ready in one afternoon! Practice tournament-style play with expert guidance and tips to bring your best game to the March 7 Mahj Tournament.", "https://jewishcommunitycenterofdallas2.my.site.com/#/app/program/list/DIV-001/?instanceCode=INST-013967", once("2027-02-02"), img=IMG(63), loc="J Mahj Room", after=63)
tag(152, desc="Bring your best hands and your competitive spirit! Our Competitive League means six sessions of tournament-scored play, a championship night, and a $100 Visa gift card for the winner. Plus two free scheduled-play sessions, 10% off theme nights, and 15% off the Mahj gift shop.", reg=MJ + "/leagues")
add("J Dallas Social Mahj League: Winter Session", "mahj", "Program", ["adults"], "Adults", "Winter dates to be announced", "Tuesday evenings 6:30–8:30 PM; Thursday afternoons 1:00–3:00 PM", "Good tiles, good friends, good times! The Social League brings together players who love the game for six relaxed sessions with light bites, great drinks, and new friendships. Spots go fast!", MJ + "/leagues", [], img=IMG(60), loc="J Mahj Room", after=152)
for i in (59, 95, 156, 157): tag(i)
TN = MJ + "/theme-nights"
add("Theme Night: Spring into Mahj", "mahj", "Event", ["adults"], "18+", "Thursday, March 18, 2027", "6–9 PM", "Shake off winter! Every flower hand called or completed wins a prize. Theme Nights in the J Mahj Room, open to members and non-members.", TN, once("2027-03-18"), sub=["mahj"], img=IMG(59), after=157)
add("Theme Night: Turn Over a New Tile", "mahj", "Event", ["adults"], "18+", "Wednesday, April 14, 2027", "6–9 PM", "The new card is here! Embrace the hope, the confusion, and the beautiful chaos together. Theme Nights in the J Mahj Room, open to members and non-members.", TN, once("2027-04-14"), sub=["mahj"], img=IMG(59), after=157)
add("Theme Night: Mahj Garden Party", "mahj", "Event", ["adults"], "18+", "Thursday, May 20, 2027", "6–9 PM", "Where flower hands bloom into prizes. Good luck, good tiles, and a suspicious amount of joker energy. Theme Nights in the J Mahj Room, open to members and non-members.", TN, once("2027-05-20"), sub=["mahj"], img=IMG(59), after=157)
add("2027 National Mah Jongg League Card", "mahj", "Program", ["adults"], "Adults", "Order online through February 14", "$14 regular print, $15 large print", "Get your 2027 card and support The J! Order your official National Mah Jongg League card through us and it will be mailed straight to your door in late March or early April. $6 from every card goes back to The J.", MJ, span("2026-12-01", "2027-02-14"), img=IMG(153), after=153)

# ---------------- Youth Arts ----------------
CW = SITE + "/arts/classes-workshops"; PA = SITE + "/arts/performing-arts"
add("JPAS Winter/Spring Classes", "arts-y", "Program", ["kids", "teens"], "Kids and teens", "January 18 – April 16", "Various locations", "Find your spotlight! This winter and spring, young artists can sing and dance in Broadway Revue, think on their feet in Improv Acting & Theater, create in Art with Heart and Visual Art, and cook up something delicious in Kitchen Explorers. There's a stage, a canvas, and a kitchen waiting for every kid.", CW, span("2027-01-18", "2027-04-16"), img=IMG(74), after=74)
tag(154, dates="Starts Wednesday, January 27", sch=weekly("2027-01-27", "2027-04-14", [3]), reg=CW, desc="Little chefs, big flavors! Kids explore new ingredients, whip up tasty creations, and build kitchen confidence in this hands-on cooking class.")
tag(69, dates="Thursday, December 3, 2026", sch=once("2026-12-03"), reg=PA, desc="Young voices, big talent! Join us as JPAS performers take the stage for an evening of song.")
add("JPAS Broadway Revue Performance", "arts-y", "Event", ["kids", "teens", "adults"], "All ages", "Thursday, December 17, 2026", "", "Curtain up! Our Broadway Revue stars show off a season of singing, dancing, and showstopping numbers. Come cheer them on!", PA, once("2026-12-17"), img=IMG(74), after=74)
tag(91, dates="Audition Workshop Jan 7 · Auditions Jan 10 & 17 · Performances Apr 1, 4, 15 & 18", reg=SITE + "/arts/aladdin", sch=dates("2027-01-07", "2027-01-10", "2027-01-17", "2027-04-01", "2027-04-04", "2027-04-15", "2027-04-18"),
    desc="A whole new world is coming to The J! Our JPAS youth spring musical brings the magic of Aladdin to life with two casts, dazzling songs, and plenty of genie-sized fun. Rehearsals begin Sunday, January 24; Magic Carpet Cast performs April 1 and 4, Arabian Nights Cast April 15 and 18. Don't miss your chance to audition, or grab your seats for a show the whole family will love.")

# ---------------- Club J ----------------
BT = SITE + "/club-j/breaktaculars"; SDO = SITE + "/club-j/school-days-off"
add("Winter Breaktacular", "clubj", "Program", ["kids"], "Grades K–6", "Starts Monday, December 21", "", "School's out, the fun's in! Winter Breaktacular lets kids pick their own adventure each morning (Sports, Creative Arts, Gymnastics, and more), then come together in the afternoon for lunch, swimming, games, and crafts. Sign up for one day or the whole break!", BT, span("2026-12-21", "2027-01-01"), img=IMG(104), after=104)
add("School Day Out: MLK Day", "clubj", "Program", ["kids"], "Grades K–6", "Monday, January 18, 2027", "9:00 AM–4:00 PM · $100 members, $125 non-members", "No school? No problem! Kids in grades K–6 spend the day swimming, crafting, playing sports, and making memories with friends at The J. Before and after care available.", SDO, once("2027-01-18"), img=IMG(103), loc="The Lodge", after=104)
add("School Day Out: Presidents Day", "clubj", "Program", ["kids"], "Grades K–6", "Monday, February 15, 2027", "9:00 AM–4:00 PM · $100 members, $125 non-members", "No school? No problem! Kids in grades K–6 spend the day swimming, crafting, playing sports, and making memories with friends at The J. Before and after care available.", SDO, once("2027-02-15"), img=IMG(103), loc="The Lodge", after=104)
add("Spring Breaktacular", "clubj", "Program", ["kids"], "Grades K–6", "Starts Monday, March 15", "", "Spring into break with The J! Breaktacular is back with specialty tracks, swimming, games, and nonstop fun for the whole spring break. Details coming soon.", BT, span("2027-03-15", "2027-03-19"), img=IMG(102), after=104)
add("Passover Break Program", "clubj", "Program", ["kids"], "Grades K–6", "Starts Wednesday, April 21", "", "Keep the fun going over Passover break! Kids enjoy active, creative days with friends at The J. Details coming soon.", BT, span("2027-04-21", "2027-04-23"), img=IMG(78), after=104)

# ---------------- GECC ----------------
G = "https://gecc.jccdallas.org"
add("GECC Enrichment", "gecc", "Program", ["kids"], "Ages 3–5", "January 11 – May 13", "Dance Studio, Living Room, Gymnastics Gym, and Donsky Gym", "Little learners, big adventures! GECC Enrichment gives our preschoolers (ages 3–5) the chance to dance, tumble, play ball, tell stories, and discover new passions, all right here at The J.", G, span("2027-01-11", "2027-05-13"), img=IMG(82), after=87)
add("Hanukkah in Pajamikas Light Party", "gecc", "Event", ["kids"], "GECC families", "Friday, December 11, 2026", "", "PJs on, lights up! Gather your family for a joyful Hanukkah celebration filled with music, movement, laughter, and plenty of sparkle. Come ready to shine, celebrate, and share the light!", G, once("2026-12-11"), after=114)
add("GECC Preschool Enrollment Opens", "gecc", "Event", ["kids"], "Ages 0–5", "Tuesday, January 5, 2027", "", "Where little ones learn, play, and grow! Enrollment opens for the GECC preschool. Save your child's spot in our warm, joyful early childhood community.", G, once("2027-01-05"), after=114)
add("Tu B'Shevat Family Art Celebration", "gecc", "Event", ["kids"], "GECC families", "Thursday, January 21, 2027", "", "Happy birthday, trees! Celebrate Tu B'Shevat with a hands-on family art experience that turns recycled treasures into beautiful creations. Make, wonder, create, and celebrate our world, one upcycled masterpiece at a time.", G, once("2027-01-21"), loc="GECC Big Room or Outdoor Art Atelier", after=114)
tag(114, dates="Friday, February 5, 2027", sch=once("2027-02-05"), reg=G, desc="Sprinkles, smiles, and special someones! Our preschoolers share a sweet morning of donuts with their favorite grown-ups.")
add("GECC Family Garden Event", "gecc", "Event", ["kids"], "GECC families", "Thursday, April 15, 2027", "", "Dig in and watch it grow! GECC families get their hands dirty and celebrate spring together in our garden.", G, once("2027-04-15"), after=114)
add("New Sibling Shabbat", "gecc", "Event", ["kids"], "GECC families", "Friday, May 7, 2027", "", "A special Shabbat celebrating the newest members of our GECC families, and the proud big brothers and sisters who love them!", G, once("2027-05-07"), after=114)

# ---------------- Camp ----------------
CAMP = "https://www.jdallascamps.org/"
add("Camp Chai Reunion", "camp", "Event", ["kids", "teens"], "Campers and counselors", "Saturday, December 19, 2026", "", "Missing summer already? Come back to the woods for the Camp Chai Reunion! Reconnect with your camp friends and counselors, relive the best summer memories, and get a little camp magic in the middle of winter.", CAMP, once("2026-12-19"), loc="The Lodge", after=106)
add("Summer 2027 Camp Registration", "camp", "Event", ["kids", "teens"], "Families", "Priority Jan 11 · Members Jan 19 · Non-members Jan 25", "", "Summer 2027 registration opens in waves: priority registration Monday, January 11; members Tuesday, January 19; non-members Monday, January 25.", CAMP, dates("2027-01-11", "2027-01-19", "2027-01-25"), after=106)
add("All Camps Open House", "camp", "Event", ["kids", "teens", "adults"], "Families", "Sunday, January 24, 2027", "1:00–3:00 PM", "Summer is closer than you think! Meet our camp directors, explore every Summer 2027 camp option, and find the perfect fit for your camper. Bring the whole family for camp-themed activities, giveaways, and a sneak peek at the fun, friendships, and memories waiting this summer.", CAMP, once("2027-01-24"), loc="JCC Lobby", after=106)
add("Camp Orientation", "camp", "Event", ["kids", "teens", "adults"], "Families", "Begins Tuesday, June 1, 2027", "", "Let the summer countdown begin! Camp Orientation gets families ready for an amazing summer at The J.", CAMP, once("2027-06-01"), after=106)
add("Camp Chai 50th Reunion", "camp", "Event", ["adults", "teens"], "Camp Chai alumni and families", "Friday – Sunday, June 25 – 27, 2027", "Invitations and registration open around February 12", "50 years of Camp Chai! Calling every camper, counselor, and Camp Chai family to celebrate half a century of friendships, traditions, and summers to remember.", "https://www.jdallascamps.org/campchai50", span("2027-06-25", "2027-06-27"), after=106)

# ---------------- Emergency training ----------------
ET = SITE + "/training-services"
tag(88, dates="December 1 – February 28, multiple sessions", desc="Be the one who knows what to do! Get certified with American Red Cross First Aid/CPR/AED courses taught right here at The J.")
tag(89, dates="December 1 – February 28, multiple sessions", desc="Babysitter training for teens ready to take on the job with confidence, taught right here at The J by American Red Cross instructors.")
add("American Red Cross First Aid/CPR/AED Instructor Course", "emerg", "Program", ["adults"], "Adults", "December 1 – February 28", "", "Take your skills to the next level and become a certified American Red Cross First Aid/CPR/AED instructor, taught in the classroom at The J.", ET + "/cpr-first-aid", [], img=IMG(88), loc="Classroom at The J", after=89)
tag(158, days="10:00 AM–4:00 PM", reg="https://www.redcrossblood.org/give.html/drive-results?zipSponsor=AaronFamilyJCC", desc="Give the gift of life this holiday season! Donate blood, platelets, or plasma at The J's American Red Cross Blood Drive. Open to members and non-members; register through the Red Cross website.")
by[158]["loc"] = "Fruhman A"

# ---------------- Membership ----------------
MEM = SITE + "/membership"
add("January Membership Special", "member", "Event", ["adults"], "New members", "January 1 – 31", "Join online", "New year, new you, new J! Join in January with NO registration fee and get February FREE. From the Fitness Floor, group fitness, and Reformer Pilates to indoor and outdoor pools, courts, and programs for every age, The J is where you start strong, stay active, and stay connected.", MEM, span("2027-01-01", "2027-01-31"), img=IMG(112), after=113)
add("Red & Dark: A Heart Health Event", "member", "Event", ["adults"], "21+", "Thursday, February 18, 2027", "7:00–9:00 PM", "Indulge in something red, dark, and delicious! Celebrate Heart Health Month with red wine and dark chocolate pairings, mingling, and good company. Come for the wine. Stay for the chocolate. Leave with a happy heart.", MEM, once("2027-02-18"), loc="Lobby or Fruhman A", also=["social"], after=113)

# insert new entries after their anchor
for p, after in NEW:
    idx = next(i for i, q in enumerate(D["P"]) if q["id"] == after) + 1
    while idx < len(D["P"]) and "winter" in (D["P"][idx].get("tags") or []) and D["P"][idx]["id"] >= 159: idx += 1
    D["P"].insert(idx, p)

json.dump(D, open("data/programs.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
subprocess.run(["python3", "tools/sync_programs.py"], check=True)
w = [p for p in D["P"] if "winter" in (p.get("tags") or [])]
print(len(w), "winter entries;", len(NEW), "new; no image:", sum(1 for p in w if not p.get("img")))
