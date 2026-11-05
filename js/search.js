/* J Dallas search.js: powers the "What Are You Looking for at The J?" band on every page.
   Depends on programs.js (loaded first) for data + card rendering. */
(function () {
  'use strict';
  var form = document.getElementById('searchForm'); if (!form || !window.jdPrograms) return;
  var q = document.getElementById('q'), fa = document.getElementById('fAud'), fw = document.getElementById('fWhen');
  var results = document.getElementById('results'), inner = document.getElementById('resultsInner');
  var P = window.jdPrograms, E = window.jdEsc || function (s) { return s; };

  var SYN = {
    kid: ['kids', 'ec'], kids: ['kids', 'ec'], child: ['kids', 'ec'], children: ['kids', 'ec'], toddler: ['ec'], preschool: ['ec'], baby: ['ec'],
    teen: ['teens'], teens: ['teens'], adult: ['adults'], adults: ['adults'], senior: ['seniors'], seniors: ['seniors'], parents: ['seniors'], grandparents: ['seniors'], family: ['family'], families: ['family']
  };
  var TOPIC = { gym: 'gymnastics', hoops: 'basketball', pool: 'swim', swimming: 'swim', lessons: 'swim', mahjong: 'mahj', 'mah': 'mahj', jongg: 'mahj', theatre: 'theater', drama: 'theater', acting: 'theater', art: 'visual-arts', painting: 'visual-arts', workout: 'fitness', class: 'fitness', classes: 'fitness', training: 'personal-training', trainer: 'personal-training', camp: 'school-days-off', 'day': 'school-days-off', movie: 'film', movies: 'film', book: 'bookfest', books: 'bookfest', author: 'bookfest', torah: 'jewish-learning', shabbat: 'jewish-learning' };

  var STOP = { the: 1, and: 1, for: 1, 'my': 1, our: 1, year: 1, years: 1, 'old': 1, olds: 1, with: 1, 'in': 1, 'at': 1, 'to': 1, 'of': 1, 'a': 1, 'an': 1, 'is': 1, are: 1, there: 1, something: 1, anything: 1, what: 1, whats: 1, happening: 1, this: 1, that: 1, weekend: 1, week: 1, today: 1, tonight: 1, programs: 1, program: 1, events: 1, event: 1, activities: 1, activity: 1, near: 1, 'me': 1, some: 1, any: 1, want: 1, looking: 1, find: 1, can: 1, i: 1, we: 1, do: 1, does: 1, have: 1, you: 1, 'on': 1, 'or': 1 };
  function ageAud(n) { n = +n; if (isNaN(n)) return null; if (n <= 5) return ['ec']; if (n <= 12) return ['kids']; if (n <= 17) return ['teens']; if (n >= 55) return ['seniors']; return ['adults']; }
  function tokens(s) { return s.toLowerCase().replace(/[^a-z0-9\- ]+/g, ' ').split(/\s+/).filter(function (t) { return t.length > 0 && !STOP[t]; }); }
  function whenRange(v) {
    var t = new Date(); t.setHours(0, 0, 0, 0); var a = new Date(t), b = new Date(t);
    if (v === 'today') return [a, b];
    if (v === 'weekend') { var dow = t.getDay(); var toSat = (6 - dow + 7) % 7; a.setDate(t.getDate() + toSat); b.setDate(a.getDate() + 1); if (dow === 0) { a = new Date(t); b = new Date(t); } return [a, b]; }
    if (v === 'week') { b.setDate(t.getDate() + 7); return [a, b]; }
    if (v === 'month') { b.setDate(t.getDate() + 31); return [a, b]; }
    return null;
  }
  function inRange(p, r) {
    if (!r) return true;
    var d = P.nextDate(p); if (!d) return !!p.ongoing;
    return d >= r[0] && d <= r[1];
  }
  function score(p, toks, D) {
    var hay = (p.t + ' ' + (p.desc || '') + ' ' + D.catLabel[p.cat] + ' ' + (p.sub || []).join(' ') + ' ' + (p.ages || '')).toLowerCase();
    var s = 0;
    if (!toks.some(function (t) { return !SYN[t]; })) return 1;
    toks.forEach(function (t) {
      if (SYN[t]) return; // audience words score via filter
      var tt = TOPIC[t] || t;
      if (p.t.toLowerCase().indexOf(tt) > -1) s += 6;
      else if ((p.sub || []).indexOf(tt) > -1) s += 5;
      else if (hay.indexOf(tt) > -1) s += 2;
      else if (tt.length > 4 && hay.indexOf(tt.slice(0, -1)) > -1) s += 1; // crude stemming
    });
    return s;
  }
  function run() {
    var text = q.value.trim(), toks = tokens(text), aud = fa && fa.value, when = fw && fw.value;
    // audience words inside the query act like the "For" filter
    var qa = []; toks.forEach(function (t) { if (SYN[t]) qa = qa.concat(SYN[t]); else if (/^\d{1,2}$/.test(t)) qa = qa.concat(ageAud(t) || []); });
    toks = toks.filter(function (t) { return !/^\d{1,2}$/.test(t); });
    if (!text && !aud && !when) { results.hidden = true; inner.innerHTML = ''; return; }
    P.load(function (D) {
      if (!D) return;
      var r = whenRange(when);
      var list = D.P.filter(function (p) { return !P.isPast(p); }).map(function (p) {
        var s = toks.length ? score(p, toks, D) : 1;
        if (aud && (p.aud || []).indexOf(aud) < 0) s = 0;
        if (qa.length && !(p.aud || []).some(function (a) { return qa.indexOf(a) > -1; })) s = 0;
        if (!inRange(p, r)) s = 0;
        var topical = toks.filter(function (t) { return !SYN[t]; }).length;
        if (topical && s < 2) s = 0;
        return { p: p, s: s };
      }).filter(function (x) { return x.s > 0; }).sort(function (a, b) { return b.s - a.s || ((P.nextDate(a.p) || 9e15) - (P.nextDate(b.p) || 9e15)); });
      var shown = list.slice(0, 9);
      results.hidden = false;
      inner.innerHTML = '<div class="res-head"><h3>' + (list.length ? list.length + ' result' + (list.length === 1 ? '' : 's') : 'No matches') + (text ? ' for “' + E(text) + '”' : '') + '</h3><p><a class="link" href="/events' + (text ? '?q=' + encodeURIComponent(text) : '') + '">Open in the full programs finder</a></p></div>' +
        (list.length ? '<div class="pgrid">' + shown.map(function (x) { return P.card(x.p, D); }).join('') + '</div>' : '<div class="pempty">Try a broader word, or <a href="/events">browse everything at The J</a>.</div>');
      results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }
  form.addEventListener('submit', function (e) { e.preventDefault(); run(); });
  [fa, fw].forEach(function (s) { if (s) s.addEventListener('change', run); });
  document.querySelectorAll('.chips .chip').forEach(function (c) { c.addEventListener('click', function () { q.value = c.getAttribute('data-q'); run(); }); });
  // Hours pills: keep the homepage's static labels for now (hours.json wiring is a follow-up)
})();
