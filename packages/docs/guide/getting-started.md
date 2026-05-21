# Getting started

## Scaffold a new app

```sh
npm create estreuv my-app          # choose: pure EstreUV, or EstreUI + EstreUV pair
cd my-app
npm install
npm run dev                        # HTTPS dev server
```

## Add to an existing project

```sh
npm install estreuv
```

`lit` and `@lit/context` are peer-resolved through your import map — no bundler required.

## Manual setup (no build)

### 1. Import map

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

### 2. Use a tile (auto-registers on import)

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

Next: [Components →](/guide/components) · or jump to [Pairing with EstreUI →](/guide/pairing).
