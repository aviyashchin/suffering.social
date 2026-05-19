# Design-System Integration Plan

Tracks GitHub issue #1 — integrating suffering.social into the Subconscious
design system. Scope: Phase 1 (cleanup) + Phase 2 (token adoption). React
rewrite and component reverse-migration are out of scope.

## Context

- Deploy: Vercel (`vercel.json`). `/` → `index.html`; `/v5` →
  `social_media_cost_calculatorv5.html`; `/calculator` → `index.html`.
- `index.html` is a 305KB monolith: inline JS, CDN `<script>`s, and 4 local
  CSS files (`src/styles/{base,calculator,components,mobile}.css`).
- No CSS custom properties anywhere — ~103 hardcoded hex literals inline plus
  more in the CSS files. `css/variables.css` exists but is never loaded.

## Phase 1 — Archaeology & cleanup

Delete (via `trash`):

| Item | Reason |
|------|--------|
| `calculator.html` | `/calculator` redirects to `index.html` — unused |
| `index-clean/new/modular/modular-example.html`, `calculator-modular.html` | dead variants |
| `index.html.backup-20250626-121501`, `index.html.backup-phase1-20250626-124914` | backups |
| `src/components/`, `src/utils/`, `src/*.js` | abandoned modular system (commit 90f6474) |
| `src/styles/{animations,charts,header,main,modal}.css` | not loaded by `index.html` |
| `assets/` | 1.5MB vendored libs; live files use CDN |
| `css/variables.css` | dead token file (never loaded) |
| `-I`, `.DS_Store` | junk |

Relocate: `Externality Clock/` (67MB PDFs) → `archive/research-docs/`.

Keep: `index.html`, `social_media_cost_calculatorv5.html`,
`src/styles/{base,calculator,components,mobile}.css`, `citations.js`,
`d3-distribution-sliders.js` (reverse-migration candidates).

## Phase 2 — Design-system token adoption — DONE

Per design-system doctrine, production apps copy `contract.css` (the app
contract), **not** `tokens.css` (preview canon — it also styles raw
elements and would collide with the site's existing CSS).

1. Vendored `design-system/contract.css` verbatim → `src/styles/contract.css`
   (canonical pair, type scale, spacing, `--chart-*`).
2. Added `src/styles/ds-bridge.css` — derives the ink/bg scale, greys,
   `--red`, and the three cost-category colours from the contract pair
   using the same `color-mix()` formulas as the design-system `tokens.css`.
   Both wired into `index.html` `<head>` before the site's own CSS.
3. `scripts/remap-tokens.mjs` — auditable hex→token map; rewrote all 347
   hex literals across `index.html` + the 4 live CSS files to `var()`.
   Mapping decisions: greys → `--fg-*`/`--grey-*`/`--bg-*`; mortality red →
   `--c-mortality` (signal red); mental-health → `--c-mental-health`
   (`--chart-4`); productivity → `--c-productivity` (`--chart-2`); blue
   accent → `--accent` (`--chart-1`, renders orange in light mode).
4. CSS `var()` does not resolve in canvas (Chart.js / `ctx.fillStyle`).
   Added a `cssVar()` helper and converted the 38 colour strings in inline
   JS to resolve tokens at runtime.

## Residual (not in this scope)

- Inline Tailwind CDN utility classes still use Tailwind's own palette —
  needs a Tailwind config mapping to DS tokens.
- `rgba()` literals (overlays, shadows) not migrated.
- `social_media_cost_calculatorv5.html` (`/v5`) left untouched.

## Verification

- No references to deleted files; `index.html` CSS links resolve. ✓
- Zero hardcoded hex literals in `index.html` + 4 live CSS files. ✓
- All inline `<script>` blocks parse (token strings sit in CSS-in-JS
  template literals or `cssVar()` calls, not bare JS). ✓
- Live visual render: confirm by opening `index.html` locally or via the
  Vercel preview deploy — pending.
