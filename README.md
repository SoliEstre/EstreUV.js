# EstreUV.js

**Micro-Rimwork** — a Lit class primitive, sister to [EstreUI.js](https://github.com/SoliEstre/EstreUI.js)'s
macro-Rimwork (jQuery class primitive). The two are a parallel pair: EstreUX's `.eux` expands to both
targets (γ-EstreUX-driven).

> Status: **0.1.0 early access** — API stabilizing. 1.0.0 GA targeted 2026-06.

## Monorepo layout

| Package | npm | Purpose |
| --- | --- | --- |
| [`packages/estreuv`](packages/estreuv) | `estreuv` | The library (Lit-based micro-Rimwork: intent context, lifecycle bridge, Alienese alias, tiles) |
| `packages/create-estreuv` | `create-estreuv` | Scaffold CLI (`npm create estreuv`) — added in Phase 2 |
| [`packages/playground`](packages/playground) | (private) | In-repo demo / test / template source — EstreUI + EstreUV pair app |

## Quickstart

See [`packages/estreuv/README.md`](packages/estreuv/README.md) for the 5-minute library quickstart
(importmap + `<script type="module">` + tile usage), the EstreUI pairing model, Alienese aliasing,
and the lifecycle bridge.

## Development

```sh
npm install            # installs all workspaces
npm run test           # packages/estreuv vitest suite
npm run measure        # bundle measurement (I1 LoC / I3 gzip)
npm run dev            # playground dev server
```

## Releasing

[Changesets](https://github.com/changesets/changesets)-driven independent versioning. See
[`.changeset/README.md`](.changeset/README.md). `npm publish` is performed by the maintainer
(npm auth session required).

## License

MIT © SoliEstre
