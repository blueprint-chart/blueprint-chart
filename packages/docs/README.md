# @blueprint-chart/docs

Public documentation for [Blueprint Chart](https://blueprintchart.com) — handbook, guide, BPC DSL spec, and lib API reference.

This package serves two consumers:

1. **The VitePress site** at [`docs.blueprintchart.com`](https://docs.blueprintchart.com) — `pnpm dev` / `pnpm build`.
2. **Programmatic access** for tooling such as `@blueprint-chart/mcp`:

```ts
import { listDocs, getDoc } from '@blueprint-chart/docs'

const handbookPages = listDocs('handbook')
const { entry, content } = getDoc('handbook', 'design-principles')
```

Each `dist/manifest.json` entry has `{ slug, group, title, blurb, mdPath }`. Markdown content lives under `src/` and is shipped in the published package.

## Groups

- `handbook` — dataviz pedagogy (design principles, color, typography, ...)
- `guide` — usage guides (scenes, palettes, data transforms, ...)
- `charts` — per-chart-type docs (bar, line, area, ...)
- `reference/dsl` — BPC DSL specification
- `reference/api` — `@blueprint-chart/lib` API reference

## License

MIT
