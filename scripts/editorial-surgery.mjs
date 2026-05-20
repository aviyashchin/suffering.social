// Editorial-doctrine surgery: strip box-shadow, cap border-radius at 2px,
// flatten decorative gradients to their first color stop. Operates on
// CSS rule text AND on Tailwind utility classes in HTML class attributes
// (including JS template literals that inject HTML). Reversible via git.
// Run from repo root.
import fs from 'fs';

const FILES = [
  'index.html',
  'src/styles/base.css',
  'src/styles/calculator.css',
  'src/styles/components.css',
  'src/styles/mobile.css',
];

const stats = { shadows:0, radii:0, gradients:0, twShadow:0, twGradient:0, twRadius:0 };

// Tailwind rounded utilities we collapse to `rounded-sm` (2px). Preserve
// `rounded`, `rounded-sm`, `rounded-none`, `rounded-full` (pill).
const TW_OVER_RADIUS = /\brounded-(md|lg|xl|2xl|3xl)\b/g;
// Drop shadows entirely. Preserve `shadow-none` (semantic) — there isn't a
// safe substitute for `shadow-inner` either, drop it too.
const TW_SHADOW = /\bshadow-(sm|md|lg|xl|2xl|inner)\b/g;
// Gradient utilities: `bg-gradient-to-*` + `from-X` + (optional `via-Y`) + `to-Z`.
// Collapse to `bg-X` so the first color reads as a solid surface, matching
// what the CSS-pass does for `linear-gradient(...)` declarations.
const TW_GRADIENT_DIR = /\bbg-gradient-to-(?:r|l|t|b|tr|tl|br|bl)\b/g;
const TW_FROM = /\bfrom-([a-z]+-\d{2,3}(?:\/\d{1,3})?)\b/;
const TW_VIA  = /\bvia-[a-z]+-\d{2,3}(?:\/\d{1,3})?\b/g;
const TW_TO   = /\bto-[a-z]+-\d{2,3}(?:\/\d{1,3})?\b/g;

function scrubClassList(cls) {
  let s = cls;

  // 1. shadows
  s = s.replace(TW_SHADOW, () => { stats.twShadow++; return ''; });

  // 2. rounded-{md..3xl} -> rounded-sm
  s = s.replace(TW_OVER_RADIUS, () => { stats.twRadius++; return 'rounded-sm'; });

  // 3. gradients: capture first `from-X`, then strip direction + from/via/to,
  //    prepend `bg-X` so the surface keeps its tint.
  if (TW_GRADIENT_DIR.test(s) || TW_FROM.test(s)) {
    const fromMatch = s.match(TW_FROM);
    s = s.replace(TW_GRADIENT_DIR, '').replace(TW_VIA, '').replace(TW_TO, '');
    s = s.replace(TW_FROM, '');
    if (fromMatch) s = `bg-${fromMatch[1]} ${s}`;
    stats.twGradient++;
  }

  // Collapse whitespace.
  return s.replace(/\s+/g, ' ').trim();
}

for (const f of FILES) {
  let s = fs.readFileSync(f, 'utf8');

  // ---- CSS pass ----------------------------------------------------------
  // 1. Strip every box-shadow declaration (incl. !important, multi-line).
  s = s.replace(/[ \t]*box-shadow\s*:[^;}]+;?\s*(?:\/\*[^*]*\*\/)?\s*\n?/g,
    () => { stats.shadows++; return ''; });

  // 2. Cap border-radius. Keep 50% (handles/dots). Anything else > 2px -> 2px.
  s = s.replace(/border-radius\s*:\s*([^;}]+?)\s*(!important)?\s*;/g,
    (m, val, imp) => {
      const v = val.trim();
      if (/^50%/.test(v) || /^0$|^0px$/.test(v)) return m;
      stats.radii++;
      return `border-radius: 2px${imp ? ' '+imp : ''};`;
    });

  // 3. Flatten decorative linear-gradient(...) to its first color stop.
  s = s.replace(/linear-gradient\([^)]+\)/g, (m) => {
    const inner = m.slice('linear-gradient('.length, -1);
    const parts = inner.split(',').map(p => p.trim());
    const colorParts = /^(to\s|[-\d]|[a-z]+(deg|rad|turn))/i.test(parts[0])
      ? parts.slice(1) : parts;
    if (!colorParts.length) return m;
    const first = colorParts[0].replace(/\s+[0-9.]+(%|px|rem|em)\s*$/, '').trim();
    stats.gradients++;
    return first;
  });

  // ---- HTML/JS class-attribute pass --------------------------------------
  // Static class="...". Skip if no Tailwind doctrine violations present.
  s = s.replace(/class\s*=\s*"([^"]+)"/g,
    (m, cls) => `class="${scrubClassList(cls)}"`);
  // JS template-literal innerHTML / strings carrying class="..." — same
  // pattern, matches inside backticks too.
  s = s.replace(/class\s*=\s*'([^']+)'/g,
    (m, cls) => `class='${scrubClassList(cls)}'`);

  fs.writeFileSync(f, s);
}

console.log(stats);
