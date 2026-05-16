# EstreUV app

A pure [EstreUV.js](https://github.com/SoliEstre/EstreUV.js) app — micro-Rimwork
(Lit class primitive), no build step.

## Develop

```sh
npm install
npm run dev      # HTTPS dev server (estreuv dev)
```

Open the printed `https://localhost:8080/`.

## Structure

- `index.html` — import map (lit + estreuv) + tile markup
- `scripts/tiles.js` — registers `<estreuv-*>` components; author your own here

## Author a component

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

See the [estreuv README](https://github.com/SoliEstre/EstreUV.js/tree/main/packages/estreuv#readme)
for the intent context, EstreUI pairing, and Alienese aliases.
