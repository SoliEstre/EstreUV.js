---
"estreuv": patch
---

Fix intent context for the common EstreUI case where tiles connect **before** the article attaches the provider (`provideIntent` in `onOpen`). A `ContextRoot` now buffers early `context-request`s, and `provideIntent` calls `provider.hostConnected()` so a provider on a plain (non-ReactiveElement) host re-dispatches to already-connected consumers. Previously such consumers kept their default `{}` intent and never received provided values (prop-down silently broken).
