/**
 * D1 baseline — the SAME dark-mode tile written in raw Lit (plain
 * LitElement), with the same end-user behavior as the EstreUV version:
 * auto/light/dark cycle, localStorage persistence, body[data-dark-mode]
 * (delegating to estreUi if present), long-form text/color props, color
 * host CSS custom property, click-to-cycle.
 *
 * It deliberately OMITS the EstreUV-only capabilities (intent context,
 * EstreUI lifecycle bridge, Alienese short aliases) because a plain-Lit
 * author would not hand-write those. This is the honest "what you'd
 * write without EstreUV" reference for the LoC delta. Not shipped
 * (excluded from the npm package via the `files` field).
 */

import { LitElement, html, css } from 'lit';

const STORAGE_KEY = 'estreuv-spike.darkMode';

export class DarkModeTileRawLit extends LitElement {

    static properties = {
        state: { type: String, reflect: true, attribute: 'data-dark-mode-state' },
        text: { type: String },
        color: { type: String },
    };

    static styles = css`
        :host {
            display: inline-flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            padding: 8px 12px;
            border: 1px solid var(--estreuv-tile-color, currentColor);
            border-radius: 8px;
            cursor: pointer;
            user-select: none;
            min-width: 64px;
            font-family: system-ui, sans-serif;
            color: var(--estreuv-tile-color, inherit);
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

    _loadInitial() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === '1') return 'dark';
        if (saved === '0') return 'light';
        return 'auto';
    }

    _applyToBody() {
        const isDark = this._effectiveIsDark();
        if (typeof window.estreUi?.setDarkMode === 'function') {
            const value = this.state === 'auto' ? null : (this.state === 'dark');
            window.estreUi.setDarkMode(value);
        } else {
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
    }

    willUpdate(changedProperties) {
        if (changedProperties.has('color')) {
            if (this.color) {
                this.style.setProperty('--estreuv-tile-color', this.color);
            } else {
                this.style.removeProperty('--estreuv-tile-color');
            }
        }
    }

    render() {
        const icon = this.state === 'dark' ? '☾' : this.state === 'light' ? '☀' : '🌓';
        const labelText = this.text || this.state;
        return html`
            <div class="icon" aria-hidden="true">${icon}</div>
            <div class="label">${labelText}</div>
        `;
    }

    firstUpdated() {
        this.addEventListener('click', () => this.cycle());
    }
}

customElements.define('dark-mode-tile-raw-lit', DarkModeTileRawLit);
