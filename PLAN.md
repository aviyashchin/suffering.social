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

After each merge, completion requires the served revision readback, production
Playwright and Lighthouse checks, a symbolicated Sentry canary, the monitoring
alert drill, and Search Console sitemap readback. Track that evidence on GitHub
issue #34; do not use this file as a second status board.
