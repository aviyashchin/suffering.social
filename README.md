# Suffering.Social

Suffering.Social is a public research project that estimates the economic cost
of social media's mental-health effects. The model combines published causal
evidence, government data, and explicit economic assumptions. It is an
exploratory estimate, not a causal finding for every component or a policy
recommendation.

The primary experience is the
[research calculator](https://www.suffering.social/). It opens with one
plain-language estimate, keeps all nine controls visible, and ends with the
evidence chapter, “What changed around 2012?”

## Architecture

This is a static, multi-page Vite site:

- `index.html` owns `/`, including the calculation engine, assumptions,
  scenarios, methods, a static evidence index, publisher provenance, citations,
  and the closing evidence chapter.
- `calculator.html` is a no-index compatibility document; Vercel permanently
  redirects `/calculator` to `/`.
- `privacy.html` and `social_media_cost_calculatorv5.html` own `/privacy` and
  the unlisted legacy `/v5` route.
- `src/styles/` contains the shared design tokens and route styles.
- `src/range-curves.js` keeps each assumption's illustrative curve, current
  marker, selectable paper mappings, and evidence receipt synchronized with its
  slider.
- `src/calculator-model.js` is the page-independent source for model defaults,
  scenarios, slider ranges, and formulas. Change model values there, then
  deliberately update the frozen fixture.
- `src/cost-clock.js` extrapolates the current cumulative estimate using its
  historical average since January 1, 2009. It is not a live harm counter.
- `src/telemetry*.js` is the single aggregate-only event boundary.
- `src/research-updates.js` gates convenient source links behind the consented
  research-pack form. `api/research-updates.js` signs the lead for
  `signals.subconscious.ai` and unlocks sources only after a matching durable
  receipt.
- `src/*.test.js` contains Jest contracts; `tests/e2e/` contains Playwright
  engine and journey checks.
- `scripts/validate-growth.mjs` inspects built output for canonical, privacy,
  and source-map regressions.
- `.github/workflows/` owns pull-request verification and the daily production
  smoke.

Vercel routing and the Vite build contract live in `vercel.json`. The explicit
`dist/` output is required because the provider was previously configured as a
generic static project. Vite injects a `build-revision` meta tag from
`VERCEL_GIT_COMMIT_SHA`; production monitoring compares it with the expected
default-branch revision.

## Develop and verify

Use Node `^20.19.0`, `^22.13.0`, or `>=24.0.0`. Node 20.19.0 is the
minimum supported runtime; CI pins Node 22.13.0.

```bash
npm ci                    # install the locked dependency graph
npm run dev               # start the Vite development server
npm run verify:fast       # Jest, production build, and built-output validation
npm run verify:release    # complete local publication gate used by CI
npm run test:coverage     # active source coverage
npm run lint              # repository ESLint checks
npm run test:e2e          # desktop and 390px Playwright journeys
npm run build             # write the production site to dist/
npm run lighthouse:ci     # audit the built root experience on port 4175
npm audit --omit=dev --audit-level=high # audit shipped dependencies
```

Run `npm run build` before `npm run lighthouse:ci`. Browser failures retain
traces and screenshots; Lighthouse writes local reports to `.lighthouseci/`.
See [docs/PRODUCTION_RUNBOOK.md](docs/PRODUCTION_RUNBOOK.md) for production
proof, alerts, provider checks, rollback, and Search Console.

## Privacy and telemetry

Telemetry fails closed. GTM-managed aggregate GA4 and scrubbed Sentry are the
only approved providers. The shared GTM container must retain hostname
exceptions for this site; repository code alone cannot suppress portfolio tags.
GTM container version 18 adds a wildcard custom-event hostname exception to
PostHog while retaining the page-view exception used by Clarity. Production GTM
was re-enabled only after the compiled container and a live network trace proved
GA4 traffic with zero PostHog, Clarity, RB2B, or Lemlist requests.
The runtime emits one canonical `page_view` and allowlisted `cta_clicked`
events; it excludes query strings, calculator inputs, DOM text, identities,
replay, advertising, and email addresses. A research-pack email goes only to
the same-origin server route, then through the signed Signals lead receiver. It
never enters telemetry. A browser success state requires a matching durable
receipt from Signals.
Provider variables are documented in
`.env.example`. The page view is queued immediately, while the analytics
provider starts only after click or keyboard engagement, or 60 seconds after
load. Keep that boundary: immediate third-party execution materially degrades
the production interaction budget without improving the event contract.

## Research contributions

Keep each external claim attached to a source and distinguish causal evidence
from association. A model change must preserve or deliberately update the exact
scenario fixtures in `tests/fixtures/` and the engine characterization test.
Paper findings and calculator inputs are not interchangeable. Keep the reported
finding visible, document the mapping in `valueBasis`, and expose only
`modelValue` entries inside the parameter's stated slider range. The range
curves illustrate the editable range; they are not probability distributions.
Keep selected primary-source citations and the Subconscious publisher
relationship visible in static HTML. Search and answer engines may never open
the interactive source dialog. Matching JSON-LD can describe visible
provenance; it cannot replace it. The baseline source ledger contains one
described primary path for each of the nine inputs. Its source buttons use the
consented research-pack gate while JSON-LD retains citation URLs for discovery.
The interactive evidence receipt explains the selected study's reported
finding, mapped value, current value, and effect on the total.
Open a pull request with the changed source, model rationale, and validation
output.

The project is licensed under Apache 2.0. Questions and corrections belong in
[GitHub Issues](https://github.com/aviyashchin/suffering.social/issues).
