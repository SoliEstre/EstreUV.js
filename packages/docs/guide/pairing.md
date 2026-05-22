# Pairing with EstreUI

EstreUV is designed to live inside an [EstreUI](https://github.com/SoliEstre/EstreUI.js) app — EstreUI
drives the page/article shell, EstreUV brings Lit components into it. Scaffold the pair with:

```sh
npm create estreuv my-app -- --pair
```

This produces an EstreUI app (via `create-estreui`) plus the EstreUV overlay: an import map,
`scripts/estreuv-tiles.js` (registers `<estreuv-*>` elements + exposes `window.estreuv`), the
`estreuv` / `lit` / `@lit/context` dependencies, and `ESTREUV-PAIR.md` with the one wiring step.

## The wiring step

`scripts/main.js` is yours; the scaffolder never overwrites it. Add a page handler that propagates the
EstreUI lifecycle into the tiles and attaches the intent provider:

```js
const estreuvReady = window.estreuv
  ? Promise.resolve()
  : new Promise(r => addEventListener('estreuv:ready', () => r(), { once: true }));

class HomePageHandler extends EstrePageHandler {
  onOpen(handle) {
    super.onOpen?.(handle);
    const root = handle?.article ?? document;
    if (root && window.estreuv && !this._intent) {
      this._intent = window.estreuv.intent.provideIntent(root, { step: 'home' });
      this._lifecycle = window.estreuv.bridge.wireArticle(root);
      root.addEventListener('intent-update', e => this._intent.update(e.detail.patch));
    }
    this.toTiles(handle, 'onOpen');
  }
  onShow(handle)  { super.onShow?.(handle);  this.toTiles(handle, 'onShow'); }
  onHide(handle)  { super.onHide?.(handle);  this.toTiles(handle, 'onHide'); }
  // ... onBring/onFocus/onBlur/onClose/onRelease likewise

  toTiles(handle, hook, ...args) {
    const root = handle?.article ?? document;
    root.querySelectorAll('[data-estreuv]').forEach($tile => {
      try { typeof $tile[hook] === 'function' && $tile[hook](handle, ...args); }
      catch (err) { console.error(`[estreuv] tile.${hook} threw:`, err); }
    });
  }
}
```

Then register `HomePageHandler` for your page and `await estreuvReady` before `estreUi.init()` so the
tiles exist when `onOpen` wires the provider.

## Why a race-safe await

The tile module loads asynchronously and dispatches `estreuv:ready`. Awaiting it before EstreUI brings
the page guarantees the `[data-estreuv]` elements are present when the lifecycle first fires — and the
[per-tick dedup](/guide/lifecycle#per-tick-dedup) absorbs any double dispatch during boot.

## Live example — the playground

The [playground](https://github.com/SoliEstre/EstreUV.js/tree/main/packages/playground) is a complete
pair app: an **inbox panel** where a sidebar (folder nav), a message list, an unread badge, a clock, and
a theme toggle all share **one intent** (`{ sidebarActive, counts, notifCount, darkMode }`). Clicking a
folder, reading a message, or a simulated incoming notification flows **event-up → intent → prop-down**,
so several tiles react at once from a single source of truth — the strong-coupling the bridge enables.

```sh
git clone https://github.com/SoliEstre/EstreUV.js
cd EstreUV.js && npm install
npm run dev              # playground
```
