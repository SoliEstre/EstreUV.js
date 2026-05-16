const { Command } = require('commander');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const program = new Command('add');

function isPairProject(cwd) {
    return fs.existsSync(path.join(cwd, 'scripts/estreUi-main.js'))
        || fs.existsSync(path.join(cwd, 'scripts/estreUi-core.js'));
}

program
    .description('Add a frontend package (npm install; pair app vendors it via create-estreui)')
    .argument('<package>', 'Package name')
    .action(async (packageName) => {
        const cwd = process.cwd();
        try {
            if (isPairProject(cwd)) {
                // Pair app uses the EstreUI vendored model — delegate.
                const bin = require.resolve('create-estreui/bin/estreui.js');
                execSync(`node "${bin}" add ${packageName}`, { cwd, stdio: 'inherit' });
                return;
            }
            // Pure EstreUV app: npm install + import-map guidance (ESM path
            // varies per package, so we don't guess the map entry).
            console.log(`Installing ${packageName}...`);
            execSync(`npm install ${packageName}`, { cwd, stdio: 'inherit' });
            console.log(`✓ Installed ${packageName}`);
            console.log(`\nNext: add an import-map entry in index.html, e.g.`);
            console.log(`    "${packageName}": "/node_modules/${packageName}/<esm-entry>.js"`);
            console.log(`then import it from scripts/tiles.js.`);
        } catch (err) {
            console.error('Error adding package:', err.message);
            process.exit(1);
        }
    });

module.exports = program;
