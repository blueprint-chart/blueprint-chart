<template>
  <div
    v-if="ctx && !isNarrow && ctx.showTimeline.value"
    class="floating-scene-timeline"
  >
    <SceneTimeline
      :scenes="ctx.scenes.value"
      :active-index="ctx.activeIndex.value"
      :playing="ctx.playing.value"
      floating
      @update:active-index="ctx.onSelect"
      @add="ctx.onAdd"
      @remove="ctx.onRemove"
      @play="ctx.onPlay"
      @pause="ctx.onPause"
    />
  </div>
</template>

<script setup lang="ts">
import { SceneTimeline, useBreakpoint } from '@blueprint-chart/ui'
import { sceneTimelineKey } from '@/composables/sceneTimelineContext'

// Floats the scene timeline at the bottom of the surrounding canvas. Renders
// directly in place (no <Teleport>) and reads its data/handlers from the
// context provided by WizardShell. Renders nothing when the context is absent
// (e.g. used outside the wizard), in narrow mode, or when the timeline is
// hidden for the current step.
const ctx = inject(sceneTimelineKey, null)
const { isNarrow } = useBreakpoint()
</script>

<style scoped lang="scss">
.floating-scene-timeline {
  // Sit a small, uniform inset from the canvas EDGES. The card lives inside the
  // canvas's content padding, so negative margins cancel that padding
  // (--fst-canvas-pad-*, set by each canvas; default 0) and --fst-inset re-adds
  // the desired gap. margin-top:auto pins it to the bottom when content is
  // short; position:sticky keeps it pinned while the canvas scrolls.
  --fst-inset: var(--canvas-float-inset, 0.75rem);
  margin-top: auto;
  margin-inline: calc(var(--fst-canvas-pad-x, 0px) * -1 + var(--fst-inset));
  margin-bottom: calc(var(--fst-canvas-pad-y, 0px) * -1 + var(--fst-inset));
  position: sticky;
  bottom: calc(var(--fst-inset) - var(--fst-canvas-pad-y, 0px));
  z-index: 5; // above the canvas grid/card, below panel overlays (z-index:10)
  pointer-events: none; // let empty gaps pass clicks through to the canvas

  > * {
    pointer-events: auto; // the timeline card itself stays interactive
  }
}
</style>
