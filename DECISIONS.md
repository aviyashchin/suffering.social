# DECISIONS — suffering.social + design-system

_Captured 2026-05-19. Decision owner: Avi._

## Forward direction (the one rule)

**All new marketing surfaces are Tailwind + shadcn + the design-system
contract.** No more vanilla HTML + Tailwind CDN + hand-rolled palette
remaps. The design-system already ships the bridge:

```
cdn/v1/all.css     # tokens + theme registry + primitives
cdn/v1/shadcn.css  # maps shadcn vars (--background, --foreground, --primary,
                   # --card, --border, --ring, --radius) onto the DS contract
```

A new microsite is `Vite + React + Tailwind v4 + shadcn` consuming both
files. The Subconscious tokens live in DS, shadcn semantic classes
(`bg-background`, `bg-card`, `bg-primary`, `text-muted-foreground`)
drive the markup, themes track via `data-theme`/`data-mode` on `<html>`.

## suffering.social — pinned, not rewritten

This site is a one-off static calculator (305KB monolith, vanilla JS,
Chart.js + d3 + nouislider + gsap). It does **not** convert to the
forward stack without a full React rewrite, which isn't worth doing for
one calculator.

State after the 2026-05-19 design-system convergence:

| | before | after |
|---|---|---|
| design-system tokens consumed | 0 | ~180 `var()` refs |
| broken/orphaned `var()` refs | 72 | 0 |
| CSS `box-shadow` rules | 53 | 0 |
| CSS `border-radius` ≥ 12px | 24 | 0 |
| CSS decorative `linear-gradient` | 45 | 0 |
| HTML `shadow-*` utility classes | 10 | 0 |
| HTML `bg-gradient-to-*` utility classes | 4 | 0 (collapsed to `bg-from-color`) |
| HTML `rounded-{md,lg,xl,2xl,3xl}` classes | 63 | 0 (collapsed to `rounded-sm` = 2px) |
| Tailwind utility palette | Tailwind defaults | every step resolves through DS via `tailwind.config` ramp |
| Tailwind preflight competing with `_base.css` | yes | off |
| heading scale inside content areas | DS display sizes overrode authored utilities | content reset in `site-tokens.css` |

Site is locked at this state. Any future visual changes happen in
a React rewrite, not in `index.html`.

## 2026-07-19 — privacy-first observability baseline

This is a sensitive-topic satellite, so observability is deliberately
aggregate and fail-closed. The permanent exclusions are identity resolution
(RB2B, Vector, Leadsy), ad tags, session replay, autocapture, user profiles,
form capture, and raw calculator inputs. The only product events are canonical
`page_view` and allowlisted `cta_clicked` events.

Implementation invariants future agents should preserve:

- Every provider requires both `VITE_TELEMETRY_ENABLED=true` and its own valid
  enable flag/identifier. A missing or malformed value loads nothing.
- URLs are reduced to canonical paths or allowlisted destination hosts before
  dispatch. GA4 referrers are blanked; PostHog URL/referrer defaults are
  removed; Sentry drops PII, query strings, request metadata, and non-navigation
  breadcrumbs.
- PostHog `advanced_disable_flags` is intentional for the pinned SDK; it is the
  SDK's external flags/remote-config kill switch. Do not replace it based on
  older option names without checking the installed version.
- Sentry activation requires release-specific source-map upload credentials;
  production builds fail closed if runtime error reporting is enabled without
  them. Browser bundles must not publish `.map` files.
- Provider SDKs stay behind dynamic imports. With all flags off, the normal
  browser path makes no telemetry requests and loads no telemetry SDK chunks.
- `/v5` is a clean Vercel rewrite to the legacy calculator. Because
  `cleanUrls` is enabled, its rewrite destination must be the extensionless
  emitted route (`/social_media_cost_calculatorv5`), not the `.html` filename.
  Vite preview does not emulate this rewrite, so validate it on Vercel and then
  recheck the public production URL after promotion.

The remaining Tailwind Play CDN warning and legacy CSS parser warnings predate
observability. They are known static-site debt, not telemetry regressions. See
`docs/GROWTH_OPERATIONS.md` for activation, evidence, rollback, and SEO/GEO
operations.

## Reverse-migrate into `~/marketing/design-system/`

Five concrete artifacts to push back upstream so the next agent doesn't
re-derive them. The work is already written in this repo — DS can lift it
verbatim.

### 1. `cdn/v1/tailwind.js` — palette bridge for static Tailwind-CDN consumers

The missing twin of `shadcn.css`. `shadcn.css` bridges Tailwind v4 +
shadcn React apps. `tailwind.js` would bridge **Tailwind Play CDN +
static HTML** by exposing the DS palette as a Tailwind theme extension,
with `preflight: false` baked in.

Source code (this repo, `index.html` lines ~63–106) is a 50-step ramp
via `color-mix(in srgb, anchor X%, --bg-1 / --fg-1)`. Ramp anchors:
`--accent`, `--c-productivity`, `--red`, `--chart-2`, `--chart-5`, `--chart-1`.
Step weights: 6, 12, 22, 38, 62, 100, 88→fg, 72, 55, 40.

Static consumer integration becomes one line:

```html
<script src="https://subconscious-ai.github.io/design-system/cdn/v1/tailwind.js" defer></script>
```

### 2. `scripts/editorial-surgery.mjs` — doctrine enforcer

A deterministic Node script that strips `box-shadow`, caps
`border-radius` at 2px (preserves 50% for handles/dots), and flattens
decorative `linear-gradient(...)` to its first color stop. 53+77+45
substitutions across this repo tonight, zero manual fixes, fully
reversible via git.

Lift to `design-system/scripts/editorial-surgery.mjs`. Document in
`ADOPTING.md` as the standard onboarding pass for any existing app
consuming the DS for the first time.

### 3. `ADOPTING.md` — new "Option E: static HTML + Tailwind CDN"

Document the static-site adoption recipe end-to-end:

- `<link>` `all.css` first
- `<script>` Tailwind CDN
- `<script>` `cdn/v1/tailwind.js` (the new bridge from item 1)
- `<html data-theme="kong" data-mode="light">`
- **Gotcha:** with `preflight: false`, DS `_base.css` styles raw `<h1>`–`<h6>`
  at editorial display sizes. If the consumer uses Tailwind utility
  classes (`text-lg`, `text-2xl`) to drive heading sizes, they need:

  ```css
  body h1, body h2, body h3, body h4, body h5, body h6 {
    font-size: inherit; font-weight: inherit; line-height: inherit;
    letter-spacing: normal; margin: 0;
  }
  ```

  Every non-editorial surface (calculators, dashboards, forms) will hit this.

### 4. `ANTIPATTERNS.md` — "token aliasing isn't adoption"

The thesis tonight, captured as a case study:

> A site "uses the design system" only if it has **0** box-shadows,
> **0** `border-radius` ≥ 12px, and **0** decorative gradients.
> Painting DS tokens onto a Mailchimp-template UI doesn't converge —
> it just makes the mismatch token-typed.

Use suffering.social's before/after table from this doc as the worked
example. Smell test belongs in CI for consuming apps.

### 5. The button question — make the dodge explicit in `DECISIONS.md`

DS deliberately doesn't ship a `.btn`. Every consumer reinvents it.
This repo went one round of reinvention (a `.btn-flat` class we then
deleted unused — YAGNI). The right answer is upstream:

- **(a)** Document a canonical recipe in `PATTERNS.md` so future agents
  copy a reference instead of improvising.
- **(b)** Ship a `.btn` primitive in `_base.css`.

(a) is consistent with current doctrine; (b) ends the rediscovery tax.
Either way the standing answer belongs in DS's `DECISIONS.md`. We are
not solving it here — the React rewrite (per "Not doing" below) is
where this site's buttons get answered.

## What we are NOT doing

- **Not** rewriting suffering.social to React. Not worth the budget.
- **Not** keeping the custom `tailwind.config` palette ramp inline in
  `index.html` long-term — that moves to `cdn/v1/tailwind.js` in DS and
  this page references it.
- **Not** investing more in vanilla-HTML adoption recipes. Items 1–4
  exist so this static-site path is supported when it appears again,
  but the default path is React + shadcn.

## Open issues to file against `design-system/`

- [ ] `cdn/v1/tailwind.js` — ship the static-site Tailwind bridge (item 1)
- [ ] `scripts/editorial-surgery.mjs` — lift from this repo (item 2)
- [ ] `ADOPTING.md` §Option E — static HTML + Tailwind CDN (item 3)
- [ ] `ANTIPATTERNS.md` — token-aliasing-isn't-adoption (item 4)
- [ ] `DECISIONS.md` — button doctrine, close the question (item 5)
