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
  sort = descending
  valueLabels = true

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
scene "Focus France" {
  highlight "France"
}

scene "Focus Germany" {
  highlight "Germany"
}
```

### Replace data wholesale in a scene

Any scene can carry its own `data` block, which **replaces** the base data for that scene's render. Useful for "before vs after" beats:

```bpc
chart bar-vertical {
  title = "Renewables overtook coal"

  data {
    "Coal" = 32
    "Renewables" = 18
  }

  scene "2024" {
    title = "By 2024, renewables took the lead"
    data {
      "Coal" = 21
      "Renewables" = 35
    }
  }
}
```

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

See the full list in the [API reference](/api/).

## See also

- [BPC DSL — Scenes](/spec/dsl#scenes) for the source-level grammar.
- [Embedding charts](/guide/embed) for how to drop a scenes-driven chart on a page.
- [API reference](/api/#runtime-entrypoint) for the runtime entry-point symbols.
