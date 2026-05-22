/**
 * EstreUV tile components — side-effect import이 <estreuv-*> custom element 를 등록.
 * index.html 의 <script type="module"> 로 로드됨.
 *
 * 이 앱(monorepo in-repo playground)은 EstreUV 를 워크스페이스 의존
 * (`"estreuv": "*"` → packages/estreuv 심링크) 으로 받음. importmap 이
 * `estreuv` / `estreuv/` 를 node_modules/estreuv/src/ 로 매핑.
 *
 * 외부 사용자 시나리오에선 `npm install estreuv` (published) 로 동일 작동.
 */

import 'estreuv/dark-mode-tile.js';
import 'estreuv/clock-tile.js';
import 'estreuv/notif-count-tile.js';
// 사이드바 prototype — nested 컨테이너 + 중첩 lifecycle
import 'estreuv/sidebar.js';
import 'estreuv/sidebar-item.js';

// 콘솔 디버깅용 helper 노출 (page handler 도 이걸 씀)
import * as _intent from 'estreuv/intent-context.js';
import * as _bridge from 'estreuv/lifecycle-bridge.js';
import * as _alias from 'estreuv/alienese-alias.js';

window._estreuv = { intent: _intent, bridge: _bridge, alias: _alias };
window.dispatchEvent(new CustomEvent('estreuv:ready'));
console.log('[estreuv-app] tile components + helpers loaded (estreuv =', _intent ? 'ok' : 'FAIL', ')');
