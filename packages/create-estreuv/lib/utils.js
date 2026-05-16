const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Dependency versions for scaffolded projects. Kept in lockstep with
// packages/estreuv's own dependency ranges.
const ESTREUV_DEPS = {
    estreuv: '^0.1.0',
    lit: '^3.3.0',
    '@lit/context': '^1.1.0'
};

/** Recursive copy including dotfiles. */
async function copyDir(src, dest, exclude = []) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        if (exclude.includes(entry.name)) continue;
        const s = path.join(src, entry.name);
        const d = path.join(dest, entry.name);
        if (entry.isDirectory()) await copyDir(s, d, exclude);
        else fs.copyFileSync(s, d);
    }
}

/**
 * Write/merge the project's package.json.
 * - pure: fresh package.json (estreuv + lit + @lit/context, dev script)
 * - pair: merge estreuv deps into the create-estreui-generated package.json
 */
function writeProjectPackageJson(projectPath, pkgName, { pair }) {
    const pkgPath = path.join(projectPath, 'package.json');

    if (pair && fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        pkg.dependencies = { ...(pkg.dependencies || {}), ...ESTREUV_DEPS };
        pkg.devDependencies = { ...(pkg.devDependencies || {}), 'create-estreuv': `^${rootVersion()}` };
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 4) + '\n', 'utf8');
        return;
    }

    const pkg = {
        name: pkgName,
        version: '1.0.0',
        description: 'EstreUV.js app',
        private: true,
        type: 'module',
        scripts: { dev: 'estreuv dev' },
        dependencies: { ...ESTREUV_DEPS },
        devDependencies: { 'create-estreuv': `^${rootVersion()}` }
    };
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 4) + '\n', 'utf8');
}

function rootVersion() {
    try { return require('../package.json').version; } catch { return '0.1.0'; }
}

/**
 * Apply the EstreUV overlay onto a create-estreui scaffold:
 * 1. copy overlay files (scripts/estreuv-tiles.js, ESTREUV-PAIR.md)
 * 2. inject the import map + module <script> into index.html before </head>
 */
function applyEstreuvOverlay(projectPath, overlayDir) {
    // 1. files
    fs.mkdirSync(path.join(projectPath, 'scripts'), { recursive: true });
    fs.copyFileSync(
        path.join(overlayDir, 'scripts/estreuv-tiles.js'),
        path.join(projectPath, 'scripts/estreuv-tiles.js')
    );
    fs.copyFileSync(
        path.join(overlayDir, 'ESTREUV-PAIR.md'),
        path.join(projectPath, 'ESTREUV-PAIR.md')
    );

    // 2. index.html injection
    const indexPath = path.join(projectPath, 'index.html');
    if (!fs.existsSync(indexPath)) {
        console.warn('⚠ index.html not found — skipping import map injection. See ESTREUV-PAIR.md.');
        return;
    }
    let html = fs.readFileSync(indexPath, 'utf8');
    if (html.includes('scripts/estreuv-tiles.js')) return; // idempotent

    const block = [
        '',
        '    <!-- EstreUV: consumed as an npm dependency over an import map (no build). -->',
        '    <script type="importmap">',
        '    {',
        '        "imports": {',
        '            "lit": "/node_modules/lit/index.js",',
        '            "lit/": "/node_modules/lit/",',
        '            "@lit/context": "/node_modules/@lit/context/index.js",',
        '            "@lit/reactive-element": "/node_modules/@lit/reactive-element/reactive-element.js",',
        '            "@lit/reactive-element/": "/node_modules/@lit/reactive-element/",',
        '            "lit-element/lit-element.js": "/node_modules/lit-element/lit-element.js",',
        '            "lit-html": "/node_modules/lit-html/lit-html.js",',
        '            "lit-html/": "/node_modules/lit-html/",',
        '            "estreuv": "/node_modules/estreuv/src/index.js",',
        '            "estreuv/": "/node_modules/estreuv/src/"',
        '        }',
        '    }',
        '    </script>',
        '    <script type="module" src="./scripts/estreuv-tiles.js"></script>',
        ''
    ].join('\n');

    if (html.includes('</head>')) {
        html = html.replace('</head>', block + '</head>');
    } else {
        html += block;
    }
    fs.writeFileSync(indexPath, html, 'utf8');
    console.log('✓ Injected import map + estreuv-tiles.js into index.html');
}

/** Spawn create-estreui to scaffold the EstreUI shell (pair mode). */
function runCreateEstreui(projectName) {
    let bin;
    try {
        bin = require.resolve('create-estreui/bin/estreui.js');
    } catch (e) {
        throw new Error(
            'create-estreui is required for pair mode but is not installed. ' +
            'It is a dependency of create-estreuv — run `npm install`. (' + e.message + ')'
        );
    }
    console.log('→ Delegating EstreUI shell to create-estreui...');
    execSync(`node "${bin}" init ${projectName}`, { stdio: 'inherit', cwd: process.cwd() });
}

/** npm install in the project directory. */
function installDependencies(projectPath) {
    console.log('Installing dependencies...');
    try {
        execSync('npm install', { cwd: projectPath, stdio: 'inherit' });
        console.log('✓ Dependencies installed');
        return true;
    } catch (e) {
        console.error('Failed to install dependencies:', e.message);
        return false;
    }
}

module.exports = {
    copyDir,
    writeProjectPackageJson,
    applyEstreuvOverlay,
    runCreateEstreui,
    installDependencies
};
