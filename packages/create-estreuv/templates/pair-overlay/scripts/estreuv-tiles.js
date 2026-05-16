/**
 * EstreUV tile components inside an EstreUI app.
 *
 * A side-effect import registers each <estreuv-*> custom element. Loaded
 * from index.html via <script type="module"> (added by create-estreuv).
 * The import map maps `estreuv` / `estreuv/` to node_modules/estreuv/src/.
 *
 * This module also exposes window.estreuv = { intent, bridge, alias } so
 * the classic EstreUI page handler (scripts/main.js) can wire the article
 * lifecycle into the EstreUV tiles. See ESTREUV-PAIR.md for the handler
 * snippet.
 */

import 'estreuv/dark-mode-tile.js';
import 'estreuv/clock-tile.js';
import 'estreuv/notif-count-tile.js';

import * as intent from 'estreuv/intent-context.js';
import * as bridge from 'estreuv/lifecycle-bridge.js';
import * as alias from 'estreuv/alienese-alias.js';

window.estreuv = { intent, bridge, alias };
window.dispatchEvent(new CustomEvent('estreuv:ready'));
console.log('[estreuv] tile components + helpers loaded');
