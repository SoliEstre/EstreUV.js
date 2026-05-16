const { Command } = require('commander');
const inquirer = require('inquirer');
const path = require('path');
const fs = require('fs');
const { copyDir, writeProjectPackageJson, applyEstreuvOverlay, runCreateEstreui } = require('../utils');

const program = new Command('init');

program
    .description('Initialize a new EstreUV.js project')
    .argument('[project-name]', 'Project name')
    .option('--pure', 'Pure EstreUV app (no EstreUI)')
    .option('--pair', 'EstreUI + EstreUV pair app')
    .option('--no-install', 'Skip npm install')
    .action(async (projectName, options) => {
        // 1. Project name
        let { name } = { name: projectName };
        if (!name) {
            ({ name } = await inquirer.prompt([{
                type: 'input', name: 'name',
                message: 'Project name:', default: 'my-estreuv-app'
            }]));
        }

        // 2. Mode
        let mode = options.pure ? 'pure' : options.pair ? 'pair' : null;
        if (!mode) {
            ({ mode } = await inquirer.prompt([{
                type: 'list', name: 'mode', message: 'Project type:',
                choices: [
                    { name: 'Pure EstreUV app (Lit micro-Rimwork, no build)', value: 'pure' },
                    { name: 'EstreUI + EstreUV pair app (EstreUI shell + EstreUV tiles)', value: 'pair' }
                ],
                default: 'pure'
            }]));
        }

        const projectPath = path.resolve(process.cwd(), name === '.' ? '' : name);
        const pkgName = name === '.' ? path.basename(process.cwd()) : name;

        try {
            if (mode === 'pure') {
                await scaffoldPure(projectPath, pkgName, options.install);
            } else {
                await scaffoldPair(projectPath, pkgName, name, options.install);
            }
            console.log('\n✓ Project initialized.');
            console.log(`\n  cd ${name}\n  npm run dev\n`);
        } catch (error) {
            console.error('Error initializing project:', error);
            process.exit(1);
        }
    });

async function scaffoldPure(projectPath, pkgName, install) {
    console.log(`Initializing pure EstreUV app in ${projectPath}...`);
    fs.mkdirSync(projectPath, { recursive: true });

    const templateDir = path.resolve(__dirname, '../../templates/pure');
    await copyDir(templateDir, projectPath);
    console.log('✓ Copied template');

    writeProjectPackageJson(projectPath, pkgName, { pair: false });
    console.log('✓ Created package.json');

    if (install) require('../utils').installDependencies(projectPath);
}

async function scaffoldPair(projectPath, pkgName, rawName, install) {
    console.log(`Initializing EstreUI + EstreUV pair app in ${projectPath}...`);

    // Delegate the EstreUI shell to create-estreui (max share — PM 008 R5).
    runCreateEstreui(rawName);

    if (!fs.existsSync(projectPath)) {
        throw new Error('create-estreui did not produce the project directory. Aborting overlay.');
    }

    // Apply the EstreUV overlay on top of the EstreUI scaffold.
    const overlayDir = path.resolve(__dirname, '../../templates/pair-overlay');
    applyEstreuvOverlay(projectPath, overlayDir);

    writeProjectPackageJson(projectPath, pkgName, { pair: true });
    console.log('✓ Added estreuv / lit / @lit/context to package.json');

    if (install) require('../utils').installDependencies(projectPath);
    console.log('✓ See ESTREUV-PAIR.md for the one manual page-handler step.');
}

module.exports = program;
