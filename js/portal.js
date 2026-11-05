/* J Dallas Staff Portal runtime. No dependencies.
   1. Unlock: staff password -> PBKDF2 key -> AES-GCM decrypt /data/staff-portal.enc.json (config + content snapshot)
   2. Content: if config.sheetCsv is set, fetch the published Google Sheet CSV (Karli's edits); else use the snapshot
   3. Render the current tab (data-portal on <main>) */
(function () {
  'use strict';
  var KEY = 'jdp-key', main = document.querySelector('main[data-portal]'), tab = main.getAttribute('data-portal');
  var E = window.jdEsc || function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var lock = document.getElementById('plock'), content = document.getElementById('pcontent'), form = document.getElementById('plockForm');
  var b64 = { to: function (buf) { return btoa(String.fromCharCode.apply(null, new Uint8Array(buf))); }, from: function (s) { return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); } };

  function deriveKey(pw, salt, iter) {
    return crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey']).then(function (k) {
      return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: salt, iterations: iter, hash: 'SHA-256' }, k, { name: 'AES-GCM', length: 256 }, true, ['decrypt']);
    });
  }
  function decrypt(key, blob) {
    return crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64.from(blob.iv) }, key, b64.from(blob.ct)).then(function (pt) { return JSON.parse(new TextDecoder().decode(pt)); });
  }
  var SRC = main.getAttribute('data-src') || '/data/staff-portal.enc.json';
  function loadBlob() { return fetch(SRC, { cache: 'no-cache' }).then(function (r) { return r.json(); }); }

  function tryStored(blob) {
    var raw; try { raw = localStorage.getItem(KEY); } catch (e) {}
    if (!raw) return Promise.reject();
    return crypto.subtle.importKey('raw', b64.from(raw), 'AES-GCM', true, ['decrypt']).then(function (k) { return decrypt(k, blob); });
  }
  function tryPassword(blob, pw) {
    return deriveKey(pw, b64.from(blob.salt), blob.iter).then(function (k) {
      return decrypt(k, blob).then(function (cfg) {
        return crypto.subtle.exportKey('raw', k).then(function (r) { try { localStorage.setItem(KEY, b64.to(r)); } catch (e) {} return cfg; });
      });
    });
  }
  window.jdPortalLogout = function () { try { localStorage.removeItem(KEY); } catch (e) {} location.href = '/staff-portal/'; };

  /* ---------- data ---------- */
  function parseCsv(t) {
    var rows = [], row = [], cell = '', q = false;
    for (var i = 0; i < t.length; i++) {
      var c = t[i];
      if (q) { if (c === '"') { if (t[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; }
      else if (c === '"') q = true;
      else if (c === ',') { row.push(cell); cell = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && t[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
      else cell += c;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    var head = rows.shift().map(function (h) { return h.trim(); });
    return rows.filter(function (r) { return r.join('').trim(); }).map(function (r) { var o = {}; head.forEach(function (h, k) { o[h] = (r[k] || '').trim(); }); return o; });
  }
  function getItems(cfg) {
    if (!cfg.sheetCsv) return Promise.resolve(cfg.items);
    return fetch(cfg.sheetCsv, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw 0; return r.text(); }).then(parseCsv)
      .then(function (rows) { return rows.length ? rows : cfg.items; })
      .catch(function () { return cfg.items; });
  }
  function live(items) { return items.filter(function (i) { return (i.Status || 'Published').toLowerCase() !== 'archived' && i.Title; }); }
  function byTab(items, t) { return live(items).filter(function (i) { return i.Tab === t; }); }
  function sections(items) {
    var out = [], map = {};
    items.forEach(function (i) { var s = i.Section || 'Other'; if (!map[s]) { map[s] = []; out.push(s); } map[s].push(i); });
    return out.map(function (s) { return { name: s, items: map[s].sort(function (a, b) { return (+a.Order || 999) - (+b.Order || 999); }) }; });
  }
  var LOGO = { PDF: ['PDF', '#d40058'], Video: ['Video', '#400186'], Crexendo: ['Crexendo', '#0f7bbf'], Relay: ['Relay', '#1a3a5a'], SharePoint: ['SharePoint', '#0a7d6a'], Monday: ['monday', '#6c6cff'], Upace: ['Upace', '#2d6cdf'], ADP: ['ADP', '#d0271d'], FMX: ['FMX', '#1b9ad8'], Microsoft: ['Microsoft', '#5e5e5e'], Salesforce: ['Salesforce', '#00a1e0'], Avocado: ['Avocado', '#5a8f29'], Concur: ['Concur', '#1f4e9a'] };
  function chip(l) { var d = LOGO[l]; return d ? '<span class="pchip" style="--c:' + d[1] + '">' + E(d[0]) + '</span>' : ''; }
  function card(i) {
    return '<a class="pcard-l" href="' + E(i.Link || '#') + '"' + (/^https?:/.test(i.Link || '') ? ' target="_blank" rel="noopener"' : '') + '>' +
      '<div class="ptop">' + chip(i.Logo) + (i.Badge ? '<span class="pbadge">' + E(i.Badge) + '</span>' : '') + '</div>' +
      '<h3>' + E(i.Title) + '</h3><span class="pgo">Open</span></a>';
  }
  function grid(secs) {
    if (!secs.length) return '<p class="pempty-l">Resources coming soon!</p>';
    return secs.map(function (s) { return '<section class="psec"><h2>' + E(s.name) + '</h2><div class="pgrid-l">' + s.items.map(card).join('') + '</div></section>'; }).join('');
  }
  function fmtDate(iso) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || ''); if (!m) return iso || ''; return new Date(+m[1], +m[2] - 1, +m[3]).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }); }

  /* ---------- views ---------- */
  var V = {
    home: function (cfg, items) {
      var ql = sections(byTab(items, 'Home')).map(function (s) { return s.items; }).reduce(function (a, b) { return a.concat(b); }, []);
      var jj = byTab(items, 'J Journal').sort(function (a, b) { return (b.Date || '').localeCompare(a.Date || ''); });
      var all = items.filter(function (i) { return i.Tab === 'J Journal' && i.Title; }).sort(function (a, b) { return (b.Date || '').localeCompare(a.Date || ''); });
      var latest = jj[0];
      return '<section class="psec"><h2>Quick Links</h2><div class="pquick">' + ql.map(function (i) { return '<a href="' + E(i.Link) + '" target="_blank" rel="noopener">' + E(i.Title) + '</a>'; }).join('') + '</div></section>' +
        '<div class="phome">' +
        '<div class="pcol"><div class="pbox"><h3>Hello!</h3><p>Welcome to the J Dallas Staff Intranet Dashboard. Use the tabs above to access important assets, forms, and more.</p></div>' +
        (latest ? '<div class="pbox hot"><small>Latest J Journal</small><h3>' + E(latest.Title || fmtDate(latest.Date)) + '</h3><a class="btn pink sm" href="' + E(latest.Link) + '" target="_blank" rel="noopener">Read this week\'s issue</a></div>' : '') +
        '<div class="pbox"><h3>J Journal Backlog</h3><ul class="pjj">' + jj.slice(0, 8).map(function (i) { return '<li><a href="' + E(i.Link) + '" target="_blank" rel="noopener">' + E(i.Title || fmtDate(i.Date)) + '</a></li>'; }).join('') + '</ul>' +
        (all.length > 8 ? '<details class="pprev"><summary>View previous issues</summary><ul class="pjj">' + all.slice(8).map(function (i) { return '<li><a href="' + E(i.Link) + '" target="_blank" rel="noopener">' + E(i.Title || fmtDate(i.Date)) + '</a></li>'; }).join('') + '</ul></details>' : '') + '</div></div>' +
        '<div class="pcol"><div class="pbox"><h3>Submit to the J Journal</h3><p>Send announcements, wins, and photos for the weekly staff newsletter.</p>' + link(items, 'J Journal Submissions', 'J Journal Submissions form') + '</div>' +
        '<div class="pbox"><h3>Need something from Marketing?</h3><p>All marketing, website, and design requests go through The J Projects Request Form. Track your request on the Event Calendar &amp; Request Updates tab.</p>' + link(items, 'The J Projects Request Form', 'Projects Request Form') + '</div></div></div>';
    },
    guides: function (cfg, items) { return grid(sections(byTab(items, 'Software & Guides'))); },
    forms: function (cfg, items) { return grid(sections(byTab(items, 'Forms & SOP'))); },
    phone: function (cfg, items) {
      var crex = byTab(items, 'Software & Guides').filter(function (i) { return /crexendo/i.test(i.Section + ' ' + i.Logo); });
      return '<section class="psec"><h2>Staff Phone List</h2><p class="lede">Sign in with your J Dallas Microsoft account if prompted.</p><div class="pframe ppt">' + cfg.embeds.phone + '</div></section>' +
        '<section class="psec"><h2>Phone System: Crexendo Guides</h2><div class="pgrid-l">' + crex.map(card).join('') + '</div></section>';
    },
    calendar: function (cfg) {
      return '<section class="psec"><h2>Event &amp; Programming Calendar</h2><p class="lede">See every approved program and event on the organization-wide calendar. This calendar updates live: once programming approves a request, the program appears here automatically. If something is missing, check the request status further down the page to see where it sits.</p><h4 class="pk">All approved programs &amp; events</h4><div class="pframe">' + cfg.embeds.calendar + '</div></section>' +
        '<section class="psec"><h2>Marketing Request Status</h2><p class="lede">Track your submitted requests through programming and marketing approval. This table updates live. Find your request by name to see where it sits.</p><h4 class="pk">Your requests</h4><div class="pframe">' + cfg.embeds.requests + '</div><h4 class="pk">What Marketing is producing</h4><div class="pframe">' + cfg.embeds.producing + '</div></section>';
    }
  };
  function link(items, title, label) { var i = live(items).filter(function (x) { return x.Title === title; })[0]; return i ? '<a class="btn sm" href="' + E(i.Link) + '" target="_blank" rel="noopener">' + E(label) + '</a>' : ''; }

  function render(cfg) {
    lock.hidden = true; content.hidden = false;
    document.querySelectorAll('[data-logout]').forEach(function (b) { b.hidden = false; });
    content.innerHTML = '<p class="pempty-l">Loading…</p>';
    getItems(cfg).then(function (items) { content.innerHTML = V[tab](cfg, items); });
  }

  loadBlob().then(function (blob) {
    if (blob.plain) { render(blob.config); document.querySelectorAll('[data-logout]').forEach(function (b) { b.hidden = true; }); return; }
    tryStored(blob).then(render, function () { lock.hidden = false; var i = form.querySelector('input'); if (i) i.focus(); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var pw = form.querySelector('input').value, err = form.querySelector('.perr'); err.hidden = true;
      tryPassword(blob, pw).then(render, function () { err.hidden = false; form.querySelector('input').select(); });
    });
  });
})();
