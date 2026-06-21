# Rendering in code

The `render()` function is the primary programmatic entry point for `@blueprint-chart/lib`. It accepts a BPC source string and returns a **chart handle** — an object with methods to produce SVG, PNG, or a live DOM mount.

## Node — write SVG and PNG to disk

```ts
import { render } from '@blueprint-chart/lib'
import { writeFile } from 'node:fs/promises'

const chart = await render(bpc)
await writeFile('chart.svg', await chart.toSvg())
await writeFile('chart.png', await chart.toPng({ width: 1200 }))
```

PNG export and headless SVG in Node require optional native deps (`jsdom`, `@napi-rs/canvas`, `@resvg/resvg-js`). These are installed automatically as `optionalDependencies`. If a binary failed to install, the Node methods throw `MissingNodeRenderDepsError` naming what to reinstall.

## Browser — mount and step scenes

```ts
const { mount, scene } = await render(bpc)
mount('#chart')   // element or selector
scene(2)          // advance to scene index 2
```

`mount` accepts an `HTMLElement` or a CSS selector string and returns the handle for chaining. `scene(n)` steps to scene index `n` and is also chainable.

## Options

Pass a second argument to `render()` to control the output:

| Option | Default | Description |
| --- | --- | --- |
| `theme` | system | `'light'` or `'dark'` |
| `scene` | `0` | Initial scene index |
| `width` | `640` | Output width in px (headless only) |
| `height` | `400` | Output height in px (headless only) |
| `frame` | `true` | `false` renders frameless (no title/source/etc.) |

```ts
const chart = await render(bpc, { theme: 'dark', width: 1200, height: 630 })
```

## The handle

`render()` resolves to a `ChartHandle`. Its methods are **bound** — destructure freely — and `mount`/`scene` are **chainable**.

| Method | Browser | Node | Returns |
| --- | --- | --- | --- |
| `toSvg(opts?)` | ✅ | ✅ | `Promise<string>` |
| `toHtml(opts?)` | ✅ | ✅ | `Promise<string>` |
| `toPng(opts?)` | ❌ throws `PngBrowserUnsupportedError` | ✅ | `Promise<Uint8Array>` |
| `mount(target)` | ✅ | no-op (warns) | `ChartHandle` |
| `scene(n)` | ✅ | ✅ | `ChartHandle` |

See the [API reference](/reference/api/) for the full surface of `@blueprint-chart/lib`, including low-level rendering primitives and the chart-type registry.
