---
layout: home

hero:
  name: EstreUV.js
  text: Micro-Rimwork
  tagline: A Lit class primitive — sister to EstreUI.js. Self-registering web components, no build step.
  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: What is EstreUV?
      link: /guide/
    - theme: alt
      text: Tiles
      link: /tiles

features:
  - title: No build
    details: Consumed as an npm dependency over an import map. ES modules, Lit core only — no bundler required.
  - title: EstreUI lifecycle bridge
    details: Drop a component into an EstreUI article and it receives all eight lifecycle hooks, with per-tick dedup.
  - title: Standalone too
    details: The Lit native channel and the EstreUI channel stay separate, so components work with or without EstreUI.
  - title: Intent context
    details: Uni-directional state sharing via @lit/context — prop-down, event-up, no two-way binding race.
  - title: Alienese aliases
    details: Short attribute aliases map to reactive properties at zero build cost.
  - title: Tiny
    details: ~689 LoC core · 4.31 KB min+gzip (Lit external) · full TypeScript declarations.
---
