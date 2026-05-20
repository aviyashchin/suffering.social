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

State after tonight's work (branch `ds-converge`, mergeable):

| | before | after |
|---|---|---|
| design-system tokens consumed | 0 | ~180 `var()` refs |
| broken/orphaned `var()` refs | 72 | 0 |
| `box-shadow` rules | 53 | 0 |
| `border-radius` ≥ 12px | 24 | 0 |
| decorative `linear-gradient` | 45 | 0 |
| Tailwind utility palette | Tailwind defaults | every step resolves through DS via `tailwind.config` ramp |
| Tailwind preflight competing with `_base.css` | yes | off |
| heading scale inside content areas | DS display sizes overrode authored utilities | content reset in `site-tokens.css` |

Site is locked at this state. Any future visual changes happen in
a React rewrite, not in `index.html`.

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
Either:

- **(a)** Add a canonical recipe to `PATTERNS.md` (the `.btn-flat` we
  wrote in `site-tokens.css`: 1px border, 2px radius, no shadow,
  ink/cream invert on hover). Future agents copy the reference.
- **(b)** Reverse the decision and ship a `.btn` primitive in `_base.css`.

(a) is consistent with current doctrine; (b) ends the rediscovery tax.
Either way, the standing answer goes in `DECISIONS.md` so the question
is closed.

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
