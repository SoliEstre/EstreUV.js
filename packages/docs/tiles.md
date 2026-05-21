# Tiles

EstreUV ships a few example components — useful directly, and worth reading as patterns for authoring
your own. Each registers itself on import: `import 'estreuv/<name>.js'`.

## `<estreuv-dark-mode-tile>`

A theme toggle cycling **auto → light → dark**, persisted to `localStorage` and applied to
`body[data-dark-mode]` (delegates to `estreUi.setDarkMode` when EstreUI is present). Pattern:
local-state + global-API delegation.

```html
<estreuv-dark-mode-tile></estreuv-dark-mode-tile>
<estreuv-dark-mode-tile text="Theme" color="#2a8"></estreuv-dark-mode-tile>
```

| Attribute | Alias | Meaning |
| --- | --- | --- |
| `data-dark-mode-state` | — | `auto` \| `light` \| `dark` |
| `text` | `*t` | label override |
| `color` | `*c` | icon / border color |

Method: `.cycle()` — advance to the next state.

## `<estreuv-clock-tile>`

A timer-driven clock. Starts its interval on `onShow`, stops on `onHide` — a clean example of
**resource lifecycle** tied to visibility (and `onClose`/`onRelease`/`disconnectedCallback` cleanup).

```html
<estreuv-clock-tile></estreuv-clock-tile>
<estreuv-clock-tile format="12h" text="12h"></estreuv-clock-tile>
```

## `<estreuv-notif-count-tile>`

A badge counter driven by **external / intent** state. `bump(by)` and `clear()` delegate via
`requestIntentUpdate` (no direct mutation); `onShow` syncs from `intent.notifCount`. Shows `N+` past
`maxDisplay`.

```html
<estreuv-notif-count-tile></estreuv-notif-count-tile>
<estreuv-notif-count-tile count="128" max="99" text="badge cap"></estreuv-notif-count-tile>
```

Methods: `.bump(by = 1)`, `.clear()`.

## `<estreuv-notelle-sidebar>` + `<estreuv-notelle-item>`

A nested-container prototype — a sidebar with light-DOM `<estreuv-notelle-item>` children. Demonstrates
**nested lifecycle** (children receive hooks via the flat dispatch) and host-level event bubbling.

```html
<estreuv-notelle-sidebar title="Notelle">
  <estreuv-notelle-item label="Inbox" icon="📥"></estreuv-notelle-item>
  <estreuv-notelle-item label="Archive" icon="🗄"></estreuv-notelle-item>
  <estreuv-notelle-item label="Trash" icon="🗑"></estreuv-notelle-item>
</estreuv-notelle-sidebar>
```

::: tip Live pair demo
The [playground](https://github.com/SoliEstre/EstreUV.js/tree/main/packages/playground) runs all of
these inside an EstreUI article — the canonical EstreUI + EstreUV pair example.
:::
