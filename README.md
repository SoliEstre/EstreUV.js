# EstreUV.js

[![npm version](https://img.shields.io/npm/v/estreuv.svg)](https://www.npmjs.com/package/estreuv)
[![npm downloads](https://img.shields.io/npm/dm/estreuv.svg)](https://www.npmjs.com/package/estreuv)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![size](https://img.shields.io/badge/core-4.55%20KB%20min%2Bgzip-2a8c82.svg)](packages/estreuv/scripts/measure-bundle.mjs)
[![no build step](https://img.shields.io/badge/build%20step-none-brightgreen.svg)](#install)

Small, self-contained [Lit](https://lit.dev) web components that run standalone, and plug into the [EstreUI.js](https://github.com/SoliEstre/EstreUI.js) page framework when one is around. No build step.

**[🇰🇷 한국어로 읽기 ↓](#estreuvjs--한국어)**

> **1.0.0 — GA.** Stable public API. Docs live in [`packages/estreuv`](packages/estreuv) (a hosted docs site is on the roadmap).

## What is EstreUV?

The Estre stack calls its two framework halves **Rimwork**: the *macro* half ([EstreUI](https://github.com/SoliEstre/EstreUI.js), a jQuery-class primitive) drives page and section flow, and the *micro* half (EstreUV, a Lit-class primitive) drives the widgets inside — small custom elements we call "tiles". One [EstreUX](https://github.com/SoliEstre/EstreUX) `.eux` spec can generate either target, or both paired, so the same intent can render as a macro flow, a micro element, or a full app.

A component built on `EstreUVElement`:

- works **standalone** (plain `connectedCallback`), and
- when placed in an EstreUI article, **inherits the eight EstreUI lifecycle hooks** through a flat bridge — the native Lit channel and the EstreUI channel stay separate, so behavior is identical with or without EstreUI.

## Features

- **Lifecycle bridge** — `onBring`/`onOpen`/`onShow`/`onFocus`/`onBlur`/`onHide`/`onClose`/`onRelease` via a flat dispatch, deduped per tick so each fires exactly once.
- **Intent context** — uni-directional state over `@lit/context`: providers push *down*, components request changes *up* (no two-way binding race).
- **Alienese aliases** — short attribute aliases (`*t`→`text`, `*c`→`color`, …) at zero build cost.
- **Tiles** — ready-made `dark-mode` / `clock` / `notif-count` / `sidebar` elements, self-registering.
- **No build** — `lit` / `@lit/context` peer-resolved via import map. ~727 LoC core · 4.55 KB min+gzip (Lit external, measured 2026-07 via `packages/estreuv/scripts/measure-bundle.mjs`).

## Install

```sh
npm install estreuv          # the library
npm create estreuv@latest    # scaffold a new app (create-estreuv)
```

`lit` and `@lit/context` are peer-resolved via your import map — no bundler required. See the [package README](packages/estreuv/README.md) for the import map and the 5-minute quickstart.

## Quickstart

```js
import { EstreUVElement } from 'estreuv';
import { html } from 'lit';

class CounterTile extends EstreUVElement {
  static properties = { count: { type: Number } };
  count = 0;
  render() {
    return html`<button @click=${() => this.count++}>${this.count}</button>`;
  }
}
customElements.define('counter-tile', CounterTile);
```

```html
<counter-tile></counter-tile>
```

That's the whole standalone path — no EstreUI, no bundler. For the EstreUI lifecycle pairing, intent context, and Alienese aliases, see the [package README](packages/estreuv/README.md).

Want to see it in a shipped app? [Rimlog](https://github.com/SoliEstre/Rimlog)'s purple AI card is an EstreUV element (`<ai-insight-card>`) living inside an EstreUI page, themed across light/dark through CSS variables passed over the shadow boundary.

## Ecosystem

| Layer | Package | Role |
| --- | --- | --- |
| **macro**-Rimwork | [estreui](https://github.com/SoliEstre/EstreUI.js) | page / section flow (jQuery-class primitive) |
| **micro**-Rimwork | **estreuv** | widget elements (Lit-class primitive) — *this repo* |
| **meta** layer | [EstreUX](https://github.com/SoliEstre/EstreUX) | `.eux` spec → generates both (dev-time, runtime-free) |

## Monorepo layout

| Package | npm | Purpose |
| --- | --- | --- |
| [`packages/estreuv`](packages/estreuv) | [`estreuv`](https://www.npmjs.com/package/estreuv) | the library — micro-Rimwork (intent context, lifecycle bridge, Alienese, tiles) |
| [`packages/create-estreuv`](packages/create-estreuv) | [`create-estreuv`](https://www.npmjs.com/package/create-estreuv) | scaffold CLI (`npm create estreuv`) |
| [`packages/docs`](packages/docs) | (private) | VitePress docs site — hosted deployment on the roadmap |
| [`packages/playground`](packages/playground) | (private) | in-repo demo / test / template — EstreUI + EstreUV pair app |

## Development

```sh
npm install            # all workspaces
npm run test           # estreuv vitest suite (39 tests)
npm run measure        # bundle measurement (LoC / gzip)
npm run dev            # playground dev server
```

## Releasing

[Changesets](https://github.com/changesets/changesets)-driven independent versioning ([`.changeset/README.md`](.changeset/README.md)): `npm run version-packages` (apply changesets) → `npm run release` (`changeset publish`). `npm publish` is performed by the maintainer (npm auth session required).

## License

[MIT](LICENSE) © SoliEstre

---

# EstreUV.js — 한국어

독립적으로도 돌고, [EstreUI.js](https://github.com/SoliEstre/EstreUI.js) 페이지 프레임워크가 있으면 거기에 꽂히는 작고 자기완결적인 [Lit](https://lit.dev) 웹컴포넌트. 빌드 스텝이 없습니다.

> **1.0.0 — GA.** 공개 API 안정. 문서는 [`packages/estreuv`](packages/estreuv)에 있습니다(호스팅 문서 사이트는 로드맵에 있어요).

## EstreUV가 뭔가요?

Estre 스택은 프레임워크의 두 반쪽을 **Rimwork**라고 부릅니다. *매크로* 쪽([EstreUI](https://github.com/SoliEstre/EstreUI.js), jQuery 클래스 프리미티브)이 페이지·섹션 흐름을 맡고, *마이크로* 쪽(EstreUV, Lit 클래스 프리미티브)이 그 안의 위젯을 맡습니다 — 이 작은 커스텀 엘리먼트들을 "타일"이라고 불러요. [EstreUX](https://github.com/SoliEstre/EstreUX) `.eux` 명세 하나로 어느 타깃이든, 혹은 둘의 페어까지 생성할 수 있어서, 같은 의도가 매크로 흐름으로도 마이크로 엘리먼트로도 완성 앱으로도 나올 수 있습니다.

`EstreUVElement`로 만든 컴포넌트는:

- **단독으로** 동작하고 (평범한 `connectedCallback`),
- EstreUI article 안에 놓이면 **EstreUI 라이프사이클 훅 8종을 그대로 물려받습니다** — 평탄한 브리지를 통해서요. 네이티브 Lit 채널과 EstreUI 채널이 분리돼 있어서 EstreUI가 있든 없든 동작이 동일합니다.

## 특징

- **라이프사이클 브리지** — `onBring`/`onOpen`/`onShow`/`onFocus`/`onBlur`/`onHide`/`onClose`/`onRelease`를 평탄 디스패치로, 틱당 중복 제거해 정확히 한 번씩 발화.
- **인텐트 컨텍스트** — `@lit/context` 위의 단방향 상태: 프로바이더는 아래로 밀고, 컴포넌트는 위로 변경을 요청합니다(양방향 바인딩 레이스 없음).
- **Alienese 별칭** — 짧은 속성 별칭(`*t`→`text`, `*c`→`color`, …)을 빌드 비용 0으로.
- **타일** — 기성 `dark-mode` / `clock` / `notif-count` / `sidebar` 엘리먼트, 자기 등록.
- **빌드 없음** — `lit` / `@lit/context`는 import map으로 peer 해석. 코어 ~727 LoC · 4.55 KB min+gzip (Lit 제외, 2026-07 `packages/estreuv/scripts/measure-bundle.mjs` 실측).

## 설치

```sh
npm install estreuv          # 라이브러리
npm create estreuv@latest    # 새 앱 스캐폴드 (create-estreuv)
```

`lit`과 `@lit/context`는 import map으로 해석됩니다 — 번들러 불요. import map과 5분 quickstart는 [패키지 README](packages/estreuv/README.md)를 보세요.

## 빠른 시작

```js
import { EstreUVElement } from 'estreuv';
import { html } from 'lit';

class CounterTile extends EstreUVElement {
  static properties = { count: { type: Number } };
  count = 0;
  render() {
    return html`<button @click=${() => this.count++}>${this.count}</button>`;
  }
}
customElements.define('counter-tile', CounterTile);
```

```html
<counter-tile></counter-tile>
```

이게 단독 경로의 전부입니다 — EstreUI도 번들러도 없이요. EstreUI 라이프사이클 페어링·인텐트 컨텍스트·Alienese 별칭은 [패키지 README](packages/estreuv/README.md)에 있습니다.

실제 배포된 앱에서 보고 싶다면: [Rimlog](https://github.com/SoliEstre/Rimlog)의 보라색 AI 카드가 EstreUI 페이지 안에 사는 EstreUV 엘리먼트(`<ai-insight-card>`)입니다. 라이트/다크 테마는 shadow 경계를 넘는 CSS 변수로 전달돼요.

## 생태계

| 레이어 | 패키지 | 역할 |
| --- | --- | --- |
| **매크로**-Rimwork | [estreui](https://github.com/SoliEstre/EstreUI.js) | 페이지/섹션 흐름 (jQuery 클래스 프리미티브) |
| **마이크로**-Rimwork | **estreuv** | 위젯 엘리먼트 (Lit 클래스 프리미티브) — *이 리포* |
| **메타** 레이어 | [EstreUX](https://github.com/SoliEstre/EstreUX) | `.eux` 명세 → 양쪽 생성 (개발 시점, 런타임 무흔적) |

## 모노레포 구성

| 패키지 | npm | 용도 |
| --- | --- | --- |
| [`packages/estreuv`](packages/estreuv) | [`estreuv`](https://www.npmjs.com/package/estreuv) | 라이브러리 — 마이크로-Rimwork (인텐트 컨텍스트·라이프사이클 브리지·Alienese·타일) |
| [`packages/create-estreuv`](packages/create-estreuv) | [`create-estreuv`](https://www.npmjs.com/package/create-estreuv) | 스캐폴드 CLI (`npm create estreuv`) |
| [`packages/docs`](packages/docs) | (비공개) | VitePress 문서 사이트 — 호스팅 배포는 로드맵 |
| [`packages/playground`](packages/playground) | (비공개) | 리포 내 데모/테스트/템플릿 — EstreUI + EstreUV 페어 앱 |

## 개발

```sh
npm install            # 전체 워크스페이스
npm run test           # estreuv vitest 스위트 (39 tests)
npm run measure        # 번들 측정 (LoC / gzip)
npm run dev            # playground 개발 서버
```

## 릴리스

[Changesets](https://github.com/changesets/changesets) 기반 독립 버저닝([`.changeset/README.md`](.changeset/README.md)): `npm run version-packages`(changeset 적용) → `npm run release`(`changeset publish`). `npm publish`는 메인테이너가 실행합니다(npm 인증 세션 필요).

## 라이선스

[MIT](LICENSE) © SoliEstre
