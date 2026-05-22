# API reference

Everything is exported from the `estreuv` barrel. Components are also importable individually as
`estreuv/<name>.js` (side-effect import registers the custom element). Full TypeScript declarations ship
in the package (`types/`), so editors give intellisense for props, methods, and events.

## Base class

### `EstreUVElement`

`extends LitElement`. Base for all EstreUV components.

| Member | Type | Notes |
| --- | --- | --- |
| `intent` | `EstreIntent` | current intent (auto-consumed, **read-only from child**) |
| `requestIntentUpdate(patch)` | `(Partial<EstreIntent>) => void` | event-up delegation |
| `getLifecycleHistory()` | `() => { hook: string; t: number }[]` | debug |
| `hasLifecycleFired(hookName)` | `(string) => boolean` | debug |
| `onBring`/`onOpen`/`onShow`/`onFocus`/`onBlur`/`onHide`/`onClose`/`onRelease` | `(handle, ...args) => void` | EstreUI lifecycle hooks (override; no-op by default) |

## Lifecycle bridge

| Export | Signature | Purpose |
| --- | --- | --- |
| `wireArticle` | `(root: HTMLElement) => Record<string, (...a) => void>` | dispatcher map keyed by hook |
| `dispatchLifecycle` | `(root, hookName, ...args) => void` | fan a hook out to `[data-estreuv]` children |
| `getLifecycleHistory` | `(comp: HTMLElement) => { hook, t }[]` | component hook history |
| `ESTREUI_LIFECYCLE_NAMES` | `readonly string[]` | the eight hook names |

## Intent context

| Export | Signature | Purpose |
| --- | --- | --- |
| `provideIntent` | `(host, initial?) => { provider, update(next) }` | provider helper |
| `consumeIntent` | `(host, cb: (intent) => void) => ContextConsumer` | manual consume |
| `requestIntentUpdate` | `(child, patch: Partial<EstreIntent>) => void` | event-up |
| `intentContext` | `Context<symbol, any>` | the Lit context key |

```ts
interface EstreIntent {
  step?: string;
  instanceOrigin?: string;
  data?: Record<string, any>;
  flags?: Record<string, any>;
}
```

## Alienese aliases

| Export | Signature | Purpose |
| --- | --- | --- |
| `applyAliases` | `(ctor, aliasMap?) => ctor` | install aliases (chainable) |
| `resolveAlias` | `(aliasOrLongForm, aliasMap?) => string` | one-shot resolution |
| `isAliasApplied` | `(ctor) => boolean` | check |
| `ALIENESE_DEFAULT_ALIASES` | `Readonly<Record<string,string>>` | `*t→text`, `*bg→background`, `*c→color`, `*sz→size`, `*on→enabled`, `*ic→icon` |

## Bundled components

`estreuv/dark-mode-tile.js` · `estreuv/clock-tile.js` · `estreuv/notif-count-tile.js` ·
`estreuv/sidebar.js` · `estreuv/sidebar-item.js` — see [Tiles](/tiles).

::: info Generated from types
This reference tracks the shipped `.d.ts`. A fully type-generated API site (typedoc) is a planned
enhancement.
:::
