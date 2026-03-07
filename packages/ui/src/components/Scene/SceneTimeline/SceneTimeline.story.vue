<script setup lang="ts">
import SceneTimeline from './SceneTimeline.vue'

const defaultScenes = [
  { name: 'Overview', index: 0, changes: 0 },
  { name: null, index: 1, changes: 2 },
]

const multipleScenes = [
  { name: 'Overview', index: 0, changes: 0 },
  { name: 'Top 3 letters', index: 1, changes: 2 },
  { name: 'Highlight A', index: 2, changes: 1 },
  { name: null, index: 3, changes: 3 },
  { name: 'Conclusion', index: 4, changes: 0 },
]

const playingScenes = [
  { name: 'Step 1', index: 0, changes: 1 },
  { name: 'Step 2', index: 1, changes: 2 },
  { name: 'Step 3', index: 2, changes: 0 },
]
</script>

<template>
  <Story title="Scene/SceneTimeline">
    <Variant
      title="Default"
      :init-state="() => ({ activeIndex: 0 })"
    >
      <template #default="{ state }">
        <div style="background: var(--bc-void-bg, #1a1a1a); padding: 1rem;">
          <SceneTimeline
            :scenes="defaultScenes"
            :active-index="state.activeIndex"
            @update:active-index="state.activeIndex = $event"
          />
        </div>
      </template>
    </Variant>

    <Variant
      title="Multiple"
      :init-state="() => ({ activeIndex: 1 })"
    >
      <template #default="{ state }">
        <div style="background: var(--bc-void-bg, #1a1a1a); padding: 1rem;">
          <SceneTimeline
            :scenes="multipleScenes"
            :active-index="state.activeIndex"
            @update:active-index="state.activeIndex = $event"
          />
        </div>
      </template>
    </Variant>

    <Variant title="Playing">
      <template #default>
        <div style="background: var(--bc-void-bg, #1a1a1a); padding: 1rem;">
          <SceneTimeline
            :scenes="playingScenes"
            :active-index="1"
            :playing="true"
          />
        </div>
      </template>
    </Variant>

    <Variant title="Empty">
      <template #default>
        <div style="background: var(--bc-void-bg, #1a1a1a); padding: 1rem;">
          <SceneTimeline :scenes="[]" />
        </div>
      </template>
    </Variant>
  </Story>
</template>
