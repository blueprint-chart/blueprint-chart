<template>
  <Transition name="drawer">
    <div
      v-if="open"
      class="layout-bottom-drawer"
      :class="drawerClassList"
      :style="drawerStyle"
    >
      <div
        class="layout-bottom-drawer__handle"
        @pointerdown="onPointerDown"
      >
        <div class="layout-bottom-drawer__bar" />
      </div>
      <div
        v-if="title"
        class="layout-bottom-drawer__header"
      >
        <h2 class="layout-bottom-drawer__title">
          {{ title }}
        </h2>
      </div>
      <div class="layout-bottom-drawer__body">
        <slot />
      </div>
    </div>
  </Transition>
  <div
    v-if="open"
    class="layout-bottom-drawer__backdrop"
    @click="open = false"
  />
</template>

<script setup lang="ts">
import { computed, ref, type CSSProperties } from 'vue'

const DISMISS_THRESHOLD = 80

const open = defineModel<boolean>({ required: true })

const props = withDefaults(defineProps<{
  title?: string
  maxHeight?: string
}>(), {
  title: undefined,
  maxHeight: '70vh',
})

const dragOffset = ref(0)
const isDragging = ref(false)

const drawerClassList = computed(() => ({
  'layout-bottom-drawer--dragging': isDragging.value,
}))
let startY = 0
let dragged = false

function onPointerDown(e: PointerEvent) {
  startY = e.clientY
  dragOffset.value = 0
  dragged = false
  document.addEventListener('pointermove', onPointerMove)
  document.addEventListener('pointerup', onPointerUp, { once: true })
  document.addEventListener('pointercancel', onPointerUp, { once: true })
}

function onPointerMove(e: PointerEvent) {
  const dy = e.clientY - startY
  if (!isDragging.value && Math.abs(dy) > 4) {
    isDragging.value = true
  }
  if (isDragging.value) {
    dragged = true
    dragOffset.value = Math.max(0, dy)
  }
}

function onPointerUp() {
  document.removeEventListener('pointermove', onPointerMove)
  document.removeEventListener('pointercancel', onPointerUp)
  if (isDragging.value && dragOffset.value >= DISMISS_THRESHOLD) {
    open.value = false
  }
  else if (!dragged) {
    open.value = false
  }
  dragOffset.value = 0
  isDragging.value = false
}

const drawerStyle = computed<CSSProperties>(() => ({
  maxHeight: props.maxHeight,
  ...(dragOffset.value > 0 ? { transform: `translateY(${dragOffset.value}px)` } : {}),
}))
</script>

<style scoped lang="scss">
.layout-bottom-drawer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1050;
  display: flex;
  flex-direction: column;
  background: var(--bc-tile-bg, var(--bs-body-bg));
  border-radius: var(--bc-tile-radius, 12px) var(--bc-tile-radius, 12px) 0 0;
  box-shadow: var(--bc-tile-shadow, 0 -0.25rem 1rem rgba(0, 0, 0, 0.15));
  border: var(--bc-tile-border, none);
  overflow: hidden;
  transition: transform 0.25s ease;
  will-change: transform;

  &--dragging {
    transition: none;
  }
}

.layout-bottom-drawer__backdrop {
  position: fixed;
  inset: 0;
  z-index: 1040;
  background: rgba(0, 0, 0, 0.3);
}

.layout-bottom-drawer__handle {
  display: flex;
  justify-content: center;
  padding: 0.5rem;
  cursor: grab;
  flex-shrink: 0;
  touch-action: none;

  &:active {
    cursor: grabbing;
  }
}

.layout-bottom-drawer__bar {
  width: 2rem;
  height: 0.25rem;
  border-radius: var(--bs-border-radius-pill);
  background: var(--bs-secondary-color);
  opacity: 0.4;
}

.layout-bottom-drawer__header {
  display: flex;
  align-items: center;
  padding: 0 1rem 0.5rem;
  flex-shrink: 0;
}

.layout-bottom-drawer__title {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0;
  color: var(--bs-body-color);
}

.layout-bottom-drawer__body {
  flex: 1;
  overflow-y: auto;
  padding: 0 1rem 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.25s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  transform: translateY(100%);
}
</style>
