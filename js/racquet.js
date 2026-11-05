/* J Dallas Racquet Sports micro-site modules
   Data: /data/racquet.json (edit that file, not this one)

   Drop-ins:
     <div data-rs-cal="drills"></div>          Open Tennis Drills month calendar
     <div data-rs-cal="community"></div>       Community Play Pickleball calendar (per-date Amilia links)
     <div data-rs-events data-sport="Pickleball" data-limit="3" data-rail></div>   rotating event cards
     <div data-rs-pros></div>                  Meet Our Pros grid + bio dialog (opens ?pro=slug or #slug)
     <div data-rs-staff></div>                 Pro shop / booking staff card
     <span data-rs-next="drills"></span>       "Next: Sunday, Oct 26" text
     <a data-rs-whatsapp>                      href is set from racquet.json so the link lives in one place
*/
(function () {
  'use strict';
  var DATA = null, pending = [];
  function load(cb) {
    if (DATA) return cb(DATA);
    pending.push(cb); if (pending.length > 1) return;
    fetch('/data/racquet.json').then(function (r) { return r.json(); }).then(function (d) {
      DATA = d; pending.forEach(function (f) { f(d); }); pending = [];
    }).catch(function () { pending.forEach(function (f) { f(null); }); pending = []; });
  }
  var E = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var TODAY = new Date(); TODAY.setHours(0, 0, 0, 0);
  function d2(s) { var a = s.split('-'); return new Date(+a[0], +a[1] - 1, +a[2]); }
  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  var MONL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var DOWL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var ICO = {
    prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="m15 5-7 7 7 7"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="m9 5 7 7-7 7"/></svg>'
  };

  /* ---------- schedule helpers ---------- */
  function itemsOn(cfg, day) {
    var s = iso(day);
    if (s < cfg.start || s > cfg.end) return [];
    if ((cfg.skip || []).indexOf(s) > -1) return [];
    return (cfg.weekly || []).filter(function (w) { return w.day === day.getDay() && (!w.startsOn || s >= w.startsOn) && (!w.endsOn || s <= w.endsOn); });
  }
  function nextDay(cfg) {
    for (var i = 0; i < 400; i++) { var d = new Date(TODAY); d.setDate(d.getDate() + i); if (itemsOn(cfg, d).length) return d; }
    return null;
  }

  /* ---------- calendar ---------- */
  function renderCal(el, cfg, kind) {
    var now = new Date(), y = now.getFullYear(), m = now.getMonth(), sel = null;
    var startD = d2(cfg.seasonStart || cfg.start), endD = d2(cfg.end);
    // open on the current month if inside the window, otherwise the first month of the window
    var openD = d2(cfg.start); if (now < openD || now > endD) { y = openD.getFullYear(); m = openD.getMonth(); }
    el.innerHTML = '<div class="rs-cal-head"><span class="season"><i></i>' + E(cfg.season || '') + ' · ' + E(MON[startD.getMonth()] + ' ' + startD.getDate()) + ' to ' + E(MON[endD.getMonth()] + ' ' + endD.getDate()) + '</span>' +
      '<span class="rs-next" data-rs-next-inline><i></i><span></span></span></div>' +
      '<div class="cal"><div class="head"><button type="button" data-prev aria-label="Previous month">' + ICO.prev + '</button><h3 data-label></h3><button type="button" data-next aria-label="Next month">' + ICO.next + '</button></div>' +
      '<div class="body"><div class="grid" role="grid" aria-label="' + E(cfg.title) + '"></div><aside class="panel" aria-live="polite"><h4 data-ptitle>Pick a day</h4><div data-plist><p class="none">Days with a purple mark have something scheduled. Tap one for times, coaches, and registration.</p></div></aside></div></div>' +
      (cfg.note ? '<p class="note">' + E(cfg.note) + '</p>' : '');
    var grid = el.querySelector('.grid'), label = el.querySelector('[data-label]'), pt = el.querySelector('[data-ptitle]'), pl = el.querySelector('[data-plist]');
    var nx = nextDay(cfg), nxEl = el.querySelector('[data-rs-next-inline]');
    if (nx) nxEl.lastElementChild.textContent = 'Next: ' + DOWL[nx.getDay()] + ', ' + MON[nx.getMonth()] + ' ' + nx.getDate(); else nxEl.remove();
    function chip(w) { var t = w.time.replace(':00', '').replace(/\s?(AM|PM)/i, function (x) { return x.trim().toLowerCase()[0]; }); if (kind === 'drills') { var lv = (w.title.match(/\d(\.\d)?/) || [''])[0]; return t + (lv ? ' L' + lv : ' ' + w.title.split(' ')[0]); } var ap = (w.time.match(/(AM|PM)\s*$/i) || ['', ''])[1].toLowerCase().slice(0, 1); return t.split(' to ')[0] + ap + ' ' + (w.where && /outdoor/i.test(w.where) ? 'Outdoor' : 'Community'); }
    function draw() {
      label.textContent = MONL[m] + ' ' + y;
      var first = new Date(y, m, 1).getDay(), n = new Date(y, m + 1, 0).getDate(), html = '';
      DOW.forEach(function (d) { html += '<div class="dow">' + d + '</div>'; });
      for (var i = 0; i < first; i++) html += '<div class="day pad"></div>';
      for (var d = 1; d <= n; d++) {
        var day = new Date(y, m, d), items = itemsOn(cfg, day), s = iso(day);
        var cls = 'day' + (items.length ? ' has' : '') + (s === iso(TODAY) ? ' today' : '') + (sel === s ? ' on' : '');
        html += '<div class="' + cls + '" role="gridcell" ' + (items.length ? 'tabindex="0" data-day="' + s + '" aria-label="' + E(MON[m] + ' ' + d + ', ' + items.length + ' scheduled') + '"' : '') + '><span class="n">' + d + '</span>' +
          items.slice(0, 2).map(function (w) { return '<span class="ev">' + E(chip(w)) + '</span>'; }).join('') +
          (items.length > 2 ? '<span class="more">+' + (items.length - 2) + ' more</span>' : '') +
          (items.length ? '<span class="dots">' + items.slice(0, 4).map(function () { return '<i></i>'; }).join('') + '</span>' : '') + '</div>';
      }
      grid.innerHTML = html;
    }
    function pick(s) {
      sel = s; var day = d2(s), items = itemsOn(cfg, day);
      pt.textContent = day.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      pl.innerHTML = items.length ? items.map(function (w) {
        if (kind === 'drills') {
          var lv = (w.title.match(/\d(\.\d)?/) || [''])[0];
          return '<div class="item">' + (lv ? '<span class="lv">Level ' + E(lv) + '</span>' : '') + '<b style="display:inline">' + E(w.time) + (w.until ? ' to ' + E(w.until) : '') + '</b><small>' + E(w.title) + '</small><span class="coach">Coach: ' + E(w.coach || 'TBA') + '</span><a class="btn sm" href="' + E(w.link || cfg.fallbackLink) + '">Register</a></div>';
        }
        var link = (cfg.sessionLinks || {})[s] || cfg.fallbackLink;
        return '<div class="item"><b>' + E(cfg.title) + '</b><small>' + E(w.time) + (w.where ? ' · ' + E(w.where) : '') + (cfg.ages ? ' · ' + E(cfg.ages) : '') + '</small><span class="coach">' + E(cfg.price || '') + '</span><a class="btn sm" href="' + E(link) + '">' + (link.indexOf('login') > -1 ? 'Log In to Register' : 'Register') + '</a></div>';
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
    if (nx && nx.getMonth() === m && nx.getFullYear() === y) pick(iso(nx));
  }

  /* ---------- rotating event cards ---------- */
  function evCard(ev) {
    var dated = !!ev.date, d = dated ? d2(ev.date) : null;
    var badge = dated ? '<span class="date"><b>' + d.getDate() + '</b><small>' + MON[d.getMonth()] + '</small></span>' : '<span class="date rec"><b>' + E(ev.recurring || 'Ongoing') + '</b></span>';
    return '<article class="rs-ev"><div class="pic">' + (ev.img ? '<img src="' + E(ev.img) + '" alt="" loading="lazy">' : '') + badge + '<span class="sport ' + E((ev.sport || '').toLowerCase()) + '">' + E(ev.sport || 'Racquet Sports') + '</span></div>' +
      '<div class="in"><h3>' + E(ev.title) + '</h3><div class="meta">' + (dated ? '<span>' + E(DOWL[d.getDay()] + ', ' + MONL[d.getMonth()] + ' ' + d.getDate()) + '</span>' : (ev.recurring ? '<span>' + E(ev.recurring) + '</span>' : '')) + (ev.time ? '<span>' + E(ev.time) + '</span>' : '') + (ev.where ? '<span>' + E(ev.where) + '</span>' : '') + '</div>' +
      (ev.desc ? '<p>' + E(ev.desc) + '</p>' : '') + (ev.link ? '<div class="acts"><a class="btn' + (dated ? ' pink' : '') + '" href="' + E(ev.link) + '">' + E(ev.cta || 'Learn More') + '</a></div>' : '') + '</div></article>';
  }
  function renderEvents(el, D) {
    var sport = el.getAttribute('data-sport'), limit = +el.getAttribute('data-limit') || 0;
    var list = (D.events || []).filter(function (ev) { return !ev.date || ev.date >= iso(TODAY); });
    if (sport) list = list.filter(function (ev) { return (ev.sport || '').toLowerCase() === sport.toLowerCase(); });
    list.sort(function (a, b) { if (a.date && b.date) return a.date < b.date ? -1 : 1; if (a.date) return -1; if (b.date) return 1; return 0; });
    if (limit) list = list.slice(0, limit);
    if (!list.length) { el.innerHTML = '<div class="rs-ev-empty">' + E(el.getAttribute('data-empty') || 'New events post here as they are announced. Join the WhatsApp community to hear first.') + '</div>'; return; }
    el.className = (el.className + ' rs-events' + (el.hasAttribute('data-rail') ? ' rail' : '')).trim();
    el.innerHTML = list.map(evCard).join('');
  }

  /* ---------- pros ---------- */
  function initials(n) { return n.split(/\s+/).map(function (p) { return p[0]; }).join('').slice(0, 2).toUpperCase(); }
  function proCard(p) {
    var pic = p.photo ? '<img src="' + E(p.photo) + '" alt="' + E(p.name) + '" loading="lazy">' : '<span class="ini" aria-hidden="true">' + E(initials(p.name)) + '<small>Photo coming soon</small></span>';
    return '<button type="button" class="rs-pro" data-pro="' + E(p.slug) + '" aria-haspopup="dialog"><div class="pic">' + pic + '</div><div class="in"><b>' + E(p.name) + '</b><small>' + E(p.title) + '</small>' +
      '<div class="chips">' + (p.sports || []).map(function (s) { return '<span class="' + (s === 'Pickleball' ? 'pb' : '') + '">' + E(s) + '</span>'; }).join('') + '</div><span class="view">View Bio</span></div></button>';
  }
  function bioHTML(p) {
    var pic = p.photo ? '<img src="' + E(p.photo) + '" alt="' + E(p.name) + '">' : '<span class="ini" aria-hidden="true">' + E(initials(p.name)) + '</span>';
    return '<div class="in"><button type="button" class="x" aria-label="Close">&times;</button><div class="photo">' + pic + '</div><div class="body">' +
      '<h3>' + E(p.name) + '</h3><p class="role">' + E(p.title) + '</p>' +
      '<h4>About</h4><p>' + E(p.about) + '</p>' +
      (p.style ? '<h4>Coaching Style</h4><p>' + E(p.style) + '</p>' : '') +
      (p.credentials && p.credentials.length ? '<h4>Credentials + Highlights</h4><ul>' + p.credentials.map(function (c) { return '<li>' + E(c) + '</li>'; }).join('') + '</ul>' : '') +
      '<div class="acts"><a class="btn pink" href="/racquet-sports/private-lessons/#request">Request a Lesson</a>' + (p.email ? '<a class="btn ghost" href="mailto:' + E(p.email) + '">Email ' + E(p.name.split(' ')[0]) + '</a>' : '') + '</div>' +
      '</div></div>';
  }
  function renderPros(el, D) {
    el.className = (el.className + ' rs-pros').trim();
    el.innerHTML = (D.pros || []).map(proCard).join('');
    var dlg = document.getElementById('rsBio');
    if (!dlg) { dlg = document.createElement('dialog'); dlg.id = 'rsBio'; dlg.className = 'rs-bio'; document.body.appendChild(dlg); }
    function open(slug, push) {
      var p = (D.pros || []).filter(function (x) { return x.slug === slug; })[0]; if (!p) return;
      dlg.innerHTML = bioHTML(p);
      if (typeof dlg.showModal === 'function') { if (!dlg.open) dlg.showModal(); } else dlg.setAttribute('open', '');
      dlg.querySelector('.body').scrollTop = 0;
      if (push && history.replaceState) history.replaceState(null, '', '#' + slug);
    }
    function close() { if (dlg.open) dlg.close(); else dlg.removeAttribute('open'); if (location.hash && history.replaceState) history.replaceState(null, '', location.pathname + location.search); }
    el.addEventListener('click', function (e) { var b = e.target.closest('[data-pro]'); if (b) open(b.getAttribute('data-pro'), true); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.closest('.x')) close(); });
    dlg.addEventListener('close', function () { if (location.hash && history.replaceState) history.replaceState(null, '', location.pathname + location.search); });
    var want = (location.hash || '').replace('#', '') || new URLSearchParams(location.search).get('pro');
    if (want) open(want, false);
    window.addEventListener('hashchange', function () { var h = (location.hash || '').replace('#', ''); if (h) open(h, false); });
  }
  function renderStaff(el, D) {
    el.innerHTML = (D.staff || []).map(function (s) {
      return '<div class="aside"><div class="person"><span class="av" aria-hidden="true" style="' + (s.photo ? 'background:url(' + E(s.photo) + ') center top/cover;color:transparent' : '') + '">' + E(initials(s.name)) + '</span><div><b>' + E(s.name) + '</b>' + E(s.title) + '<br>' + (s.email ? '<a href="mailto:' + E(s.email) + '">' + E(s.email) + '</a>' : '') + (s.phone ? '<br><a href="tel:' + E(s.phone.replace(/\D/g, '')) + '">' + E(s.phone) + '</a>' : '') + '</div></div>' + (s.about ? '<p style="font-size:14.5px;color:var(--ink-soft);margin-top:14px">' + E(s.about) + '</p>' : '') + '</div>';
    }).join('');
  }

  /* ---------- boot ---------- */
  var cals = document.querySelectorAll('[data-rs-cal]'), evs = document.querySelectorAll('[data-rs-events]'), pros = document.querySelectorAll('[data-rs-pros]'), staff = document.querySelectorAll('[data-rs-staff]'), nexts = document.querySelectorAll('[data-rs-next]'), was = document.querySelectorAll('[data-rs-whatsapp]');
  if (cals.length || evs.length || pros.length || staff.length || nexts.length || was.length) load(function (D) {
    if (!D) { cals.forEach(function (el) { el.innerHTML = '<div class="empty">The schedule is loading slowly. <a href="https://jewishcommunitycenterofdallas2.my.site.com/#/app/program/list/DIV-001/?cat1=Racquet%20Sports">Open registration</a></div>'; }); return; }
    was.forEach(function (a) { if (D.whatsapp) a.href = D.whatsapp; });
    cals.forEach(function (el) { var k = el.getAttribute('data-rs-cal'); var cfg = k === 'community' ? D.communityPlay : (k === 'pbdrills' ? D.pbDrills : D.drills); el.className = (el.className + ' rs-cal').trim(); renderCal(el, cfg, k === 'community' ? 'community' : 'drills'); });
    evs.forEach(function (el) { renderEvents(el, D); });
    pros.forEach(function (el) { renderPros(el, D); });
    staff.forEach(function (el) { renderStaff(el, D); });
    nexts.forEach(function (el) { var k2 = el.getAttribute('data-rs-next'); var cfg = k2 === 'community' ? D.communityPlay : (k2 === 'pbdrills' ? D.pbDrills : D.drills); var nx = nextDay(cfg); el.textContent = nx ? DOWL[nx.getDay()] + ', ' + MONL[nx.getMonth()] + ' ' + nx.getDate() : 'Dates coming soon'; });
  });
  window.jdRacquet = { load: load };
})();
