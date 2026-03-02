<template>
  <div
    class="panel-docked"
    :class="panelClassList"
    :style="{ width: !collapsed ? `${panelWidth}px` : undefined }"
  >
    <div
      class="panel-docked__resize-handle"
      @pointerdown="onResizeStart"
    />
    <LayoutPanel :title="title">
      <template #actions>
        <ButtonDetach @click="$emit('float')" />
        <ButtonClose @click="$emit('close')" />
      </template>
      <slot />
    </LayoutPanel>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { LayoutPanel, ButtonDetach, ButtonClose } from '@blueprint-chart/ui'

const props = withDefaults(defineProps<{
  collapsed: boolean
  title: string
  initialWidth?: number
}>(), {
  initialWidth: 330,
})

defineEmits<{
  float: []
  close: []
}>()

const MIN_WIDTH = 260
const MAX_WIDTH = 500
const panelWidth = ref(props.initialWidth)
const resizing = ref(false)

const panelClassList = computed(() => ({
  'panel-docked--collapsed': props.collapsed,
  'panel-docked--resizing': resizing.value,
}))

function onResizeStart(e: PointerEvent) {
  const startX = e.clientX
  const startWidth = panelWidth.value
  const target = e.currentTarget as HTMLElement
  target.setPointerCapture(e.pointerId)
  resizing.value = true

  function onMove(ev: PointerEvent) {
    const delta = startX - ev.clientX
    panelWidth.value = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + delta))
  }

  function onUp() {
    resizing.value = false
    target.removeEventListener('pointermove', onMove)
    target.removeEventListener('pointerup', onUp)
  }

  target.addEventListener('pointermove', onMove)
  target.addEventListener('pointerup', onUp)
}
</script>

<style scoped lang="scss">
.panel-docked {
  position: relative;
  min-width: 0;
  flex-shrink: 0;
  overflow: hidden;
  box-shadow: var(--bs-box-shadow);
  transition: width 0.3s ease, max-width 0.3s ease, opacity 0.2s ease;

  &.panel-docked--resizing {
    transition: none;
  }

  &.panel-docked--collapsed {
    width: 0 !important;
    max-width: 0;
    opacity: 0;
    pointer-events: none;
  }
}

.panel-docked__resize-handle {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 4px;
  cursor: col-resize;
  z-index: 10;

  &:hover,
  &:active {
    background: var(--bs-primary);
    opacity: 0.3;
  }
}
</style>
