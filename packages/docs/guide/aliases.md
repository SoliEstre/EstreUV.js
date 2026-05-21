# Alienese aliases

Alienese aliases map short identifiers to long-form reactive properties at **zero build cost**.

```js
import { EstreUVElement, applyAliases } from 'estreuv';

class MyTile extends EstreUVElement {
  static aliases = { '*t': 'text', '*c': 'color' };
}
applyAliases(MyTile);            // call before customElements.define
customElements.define('my-tile', MyTile);
```

## How the three forms map

```
Alienese form (*t)        ┐
                          ├─► long-form name (text) ─► reactive property
HTML attribute (text)     ┘
```

- **HTML markup** uses the long-form attribute: `<my-tile text="hi" color="blue">`. (`*` is not a
  valid HTML attribute char, so the `*`-prefixed form is **JS-side only**.)
- **JS** can use either: `tile.text` or `tile['*t']` (the alias getter/setter delegates to `text`).

```js
tile['*t'] = 'world';   // === tile.text = 'world' (reactive update)
tile['*t'];             // === tile.text
```

## Defaults

`ALIENESE_DEFAULT_ALIASES` covers the common set:

| Alias | Long-form |
| --- | --- |
| `*t` | `text` |
| `*bg` | `background` |
| `*c` | `color` |
| `*sz` | `size` |
| `*on` | `enabled` |
| `*ic` | `icon` |

## Helpers

- `applyAliases(ctor, aliasMap?)` — install aliases (uses `ctor.aliases` if `aliasMap` omitted).
- `resolveAlias(aliasOrLongForm, aliasMap?)` — one-shot resolution (for markup generators / tooling).
- `isAliasApplied(ctor)` — check whether a class has aliases installed.

::: tip Naming convention
Don't use single-letter JS identifiers (`t`, `bg`, `c`, …) for local variables — they collide with the
Alienese namespace. Use `$tile`, `targetTile`, etc.
:::
