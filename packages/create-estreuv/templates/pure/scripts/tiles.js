/**
 * EstreUV tile components — a side-effect import registers each
 * <estreuv-*> custom element. Loaded from index.html via
 * <script type="module">. The import map maps `estreuv` /
 * `estreuv/` to node_modules/estreuv/src/.
 *
 * Author your own component by extending EstreUVElement:
 *
 *   import { EstreUVElement } from 'estreuv';
 *   import { html } from 'lit';
 *   class MyTile extends EstreUVElement {
 *     render() { return html`<button>hi</button>`; }
 *   }
 *   customElements.define('my-tile', MyTile);
 */

import 'estreuv/dark-mode-tile.js';
import 'estreuv/clock-tile.js';
import 'estreuv/notif-count-tile.js';

// Optional helpers (intent context / lifecycle bridge / Alienese aliases)
import * as intent from 'estreuv/intent-context.js';
import * as bridge from 'estreuv/lifecycle-bridge.js';
import * as alias from 'estreuv/alienese-alias.js';

window.estreuv = { intent, bridge, alias };
console.log('[estreuv] tile components + helpers loaded');
