# Growth and Observability Operations

## Permanent policy

`suffering.social` is a sensitive-topic research site. RB2B, Vector, Leadsy, advertising tags, session replay, autocapture, and person-level identification are prohibited. The site has no lead form, CRM route, newsletter signup, or email automation. Keep `VITE_TELEMETRY_ENABLED=false` unless a provider is being deliberately promoted.

## Preview rollout

Enable and verify one provider at a time in Vercel Preview:

1. Sentry: set the browser DSN plus server-only upload credentials. Trigger one controlled error. Confirm its stack is symbolicated, release/environment are correct, and the event contains no user, query, cookies, headers, or request body. Confirm `dist` contains no `.map` files.
2. GA4: enable GA4 and confirm one `page_view` per route. Advertising signals must remain disabled. Do not enable cross-domain measurement without a documented journey that requires it.
3. PostHog: confirm one matching `page_view`; autocapture, replay, exception capture, performance capture, flags, and anonymous profiles must remain off. Inspect the raw payload before promotion.
4. GTM: audit the published container, then enable it. Confirm consent defaults precede the container and all advertising categories remain denied. The container must emit no identity-vendor requests.

Promote each verified variable independently to Production. Roll back a provider by disabling its `VITE_*_ENABLED` flag; disable `VITE_TELEMETRY_ENABLED` to stop all four.

## Evidence gate

Run `npm run verify:fast`, then test all four canonical routes in a normal browser and with Global Privacy Control enabled. Record the network requests and a Lighthouse report. Required thresholds: Performance ≥90, SEO ≥98, Accessibility and Best Practices 100, CLS ≤0.02, TBT <100 ms, and LCP no more than 300 ms slower than the pre-rollout baseline.

Expected normal-browser state: one GA4 initialization, one GTM container, one PostHog initialization, one canonical page view per route, zero RB2B/Vector/Leadsy requests, and no replay/autocapture traffic.

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
