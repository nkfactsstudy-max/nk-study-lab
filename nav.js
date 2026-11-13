/* NK Study Lab - shared top bar look (logo + name + tagline on dark navy) for every inner page. */
(function () {
  'use strict';
  if (document.body.hasAttribute('data-nk-home')) return;   // homepage has its own bar
  var bar = null, kids = document.body.children;
  for (var i = 0; i < kids.length; i++) {
    var el = kids[i];
    if (el.tagName === 'HEADER' || el.classList.contains('topbar') || el.classList.contains('navbar')) { bar = el; break; }
  }
  if (!bar) return;
  var title = bar.querySelector('.site-title, .topbar-title, .logo-title, .brand');
  if (!title) return;
  bar.classList.add('nk-bar');
  title.classList.add('nk-title');
  var linkHome = title.tagName === 'A' ? '' : '';
  title.innerHTML = '<img class="nk-logo" src="logo.png" alt="" width="36" height="36">' +
    '<span class="nk-ttext"><span class="nk-tname"><b>NK</b> Study Lab</span><span class="nk-ttag">Har Vishay Ek Jagah</span></span>';
  if (title.tagName !== 'A') {
    title.style.cursor = 'pointer';
    title.setAttribute('role', 'link');
    title.addEventListener('click', function () { location.href = 'index.html'; });
  }
  var st = document.createElement('style');
  st.textContent = [
    '.nk-bar{background:rgba(7,16,42,.96)!important;border-bottom:1px solid rgba(80,130,255,.28)!important;color:#fff!important;backdrop-filter:blur(12px);}',
    '.nk-bar .back-btn,.nk-bar .home-btn,.nk-bar .theme-toggle,.nk-bar .nk-menu-btn,.nk-bar .nav-btn,.nk-bar .iconbtn,.nk-bar .back{',
    'background:rgba(255,255,255,.09)!important;border:1px solid rgba(255,255,255,.2)!important;color:#fff!important;}',
    '.nk-bar .back{background:none!important;border:0!important;}',
    '.nk-title{display:flex!important;align-items:center;gap:8px;min-width:0;overflow:hidden;padding:4px 2px;margin:0 4px!important;text-decoration:none;color:#fff!important;flex:1 1 auto;}',
    '.nk-logo{width:36px;height:36px;border-radius:50%;flex-shrink:0;box-shadow:0 0 0 2px rgba(34,211,238,.35),0 0 14px rgba(37,99,235,.55);}',
    '.nk-ttext{display:flex;flex-direction:column;line-height:1.15;min-width:0;}',
    ".nk-tname{font-family:'JetBrains Mono',monospace;font-weight:800;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#fff;letter-spacing:-.3px;}",
    '.nk-tname b{color:#38BDF8;}',
    '.nk-ttag{font-size:10px;color:#9FB4E8;letter-spacing:.3px;white-space:nowrap;}',
    '@media (max-width:400px){.nk-ttag{display:none;}.nk-logo{width:32px;height:32px;}.nk-tname{font-size:13px;}}',
    '@media (max-width:340px){.nk-tname{font-size:13px;}.nk-logo{display:none;}}'
  ].join('');
  document.head.appendChild(st);
})();

/* NK Study Lab - shared side menu (right-side drawer) for every page incl. homepage.
   Any button with the attribute  data-nk-menu  opens it.
   To change the menu items, edit MAIN / MORE below: every page updates at once. */
(function () {
  'use strict';
  var MAIN = [
    { icon: '🏠', label: 'Home',             href: 'index.html', c: 'blue' },
    { icon: '🖥️', label: 'Computer Science', href: 'computer-science.html', c: 'green' },
    { icon: '💻', label: 'Coding',           href: 'coding.html', c: 'cyan' },
    { icon: '🐍', label: 'Python',           href: 'python.html', c: 'navy' },
    { icon: '🗣️', label: 'Spoken English',   href: 'english.html', c: 'purple' },
    { icon: '📖', label: 'Grammar',          href: 'Grammar.html', c: 'pink' },
    { icon: '➗', label: 'Mathematics',      href: 'math.html', c: 'orange' }
  ];
  var MORE = [
    { icon: '📚', label: 'Vocabulary', href: 'voc1.html', c: 'indigo' },
    { icon: '🕐', label: 'Tense',      href: 'tense.html', c: 'amber' },
    { icon: 'ℹ️', label: 'About Us',   href: 'about.html', c: 'slate' },
    { icon: '✉️', label: 'Contact',    href: 'contact.html', c: 'teal' },
    { icon: '▶️', label: 'Join YouTube', href: 'https://youtube.com/@codeshieldnk?si=pXhJG2rVXfVX1jNs', external: true, yt: true }
  ];

  var css = [
    '.nk-menu-btn{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;',
    'background:var(--surface,transparent);border:1px solid var(--border,rgba(128,128,128,.3));color:var(--text,inherit);',
    'font-size:1.15rem;line-height:1;cursor:pointer;flex-shrink:0;padding:0;font-family:inherit;}',
    '.nk-menu-btn:active{transform:scale(.92);}',
    '[data-nk-menu]:focus-visible{outline:2px solid #38BDF8;outline-offset:2px;}',
    '.nk-overlay{position:fixed;inset:0;z-index:2000;background:rgba(2,6,23,.6);opacity:0;visibility:hidden;',
    'transition:opacity .25s ease,visibility 0s linear .25s;}',
    '.nk-overlay.open{opacity:1;visibility:visible;transition:opacity .25s ease;}',
    '.nk-drawer{position:fixed;top:0;right:0;bottom:0;z-index:2001;width:min(310px,86vw);display:flex;flex-direction:column;',
    'overflow-y:auto;color:#E6ECFA;',
    'background:radial-gradient(300px 200px at 100% 0%,rgba(37,99,235,.35),transparent 70%),linear-gradient(180deg,#071030 0%,#081638 60%,#0A1F52 100%);',
    'border-left:1px solid rgba(80,130,255,.35);box-shadow:-12px 0 40px rgba(0,0,0,.5);',
    'transform:translateX(100%);visibility:hidden;transition:transform .28s ease,visibility 0s linear .28s;',
    "font-family:'Inter',system-ui,sans-serif;}",
    '.nk-drawer.open{transform:translateX(0);visibility:visible;transition:transform .28s ease;}',
    '.nk-head{position:relative;display:flex;flex-direction:column;align-items:center;text-align:center;padding:22px 16px 14px;}',
    '.nk-close{position:absolute;top:12px;right:12px;width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;',
    'background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.2);color:#fff;font-size:17px;cursor:pointer;padding:0;}',
    '.nk-dlogo{width:76px;height:76px;border-radius:50%;box-shadow:0 0 0 2px rgba(34,211,238,.4),0 0 22px rgba(37,99,235,.7);margin-bottom:10px;}',
    ".nk-dname{font-family:'JetBrains Mono',monospace;font-weight:800;font-size:20px;color:#fff;}",
    '.nk-dname b{color:#38BDF8;}',
    '.nk-dtag{font-size:12.5px;font-style:italic;font-weight:600;color:#FACC15;margin-top:2px;}',
    '.nk-list{display:flex;flex-direction:column;gap:9px;padding:8px 14px;}',
    '.nk-drawer a.nk-item{position:relative;overflow:hidden;display:flex;align-items:center;gap:13px;padding:11px 14px;border-radius:14px;font-size:14.5px;font-weight:700;',
    'color:#fff;text-decoration:none;background:var(--g,linear-gradient(135deg,#334155,#1E293B));border:1px solid rgba(255,255,255,.25);',
    'box-shadow:inset 0 1px 0 rgba(255,255,255,.35),inset 0 -6px 12px rgba(0,0,0,.15),0 4px 0 var(--edge,#0F172A);text-shadow:0 1px 3px rgba(0,0,0,.3);',
    'transition:transform .12s ease,box-shadow .12s ease;}',
    '.nk-drawer a.nk-item::before{content:"";position:absolute;left:0;right:0;top:0;height:50%;background:linear-gradient(180deg,rgba(255,255,255,.2),rgba(255,255,255,0));pointer-events:none;}',
    '.nk-drawer a.nk-item:active{transform:translateY(3px);box-shadow:inset 0 1px 0 rgba(255,255,255,.3),0 1px 0 var(--edge,#0F172A);}',
    '.nk-drawer a.nk-item .ic{position:relative;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;',
    'background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.3);border-radius:10px;}',
    '.nk-drawer a.nk-item .tx{position:relative;}',
    '.nk-drawer a.nk-item.cur{outline:2px solid #fff;outline-offset:1px;}',
    '.nk-drawer a.nk-item.yt{margin-top:0;}',
    '.nk-i-blue{--g:linear-gradient(135deg,#3B82F6,#1D4ED8);--edge:#14349A;}',
    '.nk-i-green{--g:linear-gradient(135deg,#22C55E,#15803D);--edge:#0E4D26;}',
    '.nk-i-cyan{--g:linear-gradient(135deg,#06B6D4,#0E7490);--edge:#0B4B5E;}',
    '.nk-i-navy{--g:linear-gradient(135deg,#2563EB,#1E3A8A);--edge:#14275F;}',
    '.nk-i-purple{--g:linear-gradient(135deg,#A855F7,#7E22CE);--edge:#4C1782;}',
    '.nk-i-pink{--g:linear-gradient(135deg,#EC4899,#BE185D);--edge:#7A0F3C;}',
    '.nk-i-orange{--g:linear-gradient(135deg,#FB923C,#EA580C);--edge:#8F3507;}',
    '.nk-i-indigo{--g:linear-gradient(135deg,#6366F1,#4338CA);--edge:#2A2487;}',
    '.nk-i-amber{--g:linear-gradient(135deg,#F59E0B,#B45309);--edge:#6B3205;}',
    '.nk-i-slate{--g:linear-gradient(135deg,#64748B,#334155);--edge:#1B2433;}',
    '.nk-i-teal{--g:linear-gradient(135deg,#14B8A6,#0F766E);--edge:#094740;}',
    '.nk-i-yt{--g:linear-gradient(135deg,#8B3DFF,#6D12E8);--edge:#43098F;}',
    '.nk-sep{height:1px;background:rgba(120,160,255,.25);margin:8px 18px;}',
    '.nk-dark{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 26px;font-size:14.5px;font-weight:600;color:#DCE6FF;cursor:pointer;}',
    '.nk-dark span.l{display:flex;align-items:center;gap:13px;}',
    '.nk-sw{width:44px;height:24px;border-radius:999px;background:rgba(255,255,255,.2);position:relative;flex-shrink:0;transition:background .2s;border:0;padding:0;cursor:pointer;}',
    '.nk-sw::after{content:"";position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform .2s;}',
    '.nk-sw.on{background:#2563EB;}.nk-sw.on::after{transform:translateX(20px);}',
    '.nk-foot{margin:10px 14px 18px;padding:12px 14px;border-radius:14px;display:flex;align-items:center;gap:12px;',
    'background:rgba(255,255,255,.06);border:1px solid rgba(250,204,21,.45);}',
    '.nk-foot .t{font-size:22px;}.nk-foot .a{font-size:12.5px;font-weight:700;color:#FACC15;}.nk-foot .b{font-size:12.5px;color:#DCE6FF;}',
    'html.nk-lock,html.nk-lock body{overflow:hidden;}',
    '@media (prefers-reduced-motion:reduce){.nk-drawer,.nk-overlay{transition:none;}}'
  ].join('');

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var here = decodeURIComponent((location.pathname.split('/').pop() || 'index.html'));
  if (here === '') here = 'index.html';

  var overlay = document.createElement('div');
  overlay.className = 'nk-overlay';
  var drawer = document.createElement('nav');
  drawer.className = 'nk-drawer';
  drawer.id = 'nkDrawer';
  drawer.setAttribute('aria-label', 'मुख्य मेन्यू');

  var head = document.createElement('div');
  head.className = 'nk-head';
  head.innerHTML = '<img class="nk-dlogo" src="logo.png" alt="" width="76" height="76">' +
    '<div class="nk-dname"><b>NK</b> Study Lab</div><div class="nk-dtag">Har Vishay Ek Jagah</div>';
  var closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'nk-close';
  closeBtn.setAttribute('aria-label', 'मेन्यू बंद करो');
  closeBtn.textContent = '✕';
  head.appendChild(closeBtn);
  drawer.appendChild(head);

  function buildList(items) {
    var box = document.createElement('div');
    box.className = 'nk-list';
    items.forEach(function (it) {
      var a = document.createElement('a');
      a.href = it.href;
      a.className = 'nk-item nk-i-' + (it.yt ? 'yt' : it.c) + (it.yt ? ' yt' : '') + (it.href === here ? ' cur' : '');
      if (it.external) { a.target = '_blank'; a.rel = 'noopener'; }
      var ic = document.createElement('span');
      ic.className = 'ic';
      ic.textContent = it.icon;
      a.appendChild(ic);
      var tx = document.createElement('span');
      tx.className = 'tx';
      tx.textContent = it.label;
      a.appendChild(tx);
      box.appendChild(a);
    });
    return box;
  }
  drawer.appendChild(buildList(MAIN));
  var sep = document.createElement('div'); sep.className = 'nk-sep'; drawer.appendChild(sep);
  drawer.appendChild(buildList(MORE));
  var sep2 = document.createElement('div'); sep2.className = 'nk-sep'; drawer.appendChild(sep2);

  // Dark mode row: clicks the page's own theme button, so every page keeps working
  var dark = document.createElement('div');
  dark.className = 'nk-dark';
  dark.innerHTML = '<span class="l"><span class="ic" style="font-size:18px;width:28px;text-align:center">🌗</span>Dark Mode</span>';
  var sw = document.createElement('button');
  sw.type = 'button'; sw.className = 'nk-sw'; sw.setAttribute('role', 'switch'); sw.setAttribute('aria-label', 'Dark Mode');
  dark.appendChild(sw);
  drawer.appendChild(dark);

  var foot = document.createElement('div');
  foot.className = 'nk-foot';
  foot.innerHTML = '<span class="t">🏆</span><div><div class="a">Learn • Practice • Grow</div><div class="b">With NK Study Lab</div></div>';
  drawer.appendChild(foot);

  document.body.appendChild(overlay);
  document.body.appendChild(drawer);

  function isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ||
      document.body.classList.contains('dark') || document.body.classList.contains('dark-theme');
  }
  function syncSwitch() {
    var on = isDark();
    sw.classList.toggle('on', on);
    sw.setAttribute('aria-checked', String(on));
  }
  function toggleTheme() {
    var b = document.querySelector('#themeBtn, #themeToggle, .theme-toggle');
    if (b) { b.click(); setTimeout(syncSwitch, 60); }
  }
  dark.addEventListener('click', function (e) { e.preventDefault(); toggleTheme(); });

  var lastTrigger = null;
  function setOpen(open) {
    if (open) syncSwitch();
    drawer.classList.toggle('open', open);
    overlay.classList.toggle('open', open);
    document.documentElement.classList.toggle('nk-lock', open);
    var tr = document.querySelectorAll('[data-nk-menu]');
    for (var i = 0; i < tr.length; i++) tr[i].setAttribute('aria-expanded', String(open));
    if (open) { closeBtn.focus(); }
    else if (lastTrigger) { lastTrigger.focus(); }
  }

  var triggers = document.querySelectorAll('[data-nk-menu]');
  for (var i = 0; i < triggers.length; i++) {
    triggers[i].setAttribute('aria-haspopup', 'dialog');
    triggers[i].setAttribute('aria-expanded', 'false');
    triggers[i].addEventListener('click', function (e) {
      e.preventDefault();
      lastTrigger = this;
      setOpen(!drawer.classList.contains('open'));
    });
  }
  closeBtn.addEventListener('click', function () { setOpen(false); });
  overlay.addEventListener('click', function () { setOpen(false); });
  drawer.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a');
    if (a && a.getAttribute('href') && a.getAttribute('href').charAt(0) === '#') setOpen(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer.classList.contains('open')) setOpen(false);
  });
})();
