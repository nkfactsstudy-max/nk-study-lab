/* NK Study Lab - shared top bar look (logo + name + tagline on dark navy) for every inner page. */
(function () {
  'use strict';
  if (document.getElementById('navMenu')) return;           // homepage has its own bar
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

/* Nk Study Lab - shared side menu (right-side drawer) for every inner page.
   Each page has a header button with the attribute  data-nk-menu  and loads this file.
   To change the menu items, edit ITEMS below: every page updates at once. */
(function () {
  'use strict';
  if (document.getElementById('navMenu')) return;   // homepage has its own drawer

  var ITEMS = [
    { icon: '🏠', label: 'Home',          href: 'index.html' },
    { icon: '📖', label: 'All Subjects',  href: 'index.html#subjects' },
    { icon: '👤', label: 'About Us',      href: 'about.html' },
    { icon: '✉️', label: 'Contact',       href: 'contact.html' },
    { icon: '▶️', label: 'Join YouTube',  href: 'https://youtube.com/@codeshieldnk?si=pXhJG2rVXfVX1jNs', external: true, yt: true }
  ];

  var css = [
    '.nk-menu-btn{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;',
    'background:var(--surface,transparent);border:1px solid var(--border,rgba(128,128,128,.3));color:var(--text,inherit);',
    'font-size:1.15rem;line-height:1;cursor:pointer;flex-shrink:0;padding:0;font-family:inherit;}',
    '.nk-menu-btn:active{transform:scale(.92);}',
    '[data-nk-menu]:focus-visible{outline:2px solid #0D9488;outline-offset:2px;}',
    '.nk-overlay{position:fixed;inset:0;z-index:2000;background:rgba(0,0,0,.45);opacity:0;visibility:hidden;',
    'transition:opacity .25s ease,visibility 0s linear .25s;}',
    '.nk-overlay.open{opacity:1;visibility:visible;transition:opacity .25s ease;}',
    '.nk-drawer{position:fixed;top:0;right:0;bottom:0;z-index:2001;width:min(300px,82vw);display:flex;flex-direction:column;',
    'overflow-y:auto;background:var(--nk-bg,#fff);color:var(--nk-fg,#1A1F2B);',
    'border-left:1px solid rgba(128,128,128,.28);box-shadow:-10px 0 30px rgba(0,0,0,.18);',
    'transform:translateX(100%);visibility:hidden;transition:transform .28s ease,visibility 0s linear .28s;',
    "font-family:'Inter',system-ui,sans-serif;}",
    '.nk-drawer.open{transform:translateX(0);visibility:visible;transition:transform .28s ease;}',
    '.nk-head{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;',
    "border-bottom:1px solid rgba(128,128,128,.28);font-family:'JetBrains Mono',monospace;font-weight:800;font-size:16px;}",
    '.nk-head .nk{color:#0D9488;}',
    '.nk-close{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;',
    'background:rgba(128,128,128,.12);border:1px solid rgba(128,128,128,.28);color:inherit;font-size:18px;cursor:pointer;padding:0;}',
    '.nk-drawer a{display:flex;align-items:center;gap:12px;padding:14px 20px;font-size:14px;font-weight:600;',
    'color:inherit;text-decoration:none;border-bottom:1px solid rgba(128,128,128,.22);}',
    '.nk-drawer a:last-child{border-bottom:none;}',
    '.nk-drawer a:hover{background:rgba(128,128,128,.1);}',
    '.nk-drawer a .ic{width:22px;text-align:center;font-size:16px;}',
    '.nk-drawer a.yt{background:linear-gradient(135deg,#7b2af7,#7010fc);color:#fff;}',
    '.nk-drawer a.yt .ic{background:rgba(255,255,255,.2);border-radius:6px;padding:3px;}',
    'html.nk-lock,html.nk-lock body{overflow:hidden;}',
    '@media (prefers-reduced-motion:reduce){.nk-drawer,.nk-overlay{transition:none;}}'
  ].join('');

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var overlay = document.createElement('div');
  overlay.className = 'nk-overlay';

  var drawer = document.createElement('nav');
  drawer.className = 'nk-drawer';
  drawer.setAttribute('aria-label', 'मुख्य मेन्यू');

  var head = document.createElement('div');
  head.className = 'nk-head';
  head.innerHTML = '<span><span class="nk">Nk</span> Study Lab</span>';
  var closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'nk-close';
  closeBtn.setAttribute('aria-label', 'मेन्यू बंद करो');
  closeBtn.textContent = '✕';
  head.appendChild(closeBtn);
  drawer.appendChild(head);

  ITEMS.forEach(function (it) {
    var a = document.createElement('a');
    a.href = it.href;
    if (it.external) { a.target = '_blank'; a.rel = 'noopener'; }
    if (it.yt) a.className = 'yt';
    var ic = document.createElement('span');
    ic.className = 'ic';
    ic.textContent = it.icon;
    a.appendChild(ic);
    a.appendChild(document.createTextNode(it.label));
    drawer.appendChild(a);
  });

  document.body.appendChild(overlay);
  document.body.appendChild(drawer);

  var lastTrigger = null;

  // Use the page's own colours so the drawer matches light and dark themes
  function matchTheme() {
    var bg = getComputedStyle(document.body).backgroundColor;
    if (!bg || bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)') {
      bg = getComputedStyle(document.documentElement).backgroundColor;
    }
    if (!bg || bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)') bg = '#ffffff';
    drawer.style.setProperty('--nk-bg', bg);
    drawer.style.setProperty('--nk-fg', getComputedStyle(document.body).color);
  }

  function setOpen(open) {
    if (open) matchTheme();
    drawer.classList.toggle('open', open);
    overlay.classList.toggle('open', open);
    document.documentElement.classList.toggle('nk-lock', open);
    var triggers = document.querySelectorAll('[data-nk-menu]');
    for (var i = 0; i < triggers.length; i++) triggers[i].setAttribute('aria-expanded', String(open));
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
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer.classList.contains('open')) setOpen(false);
  });
})();
