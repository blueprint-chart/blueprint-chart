---
layout: home

hero:
  name: Blueprint Chart
  text: The open chart format AI writes.
  tagline: "An open, plain-text chart format an AI can write and any browser can render. Self-contained, no backend, no account required."
  image:
    src: /logo.svg
    alt: Blueprint Chart
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: Open the Editor
      link: https://blueprintchart.com
    - theme: alt
      text: View on GitHub
      link: https://github.com/blueprint-chart/blueprint-chart

features:
  - icon: 📝
    title: A text format for charts
    details: Describe a chart in a compact, declarative `.bpc` DSL. Parse, serialize, and round-trip safely with the Peggy-based grammar.
    link: /reference/dsl/
    linkText: Read the spec

  - icon: 🤖
    title: Author with AI
    details: Connect the Blueprint Chart MCP to Claude, Claude Code, or Cursor — describe a chart in plain language and your assistant writes, validates, and renders the `.bpc` for you.
    link: /guide/mcp
    linkText: Use the MCP

  - icon: 🎬
    title: Scenes — same chart, different states
    details: Every chart can define multiple scenes that play back as an animated narrative. Built for explanatory journalism.
    link: /guide/scenes
    linkText: Explore scenes

  - icon: 🔒
    title: Static-first, data-sovereign
    details: Charts render entirely in the browser. No backend required to author, host, or embed. Your data never leaves the page.

  - icon: 📊
    title: 13 chart types
    details: Bar, line, area, column, pie, and donut families — each tuned for a specific story shape.
    link: /charts/
    linkText: Browse the catalogue

  - icon: 🎨
    title: 50+ palettes, CVD-safe
    details: Curated palettes with WCAG-aware contrast and color-vision-deficiency checks built into the library.
    link: /guide/palettes
    linkText: Choose a palette

  - icon: 📖
    title: Opinionated dataviz handbook
    details: Design principles, anti-patterns, frame elements, typography, and accessibility — the rules behind every chart.
    link: /handbook/
    linkText: Read the handbook

  - icon: 🧩
    title: Three composable packages
    details: A pure TS chart engine (`lib`), a Vue 3 component library (`ui`), and an authoring editor — each independently usable.

  - icon: ⚡
    title: Standalone runtime
    details: Drop one script tag on any page and Blueprint Chart auto-mounts every embedded chart. No framework, no build step required.
    link: /guide/embed
    linkText: See embedding

---

## Quick install

```bash
pnpm add @blueprint-chart/lib
```

```ts
import { parse, registerChart, /* renderers */ } from '@blueprint-chart/lib'

const ast = parse(`
  chart line {
    title = "Bitcoin year-end closing price"
    data { "2022" = 16547  "2023" = 42258  "2024" = 93429 }
  }
`)
```

For the full quickstart, head to [Getting Started](/guide/getting-started).
