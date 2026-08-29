<template>
  <Transition name="drawer">
    <div
      v-if="open"
      ref="drawerRef"
      class="layout-bottom-drawer"
      :class="drawerClassList"
      :style="drawerStyle"
      role="dialog"
      aria-modal="true"
      :aria-label="title ?? 'Panel'"
      tabindex="-1"
      @keydown="onKeydown"
    >
      <div
        class="layout-bottom-drawer__handle"
        @pointerdown="onPointerDown"
      >
        <div class="layout-bottom-drawer__handle__bar" />
      </div>
      <div class="layout-bottom-drawer__header">
        <h2
          v-if="title"
          class="layout-bottom-drawer__header__title"
        >
          {{ title }}
        </h2>
        <button
          ref="closeRef"
          type="button"
          class="layout-bottom-drawer__header__close"
          aria-label="Close panel"
          @click="open = false"
        >
          &times;
        </button>
      </div>
      <div class="layout-bottom-drawer__body">
        <slot />
      </div>
    </div>
  </Transition>
  <div
    v-if="open"
    class="layout-bottom-drawer__backdrop"
    aria-hidden="true"
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

const drawerRef = useTemplateRef<HTMLElement>('drawerRef')
const closeRef = useTemplateRef<HTMLElement>('closeRef')
let previouslyFocused: HTMLElement | null = null

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function focusable(): HTMLElement[] {
  return [...(drawerRef.value?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])]
    .filter(el => el.offsetParent !== null || el === closeRef.value)
}

/**
 * The drawer covers the page with an opaque backdrop, so without this the Tab
 * order still walked the page behind it and Escape did nothing: a keyboard user
 * could neither dismiss the drawer nor reach anything else.
 */
function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    open.value = false
    return
  }
  if (event.key !== 'Tab') {
    return
  }
  const items = focusable()
  if (items.length === 0) {
    event.preventDefault()
    return
  }
  const first = items[0]
  const last = items[items.length - 1]
  const active = document.activeElement as HTMLElement | null
  if (event.shiftKey && (active === first || active === drawerRef.value)) {
    event.preventDefault()
    last.focus()
  }
  else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(open, async (isOpen) => {
  if (isOpen) {
    previouslyFocused = document.activeElement as HTMLElement | null
    await nextTick()
    ;(closeRef.value ?? drawerRef.value)?.focus()
    return
  }
  previouslyFocused?.focus()
  previouslyFocused = null
}, { immediate: true })

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
    z-index: 1049;
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

    &__close {
      margin-left: auto;
      border: 0;
      background: transparent;
      color: var(--bs-body-color);
      font-size: 1.5rem;
      line-height: 1;
      padding: 0 0.25rem;
      cursor: pointer;
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
