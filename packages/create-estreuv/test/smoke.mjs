// Smoke test — CLI modules load + pure scaffold produces expected files.
// No npm install (uses --no-install) so it stays fast and offline.

import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const pkgRoot = resolve(fileURLToPath(import.meta.url), '../..');
const bin = join(pkgRoot, 'bin/estreuv.js');
let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.error('✗ ' + m); } else console.log('✓ ' + m); };

// 1. all command modules load (CommonJS — require, like bin/estreuv.js does)
for (const c of ['init', 'dev', 'update', 'add', 'remove']) {
    try { require(join(pkgRoot, 'lib/commands', c + '.js')); ok(true, `lib/commands/${c}.js loads`); }
    catch (e) { ok(false, `lib/commands/${c}.js loads — ${e.message}`); }
}

// 2. pure scaffold
const work = mkdtempSync(join(tmpdir(), 'estreuv-smoke-'));
try {
    execFileSync(process.execPath, [bin, 'init', 'demo', '--pure', '--no-install'], {
        cwd: work, stdio: 'pipe'
    });
    const p = join(work, 'demo');
    ok(existsSync(join(p, 'index.html')), 'index.html created');
    ok(existsSync(join(p, 'scripts/tiles.js')), 'scripts/tiles.js created');
    ok(existsSync(join(p, '.gitignore')), '.gitignore created');
    ok(existsSync(join(p, 'README.md')), 'README.md created');

    const pkg = JSON.parse(readFileSync(join(p, 'package.json'), 'utf8'));
    ok(pkg.name === 'demo', 'package.json name = demo');
    ok(pkg.dependencies && pkg.dependencies.estreuv, 'estreuv dependency present');
    ok(pkg.dependencies.lit && pkg.dependencies['@lit/context'], 'lit + @lit/context present');
    ok(pkg.scripts && pkg.scripts.dev === 'estreuv dev', 'dev script = "estreuv dev"');

    const html = readFileSync(join(p, 'index.html'), 'utf8');
    ok(html.includes('importmap') && html.includes('"estreuv"'), 'index.html has estreuv import map');
} finally {
    rmSync(work, { recursive: true, force: true });
}

console.log(failures ? `\n${failures} failure(s)` : '\nAll smoke checks passed');
process.exit(failures ? 1 : 0);
