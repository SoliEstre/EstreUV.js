/**
 * <estreuv-message-list> — playground 예제 컴포넌트 (라이브러리 본체 아님).
 *
 * 강결합 데모의 중심: 메시지 데이터를 보유하고, 공유 intent 의 `sidebarActive`(활성 폴더)로
 * 필터해 렌더한다. 메시지 "읽음" → 폴더별 미읽음 counts 재계산 → `requestIntentUpdate({counts,
 * notifCount})` (event-up). 그러면 owner article 이 intent 를 갱신 → 사이드바 배지 + notif 타일이
 * 동시에 prop-down 반응 (단일 소스). onShow 에 "수신 시뮬" 타이머 시작 / onHide 정지 (lifecycle).
 *
 * EstreUV 를 npm 의존으로 쓰는 실사용자 컴포넌트 작성 예시 — importmap 으로 estreuv/lit 해소.
 */
import { EstreUVElement } from 'estreuv';
import { html, css } from 'lit';

const FOLDERS = ['Inbox', 'Archive', 'Trash'];
let _seq = 200;
const mk = (from, sub, folder, read = false) => ({ id: ++_seq, from, sub, folder, read });

export class EstreuvMessageList extends EstreUVElement {
    static properties = {
        ...EstreUVElement.properties,
        _messages: { state: true },
    };

    static styles = css`
        :host { display: block; flex: 1; min-width: 0; }
        .empty { padding: 56px 20px; text-align: center; opacity: 0.55; }
        .msg {
            display: flex; gap: 12px; padding: 11px 14px; border-radius: 12px;
            cursor: pointer; border: 1px solid transparent;
        }
        .msg:hover { background: rgba(127,127,127,0.10); }
        .av {
            width: 34px; height: 34px; border-radius: 50%; flex: none;
            display: flex; align-items: center; justify-content: center; font-weight: 700;
            background: rgba(127,127,127,0.15);
        }
        .from { font-weight: 600; font-size: 0.95rem; }
        .sub { opacity: 0.6; font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .msg.read { opacity: 0.5; }
        .msg.unread .from::before {
            content: ""; display: inline-block; width: 8px; height: 8px; border-radius: 50%;
            background: var(--estreuv-tile-color, #2a8c82); margin-right: 7px; vertical-align: middle;
        }
    `;

    constructor() {
        super();
        this._messages = [
            mk('Estre CI', 'Release workflow: estreuv published', 'Inbox'),
            mk('SoliEstre', 'Re: docs 사이트 VitePress 구성', 'Inbox'),
            mk('GitHub', '[EstreUV.js] CI passed on main', 'Inbox'),
            mk('npm', 'Weekly download report', 'Archive', true),
            mk('Antigravity', 'Browser verification PASS', 'Archive', true),
            mk('notice', 'deprecated reminder', 'Trash', true),
        ];
        this._timer = null;
    }

    get activeFolder() { return this.intent?.sidebarActive ?? 'Inbox'; }

    /** 폴더별 미읽음 counts {Inbox,Archive,Trash} + 총합을 intent 로 위임 (event-up) */
    _publishCounts() {
        const counts = Object.fromEntries(FOLDERS.map(f => [f, 0]));
        this._messages.forEach(m => { if (!m.read) counts[m.folder]++; });
        const notifCount = Object.values(counts).reduce((a, b) => a + b, 0);
        this.requestIntentUpdate({ counts, notifCount });
    }

    _read(m) {
        if (m.read) return;
        m.read = true;
        this._messages = [...this._messages];   // reactive
        this._publishCounts();
    }

    /** 외부(또는 타이머)에서 수신 시뮬 — Inbox 에 새 메시지 */
    simulateIncoming() {
        const samples = [
            ['Estrelle', 'New build artifact ready'],
            ['Show GN', 'New comment on your post'],
            ['create-estreuv', 'npx scaffold tested'],
        ];
        const s = samples[Math.floor(Math.random() * samples.length)];
        this._messages = [mk(s[0], s[1], 'Inbox'), ...this._messages];
        this._publishCounts();
    }

    render() {
        const msgs = this._messages.filter(m => m.folder === this.activeFolder);
        if (!msgs.length) return html`<div class="empty">이 폴더에 메시지가 없습니다</div>`;
        return html`${msgs.map(m => html`
            <div class="msg ${m.read ? 'read' : 'unread'}" @click=${() => this._read(m)}>
                <div class="av">${(m.from[0] || '?').toUpperCase()}</div>
                <div style="flex:1;min-width:0">
                    <div class="from">${m.from}</div>
                    <div class="sub">${m.sub}</div>
                </div>
            </div>`)}`;
    }

    firstUpdated() { this._publishCounts(); }

    // ─── EstreUI lifecycle — 수신 시뮬 타이머를 가시성에 결속 ───
    onShow(handle) {
        super.onShow(handle);
        if (!this._timer) this._timer = setInterval(() => this.simulateIncoming(), 8000);
    }
    onHide(handle) {
        super.onHide(handle);
        if (this._timer) { clearInterval(this._timer); this._timer = null; }
    }
    disconnectedCallback() {
        if (this._timer) { clearInterval(this._timer); this._timer = null; }
        super.disconnectedCallback();
    }
}

customElements.define('estreuv-message-list', EstreuvMessageList);
