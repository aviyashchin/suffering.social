/* remap-tokens.mjs — one-shot hex → design-system token migration.
 *
 * Rewrites the live files (index.html + the 4 src/styles CSS files),
 * replacing hardcoded hex literals with var() references resolved by
 * contract.css + ds-bridge.css. Run once from the repo root:
 *
 *   node scripts/remap-tokens.mjs
 *
 * The MAP below is the auditable record of every collapse decision —
 * ~70 Tailwind ramp hexes onto the design-system's ~20-token language.
 * Kept in the repo as migration evidence (issue #1, PLAN.md Phase 2).
 */
import { readFileSync, writeFileSync } from 'node:fs';

/* hex literal -> design-system token. Longest keys are applied first so
   #fff never matches inside #ffffff. All comparisons are case-insensitive. */
const MAP = {
  /* --- backgrounds / near-white --- */
  '#ffffff': '--bg-1', '#fefefe': '--bg-1', '#fff': '--bg-1',
  '#f9fafb': '--bg-2', '#f8fafc': '--bg-2', '#f3f4f6': '--bg-2', '#f1f5f9': '--bg-2',
  '#e5e7eb': '--bg-3', '#e2e8f0': '--bg-3',

  /* --- grey ramp --- */
  '#d1d5db': '--grey-300', '#cbd5e1': '--grey-300',
  '#9ca3af': '--grey-500', '#94a3b8': '--grey-500',
  '#6b7280': '--fg-3', '#64748b': '--fg-3',
  '#4b5563': '--grey-700', '#475569': '--grey-700',
  '#374151': '--fg-2', '#334155': '--fg-2', '#333': '--fg-2',
  '#1f2937': '--color', '#1e293b': '--color',
  '#111827': '--color', '#0f172a': '--color', '#000000': '--color', '#000': '--color',

  /* --- accent (blue) --- */
  '#3b82f6': '--accent', '#2563eb': '--accent', '#1d4ed8': '--accent',
  '#1e40af': '--accent', '#60a5fa': '--accent', '#93c5fd': '--accent', '#bfdbfe': '--accent',
  '#dbeafe': '--surface-accent', '#eff6ff': '--surface-accent',

  /* --- mortality / signal red --- */
  '#dc2626': '--c-mortality', '#ef4444': '--c-mortality', '#b91c1c': '--c-mortality',
  '#f87171': '--c-mortality', '#fca5a5': '--c-mortality',
  '#fef2f2': '--surface-mortality', '#fee2e2': '--surface-mortality', '#fecaca': '--surface-mortality',

  /* --- mental health (purple) --- */
  '#8b5cf6': '--c-mental-health', '#7c3aed': '--c-mental-health', '#6d28d9': '--c-mental-health',
  '#9333ea': '--c-mental-health', '#a855f7': '--c-mental-health', '#a78bfa': '--c-mental-health',
  '#c4b5fd': '--c-mental-health', '#d8b4fe': '--c-mental-health',
  '#faf5ff': '--surface-mental-health', '#f5f3ff': '--surface-mental-health', '#ddd6fe': '--surface-mental-health',

  /* --- productivity (green) --- */
  '#059669': '--c-productivity', '#10b981': '--c-productivity', '#16a34a': '--c-productivity',
  '#22c55e': '--c-productivity', '#15803d': '--c-productivity', '#047857': '--c-productivity',
  '#34d399': '--c-productivity', '#065f46': '--c-productivity', '#86efac': '--c-productivity',
  '#f0fdf4': '--surface-productivity', '#bbf7d0': '--surface-productivity',

  /* --- amber / warning --- */
  '#fbbf24': '--chart-3', '#f59e0b': '--chart-3',
  '#fef3c7': '--bg-2', '#92400e': '--fg-2', '#78350f': '--fg-2',
};

const keys = Object.keys(MAP).sort((a, b) => b.length - a.length);
const files = [
  'index.html',
  'src/styles/base.css',
  'src/styles/calculator.css',
  'src/styles/components.css',
  'src/styles/mobile.css',
];

let grand = 0;
for (const file of files) {
  let src = readFileSync(file, 'utf8');
  let n = 0;
  for (const hex of keys) {
    // hex not followed by another hex digit -> exact literal, case-insensitive
    const re = new RegExp(hex + '(?![0-9a-fA-F])', 'gi');
    src = src.replace(re, () => { n++; return `var(${MAP[hex]})`; });
  }
  writeFileSync(file, src);
  grand += n;
  console.log(`${file}: ${n} replaced`);
}
console.log(`total: ${grand}`);
