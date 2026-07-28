# Current Delivery Plan

The older design-system integration phases once recorded here are complete or
superseded. They described `/` as the calculator, remote Tailwind/design-system
assets, and source files that no longer exist.

The current product and release plan is:

- [Public Research Engagement Refresh](docs/superpowers/plans/2026-07-27-public-research-engagement-refresh.md)
- [Approved design](docs/superpowers/specs/2026-07-27-public-research-engagement-refresh-design.md)
- [Architecture guide](docs/MASTER_GUIDE.md)
- [Production runbook](docs/PRODUCTION_RUNBOOK.md)

Current route roles are `/calculator` for the primary research instrument, `/`
for the supporting explainer, `/privacy` for disclosure, and unlisted `/v5` for
legacy reference. Active pages use repository-owned Vite assets. Aggregate GTM
and scrubbed Sentry are the only approved providers.

The refresh closed on 2026-07-28 at production revision
`29acaab21ff8140f1a113100bbc8c0959b47ef04`. Served-revision readback,
production Playwright and Lighthouse, the symbolicated Sentry canary, monitoring
failure/recovery drill, GTM version 18 privacy fix, and successful Search
Console sitemap readback are recorded on GitHub issue #34. For future releases,
repeat those revision-specific gates rather than treating this closeout as
permanent provider proof.
