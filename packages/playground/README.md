# EstreUV.js — Integration Test App

> EstreUV (Lit 기반 micro-Rimwork) 를 **실 사용자 시나리오** 로 검증하는 테스트 앱.
> `npm create estreui` 로 스캐폴드한 진짜 EstreUI v1.4.0 앱이 EstreUV 를 npm 의존 (`estreuv`, 현재 `file:../EstreUV-spike`) 으로 받아 tile 컴포넌트를 사용한다.
>
> **상위 기획**: EstreUI.js common workspace 의 [PM 007 EstreUV spike](../../../WorkSolutions/Dev/op%20server/EstreUI.js%20common%20workspace/.agent/PM/007_estreuv_spike.md). 이 앱은 PM 007 Phase C 의 통합 검증 하네스.
>
> **노선 구분**:
> - `EstreUV-spike/` (별 repo) = EstreUV **라이브러리 소스 SSoT** (`src/`)
> - `estreuv-integration-app/` (이 폴더) = EstreUV 를 **쓰는 소비자 앱** (테스트 하네스) — 라이브러리 단방향 의존, git·생명주기 분리
> - (구) `EstreUI.js/spike-test/` = 폐기됨 (fw repo 소스 트리 안에 박혀있어 부적절 → 이 앱으로 이전)

## 구조

```
estreuv-integration-app/
├── index.html              # EstreUI 부트 + EstreUV importmap + estreuv-tiles.js 모듈 로드
├── staticDoc.html          # home article 안에 <estreuv-dark-mode-tile> 2개 + 콘솔 가이드
├── scripts/
│   ├── main.js             # 스캐폴드 main.js + HomePageHandler (lifecycle 전파 + intent provider 부착)
│   ├── estreuv-tiles.js    # (NEW) ESM — 'estreuv/dark-mode-tile.js' side-effect import + window._estreuv 노출
│   ├── boot.js · estreUi-*.js · lib/*  # EstreUI 코어 (npm create estreui 가 복사, estreui update 로 동기)
│   └── ...
├── styles/ · images/ · *.html  # EstreUI 코어 자산
├── node_modules/
│   ├── estreuv → ../../EstreUV-spike   # symlink (file: 의존)
│   ├── lit · @lit/context · @lit/reactive-element · lit-element · lit-html  # EstreUV 의 의존
│   └── estreui · create-estreui
└── package.json            # deps: estreui ^1.1.0(→1.4.0) · estreuv file:../EstreUV-spike · lit · @lit/context
```

## 실행

```bash
npm install                 # 이미 됐으면 skip
npm run dev                  # estreui dev — HTTPS localhost:8080 (self-signed cert, "Advanced → Proceed")
# 브라우저 자동 오픈. 안 열리면 https://localhost:8080/
```

> 자가서명 인증서 경고는 정상. mkcert 깔려있으면 trusted cert 자동 생성. HTTP 만 필요하면 `npx http-server . -p 8080 -c-1`.

## EstreUV 소스 변경 반영

`node_modules/estreuv` 는 `../EstreUV-spike` 로의 symlink 라 spike repo 의 `src/` 를 고치면 즉시 반영됨 (브라우저 리로드만). 별도 sync 불필요.

GA 시점엔 `npm install estreuv` (published 패키지) 로 동일하게 작동 — 이 앱은 그대로.

## 검증 시나리오 (Antigravity IDE 핸드오프 체크리스트)

> 브라우저 시각·인터랙티브 검증은 Antigravity IDE 의 브라우저-구동 에이전트에 위임. 아래 절차 실행 + 결과 캡처.

### 부트 (자동)

`npm run dev` → 브라우저 → DevTools 콘솔. 다음 로그가 순서대로 떠야 함:

1. `[estreuv-app] tile components + helpers loaded (estreuv = ok)` — estreuv-tiles.js 모듈 로드
2. `[estreuv-app] booted.` — main.js 의 ready 핸들러 (race 회피: _estreuvReady await 후)
3. `[estreuv-app] HomePageHandler.onBring` / `.onOpen` / `.onShow` — article lifecycle 전파 (F1)
4. `[estreuv-app] intent provider + lifecycle bridge wired to articleRoot:` — intent provider 부착

화면: home article 안에 dark-mode tile 2개. 두번째 tile 은 **보라색 (#7a4dff) 테두리** + "테마" 라벨 (F3 — long-form HTML attribute → reactive prop).

### 콘솔 검증 (수동, 순서대로 실행 + 결과 캡처)

```js
// (1) intent 변경 → tile reactive property 갱신 (에러 없이 undefined 반환이면 OK)
window._spikeIntent.update({ darkMode: "dark" });

// (2) child → article event-up (dual binding 회피)
document.querySelector('estreuv-dark-mode-tile').cycle();
//     → 콘솔에 "[estreuv-app] intent-update via event: { darkMode: ... }" 출력되면 OK
//     → 첫번째 tile 의 아이콘/라벨이 auto→light→dark 순환

// (3) F3 — Alienese alias JS 식별자
const $tile = document.querySelectorAll('estreuv-dark-mode-tile')[1];
$tile['*t'] = 'AI 테마';    // → 두번째 tile 라벨이 "AI 테마" 로 즉시 변경 (캡처)
$tile['*c'] = 'tomato';     // → 두번째 tile 테두리/텍스트가 토마토색 으로 즉시 변경 (캡처)

// (4) lifecycle race 정밀 — 같은 tick 동기 두 번 호출 → dedup
window._spikeLifecycle.onShow({stub:true}); window._spikeLifecycle.onShow({stub:true});
//     → 두번째가 "[EstreUV] dispatchLifecycle('onShow') re-entrant on same root within tick — skipped" 경고 (캡처)

// (5) lifecycle 카운터 + history
const tile = document.querySelector('estreuv-dark-mode-tile');
tile._estreuvLifecycleCounts;     // → 각 hook 호출 횟수 객체
tile.getLifecycleHistory();       // → 시간순 이력 배열 (bounded 32)
tile.hasLifecycleFired('onShow'); // → true
```

> 단문자 변수명 (`t`/`bg`/`c` 등) 은 Alienese 영역 침범이라 회피 — 위 예시는 `$tile` 사용.

### 합격 기준 (Phase C 통합 검증 부분)

- [ ] 부트 로그 4종 순서대로 출력
- [ ] 두 tile 렌더 (두번째 보라색 + "테마")
- [ ] (1) intent.update 에러 없음
- [ ] (2) cycle() → event-up 로그 + 아이콘 순환
- [ ] (3) `*t` → 라벨 변경 + `*c` → 색 변경 (시각 캡처)
- [ ] (4) dedup 경고 출력
- [ ] (5) 카운터/history 정상 노출
- [ ] (Phase C tile 추가 시) 시계 tile · 알림 카운트 tile 도 동일 lifecycle 받음
- [ ] (Phase C Notelle 시) 사이드바 nested 컨테이너 안의 항목도 lifecycle 받음 (중첩 dispatch)

## 산출물 보고

검증 결과는 hub 측 PM 007 §작업 로그 + (Phase C 종료 시) `reports/YYYY-MM-DD-estreuv-spike-result.md` 에 반영.
