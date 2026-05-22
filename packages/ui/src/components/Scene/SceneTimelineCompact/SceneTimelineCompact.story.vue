<script setup lang="ts">
import SceneTimelineCompact from './SceneTimelineCompact.vue'

const threeScenes = [
  { name: null, index: 0, removable: false },
  { name: 'Intro', index: 1 },
  { name: 'Outro', index: 2 },
]

const longScenes = [
  { name: 'A very long scene name that should ellipsize gracefully', index: 0, removable: false },
  { name: 'Second', index: 1 },
]

const oneScene = [
  { name: null, index: 0, removable: false },
]
</script>

<template>
  <Story title="Scene / SceneTimelineCompact">
    <Variant
      title="Default — three scenes"
      :init-state="() => ({ activeIndex: 0 })"
    >
      <template #default="{ state }">
        <div style="background: var(--bc-content-bg, #1a1a1a); padding: 1rem;">
          <SceneTimelineCompact
            :scenes="threeScenes"
            v-model:active-index="state.activeIndex"
          />
        </div>
      </template>
    </Variant>

    <Variant
      title="Playing"
      :init-state="() => ({ activeIndex: 1 })"
    >
      <template #default="{ state }">
        <div style="background: var(--bc-content-bg, #1a1a1a); padding: 1rem;">
          <SceneTimelineCompact
            :scenes="threeScenes"
            v-model:active-index="state.activeIndex"
            playing
          />
        </div>
      </template>
    </Variant>

    <Variant
      title="Long scene name (ellipsis)"
      :init-state="() => ({ activeIndex: 0 })"
    >
      <template #default="{ state }">
        <div style="background: var(--bc-content-bg, #1a1a1a); padding: 1rem; max-width: 220px;">
          <SceneTimelineCompact
            :scenes="longScenes"
            v-model:active-index="state.activeIndex"
          />
        </div>
      </template>
    </Variant>

    <Variant
      title="Single scene"
      :init-state="() => ({ activeIndex: 0 })"
    >
      <template #default="{ state }">
        <div style="background: var(--bc-content-bg, #1a1a1a); padding: 1rem;">
          <SceneTimelineCompact
            :scenes="oneScene"
            v-model:active-index="state.activeIndex"
          />
        </div>
      </template>
    </Variant>

    <Variant title="Empty">
      <template #default>
        <div style="background: var(--bc-content-bg, #1a1a1a); padding: 1rem;">
          <SceneTimelineCompact
            :scenes="[]"
            :active-index="-1"
          />
        </div>
      </template>
    </Variant>
  </Story>
</template>
