/* global process */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

export function extractBuildRevision(html) {
  const tag = html
    .match(/<meta\b[^>]*>/gi)
    ?.find((candidate) =>
      /\bname\s*=\s*["']build-revision["']/i.test(candidate)
    );
  const match = tag?.match(/\bcontent\s*=\s*["']([^"']+)["']/i);
  if (!match?.[1]) {
    throw new Error('Production response has no build-revision metadata.');
  }
  return match[1];
}

export function verifyRevision({
  expectedRevision,
  observedRevision,
  productionUrl,
  checkedAt = new Date().toISOString(),
  proofPath = 'artifacts/production-proof.txt',
}) {
  const status = observedRevision === expectedRevision ? 'pass' : 'fail';
  mkdirSync(dirname(proofPath), { recursive: true });
  writeFileSync(
    proofPath,
    [
      `checked_at_utc=${checkedAt}`,
      `url=${productionUrl}`,
      `status=${status}`,
      `expected_revision=${expectedRevision}`,
      `observed_revision=${observedRevision}`,
      '',
    ].join('\n')
  );

  if (status === 'fail') {
    throw new Error(
      `Production revision ${observedRevision} does not match expected ${expectedRevision}.`
    );
  }
}

async function main() {
  const expectedRevision = process.env.EXPECTED_REVISION;
  const productionUrl =
    process.env.PRODUCTION_URL || 'https://www.suffering.social/calculator';

  if (!expectedRevision) {
    throw new Error('EXPECTED_REVISION is required.');
  }

  const response = await fetch(productionUrl, {
    headers: { 'user-agent': 'suffering-social-production-smoke' },
    redirect: 'follow',
  });
  if (!response.ok) {
    throw new Error(`Production returned HTTP ${response.status}.`);
  }

  const observedRevision = extractBuildRevision(await response.text());
  const checkedAt = new Date().toISOString();
  verifyRevision({
    expectedRevision,
    observedRevision,
    productionUrl,
    checkedAt,
  });
  process.stdout.write(
    `Verified production revision ${observedRevision} at ${checkedAt}\n`
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await main();
}
