// One-pass editorial-doctrine surgery for the suffering.social CSS.
// Reversible via git. Run from repo root.
import fs from 'fs';

const FILES = [
  'index.html',
  'src/styles/base.css',
  'src/styles/calculator.css',
  'src/styles/components.css',
  'src/styles/mobile.css',
];

const stats = { shadows:0, radii:0, gradients:0 };

for (const f of FILES) {
  let s = fs.readFileSync(f, 'utf8');

  // 1. Strip every box-shadow declaration (incl. !important, multi-line).
  s = s.replace(/[ \t]*box-shadow\s*:[^;}]+;?\s*(?:\/\*[^*]*\*\/)?\s*\n?/g,
    m => { stats.shadows++; return ''; });

  // 2. Cap border-radius. Keep 50% (handles/dots). Anything else > 2px -> 2px.
  s = s.replace(/border-radius\s*:\s*([^;}]+?)\s*(!important)?\s*;/g,
    (m, val, imp) => {
      const v = val.trim();
      if (/^50%/.test(v) || /^0$|^0px$/.test(v)) return m;
      // Multi-value (e.g. "8px 8px 0 0") -> 2px on all sides.
      stats.radii++;
      return `border-radius: 2px${imp ? ' '+imp : ''};`;
    });

  // 3. Replace decorative linear-gradient(...) with its first color stop as a solid.
  //    Matches: linear-gradient(<angle>, color1 [stop], color2 [stop], ...)
  s = s.replace(/linear-gradient\([^)]+\)/g, (m) => {
    // Extract first color: var(...), #hex, rgb(...), or a named color
    const inner = m.slice('linear-gradient('.length, -1);
    // Split on commas at top level (no nesting concerns for color stops here)
    const parts = inner.split(',').map(p => p.trim());
    // Drop the angle/direction (first part if it looks like an angle/direction)
    const colorParts = /^(to\s|[-\d]|[a-z]+(deg|rad|turn))/i.test(parts[0])
      ? parts.slice(1) : parts;
    if (!colorParts.length) return m;
    // First color stop, strip any trailing percentage/length
    const first = colorParts[0].replace(/\s+[0-9.]+(%|px|rem|em)\s*$/, '').trim();
    stats.gradients++;
    return first;
  });

  fs.writeFileSync(f, s);
}

console.log(stats);
