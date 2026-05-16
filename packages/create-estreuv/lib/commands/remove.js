const { Command } = require('commander');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const program = new Command('remove');

function isPairProject(cwd) {
    return fs.existsSync(path.join(cwd, 'scripts/estreUi-main.js'))
        || fs.existsSync(path.join(cwd, 'scripts/estreUi-core.js'));
}

program
    .description('Remove a frontend package (npm uninstall; pair app delegates to create-estreui)')
    .argument('<package>', 'Package name')
    .action(async (packageName) => {
        const cwd = process.cwd();
        try {
            if (isPairProject(cwd)) {
                const bin = require.resolve('create-estreui/bin/estreui.js');
                execSync(`node "${bin}" remove ${packageName}`, { cwd, stdio: 'inherit' });
                return;
            }
            console.log(`Uninstalling ${packageName}...`);
            execSync(`npm uninstall ${packageName}`, { cwd, stdio: 'inherit' });
            console.log(`✓ Removed ${packageName}`);
            console.log(`\nRemember to remove its import-map entry from index.html and any imports.`);
        } catch (err) {
            console.error('Error removing package:', err.message);
            process.exit(1);
        }
    });

module.exports = program;
