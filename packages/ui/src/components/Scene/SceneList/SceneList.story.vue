<script setup lang="ts">
import SceneList from './SceneList.vue'

const defaultScenes = [
  { name: 'China emits more CO₂ than the US and India combined', index: 0, removable: false, thumbnail: null, hint: 'base scene' },
  { name: 'Stacked view', index: 1, removable: true, thumbnail: null, hint: 'inherits China emits more…' },
  { name: 'Per-capita', index: 2, removable: true, thumbnail: null, hint: 'inherits Stacked view' },
]

const oneOverride = [
  { name: 'Base', index: 0, removable: false, thumbnail: null, hint: 'base scene' },
  { name: 'Override', index: 1, removable: true, thumbnail: null, hint: 'custom data' },
]

const manyOverrides = Array.from({ length: 6 }, (_, i) => {
  if (i === 0) {
    return { name: 'Base', index: 0, removable: false, thumbnail: null, hint: 'base scene' }
  }
  return { name: `Override ${i}`, index: i, removable: true, thumbnail: null, hint: i === 1 ? 'inherits base' : `inherits Override ${i - 1}` }
})

const longName = [
  { name: 'Base', index: 0, removable: false, thumbnail: null, hint: 'base scene' },
  {
    name: 'A very long scene name that demonstrates wrap behavior at narrow widths without being clipped',
    index: 1,
    removable: true,
    thumbnail: null,
    hint: 'custom data',
  },
]
</script>

<template>
  <Story title="Scene / SceneList">
    <Variant title="Default — three scenes">
      <SceneList
        :scenes="defaultScenes"
        :active-index="1"
      />
    </Variant>
    <Variant title="Playing">
      <SceneList
        :scenes="defaultScenes"
        :active-index="1"
        playing
      />
    </Variant>
    <Variant title="Single override">
      <SceneList
        :scenes="oneOverride"
        :active-index="1"
      />
    </Variant>
    <Variant title="Many overrides (scroll)">
      <div style="height: 360px; overflow-y: auto;">
        <SceneList
          :scenes="manyOverrides"
          :active-index="0"
        />
      </div>
    </Variant>
    <Variant title="Long scene name (wrap)">
      <SceneList
        :scenes="longName"
        :active-index="1"
      />
    </Variant>
  </Story>
</template>
