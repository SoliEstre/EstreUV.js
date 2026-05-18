// Fresh-install packaging smoke — verifies the ACTUAL published artifact,
// not the workspace symlink. This closes the gap that the vitest suite
// (runs against src/ via workspace link) and `publish --dry-run` (only
// inspects tarball contents) do not cover: does `npm install estreuv`
// produce a package whose files/exports/import-map paths actually work.
//
// Steps: npm pack (prepack regenerates types) → install the tgz into a
// throwaway project → assert the packaging contract.

import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync, readdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const pkgDir = resolve(fileURLToPath(import.meta.url), '../..');
let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.error('✗ ' + m); } else console.log('✓ ' + m); };

const work = mkdtempSync(join(tmpdir(), 'estreuv-pack-'));
let tgz;
try {
    // 1. pack (prepack → fresh .d.ts)
    const out = execFileSync('npm', ['pack', '--json', '--pack-destination', work], {
        cwd: pkgDir, encoding: 'utf8', shell: process.platform === 'win32'
    });
    tgz = join(work, JSON.parse(out)[0].filename);
    ok(existsSync(tgz), `npm pack produced ${JSON.parse(out)[0].filename}`);

    // 2. fresh project, install the tarball + peer deps
    const proj = join(work, 'consumer');
    execFileSync('npm', ['init', '-y'], { cwd: mkdirp(proj), stdio: 'pipe', shell: process.platform === 'win32' });
    execFileSync('npm', ['install', '--no-audit', '--no-fund', tgz, 'lit@^3.3.0', '@lit/context@^1.1.0'], {
        cwd: proj, stdio: 'pipe', shell: process.platform === 'win32'
    });
    const inst = join(proj, 'node_modules', 'estreuv');
    ok(existsSync(inst), 'estreuv installed into consumer node_modules');

    // 3. shipped files present
    ok(existsSync(join(inst, 'src/index.js')), 'src/index.js shipped');
    ok(existsSync(join(inst, 'src/dark-mode-tile.js')), 'src/dark-mode-tile.js shipped');
    ok(existsSync(join(inst, 'types/index.d.ts')), 'types/index.d.ts shipped (D4)');
    ok(existsSync(join(inst, 'README.md')), 'README.md shipped');

    // 4. dev cruft must NOT ship (files field = [src, types, README.md])
    for (const cruft of ['test', 'baseline', 'scripts', 'vitest.config.js', 'index.html', 'tsconfig.json']) {
        ok(!existsSync(join(inst, cruft)), `dev artifact NOT shipped: ${cruft}`);
    }

    // 5. import-map path promised by README/templates physically exists
    ok(existsSync(join(inst, 'src/index.js')), 'import-map target /node_modules/estreuv/src/index.js exists');

    // 6. exports map resolves from the consumer
    const req = createRequire(join(proj, 'package.json'));
    try { ok(!!req.resolve('estreuv'), `exports "." resolves → ${req.resolve('estreuv')}`); }
    catch (e) { ok(false, `exports "." resolves — ${e.message}`); }
    try { ok(!!req.resolve('estreuv/dark-mode-tile.js'), 'exports "./*.js" resolves (estreuv/dark-mode-tile.js)'); }
    catch (e) { ok(false, `exports "./*.js" resolves — ${e.message}`); }

    // 7. DOM-less runtime import of a pure module from the INSTALLED pkg
    try {
        const alias = await import(pathToFileURL(join(inst, 'src/alienese-alias.js')).href);
        ok(typeof alias.applyAliases === 'function' && !!alias.ALIENESE_DEFAULT_ALIASES,
           'installed alienese-alias.js imports + exports present');
    } catch (e) { ok(false, `installed module import — ${e.message}`); }

    // 8. types entry is valid TS declaration surface
    const dts = readFileSync(join(inst, 'types/index.d.ts'), 'utf8');
    ok(/export\s+\{[^}]*EstreUVElement/.test(dts), 'types/index.d.ts re-exports EstreUVElement');
} finally {
    rmSync(work, { recursive: true, force: true });
}

function mkdirp(p) { execFileSync(process.execPath, ['-e', `require('fs').mkdirSync(${JSON.stringify(p)},{recursive:true})`]); return p; }

console.log(failures ? `\n${failures} failure(s) — published artifact contract broken` : '\nFresh-install packaging smoke: all checks passed');
process.exit(failures ? 1 : 0);
