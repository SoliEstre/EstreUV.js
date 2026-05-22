# G4 — playground 브라우저 검증 핸드오프 (Antigravity IDE)

> PM 008 GA 게이트 G4 의 인터랙티브 절반. 정적 계약(배선 drift)은
> `npm test`(integration-contract) + CI 가 가드함. 런타임 동작(F1~F3,
> lifecycle dispatch, intent 재렌더)은 브라우저가 필요 — 에이전트가
> 직접 브라우저를 못 열어 사용자/Antigravity 가 1회 수행한다.
> spike 때 검증 모델([reports/2026-05-12-estreuv-spike-result] 참조)과 동일.

## 준비

```sh
cd packages/playground
npm install          # 워크스페이스라 보통 루트 npm install 로 이미 됨
npm run dev          # estreui dev — HTTPS https://localhost:8080/
```

서버 경고가 뜨면 mkcert 안내대로 신뢰 인증서 설치 후 재기동. 이전
SPA 서비스워커 캐시가 localhost:8080 을 가로채면 DevTools →
Application → Service Workers → Unregister 후 새로고침.

## 검증 체크리스트 (전부 PASS 여야 G4 통과)

### 부트 / F1 — article lifecycle 자동 전파
- [ ] 콘솔에 `[estreuv-app] HomePageHandler.onBring/onOpen/onShow` 순서 로그
- [ ] `[estreuv-app] intent provider + lifecycle bridge wired to articleRoot:` 로그
- [ ] 타일들이 보임: dark-mode ×2, clock ×2(흐르는 시계), notif-count ×2, 사이드바(Inbox/Archive/Trash)
- [ ] 페이지 재방문(다른 페이지 갔다 복귀) 시 `onHide`→`onShow` 가 타일에 다시 전파, **중복 없이 1회씩**

### F2 — 단독 동작 (EstreUI 채널과 분리)
- [ ] clock-tile 이 EstreUI 없이도 자체 타이머로 갱신 (Lit native 채널)
- [ ] dark-mode-tile 클릭 → 즉시 토글 (lifecycle 채널과 무관하게 동작)

### F3 — Alienese alias + intent 재렌더
- [ ] 콘솔: `document.querySelector('estreuv-dark-mode-tile').cycle()` → 라벨/아이콘 갱신 + `[estreuv-app] intent-update via event:` 로그
- [ ] 콘솔:
  ```js
  const $tile = document.querySelectorAll('estreuv-dark-mode-tile')[1];
  $tile['*t'] = 'AI 테마';   // 라벨 즉시 'AI 테마'
  $tile['*c'] = 'tomato';    // 색 즉시 tomato
  ```
  (long-form `text`/`color` 와 동일 동작 — 빌드 0)
- [ ] notif-count-tile 클릭 → 카운트 bump, `max` 초과 시 `99+` 표기
- [ ] lifecycle race dedup: 콘솔 `window._spikeLifecycle.onShow({stub:true}); window._spikeLifecycle.onShow({stub:true});` → 두 번째는 `re-entrant ... skipped` 경고 (tick 내 1회만)

### 회귀 (spike 대비)
- [ ] spike 때 PASS 였던 F1~F3 동작이 0.2.0(타입 동봉본)에서도 동일 — 시각·동작 회귀 0

## 결과 기록

검증 후 결과를 PM 008 작업 로그 + status 스냅샷 정오표에 기입
(PASS/FAIL + 스크린샷 경로). 전 항목 PASS = **G4 ✅**, 다음 G5(create-estreuv
pair 수동 E2E) → G6 회귀0 → G7 1.0.0 GA.
