# Lifecycle bridge

When a component lives inside an EstreUI article, the lifecycle bridge maps the article's lifecycle onto
your components' same-named methods (a duck-typing dispatch, à la Vaadin Router).

## The eight hooks

`onBring` · `onOpen` · `onShow` · `onFocus` · `onBlur` · `onHide` · `onClose` · `onRelease`

- **Non-cyclic** (once per page life): `onBring` < `onOpen` < … < `onClose` < `onRelease`.
- **Cyclic** (may repeat): `onShow` / `onFocus` / `onBlur` / `onHide` — re-entry on every revisit.

## Wiring

From the article's page handler, wire once:

```js
import { wireArticle } from 'estreuv';

// inside the EstreUI page handler
const dispatch = wireArticle(articleRoot);
// dispatch.onShow(handle), dispatch.onHide(handle), ... forwarded to all [data-estreuv] children
```

`wireArticle(root)` returns a map of dispatchers keyed by hook name. Calling a dispatcher fans the hook
out to every EstreUV component under `root`.

## Per-tick dedup

If the same hook is dispatched to the same root twice within one synchronous tick, the second is
**skipped** with a console warning:

```
[EstreUV] dispatchLifecycle('onShow') re-entrant on same root within tick — skipped
```

This guards against double-fire races when several code paths drive the same article. Each hook fires
**exactly once per tick** per component.

## Introspection

```js
comp.getLifecycleHistory();      // [{ hook, t }, ...]
comp.hasLifecycleFired('onShow'); // boolean
```

See also: [`dispatchLifecycle`, `ESTREUI_LIFECYCLE_NAMES`](/api/) in the API reference.
