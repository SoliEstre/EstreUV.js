# EstreUV.js — 3주 Spike (옵션 A 사전 검증)

> 임시 단독 폴더. spike PASS 시 monorepo (`packages/estreuv` + `packages/create-estreuv`, 모델 3) 로 이동. FAIL 시 폴더 보존하되 PM 작업 로그에 결정 기록.
>
> **상위 기획**: EstreUI.js common workspace 의 [reports/2026-05-09-estreuv-positioning.md](../../../WorkSolutions/Dev/op%20server/EstreUI.js%20common%20workspace/reports/2026-05-09-estreuv-positioning.md) v1.1 + [PM 007](../../../WorkSolutions/Dev/op%20server/EstreUI.js%20common%20workspace/.agent/PM/007_estreuv_spike.md)
>
> **시작**: 2026-05-09. **ETA**: 2026-05-15~20 (5~7일, 5~6배 AI 바이브 코딩 속도 가정 반영 후)

## 목적

EstreUV (LIT 기반 micro-Rimwork, EstreUI 의 jQuery-class primitive ↔ LIT-class primitive 의 평행 구조) 가 **별도 프레임워크 (옵션 A)** 로 본격 출범하기 전 측정 가능 지표로 검증.

## 평가 기준 (PASS = 모두 충족)

### Functional (F1~F3)
- **F1**: overwatchPanel widget tile 3 종이 EstreUI article 의 `onBring/onShow/onFocus/onHide/onClose` lifecycle 모두 받아 처리, race 없이 1 회 호출
- **F2**: 같은 tile component 가 EstreUI 없이 단독 페이지 (`<script type="module">`) 에서도 작동
- **F3**: Alienese 단축 attribute (`*t` · `*bg`) → reactive property 바인딩, 빌드 단계 0

### DX (D1~D6)
- **D1**: tile 1 종 작성 LoC 가 raw Lit 동등 구현 대비 +20% 이내
- **D2**: Estrelle Phase 1~2 OS shell 컴포넌트 1 개+ 가 EstreUV 로 자연 마이그레이션 (코드 변경 < 30%)
- **D3**: no-build — `<script type="module">` 즉시 사용, TS decorator 없이 작동
- **D4**: IDE TS 풀 타입 인텔리센스 (JSDoc + `.d.ts` 경로)
- **D5**: `npx vitest` (Vitest + happy-dom) 에서 lifecycle · reactive property 검증
- **D6**: monorepo sister package 운영 시 EstreUI 변경 ↔ EstreUV release 가 독립적으로 굴러감

### 통합 비용 (I1~I3)
- **I1**: EstreUV 본체 코드 < 2,000 LoC
- **I2**: 외부 의존 Lit core 한정 (lit-html · lit-element · @lit/reactive-element · @lit/context). Lit Labs 의존 없음
- **I3**: 번들 사이즈 (minified+gzip) < 15KB

## 디렉터리 구조 (Phase B 강화 후)

```
EstreUV-spike/
├── README.md           — 본 파일
├── package.json        — 의존: lit + @lit/context (peer 없음)
├── index.html          — 브라우저 entry (no-build, bridge 시나리오)
├── index-standalone.html — F2 검증용 단독 페이지 (EstreUI 없이)
└── src/
    ├── main.js                — 부트 + intent context provide + tile 마운트
    ├── intent-context.js      — @lit/context 로 EstreUI ↔ EstreUV intent 브릿지
    ├── estreuv-element.js     — EstreUVElement 베이스 + lifecycle 헬퍼
    ├── lifecycle-bridge.js    — 8 라이프사이클 dispatch + 순서 invariant + per-tick dedup
    ├── alienese-alias.js      — *t/*bg/*c → long-form → reactive property (Phase B)
    └── dark-mode-tile.js      — 첫 tile 컴포넌트 (다크 모드 토글)
```

## Phase A 진척 (완료, 2026-05-09)

- [x] 폴더 셋업 + 초기 scaffold
- [x] `intent-context.js` — `@lit/context` 기반
- [x] `estreuv-element.js` — `LitElement` 베이스 + intent consume
- [x] `lifecycle-bridge.js` — 8 라이프사이클 매핑 (Phase B 강화 전 5 → 8)
- [x] `dark-mode-tile.js` — 다크 모드 토글 tile EstreUV 변환
- [x] `index.html` + `index-standalone.html` — bridge / standalone 두 시나리오
- [x] EstreUI 본체 fw `spike-test/` 환경에서 본 검증 PASS (F1 + F2 + dual binding 회피)

## Phase B 진척 (2026-05-09)

- [x] **lifecycle race 정밀**: per-tick dedup (`_inFlight` WeakMap), 순서 invariant 경고 (non-cyclic), 컴포넌트별 `_estreuvLifecycleCounts` + `getLifecycleHistory()`
- [x] **Lit ↔ EstreUI 채널 분리** 정책 명문화 (estreuv-element.js JSDoc)
- [x] **dual binding 컨벤션 강화**: child 가 `intent` 직접 mutate 금지 명문화 (read-only from child), `requestIntentUpdate(patch)` 위임
- [x] **Alienese alias 시스템 베이스**: `alienese-alias.js` — `applyAliases(ctor)` Spectrum SpectrumMixin 패턴 차용. 기본 alias 셋 (`*t` `*bg` `*c` `*sz` `*on` `*ic`)
- [x] **HTML attribute 명명 규칙**: long-form (`text`/`color`) 또는 `e-*` prefix. JS 식별자 (`tile['*t']`) 만 Alienese form
- [x] dark-mode-tile.js 가 alias 시스템 사용 (F3 demo)
- [ ] 브라우저 검증 (사용자 영역, 다음 단계)

## 실행 방법

### 라이브러리 단독 검증 (이 repo)

```bash
cd "EstreUV-spike"
npm install
npx http-server . -p 8080 -c-1
# http://localhost:8080/index.html (stub article — lifecycle 시뮬레이션)
# http://localhost:8080/index-standalone.html (F2 — EstreUI 없이 단독 작동)
```

### 실 사용자 통합 검증 (별 작업폴더 `estreuv-integration-app/`)

`npm create estreui` 로 스캐폴드한 진짜 EstreUI 앱이 이 repo 를 `npm install file:../EstreUV-spike` 로 의존. canonical 부트 + HTTPS dev server.

```bash
cd "../estreuv-integration-app"
npm install        # 이미 됐으면 skip — node_modules/estreuv → 이 repo symlink
npm run dev        # estreui dev — HTTPS localhost:8080
```

`src/` 변경은 symlink 라 즉시 반영. 자세한 검증 절차는 `estreuv-integration-app/README.md` 의 Antigravity 핸드오프 체크리스트.

> 노선 구분: 이 repo = **라이브러리 소스 SSoT** / `estreuv-integration-app/` = **소비자 테스트 하네스** (단방향 의존, git·생명주기 분리). (구) `EstreUI.js/spike-test/` 는 폐기됨.

## 다음 단계 (Phase C)

1. tile 추가 2 종 (시계 · 알림 카운트) — 다양한 reactivity 패턴 일반화 검증
2. Notelle 사이드바 prototype 1 개 — nested 컨테이너 케이스 (중첩 lifecycle)
3. DX 측정 (D1 LoC · D2 OS shell 마이그레이션 · D4 IDE intellisense)
4. Vitest + happy-dom 테스트 셋업 (D5)
5. 번들 사이즈 측정 (I1 · I3) — minified+gzip < 15KB 검증
6. `reports/YYYY-MM-DD-estreuv-spike-result.md` 작성 + 옵션 A/B/C 분기 권고

## 결과 보고

spike 종료 시 `reports/YYYY-MM-DD-estreuv-spike-result.md` 작성하여 hub 측 commit. F1~F3·D1~D6·I1~I3 채점 + 옵션 A/B/C 분기 권고.
