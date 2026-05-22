<script setup lang="ts">
import Sortable from 'sortablejs'
import SceneTimelineControls from '../SceneTimeline/SceneTimelineControls.vue'
import SceneListItem from './SceneListItem.vue'

interface SceneEntry {
  name: string | null
  index: number
  removable?: boolean
  thumbnail?: string | null
  hint?: string | null
}

const activeIndex = defineModel<number>('activeIndex', { default: -1 })

withDefaults(defineProps<{
  scenes: SceneEntry[]
  playing?: boolean
}>(), {
  playing: false,
})

const emit = defineEmits<{
  add: []
  remove: [index: number]
  play: []
  pause: []
  reorder: [{ from: number, to: number }]
}>()

const listEl = ref<HTMLElement | null>(null)

let sortable: Sortable | null = null

onMounted(() => {
  if (!listEl.value) {
    return
  }
  sortable = Sortable.create(listEl.value, {
    handle: '.scene-list-item__handle',
    filter: '[data-not-sortable]',
    animation: 150,
    onMove: (evt) => {
      if (evt.newIndex === 0) {
        return false
      }
      return true
    },
    onEnd: (evt) => {
      const from = evt.oldIndex
      const to = evt.newIndex
      if (typeof from !== 'number' || typeof to !== 'number' || from === to) {
        return
      }
      emit('reorder', { from, to })
    },
  })
})

onBeforeUnmount(() => {
  sortable?.destroy()
  sortable = null
})

function onSelect(index: number) {
  activeIndex.value = index
}

function onRemove(index: number) {
  emit('remove', index)
}
</script>

<template>
  <div class="scene-list">
    <SceneTimelineControls
      v-model:active-index="activeIndex"
      :total="scenes.length"
      :playing="playing"
      @play="$emit('play')"
      @pause="$emit('pause')"
    />
    <ul
      ref="listEl"
      class="scene-list__items"
    >
      <SceneListItem
        v-for="scene in scenes"
        :key="scene.index"
        :index="scene.index"
        :name="scene.name"
        :thumbnail="scene.thumbnail ?? null"
        :hint="scene.hint ?? null"
        :active="scene.index === activeIndex"
        :removable="scene.removable ?? true"
        @select="onSelect(scene.index)"
        @remove="onRemove(scene.index)"
      />
    </ul>
    <button
      type="button"
      class="scene-list__add"
      @click="$emit('add')"
    >
      + Add scene
    </button>
  </div>
</template>

<style scoped lang="scss">
.scene-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem 0;

  &__items {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__add {
    width: 100%;
    min-height: 44px;
    border: 1px dashed var(--bc-hairline-strong);
    border-radius: var(--bc-radius-md);
    background: transparent;
    color: var(--bs-secondary-color);
    font-size: var(--bs-font-size-sm);
    font-weight: 500;
    cursor: pointer;
    transition:
      background-color var(--bc-duration-base) var(--bc-ease),
      color var(--bc-duration-base) var(--bc-ease);

    &:hover {
      background: var(--bc-wash-soft);
      color: var(--bs-body-color);
    }
  }
}
</style>
