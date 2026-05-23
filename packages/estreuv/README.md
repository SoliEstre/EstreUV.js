# estreuv

**Micro-Rimwork** — a Lit class primitive, sister to [EstreUI.js](https://github.com/SoliEstre/EstreUI.js)'s
macro-Rimwork (jQuery class primitive). Build self-registering web components that drop into an EstreUI
article and receive its lifecycle, or run fully standalone.

> **1.0.0 — GA.** Stable public API. No build step. Lit core only. 📖 [estre.nm3.kr/uv](https://estre.nm3.kr/uv/)

## Install

```sh
npm install estreuv
```

`lit` and `@lit/context` are peer-resolved through your import map (no bundler required).

## 5-minute quickstart

### 1. Import map (no build)

```html
<script type="importmap">
{
  "imports": {
    "lit": "/node_modules/lit/index.js",
    "lit/": "/node_modules/lit/",
    "@lit/context": "/node_modules/@lit/context/index.js",
    "@lit/reactive-element": "/node_modules/@lit/reactive-element/reactive-element.js",
    "@lit/reactive-element/": "/node_modules/@lit/reactive-element/",
    "lit-element/lit-element.js": "/node_modules/lit-element/lit-element.js",
    "lit-html": "/node_modules/lit-html/lit-html.js",
    "lit-html/": "/node_modules/lit-html/",
    "estreuv": "/node_modules/estreuv/src/index.js",
    "estreuv/": "/node_modules/estreuv/src/"
  }
}
</script>
```

### 2. Use a tile (component auto-registers on import)

```html
<estreuv-dark-mode-tile></estreuv-dark-mode-tile>
<estreuv-dark-mode-tile text="Theme" color="#2a8"></estreuv-dark-mode-tile>

<script type="module" src="/node_modules/estreuv/src/dark-mode-tile.js"></script>
```

That is the whole standalone path — no EstreUI, no bundler.

### 3. Author your own component

```js
import { EstreUVElement } from 'estreuv';
import { html } from 'lit';

class MyTile extends EstreUVElement {
  static properties = { count: { type: Number } };
  count = 0;
  render() {
    return html`<button @click=${() => this.count++}>${this.count}</button>`;
  }
}
customElements.define('my-tile', MyTile);
```

## EstreUI pairing

When a component lives inside an EstreUI article, wire it once and it receives the eight EstreUI
lifecycle hooks (`onBring` / `onOpen` / `onShow` / `onFocus` / `onBlur` / `onHide` / `onClose` /
`onRelease`) via a flat dispatch — with per-tick dedup so each fires exactly once:

```js
import { wireArticle } from 'estreuv';

// inside the article's page handler
wireArticle(articleElement);
```

The Lit native channel (`connectedCallback`) and the EstreUI channel (`onShow`) stay separate, so a
component works identically with or without EstreUI.

## Intent context (prop-down / event-up)

Uni-directional state sharing via `@lit/context` — providers push intent down, components request
changes up (no two-way binding race):

```js
import { provideIntent, consumeIntent, requestIntentUpdate } from 'estreuv';

provideIntent(host, { darkMode: 'dark', notifCount: 0 }); // provider
const intent = consumeIntent(this);                        // consumer
requestIntentUpdate(this, { notifCount: 3 });              // event-up
```

## Alienese aliases

Short attribute aliases map to reactive properties at zero build cost:

```js
import { applyAliases } from 'estreuv';

class MyTile extends EstreUVElement {
  static aliases = { '*t': 'text', '*c': 'color' };
}
applyAliases(MyTile);
```

`ALIENESE_DEFAULT_ALIASES` covers `*t`→`text`, `*bg`→`background`, `*c`→`color`, `*sz`→`size`,
`*on`→`enabled`, `*ic`→`icon`. Use long-form attribute names in HTML; the `*`-prefixed identifiers are
the JS-side convention only.

## API surface

| Export | From |
| --- | --- |
| `EstreUVElement` | base class (LitElement + EstreUI lifecycle bridge) |
| `wireArticle`, `dispatchLifecycle`, `getLifecycleHistory`, `ESTREUI_LIFECYCLE_NAMES` | lifecycle bridge |
| `provideIntent`, `consumeIntent`, `requestIntentUpdate`, `intentContext` | intent context |
| `applyAliases`, `resolveAlias`, `isAliasApplied`, `ALIENESE_DEFAULT_ALIASES` | Alienese aliases |

Bundled tiles: `estreuv/dark-mode-tile.js`, `estreuv/clock-tile.js`, `estreuv/notif-count-tile.js`,
`estreuv/sidebar.js`, `estreuv/sidebar-item.js`.

## Footprint

~689 LoC core · 4.31 KB min+gzip (Lit external) · Lit core only, no Lit Labs.

## License

MIT © SoliEstre
