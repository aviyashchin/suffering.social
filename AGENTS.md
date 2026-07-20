# Repository Guidelines

## Project Structure & Module Organization

This is a Vite-built, multi-page static site. `index.html` is the current
editorial experience; `calculator.html` and
`social_media_cost_calculatorv5.html` are maintained calculator variants.
`vite.config.js` defines the build entries, while `vercel.json` owns production
redirects, rewrites, and headers. Shared telemetry lives in `src/`; styles are
under `src/styles/`; deployable static files belong in `public/`. Use `docs/`
for current operating guidance and treat `archive/` as historical reference.

## Build, Test, and Development Commands

- `npm ci` installs the exact lockfile dependencies.
- `npm run dev` starts Vite locally.
- `npm run verify:fast` runs Jest, builds every page, and validates growth and
  privacy contracts.
- `npm run lint` checks the actively maintained JavaScript and validators.
- `npm audit --omit=dev` checks production dependencies.
- `npm run preview` serves `dist/`; note that Vite does not emulate Vercel
  host conditions or the `/v5` rewrite.

## Coding Style & Naming Conventions

Use two-space indentation, semicolons, single quotes in JavaScript, and
trailing commas where valid. Prefer descriptive `camelCase` JavaScript names
and kebab-case asset or script filenames. Follow existing static-page patterns;
do not introduce a framework migration incidentally. Preserve semantic HTML,
keyboard access, responsive behavior, and design-system tokens.

## Testing Guidelines

Write Jest regression tests before behavior changes. Put telemetry and SEO
contracts in `src/*.test.js`. Run `npm run verify:fast` before every push. For
calculator changes, also exercise affected sliders, totals, keyboard controls,
and mobile layouts. Research changes require a peer-reviewed or government
source and updated citation.

## Commit & Pull Request Guidelines

Use short imperative subjects, commonly `feat:`, `fix:`, or `docs:`. Keep each
commit focused. Pull requests should explain the change, affected routes,
privacy or methodology impact, and exact validation. Include screenshots for
visual changes and sources for factual changes. Never add identity-resolution,
advertising, replay, or raw calculator-input tracking.
