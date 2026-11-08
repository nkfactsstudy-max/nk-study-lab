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
