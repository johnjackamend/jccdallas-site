/* Membership: "Find Your Plan" calculator (prices from the approved Webflow module) + staff directory */
(function () {
  var E = window.jdEsc || String;
  var el = document.getElementById('planFinder');
  if (el) {
    var P = {
      individual: { '14-17': { name: 'Total J Teen', desc: 'Membership for teens, ages 14 to 17, billed monthly', price: 39, reg: 0, link: 'https://jewishcommunitycenterofdallas2.my.site.com/#/app/membership/family?branchCode=LOC-000001&typeCode=PKG-000017' },
        '18-29': { name: 'Total J Individual', desc: 'Full access membership for individuals age 18 and over, billed monthly', price: 78, reg: 75, link: 'https://jewishcommunitycenterofdallas2.my.site.com/#/app/membership/family?branchCode=LOC-000001&typeCode=PKG-000017' },
        '30-69': { name: 'Total J Individual', desc: 'Full access membership for individuals age 18 and over, billed monthly', price: 98, reg: 75, link: 'https://jewishcommunitycenterofdallas2.my.site.com/#/app/membership/family?branchCode=LOC-000001&typeCode=PKG-000017' },
        '70+': { name: 'Total J Individual', desc: 'Full access membership for individuals age 18 and over, billed monthly', price: 59, reg: 50, link: 'https://jewishcommunitycenterofdallas2.my.site.com/#/app/membership/family?branchCode=LOC-000001&typeCode=PKG-000221' } },
      couple: { '18-69': { name: 'Total J Couple', desc: 'Full access membership for 2 adults, age 18 and over, residing at the same address, billed monthly', price: 136, reg: 125, link: 'https://jewishcommunitycenterofdallas2.my.site.com/#/app/membership/family?branchCode=LOC-000001&typeCode=PKG-000019' },
        '70+': { name: 'Total J Couple 70+', desc: 'Full access membership for 2 adults, age 18 and over, residing at the same address, billed monthly', price: 82, reg: 100, link: 'https://jewishcommunitycenterofdallas2.my.site.com/#/app/membership/family?branchCode=LOC-000001&typeCode=PKG-000021' } },
      family: { '18+': { name: 'Total J Family', desc: 'Full access membership for 2 adults, age 18 and over, and dependent children through age 24, residing at the same address, billed monthly', price: 148, reg: 175, link: 'https://jewishcommunitycenterofdallas2.my.site.com/#/app/membership/family?branchCode=LOC-000001&typeCode=PKG-000023' } }
    };
    var type = 'individual', age = '30-69';
    function render() {
      var ages = Object.keys(P[type]); if (ages.indexOf(age) < 0) age = ages[0];
      var d = P[type][age];
      el.innerHTML = '<div class="pf"><div class="pf-q"><b>Who is joining?</b><div class="chips-f">' + [['individual', 'Just Me'], ['couple', 'Couple'], ['family', 'Family']].map(function (x) { return '<button type="button" data-type="' + x[0] + '"' + (x[0] === type ? ' class="on"' : '') + '>' + x[1] + '</button>'; }).join('') + '</div></div>' +
        (type !== 'family' ? '<div class="pf-q"><b>Age of primary member</b><div class="chips-f">' + ages.map(function (a) { return '<button type="button" data-age="' + a + '"' + (a === age ? ' class="on"' : '') + '>' + a + '</button>'; }).join('') + '</div></div>' : '') +
        '<div class="pf-card"><span class="tag">Your plan</span><h3>' + E(d.name) + '</h3><p>' + E(d.desc) + '</p><div class="pf-price">$' + d.price + '<small>/mo</small></div><div class="pf-reg">' + (d.reg ? '+ $' + d.reg + ' registration fee' : 'No registration fee') + '</div><a class="btn pink" href="' + d.link + '">Join Now</a></div></div>';
    }
    el.addEventListener('click', function (e) { var t = e.target.closest('[data-type]'); if (t) { type = t.getAttribute('data-type'); render(); } var a = e.target.closest('[data-age]'); if (a) { age = a.getAttribute('data-age'); render(); } });
    render();
  }
  var dir = document.getElementById('staffDir');
  if (dir) fetch('/data/staff.json').then(function (r) { return r.json(); }).then(function (S) {
    var depts = []; S.forEach(function (s) { if (depts.indexOf(s.dept) < 0) depts.push(s.dept); });
    var q = '', dept = '';
    function render() {
      var list = S.filter(function (s) { return (!dept || s.dept === dept) && (!q || (s.name + ' ' + s.title + ' ' + s.dept).toLowerCase().indexOf(q) > -1); });
      var byDept = {}; list.forEach(function (s) { (byDept[s.dept] = byDept[s.dept] || []).push(s); });
      dir.innerHTML = '<div class="sched"><div class="tools"><input type="search" placeholder="Search by name, title, or department" aria-label="Search staff" value="' + E(q) + '"><label>Department <select data-dept><option value="">All</option>' + depts.map(function (d) { return '<option' + (d === dept ? ' selected' : '') + '>' + E(d) + '</option>'; }).join('') + '</select></label><span class="count">' + list.length + ' people</span></div></div>' +
        Object.keys(byDept).map(function (d) { return '<h3 style="margin:28px 0 12px;font-family:var(--display);font-size:22px;font-weight:600">' + E(d) + '</h3><div class="pgrid">' + byDept[d].map(function (s) { return '<div class="pcard"><div class="in"><h3 style="font-size:17px">' + E(s.name) + '</h3><div class="meta"><span>' + E(s.title) + '</span></div><p style="display:block"><a href="mailto:' + E(s.email) + '">' + E(s.email) + '</a>' + (s.phone ? '<br><a href="tel:' + s.phone.replace(/[^\d]/g, '') + '">' + E(s.phone) + '</a>' : '') + '</p></div></div>'; }).join('') + '</div>'; }).join('') || '<div class="pempty">No one matches that search.</div>';
      var inp = dir.querySelector('input'); inp.addEventListener('input', function (e) { q = e.target.value.trim().toLowerCase(); var pos = inp.selectionStart; render(); var ni = dir.querySelector('input'); ni.focus(); ni.setSelectionRange(pos, pos); });
      dir.querySelector('[data-dept]').addEventListener('change', function (e) { dept = e.target.value; render(); });
    }
    render();
  });
})();
