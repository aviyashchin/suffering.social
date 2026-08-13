# Production Runbook

## Ownership and alerts

Avi Yashchin and Subconscious web operations own this site. GitHub Actions runs
the production smoke every day and on manual dispatch. A failed workflow plus
repository notifications is the alert path. Treat a stale build revision,
failed browser journey, missing report, or threshold breach as a production
failure.

## Local release gate

Use Node `^20.19.0`, `^22.13.0`, or `>=24.0.0`; CI pins Node 22.13.0. Port
`4175` is reserved for this repository's Lighthouse preview; do not reuse or
stop services on other ports.

```bash
npm ci
npm run test:coverage -- --runInBand
npm run lint
npm run build
npm run validate:growth
npm run test:e2e
npm run lighthouse:ci
npm audit --omit=dev --audit-level=high
git diff --check
```

Keep `.lighthouseci/` as release evidence. Do not lower a threshold to clear a
failure: Performance must be at least 0.90, Accessibility and Best Practices
1.00, SEO 0.98, CLS at most 0.02, and TBT below 100 ms.
Both local and production configs collect three runs so Lighthouse CI can
mitigate natural runner variance; a single overloaded sample is not a reason to
weaken the launch thresholds.

## Production proof

After the default-branch deployment is ready:

1. Confirm `/`, `/privacy`, `/robots.txt`, `/sitemap.xml`, and `/llms.txt`
   return `200` with the canonical host, and `/calculator` permanently redirects
   to `/`.
2. Confirm both `facethecost.com` hosts permanently preserve the requested path
   when redirecting to `https://www.suffering.social`.
3. Read `/`'s `build-revision` meta tag and compare it exactly with
   the default-branch merge SHA.
4. Run the bounded browser journey:

   ```bash
   PLAYWRIGHT_BASE_URL=https://www.suffering.social npm run test:e2e -- tests/e2e/research-journey.spec.js
   ```

5. Run `npm run lighthouse:production` and retain
   `.lighthouseci-production/`.

The `Production smoke` workflow performs steps 3–5 and uploads the UTC check,
revision, traces, screenshots, and Lighthouse reports.

## Provider checks

In GTM container `GTM-WXSLXHDB`, verify the `suffering.social` and
`www.suffering.social` host exclusions after every publication. Lemlist,
Clarity, PostHog, identity, replay, advertising, User-ID, Google Signals,
cross-domain measurement, and automatic GA page views must remain off. Confirm
all four Google consent categories default to `denied` before GTM loads.

Current provider baseline (2026-07-28):

- Vercel project: `aviyashchins-projects/v0-suffering-social`. Production owns
  both approved provider settings; Preview owns Sentry only. Environment values
  must not contain a trailing newline: `true\n` fails the strict runtime flag
  check while still appearing configured in the provider dashboard.
- GTM container version 18, `Suffering.social custom-event privacy exclusion`,
  is live. Trigger 30 matches every custom event plus the two canonical hosts
  and is an exception on PostHog tag 23. The existing page-view host exception
  remains on Clarity. The compiled rule blocks PostHog on matching custom
  events; production is enabled and has been traced with GTM, GA4, and Sentry
  only. RB2B remains scoped to `subconscious.ai`; no Lemlist tag exists.
- Sentry project: `subconsciousai/suffering-social`. Browser DSN and source-map
  upload credentials are projected through Vercel; credentials never belong in
  `VITE_*` variables. Project data scrubbing and IP scrubbing are enabled.

These facts are a configuration baseline, not ongoing proof. Re-read the
published container, deployed environment names, and Sentry event before each
release claim.

For a controlled Sentry canary, use a one-off Playwright session against
production. Listen for the single Sentry envelope request so its `event_id` can
be recorded, then schedule this bounded fault:

```js
setTimeout(() => {
  const dataLayer = window.dataLayer;
  window.dataLayer = {};
  try {
    window.__sufferingTelemetry.capture('page_view');
  } finally {
    window.dataLayer = dataLayer;
  }
}, 0);
```

The thrown `dataLayer.push` fault originates inside the compiled
`src/telemetry-runtime.js` handler, while the `finally` block restores the page
immediately. Read the captured `event_id` back in Sentry. Confirm its release
and environment, one
redacted error, a query-free canonical URL, no derived geography, and no real
user, cookie, body, extras, calculator state, tracing, or replay data. Require
source-map symbolication:
the stack must resolve to the readable `src/telemetry-runtime.js` source file and
line tied to the deployed release, not an anonymous console callback or a
minified bundle location. Resolve the canary after verification.

## Event vocabulary

- `page_view`: once per route, with `site_key`, environment, canonical host,
  pathname, query-free location, and query-free referrer.
- `cta_clicked`: the same fields plus one of `calculator_open`,
  `scenario_copy`, `scenario_share`, `source_inspect`, or `research_exit`.

No event may contain a scenario value, slider value, email, cookie, arbitrary
page text, URL query, or hash.

## Monitoring drill

Manually dispatch `Production smoke` with `force_failure=true`. All real checks
run first; the final bounded step must fail and trigger the repository
notification. Confirm receipt, then dispatch with `force_failure=false` and
require a green run. Never create a failing source commit for this drill.

## Search Console

Submit `https://www.suffering.social/sitemap.xml` in the domain property and
read back a successful status. Record the date range, clicks, impressions, CTR,
average position, indexed/excluded counts, and baseline query rows in the
tracking issue. A submitted sitemap is discovery evidence, not an indexing
promise.

Search Console accepted the sitemap on 2026-07-28 and read it successfully with
four discovered pages. The live three-month report for 2026-04-27 through
2026-07-26 showed 3 clicks, 175 impressions, 1.7% CTR, and average position 8.1.
The only visible query rows were `social impact calculator` and
`social calculator`, each with one impression and no clicks. The earlier
pre-release indexing snapshot was 2 indexed and 3 excluded pages. Treat every
number as a dated baseline, not a ranking or indexing promise.

## Rollback

Redeploy the last known-good Vercel deployment. If telemetry caused the fault,
disable the affected `VITE_*_ENABLED` variable; use
`VITE_TELEMETRY_ENABLED=false` to stop both approved providers. Re-run the
production revision, browser, and Lighthouse checks. Record the failed and
restored revisions plus UTC times in the tracking issue.
