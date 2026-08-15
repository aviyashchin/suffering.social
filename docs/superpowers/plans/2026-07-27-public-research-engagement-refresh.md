# Public Research Engagement Refresh Implementation Plan

> **Historical execution plan (updated 2026-08-15):** The route roles below
> describe the original proposal, not current architecture. The calculator now
> lives at `/`, `/calculator` permanently redirects to it, and the 2012 evidence
> chapter closes the root experience. Use `README.md`, `AGENTS.md`, and
> `docs/MASTER_GUIDE.md` for current operation.

> **Execution rule:** Implement each task test-first. Keep `/calculator`'s calculation engine, parameter IDs, defaults, and citations intact while replacing its presentation and tightening its telemetry boundary.

**Goal:** Make `/calculator` the production-grade primary research experience, keep `/` as its supporting explainer, and prove the resulting site is private, observable, accessible, responsive, discoverable, and maintainable.

**Architecture:** Extend the existing multi-page Vite build, `src/telemetry-*` normalization boundary, Sentry scrubber, shared CSS token files, Jest contracts, and Vercel routing. Static HTML remains the application shell; the existing calculator engine remains authoritative. Playwright adds browser-level proof, while GitHub Actions owns pull-request and daily production checks.

**Boundaries:** No form, lead capture, CRM, email workflow, new analytics abstraction, framework migration, calculator-model rewrite, or unsupported causal claim. Lemlist, Clarity, replay, advertising, and person-level identification are prohibited.

**Execution status (2026-07-28):** Complete. PRs #35–#37 merged; feature
closeout was proven at production revision
`29acaab21ff8140f1a113100bbc8c0959b47ef04`. Repository, routing, discovery,
browser, Lighthouse, Sentry, and monitoring-drill evidence is recorded on issue
#34. GTM container version 18 adds the required Custom Event hostname exception
to PostHog; production traces show GA4 and Sentry with zero prohibited
providers. Search Console accepted and successfully read
`https://www.suffering.social/sitemap.xml`, discovering four pages. A later
docs-only closeout revision still requires its own served-revision readback.
The task checkboxes below preserve the original execution recipe rather than
serving as a live status board.

---

## Chunk 1: Lock the privacy, routing, and build contract

### Task 1: Replace the identification contract with an aggregate-only contract

**Files:**

- Modify: `src/growth-contract.test.js`
- Modify: `src/telemetry-core.test.js`
- Modify: `src/telemetry-runtime.test.js`
- Modify: `src/sentry-build-config.test.js`

- [ ] Change the active-page contract to require one shared `/src/telemetry.js` entrypoint and zero inline GTM, Lemlist, Clarity, RB2B, Vector, Leadsy, replay, or direct `gtag` snippets.
- [ ] Add a contract that active pages contain no runtime Tailwind CDN or remote design-system stylesheet.
- [ ] Add telemetry tests proving all four Google consent categories default to `denied`, GTM is the sole Google loader, and only one normalized `page_view` plus approved `cta_clicked` events can be pushed to `dataLayer`.
- [ ] Add tests proving page locations are reduced to HTTPS origin plus pathname, referrers are reduced to origin only, and query strings, hashes, scenario values, emails, cookies, arbitrary DOM text, and unknown CTA IDs cannot enter provider payloads.
- [ ] Add Sentry tests proving `release` and `environment` are configured while user data, cookies, query strings, request bodies, extras, calculator values, and replay are absent.
- [ ] Run `rtk proxy npm test -- --runInBand`; confirm the new tests fail for the expected legacy snippets, granted analytics storage, stale CTA vocabulary, and missing Sentry release.
- [ ] Commit the red tests:

```bash
rtk git add src/growth-contract.test.js src/telemetry-core.test.js src/telemetry-runtime.test.js src/sentry-build-config.test.js
rtk git commit -m "test: define private research telemetry contract"
```

### Task 2: Implement the aggregate-only telemetry boundary

**Files:**

- Modify: `src/telemetry-core.js`
- Modify: `src/telemetry-runtime.js`
- Modify: `src/telemetry.js`
- Add: `src/runtime-build-info.js`
- Modify: `src/sentry-loader.js`
- Modify: `vite.config.js`
- Modify: `index.html`
- Modify: `calculator.html`
- Modify: `privacy.html`
- Modify: `social_media_cost_calculatorv5.html`
- Modify: `docs/GROWTH_OPERATIONS.md`

- [ ] Replace `import.meta.env` projection with an explicit allowlist containing only the public Vite variables consumed by telemetry. Import `release` and `environment` separately from `src/runtime-build-info.js`.
- [ ] Set `analytics_storage`, `ad_storage`, `ad_user_data`, and `ad_personalization` to `denied` before the GTM loader is appended.
- [ ] Make GTM the sole Google loader. Remove the direct GA4 script/config path; push normalized `page_view` and `cta_clicked` objects to `dataLayer`, where the GTM container owns the GA4 tag.
- [ ] Keep GTM-managed GA automatic pageviews, Google Signals, advertising personalization, cross-domain linking, PostHog autocapture/replay/profiles, and Sentry PII/replay disabled.
- [ ] Sanitize canonical page location to HTTPS origin plus pathname and referrer to origin only before emitting the canonical page view.
- [ ] Restrict CTA IDs to calculator entry, scenario copy/share, source inspection, and related-research exit.
- [ ] Remove inline GTM and direct Lemlist from every active page. Retain only the shared module entrypoint.
- [ ] Configure Sentry with scrubbed `release` and `environment`; do not initialize tracing or replay. `vite.config.js` defines compile-time `__APP_RELEASE__` from server-only `VERCEL_GIT_COMMIT_SHA` and `__APP_ENVIRONMENT__` from `VERCEL_ENV`; `src/runtime-build-info.js` exports only those non-secret strings to the browser.
- [ ] Rewrite `privacy.html` and `docs/GROWTH_OPERATIONS.md` so wording exactly matches aggregate-only production behavior and records the GTM hostname exclusions for Lemlist and Clarity.
- [ ] Run the focused tests:

```bash
rtk proxy npm test -- --runInBand src/telemetry-core.test.js src/telemetry-runtime.test.js src/sentry-build-config.test.js src/growth-contract.test.js
```

- [ ] Commit:

```bash
rtk git add src vite.config.js index.html calculator.html privacy.html social_media_cost_calculatorv5.html docs/GROWTH_OPERATIONS.md
rtk git commit -m "feat: enforce aggregate-only site telemetry"
```

### Task 3: Add routing, environment, coverage, and browser foundations

**Files:**

- Modify: `src/growth-contract.test.js`
- Modify: `src/build-validator.test.js`
- Modify: `vite.config.js`
- Modify: `vercel.json`
- Modify: `package.json`
- Modify: `package-lock.json`
- Add: `playwright.config.js`

- [ ] Add failing assertions for `facethecost.com` and `www.facethecost.com` permanent redirects to the equivalent canonical `https://www.suffering.social/$1` path.
- [ ] Add a Vite contract that only explicitly named public telemetry variables reach client code.
- [ ] Add a small Vite `transformIndexHtml` plugin that injects `<meta name="build-revision">` from the same `VERCEL_GIT_COMMIT_SHA`; browser and production workflows read this generated metadata and compare it with the expected merge SHA.
- [ ] Change Jest coverage collection from stale `js/**/*.js` to the active `src/**/*.js`, excluding test files and browser-only visualization code that is not imported by the application boundary.
- [ ] Install `@playwright/test` with the existing npm lockfile and add a real `test:e2e` script.
- [ ] Configure `PLAYWRIGHT_BASE_URL` to default to local preview. Start `vite preview` only when the base URL is local; production runs must skip `webServer`.
- [ ] Run the routing/build tests red, implement redirects and explicit environment projection, then run:

```bash
rtk proxy npm test -- --runInBand
rtk proxy npm run test:coverage -- --runInBand
rtk proxy npm run lint
rtk proxy npm run build
rtk proxy npm run validate:growth
rtk proxy npm audit --audit-level=high
rtk proxy npx playwright install chromium
```

- [ ] Commit:

```bash
rtk git add src vite.config.js vercel.json package.json package-lock.json playwright.config.js
rtk git commit -m "test: add routing coverage and browser foundations"
```

## Chunk 2: Make the calculator the primary evidence surface

### Task 4: Define route-role and calculator-preservation tests

**Files:**

- Add: `src/content-contract.test.js`
- Add: `tests/e2e/calculator-engine.spec.js`
- Add: `tests/fixtures/calculator-engine-baseline.json`
- Modify: `src/build-validator.test.js`

- [ ] Before changing calculator markup, use the current page to capture the exact displayed total and component outputs for the research baseline and every named scenario in `tests/fixtures/calculator-engine-baseline.json`.
- [ ] Add an executable Playwright characterization test that loads each scenario and requires the exact numeric outputs in the fixture, alongside the parameter IDs, source-backed defaults, scenario keys, output IDs, citation triggers, and calculation entrypoint.
- [ ] Require `/calculator` self-canonical metadata, one H1, calculator-first title/description/schema, a visible estimate, uncertainty language, all assumption controls, sources, methodology, limitations, and named sharing/research actions.
- [ ] Require `/` self-canonical metadata, one H1, the 2011–2012 inflection explainer, one dominant “Explore the calculator” action, and no duplicate calculator controls.
- [ ] Require `/v5` to remain buildable but absent from primary navigation.
- [ ] Run the new engine characterization test against the unchanged calculator and require it to pass. Then run `rtk proxy npm test -- --runInBand src/content-contract.test.js`; confirm only the new route-role assertions fail.
- [ ] Commit the red tests:

```bash
rtk git add src/content-contract.test.js src/build-validator.test.js tests/e2e/calculator-engine.spec.js tests/fixtures/calculator-engine-baseline.json
rtk git commit -m "test: define evidence-first route roles"
```

### Task 5: Refresh the support page and calculator shell

**Files:**

- Modify: `.impeccable.md`
- Modify: `index.html`
- Modify: `calculator.html`
- Modify: `src/styles/site-tokens.css`
- Modify: `src/styles/base.css`
- Modify: `src/styles/components.css`
- Modify: `src/styles/calculator.css`
- Modify: `src/styles/mobile.css`

- [ ] Keep the approved editorial art direction: paper-like light surface, ink text, muted rules, one restrained red accent, typography-led hierarchy, and no gradients, glass, generic cards, or decorative metrics.
- [ ] Make `/` a concise support page: evidence-led 2011–2012 context, causal caveat, short method preview, dominant calculator CTA, sources, privacy, and Subconscious attribution.
- [ ] Restructure `/calculator` around a compact masthead, question, live estimate, uncertainty statement, one scenario comparison, three assumption groups, result interpretation, methodology, citations, limitations, and specific share/research exits.
- [ ] Preserve the engine script and every protected ID/default/scenario/citation contract. Hide or remove duplicate scenario controls, live activity, debt clocks, redundant output cards, emoji headings, export gimmicks, and debug-only UI from the primary journey.
- [ ] Remove Tailwind CDN and failed remote CSS; express all surviving utility-dependent presentation through repository-owned semantic classes.
- [ ] Repair malformed CSS declarations and set layout constraints that prevent any 390px overflow without clipping interactive content.
- [ ] Give each scenario and range control an accessible name, current value, visible focus state, and at least a 44px touch target.
- [ ] Add `data-telemetry-cta` only to the approved actions; never attach calculated or form state.
- [ ] Run:

```bash
rtk proxy npm test -- --runInBand src/content-contract.test.js src/growth-contract.test.js
rtk proxy npm run test:e2e -- tests/e2e/calculator-engine.spec.js
rtk proxy npm run build
rtk proxy npm run validate:growth
```

- [ ] Inspect built `dist/index.html` and `dist/calculator.html` for local CSS, correct canonicals, and preserved engine IDs.
- [ ] Commit:

```bash
rtk git add .impeccable.md index.html calculator.html src/styles
rtk git commit -m "feat: make calculator the primary research experience"
```

### Task 6: Remove production debug behavior without changing calculations

**Files:**

- Modify: `calculator.html`
- Modify: `src/d3-distribution-sliders.js`
- Modify: `src/content-contract.test.js`

- [ ] Add a failing contract that production calculator code exposes no `test*` debug helpers, simulated live-activity counters, or unconditional emoji-prefixed console logging.
- [ ] Delete debug harnesses and decorative timer initialization. Replace actionable load failures with bounded `console.error` or Sentry capture while keeping vendor failures non-blocking.
- [ ] Confirm the research baseline estimate and every named scenario still update the same protected outputs.
- [ ] Run the focused tests and build.
- [ ] Commit:

```bash
rtk git add calculator.html src/d3-distribution-sliders.js src/content-contract.test.js
rtk git commit -m "refactor: remove calculator debug surfaces"
```

## Chunk 3: Add browser senses and recurring memory

### Task 7: Add desktop, mobile, keyboard, privacy, and accessibility smoke tests

**Files:**

- Add: `tests/e2e/research-journey.spec.js`
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] Extend the existing Playwright configuration with desktop Chromium plus a 390px mobile project and retain traces/screenshots on failure.
- [ ] Test `/` → primary CTA → `/calculator` → named scenario changes estimate → copy scenario → inspect a source/methodology surface.
- [ ] Assert no horizontal overflow, page errors, failed first-party resources, duplicate GTM loads, or requests to Lemlist, Clarity, RB2B, Vector, Leadsy, replay, PostHog, or advertising endpoints.
- [ ] Start from a URL containing a query and scenario parameters; inspect all provider requests/data-layer events and prove none contain the query, hash, or scenario value.
- [ ] Run the mobile journey keyboard-only; assert semantic heading order, accessible names/current values, visible focus, operability, and no focus trap.
- [ ] Run `rtk proxy npm run test:e2e`; confirm it fails before any missing browser-specific fixes, make only those fixes, then rerun to green.
- [ ] Commit:

```bash
rtk git add playwright.config.js tests/e2e package.json package-lock.json
rtk git commit -m "test: add private research browser journey"
```

### Task 8: Add production smoke and Lighthouse gates

**Files:**

- Add: `.github/workflows/verify.yml`
- Add: `.github/workflows/production-smoke.yml`
- Add: `lighthouserc.json`
- Add: `lighthouserc.production.json`
- Add: `docs/PRODUCTION_RUNBOOK.md`
- Modify: `package.json`
- Modify: `README.md`

- [ ] Install `@lhci/cli` as a development dependency and add `lighthouse:ci` as `lhci autorun --config=lighthouserc.json`.
- [ ] Configure Lighthouse CI to start `npm run preview -- --host 127.0.0.1 --port 4173`, wait for the server, audit `http://127.0.0.1:4173/calculator`, assert Performance ≥0.90, Accessibility 1.0, Best Practices 1.0, SEO ≥0.98, CLS ≤0.02, and TBT <100ms, and retain `.lighthouseci/` as the report artifact.
- [ ] Add `lighthouse:production` as `lhci autorun --config=lighthouserc.production.json`. The production config starts no server, audits `https://www.suffering.social/calculator`, applies the identical assertions, and writes its filesystem upload/report to `.lighthouseci-production/`.
- [ ] Add a pull-request workflow that installs with `npm ci`, installs Chromium, and runs tests with coverage, lint, build, growth validation, dependency audit, the real bounded smoke suite, and Lighthouse CI.
- [ ] Add a daily and manually dispatchable production workflow that sets `PLAYWRIGHT_BASE_URL=https://www.suffering.social`, skips local `webServer`, runs the bounded journey, reads `<meta name="build-revision">` from the served calculator and compares it with the expected merge SHA, records that revision plus UTC timestamp, and uploads traces/reports.
- [ ] Give `workflow_dispatch` a boolean `force_failure` input defaulting to `false`. Commit a bounded step that exits non-zero only when this input is `true`; scheduled runs and ordinary dispatches always take the passing path.
- [ ] Name Avi Yashchin/Subconscious web operations as owner; document that failed Actions plus repository notifications are the alert route.
- [ ] Document local validation, provider checks, controlled Sentry canary, controlled monitoring-failure drill, Search Console verification, rollback, and the aggregate-only event vocabulary.
- [ ] Update the README architecture and contributor commands so later agents can locate route ownership, telemetry, tests, and production proof.
- [ ] Run a local production build, smoke, and Lighthouse report; a missing report is a failure.
- [ ] Commit:

```bash
rtk git add .github/workflows/verify.yml .github/workflows/production-smoke.yml lighthouserc.json lighthouserc.production.json docs/PRODUCTION_RUNBOOK.md README.md package.json package-lock.json
rtk git commit -m "ops: add recurring production research checks"
```

## Chunk 4: Provider, release, and discovery proof

### Task 9: Verify provider configuration and create the replacement PR

**Files:**

- Modify only if verification exposes a repository defect.

- [ ] Create or update the GitHub tracking issue with the spec, plan, acceptance criteria, and proof checklist.
- [ ] Using the authenticated Chrome session, open `tagmanager.google.com`, select container `GTM-WXSLXHDB`, inspect every tag and trigger, add hostname exceptions for `suffering.social` and `www.suffering.social` to Lemlist and Clarity, confirm advertising tags, User-ID, Signals, cross-domain linking, and GA auto pageviews are off, publish, and record the published container version in issue #34.
- [ ] If GTM, Vercel, Sentry, Search Console, or notification access blocks proof, create `blocked-human` if absent, comment on issue #34 with what was tried and the one required human action, label it, and continue with every unblocked task.
- [ ] Verify the required Vercel public telemetry and Sentry build variables exist by name without printing values.
- [ ] Run the entire local gate on the exact branch revision:

```bash
rtk proxy npm ci
rtk proxy npm run test:coverage -- --runInBand
rtk proxy npm run lint
rtk proxy npm run build
rtk proxy npm run validate:growth
rtk proxy npm run test:e2e
rtk proxy npm run lighthouse:ci
rtk proxy npm audit --audit-level=high
rtk git diff --check
```

- [ ] Request independent specification and code-quality reviews. Resolve findings with focused tests and commits.
- [ ] Push `feat/public-research-refresh`, create a non-draft PR that supersedes draft PR #31, link the issue/spec/plan, and include test, browser, privacy, visual, and rollback evidence.
- [ ] Wait for all required checks and review state to pass. Do not merge on stale or partial evidence.

### Task 10: Merge, deploy, and prove production

**Files:**

- Modify only if production proof exposes a repository defect.

- [ ] Merge the approved PR with repository-standard history, then verify the deployment is built from the merge SHA.
- [ ] Read back `<meta name="build-revision">` from production and require it to equal the merge SHA before browser proof; the value was injected by the Vercel build from `VERCEL_GIT_COMMIT_SHA`.
- [ ] Run the production Playwright journey with `PLAYWRIGHT_BASE_URL=https://www.suffering.social` at desktop and 390px. Save screenshots/traces proving route roles, calculator interaction, keyboard access, and no overflow.
- [ ] Run `rtk proxy npm run lighthouse:production` and save the production report with the same launch assertions used locally.
- [ ] Inspect production network and data layer: exactly one GTM load, one sanitized canonical page view, approved CTA events only, and zero requests to prohibited vendors.
- [ ] Run production Lighthouse and record all required thresholds.
- [ ] Trigger one production Sentry canary without a permanent code path: from a one-off Playwright page evaluation, schedule an unhandled `Error` containing a unique non-PII canary ID. Read back the event in Sentry and verify release, environment, symbolication, and absence of user/cookies/query/request body/calculator state.
- [ ] Dispatch `production-smoke.yml` once with `force_failure=true`, confirm the bounded Actions failure and owner notification, then dispatch the already-merged workflow with `force_failure=false` and require green. No source edit or temporary failing commit is used.
- [ ] Verify `robots.txt`, `sitemap.xml`, and `llms.txt` return 200 with canonical contents; verify duplicate hosts permanently redirect while preserving paths.

### Task 11: Submit discovery evidence and close vestigial work

**Files:**

- Modify: `docs/PRODUCTION_RUNBOOK.md` or the tracking issue with dated read-back evidence.

- [ ] Submit `https://www.suffering.social/sitemap.xml` in the verified Search Console domain property and read back the submitted/success state.
- [ ] Record the dated baseline: 179 impressions, 3 clicks, 1.7% CTR, average position 8 for the three months ending July 24, 2026; 2 indexed pages and 3 excluded pages. Record visible baseline queries without claiming indexing or ranking outcomes.
- [ ] Close draft PR #31 as superseded and link the merged replacement.
- [ ] Close the tracking issue only after production and Search Console acceptance criteria are evidenced. If any provider-only step is blocked, comment what was tried and the single human action needed, apply `blocked-human`, and leave that item parked without fabricating success.
- [ ] Remove the Herdr worktree after merge with `rtk herdr worktree remove --cwd /Users/aviyashchin/.herdr/worktrees/suffering.social/feat-public-research-refresh --json`; run `rtk proxy /Users/aviyashchin/bin/worktree-doctor` and report the final clean repository/worktree state.

## Final evidence

The closeout must distinguish:

- **Implemented:** files and merge SHA.
- **Validated:** unit, contract, coverage, lint, build, audit, Playwright, and Lighthouse results.
- **Merged:** PR URL and merge SHA.
- **Deployed:** Vercel deployment tied to that SHA.
- **Production verified:** route roles, browser journey, provider network, Sentry canary, monitoring drill, redirects, robots/sitemap/llms, and Search Console read-back.
