<script setup lang="ts">
import SceneTimelineControls from '../SceneTimeline/SceneTimelineControls.vue'
import ButtonIcon from '../../Button/ButtonIcon/ButtonIcon.vue'
import IPhCaretUp from '~icons/ph/caret-up'

interface SceneEntry {
  name: string | null
  index: number
}

const activeIndex = defineModel<number>('activeIndex', { default: -1 })

const props = withDefaults(defineProps<{
  scenes: SceneEntry[]
  playing?: boolean
  expanded?: boolean
}>(), {
  playing: false,
  expanded: false,
})

defineEmits<{
  play: []
  pause: []
  expand: []
}>()

const activeScene = computed(() => {
  if (activeIndex.value < 0) {
    return null
  }
  return props.scenes.find(s => s.index === activeIndex.value) ?? null
})

const activeSceneName = computed(() => activeScene.value?.name ?? ' ')
const total = computed(() => props.scenes.length)
const displayIndex = computed(() => {
  if (activeIndex.value < 0 || total.value === 0) {
    return 1
  }
  return Math.max(1, Math.min(total.value, activeIndex.value + 1))
})
</script>

<template>
  <div class="scene-timeline-compact">
    <SceneTimelineControls
      v-model:active-index="activeIndex"
      :total="total"
      :playing="playing"
      @play="$emit('play')"
      @pause="$emit('pause')"
    />
    <div
      class="scene-timeline-compact__name"
      :title="activeSceneName"
    >
      {{ activeSceneName }}
    </div>
    <div class="scene-timeline-compact__counter">
      {{ displayIndex }} of {{ total }}
    </div>
    <ButtonIcon
      class="scene-timeline-compact__expand"
      :icon-left="IPhCaretUp"
      label="Show scenes"
      hide-label
      square
      variant="link"
      size="sm"
      :aria-expanded="expanded"
      @click="$emit('expand')"
    />
  </div>
</template>

<style scoped lang="scss">
.scene-timeline-compact {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;

  // SceneTimelineControls renders its own "N / M" counter; we render our own
  // "N of M" after the active scene name, so suppress the inner one.
  :deep(.scene-timeline-controls__counter) {
    display: none;
  }

  &__name {
    flex: 0 1 auto;
    min-width: 0;
    font-size: var(--bs-font-size-sm);
    font-weight: 600;
    color: var(--bs-body-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__counter {
    flex-shrink: 0;
    font-size: var(--bs-font-size-xs);
    color: var(--bs-secondary-color);
  }

  &__expand {
    flex-shrink: 0;
    margin-left: auto;
  }
}
</style>
