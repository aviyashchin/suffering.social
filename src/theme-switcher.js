/* Adapted from Subconscious design-system preview/theme-switcher.js.
 * Preserves its eight palettes, storage contract and themechange event.
 * Calculator adaptations: Floral default, native popover, visible label,
 * pressed states and no global Space/M shortcuts. See docs/MAINTENANCE_GUIDE.md.
 */
(function () {
  'use strict';

  /* 8 themes — 7 from johnny-5-rebuild's 16-theme palette plus floral.
     Nine J5 themes dropped at registry time:
       default · h · moeller     — achromatic grey
       arc                       — lightColor too close to --red
       pettet · jacoviello       — magenta side too close to --red
       keenan                    — hot pink lightColor in same red-adjacent family
       linear                    — pure black/white visually redundant with stripe
       indigo                    — #1e1b4b / #6366f1 fail WCAG body-text contrast (3.58:1)
     One Subconscious-specific theme added:
       floral                    — royal purple / warm parchment, from the
                                   New Age Floral case-study deck
     Floral (royal purple / parchment) is this calculator's default.
     See preview/themes.css header + tests/theme-contrast.test.mjs. */
  const THEMES = [
    { id: 'kong',    label: 'Kong',    darkColor: '#1b165b', lightColor: '#ffffff' },
    { id: 'zyg',     label: 'Zyg',     darkColor: '#813294', lightColor: '#c1d88b' },
    { id: 'bontu',   label: 'Bontu',   darkColor: '#0d0403', lightColor: '#00ffff' },
    { id: 'jones',   label: 'Jones',   darkColor: '#150800', lightColor: '#eda557' },
    { id: 'peacock', label: 'Peacock', darkColor: '#0a2e1f', lightColor: '#f97316' },
    { id: 'figma',   label: 'Figma',   darkColor: '#1e1e24', lightColor: '#0acf83' },
    { id: 'stripe',  label: 'Stripe',  darkColor: '#0a2540', lightColor: '#f6f9fc' },
    { id: 'floral',  label: 'Floral',  darkColor: '#2a1854', lightColor: '#f8f2dc' },
  ];

  const STORE_KEY = 'sc-design-theme';

  /* ----------------- state ----------------- */
  const state = load();

  function load() {
    const fallback = { id: 'floral', mode: 'light' };
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const o = JSON.parse(raw);
        if (o && typeof o === 'object') {
          const merged = Object.assign({}, fallback, o);
          /* Sanitize: a returning user may have a stale theme id from
             before linear/keenan/pettet/jacoviello were pruned. Fall
             back to Floral if the persisted id is no longer in the
             registry. */
          if (!THEMES.some(t => t.id === merged.id)) merged.id = fallback.id;
          if (merged.mode !== 'light' && merged.mode !== 'dark') merged.mode = fallback.mode;
          return merged;
        }
      }
    } catch { /* Storage may be unavailable in private browsing. */ }
    return fallback;
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch { /* Storage may be unavailable in private browsing. */ }
  }

  /* ----------------- apply -----------------
     Set data-theme + data-mode on <html>. themes.css sets --darkColor /
     --lightColor per theme; tokens.css derives --color / --backgroundColor
     from those + data-mode; every other token aliases off the contract pair.
     Nothing else needs touching — the legacy hex sweep was retired in PR-
     contract-alignment because all preview pages now paint via CSS variables
     that follow the cascade automatically. */
  function apply() {
    const r = document.documentElement;
    r.setAttribute('data-theme', state.id);
    r.setAttribute('data-mode', state.mode);
    window.dispatchEvent(new CustomEvent('themechange', { detail: { ...state } }));
    paintPanel();
  }

  /* ----------------- UI ----------------- */
  let panel, toggleBtn;
  function buildPanel() {
    if (panel) return;
    /* shared font-stack so panel doesn't depend on Exposure being loaded */
    const monoStack = '"SohneMono", ui-monospace, "SF Mono", Menlo, monospace';

    /* toggle button (bottom-right) */
    toggleBtn = document.createElement('button');
    toggleBtn.id = '__sc-theme-toggle';
    Object.assign(toggleBtn.style, {
      position: 'fixed', bottom: '18px', right: '18px',
      zIndex: '99998', width: 'auto', height: '44px', padding: '0 12px', gap: '8px',
      border: '1px solid currentColor', borderRadius: '0',
      background: 'var(--backgroundColor)', color: 'var(--color)',
      cursor: 'pointer', fontFamily: monoStack, fontSize: '12px',
      letterSpacing: '0.12em', textTransform: 'uppercase',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    });
    toggleBtn.title = 'Theme picker';
    toggleBtn.setAttribute('aria-label', 'Open theme picker');
    /* small swatch icon — built via DOM nodes (no innerHTML for safety) */
    const swatchIcon = document.createElement('span');
    Object.assign(swatchIcon.style, {
      display: 'inline-block', width: '14px', height: '14px',
      background: 'linear-gradient(135deg,var(--color) 50%,var(--backgroundColor) 50%)',
      border: '1px solid currentColor',
    });
    toggleBtn.appendChild(swatchIcon);
    toggleBtn.append('Appearance');
    toggleBtn.addEventListener('click', () => {
      panel.togglePopover();
    });
    document.body.appendChild(toggleBtn);

    /* panel */
    panel = document.createElement('div');
    panel.id = '__sc-theme-panel';
    panel.setAttribute('popover', 'auto');
    panel.setAttribute('aria-label', 'Theme picker');
    toggleBtn.setAttribute('aria-controls', panel.id);
    toggleBtn.setAttribute('aria-expanded', 'false');
    panel.addEventListener('toggle', () => {
      toggleBtn.setAttribute('aria-expanded', String(panel.matches(':popover-open')));
    });
    Object.assign(panel.style, {
      position: 'fixed', top: 'auto', left: 'auto', margin: '0', bottom: '72px', right: '18px',
      zIndex: '99999', width: 'min(320px, calc(100vw - 36px))',
      maxHeight: 'calc(100vh - 96px)', overflowY: 'auto', boxSizing: 'border-box',
      padding: '20px 22px 22px',
      background: 'var(--backgroundColor)', color: 'var(--color)',
      border: '1px solid currentColor',
      fontFamily: monoStack, fontSize: '12px',
      letterSpacing: '0.14em', textTransform: 'uppercase',
    });
    panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:14px;">
        <span style="opacity:1">Appearance</span>
        <button id="__sc-close" style="min-width:44px;min-height:44px;background:none;border:0;color:inherit;font:inherit;letter-spacing:inherit;text-transform:inherit;cursor:pointer;opacity:1;">close ×</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 10px;margin-bottom:18px;" id="__sc-themes"></div>
      <div style="display:flex;border:1px solid currentColor;">
        <button data-mode="light" class="__sc-mode" style="flex:1;min-height:44px;padding:10px 0;background:none;border:0;color:inherit;font:inherit;letter-spacing:inherit;text-transform:inherit;cursor:pointer;">Light</button>
        <button data-mode="dark" class="__sc-mode" style="flex:1;min-height:44px;padding:10px 0;background:none;border:0;border-left:1px solid currentColor;color:inherit;font:inherit;letter-spacing:inherit;text-transform:inherit;cursor:pointer;">Dark</button>
      </div>

    `;
    document.body.appendChild(panel);

    /* Each theme is a labeled tile: 18px swatch + name. 2 columns, 4 rows
       for the eight-theme registry. Selected state = full-width inset border
       on the tile, applied in paintPanel(). */
    const grid = panel.querySelector('#__sc-themes');
    THEMES.forEach(t => {
      const b = document.createElement('button');
      b.dataset.id = t.id;
      b.setAttribute('aria-label', t.label);
      Object.assign(b.style, {
        display: 'flex', alignItems: 'center', gap: '8px',
        minHeight: '44px', padding: '7px 8px', boxSizing: 'border-box',
        background: 'transparent',
        border: '1px solid transparent',
        color: 'inherit', font: 'inherit',
        letterSpacing: 'inherit', textTransform: 'inherit',
        cursor: 'pointer', textAlign: 'left',
      });
      const swatch = document.createElement('span');
      Object.assign(swatch.style, {
        flex: '0 0 auto', width: '16px', height: '16px',
        border: '1px solid currentColor',
        background: 'linear-gradient(135deg,' + t.darkColor + ' 50%,' + t.lightColor + ' 50%)',
      });
      const name = document.createElement('span');
      name.textContent = t.label;
      Object.assign(name.style, {
        flex: '1 1 auto', fontSize: '12px',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      });
      b.appendChild(swatch);
      b.appendChild(name);
      b.addEventListener('click', () => { state.id = t.id; save(); apply(); });
      grid.appendChild(b);
    });

    panel.querySelector('#__sc-close').addEventListener('click', () => {
      panel.hidePopover();
      toggleBtn.focus();
    });
    panel.querySelectorAll('.__sc-mode').forEach(btn => {
      btn.addEventListener('click', () => {
        state.mode = btn.dataset.mode; save(); apply();
      });
    });
  }

  function paintPanel() {
    if (!panel) return;
    panel.querySelectorAll('#__sc-themes button').forEach(b => {
      const on = b.dataset.id === state.id;
      b.style.borderColor = on ? 'currentColor' : 'transparent';
      b.setAttribute('aria-pressed', String(on));
    });
    panel.querySelectorAll('.__sc-mode').forEach(b => {
      const on = b.dataset.mode === state.mode;
      b.style.background = on ? 'var(--color)' : 'transparent';
      b.setAttribute('aria-pressed', String(on));
      b.style.color = on ? 'var(--backgroundColor)' : 'inherit';
    });
  }

  /* ----------------- init ----------------- */
  function init() {
    /* opt-out: if a page sets data-no-theme-switcher on <html>, skip UI */
    const skipUI = document.documentElement.hasAttribute('data-no-theme-switcher');
    if (!skipUI) buildPanel();
    apply();
    if (!skipUI) paintPanel();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* SPA re-init signal. Next.js App Router layouts that mount new
     pages on client navigation can dispatch:
       window.dispatchEvent(new CustomEvent('subconscious:reinit'));
     to re-paint the theme panel + re-apply state to the new <html>.
     This ensures the visible UI agrees with state across route changes. */
  window.addEventListener('subconscious:reinit', init);

  /* expose programmatic API for the deck and other hosts */
  window.SCTheme = {
    set(id, mode) {
      if (id) state.id = id;
      if (mode) state.mode = mode;
      save(); apply();
    },
    get() { return { ...state }; },
    themes: THEMES.slice(),
    /* Manual re-init for hosts that don't want the global event. */
    reinit: init,
  };
})();
