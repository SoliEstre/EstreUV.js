// D1 — per-tile authoring LoC: EstreUV tile vs raw-Lit equivalent.
//
// "tile 1종 작성 LoC가 raw Lit 동등 구현 대비 +20% 이내" (spike D1).
// Per-tile authoring cost only: the EstreUVElement base / lifecycle
// bridge / Alienese are shared infrastructure written once (counted in
// I1), not a per-tile cost — so the comparison is the two tile files.
//
// The EstreUV tile additionally gets intent context, the EstreUI
// lifecycle bridge, and Alienese aliases "for free" from the base; the
// raw-Lit baseline omits those (a plain-Lit author would not write
// them). So a near-parity LoC means EstreUV adds capability at ~zero
// extra authoring cost.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

function codeLoc(p) {
    const src = readFileSync(join(root, p), 'utf8');
    return src
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '')
        .split('\n')
        .filter(l => l.trim() !== '')
        .length;
}

const estreuv = codeLoc('src/dark-mode-tile.js');
const rawLit = codeLoc('baseline/dark-mode-tile.raw-lit.js');
const deltaPct = ((estreuv - rawLit) / rawLit) * 100;
const LIMIT = 20;
const pass = deltaPct <= LIMIT;

console.log('\nD1  per-tile authoring LoC (comments excluded)\n');
console.log(`  EstreUV  src/dark-mode-tile.js            ${String(estreuv).padStart(4)} code`);
console.log(`  raw Lit  baseline/dark-mode-tile.raw-lit  ${String(rawLit).padStart(4)} code`);
console.log(`  ────────────────────────────────────────────────`);
console.log(`  delta vs raw Lit: ${deltaPct >= 0 ? '+' : ''}${deltaPct.toFixed(1)}%  (limit ≤ +${LIMIT}%)   ${pass ? '✅ PASS' : '❌ FAIL'}`);
console.log(`  note: EstreUV tile also gains intent context + EstreUI`);
console.log(`        lifecycle bridge + Alienese aliases from the base.\n`);

process.exit(pass ? 0 : 1);
