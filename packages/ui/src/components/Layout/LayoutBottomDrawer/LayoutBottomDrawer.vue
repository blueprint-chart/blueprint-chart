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
        <div class="layout-bottom-drawer__handle__bar" />
      </div>
      <div
        v-if="title"
        class="layout-bottom-drawer__header"
      >
        <h2 class="layout-bottom-drawer__header__title">
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
import type { CSSProperties } from 'vue'

const DISMISS_THRESHOLD = 80

const open = defineModel<boolean>({ required: true })

defineProps<{
  title?: string
}>()

const dragOffset = shallowRef(0)
const isDragging = shallowRef(false)

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

const drawerStyle = computed<CSSProperties>(() =>
  dragOffset.value > 0 ? { transform: `translateY(${dragOffset.value}px)` } : {},
)
</script>

<style scoped lang="scss">
.layout-bottom-drawer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1050;
  height: var(--bc-drawer-height);
  display: flex;
  flex-direction: column;
  background: var(--bc-tile-bg);
  border-radius: var(--bc-radius-md) var(--bc-radius-md) 0 0;
  box-shadow: var(--bc-shadow-overlay);
  border: 1px solid var(--bc-hairline);
  overflow: hidden;
  transition: transform 0.25s ease;
  will-change: transform;

  &--dragging {
    transition: none;
  }

  &__backdrop {
    position: fixed;
    inset: 0;
    z-index: 1040;
    background: rgba(0, 0, 0, 0.3);
  }

  &__handle {
    display: flex;
    justify-content: center;
    padding: 0.5rem;
    cursor: grab;
    flex-shrink: 0;
    touch-action: none;

    &:active {
      cursor: grabbing;
    }

    &__bar {
      width: 2rem;
      height: 0.25rem;
      border-radius: var(--bs-border-radius-pill);
      background: var(--bs-secondary-color);
      opacity: 0.4;
    }
  }

  &__header {
    display: flex;
    align-items: center;
    padding: 0 1rem 0.5rem;
    flex-shrink: 0;

    &__title {
      font-size: var(--bs-font-size-md);
      font-weight: 600;
      margin: 0;
      color: var(--bs-body-color);
    }
  }

  &__body {
    flex: 1;
    overflow-y: auto;
    padding: 0 1rem 0;
  }
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
