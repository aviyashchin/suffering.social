# Maintenance Guide

## Change research assumptions

The active calculation implementation remains embedded in `calculator.html`.
Before changing a parameter ID, default, formula, or scenario:

1. Update the relevant citation and explain whether the evidence is causal or
   associative.
2. Change the matching expected values in
   `tests/fixtures/calculator-engine-baseline.json`.
3. Run `npm run test:e2e -- tests/e2e/calculator-engine.spec.js`.
4. Run the full release gate in `PRODUCTION_RUNBOOK.md`.

A failing characterization test is a model change, not presentation noise.

## Change presentation

Use semantic markup in `index.html` or `calculator.html` and extend the existing
files in `src/styles/`. Preserve one H1, visible focus, 44px interactive targets,
390px layout without horizontal overflow, and reduced-motion behavior. Do not
add remote CSS, Tailwind Play CDN, a second design framework, or inline provider
snippets.

## Change telemetry

Only `page_view` and allowlisted `cta_clicked` events may cross
`src/telemetry-runtime.js`. Add a focused test before changing the vocabulary.
Never include queries, hashes, scenario or slider values, text, identities,
cookies, destinations, or arbitrary attributes.

GTM configuration is shared infrastructure: code-level filtering does not
replace hostname exceptions in the published container. Preview deliberately
omits GTM because generated preview hosts are outside the production-host
exceptions. Follow the canary and readback steps in `PRODUCTION_RUNBOOK.md`.

## Release

Run `npm ci` and the complete local gate before publishing. Do not reuse or stop
an unknown preview process; Playwright uses port 4174 and Lighthouse uses 4175.
After merge, prove the exact deployed revision, canonical routes and redirects,
browser journey, Lighthouse report, Sentry symbolication, and scheduled-smoke
alert path. A green local build is not production proof.
