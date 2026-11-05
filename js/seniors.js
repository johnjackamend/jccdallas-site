/* Seniors modules: <div data-senior-lunch></div> and <div data-senior-calendar></div>
   Data: /data/seniors-lunch.json, /data/seniors-calendar.json (replace monthly; PDF link included). */
(function () {
  'use strict';
  var E = window.jdEsc || String;
  var DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var MONL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function d2(s) { var a = s.split('-'); return new Date(+a[0], +a[1] - 1, +a[2]); }
  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  var TODAY = iso(new Date());
  function weeks(monthStr) { // -> array of weeks, each [mon..fri] iso dates
    var y = +monthStr.slice(0, 4), m = +monthStr.slice(5, 7) - 1, first = new Date(y, m, 1), last = new Date(y, m + 1, 0);
    var start = new Date(first); start.setDate(first.getDate() - ((first.getDay() + 6) % 7));
    var out = [];
    for (var d = new Date(start); d <= last; d.setDate(d.getDate() + 7)) {
      var w = []; for (var i = 0; i < 5; i++) { var x = new Date(d); x.setDate(d.getDate() + i); w.push(x.getMonth() === m ? iso(x) : null); }
      out.push(w);
    }
    return out;
  }
  function header(title, pdf, note) {
    return '<div class="sm-head"><div><h3>' + E(title) + '</h3>' + (note ? '<p>' + E(note) + '</p>' : '') + '</div>' + (pdf ? '<a class="btn ghost sm" href="' + E(pdf) + '" download>Download PDF</a>' : '') + '</div>';
  }

  /* ---- lunch menu ---- */
  document.querySelectorAll('[data-senior-lunch]').forEach(function (el) {
    fetch('/data/seniors-lunch.json').then(function (r) { return r.json(); }).then(function (D) {
      var compact = el.hasAttribute('data-compact');
      var days = Object.keys(D.days).sort();
      var html = '<div class="smod">' + header(D.title, D.pdf, compact ? '' : D.note);
      if (compact) {
        // this week + next: today first
        var upcoming = days.filter(function (d) { return d >= TODAY; }).slice(0, 5);
        if (!upcoming.length) upcoming = days.slice(-5);
        html += '<div class="sm-week">' + upcoming.map(function (d) { var dt = d2(d); return '<div class="sm-day' + (d === TODAY ? ' today' : '') + '"><b>' + DOW[dt.getDay()] + ' ' + dt.getDate() + (d === TODAY ? ' · Today' : '') + '</b><ul>' + D.days[d].map(function (x) { return '<li>' + E(x) + '</li>'; }).join('') + '</ul></div>'; }).join('') + '</div>' +
          '<p class="sm-more"><a class="link" href="/seniors/kosher-lunch#menu">Full month menu</a></p>';
      } else {
        html += '<div class="sm-grid">' + weeks(D.month).map(function (w) {
          return '<div class="sm-row">' + w.map(function (d) {
            if (!d) return '<div class="sm-day pad"></div>';
            var dt = d2(d), items = D.days[d];
            return '<div class="sm-day' + (d === TODAY ? ' today' : '') + (items ? '' : ' closed') + '"><b>' + DOW[dt.getDay()] + ' ' + dt.getDate() + (d === TODAY ? ' · Today' : '') + '</b>' + (items ? '<ul>' + items.map(function (x) { return '<li>' + E(x) + '</li>'; }).join('') + '</ul>' : '<small>No lunch served</small>') + '</div>';
          }).join('') + '</div>';
        }).join('') + '</div>';
      }
      el.innerHTML = html + '</div>';
    }).catch(function () { el.innerHTML = '<div class="pempty">The lunch menu is temporarily unavailable.</div>'; });
  });

  /* ---- activities calendar ---- */
  document.querySelectorAll('[data-senior-calendar]').forEach(function (el) {
    fetch('/data/seniors-calendar.json').then(function (r) { return r.json(); }).then(function (D) {
      var compact = el.hasAttribute('data-compact'), cat = '';
      var byDay = {}; D.events.forEach(function (e) { (byDay[e.date] = byDay[e.date] || []).push(e); });
      function pill(e) { return '<button type="button" class="sm-ev ' + e.cat + '" data-t="' + E(e.title) + '" title="' + E(e.title) + '"><span class="t">' + E(e.time.replace(':00', '').replace(' ', '').toLowerCase()) + '</span> ' + E(e.title) + (e.fee ? ' <i title="Additional fee">$</i>' : '') + '</button>'; }
      function dayCell(d) {
        var dt = d2(d), list = (byDay[d] || []).filter(function (e) { return !cat || e.cat === cat; });
        return '<div class="sm-day' + (d === TODAY ? ' today' : '') + '"><b>' + DOW[dt.getDay()] + ' ' + dt.getDate() + (d === TODAY ? ' · Today' : '') + '</b>' + (list.length ? list.map(pill).join('') : '<small>Nothing in this category</small>') + '</div>';
      }
      function render() {
        var html = '<div class="smod">' + header(D.title, D.pdf, compact ? '' : D.note) +
          '<div class="sm-legend"><button type="button" data-cat="" class="' + (cat === '' ? 'on' : '') + '">All</button><button type="button" data-cat="education" class="education ' + (cat === 'education' ? 'on' : '') + '"><i></i>Education</button><button type="button" data-cat="social" class="social ' + (cat === 'social' ? 'on' : '') + '"><i></i>Social</button><button type="button" data-cat="wellness" class="wellness ' + (cat === 'wellness' ? 'on' : '') + '"><i></i>Wellness</button><span>$ = additional fee</span></div>';
        if (compact) {
          var days = Object.keys(byDay).sort().filter(function (d) { return d >= TODAY; }).slice(0, 5); if (!days.length) days = Object.keys(byDay).sort().slice(-5);
          html += '<div class="sm-week">' + days.map(dayCell).join('') + '</div><p class="sm-more"><a class="link" href="/seniors/activities#calendar">Full month calendar</a></p>';
        } else {
          html += '<div class="sm-grid">' + weeks(D.month).map(function (w) { return '<div class="sm-row">' + w.map(function (d) { return d ? dayCell(d) : '<div class="sm-day pad"></div>'; }).join('') + '</div>'; }).join('') + '</div>';
        }
        el.innerHTML = html + '</div>';
      }
      el.addEventListener('click', function (e) {
        var c = e.target.closest('[data-cat]'); if (c) { cat = c.getAttribute('data-cat'); render(); return; }
        var ev = e.target.closest('.sm-ev'); if (!ev) return;
        var t = ev.getAttribute('data-t'), desc = D.descriptions[t] || D.descriptions[t.split(' with ')[0]] || '';
        var dlg = document.getElementById('sm-dlg'); if (!dlg) { dlg = document.createElement('dialog'); dlg.id = 'sm-dlg'; dlg.className = 'jd-dialog'; dlg.innerHTML = '<div class="in"></div><button class="x" aria-label="Close">&times;</button>'; document.body.appendChild(dlg); dlg.querySelector('.x').onclick = function () { dlg.close(); }; dlg.onclick = function (ev2) { if (ev2.target === dlg) dlg.close(); }; }
        dlg.querySelector('.in').innerHTML = '<h3>' + E(t) + '</h3><p>' + E(desc || 'Ask Sharon, Val, or Kay for details on this program.') + '</p><div class="acts">' + D.contacts.map(function (c) { return '<a class="btn ghost sm" href="tel:' + c.phone.replace(/-/g, '') + '">' + E(c.name) + ' · ' + E(c.phone) + '</a>'; }).join('') + '</div>';
        dlg.showModal();
      });
      render();
    }).catch(function () { el.innerHTML = '<div class="pempty">The seniors calendar is temporarily unavailable.</div>'; });
  });
})();
