/* global process */
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), 'utf8');

describe('continuous verification contract', () => {
  test('production revision parser reads generated metadata and rejects missing metadata', async () => {
    const revision = await import(
      '../scripts/verify-production-revision.mjs'
    ).catch(() => ({}));

    expect(typeof revision.extractBuildRevision).toBe('function');
    expect(
      revision.extractBuildRevision(
        '<head><meta name="build-revision" content="merge-sha"></head>'
      )
    ).toBe('merge-sha');
    expect(() => revision.extractBuildRevision('<head></head>')).toThrow(
      'build-revision'
    );
  });

  test.each([
    ['matching', 'same-sha', 'same-sha', 'pass', false],
    ['mismatched', 'expected-sha', 'observed-sha', 'fail', true],
  ])(
    'writes a %s revision artifact before returning or throwing',
    async (
      _case,
      expectedRevision,
      observedRevision,
      expectedStatus,
      shouldThrow
    ) => {
      const revision = await import(
        '../scripts/verify-production-revision.mjs'
      );
      const directory = mkdtempSync(join(tmpdir(), 'suffering-proof-'));
      const proofPath = join(directory, 'production-proof.txt');
      const verify = () =>
        revision.verifyRevision({
          expectedRevision,
          observedRevision,
          productionUrl: 'https://www.suffering.social/calculator',
          checkedAt: '2026-07-28T03:00:00.000Z',
          proofPath,
        });

      try {
        if (shouldThrow) {
          expect(verify).toThrow(/does not match/);
        } else {
          expect(verify).not.toThrow();
        }

        expect(readFileSync(proofPath, 'utf8')).toBe(
          [
            'checked_at_utc=2026-07-28T03:00:00.000Z',
            'url=https://www.suffering.social/calculator',
            `status=${expectedStatus}`,
            `expected_revision=${expectedRevision}`,
            `observed_revision=${observedRevision}`,
            '',
          ].join('\n')
        );
      } finally {
        rmSync(directory, { recursive: true, force: true });
      }
    }
  );

  test('Playwright emits a non-opening HTML report that CI requires', () => {
    const config = read('playwright.config.js');
    expect(config).toMatch(
      /reporter:\s*\[[\s\S]*\['html',\s*\{\s*outputFolder:\s*'playwright-report',\s*open:\s*'never'\s*\}\]/
    );

    for (const path of [
      '.github/workflows/verify.yml',
      '.github/workflows/production-smoke.yml',
    ]) {
      const workflow = read(path);
      expect(workflow).toContain('path: playwright-report/');
      expect(workflow).toContain('if-no-files-found: error');
    }
  });

  test('package scripts expose bounded local and production Lighthouse checks', () => {
    const packageJson = JSON.parse(read('package.json'));

    expect(packageJson.devDependencies['@lhci/cli']).toBeDefined();
    expect(packageJson.scripts['lighthouse:ci']).toBe(
      'lhci autorun --config=lighthouserc.json'
    );
    expect(packageJson.scripts['lighthouse:production']).toBe(
      'lhci autorun --config=lighthouserc.production.json'
    );
  });

  test.each([
    ['lighthouserc.json', 'http://127.0.0.1:4175/calculator'],
    ['lighthouserc.production.json', 'https://www.suffering.social/calculator'],
  ])('%s enforces the launch thresholds', (path, url) => {
    const config = JSON.parse(read(path));
    const assertions = config.ci.assert.assertions;

    expect(config.ci.collect.url).toEqual([url]);
    expect(assertions['categories:performance']).toEqual([
      'error',
      { minScore: 0.9 },
    ]);
    expect(assertions['categories:accessibility']).toEqual([
      'error',
      { minScore: 1 },
    ]);
    expect(assertions['categories:best-practices']).toEqual([
      'error',
      { minScore: 1 },
    ]);
    expect(assertions['categories:seo']).toEqual(['error', { minScore: 0.98 }]);
    expect(assertions['cumulative-layout-shift']).toEqual([
      'error',
      { maxNumericValue: 0.02 },
    ]);
    expect(assertions['total-blocking-time']).toEqual([
      'error',
      { maxNumericValue: 99 },
    ]);
    expect(config.ci.upload.target).toBe('filesystem');
  });

  test('pull-request verification runs every required gate', () => {
    const workflow = read('.github/workflows/verify.yml');

    for (const command of [
      'npm ci',
      'npx playwright install --with-deps chromium',
      'npm run test:coverage -- --runInBand',
      'npm run lint',
      'npm run build',
      'npm run validate:growth',
      'npm audit --audit-level=high',
      'npm run test:e2e',
      'npm run lighthouse:ci',
    ]) {
      expect(workflow).toContain(command);
    }
  });

  test('production verification is scheduled, external, revision-aware, and drillable', () => {
    const workflow = read('.github/workflows/production-smoke.yml');

    expect(workflow).toContain('cron:');
    expect(workflow).toContain('force_failure:');
    expect(workflow).toContain(
      'PLAYWRIGHT_BASE_URL: https://www.suffering.social'
    );
    expect(workflow).toContain('EXPECTED_REVISION: ${{ github.sha }}');
    expect(workflow).toContain('node scripts/verify-production-revision.mjs');
    expect(read('scripts/verify-production-revision.mjs')).toContain(
      'build-revision'
    );
    expect(workflow).toContain('npm run lighthouse:production');
    expect(workflow).toContain('actions/upload-artifact@');
    expect(workflow).toContain(
      "if: ${{ github.event_name == 'workflow_dispatch' && inputs.force_failure }}"
    );
  });
});
