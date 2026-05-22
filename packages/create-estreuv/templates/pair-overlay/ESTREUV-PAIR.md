# EstreUI + EstreUV pair — wiring

`create-estreuv` scaffolded an EstreUI app (via `create-estreui`) and then
applied the EstreUV overlay:

- added `estreuv`, `lit`, `@lit/context` to `package.json` dependencies
- injected an import map + `<script type="module" src="./scripts/estreuv-tiles.js">`
  into `index.html` (before `</head>`)
- added `scripts/estreuv-tiles.js` (registers `<estreuv-*>` elements, exposes
  `window.estreuv`, dispatches `estreuv:ready`)

## One manual step — propagate the page lifecycle

`scripts/main.js` is yours (the scaffolder never overwrites it). To let an
EstreUI article drive the EstreUV tiles' lifecycle and share intent, add a
page handler like this and bind it to your page:

```js
const estreuvReady = window.estreuv
    ? Promise.resolve()
    : new Promise(r => addEventListener('estreuv:ready', () => r(), { once: true }));

class HomePageHandler extends EstrePageHandler {
    onBring(handle)            { super.onBring?.(handle);            this.toTiles(handle, 'onBring'); }
    onOpen(handle) {
        super.onOpen?.(handle);
        const root = handle?.article ?? handle?.handle ?? document;
        if (root && window.estreuv && !this._intent) {
            this._intent = window.estreuv.intent.provideIntent(root, { step: 'home' });
            this._lifecycle = window.estreuv.bridge.wireArticle(root);
            root.addEventListener('intent-update', e => this._intent.update(e.detail.patch));
        }
    }
    onShow(handle)             { super.onShow?.(handle);             this.toTiles(handle, 'onShow'); }
    onFocus(handle, first)     { super.onFocus?.(handle, first);     this.toTiles(handle, 'onFocus', first); }
    onBlur(handle, last)       { super.onBlur?.(handle, last);       this.toTiles(handle, 'onBlur', last); }
    onHide(handle)             { super.onHide?.(handle);             this.toTiles(handle, 'onHide'); }
    onClose(handle)            { super.onClose?.(handle);            this.toTiles(handle, 'onClose'); }
    onRelease(handle)          { super.onRelease?.(handle);          this.toTiles(handle, 'onRelease'); }

    toTiles(handle, hook, ...args) {
        const root = handle?.article ?? handle?.handle ?? document;
        root.querySelectorAll('[data-estreuv]').forEach($tile => {
            try { typeof $tile[hook] === 'function' && $tile[hook](handle, ...args); }
            catch (err) { console.error(`[estreuv] tile.${hook} threw:`, err); }
        });
    }
}
```

Then register `HomePageHandler` for your page and, before `estreUi.init()`,
`await estreuvReady` so the tiles exist when `onOpen` wires the provider.

Use `<estreuv-dark-mode-tile>`, `<estreuv-clock-tile>`,
`<estreuv-notif-count-tile>` (and the sidebar/item) anywhere in your
article markup (e.g. `staticDoc.html`).
