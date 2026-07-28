# Contributing to Suffering.Social

Suffering.Social is a public research project, not a diagnostic or policy tool.
Contributions should make the evidence, model, accessibility, privacy, or
performance easier to inspect.

## Set up

Use a supported Node version from `package.json`; CI pins Node 22.13.0.

```bash
npm ci
npm run dev
```

The active experience is `calculator.html` at `/calculator`. `index.html`
supports the research at `/`; `social_media_cost_calculatorv5.html` is an
unlisted legacy reference, not the primary implementation. Shared modules and
styles live in `src/`.

## Research changes

Attach every external claim to a stable primary or peer-reviewed source.
Include the study design, population, sample size, measured outcome, and
limitations. Clearly distinguish causal estimates from associations. When a
parameter changes, explain its units and economic rationale and deliberately
update the scenario fixtures and characterization tests.

## Technical changes

Follow the style and privacy boundaries in `AGENTS.md`. Add the narrowest Jest
or Playwright test that would fail without the change. Before opening a pull
request, run:

```bash
npm run test:coverage -- --runInBand
npm run lint
npm run build
npm run validate:growth
npm run test:e2e
npm run lighthouse:ci
npm audit --audit-level=high
```

See `docs/PRODUCTION_RUNBOOK.md` for thresholds, deployment proof, provider
checks, and rollback. Never weaken a privacy, accessibility, or performance
threshold merely to make CI green.

## Pull requests

Use an imperative Conventional Commit subject such as
`fix: clarify uncertainty bounds`. Describe the research or user impact, link
the issue, list exact validation, and include desktop/mobile screenshots for
visual changes. Research PRs must list the changed sources and model rationale.
Production claims require a deployed-revision readback; local or CI success is
not deployment proof.

Report defects and research corrections through
[GitHub Issues](https://github.com/aviyashchin/suffering.social/issues).
