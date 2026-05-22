// Pair-integration contract regression — static assertions that the
// EstreUI + EstreUV wiring in this playground does not silently drift.
// The interactive runtime behavior (lifecycle dispatch, intent re-render,
// F1~F3) needs a browser and is covered by the Antigravity handoff
// (ESTREUV-PAIR-VERIFY.md); this guards the wiring structure in CI.

import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = resolve(fileURLToPath(import.meta.url), '../..');
const require = createRequire(import.meta.url);
let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.error('✗ ' + m); } else console.log('✓ ' + m); };
const read = (p) => readFileSync(join(root, p), 'utf8');

// 1. estreuv dependency resolves (workspace link) and is the live major.
// NB: estreuv's exports map intentionally does not expose ./package.json,
// so read it from the resolved install dir via fs (not require.resolve).
try {
    const entry = require.resolve('estreuv', { paths: [root] });   // …/estreuv/src/index.js
    ok(!!entry, `estreuv resolves → ${entry}`);
    const pkgDir = resolve(entry, '../..');                          // …/estreuv
    const v = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8')).version;
    ok(/^\d+\.\d+\.\d+/.test(v), `estreuv version present (${v})`);
} catch (e) { ok(false, `estreuv resolves — ${e.message}`); }

// 2. index.html — import map + module loader
const index = read('index.html');
ok(index.includes('<script type="importmap">'), 'index.html has an import map');
for (const k of ['"estreuv"', '"estreuv/"', '"lit"', '"@lit/context"']) {
    ok(index.includes(k), `import map entry ${k}`);
}
ok(index.includes('/node_modules/estreuv/src/index.js'), 'import map points estreuv → src/index.js');
ok(index.includes('./scripts/estreuv-tiles.js'), 'index.html loads scripts/estreuv-tiles.js (module)');

// 3. estreuv-tiles.js — registers tiles + exposes helpers + ready signal
const tiles = read('scripts/estreuv-tiles.js');
for (const t of ['dark-mode-tile', 'clock-tile', 'notif-count-tile', 'sidebar', 'sidebar-item']) {
    ok(tiles.includes(`'estreuv/${t}.js'`), `estreuv-tiles imports ${t}`);
}
for (const h of ['intent-context', 'lifecycle-bridge', 'alienese-alias']) {
    ok(tiles.includes(`'estreuv/${h}.js'`), `estreuv-tiles imports helper ${h}`);
}
ok(/window\._estreuv\s*=/.test(tiles), 'estreuv-tiles exposes window._estreuv');
ok(tiles.includes("estreuv:ready"), 'estreuv-tiles dispatches estreuv:ready');

// 4. main.js — HomePageHandler lifecycle surface + provider wiring
const main = read('scripts/main.js');
ok(/class\s+HomePageHandler\s+extends\s+EstrePageHandler/.test(main), 'HomePageHandler extends EstrePageHandler');
for (const hook of ['onBring', 'onOpen', 'onShow', 'onFocus', 'onBlur', 'onHide', 'onClose', 'onRelease']) {
    ok(new RegExp(`\\b${hook}\\s*\\(`).test(main), `HomePageHandler has ${hook}`);
}
ok(main.includes('dispatchToTiles'), 'HomePageHandler has dispatchToTiles');
ok(main.includes('[data-estreuv]'), 'dispatchToTiles selects [data-estreuv] children');
ok(main.includes('_estreuvReady') && main.includes('estreuv:ready'), 'race-safe _estreuvReady await present');
ok(main.includes('provideIntent') && main.includes('wireArticle'), 'onOpen wires provideIntent + wireArticle');
ok(main.includes("intent-update"), 'event-up bridge (intent-update listener) present');

// 5. staticDoc.html — expected custom elements present
const sd = read('staticDoc.html');
const count = (s) => sd.split(s).length - 1;
ok(count('<estreuv-dark-mode-tile') >= 2, 'staticDoc: ≥2 dark-mode-tile (incl. F3 attr variant)');
ok(count('<estreuv-clock-tile') >= 2, 'staticDoc: ≥2 clock-tile');
ok(count('<estreuv-notif-count-tile') >= 2, 'staticDoc: ≥2 notif-count-tile');
ok(sd.includes('<estreuv-sidebar'), 'staticDoc: sidebar present');
ok(count('<estreuv-sidebar-item') >= 3, 'staticDoc: ≥3 sidebar-item');
ok(/\$tile\b/.test(sd) && !/\bconst\s+t\b/.test(sd), 'console guide uses $tile (no single-letter Alienese collision)');

console.log(failures ? `\n${failures} failure(s) — pair-integration contract drifted` : '\nPair-integration contract: all checks passed');
process.exit(failures ? 1 : 0);
