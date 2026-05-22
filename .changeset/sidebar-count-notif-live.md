---
"estreuv": minor
---

`estreuv-sidebar-item` gains an optional `count` badge, and `estreuv-sidebar` propagates a `counts` map (by item label) to its items via prop-down. `estreuv-notif-count-tile` now reflects `intent.notifCount` live (not only on `onShow`). Together these enable strongly-coupled, single-source-of-truth UIs (e.g., folder unread badges that update from shared intent).
