# Satellite Hardening Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enforce repository gates, consolidate duplicate hosts, minimize public configuration, and make privacy and contributor guidance accurate.

**Architecture:** Keep the site static. Add configuration-level enforcement and one small telemetry configuration boundary; use existing Jest contract tests for behavior.

**Tech Stack:** Vite, Jest, Vercel configuration, GitHub Actions

---

### Task 1: Encode the hardening contract

**Files:**
- Modify: `src/growth-contract.test.js`
- Modify: `src/telemetry-core.test.js`
- Modify: `src/telemetry.js`
- Modify: `src/telemetry-core.js`
- Modify: `vercel.json`

- [x] Add failing tests for two host-conditioned, permanent, path-preserving
  facethecost redirects and an explicit telemetry environment projection.
- [x] Run focused tests and confirm the expected failures.
- [x] Implement the smallest redirect and projection changes.
- [x] Run focused tests and confirm they pass.

### Task 2: Add durable enforcement and guidance

**Files:**
- Create: `.github/workflows/verify.yml`
- Modify: `privacy.html`
- Create: `AGENTS.md`

- [x] Add the bounded Node CI workflow.
- [x] Make provider language conditional on enablement.
- [x] Commit the corrected contributor guide.

### Task 3: Verify and publish

- [x] Run `npm run verify:fast`, `npm run lint`, and `npm audit --omit=dev`.
- [x] Inspect the diff and commit only intended files.
- [x] Push `agent/satellite-hardening` and open a draft PR to `main`.
- [x] Verify GitHub Actions and Vercel checks.
- [ ] Record that live facethecost redirect verification remains pending until
  the PR is merged and deployed.

### Task 4: Complete external operations

- [ ] Submit `https://www.suffering.social/sitemap.xml` to the
  `sc-domain:suffering.social` Search Console property.
- [x] Record a 2026-04-20 through 2026-07-19 query baseline with clicks,
  impressions, CTR, and position in `docs/GROWTH_OPERATIONS.md`, or record the
  exact no-data/API-access state there.
- [x] Verify `robots.txt`, `sitemap.xml`, and `llms.txt` publicly.
- [x] Inspect `_dmarc`, SPF, DKIM, MX, and the actual forwarding/sending-provider
  state. Publish exactly one `p=none` DMARC TXT record only after validating its
  aggregate-report mailbox; then read it back from both authoritative and public
  DNS.
- [x] Record the exact blocker for a Lemlist tracking CNAME if the account value is unavailable.
