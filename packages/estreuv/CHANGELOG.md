# estreuv

## 1.0.0

### Major Changes

- GA (General Availability) release. Promote the public API, types, and pair compatibility to a stable surface — GA gate G1–G6 (browser, pair, regression-0) criteria met. 0.x → 1.0.0 under SemVer: a stability commitment, with breaking changes after 1.0 requiring a major bump.

### Minor Changes

- d734a3d: `estreuv-sidebar-item` gains an optional `count` badge, and `estreuv-sidebar` propagates a `counts` map (by item label) to its items via prop-down. `estreuv-notif-count-tile` now reflects `intent.notifCount` live (not only on `onShow`). Together these enable strongly-coupled, single-source-of-truth UIs (e.g., folder unread badges that update from shared intent).
- 77a3c38: Rename the sidebar components to neutral names: `estreuv-notelle-sidebar` → `estreuv-sidebar`, `estreuv-notelle-item` → `estreuv-sidebar-item` (modules `estreuv/sidebar.js`, `estreuv/sidebar-item.js`). The activation event is now `estreuv-sidebar-activate` and intent keys are `sidebarCollapsed` / `sidebarActive`. **Breaking** for the sidebar prototype (pre-1.0 early access) — the "Notelle" name is reserved for a separate future product and decoupled from the library.

### Patch Changes

- dbf8db4: Fix intent context for the common EstreUI case where tiles connect **before** the article attaches the provider (`provideIntent` in `onOpen`). A `ContextRoot` now buffers early `context-request`s, and `provideIntent` calls `provider.hostConnected()` so a provider on a plain (non-ReactiveElement) host re-dispatches to already-connected consumers. Previously such consumers kept their default `{}` intent and never received provided values (prop-down silently broken).

## 0.2.0

### Minor Changes

- 3100c7c: Ship TypeScript declaration files (`.d.ts` + declaration maps) for the full public API — IDE intellisense for component props, methods, and events. No build step required by consumers; types resolve via conditional `exports`. Generated from typed JSDoc via `tsc`, regenerated on every pack/publish.
