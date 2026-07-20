import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

let validator = {};

beforeAll(async () => {
  validator = await import('../scripts/validate-growth.mjs').catch(() => ({}));
});

describe('built growth contract', () => {
  let directory;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), 'suffering-growth-'));
    mkdirSync(join(directory, 'assets'));
  });

  afterEach(() => rmSync(directory, { recursive: true, force: true }));

  test('accepts canonical pages without public maps or identity scripts', () => {
    expect(typeof validator.validateBuiltOutput).toBe('function');
    const pages = {
      'index.html': 'https://www.suffering.social/',
      'calculator.html': 'https://www.suffering.social/calculator',
      'social_media_cost_calculatorv5.html': 'https://www.suffering.social/v5',
      'privacy.html': 'https://www.suffering.social/privacy',
    };
    for (const [file, canonical] of Object.entries(pages)) {
      writeFileSync(filePath(directory, file), `<link rel="canonical" href="${canonical}">`);
    }

    expect(validator.validateBuiltOutput(directory)).toEqual([]);
  });

  test('reports legacy analytics, identity scripts, and public source maps', () => {
    expect(typeof validator.validateBuiltOutput).toBe('function');
    writeFileSync(join(directory, 'index.html'), '<script src="https://cdn.rb2b.example/tag.js"></script> G-RQ28MDK57K');
    writeFileSync(join(directory, 'calculator.html'), '');
    writeFileSync(join(directory, 'social_media_cost_calculatorv5.html'), '');
    writeFileSync(join(directory, 'privacy.html'), '');
    writeFileSync(join(directory, 'assets', 'site.js.map'), '{}');

    expect(validator.validateBuiltOutput(directory)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('legacy GA4'),
        expect.stringContaining('identity vendor'),
        expect.stringContaining('source map'),
      ])
    );
  });
});

function filePath(directory, file) {
  return join(directory, file);
}
