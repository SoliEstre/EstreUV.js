// `estreuv dev` — reuse create-estreui's dev server verbatim.
//
// The dev command in create-estreui is a generic HTTPS static server
// (mkcert/openssl auto-cert, SPA-friendly, Service-Worker-Allowed header).
// It has zero EstreUI-specific logic, so create-estreuv shares it directly
// rather than forking — minimizes drift (PM 008 R5). Works for both the
// pure EstreUV importmap app and the EstreUI + EstreUV pair app.

let devCommand;
try {
    devCommand = require('create-estreui/lib/commands/dev');
} catch (e) {
    const { Command } = require('commander');
    devCommand = new Command('dev')
        .description('Start local HTTPS development server')
        .action(() => {
            console.error('❌ `create-estreui` is required for `estreuv dev` but could not be loaded.');
            console.error('   Install it:  npm i -D create-estreui');
            console.error('   (' + e.message + ')');
            process.exit(1);
        });
}

module.exports = devCommand;
