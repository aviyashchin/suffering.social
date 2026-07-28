# Architecture Guide

## Route ownership

Suffering.Social is a static, multi-page Vite application:

- `calculator.html` is the primary `/calculator` research experience and owns
  the legacy calculation engine embedded near the end of the document.
- `index.html` is the concise `/` evidence and method explainer.
- `privacy.html` owns `/privacy`.
- `social_media_cost_calculatorv5.html` remains buildable at the unlisted `/v5`
  route for reference; do not extend it as the active product.

Vite builds these entries to `dist/`. `vercel.json` explicitly selects Vite,
publishes `dist/`, owns clean routes, and preserves paths when redirecting the
two `facethecost.com` hosts.

## Active modules

- `src/calculator-bootstrap.js` loads the calculator's local noUiSlider runtime.
- `src/styles/` contains route tokens, layout, components, calculator, and
  mobile styles.
- `src/telemetry-core.js` normalizes aggregate-only configuration and payloads.
- `src/telemetry-runtime.js` dispatches the allowlisted events.
- `src/sentry-loader.js` initializes scrubbed error reporting.
- `src/runtime-build-info.js` exposes only release/environment strings compiled
  by Vite.

There is no component framework, D3 runtime, or public JavaScript API. Do not
follow old references to `src/components/`, `src/utils/`, or
`src/d3-distribution-sliders.js`; those paths do not represent the current
application.

## Proof boundaries

Jest contracts in `src/*.test.js` protect route roles, engine fixtures, privacy,
build output, and operations. Playwright verifies desktop, 390px mobile,
keyboard, privacy, and the preserved calculation engine. Lighthouse owns
performance/accessibility/SEO thresholds. GitHub Actions runs the same release
gate and a daily production smoke.

Repository success, CI success, deployment, and production verification are
separate facts. Production is proven only when the served `build-revision`
matches the default-branch SHA and the browser and Lighthouse checks pass. See
`PRODUCTION_RUNBOOK.md` for provider and rollback procedures.
