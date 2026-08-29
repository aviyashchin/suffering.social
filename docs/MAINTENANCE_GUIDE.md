# Maintenance Guide

## Change research assumptions

The calculator interface and research catalogue remain embedded in
`index.html`; page-independent defaults, scenarios, slider ranges, and formulas
live in `src/calculator-model.js`.
`calculator.html` is only the no-index compatibility document for the permanent
`/calculator` redirect. Do not restore active behavior there.
Before changing a parameter ID, default, formula, or scenario:

1. Update the relevant citation and explain whether the evidence is causal or
   associative.
2. Change the value in `src/calculator-model.js` and the matching expected values in
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
Rows are ordered by mapped model value, from low to high. A selected row remains
the research anchor when its slider moves and changes its state to `adjusted`.
Selecting another row replaces that anchor.

Each curve also renders an evidence receipt from `src/range-curves.js`. Keep the
five questions intact: evidence role, study finding, mapped value, current
selection, and effect on the total. The static `#source-ledger` and JSON-LD
citations expose one baseline source per input to systems that never run the
calculator JavaScript.

## Change presentation

Use semantic markup in `index.html` or `calculator.html` and extend the existing
files in `src/styles/`. Preserve one H1, visible focus, 44px interactive targets,
390px layout without horizontal overflow, and reduced-motion behavior. Do not
add remote CSS, Tailwind Play CDN, a second design framework, or inline provider
snippets.

This public vanilla repository consumes the design-system contract vocabulary
through `src/styles/site-tokens.css`. Do not add React islands or Kokonut Pro
source. The Pro form controls duplicate the design-system's native input policy,
and public source redistribution creates a license risk. The current noUiSlider
runtime remains intentional because the duration control has one 0.05 step
followed by 0.1 steps. A native range cannot express that scale without a new
mapping layer. Its visible treatment follows the design-system's sharp range
control while retaining the existing keyboard and 44px target behavior.

The curves are illustrative range guides, not probability distributions. Their
shape and marker must move with the slider. The header clock keeps mortality,
mental-health, and economic components visible with their sum. It advances the
model display while the page is open, but does not publish a per-second rate.
Keep the page's explicit statement that it is a model display, not a live
measurement. Each assumption-group header stays below the masthead so its live
formula remains visible while the user tests studies in that section.

Slider `update` events recalculate the model before release. Live numeric text
uses the vanilla adapter in `src/animated-number-text.js`, which follows the
design system's compact directional transition and reduced-motion contract.
Use it for derived values and formulas. Keep static research findings still.

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

Run `npm ci` and `npm run verify:release` before publishing. Do not reuse or stop
an unknown preview process; Playwright uses port 4174 and Lighthouse uses 4175.
After merge, prove the exact deployed revision, canonical routes and redirects,
browser journey, Lighthouse report, Sentry symbolication, and scheduled-smoke
alert path. A green local build is not production proof.
