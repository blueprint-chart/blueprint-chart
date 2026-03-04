<template>
  <div class="scene-timeline-controls">
    <button
      class="scene-timeline-controls__nav-btn"
      type="button"
      aria-label="Previous scene"
      :disabled="disabled"
      @click="$emit('update:activeIndex', prevIndex)"
    >
      <AppIcon
        :name="PhCaretLeft"
        size="1em"
      />
    </button>
    <button
      class="scene-timeline-controls__play-btn"
      type="button"
      :aria-label="playing ? 'Pause' : 'Play'"
      :disabled="disabled"
      @click="playing ? $emit('pause') : $emit('play')"
    >
      <AppIcon
        :name="playing ? PhPauseFill : PhPlayFill"
        size="1em"
      />
    </button>
    <button
      class="scene-timeline-controls__nav-btn"
      type="button"
      aria-label="Next scene"
      :disabled="disabled"
      @click="$emit('update:activeIndex', nextIndex)"
    >
      <AppIcon
        :name="PhCaretRight"
        size="1em"
      />
    </button>
    <span
      v-if="!disabled"
      class="scene-timeline-controls__counter"
    >
      {{ displayIndex }} / {{ total }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PhPlayFill from '~icons/ph/play-fill'
import PhPauseFill from '~icons/ph/pause-fill'
import PhCaretLeft from '~icons/ph/caret-left'
import PhCaretRight from '~icons/ph/caret-right'
import AppIcon from '../../App/AppIcon/AppIcon.vue'

const props = withDefaults(defineProps<{
  total: number
  activeIndex?: number
  playing?: boolean
}>(), {
  activeIndex: -1,
  playing: false,
})

defineEmits<{
  'update:activeIndex': [index: number]
  'play': []
  'pause': []
}>()

const disabled = computed(() => props.total === 0)

const displayIndex = computed(() => {
  if (props.activeIndex < 0) {
    return 1
  }
  return props.activeIndex + 1
})

const prevIndex = computed(() => {
  if (props.total === 0) {
    return 0
  }
  return props.activeIndex <= 0 ? props.total - 1 : props.activeIndex - 1
})

const nextIndex = computed(() => {
  if (props.total === 0) {
    return 0
  }
  return props.activeIndex >= props.total - 1 ? 0 : props.activeIndex + 1
})
</script>

<style scoped lang="scss">
.scene-timeline-controls {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
}

.scene-timeline-controls__nav-btn,
.scene-timeline-controls__play-btn {
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

.scene-timeline-controls__counter {
  font-size: 0.75rem;
  color: var(--bs-secondary-color);
  white-space: nowrap;
  margin-left: 0.25rem;
}
</style>
