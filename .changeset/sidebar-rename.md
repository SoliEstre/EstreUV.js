---
"estreuv": minor
---

Rename the sidebar components to neutral names: `estreuv-notelle-sidebar` → `estreuv-sidebar`, `estreuv-notelle-item` → `estreuv-sidebar-item` (modules `estreuv/sidebar.js`, `estreuv/sidebar-item.js`). The activation event is now `estreuv-sidebar-activate` and intent keys are `sidebarCollapsed` / `sidebarActive`. **Breaking** for the sidebar prototype (pre-1.0 early access) — the "Notelle" name is reserved for a separate future product and decoupled from the library.
