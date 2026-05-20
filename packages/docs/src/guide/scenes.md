---
title: Scenes
---

# Scenes

> Same chart, different states — composed into a story that a reader can step through.

## Why this matters

Journalism rarely sits still on a single chart. A finding has a build-up, a turn, and a punchline. In Blueprint Chart, a **scene** is a named visualisation state — the same chart with different data, highlighting, annotations, or styling — and a sequence of scenes is the chart's **story**. You write scenes in the same `.bpc` document, and the runtime gives the reader Previous / Next controls (or your own UI) to walk through them.

## Quickstart

A bar chart with three narrative beats — each one highlights a different country:

```bpc
chart bar-horizontal {
  title = "Five nations produce 80% of global CO₂"
  description = "Annual emissions in billion tonnes, 2023"
  source = "Global Carbon Project"
  sourceUrl = "https://globalcarbonproject.org"
  sort = descending
  valueLabels = true
  horizontalGridStyle = none
  showVerticalAxis = true
  showVerticalTicks = false
  verticalGridStyle = none

  data {
    "China" = 11.90
    "United States" = 4.78
    "India" = 2.88
    "Russia" = 1.78
    "Japan" = 1.02
  }

  scene "China spotlight" {
    title = "China emits more than the US and India combined"

    highlight "China"
  }

  scene "India rising" {
    title = "India surpassed the EU in 2023"

    highlight "India"
  }

  scene "Japan declining" {
    title = "Japan's emissions fell 20% from their peak"

    highlight "Japan"
  }
}
```

::: tip From the sample library
This is `packages/lib/src/samples/co2-emissions-story.bpc` verbatim — three scenes, each one re-titling the chart and shifting the highlight to a new country. The base data stays the same; only the framing changes.
:::

Open this in the editor to see the scene timeline appear automatically; embed it on a page and readers get a Previous / Next nav.

## How it works

A scene block accepts the same member set as the top-level chart, **plus** annotation-visibility verbs. At parse time, each `scene` becomes a `SceneNode` in the AST. The DSL converter merges scene members on top of the base chart to produce the **effective** `ChartData` and `ChartOptions` for that scene.

At render time:

1. The runtime collects the chart's scenes into a `SceneDefinition[]`.
2. `createSceneController(container, scenes, onSceneChange)` injects a small `<nav>` (Previous / Next / counter) into the container.
3. On every scene change, the callback re-renders the chart with `transition = true`, which triggers the motion helpers (`snapshotForFadeOut`, `commitFadeOut`, `fadeIn`) and animates the crossfade.
4. `goTo(index)` clamps and wraps so `goTo(-1)` cycles to the last scene.

The pipeline that runs per scene is the same eleven-step sequence documented in [Embedding](/guide/embed) and the DSL spec — scene overrides are merged at step 3 (transforms), so everything downstream sees the post-scene state.

## Recipes

### Highlight a different point per scene

The short-form `highlight "<name>"` is the workhorse. Drop one per scene and the rest of the chart greys out:

```bpc
scene "China spotlight" {
  title = "China emits more than the US and India combined"

  highlight "China"
}

scene "India rising" {
  title = "India surpassed the EU in 2023"

  highlight "India"
}
```

::: tip From the sample library
Two adjacent scenes from `packages/lib/src/samples/co2-emissions-story.bpc`. Each scene retitles the chart and shifts the spotlight without touching the base data.
:::

### Replace data wholesale in a scene

Any scene can carry its own `data` block, which **replaces** the base data for that scene's render. The Bulgaria scene from `farm-compass` drops the EU-wide aggregate in favour of a country-specific time series, and keeps the same `area-stacked` chart type:

```bpc
scene "Bulgaria: subsidies explode" {
  title = "Subsidies to Bulgarian farmers, million euros"
  description = "85% of Bulgarian subsidies are direct payments — the highest share among new members"

  data {
    _series = "Indirect subsidies","Direct subsidies"
    "2000" = 0,5
    "2004" = 0,67
    "2007" = 59,250
    "2010" = 79,466
    "2013" = 132,852
    "2015" = 213,677
  }

  highlight "Direct subsidies"
}
```

::: tip From the sample library
Trimmed scene from `packages/lib/src/samples/farm-compass.bpc` (full sample has the 2000–2015 yearly series). The scene swaps data and keeps the parent chart's `area-stacked` type.
:::

### Switch chart type mid-story

A scene can override the chart type with `type =`. The same `farm-compass` story leaves the parent `area-stacked` chart and pivots to a `line` for the "farms grew" beat, then back to an `area-stacked` later on:

```bpc
scene "Bulgarian farms grew" {
  title = "Average farm size in Bulgaria quadrupled"
  description = "Average farm size in hectares"
  type = line

  data {
    "2005" = 5
    "2007" = 6
    "2010" = 12
    "2013" = 18
  }
}
```

::: tip From the sample library
Scene #5 of `packages/lib/src/samples/farm-compass.bpc`. The story changes chart type three times across nine scenes — `area-stacked` → `line` → `area` → `area-stacked` → bar — all from one document.
:::

### Hide an annotation in a later scene

Use `hide_annotation`, `hide_range`, or `hide_note` with the annotation's id to peel things back as the story progresses:

```bpc
annotation "2015" {
  id = "paris"
  text = "Paris Agreement"
}

scene "Without Paris callout" {
  hide_annotation "paris"
}
```

To bring it back later, use `show_annotation "paris"` in a subsequent scene.

### Drive playback from your own UI

The controller is decoupled from the nav DOM it inserts — you can ignore the built-in buttons and call `next()`, `previous()`, or `goTo(index)` from any custom UI:

```ts
import { createSceneController } from '@blueprint-chart/lib/dist/runtime'

const controller = createSceneController(container, scenes, (scene, index) => {
  renderChart(canvas, scene.data, true)
})

document.querySelector('#my-next-button')!.addEventListener('click', () => {
  controller.next()
})

// Programmatic jump:
controller.goTo(2)
```

Call `controller.destroy()` to remove the injected nav when tearing the chart down.

## API surface

Exported from `@blueprint-chart/lib/dist/runtime`:

| Symbol | One-liner |
| --- | --- |
| `createSceneController(container, scenes, onSceneChange)` | Build a scene controller, inject Previous / Next nav, call back on every scene change. |
| `SceneDefinition` (type) | `{ name: string, data?: Record<string, unknown> }` — one scene's payload. |
| `SceneController` (type) | Returned object with `currentScene`, `totalScenes`, `next()`, `previous()`, `goTo(index)`, `destroy()`. |
| `createStepController` / `StepDefinition` / `StepController` | Deprecated aliases retained for backward compatibility — new code should use the `Scene*` names. |

Motion helpers used internally during scene transitions (all exported from `@blueprint-chart/lib`):

| Symbol | One-liner |
| --- | --- |
| `getTransitionDuration()` | Canonical fade duration shared with the editor's UI transitions. |
| `snapshotForFadeOut(container)` | Capture the outgoing DOM for fade-out. |
| `commitFadeOut(snapshot)` | Animate the snapshot out. |
| `fadeIn(container)` | Animate the new render in. |
| `getCachedChart(container)` | Last render, for diff-based interpolation. |

DSL converter helpers (also exported from `@blueprint-chart/lib`):

| Symbol | One-liner |
| --- | --- |
| `extractSceneOverrides(ast)` | Pull each scene's merged `ChartData` / `ChartOptions` from a parsed AST. |
| `SceneNode` (type) | AST node for a `scene` block. |

See the full list in the [API reference](/reference/api/).

## See also

- [BPC DSL — Scenes](/reference/dsl/scenes-and-transforms#scenes) for the source-level grammar.
- [Embedding charts](/guide/embed) for how to drop a scenes-driven chart on a page.
- [API reference](/reference/api/#runtime-entrypoint) for the runtime entry-point symbols.
