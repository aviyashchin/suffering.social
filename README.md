# Suffering.Social

Suffering.Social is a public research project that estimates the economic cost
of social media's mental-health effects. The model combines published causal
evidence, government data, and explicit economic assumptions. It is an
exploratory estimate, not a causal finding for every component or a policy
recommendation.

The primary experience is the
[research calculator](https://www.suffering.social/calculator). The
[home page](https://www.suffering.social/) explains the evidence and method.

## Architecture

This is a static, multi-page Vite site:

- `calculator.html` owns `/calculator`, the calculation engine, assumptions,
  scenarios, methods, and citations.
- `index.html` owns `/`, the supporting research explainer.
- `privacy.html` and `social_media_cost_calculatorv5.html` own `/privacy` and
  the unlisted legacy `/v5` route.
- `src/styles/` contains the shared design tokens and route styles.
- `src/telemetry*.js` is the single aggregate-only event boundary.
- `src/*.test.js` contains Jest contracts; `tests/e2e/` contains Playwright
  engine and journey checks.
- `scripts/validate-growth.mjs` inspects built output for canonical, privacy,
  and source-map regressions.
- `.github/workflows/` owns pull-request verification and the daily production
  smoke.

Vercel routing lives in `vercel.json`. Vite injects a `build-revision` meta tag
from `VERCEL_GIT_COMMIT_SHA`; production monitoring compares it with the
expected default-branch revision.

## Develop and verify

Use Node `^20.19.0`, `^22.13.0`, or `>=24.0.0`. Node 20.19.0 is the
minimum supported runtime; CI pins Node 22.13.0.

```bash
npm ci                    # install the locked dependency graph
npm run dev               # start the Vite development server
npm run verify:fast       # Jest, production build, and built-output validation
npm run test:coverage     # active source coverage
npm run lint              # repository ESLint checks
npm run test:e2e          # desktop and 390px Playwright journeys
npm run build             # write the production site to dist/
npm run lighthouse:ci     # audit built /calculator on dedicated port 4175
npm audit --audit-level=high
```

Run `npm run build` before `npm run lighthouse:ci`. Browser failures retain
traces and screenshots; Lighthouse writes local reports to `.lighthouseci/`.
See [docs/PRODUCTION_RUNBOOK.md](docs/PRODUCTION_RUNBOOK.md) for production
proof, alerts, provider checks, rollback, and Search Console.

## Privacy and telemetry

Telemetry fails closed. GTM-managed aggregate GA4 and scrubbed Sentry are the
only approved providers. The runtime emits one canonical `page_view` and
allowlisted `cta_clicked` events; it excludes query strings, calculator inputs,
DOM text, identities, replay, advertising, and lead capture. Provider variables
are documented in `.env.example`.

## Research contributions

Keep each external claim attached to a source and distinguish causal evidence
from association. A model change must preserve or deliberately update the exact
scenario fixtures in `tests/fixtures/` and the engine characterization test.
Open a pull request with the changed source, model rationale, and validation
output.

The project is licensed under Apache 2.0. Questions and corrections belong in
[GitHub Issues](https://github.com/aviyashchin/suffering.social/issues).
