/* J Dallas site.js: shared behaviors on every page. No dependencies. */
(function () {
  'use strict';

  /* ---------- Campus alert banner (data/alerts.json) ---------- */
  var alertEl = document.getElementById('jd-alert');
  if (alertEl) {
    fetch('/data/alerts.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (d) {
      var today = new Date().toISOString().slice(0, 10);
      var live = (d.alerts || []).filter(function (a) {
        return (!a.start || a.start <= today) && (!a.end || a.end >= today) && !sessionStorage.getItem('jd-alert-' + a.id);
      });
      if (!live.length) return;
      var a = live[0];
      alertEl.className = 'jd-alert' + (a.level === 'info' ? ' is-info' : '');
      alertEl.innerHTML = '<div class="wrap"><div><strong>' + esc(a.title) + '</strong> ' + esc(a.message) +
        (a.link ? ' <a href="' + esc(a.link) + '">' + esc(a.linkText || 'Learn more') + '</a>' : '') +
        '</div><button class="x" aria-label="Dismiss alert">&times;</button></div>';
      alertEl.hidden = false;
      alertEl.querySelector('.x').addEventListener('click', function () {
        alertEl.hidden = true; sessionStorage.setItem('jd-alert-' + a.id, '1');
      });
    }).catch(function () {});
  }

  /* ---------- Sticky in-page nav: highlight current section ---------- */
  var subnav = document.querySelector('.subnav');
  if (subnav && 'IntersectionObserver' in window) {
    var links = Array.prototype.slice.call(subnav.querySelectorAll('a[href^="#"]'));
    var map = {};
    links.forEach(function (l) { var t = document.querySelector(l.getAttribute('href')); if (t) map[t.id] = l; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          links.forEach(function (l) { l.classList.remove('is-on'); });
          var l = map[e.target.id]; if (l) { l.classList.add('is-on'); l.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' }); }
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    Object.keys(map).forEach(function (id) { io.observe(document.getElementById(id)); });
  }

  /* ---------- External links open in a new tab and say so ---------- */
  document.querySelectorAll('main a[href^="http"]').forEach(function (a) {
    if (a.host === location.host) return;
    a.target = '_blank'; a.rel = 'noopener';
    if (!a.getAttribute('aria-label')) a.setAttribute('aria-label', a.textContent.trim() + ' (opens in a new tab)');
  });

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  window.jdEsc = esc;
})();
