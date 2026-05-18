<template>
  <div
    ref="panelRef"
    class="panel-floating"
    :style="positionStyle"
  >
    <div
      ref="headerRef"
      class="panel-floating__header"
    >
      <div class="panel-floating__header__title">
        <ButtonDrag />
        {{ title }}
      </div>
      <div class="panel-floating__header__actions">
        <ButtonDock @click="$emit('dock')" />
        <ButtonClose
          v-if="showClose"
          @click="$emit('close')"
        />
      </div>
    </div>
    <slot name="tabs" />
    <div
      v-if="$slots.toolbar"
      class="panel-floating__toolbar"
    >
      <slot name="toolbar" />
    </div>
    <div class="panel-floating__body">
      <slot />
    </div>
    <div
      v-if="$slots.footer"
      class="panel-floating__footer"
    >
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ButtonDock, ButtonDrag, ButtonClose } from '@blueprint-chart/ui'
import type { DragPosition } from '@/composables/usePanelDrag'

const props = withDefaults(defineProps<{
  containerRef: HTMLElement | null
  title: string
  position: DragPosition
  showClose?: boolean
}>(), {
  showClose: true,
})

defineEmits<{
  dock: []
  close: []
}>()

const headerRef = useTemplateRef<HTMLElement>('headerRef')
const panelRef = useTemplateRef<HTMLElement>('panelRef')
const containerRefLocal = computed(() => props.containerRef)

// Position is a shared reactive object from useEditorPanel module state.
// usePanelDrag mutates position.x/.y directly — this is intentional.
const position = toRef(props, 'position')

const MARGIN = 16

// Clamp x/y so the panel stays fully visible inside the container. Called on
// mount and whenever the container resizes — without this, the position (kept
// in module state across mode/window changes) can leave the panel off-screen
// after a window shrink or a docked→floating toggle.
function clampPosition() {
  const container = props.containerRef
  if (!container) {
    return
  }
  // `|| 340` (not `??`) because offsetWidth is 0 until the element has been
  // laid out and 0 is not a sensible panel width.
  const panelWidth = panelRef.value?.offsetWidth || 340
  const panelHeight = panelRef.value?.offsetHeight || 400
  const maxX = Math.max(MARGIN, container.clientWidth - panelWidth - MARGIN)
  const maxY = Math.max(MARGIN, container.clientHeight - panelHeight - MARGIN)
  position.value.x = Math.min(Math.max(MARGIN, position.value.x), maxX)
  position.value.y = Math.min(Math.max(MARGIN, position.value.y), maxY)
}

onMounted(() => {
  if (position.value.x < 0 && props.containerRef) {
    const panelWidth = panelRef.value?.offsetWidth || 340
    position.value.x = props.containerRef.clientWidth - panelWidth - MARGIN
    position.value.y = Math.max(MARGIN, position.value.y)
  }
  clampPosition()
})

useResizeObserver(containerRefLocal, clampPosition)

usePanelDrag(
  headerRef,
  containerRefLocal,
  position.value,
)

const positionStyle = computed(() => ({
  left: `${position.value.x}px`,
  top: `${position.value.y}px`,
}))
</script>

<style scoped lang="scss">
.panel-floating {
  position: absolute;
  width: 340px;
  min-width: 260px;
  max-width: calc(100% - 32px);
  background: var(--bc-tile-bg);
  border-radius: var(--bc-radius-md);
  box-shadow: var(--bc-shadow-overlay);
  border: 1px solid var(--bc-hairline);
  display: flex;
  flex-direction: column;
  max-height: calc(100% - 40px);
  overflow: hidden;
  z-index: 200;
  resize: both;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.625rem 0.875rem;
    cursor: grab;
    user-select: none;
    border-radius: var(--bc-radius-md) var(--bc-radius-md) 0 0;

    &:active {
      cursor: grabbing;
    }

    &__title {
      font-size: var(--bs-font-size-sm);
      font-weight: 600;
      color: var(--bs-body-color);
      display: flex;
      align-items: center;
      gap: 0.375rem;
    }

    &__actions {
      display: flex;
      gap: 0.25rem;
    }
  }

  &__toolbar {
    flex-shrink: 0;
    padding: 0.375rem 0.75rem;
    background: var(--bc-tile-bg-elevated, var(--bs-tertiary-bg));
    border-top: 1px solid var(--bs-border-color);
    border-bottom: 1px solid var(--bs-border-color);
  }

  &__body {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem 0.875rem 0.875rem;
  }

  &__footer {
    flex-shrink: 0;
    padding: 0.625rem 0.875rem;
  }
}
</style>
