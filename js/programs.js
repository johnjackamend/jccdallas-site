/* J Dallas programs.js
   Drop a container anywhere:
     <div data-programs="cat:racq-a;sub:tennis" data-view="cards" data-limit="6"></div>
     <div data-programs="sub:tennis" data-view="calendar"></div>
   Filters (all optional, comma-separated values, sections are ANDed, values ORed):
     cat:  racq-a,racq-y      aud: adults,kids      sub: tennis,pickleball
     type: Program|Event      pillar: racq
   Data source: /data/programs.json (same file the Events page and site search use). */
(function () {
  'use strict';
  var DATA = null, pending = [];
  function load(cb) {
    if (DATA) return cb(DATA);
    pending.push(cb);
    if (pending.length > 1) return;
    fetch('/data/programs.json').then(function (r) { return r.json(); }).then(function (d) {
      DATA = d; DATA.catLabel = {}; d.CATS.forEach(function (c) { DATA.catLabel[c.id] = c.label; });
      DATA.cat2pillar = {}; d.PILLARS.forEach(function (p) { p.cats.forEach(function (c) { DATA.cat2pillar[c] = p.id; }); });
      pending.forEach(function (f) { f(DATA); }); pending = [];
    }).catch(function () { pending.forEach(function (f) { f(null); }); });
  }

  /* ---- filtering ---- */
  function parse(spec) {
    var f = {};
    (spec || '').split(';').forEach(function (part) {
      var kv = part.split(':'); if (kv.length < 2) return;
      f[kv[0].trim()] = kv.slice(1).join(':').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    });
    return f;
  }
  function matches(p, f, D) {
    if (f.cat && f.cat.indexOf(p.cat) < 0 && !(p.also || []).some(function (c) { return f.cat.indexOf(c) > -1; })) return false;
    if (f.sub && !(p.sub || []).some(function (s) { return f.sub.indexOf(s) > -1; })) return false;
    if (f.aud && !(p.aud || []).some(function (a) { return f.aud.indexOf(a) > -1; })) return false;
    if (f.type && f.type.indexOf(p.type) < 0) return false;
    if (f.pillar && f.pillar.indexOf(D.cat2pillar[p.cat]) < 0) return false;
    if (f.id && f.id.indexOf(String(p.id)) < 0) return false;
    return true;
  }

  /* ---- dates ---- */
  var TODAY = new Date(); TODAY.setHours(0, 0, 0, 0);
  function d2(s) { var a = s.split('-'); return new Date(+a[0], +a[1] - 1, +a[2]); }
  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function ruleOccurs(r, day) {
    var s = iso(day);
    if (!r) return false;
    if (r.k === 'once') return s === r.s;
    if (r.k === 'dates') return (r.list || []).indexOf(s) > -1;
    if (r.k === 'span') return s >= r.s && s <= r.e;
    if (r.k === 'weekly') return s >= r.s && s <= r.e && (r.d || []).indexOf(day.getDay()) > -1 && (r.skip || []).indexOf(s) < 0;
    return false;
  }
  function occursOn(p, day) {
    if ((p.sch || []).some(function (r) { return ruleOccurs(r, day); })) return true;
    return (p.sessions || []).some(function (s) { return s.sch && s.sch.k !== 'once' ? ruleOccurs(s.sch, day) : false; });
  }
  function nextDate(p) {
    // first day >= today the program occurs, scanning 400 days; null if none / ongoing-only
    var rules = (p.sch || []).concat((p.sessions || []).map(function (s) { return s.sch; }).filter(Boolean));
    if (!rules.length) return null;
    for (var i = 0; i < 400; i++) { var d = new Date(TODAY); d.setDate(d.getDate() + i); if (rules.some(function (r) { return ruleOccurs(r, d); })) return d; }
    return null;
  }
  function isPast(p) {
    var rules = (p.sch || []); if (!rules.length || p.ongoing) return false;
    return rules.every(function (r) {
      var end = r.e || r.s || (r.list && r.list[r.list.length - 1]);
      return end && end < iso(TODAY);
    });
  }
  function sortByNext(a, b) {
    var na = nextDate(a), nb = nextDate(b);
    if (na && nb) return na - nb; if (na) return -1; if (nb) return 1; return 0;
  }
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var MONL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function fmt(d) { return MON[d.getMonth()] + ' ' + d.getDate(); }

  /* ---- ICS ---- */
  function ics(p) {
    var d = nextDate(p) || TODAY, ds = iso(d).replace(/-/g, '');
    var body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//The J Dallas//EN', 'BEGIN:VEVENT',
      'UID:jcc-' + p.id + '@jccdallas.org', 'DTSTAMP:' + iso(TODAY).replace(/-/g, '') + 'T120000Z',
      'DTSTART;VALUE=DATE:' + ds, 'SUMMARY:' + p.t.replace(/[,;]/g, ' '),
      'DESCRIPTION:' + (p.desc || '').replace(/\n/g, ' ').replace(/[,;]/g, ' ').slice(0, 400) + (p.reg ? ' Register: ' + p.reg : ''),
      'LOCATION:Aaron Family JCC of Dallas\\, 7900 Northaven Rd\\, Dallas\\, TX 75230', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    var a = document.createElement('a');
    a.href = 'data:text/calendar;charset=utf8,' + encodeURIComponent(body);
    a.download = p.t.replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '.ics';
    document.body.appendChild(a); a.click(); a.remove();
  }

  /* ---- render: cards ---- */
  var E = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var I = {
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    ppl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M15 4.5a3.5 3.5 0 0 1 0 7M17 13.5a6.5 6.5 0 0 1 4.5 6.5"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>'
  };
  function regLabel(p) { return p.btn || p.regLabel || (p.type === 'Event' ? 'Get Tickets' : 'Register'); }
  function card(p, D) {
    var sessions = (p.sessions || []).filter(function (s) { return s.reg && !(s.sch && s.sch.k === 'once' && s.sch.s < iso(TODAY)); });
    // de-dupe sessions that repeat the same registration link
    var seen = {}; sessions = sessions.filter(function (s) { if (seen[s.reg + s.label]) return false; seen[s.reg + s.label] = 1; return true; });
    var reg = p.reg && !p.noBtn ? '<a class="btn' + (p.type === 'Event' ? ' pink' : '') + '" href="' + E(p.reg) + '">' + E(regLabel(p)) + '</a>' : (p.btn ? '<span class="btn ghost" aria-disabled="true">' + E(p.btn) + '</span>' : '');
    var sess = '';
    if (sessions.length === 1 && !(p.reg && !p.noBtn)) {
      reg = '<a class="btn" href="' + E(sessions[0].reg) + '">' + E(regLabel(p)) + '</a>';
      sess = '<p class="meta" style="margin-top:2px"><span>' + I.clock + E(sessions[0].label) + '</span></p>';
    } else if (sessions.length) {
      var days = []; sessions.forEach(function (s) { var d = (s.label || '').split(/\s[·\u00b7]\s|\s\d/)[0].trim(); if (d && days.indexOf(d) < 0) days.push(d); });
      var lab = sessions.length === 1 ? sessions[0].label : sessions.length + ' time options';
      var sub = sessions.length > 1 && days.length ? '<small>' + E(days.slice(0, 3).join(', ') + (days.length > 3 ? ' +' + (days.length - 3) : '')) + '</small>' : '';
      sess = '<details class="sess"><summary><span>' + E(lab) + '</span>' + sub + '</summary><ul class="sessions">' +
        sessions.map(function (s) { return '<li><span>' + E(s.label) + (s.sub ? ' <small>' + E(s.sub) + '</small>' : '') + '</span><a href="' + E(s.reg) + '">Register</a></li>'; }).join('') + '</ul></details>';
    }
    return '<article class="pcard" data-id="' + p.id + '">' +
      '<div class="pic">' + (p.img ? '<img src="' + E(p.img) + '" alt="" loading="lazy">' : '') + '<span class="tag' + (p.type === 'Event' ? ' evt' : '') + '">' + E(p.type) + '</span></div>' +
      '<div class="in"><h3>' + E(p.t) + '</h3>' +
      '<div class="meta">' + (p.dates ? '<span>' + I.cal + E(p.dates) + '</span>' : '') + (p.days ? '<span>' + I.clock + E(p.days) + '</span>' : '') + (p.ages ? '<span>' + I.ppl + E(p.ages) + '</span>' : '') + '</div>' +
      (p.desc ? '<p>' + E(p.desc) + '</p>' : '') + sess +
      (p.sponsors && p.sponsors.length ? '<div class="sponsors"><small>Community Partners</small><div>' + p.sponsors.map(function (u) { return '<img src="' + E(u) + '" alt="" loading="lazy">'; }).join('') + '</div></div>' : '') +
      '<div class="acts">' + reg + (nextDate(p) ? '<button type="button" class="ics" data-ics>' + I.plus + 'Add to calendar</button>' : '') + '</div>' +
      '</div></article>';
  }
  function renderCards(el, list, D) {
    var limit = +el.getAttribute('data-limit') || 0;
    var cols = el.getAttribute('data-cols') === '2' ? ' two' : '';
    if (!list.length) {
      el.innerHTML = '<div class="pempty">' + E(el.getAttribute('data-empty') || 'Nothing scheduled here right now.') + ' <a href="/events">Browse all programs and events</a></div>';
      return;
    }
    var shown = limit ? list.slice(0, limit) : list;
    el.innerHTML = '<div class="pgrid' + cols + '">' + shown.map(function (p) { return card(p, D); }).join('') + '</div>' +
      (limit && list.length > limit ? '<p class="pmore"><a class="btn ghost" href="' + E(el.getAttribute('data-more') || '/events') + '">See all ' + list.length + '</a></p>' : '');
    el.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ics]'); if (b) { var id = +b.closest('.pcard').getAttribute('data-id'); var p = D.P.filter(function (x) { return x.id === id; })[0]; if (p) ics(p); return; }
    });
  }

  /* ---- render: calendar ---- */
  function renderCal(el, list, D) {
    var now = new Date(), y = now.getFullYear(), m = now.getMonth(), sel = null;
    var title = el.getAttribute('data-title') || 'Calendar';
    el.innerHTML = '<div class="cal"><div class="head"><button type="button" data-prev aria-label="Previous month"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="m15 5-7 7 7 7"/></svg></button><h3 data-label></h3><button type="button" data-next aria-label="Next month"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="m9 5 7 7-7 7"/></svg></button></div>' +
      '<div class="body"><div class="grid" role="grid" aria-label="' + E(title) + '"></div><aside class="panel" aria-live="polite"><h4 data-ptitle>Pick a day</h4><div data-plist><p class="none">Days with a purple or pink mark have something scheduled. Tap one to see details.</p></div></aside></div></div>';
    var grid = el.querySelector('.grid'), label = el.querySelector('[data-label]'), pt = el.querySelector('[data-ptitle]'), pl = el.querySelector('[data-plist]');
    function draw() {
      label.textContent = MONL[m] + ' ' + y;
      var first = new Date(y, m, 1).getDay(), n = new Date(y, m + 1, 0).getDate(), html = '';
      ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(function (d) { html += '<div class="dow">' + d + '</div>'; });
      for (var i = 0; i < first; i++) html += '<div class="day pad"></div>';
      for (var d = 1; d <= n; d++) {
        var day = new Date(y, m, d), items = list.filter(function (p) { return occursOn(p, day); });
        var s = iso(day), cls = 'day' + (items.length ? ' has' : '') + (s === iso(TODAY) ? ' today' : '') + (sel === s ? ' on' : '');
        html += '<div class="' + cls + '" role="gridcell" ' + (items.length ? 'tabindex="0" data-day="' + s + '" aria-label="' + E(fmt(day) + ', ' + items.length + ' scheduled') + '"' : '') + '><span class="n">' + d + '</span>' +
          items.slice(0, 2).map(function (p) { return '<span class="ev' + (p.type === 'Event' ? ' e' : '') + '">' + E(p.t) + '</span>'; }).join('') +
          (items.length > 2 ? '<span class="more">+' + (items.length - 2) + ' more</span>' : '') +
          (items.length ? '<span class="dots">' + items.slice(0, 4).map(function (p) { return '<i class="' + (p.type === 'Event' ? 'e' : '') + '"></i>'; }).join('') + '</span>' : '') + '</div>';
      }
      grid.innerHTML = html;
    }
    function pick(s) {
      sel = s; var day = d2(s), items = list.filter(function (p) { return occursOn(p, day); });
      pt.textContent = day.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      pl.innerHTML = items.length ? items.map(function (p) {
        var ss = (p.sessions || []).filter(function (x) { return x.sch && ruleOccurs(x.sch, day) && x.reg; });
        return '<div class="item"><b>' + E(p.t) + '</b><small>' + E([p.days, p.ages].filter(Boolean).join(' · ')) + '</small>' +
          (ss.length ? ss.map(function (x) { return '<a href="' + E(x.reg) + '">' + E(x.label) + '</a>'; }).join('<br>') : (p.reg && !p.noBtn ? '<a href="' + E(p.reg) + '">' + E(regLabel(p)) + '</a>' : '')) + '</div>';
      }).join('') : '<p class="none">Nothing scheduled this day.</p>';
      draw();
    }
    el.addEventListener('click', function (e) {
      if (e.target.closest('[data-prev]')) { m--; if (m < 0) { m = 11; y--; } draw(); }
      else if (e.target.closest('[data-next]')) { m++; if (m > 11) { m = 0; y++; } draw(); }
      else { var c = e.target.closest('[data-day]'); if (c) pick(c.getAttribute('data-day')); }
    });
    el.addEventListener('keydown', function (e) { var c = e.target.closest('[data-day]'); if (c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pick(c.getAttribute('data-day')); } });
    draw();
  }

  /* ---- boot ---- */
  function mount(el, D) {
    var f = parse(el.getAttribute('data-programs'));
    var list = D.P.filter(function (p) { return matches(p, f, D); });
    if (el.getAttribute('data-view') !== 'calendar') list = list.filter(function (p) { return !isPast(p); }).sort(sortByNext);
    var counter = el.getAttribute('data-count'); if (counter) { var c = document.querySelector(counter); if (c) c.textContent = list.length; }
    var clone = el.cloneNode(false); el.parentNode.replaceChild(clone, el); el = clone; // drop old listeners
    if (el.getAttribute('data-view') === 'calendar') renderCal(el, list, D); else renderCards(el, list, D);
  }
  var els = document.querySelectorAll('[data-programs]');
  var counters = document.querySelectorAll('[data-count-for]');
  if (els.length || counters.length) load(function (D) {
    if (!D) { els.forEach(function (el) { el.innerHTML = '<div class="pempty">Programs are loading slowly. <a href="/events">Open the full programs page</a></div>'; }); return; }
    counters.forEach(function (c) {
      var sub = c.getAttribute('data-count-for');
      c.textContent = D.P.filter(function (p) { return (p.sub || []).indexOf(sub) > -1 && !isPast(p) && (p.aud || []).indexOf('adults') > -1; }).length;
    });
    els.forEach(function (el) { mount(el, D); });
  });
  window.jdPrograms = { load: load, matches: matches, parse: parse, card: card, nextDate: nextDate, isPast: isPast, mount: function (el) { load(function (D) { if (D) mount(el, D); }); } };
})();
