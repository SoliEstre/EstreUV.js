/**
 * EstreUV — Base Element (Phase A 1차안)
 *
 * LitElement 위에 EstreUV 의 컨벤션 layer 추가.
 *
 * 추가하는 것:
 * - intent context 자동 consume (자식이 별도 wiring 없이 받음)
 * - data-estreuv 속성 자동 부여 (lifecycle bridge 가 식별)
 * - 5 라이프사이클 메서드 placeholder (override 안 하면 noop)
 *
 * 미구현 (Phase B 에서):
 * - Alienese alias attribute 시스템 (`*t` · `*bg` 등) — Spectrum SpectrumMixin 패턴 차용 예정
 * - Active Struct ↔ reactive property dual binding race 회피 컨벤션
 * - intent → reactive property 자동 매핑 옵션
 */

import { LitElement } from 'lit';
import { consumeIntent, requestIntentUpdate } from './intent-context.js';

export class EstreUVElement extends LitElement {

    static properties = {
        /** intent context 의 현 값 (subscribe 갱신) */
        intent: { state: true },
        /** EstreUI lifecycle 의 1회성 플래그 (debug 용) */
        _everShown: { state: true },
        _everFocused: { state: true },
    };

    constructor() {
        super();
        this.intent = {};
        this._everShown = false;
        this._everFocused = false;
        // 자동 consume: 부모 article 이 provide 하지 않아도 안전 (default {} 유지)
        this._intentConsumer = consumeIntent(this, (intent) => {
            this.intent = intent ?? {};
        });
    }

    connectedCallback() {
        super.connectedCallback();
        // lifecycle bridge 가 식별할 attribute 부여
        if (!this.hasAttribute('data-estreuv')) {
            this.setAttribute('data-estreuv', '1');
        }
    }

    /**
     * Child → Parent intent 변경 위임 (uni-directional).
     * 직접 this.intent = ... 하지 말고 이 메서드 호출.
     * @param {Object} patch
     */
    requestIntentUpdate(patch) {
        requestIntentUpdate(this, patch);
    }

    // ─── EstreUI 라이프사이클 placeholder (override 안 하면 noop) ───────────

    /** 페이지가 데이터·intent 와 함께 가져와짐. 첫 1회는 onOpen 직전 */
    onBring(handle) {}

    /** 페이지가 처음 열림. 1회성 초기화 적합 */
    onOpen(handle) {}

    /** 화면에 표시됨. 매번 호출 (재방문 시도 매번) */
    onShow(handle) { this._everShown = true; }

    /** 포커스 받음. isFirstFocus 는 첫 포커스 여부 */
    onFocus(handle, isFirstFocus) {
        if (isFirstFocus) this._everFocused = true;
    }

    /** 포커스 잃음. isFinalBlur 는 페이지 종료 동반 여부 */
    onBlur(handle, isFinalBlur) {}

    /** 화면에서 가려짐 */
    onHide(handle) {}

    /** 페이지 종료 — cleanup */
    onClose(handle) {
        // subscriber 해제 등 cleanup 컨벤션 (Phase B 에서 강화)
    }

    /** 인스턴스 release */
    onRelease(handle) {}
}
