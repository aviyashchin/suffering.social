# Growth and Observability Operations

## Permanent policy

`suffering.social` is a sensitive-topic public research site. Person-level identification through telemetry, advertising tags, session replay, autocapture, and calculator-state collection are prohibited. GTM-managed GA4 and scrubbed Sentry are the only approved measurement providers. The optional research-update form is the only identity-bearing path: it requires explicit permission and sends an email address directly to the server-side contact route. The address must never enter analytics or error reports. Provider flags fail closed and may be enabled only after the evidence gate below passes.

## Preview rollout

Enable and verify one provider at a time in Vercel Preview:

1. Sentry: set the browser DSN plus server-only upload credentials. Trigger one controlled error. Confirm its stack is symbolicated, release/environment are correct, and the event contains no user, tags, extras, custom context, query, cookies, headers, request body, calculator state, or replay identifier. Confirm tracing and replay rates are zero and `dist` contains no `.map` files.
2. GTM: audit the published container, then enable it. Confirm consent defaults precede the container and `analytics_storage`, `ad_storage`, `ad_user_data`, and `ad_personalization` all remain denied. GA4 must disable automatic page views, Google Signals, User-ID, ads, and cross-domain measurement. The container must emit no identity or replay vendor requests.

Promote each verified variable independently to Production. Roll back a provider by disabling its `VITE_*_ENABLED` flag; disable `VITE_TELEMETRY_ENABLED` to stop both.

## Evidence gate

Run `npm run verify:fast`, then test all four canonical routes in a normal browser and with Global Privacy Control enabled. Record the network requests and a Lighthouse report. Required thresholds: Performance ≥90, SEO ≥98, Accessibility and Best Practices 100, CLS ≤0.02, TBT <100 ms, and LCP no more than 300 ms slower than the pre-rollout baseline.

Expected normal-browser state: one GTM container, one GTM-managed GA4 configuration, one canonical `page_view` per route, approved `cta_clicked` events only, zero Lemlist/Clarity/PostHog/RB2B/Vector/Leadsy requests, and no replay, identity, direct-GA, or autocapture traffic. Query strings, URL hashes, destinations, DOM text, and calculator state must be absent from event payloads.

The portfolio GTM container must exclude `www.suffering.social` and `suffering.social` from Lemlist, Clarity, PostHog, identity, replay, advertising, and cross-domain tags. Verify those exclusions after every container publication.

As of 2026-07-28, GTM container version 18 is live. Its new wildcard custom-event
exception combines the canonical-host regex with `.*` and blocks PostHog on the
same event that fires the tag. The existing page-view exception remains for
Clarity. Production GTM is enabled; a live trace proved GTM-managed GA4 and
scrubbed Sentry with zero PostHog, Clarity, RB2B, Lemlist, Vector, or Leadsy
requests. Preview still omits the production-host-only shared container.

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

The sitemap was submitted and read successfully on 2026-07-28 with four
discovered pages. The live three-month baseline ending 2026-07-26 was 3 clicks,
175 impressions, 1.7% CTR, and average position 8.1. Search Console exposed two
query rows: `social impact calculator` and `social calculator`, each with one
impression and no clicks.

## Deferred email readiness

The site now stores addresses submitted through the consent-based research-update form. It does not yet send an automated email. Before sending, separately approve a sending domain and provider, configure DKIM and DMARC, add one-click unsubscribe handling, and test deliverability. Until then, use the saved addresses only for the promised occasional research updates and honor removal requests sent to `privacy@subconscious.ai`.
