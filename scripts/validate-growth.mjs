/* eslint-disable no-console */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const CANONICAL_PAGES = {
  'index.html': 'https://www.suffering.social/',
  'calculator.html': 'https://www.suffering.social/',
  'social_media_cost_calculatorv5.html': 'https://www.suffering.social/v5',
  'privacy.html': 'https://www.suffering.social/privacy',
};

function listFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory).flatMap((entry) => {
    const path = resolve(directory, entry);
    return statSync(path).isDirectory() ? listFiles(path) : [path];
  });
}

export function validateBuiltOutput(directory = 'dist') {
  const errors = [];

  for (const [file, canonical] of Object.entries(CANONICAL_PAGES)) {
    const path = resolve(directory, file);
    if (!existsSync(path)) {
      errors.push(`missing built page: ${file}`);
      continue;
    }
    const html = readFileSync(path, 'utf8');
    if (!html.includes(`<link rel="canonical" href="${canonical}">`)) {
      errors.push(`incorrect canonical in ${file}`);
    }
  }

  const files = listFiles(directory);
  const text = files
    .filter((file) => /\.(?:html|js|css)$/.test(file))
    .map((file) => readFileSync(file, 'utf8'))
    .join('\n');

  if (text.includes('G-RQ28MDK57K')) errors.push('legacy GA4 identifier remains');
  if (/<script[^>]+src=["'][^"']*(?:rb2b|retention\.com|vector\.co|leadsy)/i.test(text)) {
    errors.push('identity vendor script remains');
  }
  if (files.some((file) => file.endsWith('.map'))) errors.push('public source map remains');

  return errors;
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : '';
if (import.meta.url === invokedPath) {
  const errors = validateBuiltOutput(process.argv[2] || 'dist');
  if (errors.length) {
    for (const error of errors) console.error(`growth validation: ${error}`);
    process.exitCode = 1;
  } else {
    console.log('growth validation: passed');
  }
}
