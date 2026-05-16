# create-estreuv

Scaffolding tool for [EstreUV.js](https://github.com/SoliEstre/EstreUV.js) projects.

```sh
npm create estreuv my-app
# or
npm create estreuv my-app -- --pure      # pure EstreUV app
npm create estreuv my-app -- --pair      # EstreUI + EstreUV pair app
```

## Project types

| Type | What you get |
| --- | --- |
| **pure** | Minimal EstreUV app — import map (lit + estreuv), tile demo, `estreuv dev` server. No build, no EstreUI. |
| **pair** | An EstreUI app (scaffolded via `create-estreui`) + the EstreUV overlay (import map, `scripts/estreuv-tiles.js`, deps) and `ESTREUV-PAIR.md` with the one page-handler wiring step. |

## CLI (`estreuv`)

The package also installs an `estreuv` bin in scaffolded projects:

| Command | Behavior |
| --- | --- |
| `estreuv dev` | HTTPS dev server (shared with `create-estreui` — mkcert/openssl auto-cert). |
| `estreuv update` | `npm update estreuv lit @lit/context`; a pair app also refreshes the EstreUI shell. |
| `estreuv add <pkg>` | Pure: `npm install` + import-map guidance. Pair: delegates to `create-estreui` (vendored). |
| `estreuv remove <pkg>` | Symmetric to `add`. |

## Design

`dev` is reused from `create-estreui` verbatim (zero EstreUI-specific logic →
no fork drift). Pair mode delegates the EstreUI shell to `create-estreui`
rather than duplicating its vendored-asset logic (PM 008 R5: maximize
sharing; a common scaffold core is a later follow-up).

## License

MIT © SoliEstre
