/**
 * EstreUV tile components — side-effect import이 <estreuv-*> custom element 를 등록.
 * index.html 의 <script type="module"> 로 로드됨.
 *
 * 이 앱은 EstreUV 를 npm 의존 (`file:../EstreUV-spike`, 패키지명 `estreuv`) 으로 받음.
 * importmap 이 `estreuv` / `estreuv/` 를 node_modules/estreuv/src/ 로 매핑.
 *
 * GA 시점엔 `npm install estreuv` (published) 로 동일하게 작동.
 */

import 'estreuv/dark-mode-tile.js';
import 'estreuv/clock-tile.js';
import 'estreuv/notif-count-tile.js';
// Notelle 사이드바 prototype — nested 컨테이너 + 중첩 lifecycle
import 'estreuv/notelle-sidebar.js';
import 'estreuv/notelle-item.js';

// 콘솔 디버깅용 helper 노출 (page handler 도 이걸 씀)
import * as _intent from 'estreuv/intent-context.js';
import * as _bridge from 'estreuv/lifecycle-bridge.js';
import * as _alias from 'estreuv/alienese-alias.js';

window._estreuv = { intent: _intent, bridge: _bridge, alias: _alias };
window.dispatchEvent(new CustomEvent('estreuv:ready'));
console.log('[estreuv-app] tile components + helpers loaded (estreuv =', _intent ? 'ok' : 'FAIL', ')');
