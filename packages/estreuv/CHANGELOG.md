# estreuv

## 0.2.0

### Minor Changes

- 3100c7c: Ship TypeScript declaration files (`.d.ts` + declaration maps) for the full public API — IDE intellisense for component props, methods, and events. No build step required by consumers; types resolve via conditional `exports`. Generated from typed JSDoc via `tsc`, regenerated on every pack/publish.
