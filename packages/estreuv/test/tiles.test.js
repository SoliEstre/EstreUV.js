import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '../src/dark-mode-tile.js';
import '../src/clock-tile.js';
import '../src/notif-count-tile.js';

describe('tile components (Lit + happy-dom)', () => {

    beforeEach(() => {
        document.body.innerHTML = '';
        localStorage.clear();
    });

    // ─── dark-mode-tile ────────────────────────────────────────────────
    describe('estreuv-dark-mode-tile', () => {
        it('registered + EstreUVElement base (data-estreuv auto-set, lifecycle helpers)', async () => {
            const el = document.createElement('estreuv-dark-mode-tile');
            document.body.append(el);
            await el.updateComplete;
            expect(el.hasAttribute('data-estreuv')).toBe(true);
            expect(typeof el.getLifecycleHistory).toBe('function');
            expect(typeof el.hasLifecycleFired).toBe('function');
            expect(typeof el.requestIntentUpdate).toBe('function');
        });

        it('Alienese alias *t/*c delegate to text/color reactive props (F3)', async () => {
            const el = document.createElement('estreuv-dark-mode-tile');
            document.body.append(el);
            await el.updateComplete;
            el['*t'] = 'AI 테마';
            expect(el.text).toBe('AI 테마');
            el['*c'] = 'tomato';
            expect(el.color).toBe('tomato');
            await el.updateComplete;
            // willUpdate sets host CSS custom property when color changes
            expect(el.style.getPropertyValue('--estreuv-tile-color')).toBe('tomato');
        });

        it('long-form HTML attributes (text/color) flow to reactive props on first render (F3)', async () => {
            document.body.innerHTML = '<estreuv-dark-mode-tile text="테마" color="#7a4dff"></estreuv-dark-mode-tile>';
            const el = document.body.firstElementChild;
            await el.updateComplete;
            expect(el.text).toBe('테마');
            expect(el.color).toBe('#7a4dff');
            expect(el.style.getPropertyValue('--estreuv-tile-color')).toBe('#7a4dff');
        });

        it('cycle() rotates auto→light→dark→auto and delegates via requestIntentUpdate (dual binding)', async () => {
            const el = document.createElement('estreuv-dark-mode-tile');
            document.body.append(el);
            await el.updateComplete;
            const events = [];
            el.addEventListener('intent-update', (e) => events.push(e.detail.patch));
            expect(el.state).toBe('auto');
            el.cycle(); expect(el.state).toBe('light');
            el.cycle(); expect(el.state).toBe('dark');
            el.cycle(); expect(el.state).toBe('auto');
            expect(events).toEqual([{ darkMode: 'light' }, { darkMode: 'dark' }, { darkMode: 'auto' }]);
            // child never mutated context directly — only emitted events (uni-directional)
        });
    });

    // ─── clock-tile ────────────────────────────────────────────────────
    describe('estreuv-clock-tile', () => {
        beforeEach(() => vi.useFakeTimers());
        afterEach(() => vi.useRealTimers());

        it('timer is controlled by lifecycle: onShow starts, onHide stops, no setInterval accumulation', async () => {
            const el = document.createElement('estreuv-clock-tile');
            document.body.append(el);
            await el.updateComplete;
            expect(el.running).toBe(false);

            el.onShow();
            expect(el.running).toBe(true);
            const t1 = el.now;
            vi.advanceTimersByTime(2000);
            expect(el.now).not.toBe(t1);   // ticked

            el.onHide();
            expect(el.running).toBe(false);
            const tStopped = el.now;
            vi.advanceTimersByTime(5000);
            expect(el.now).toBe(tStopped);  // frozen — timer cleared

            // re-show then onShow again should NOT double the interval
            el.onShow(); el.onShow();   // second is a no-op (guard: _timerId != null)
            const tA = el.now;
            vi.advanceTimersByTime(1000);
            const tB = el.now;
            vi.advanceTimersByTime(1000);
            expect(tA).not.toBe(tB);  // single tick per second, not double
        });

        it('onClose / onRelease / disconnectedCallback all stop the timer (cleanup safety)', async () => {
            const el = document.createElement('estreuv-clock-tile');
            document.body.append(el);
            await el.updateComplete;
            el.onShow(); expect(el.running).toBe(true);
            el.onClose(); expect(el.running).toBe(false);
            el.onShow(); expect(el.running).toBe(true);
            el.onRelease(); expect(el.running).toBe(false);
            el.onShow(); expect(el.running).toBe(true);
            el.remove();  // triggers disconnectedCallback
            expect(el.running).toBe(false);
        });

        it('*fmt alias → format prop; switching to 12h reformats now', async () => {
            const el = document.createElement('estreuv-clock-tile');
            document.body.append(el);
            await el.updateComplete;
            expect(el.format).toBe('24h');
            el['*fmt'] = '12h';
            expect(el.format).toBe('12h');
            await el.updateComplete;
            expect(el.now).toMatch(/(AM|PM)$/);
        });
    });

    // ─── notif-count-tile ──────────────────────────────────────────────
    describe('estreuv-notif-count-tile', () => {
        it('count attribute (string) normalized to number; maxDisplay cap renders "N+"', async () => {
            document.body.innerHTML = '<estreuv-notif-count-tile count="128" max="99"></estreuv-notif-count-tile>';
            const el = document.body.firstElementChild;
            await el.updateComplete;
            expect(el._numCount).toBe(128);
            expect(el._displayCount()).toBe('99+');
        });

        it('bump()/clear() update count and delegate via requestIntentUpdate (dual binding)', async () => {
            const el = document.createElement('estreuv-notif-count-tile');
            document.body.append(el);
            await el.updateComplete;
            const events = [];
            el.addEventListener('intent-update', (e) => events.push(e.detail.patch));
            el.bump();      expect(el.count).toBe(1);   // count = reactive prop (sync source of truth)
            el.bump(4);     expect(el.count).toBe(5);   // accumulates from this.count, not lagging _numCount
            el.clear();     expect(el.count).toBe(0);
            await el.updateComplete;
            expect(el._numCount).toBe(0);               // normalized render value settles
            expect(events).toEqual([{ notifCount: 1 }, { notifCount: 5 }, { notifCount: 0 }]);
        });

        it('*c / *max aliases delegate to count / maxDisplay', async () => {
            const el = document.createElement('estreuv-notif-count-tile');
            document.body.append(el);
            await el.updateComplete;
            el['*c'] = 7;
            expect(el.count).toBe(7);
            await el.updateComplete;
            expect(el._numCount).toBe(7);
            el['*max'] = 5;
            expect(el.maxDisplay).toBe(5);
            await el.updateComplete;
            expect(el._displayCount()).toBe('5+');
        });

        it('onShow syncs from intent.notifCount (re-visit picks latest)', async () => {
            const el = document.createElement('estreuv-notif-count-tile');
            document.body.append(el);
            await el.updateComplete;
            expect(el._numCount).toBe(0);
            el.intent = { notifCount: 42 };   // simulate intent context value
            el.onShow();
            await el.updateComplete;
            expect(el._numCount).toBe(42);
        });
    });
});
