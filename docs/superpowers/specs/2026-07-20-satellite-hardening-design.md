# Satellite Hardening Design

## Goal

Close the remaining operational gaps without expanding the analytics stack or
rewriting the legacy static site.

## Design

- Add one GitHub Actions workflow that installs the lockfile and runs the
  repository-owned verification, lint, and production dependency audit gates.
- Consolidate both `facethecost.com` hosts to `https://www.suffering.social`
  with permanent, path-preserving Vercel redirects before page rewrites.
- Replace the full `import.meta.env` handoff with an explicit telemetry-only
  object so Vercel deployment metadata is not compiled into the client bundle.
- Make the privacy provider language conditional and accurate while preserving
  the permanent prohibition on identity resolution, advertising, replay, and
  raw calculator-input collection.
- Commit the existing contributor guide after correcting its stale validation
  guidance.

Search Console and DNS are operational changes outside the code path. Submit
the existing sitemap and record the current query baseline. Publish a minimal
DMARC monitoring policy only after confirming the live DNS state. Do not invent
a Lemlist tracking CNAME; add it only from the exact account-specific value.

## Verification

Contract tests cover the redirect and explicit environment projection. The
full repository gate must pass locally and in GitHub Actions. After deployment,
both duplicate hosts must redirect and all canonical discovery files must
remain public and valid.
