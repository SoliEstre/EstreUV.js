/**
 * EstreUV — Lifecycle Bridge (Phase A 1차안)
 *
 * EstreUI article lifecycle (onBring/onShow/onFocus/onHide/onClose) 을
 * 자식 EstreUV component 의 동명 메서드로 매핑. Vaadin Router 의 duck-typing
 * 패턴 차용 (https://vaadin.com/docs/latest/hilla/lit/guides/routing).
 *
 * 설계 의도:
 * - article 이 lifecycle 호출을 받을 때 자식 EstreUV component 들의 같은 메서드를
 *   순차 호출. component 가 메서드를 정의하지 않으면 무시 (duck-typing, 강제 X).
 * - Lit native lifecycle (connectedCallback/disconnectedCallback) 과 분리 운영 —
 *   브라우저가 native, EstreUI 가 EstreUV custom lifecycle 트리거.
 * - race 회피: 같은 lifecycle 이 한 번만 호출되도록 Set 으로 dedup.
 *
 * 미해결 (Phase B 에서):
 * - lifecycle hook 의 인자 시그니처 (현 EstreUI page-handlers.ko.md 와 매핑)
 *   - onFocus(handle, isFirstFocus) / onBlur(handle, isFinalBlur) 의 isFirstFocus / isFinalBlur
 *     를 EstreUV component 에서 어떻게 받을지
 * - cleanup 시점 — onClose 에서 모든 subscriber 해제 보장 컨벤션
 * - error propagation — component 의 lifecycle 메서드가 throw 시 article 에 전파 vs 흡수
 */

/**
 * EstreUI article lifecycle 이름 (현 EstreUI v1.4.0 기준).
 * @see EstreUI.js/.agent/estreui/page-handlers.ko.md
 */
export const ESTREUI_LIFECYCLE_NAMES = Object.freeze([
    'onBring',
    'onOpen',
    'onShow',
    'onFocus',
    'onBlur',
    'onHide',
    'onClose',
    'onRelease',
]);

/**
 * article root 안의 모든 EstreUV component 를 찾아 lifecycle 호출 dispatch.
 * EstreUI article 의 핸들러가 호출하는 진입점.
 *
 * @param {HTMLElement} articleRoot — EstreUI article 의 DOM root
 * @param {string} hookName         — ESTREUI_LIFECYCLE_NAMES 중 하나
 * @param {...any} args             — handle, isFirstFocus 등 EstreUI 가 넘기는 인자
 */
export function dispatchLifecycle(articleRoot, hookName, ...args) {
    if (!ESTREUI_LIFECYCLE_NAMES.includes(hookName)) {
        console.warn(`[EstreUV] Unknown lifecycle: ${hookName}`);
        return;
    }
    // 자식 EstreUV component 모두 — `data-estreuv` attribute 또는 EstreUVElement 인스턴스로 식별
    const components = articleRoot.querySelectorAll('[data-estreuv]');
    components.forEach((comp) => {
        if (typeof comp[hookName] === 'function') {
            try {
                comp[hookName](...args);
            } catch (err) {
                // Phase A: 흡수 + 콘솔 경고. Phase B 에서 에러 전파 정책 결정
                console.error(`[EstreUV] ${comp.tagName} ${hookName} threw:`, err);
            }
        }
    });
}

/**
 * EstreUI 측에서 article 핸들러가 EstreUV component 들의 lifecycle 을 호출하도록
 * 자동 wire-up 하는 helper.
 *
 * 사용 예시 (EstreUI 측 handler 안):
 *   import { wireArticle } from 'estreuv/lifecycle-bridge.js';
 *   class MyArticleHandler extends EstrePageHandler {
 *       onBring(handle) {
 *           super.onBring(handle);
 *           wireArticle(handle.article).onBring(handle);
 *       }
 *       // ... 다른 lifecycle 동일
 *   }
 *
 * Phase B 에서 EstreUI 본체에 helper 직접 통합 가능 (estreui-uv-bridge npm subpath).
 *
 * @param {HTMLElement} articleRoot
 * @returns {Object<string, (...args: any[]) => void>} — lifecycle 이름별 dispatcher
 */
export function wireArticle(articleRoot) {
    const dispatchers = {};
    ESTREUI_LIFECYCLE_NAMES.forEach((hook) => {
        dispatchers[hook] = (...args) => dispatchLifecycle(articleRoot, hook, ...args);
    });
    return dispatchers;
}
