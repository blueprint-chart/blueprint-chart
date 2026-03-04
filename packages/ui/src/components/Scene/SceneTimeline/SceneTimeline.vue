<template>
  <div class="scene-timeline">
    <div class="scene-timeline__controls">
      <button
        class="scene-timeline__nav-btn"
        type="button"
        aria-label="Previous scene"
        :disabled="scenes.length === 0"
        @click="$emit('update:activeIndex', prevIndex)"
      >
        <AppIcon
          :name="PhCaretLeft"
          size="1em"
        />
      </button>
      <button
        class="scene-timeline__play-btn"
        type="button"
        :aria-label="playing ? 'Pause' : 'Play'"
        :disabled="scenes.length === 0"
        @click="playing ? $emit('pause') : $emit('play')"
      >
        <AppIcon
          :name="playing ? PhPause : PhPlay"
          size="1em"
        />
      </button>
      <button
        class="scene-timeline__nav-btn"
        type="button"
        aria-label="Next scene"
        :disabled="scenes.length === 0"
        @click="$emit('update:activeIndex', nextIndex)"
      >
        <AppIcon
          :name="PhCaretRight"
          size="1em"
        />
      </button>
      <span
        v-if="scenes.length > 0"
        class="scene-timeline__counter"
      >
        {{ displayIndex }} / {{ scenes.length }}
      </span>
    </div>

    <div class="scene-timeline__items">
      <SceneTimelineItem
        v-for="scene in scenes"
        :key="scene.index"
        :name="scene.name"
        :index="scene.index"
        :active="scene.index === activeIndex"
        :thumbnail="scene.thumbnail ?? null"
        :removable="scene.removable ?? true"
        @select="$emit('update:activeIndex', scene.index)"
        @remove="$emit('remove', scene.index)"
      />
    </div>

    <ButtonAdd
      size="sm"
      label="Add"
      @click="$emit('add')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PhPlay from '~icons/ph/play'
import PhPause from '~icons/ph/pause'
import PhCaretLeft from '~icons/ph/caret-left'
import PhCaretRight from '~icons/ph/caret-right'
import AppIcon from '../../App/AppIcon/AppIcon.vue'
import ButtonAdd from '../../Button/ButtonAdd/ButtonAdd.vue'
import SceneTimelineItem from '../SceneTimelineItem/SceneTimelineItem.vue'

const props = withDefaults(defineProps<{
  scenes: { name: string | null, index: number, thumbnail?: string | null, removable?: boolean }[]
  activeIndex?: number
  playing?: boolean
}>(), {
  activeIndex: -1,
  playing: false,
})

defineEmits<{
  'update:activeIndex': [index: number]
  'add': []
  'remove': [index: number]
  'play': []
  'pause': []
}>()

const displayIndex = computed(() => {
  if (props.activeIndex < 0) {
    return 1
  }
  return props.activeIndex + 1
})

const prevIndex = computed(() => {
  if (props.scenes.length === 0) {
    return 0
  }
  return props.activeIndex <= 0 ? props.scenes.length - 1 : props.activeIndex - 1
})

const nextIndex = computed(() => {
  if (props.scenes.length === 0) {
    return 0
  }
  return props.activeIndex >= props.scenes.length - 1 ? 0 : props.activeIndex + 1
})
</script>

<style scoped lang="scss">
.scene-timeline {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-top: 1px solid var(--bs-border-color);
  padding: 0.5rem 1rem;
  min-height: 96px;
}

.scene-timeline__controls {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
}

.scene-timeline__nav-btn,
.scene-timeline__play-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid var(--bs-border-color);
  border-radius: var(--bs-border-radius);
  background: transparent;
  cursor: pointer;
  font-size: 0.875rem;
  flex-shrink: 0;
  color: var(--bs-body-color);

  &:hover:not(:disabled) {
    background: var(--bs-tertiary-bg);
  }

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
}

.scene-timeline__counter {
  font-size: 0.75rem;
  color: var(--bs-secondary-color);
  white-space: nowrap;
  margin-left: 0.25rem;
}

.scene-timeline__items {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  overflow-x: auto;
  flex: 1;
  min-width: 0;
  padding: 0.25rem 0;

  &::-webkit-scrollbar {
    display: none;
  }

  scrollbar-width: none;
}
</style>
