#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();
const packageJson = require('../package.json');

const initCommand = require('../lib/commands/init');
const devCommand = require('../lib/commands/dev');
const updateCommand = require('../lib/commands/update');
const addCommand = require('../lib/commands/add');
const removeCommand = require('../lib/commands/remove');

program
  .name('estreuv')
  .description('CLI for EstreUV.js — micro-Rimwork (Lit class primitive), sister to EstreUI.js')
  .version(packageJson.version);

program.addCommand(initCommand);
program.addCommand(devCommand);
program.addCommand(updateCommand);
program.addCommand(addCommand);
program.addCommand(removeCommand);

// If no args, default to init
const args = process.argv.slice(2);
if (!args.length) {
    program.parse([...process.argv, 'init']);
} else {
    const knownCommands = ['init', 'update', 'dev', 'add', 'remove', 'help'];
    const firstArg = args[0];

    // If first arg is not a known command and not a flag, treat it as a project name for init
    if (!knownCommands.includes(firstArg) && !firstArg.startsWith('-')) {
        program.parse([...process.argv.slice(0, 2), 'init', ...args]);
    } else {
        program.parse(process.argv);
    }
}
