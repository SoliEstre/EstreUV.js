import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    ESTREUI_LIFECYCLE_NAMES,
    dispatchLifecycle,
    wireArticle,
    getLifecycleHistory,
} from '../src/lifecycle-bridge.js';

/** 최소 fake EstreUV component — lifecycle 메서드가 호출 인자를 기록 */
function makeFakeTile() {
    const el = document.createElement('div');
    el.setAttribute('data-estreuv', '1');
    el.calls = [];
    for (const hook of ESTREUI_LIFECYCLE_NAMES) {
        el[hook] = (...args) => el.calls.push([hook, ...args]);
    }
    return el;
}

describe('lifecycle-bridge', () => {
    let articleRoot, tileA, tileB;

    beforeEach(() => {
        document.body.innerHTML = '';
        articleRoot = document.createElement('article');
        tileA = makeFakeTile();
        tileB = makeFakeTile();
        articleRoot.append(tileA, tileB);
        document.body.append(articleRoot);
    });

    it('ESTREUI_LIFECYCLE_NAMES is the documented 8-hook frozen list', () => {
        expect(ESTREUI_LIFECYCLE_NAMES).toEqual([
            'onBring', 'onOpen', 'onShow', 'onFocus', 'onBlur', 'onHide', 'onClose', 'onRelease',
        ]);
        expect(Object.isFrozen(ESTREUI_LIFECYCLE_NAMES)).toBe(true);
    });

    it('dispatchLifecycle fans out to every [data-estreuv] descendant with args', () => {
        const handle = { pid: '$s&m=home' };
        dispatchLifecycle(articleRoot, 'onShow', handle);
        expect(tileA.calls).toEqual([['onShow', handle]]);
        expect(tileB.calls).toEqual([['onShow', handle]]);
        dispatchLifecycle(articleRoot, 'onFocus', handle, true);
        expect(tileA.calls[1]).toEqual(['onFocus', handle, true]);
    });

    it('per-tick dedup: same (root, hook) dispatched twice synchronously → second skipped', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        dispatchLifecycle(articleRoot, 'onShow');
        dispatchLifecycle(articleRoot, 'onShow');   // synchronous re-entry → skipped
        expect(tileA.calls.filter(c => c[0] === 'onShow')).toHaveLength(1);
        expect(warn).toHaveBeenCalledWith(expect.stringContaining("re-entrant on same root within tick"));
        warn.mockRestore();
    });

    it('per-tick dedup clears after a microtask (next tick dispatch goes through)', async () => {
        dispatchLifecycle(articleRoot, 'onShow');
        await Promise.resolve();                      // flush microtasks → _inFlight clears
        dispatchLifecycle(articleRoot, 'onShow');
        expect(tileA.calls.filter(c => c[0] === 'onShow')).toHaveLength(2);
    });

    it('per-component lifecycle counters + history', () => {
        dispatchLifecycle(articleRoot, 'onBring');
        dispatchLifecycle(articleRoot, 'onOpen');
        dispatchLifecycle(articleRoot, 'onShow');
        expect(tileA._estreuvLifecycleCounts).toEqual({ onBring: 1, onOpen: 1, onShow: 1 });
        const hist = getLifecycleHistory(tileA);
        expect(hist.map(h => h.hook)).toEqual(['onBring', 'onOpen', 'onShow']);
        expect(hist.every(h => typeof h.t === 'number')).toBe(true);
    });

    it('order invariant: non-cyclic hook firing out of order → warns; cyclic hooks may re-fire freely', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        dispatchLifecycle(articleRoot, 'onOpen');
        await Promise.resolve();
        dispatchLifecycle(articleRoot, 'onBring');   // onBring < onOpen → out of order, non-cyclic → warn
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('Lifecycle order violation'));
        warn.mockClear();
        // cyclic: onShow → onHide → onShow is fine, no warning
        await Promise.resolve();
        dispatchLifecycle(articleRoot, 'onShow');
        await Promise.resolve();
        dispatchLifecycle(articleRoot, 'onHide');
        await Promise.resolve();
        dispatchLifecycle(articleRoot, 'onShow');
        expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('Lifecycle order violation'));
        warn.mockRestore();
    });

    it('unknown hook name is rejected with a warning, no dispatch', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        dispatchLifecycle(articleRoot, 'onWhatever');
        expect(tileA.calls).toHaveLength(0);
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('Unknown lifecycle'));
        warn.mockRestore();
    });

    it('component lifecycle method that throws is caught (other components still get dispatched)', () => {
        const err = vi.spyOn(console, 'error').mockImplementation(() => {});
        tileA.onShow = () => { throw new Error('boom'); };
        dispatchLifecycle(articleRoot, 'onShow');
        expect(tileB.calls).toEqual([['onShow']]);  // tileB still called (no extra args passed)
        expect(err).toHaveBeenCalledWith(expect.stringContaining('onShow threw:'), expect.any(Error));
        err.mockRestore();
    });

    it('wireArticle returns one dispatcher per lifecycle name, bound to the root', () => {
        const dispatchers = wireArticle(articleRoot);
        expect(Object.keys(dispatchers).sort()).toEqual([...ESTREUI_LIFECYCLE_NAMES].sort());
        dispatchers.onShow({ pid: 'x' });
        expect(tileA.calls).toEqual([['onShow', { pid: 'x' }]]);
    });
});
