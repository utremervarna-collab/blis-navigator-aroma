(() => {
  'use strict';

  const hub = document.querySelector('.hubNav');
  if (!hub || hub.dataset.clickMenuReady === '1') return;
  hub.dataset.clickMenuReady = '1';

  const oldLink = hub.querySelector('.hubNavLink');
  const oldToggle = hub.querySelector('.hubNavToggle');
  const menu = hub.querySelector('.hubNavMenu');
  if (!oldLink || !menu) return;

  const categories = [
    ['Пазари', '/intelligence-hub.html#hub-markets'],
    ['Репутация', '/intelligence-hub.html#hub-reputation'],
    ['Конкуренти', '/intelligence-hub.html#hub-competitors'],
    ['Дигитална среда', '/intelligence-hub.html#hub-digital'],
    ['Потребителски нагласи', '/intelligence-hub.html#hub-attitudes'],
    ['Казуси', '/intelligence-hub.html#hub-cases'],
    ['Методология', '/intelligence-hub.html#hub-methodology'],
    ['AI и бизнес', '/intelligence-hub.html#hub-ai-business']
  ];

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'hubNavTrigger';
  trigger.setAttribute('aria-haspopup', 'menu');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-controls', 'hubTopCategoryMenu');
  trigger.innerHTML = '<span>Intelligence Hub</span><i aria-hidden="true">⌄</i>';
  oldLink.replaceWith(trigger);
  oldToggle?.remove();

  menu.id = 'hubTopCategoryMenu';
  menu.setAttribute('role', 'menu');
  menu.innerHTML = `
    <div class="hubNavMenuHead">Категории</div>
    <div class="hubNavMenuGrid">
      ${categories.map(([label, href]) => `<a role="menuitem" href="${href}">${label}</a>`).join('')}
    </div>
    <a class="hubNavAll" role="menuitem" href="/intelligence-hub.html"><span>Всички материали</span><b aria-hidden="true">→</b></a>
  `;

  const style = document.createElement('style');
  style.id = 'hubNavClickMenuCss';
  style.textContent = `
    .hubNav{position:relative!important;z-index:1002!important}
    .hubNavTrigger{appearance:none;border:0;background:transparent;padding:0;display:inline-flex;align-items:center;gap:7px;height:42px;color:#b77b19;font:650 13px/1 Inter,"Segoe UI",Arial,sans-serif;cursor:pointer;white-space:nowrap}
    .hubNavTrigger i{font-style:normal;font-size:12px;line-height:1;transition:transform .18s ease;transform-origin:center}
    .hubNav.is-open .hubNavTrigger i{transform:rotate(180deg)}
    .hubNav:not(.is-open) .hubNavMenu{opacity:0!important;visibility:hidden!important;pointer-events:none!important;transform:translateX(-50%) translateY(8px)!important}
    .hubNav.is-open .hubNavMenu{display:block!important;opacity:1!important;visibility:visible!important;pointer-events:auto!important;transform:translateX(-50%) translateY(0)!important}
    .hubNavMenu{top:67px!important;width:420px!important;padding:12px!important;z-index:1200!important;overflow:visible!important}
    .hubNavMenuHead{padding:5px 8px 10px;color:#8b98a8;font-size:9px;font-weight:850;letter-spacing:.11em;text-transform:uppercase}
    .hubNavMenuGrid{display:grid;grid-template-columns:1fr 1fr;gap:4px}
    .hubNavMenuGrid a{display:flex!important;align-items:center!important;min-height:39px!important;padding:8px 10px!important;border-radius:8px!important;color:#263b52!important;font-size:11.5px!important;font-weight:720!important;text-decoration:none!important}
    .hubNavMenuGrid a:hover,.hubNavMenuGrid a:focus{background:#f5f7fa!important;color:#a56e16!important;outline:none}
    .hubNavAll{margin-top:9px!important;padding:11px 10px 5px!important;border-top:1px solid #e5e9ee!important;border-radius:0!important;display:flex!important;align-items:center!important;justify-content:space-between!important;color:#a56e16!important;font-size:11px!important;font-weight:800!important;text-decoration:none!important}
    .hubNavAll:hover{background:transparent!important;color:#80520e!important}
    @media(max-width:1100px){.hubNavTrigger{display:none!important}.hubNavMenu{display:none!important}}
  `;
  document.head.appendChild(style);

  const setOpen = (open) => {
    hub.classList.toggle('is-open', !!open);
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    setOpen(!hub.classList.contains('is-open'));
  });

  menu.addEventListener('click', (event) => event.stopPropagation());
  document.addEventListener('click', (event) => {
    if (!hub.contains(event.target)) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && hub.classList.contains('is-open')) {
      setOpen(false);
      trigger.focus();
    }
  });
})();
