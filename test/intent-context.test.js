import { describe, it, expect, beforeEach } from 'vitest';
import { LitElement } from 'lit';
import { intentContext, provideIntent, consumeIntent, requestIntentUpdate } from '../src/intent-context.js';

describe('intent-context', () => {
    let host;

    beforeEach(() => {
        document.body.innerHTML = '';
        host = document.createElement('div');
        document.body.append(host);
    });

    it('provideIntent → consumeIntent: child receives initial value', async () => {
        const api = provideIntent(host, { step: 'home', flags: { a: true } });
        // consumer 는 ContextProvider/Consumer 가 element 의 connectedCallback 에서 작동하므로 ReactiveElement 필요
        let received = null;
        class Consumer extends LitElement {
            constructor() { super(); this._c = consumeIntent(this, (v) => { received = v; }); }
            render() { return ''; }
        }
        if (!customElements.get('test-intent-consumer-1')) customElements.define('test-intent-consumer-1', Consumer);
        const child = document.createElement('test-intent-consumer-1');
        host.append(child);
        await child.updateComplete;
        expect(received).toEqual({ step: 'home', flags: { a: true } });
        expect(api.provider.value).toEqual({ step: 'home', flags: { a: true } });
    });

    it('update(patch) merges (reference changes → consumer re-notified); replace(next) overwrites', async () => {
        const api = provideIntent(host, { step: 'home', data: { x: 1 } });
        let received = [];
        class Consumer extends LitElement {
            constructor() { super(); this._c = consumeIntent(this, (v) => received.push(v)); }
            render() { return ''; }
        }
        if (!customElements.get('test-intent-consumer-2')) customElements.define('test-intent-consumer-2', Consumer);
        const child = document.createElement('test-intent-consumer-2');
        host.append(child);
        await child.updateComplete;

        api.update({ darkMode: 'dark' });
        expect(api.provider.value).toEqual({ step: 'home', data: { x: 1 }, darkMode: 'dark' }); // merged
        const before = api.provider.value;
        api.update({ darkMode: 'light' });
        expect(api.provider.value).not.toBe(before);  // new reference (consumer re-notified)

        api.replace({ step: 'gallery' });
        expect(api.provider.value).toEqual({ step: 'gallery' });  // full overwrite
        // consumer received initial + at least the updates
        expect(received.length).toBeGreaterThanOrEqual(2);
        expect(received[received.length - 1]).toEqual({ step: 'gallery' });
    });

    it('requestIntentUpdate dispatches a bubbling+composed "intent-update" CustomEvent with { patch }', () => {
        const child = document.createElement('span');
        host.append(child);
        let captured = null;
        host.addEventListener('intent-update', (e) => { captured = e; });
        requestIntentUpdate(child, { notifCount: 7 });
        expect(captured).toBeTruthy();
        expect(captured.detail).toEqual({ patch: { notifCount: 7 } });
        expect(captured.bubbles).toBe(true);
        expect(captured.composed).toBe(true);
    });

    it('end-to-end uni-directional loop: child requestIntentUpdate → article listener → provider.update', () => {
        const api = provideIntent(host, { step: 'home' });
        host.addEventListener('intent-update', (e) => api.update(e.detail.patch));
        const child = document.createElement('span');
        host.append(child);
        requestIntentUpdate(child, { darkMode: 'dark' });
        expect(api.provider.value).toEqual({ step: 'home', darkMode: 'dark' });
    });

    it('intentContext is a stable context key', () => {
        // @lit/context createContext(key) returns the key itself — here a unique Symbol
        expect(intentContext).toBeTruthy();
        expect(typeof intentContext === 'symbol' || typeof intentContext === 'object').toBe(true);
    });
});
