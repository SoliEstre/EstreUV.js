# Components

EstreUV components extend `EstreUVElement` — a `LitElement` subclass that adds the EstreUI convention
layer on top of Lit.

```js
import { EstreUVElement } from 'estreuv';
import { html, css } from 'lit';

class CounterTile extends EstreUVElement {
  static properties = { count: { type: Number } };
  static styles = css`button { font: inherit; padding: 8px 12px; }`;

  count = 0;

  render() {
    return html`<button @click=${() => this.count++}>${this.count}</button>`;
  }
}
customElements.define('counter-tile', CounterTile);
```

## What `EstreUVElement` adds

- **Auto intent consume** — the element subscribes to the nearest intent provider with no extra wiring;
  the current value is on `this.intent` (read-only from the child — see [Intent context](/guide/intent)).
- **`data-estreuv` marker** — set in `connectedCallback` so the [lifecycle bridge](/guide/lifecycle) can
  find the element.
- **Eight lifecycle placeholders** — `onBring` / `onOpen` / `onShow` / `onFocus` / `onBlur` / `onHide` /
  `onClose` / `onRelease`, no-ops until you override them.
- **Lifecycle introspection** — `getLifecycleHistory()` and `hasLifecycleFired(name)` for debugging.

## Two separate channels

The **Lit native channel** (`connectedCallback`, `firstUpdated`, …) and the **EstreUI channel**
(`onShow`, …) are independent — neither calls the other. Split init responsibilities accordingly:

| Concern | Where |
| --- | --- |
| DOM-dependent init | `connectedCallback` / `firstUpdated` |
| data / intent binding | `onBring` (once) · `onShow` (re-entry) |
| visibility-dependent | `onShow` · `onHide` |
| teardown | `onClose` · `onRelease` |

This separation is what lets the same component work identically with or without EstreUI.
