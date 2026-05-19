#!/usr/bin/env bash
# Sync the vendored Subconscious design-system contract.
#
# suffering.social is a static site (no bundler), so it cannot consume
# @subconscious-ai/kit from npm — a bare module import has nothing to
# resolve it. The design-system's prescribed path for non-bundled
# consumers is to COPY contract.css. This script re-pulls it from a
# pinned design-system ref via the GitHub API (uses your `gh` auth, so
# it works whether the repo is public or private).
#
# To adopt a newer kit release: bump REF, run this, review the diff,
# and re-run scripts/remap-tokens.mjs if any token names changed.
set -euo pipefail

REF="kit-v0.6.0"
REPO="Subconscious-ai/design-system"
DEST="src/styles/contract.css"

cd "$(dirname "$0")/.."

tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT

gh api "repos/${REPO}/contents/contract.css?ref=${REF}" --jq '.content' \
  | base64 --decode > "$tmp"

if cmp -s "$tmp" "$DEST"; then
  echo "contract.css already up to date with ${REPO}@${REF}"
else
  cp "$tmp" "$DEST"
  echo "contract.css updated from ${REPO}@${REF}"
  echo "→ review the diff; re-run scripts/remap-tokens.mjs if token names changed."
fi
