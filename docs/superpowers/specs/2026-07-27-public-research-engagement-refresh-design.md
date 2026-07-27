# Public Research Engagement Refresh

## Outcome

Make `/calculator` the primary research experience and retain `/` as a concise supporting explainer. The site should help informed non-specialists test assumptions, inspect evidence, share a scenario, and understand the limits of the estimate. It must not collect leads or identify visitors.

## Route roles

`/calculator` becomes the main product surface. Its metadata, navigation, hierarchy, and structured data describe the interactive social-cost calculator. The route keeps its self-canonical URL.

`/` remains indexable and self-canonical as a support page. It explains the 2011–2012 mental-health inflection, introduces the causal question, and sends readers to the calculator. It does not redirect, duplicate the calculator, or compete for the calculator's primary query.

Legacy `/v5` remains available but is demoted from primary navigation.

## Calculator design

Use an editorial, evidence-first direction for informed non-specialists:

- Replace the current dashboard-like hero with a compact masthead, direct question, current estimate, uncertainty statement, and one prompt to adjust assumptions.
- Keep the existing calculation engine, element IDs, parameter definitions, citations, and source-backed defaults unless a regression test proves a correction is needed.
- Remove emoji-heavy labels, repeated scenario controls, decorative “live” activity, redundant metric cards, and debug-oriented copy from the primary journey.
- Present scenarios as a restrained comparison control. “Research baseline” is the default; optimistic and upper-bound cases must read as assumptions rather than findings.
- Group assumptions by mortality, mental health, and economic effects. Each group exposes its current value, plain-language meaning, source, and range without hiding the control.
- Keep methodology, citations, limitations, and open-source information below the calculator in a clear reading order.
- Make share actions specific: copy this scenario, share the calculator, inspect sources, and read the related Subconscious research.
- Use repository-owned CSS and design tokens. Remove malformed declarations and prevent horizontal overflow at 390px. Avoid runtime Tailwind if it can be removed without rewriting the calculation engine.

The support page keeps its existing editorial strength, shortens secondary material where needed, and makes “Explore the calculator” the dominant action.

## Measurement and privacy

GTM may load once and route aggregate events to GA4. Remove the direct Lemlist visitor tracker and disable Lemlist and Clarity tags for this hostname in GTM. Do not enable RB2B, Vector, Leadsy, advertising tags, session replay, PostHog autocapture, or person profiles.

Use the existing normalized telemetry boundary. Measure only:

- `page_view`
- `cta_clicked` for calculator entry, scenario copy/share, source inspection, and related-research exit

Do not capture slider values, scenario parameters, page text, query strings, email addresses, cookies, or arbitrary DOM events. Update the privacy page to match live behavior.

Sentry may record scrubbed browser failures with release and environment data. It must not send default PII, replay, request bodies, cookies, query strings, or calculator inputs.

## Reliability and discovery

Add a committed Playwright smoke journey for desktop and 390px mobile:

1. Load `/` and open the primary calculator CTA.
2. Confirm `/calculator` renders the estimate and all assumption controls.
3. Apply one named scenario and confirm the displayed estimate changes.
4. Copy a scenario and open a source or methodology surface.
5. Assert no horizontal overflow and no browser errors.
6. Assert no Lemlist, RB2B, Vector, Leadsy, or replay requests.

CI runs unit/contracts, build, growth validation, lint, dependency audit, and the bounded smoke journey. Fix the Jest coverage paths so coverage measures the active `src/` modules.

Merge the existing host redirect and explicit environment projection work from draft PR #31. Submit `https://www.suffering.social/sitemap.xml` to the verified Search Console property and record the dated baseline: 179 impressions, 3 clicks, 1.7% CTR, average position 8 over the three months ending July 24, 2026; two pages indexed and three excluded as redirects or canonical alternatives.

## Success and stop point

The launch is successful when production proves:

- `/calculator` is the clear primary experience and works at 390px.
- `/` supports rather than duplicates the calculator.
- the Playwright journey passes in CI and production.
- GTM and aggregate GA4 load once, while prohibited vendors make zero requests.
- a controlled Sentry error is symbolicated and scrubbed.
- Search Console reports the submitted sitemap.

This change does not add a form, newsletter, outbound email, CRM route, content program, or new analytics abstraction.
