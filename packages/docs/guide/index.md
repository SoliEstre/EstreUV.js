# What is EstreUV?

**EstreUV.js** is a **micro-Rimwork** — a Lit class primitive, sister to
[EstreUI.js](https://github.com/SoliEstre/EstreUI.js)'s macro-Rimwork (jQuery class primitive). The
two are a parallel pair: you author self-registering web components (built on
[Lit](https://lit.dev)) that drop into an EstreUI article and receive its lifecycle, or run fully
standalone.

> **0.2.0 — early access.** API stabilizing toward 1.0.0 GA. No build step. Lit core only.

## Why a sister framework?

EstreUI drives classic, jQuery-class UI; EstreUV brings the same ergonomics to **Lit web
components**. Where EstreUI manages page/article lifecycle and navigation, EstreUV components plug into
that lifecycle while keeping the reactive, encapsulated nature of custom elements. You can adopt EstreUV
inside an existing EstreUI app incrementally — one tile at a time — or use it on its own.

## What you get

- **`EstreUVElement`** — a `LitElement` base with the EstreUI lifecycle bridge and intent context wired in.
- **Lifecycle bridge** — `onBring` / `onOpen` / `onShow` / `onFocus` / `onBlur` / `onHide` / `onClose` /
  `onRelease` dispatched to your components, with per-tick dedup so each fires exactly once.
- **Intent context** — uni-directional state sharing over `@lit/context` (prop-down / event-up).
- **Alienese aliases** — short attribute aliases (`*t` → `text`, etc.) at zero build cost.
- **Bundled tiles** — dark-mode, clock, notif-count, and a sidebar to learn from or use directly.

## Footprint

~689 LoC core · 4.31 KB min+gzip (Lit external) · Lit core only, no Lit Labs · full `.d.ts` types.

Continue to [Getting started →](/guide/getting-started)
