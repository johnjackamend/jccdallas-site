/* J Dallas fitness.js
   <div data-schedule></div>            weekly group fitness schedule from /data/group-fitness.json
   <div data-trainers data-limit="8"></div>   trainer directory from /data/trainers.json */
(function () {
  'use strict';
  var E = window.jdEsc || function (s) { return String(s); };
  var DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  var DAYL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var DAYS3 = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  /* ---- shared dialog ---- */
  var dlg;
  function dialog(html) {
    if (!dlg) {
      dlg = document.createElement('dialog'); dlg.className = 'jd-dialog';
      dlg.innerHTML = '<div class="in"></div><button class="x" aria-label="Close">&times;</button>';
      document.body.appendChild(dlg);
      dlg.querySelector('.x').addEventListener('click', function () { dlg.close(); });
      dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    }
    dlg.querySelector('.in').innerHTML = html;
    dlg.showModal();
  }
  function mins(t) { var m = t.match(/(\d+):(\d+)\s*(am|pm)/i); if (!m) return 0; var h = +m[1] % 12 + (m[3].toLowerCase() === 'pm' ? 12 : 0); return h * 60 + +m[2]; }

  /* ---- schedule ---- */
  document.querySelectorAll('[data-schedule]').forEach(function (el) {
    fetch('/data/group-fitness.json').then(function (r) { return r.json(); }).then(function (D) {
      var byName = {}; D.classes.forEach(function (c) { byName[c.name] = c; });
      var cats = []; D.classes.forEach(function (c) { if (c.category && cats.indexOf(c.category) < 0) cats.push(c.category); });
      var day = DAYS[new Date().getDay()], cat = el.getAttribute('data-filter-cat') || '', lvl = '', q = (el.getAttribute('data-filter-q') || '').toLowerCase();
      el.innerHTML = '<div class="sched">' +
        '<div class="tools"><input type="search" placeholder="Search a class or instructor" aria-label="Search classes" value="' + E(q) + '">' +
        '<label>Type <select data-cat><option value="">All</option>' + cats.map(function (c) { return '<option' + (c === cat ? ' selected' : '') + '>' + E(c) + '</option>'; }).join('') + '</select></label>' +
        '<label>Level <select data-lvl><option value="">Any</option><option value="1">1 · Gentle</option><option value="2">2 · Moderate</option><option value="3">3 · Intense</option></select></label>' +
        '<span class="count" aria-live="polite"></span></div>' +
        '<div class="days" role="tablist">' + DAYS.map(function (d, i) { return '<button role="tab" data-day="' + d + '"' + (d === day ? ' class="on" aria-selected="true"' : ' aria-selected="false"') + '>' + DAYS3[i] + (d === DAYS[new Date().getDay()] ? '<span class="t">Today</span>' : '') + '</button>'; }).join('') + '</div>' +
        '<div class="list" role="tabpanel"></div>' +
        '<div class="legend"><span><i></i>Filled dots show the class level: 1 gentle, 2 moderate, 3 high intensity.</span><span>' + E(D.season) + ' schedule. Classes are free for members; a J account is required to attend.</span></div></div>';
      var list = el.querySelector('.list'), count = el.querySelector('.count');
      function render() {
        var rows = D.schedule.filter(function (r) {
          if (r.day !== day) return false;
          var c = byName[r['class']] || {};
          if (cat && c.category !== cat) return false;
          if (lvl && r.levels.indexOf(lvl) < 0) return false;
          if (q && (r['class'] + ' ' + r.instructor + ' ' + r.location).toLowerCase().indexOf(q) < 0) return false;
          return true;
        }).sort(function (a, b) { return mins(a.time) - mins(b.time); });
        count.textContent = rows.length + ' class' + (rows.length === 1 ? '' : 'es') + ' on ' + DAYL[DAYS.indexOf(day)];
        list.innerHTML = rows.length ? rows.map(function (r, i) {
          return '<button type="button" class="row" data-i="' + D.schedule.indexOf(r) + '"><span class="time">' + E(r.time) + '</span><span><span class="name">' + E(r['class']) + '</span><span class="sub">' + E((r.instructor ? 'with ' + r.instructor + ' · ' : '') + r.location) + '</span></span><span class="lv" aria-label="Level ' + E(r.levels.join(', ')) + '">' + [1, 2, 3].map(function (n) { return '<i class="' + (r.levels.indexOf(String(n)) > -1 ? 'on' : '') + '"></i>'; }).join('') + '</span></button>';
        }).join('') : '<div class="empty">No classes match on ' + DAYL[DAYS.indexOf(day)] + '. Try another day or clear a filter.</div>';
      }
      el.addEventListener('click', function (e) {
        var b = e.target.closest('[data-day]');
        if (b) { day = b.getAttribute('data-day'); el.querySelectorAll('[data-day]').forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b); }); render(); return; }
        var row = e.target.closest('.row');
        if (row) {
          var r = D.schedule[+row.getAttribute('data-i')], c = byName[r['class']] || {};
          dialog('<h3>' + E(r['class']) + '</h3><div class="meta">' + E(DAYL[DAYS.indexOf(r.day)] + 's at ' + r.time + (r.instructor ? ' · ' + r.instructor : '') + ' · ' + r.location) + '</div>' +
            '<p>' + E(c.desc || 'Ask the front desk or your instructor for a description of this class.') + '</p>' +
            '<p style="margin-top:10px;font-size:14px"><strong>Level ' + E(r.levels.join(', ')) + '</strong> · ' + E(D.note) + '</p>' +
            '<div class="acts"><a class="btn" href="https://apps.apple.com/us/app/my-j/id1501052699">Reserve in the My J App</a><a class="btn ghost" href="/fitness/group-fitness#classes">All class descriptions</a></div>');
        }
      });
      el.querySelector('[data-cat]').addEventListener('change', function (e) { cat = e.target.value; render(); });
      el.querySelector('[data-lvl]').addEventListener('change', function (e) { lvl = e.target.value; render(); });
      el.querySelector('input').addEventListener('input', function (e) { q = e.target.value.trim().toLowerCase(); render(); });
      render();

      // optional class directory alongside the schedule
      var dir = document.querySelector('[data-class-directory]');
      if (dir) {
        dir.innerHTML = cats.map(function (cname) {
          return '<div class="cdir"><h3>' + E(cname) + '</h3><div class="pgrid">' + D.classes.filter(function (c) { return c.category === cname; }).map(function (c) {
            return '<div class="pcard"><div class="in"><h3>' + E(c.name) + '</h3><div class="meta"><span>Level ' + E(c.levels.join(', ')) + '</span></div><p>' + E(c.desc) + '</p></div></div>';
          }).join('') + '</div></div>';
        }).join('');
      }
    });
  });

  /* ---- trainers ---- */
  document.querySelectorAll('[data-trainers]').forEach(function (el) {
    fetch('/data/trainers.json').then(function (r) { return r.json(); }).then(function (T) {
      var limit = +el.getAttribute('data-limit') || 0, all = false;
      function initials(n) { return n.split(/\s+/).filter(function (w) { return /^[A-Z]/.test(w); }).slice(0, 2).map(function (w) { return w[0]; }).join(''); }
      function render() {
        var list = all || !limit ? T : T.slice(0, limit);
        el.innerHTML = '<div class="tgrid">' + list.map(function (t, i) {
          return '<button type="button" class="tcard" data-i="' + T.indexOf(t) + '"><div class="pic">' + (t.photo ? '<img src="' + E(t.photo) + '" alt="" loading="lazy">' : '<div style="height:100%;display:grid;place-items:center;font:600 42px var(--display);color:var(--purple)">' + E(initials(t.name)) + '</div>') + '</div><div class="in"><b>' + E(t.name) + '</b><small>' + E((t.availability || t.days || 'Personal trainer').replace(/<[^>]+>/g, '')) + '</small></div></button>';
        }).join('') + '</div>' + (!all && limit && T.length > limit ? '<p class="pmore"><button type="button" class="btn ghost" data-all>Meet all ' + T.length + ' trainers</button></p>' : '');
      }
      el.addEventListener('click', function (e) {
        if (e.target.closest('[data-all]')) { all = true; render(); return; }
        var c = e.target.closest('.tcard'); if (!c) return;
        var t = T[+c.getAttribute('data-i')];
        var bio = (t.bio || '').replace(/<\/?(p|br|div)[^>]*>/g, '\n').replace(/<[^>]+>/g, '').replace(/\n{2,}/g, '\n\n').trim();
        dialog('<h3>' + E(t.name) + '</h3><div class="meta">' + E([t.availability, t.days].filter(Boolean).join(' · ').replace(/<[^>]+>/g, '') || 'Certified personal trainer') + '</div>' +
          (t.photo ? '<img src="' + E(t.photo) + '" alt="" style="width:120px;height:120px;object-fit:cover;object-position:center;border-radius:16px;float:right;margin:0 0 12px 16px">' : '') +
          bio.split('\n\n').map(function (p) { return '<p style="margin-bottom:10px">' + E(p) + '</p>'; }).join('') +
          '<div class="acts" style="clear:both"><a class="btn" href="https://jccdallas.formstack.com/forms/fitness_and_wellness_services">Request a session with ' + E(t.name.split(' ')[0]) + '</a></div>');
      });
      render();
    });
  });
})();
