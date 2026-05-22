import { describe, it, expect, beforeEach } from 'vitest';
import { dispatchLifecycle } from '../src/lifecycle-bridge.js';
import '../src/sidebar.js';
import '../src/sidebar-item.js';

/**
 * Sidebar — nested 컨테이너 케이스.
 * 검증 포인트:
 *  - article 의 flat dispatch (querySelectorAll('[data-estreuv]')) 가 사이드바 + slot 의 항목들 *모두* 도달
 *  - 사이드바 collapsed/activeLabel → 항목들에 prop-down (단방향)
 *  - 항목 activate → 사이드바에 event-up → activeLabel 갱신 + intent 위임
 *  - 두 채널 (article↔item lifecycle / sidebar↔item state) 비간섭
 */
describe('estreuv-sidebar (nested container + nested lifecycle)', () => {
    let article, sidebar, items;

    beforeEach(async () => {
        document.body.innerHTML = `
            <article data-article-id="main" data-static="1">
              <estreuv-sidebar title="Menu">
                <estreuv-sidebar-item label="Inbox" icon="📥"></estreuv-sidebar-item>
                <estreuv-sidebar-item label="Archive" icon="🗄"></estreuv-sidebar-item>
                <estreuv-sidebar-item label="Trash" icon="🗑"></estreuv-sidebar-item>
              </estreuv-sidebar>
            </article>`;
        article = document.querySelector('article');
        sidebar = document.querySelector('estreuv-sidebar');
        items = [...document.querySelectorAll('estreuv-sidebar-item')];
        await sidebar.updateComplete;
        await Promise.all(items.map(i => i.updateComplete));
    });

    it('sidebar + all slotted items are data-estreuv and found by flat querySelectorAll', () => {
        expect(sidebar.hasAttribute('data-estreuv')).toBe(true);
        items.forEach(i => expect(i.hasAttribute('data-estreuv')).toBe(true));
        const found = [...article.querySelectorAll('[data-estreuv]')];
        expect(found).toContain(sidebar);
        items.forEach(i => expect(found).toContain(i));
        expect(found.length).toBe(4);  // 1 sidebar + 3 items, arbitrary nesting flattened
    });

    it('article lifecycle dispatch reaches sidebar AND every nested item (no sub-coordinator)', () => {
        dispatchLifecycle(article, 'onBring');
        dispatchLifecycle(article, 'onOpen');
        dispatchLifecycle(article, 'onShow');
        expect(sidebar._estreuvLifecycleCounts).toEqual({ onBring: 1, onOpen: 1, onShow: 1 });
        items.forEach(i => {
            expect(i._estreuvLifecycleCounts).toEqual({ onBring: 1, onOpen: 1, onShow: 1 });
            expect(i._everShownFromArticle).toBe(true);  // item.onShow ran directly from article dispatch
        });
    });

    it('sidebar collapsed → prop-down to items (compact); toggle reflects + delegates intent', async () => {
        sidebar.toggleCollapsed();
        expect(sidebar.collapsed).toBe(true);
        await sidebar.updateComplete;
        items.forEach(i => expect(i.compact).toBe(true));   // prop-down
        // event-up: toggleCollapsed delegates intent
        const events = [];
        sidebar.addEventListener('intent-update', (e) => events.push(e.detail.patch));
        sidebar.toggleCollapsed();
        expect(sidebar.collapsed).toBe(false);
        await sidebar.updateComplete;
        items.forEach(i => expect(i.compact).toBe(false));
        expect(events).toEqual([{ sidebarCollapsed: false }]);
    });

    it('item activate → event-up to sidebar → activeLabel + prop-down active flag + intent delegation', async () => {
        const events = [];
        sidebar.addEventListener('intent-update', (e) => events.push(e.detail.patch));
        // simulate clicking the 2nd item (it dispatches estreuv-sidebar-activate)
        items[1].dispatchEvent(new CustomEvent('estreuv-sidebar-activate', {
            detail: { label: 'Archive' }, bubbles: true, composed: true,
        }));
        await sidebar.updateComplete;
        expect(sidebar.activeLabel).toBe('Archive');
        expect(items[1].active).toBe(true);          // prop-down
        expect(items[0].active).toBe(false);
        expect(items[2].active).toBe(false);
        expect(events).toEqual([{ sidebarActive: 'Archive' }]);
    });

    it('sidebar.onShow restores collapsed/activeLabel from intent (re-visit picks latest)', async () => {
        sidebar.intent = { sidebarCollapsed: true, sidebarActive: 'Trash' };
        sidebar.onShow();
        await sidebar.updateComplete;
        expect(sidebar.collapsed).toBe(true);
        expect(sidebar.activeLabel).toBe('Trash');
        items.forEach(i => expect(i.compact).toBe(true));
        expect(items[2].active).toBe(true);
    });

    it('Alienese aliases: sidebar *t → title; item *t → label, *ic → icon', async () => {
        sidebar['*t'] = 'Mail';
        expect(sidebar.title).toBe('Mail');
        items[0]['*t'] = 'Important';
        items[0]['*ic'] = '⭐';
        expect(items[0].label).toBe('Important');
        expect(items[0].icon).toBe('⭐');
    });

    it('two channels do not interfere: lifecycle dispatch then state changes both intact', async () => {
        dispatchLifecycle(article, 'onShow');
        sidebar.toggleCollapsed();
        await sidebar.updateComplete;
        // lifecycle count still 1 (state change did not re-fire lifecycle), and prop-down applied
        expect(sidebar._estreuvLifecycleCounts.onShow).toBe(1);
        items.forEach(i => {
            expect(i._estreuvLifecycleCounts.onShow).toBe(1);
            expect(i.compact).toBe(true);
        });
    });
});
