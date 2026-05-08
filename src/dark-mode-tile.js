/**
 * EstreUV — Dark Mode Tile (Phase A 첫 tile 컴포넌트)
 *
 * EstreUI v1.3.0 의 overwatchPanel 안 다크 모드 토글 tile 을 EstreUV 컴포넌트로 변환.
 *
 * 검증 목표:
 * - F2 부분: EstreUI 없이도 단독 페이지에서 작동 (글로벌 darkMode API 가 없으면
 *   localStorage 직접 사용으로 fallback)
 * - D1: raw Lit 동등 구현 대비 LoC 비교 base
 *
 * 미구현 (Phase B 에서):
 * - EstreUI 와 함께 사용 시 estreUi.cycleDarkMode() 호출 (현재는 직접 토글)
 * - intent 에서 darkMode 상태 읽기 (현재는 컴포넌트가 직접 localStorage 관리)
 * - Alienese 단축 attribute 적용 (`*bg` 등)
 */

import { html, css } from 'lit';
import { EstreUVElement } from './estreuv-element.js';

const STORAGE_KEY = 'estreuv-spike.darkMode';

export class DarkModeTile extends EstreUVElement {

    static properties = {
        ...EstreUVElement.properties,
        /** 'auto' | 'light' | 'dark' */
        state: { type: String, reflect: true, attribute: 'data-dark-mode-state' },
    };

    static styles = css`
        :host {
            display: inline-flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            padding: 8px 12px;
            border: 1px solid currentColor;
            border-radius: 8px;
            cursor: pointer;
            user-select: none;
            min-width: 64px;
            font-family: system-ui, sans-serif;
        }
        :host(:hover) {
            opacity: 0.85;
        }
        .icon {
            font-size: 1.6rem;
            line-height: 1;
        }
        .label {
            font-size: 0.8rem;
            text-transform: capitalize;
        }
    `;

    constructor() {
        super();
        this.state = this._loadInitial();
        this._applyToBody();
    }

    /** localStorage 또는 OS prefers-color-scheme 으로 초기 상태 결정 */
    _loadInitial() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === '1') return 'dark';
        if (saved === '0') return 'light';
        return 'auto';
    }

    /** body[data-dark-mode] 속성으로 적용. EstreUI 가 있으면 위임, 없으면 직접 */
    _applyToBody() {
        const isDark = this._effectiveIsDark();
        if (typeof window.estreUi?.setDarkMode === 'function') {
            // EstreUI 와 함께 사용 — 본체 API 위임 (Phase B 에서 강화)
            const value = this.state === 'auto' ? null : (this.state === 'dark');
            window.estreUi.setDarkMode(value);
        } else {
            // 단독 사용 — body[data-dark-mode] 직접 설정 (F2 검증 경로)
            document.body.toggleAttribute('data-dark-mode', isDark);
        }
    }

    _effectiveIsDark() {
        if (this.state === 'dark') return true;
        if (this.state === 'light') return false;
        return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    }

    cycle() {
        const next = this.state === 'auto' ? 'light'
                   : this.state === 'light' ? 'dark'
                   : 'auto';
        this.state = next;
        if (next === 'dark') localStorage.setItem(STORAGE_KEY, '1');
        else if (next === 'light') localStorage.setItem(STORAGE_KEY, '0');
        else localStorage.removeItem(STORAGE_KEY);
        this._applyToBody();
        // intent 변경도 위임 (article 이 받아서 처리 가능)
        this.requestIntentUpdate({ darkMode: next });
    }

    render() {
        const icon = this.state === 'dark' ? '☾' : this.state === 'light' ? '☀' : '🌓';
        return html`
            <div class="icon" aria-hidden="true">${icon}</div>
            <div class="label">${this.state}</div>
        `;
    }

    firstUpdated() {
        this.addEventListener('click', () => this.cycle());
    }

    // ─── EstreUI 라이프사이클 override 예시 (Phase B 에서 검증) ──────────

    onShow(handle) {
        super.onShow(handle);
        // 다른 디바이스에서 변경된 darkMode 가 있을 수 있으므로 재로드
        const saved = this._loadInitial();
        if (saved !== this.state) {
            this.state = saved;
            this._applyToBody();
        }
    }
}

customElements.define('estreuv-dark-mode-tile', DarkModeTile);
