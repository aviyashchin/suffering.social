# Growth and Observability Operations

## Permanent policy

`suffering.social` is a sensitive-topic public research site. Person-level identification, lead capture, advertising tags, session replay, autocapture, and calculator-state collection are prohibited. GTM-managed GA4 and scrubbed Sentry are the only approved providers. Keep `VITE_TELEMETRY_ENABLED=false` unless a provider is being deliberately promoted.

## Preview rollout

Enable and verify one provider at a time in Vercel Preview:

1. Sentry: set the browser DSN plus server-only upload credentials. Trigger one controlled error. Confirm its stack is symbolicated, release/environment are correct, and the event contains no user, tags, extras, custom context, query, cookies, headers, request body, calculator state, or replay identifier. Confirm tracing and replay rates are zero and `dist` contains no `.map` files.
2. GTM: audit the published container, then enable it. Confirm consent defaults precede the container and `analytics_storage`, `ad_storage`, `ad_user_data`, and `ad_personalization` all remain denied. GA4 must disable automatic page views, Google Signals, User-ID, ads, and cross-domain measurement. The container must emit no identity or replay vendor requests.

Promote each verified variable independently to Production. Roll back a provider by disabling its `VITE_*_ENABLED` flag; disable `VITE_TELEMETRY_ENABLED` to stop both.

## Evidence gate

Run `npm run verify:fast`, then test all four canonical routes in a normal browser and with Global Privacy Control enabled. Record the network requests and a Lighthouse report. Required thresholds: Performance ≥90, SEO ≥98, Accessibility and Best Practices 100, CLS ≤0.02, TBT <100 ms, and LCP no more than 300 ms slower than the pre-rollout baseline.

Expected normal-browser state: one GTM container, one GTM-managed GA4 configuration, one canonical `page_view` per route, approved `cta_clicked` events only, zero Lemlist/Clarity/PostHog/RB2B/Vector/Leadsy requests, and no replay, identity, direct-GA, or autocapture traffic. Query strings, URL hashes, destinations, DOM text, and calculator state must be absent from event payloads.

The portfolio GTM container must exclude `www.suffering.social` and `suffering.social` from Lemlist, Clarity, PostHog, identity, replay, advertising, and cross-domain tags. Verify those exclusions after every container publication.

## Search baseline

Submit `https://www.suffering.social/sitemap.xml` to the existing Search Console domain property. Record impressions, clicks, indexed canonical URL, and result type for these query families before creating new content:

- social media economic cost
- cost of social media mental health
- teen depression increase since 2012
- social media adolescent depression evidence
- smartphone adoption teen mental health
- social media causal evidence mental health
- Facebook deactivation well-being experiment
- value of statistical life social media
- QALY cost of teen depression
- social media externalities calculator

`llms.txt` is supporting documentation, not a Google ranking control. Prioritize crawlability, canonical consistency, visible primary evidence, and page experience.

## Deferred email readiness

DNS currently supports forwarding, not an authenticated sending program. Before any future email workflow, separately approve a sending domain/provider, configure DKIM and DMARC, define consent and unsubscribe handling, and test deliverability. This rollout makes no DNS changes and sends no email.
