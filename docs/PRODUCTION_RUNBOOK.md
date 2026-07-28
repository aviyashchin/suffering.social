# Production Runbook

## Ownership and alerts

Avi Yashchin and Subconscious web operations own this site. GitHub Actions runs
the production smoke every day and on manual dispatch. A failed workflow plus
repository notifications is the alert path. Treat a stale build revision,
failed browser journey, missing report, or threshold breach as a production
failure.

## Local release gate

Use Node 22 or newer. Port `4175` is reserved for this repository's Lighthouse
preview; do not reuse or stop services on other ports.

```bash
npm ci
npm run test:coverage -- --runInBand
npm run lint
npm run build
npm run validate:growth
npm run test:e2e
npm run lighthouse:ci
npm audit --audit-level=high
git diff --check
```

Keep `.lighthouseci/` as release evidence. Do not lower a threshold to clear a
failure: Performance must be at least 0.90, Accessibility and Best Practices
1.00, SEO 0.98, CLS at most 0.02, and TBT below 100 ms.

## Production proof

After the default-branch deployment is ready:

1. Confirm `/`, `/calculator`, `/privacy`, `/robots.txt`, `/sitemap.xml`, and
   `/llms.txt` return `200` with the canonical host.
2. Confirm both `facethecost.com` hosts permanently preserve the requested path
   when redirecting to `https://www.suffering.social`.
3. Read `/calculator`'s `build-revision` meta tag and compare it exactly with
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

For a controlled Sentry canary, open production in an isolated browser and run
this once:

```js
setTimeout(() => {
  throw new Error('suffering-social-controlled-canary');
}, 0);
```

Read the event back in Sentry. Confirm its release and environment, one
redacted error, a query-free canonical URL, and no user, cookie, body, extras,
calculator state, tracing, or replay data. Resolve the canary after
verification.

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

## Rollback

Redeploy the last known-good Vercel deployment. If telemetry caused the fault,
disable the affected `VITE_*_ENABLED` variable; use
`VITE_TELEMETRY_ENABLED=false` to stop both approved providers. Re-run the
production revision, browser, and Lighthouse checks. Record the failed and
restored revisions plus UTC times in the tracking issue.
