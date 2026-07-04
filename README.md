# EstreUV.js

[![npm version](https://img.shields.io/npm/v/estreuv.svg)](https://www.npmjs.com/package/estreuv) [![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE) [![docs](https://img.shields.io/badge/docs-estre.nm3.kr%2Fuv-2a8c82.svg)](https://estre.nm3.kr/uv/)

**Micro-Rimwork** — a Lit class primitive, sister to [EstreUI.js](https://github.com/SoliEstre/EstreUI.js)'s
macro-Rimwork (jQuery class primitive). Build self-registering web components that drop into an EstreUI
article and inherit its lifecycle — or run fully standalone. No build step (Lit core only).

> **1.0.0 — GA.** Stable public API. 📖 [Documentation → estre.nm3.kr/uv](https://estre.nm3.kr/uv/)

## What is EstreUV?

EstreUV is the **micro** half of the Estre Rimwork pair: small, self-contained Lit custom elements
("tiles"). Its macro sister [EstreUI](https://github.com/SoliEstre/EstreUI.js) drives page/section
layout (jQuery-class primitive); EstreUV drives the widgets inside. One [EstreUX](https://github.com/SoliEstre/EstreUX)
`.eux` spec expands to both targets (γ-EstreUX-driven), so the same intent can render as a macro flow,
a micro element, or a paired app.

A component built on `EstreUVElement`:

- works **standalone** (plain `connectedCallback`), and
- when placed in an EstreUI article, **inherits the eight EstreUI lifecycle hooks** through a flat
  bridge — the native Lit channel and the EstreUI channel stay separate, so behavior is identical with
  or without EstreUI.

## Features

- **Lifecycle bridge** — `onBring`/`onOpen`/`onShow`/`onFocus`/`onBlur`/`onHide`/`onClose`/`onRelease`
  via a flat dispatch, deduped per tick so each fires exactly once.
- **Intent context** — uni-directional state over `@lit/context`: providers push *down*, components
  request changes *up* (no two-way binding race).
- **Alienese aliases** — short attribute aliases (`*t`→`text`, `*c`→`color`, …) at zero build cost.
- **Tiles** — ready-made `dark-mode` / `clock` / `notif-count` / `sidebar` elements, self-registering.
- **No build** — `lit` / `@lit/context` peer-resolved via import map. ~727 LoC core · 4.55 KB min+gzip
  (Lit external, measured 2026-07 via `scripts/measure-bundle.mjs`).

## Install

```sh
npm install estreuv          # the library
npm create estreuv@latest    # scaffold a new app (create-estreuv)
```

`lit` and `@lit/context` are peer-resolved via your import map — no bundler required. See the
[package README](packages/estreuv/README.md) for the import map and the 5-minute quickstart.

## Quickstart

```js
import { EstreUVElement } from 'estreuv';
import { html } from 'lit';

class CounterTile extends EstreUVElement {
  static properties = { count: { type: Number } };
  count = 0;
  render() {
    return html`<button @click=${() => this.count++}>${this.count}</button>`;
  }
}
customElements.define('counter-tile', CounterTile);
```

```html
<counter-tile></counter-tile>
```

That's the whole standalone path — no EstreUI, no bundler. For the EstreUI lifecycle pairing, intent
context, and Alienese aliases, see the [package README](packages/estreuv/README.md) or the
[docs site](https://estre.nm3.kr/uv/).

## Ecosystem

| Layer | Package | Role |
| --- | --- | --- |
| **macro**-Rimwork | [estreui](https://github.com/SoliEstre/EstreUI.js) | page / section flow (jQuery-class primitive) |
| **micro**-Rimwork | **estreuv** | widget elements (Lit-class primitive) — *this repo* |
| **meta** layer | [EstreUX](https://github.com/SoliEstre/EstreUX) | `.eux` → expands to both (dev-time, runtime-free) |

## Monorepo layout

| Package | npm | Purpose |
| --- | --- | --- |
| [`packages/estreuv`](packages/estreuv) | [`estreuv`](https://www.npmjs.com/package/estreuv) | the library — micro-Rimwork (intent context, lifecycle bridge, Alienese, tiles) |
| [`packages/create-estreuv`](packages/create-estreuv) | [`create-estreuv`](https://www.npmjs.com/package/create-estreuv) | scaffold CLI (`npm create estreuv`) |
| [`packages/docs`](packages/docs) | (private) | VitePress site → [estre.nm3.kr/uv](https://estre.nm3.kr/uv/) |
| [`packages/playground`](packages/playground) | (private) | in-repo demo / test / template — EstreUI + EstreUV pair app |

## Development

```sh
npm install            # all workspaces
npm run test           # estreuv vitest suite (39 tests)
npm run measure        # bundle measurement (LoC / gzip)
npm run dev            # playground dev server
```

## Releasing

[Changesets](https://github.com/changesets/changesets)-driven independent versioning
([`.changeset/README.md`](.changeset/README.md)): `npm run version-packages` (apply changesets) →
`npm run release` (`changeset publish`). `npm publish` is performed by the maintainer (npm auth
session required).

## License

[MIT](LICENSE) © SoliEstre
