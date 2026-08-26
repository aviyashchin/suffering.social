# Maintenance Guide

## Change research assumptions

The active calculation implementation remains embedded in `index.html`.
`calculator.html` is only the no-index compatibility document for the permanent
`/calculator` redirect. Do not restore active behavior there.
Before changing a parameter ID, default, formula, or scenario:

1. Update the relevant citation and explain whether the evidence is causal or
   associative.
2. Change the matching expected values in
   `tests/fixtures/calculator-engine-baseline.json`.
3. Run `npm run test:e2e -- tests/e2e/calculator-engine.spec.js`.
4. Run the full release gate in `PRODUCTION_RUNBOOK.md`.

A failing characterization test is a model change, not presentation noise.

Research cards are part of the calculator, not decoration. Each selectable
study needs a finite `modelValue` inside the slider range, a short label, and a
`valueBasis` explaining how the paper's finding maps to the model input. Some
legacy mappings fell outside today's declared ranges; do not silently revive
them. `src/range-curves.test.js` protects curve movement, while Playwright proves
that paper selection changes the slider and estimate. If the opening value does
not match one paper exactly, the interface selects a labeled starting-model row.
Do not mark the nearest paper as selected because that would misstate its role.

## Change presentation

Use semantic markup in `index.html` or `calculator.html` and extend the existing
files in `src/styles/`. Preserve one H1, visible focus, 44px interactive targets,
390px layout without horizontal overflow, and reduced-motion behavior. Do not
add remote CSS, Tailwind Play CDN, a second design framework, or inline provider
snippets.

The curves are illustrative range guides, not probability distributions. Their
shape and marker must move with the slider. The header clock keeps mortality,
mental-health, and economic components visible with their sum. It advances the
model display while the page is open, but does not publish a per-second rate.
Keep the page's explicit statement that it is a model display, not a live
measurement. Each assumption-group header stays below the masthead so its live
formula remains visible while the user tests studies in that section.

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
