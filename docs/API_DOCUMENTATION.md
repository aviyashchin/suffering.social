# Runtime Boundary Reference

This static site has no public application API. The supported internal
boundaries are intentionally small.

## Calculator

The legacy calculation engine and its DOM contract live in `calculator.html`.
Treat parameter IDs, scenario keys, output IDs, source triggers, and the
calculation entrypoint as a versioned interface. The authoritative examples are
`tests/fixtures/calculator-engine-baseline.json` and
`tests/e2e/calculator-engine.spec.js`.

`src/calculator-bootstrap.js` imports the local
`src/d3-distribution-sliders.js` visualization module. There is no
`src/components/Calculator.js`, `src/utils/constants.js`, or reusable
`Calculator` class.

## Telemetry

`src/telemetry.js` is the only page entrypoint. It builds an explicitly
allowlisted environment projection, initializes aggregate GTM and scrubbed
Sentry when enabled, and exposes the bounded
`window.__sufferingTelemetry.capture(name, properties)` hook.

Supported events:

- `page_view`, emitted once per route.
- `cta_clicked`, limited to the CTA vocabulary documented in
  `PRODUCTION_RUNBOOK.md`.

All locations and referrers are reduced to query-free HTTPS origin plus
pathname. Unknown events, unknown CTA IDs, identities, DOM text, calculator
state, and arbitrary properties are discarded.

## Build metadata

`vite.config.js` compiles `VERCEL_GIT_COMMIT_SHA` and `VERCEL_ENV` into
non-secret constants consumed by `src/runtime-build-info.js`. It also injects
the release into a `<meta name="build-revision">` tag. No other server
environment variable may be projected into the browser.

`scripts/validate-growth.mjs` validates the built HTML and source-map boundary;
`scripts/verify-production-revision.mjs` compares the served revision with the
expected default-branch SHA.
