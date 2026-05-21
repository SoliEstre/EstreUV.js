# Intent context

EstreUV shares state **uni-directionally** over [`@lit/context`](https://lit.dev/docs/data/context/):
providers push *intent* down; components request changes up. There is no two-way binding, so there's no
binding race.

```
provider ──(intent, prop-down)──▶ components
components ──(requestIntentUpdate, event-up)──▶ provider
```

## Provide (EstreUI side / app shell)

```js
import { provideIntent } from 'estreuv';

const { provider, update } = provideIntent(host, { step: 'home', notifCount: 0 });
// later: update({ notifCount: 3 })
```

## Consume (inside a component)

`EstreUVElement` consumes automatically — read `this.intent`. To consume manually:

```js
import { consumeIntent } from 'estreuv';

consumeIntent(this, (intent) => { this.intent = intent ?? {}; });
```

`this.intent` is **read-only from the child** — never assign to it directly.

## Request a change (event-up)

```js
import { requestIntentUpdate } from 'estreuv';

requestIntentUpdate(this, { notifCount: 3 }); // dispatches an 'intent-update' event the owner applies
```

`EstreUVElement` also exposes `this.requestIntentUpdate(patch)` as a convenience.

## The `EstreIntent` shape

```ts
interface EstreIntent {
  step?: string;            // EstreUI navigation step (%step)
  instanceOrigin?: string;  // multi-instance prefix (^...)
  data?: Record<string, any>;
  flags?: Record<string, any>;
}
```

The owner article listens for `intent-update` and applies the patch to the provider, which propagates
the new value down to every consumer — closing the loop without child→parent mutation.
