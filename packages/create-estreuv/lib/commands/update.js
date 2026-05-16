const { Command } = require('commander');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const program = new Command('update');

function isPairProject(cwd) {
    // create-estreui scaffolds vendored estreui core assets.
    return fs.existsSync(path.join(cwd, 'scripts/estreUi-main.js'))
        || fs.existsSync(path.join(cwd, 'scripts/estreUi-core.js'));
}

program
    .description('Update EstreUV (and, for a pair app, the EstreUI shell) to latest')
    .action(async () => {
        const cwd = process.cwd();
        try {
            console.log('🔄 Updating estreuv / lit / @lit/context...');
            execSync('npm update estreuv lit @lit/context', { cwd, stdio: 'inherit' });

            if (isPairProject(cwd)) {
                console.log('🔄 Pair app detected — refreshing EstreUI shell via create-estreui...');
                const bin = require.resolve('create-estreui/bin/estreui.js');
                execSync(`node "${bin}" update`, { cwd, stdio: 'inherit' });
            }
            console.log('🎉 Update complete.');
        } catch (err) {
            console.error('❌ Update failed:', err.message);
            process.exit(1);
        }
    });

module.exports = program;
