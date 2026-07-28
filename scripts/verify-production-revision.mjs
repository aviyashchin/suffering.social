/* global process */
import { mkdirSync, writeFileSync } from 'node:fs';
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
  if (observedRevision !== expectedRevision) {
    throw new Error(
      `Production revision ${observedRevision} does not match expected ${expectedRevision}.`
    );
  }

  const checkedAt = new Date().toISOString();
  mkdirSync('artifacts', { recursive: true });
  writeFileSync(
    'artifacts/production-proof.txt',
    [
      `checked_at_utc=${checkedAt}`,
      `url=${productionUrl}`,
      `expected_revision=${expectedRevision}`,
      `observed_revision=${observedRevision}`,
      '',
    ].join('\n')
  );
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
