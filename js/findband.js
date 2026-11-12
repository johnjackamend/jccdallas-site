/* J Dallas findband.js: motion for the "What Are You Looking for at The J?" band.
   1) Typewriter sample prompts in the search field (stops the moment the visitor focuses or types)
   2) Soft glow on the field while a prompt is typing
   3) Staggered chip reveal
   4) Dim photo strip under the search card showing the breadth of programs
   Pure enhancement: without JS, or with prefers-reduced-motion, the static placeholder stays. */
(function () {
  'use strict';
  var band = document.getElementById('find'), search = document.getElementById('search'), q = document.getElementById('q');
  if (!band || !search || !q) return;
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  var PROMPTS = [
    'gymnastics for my 6-year-old',
    'something for my parents',
    'swim lessons for a toddler',
    'pickleball for beginners',
    "what's happening this weekend"
  ];
  var STATIC = 'Search programs, classes, and events';
  var STRIP = [
    '/assets/aquatics/swim-lessons.jpg',
    'https://jdallas-assets.netlify.app/large-JCC_day1-160.jpg',
    '/assets/racquet-sports/card-pickleball.jpg',
    'https://cdn.prod.website-files.com/66561dfced179b71b63b9c52/673f72d90254fefaba6bca9c_prod.jpg',
    'https://jdallas-assets.netlify.app/seniors1-1024x634.png',
    'https://jdallas-assets.netlify.app/basketball_pic4Lg.jpg',
    '/assets/aquatics/haymann.jpg',
    'https://cdn.prod.website-files.com/66561dfced179b71b63b9c52/670e71864399c104dca8374b_GF.png',
    'https://jdallas-assets.netlify.app/clubj.jpg',
    '/assets/racquet-sports/card-tennis.jpg',
    'https://cdn.prod.website-files.com/66561dfced179b71b63b9c52/6751d783ab959dd6f598cbcf_arts.jpg',
    'https://jdallas-assets.netlify.app/SOC.jpg',
    'https://jdallas-assets.netlify.app/JL_1.png',
    '/assets/aquatics/swim-teams.jpg',
    'https://cdn.prod.website-files.com/66561dfced179b71b63b9c52/676ac91e934b52d560bfa12c_JCC_day1-154%20(1).jpg',
    'https://jdallas-assets.netlify.app/massage2-1024x768.jpg'
  ];

  /* ---- photo strip (built once, sits between the search card and the results) ---- */
  var results = document.getElementById('results');
  var strip = document.createElement('div');
  strip.className = 'find-strip'; strip.setAttribute('aria-hidden', 'true');
  var track = '<div class="find-track">' + STRIP.map(function (u) { return '<span><img src="' + u + '" alt="" loading="lazy" decoding="async"></span>'; }).join('') + '</div>';
  strip.innerHTML = '<div class="find-rail">' + track + track + '</div>';
  if (results && results.parentNode === band) band.insertBefore(strip, results); else band.appendChild(strip);
  band.classList.add('has-strip');
  if (results) {
    var ro = new MutationObserver(function () { band.classList.toggle('results-open', !results.hidden); });
    ro.observe(results, { attributes: true, attributeFilter: ['hidden'] });
  }
  if (reduce) { band.classList.add('no-motion'); return; }

  /* ---- staggered chips ---- */
  var chips = search.querySelectorAll('.chips .chip');
  chips.forEach(function (c, i) { c.classList.add('chip-anim'); c.style.transitionDelay = (120 + i * 90) + 'ms'; });

  /* ---- typewriter ---- */
  var field = q.closest('.field') || q, stopped = false, running = false, visible = false, timer = null, pi = 0;
  var original = q.getAttribute('placeholder') || STATIC;
  function stop() {
    if (stopped) return; stopped = true; running = false; clearTimeout(timer);
    q.setAttribute('placeholder', STATIC); field.classList.remove('is-typing');
  }
  ['focus', 'pointerdown', 'input', 'keydown'].forEach(function (ev) { q.addEventListener(ev, stop, { passive: true }); });
  search.querySelectorAll('.chip, select').forEach(function (el) { el.addEventListener('pointerdown', stop, { passive: true }); });
  if (q.value) stop();

  function jitter(ms) { return ms * (0.7 + Math.random() * 0.6); }
  function type(text, i, done) {
    if (stopped || !visible) { running = false; return; }
    q.setAttribute('placeholder', text.slice(0, i) + (i < text.length ? '|' : ''));
    if (i < text.length) timer = setTimeout(function () { type(text, i + 1, done); }, jitter(48));
    else timer = setTimeout(function () { blink(text, 0, done); }, 400);
  }
  function blink(text, n, done) {
    if (stopped || !visible) { running = false; return; }
    q.setAttribute('placeholder', text + (n % 2 ? '|' : ' '));
    if (n < 3) timer = setTimeout(function () { blink(text, n + 1, done); }, 420);
    else timer = setTimeout(function () { erase(text, text.length, done); }, 200);
  }
  function erase(text, i, done) {
    if (stopped || !visible) { running = false; return; }
    q.setAttribute('placeholder', text.slice(0, i) + '|');
    if (i > 0) timer = setTimeout(function () { erase(text, i - 1, done); }, jitter(26));
    else timer = setTimeout(done, 350);
  }
  function next() {
    if (stopped || !visible) { running = false; return; }
    running = true; field.classList.add('is-typing');
    type(PROMPTS[pi % PROMPTS.length], 0, function () { pi++; next(); });
  }
  function start(delay) {
    if (stopped || running) return;
    clearTimeout(timer); timer = setTimeout(next, delay);
  }
  function pause() { clearTimeout(timer); running = false; field.classList.remove('is-typing'); }

  // wait for the homepage fade-up (.rv) to land before the first keystroke
  function initialDelay() {
    if (document.documentElement.classList.contains('rv-ready') && search.classList.contains('rv') && !search.classList.contains('in')) return 1100;
    return 500;
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        visible = e.isIntersecting;
        if (visible) { search.classList.add('is-seen'); start(initialDelay()); } else pause();
      });
    }, { threshold: 0.35 });
    io.observe(search);
  } else { visible = true; search.classList.add('is-seen'); start(500); }
  // if the page is hidden (tab switch) pause, resume when back
  document.addEventListener('visibilitychange', function () { if (document.hidden) pause(); else if (visible) start(300); });
  void original;
})();
