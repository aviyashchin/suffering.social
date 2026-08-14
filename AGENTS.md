# Repository Guidelines

## Project Structure & Module Organization

This is a static, multi-page Vite site. `index.html` owns the calculator-first
`/` experience and its closing 2012 evidence chapter. `calculator.html` is only
the no-index compatibility document for the permanent `/calculator` redirect.
Shared JavaScript and CSS live in `src/`, Jest contracts sit beside their modules as
`src/*.test.js`, and browser journeys live in `tests/e2e/`. Keep public
discovery files in `public/`, build checks in `scripts/`, deployment rules in
`vercel.json`, and operational guidance in `docs/`.

The unlisted `/v5` route is legacy reference material. Do not extend it when the
active root experience can satisfy the change.
When `HERDR_ENV=1`, create and remove worktrees through Herdr so its ledger stays
accurate. Otherwise use the ignored `.worktrees/<branch>` directory and remove
the worktree after its branch merges.

## Build, Test, and Development Commands

- `npm ci` installs the locked dependency graph.
- `npm run dev` starts Vite locally.
- `npm run verify:fast` runs Jest, builds `dist/`, and checks growth contracts.
- `npm run test:coverage -- --runInBand` measures active source coverage.
- `npm run lint` applies the repository ESLint rules.
- `npm run test:e2e` runs desktop and 390px Playwright journeys.
- `npm run lighthouse:ci` audits the built calculator on port 4175.

Use a supported Node release from `package.json`; CI pins 22.13.0.

## Coding Style & Naming Conventions

Use ES modules, two-space indentation, semicolons, and single quotes. Prettier
defines JavaScript formatting; ESLint defines the checked source boundary.
Prefer descriptive kebab-case asset names, camelCase functions, and
`*.test.js`/`*.spec.js` tests. Extend the existing calculation, telemetry, and
validation modules instead of introducing parallel frameworks.

## Testing & Privacy

Every behavior change needs the narrowest distinguishing Jest or Playwright
test. Research-model changes must deliberately update scenario fixtures and
citations. Telemetry is aggregate-only: never capture identities, queries,
calculator state, DOM text, replay, advertising data, or email addresses. The
optional research-update form may send a consenting email only through
`api/research-updates.js`; never place its server key in a `VITE_*` variable.
GTM is the sole Google loader; Sentry must remain scrubbed. See
`docs/PRODUCTION_RUNBOOK.md` before provider or deployment work.

## Commits & Pull Requests

Follow the repository's imperative Conventional Commit pattern, such as
`fix: preserve canonical paths` or `test: cover mobile sharing`. PRs should
explain the user/research impact, link the issue, list exact validation, and
include screenshots for visual changes. Do not claim production success until
the deployed revision, browser journey, and Lighthouse checks are read back.
