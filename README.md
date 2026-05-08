# EstreUV.js — 3주 Spike (옵션 A 사전 검증)

> 임시 단독 폴더. spike PASS 시 monorepo (`packages/estreuv` + `packages/create-estreuv`, 모델 3) 로 이동. FAIL 시 폴더 보존하되 PM 작업 로그에 결정 기록.
>
> **상위 기획**: EstreUI.js common workspace 의 [reports/2026-05-09-estreuv-positioning.md](../../../WorkSolutions/Dev/op%20server/EstreUI.js%20common%20workspace/reports/2026-05-09-estreuv-positioning.md) v1.1 + [PM 007](../../../WorkSolutions/Dev/op%20server/EstreUI.js%20common%20workspace/.agent/PM/007_estreuv_spike.md)
>
> **시작**: 2026-05-09. **ETA**: 약 2026-05-30 (3주)

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

## 디렉터리 구조 (Phase A 1차)

```
EstreUV-spike/
├── README.md           — 본 파일
├── package.json        — 의존: lit + @lit/context (peer 없음)
├── index.html          — 브라우저 entry (no-build)
├── index-standalone.html — F2 검증용 단독 페이지 (EstreUI 없이)
└── src/
    ├── main.js                — 부트 + intent context provide + tile 마운트
    ├── intent-context.js      — @lit/context 로 EstreUI ↔ EstreUV intent 브릿지
    ├── estreuv-element.js     — EstreUVElement 베이스 클래스
    ├── lifecycle-bridge.js    — onBring/onShow/onFocus/onHide/onClose 매핑 helper
    └── dark-mode-tile.js      — 첫 tile 컴포넌트 (다크 모드 토글, EstreUV 변환)
```

## Phase A 진척 (Week 1)

- [x] 폴더 셋업 + 초기 scaffold (2026-05-09)
- [x] `intent-context.js` minimal — `@lit/context` 기반 1차안
- [x] `estreuv-element.js` minimal — `LitElement` 베이스 + intent consume
- [x] `lifecycle-bridge.js` minimal — 5 라이프사이클 매핑 placeholder
- [x] `dark-mode-tile.js` — 다크 모드 토글 tile EstreUV 변환 1차
- [x] `index.html` + `index-standalone.html` — bridge / standalone 두 시나리오
- [ ] `npm install` + 브라우저 검증 (사용자 영역, 다음 세션)
- [ ] EstreUI article 안에서 intent 변경 시 tile 자동 재렌더 검증 (F2 부분)
- [ ] tile 단독 페이지에서 작동 검증 (F2 완전)

## 실행 방법

```bash
cd "EstreUV-spike"
npm install
npx http-server .   # 또는 `npx serve` · Python `python -m http.server` · VS Code Live Server 등
# 브라우저에서 http://localhost:8080/index.html (bridge 시나리오) 또는
#               http://localhost:8080/index-standalone.html (단독 시나리오) 확인
```

## 다음 단계 (Phase A 마무리 → Phase B)

1. EstreUI 본체 안에 article 셋업 + spike 의 tile component import → intent 변경 시 tile 자동 재렌더 시각 확인
2. lifecycle bridge 의 `onShow/onHide` 가 race 없이 1 회 호출되는지 콘솔 로깅 검증
3. Phase B 진입 시 dual binding race 회피 컨벤션 (event-up + prop-down) 검증 + Alienese alias mapping 베이스 추가

## 결과 보고

spike 종료 시 `reports/YYYY-MM-DD-estreuv-spike-result.md` 작성하여 hub 측 commit. F1~F3·D1~D6·I1~I3 채점 + 옵션 A/B/C 분기 권고.
