import { describe, it, expect } from 'vitest';
import { applyAliases, resolveAlias, isAliasApplied, ALIENESE_DEFAULT_ALIASES } from '../src/alienese-alias.js';

// applyAliases 는 순수 JS 유틸 (Lit 비의존) — static.properties 확장 + prototype alias getter/setter.
// Lit reactive property 머신은 customElements.define 시 finalize 되므로, 여기선 plain class 로 메커니즘만 검증.
// Lit 통합 (alias → reactive prop → render) 은 test/tiles.test.js 에서 실 컴포넌트로 검증.

describe('alienese-alias', () => {

    it('resolveAlias maps Alienese form → long-form, passes through unknown', () => {
        expect(resolveAlias('*t')).toBe('text');
        expect(resolveAlias('*bg')).toBe('background');
        expect(resolveAlias('text')).toBe('text');       // already long-form
        expect(resolveAlias('*unknown')).toBe('*unknown'); // unknown passes through
    });

    it('ALIENESE_DEFAULT_ALIASES contains the documented base set', () => {
        expect(ALIENESE_DEFAULT_ALIASES['*t']).toBe('text');
        expect(ALIENESE_DEFAULT_ALIASES['*bg']).toBe('background');
        expect(ALIENESE_DEFAULT_ALIASES['*c']).toBe('color');
        expect(ALIENESE_DEFAULT_ALIASES['*sz']).toBe('size');
    });

    it('applyAliases expands static.properties with long-form names (reflect: true)', () => {
        class T1 {
            static aliases = { '*t': 'text', '*c': 'color' };
            static properties = { state: { type: String } };
        }
        applyAliases(T1);
        expect(T1.properties.state).toBeTruthy();          // existing kept
        expect(T1.properties.text).toEqual({ type: String, reflect: true });
        expect(T1.properties.color).toEqual({ type: String, reflect: true });
        expect(isAliasApplied(T1)).toBe(true);
    });

    it('applyAliases installs Alienese-form getter/setter delegating to long-form', () => {
        class T2 {
            static aliases = { '*t': 'text' };
            static properties = {};
        }
        applyAliases(T2);
        const el = new T2();
        el.text = 'hello';
        expect(el['*t']).toBe('hello');     // getter delegates
        el['*t'] = 'world';
        expect(el.text).toBe('world');      // setter delegates
    });

    it('applyAliases does not overwrite a long-form already declared in properties', () => {
        class T3 {
            static aliases = { '*c': 'count' };
            static properties = { count: { type: Number, reflect: true, attribute: 'data-count' } };
        }
        applyAliases(T3);
        // existing { type: Number, attribute: 'data-count' } must be preserved, NOT replaced with { type: String }
        expect(T3.properties.count.type).toBe(Number);
        expect(T3.properties.count.attribute).toBe('data-count');
    });

    it('applyAliases is idempotent (second call is a no-op)', () => {
        class T4 {
            static aliases = { '*t': 'text' };
            static properties = {};
        }
        applyAliases(T4);
        const first = T4.properties.text;
        applyAliases(T4);
        expect(T4.properties.text).toBe(first);
    });
});
