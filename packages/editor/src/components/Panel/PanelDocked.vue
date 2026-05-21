<template>
  <div
    class="panel-docked"
    :class="panelClassList"
    :style="{ width: !collapsed ? `${effectiveWidth}px` : undefined }"
  >
    <div
      class="panel-docked__resize-handle"
      @pointerdown="onResizeStart"
    />
    <LayoutPanel :title="title">
      <template #actions>
        <ButtonClose
          v-if="showClose"
          @click="$emit('close')"
        />
      </template>
      <template
        v-if="$slots.toolbar"
        #toolbar
      >
        <slot name="toolbar" />
      </template>
      <slot />
      <template
        v-if="$slots.footer"
        #footer
      >
        <slot name="footer" />
      </template>
    </LayoutPanel>
  </div>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { LayoutPanel, ButtonClose } from '@blueprint-chart/ui'
import { MIN_CANVAS_WIDTH, PANEL_MIN_WIDTH, PANEL_MAX_WIDTH, DEFAULT_DOCKED_WIDTH_FRACTION } from '@/stores/panel'

// `modelValue` and `initialWidth` are viewport-relative fractions (0..1).
// The fraction is what stays in storage; pixels are derived at render time
// so the panel reflows proportionally when the window resizes.
const props = withDefaults(defineProps<{
  collapsed: boolean
  title: string
  initialWidth?: number
  showClose?: boolean
  canvasWidth?: number
}>(), {
  initialWidth: DEFAULT_DOCKED_WIDTH_FRACTION,
  showClose: true,
  canvasWidth: undefined,
})

defineEmits<{
  close: []
}>()

const model = defineModel<number>()

const panelFraction = shallowRef(model.value ?? props.initialWidth)

watch(model, (v) => {
  if (v !== undefined) {
    panelFraction.value = v
  }
})
const resizing = shallowRef(false)

const { width: viewportWidth } = useWindowSize()

const panelClassList = computed(() => ({
  'panel-docked--collapsed': props.collapsed,
  'panel-docked--resizing': resizing.value,
}))

const effectiveMax = computed(() => {
  if (props.canvasWidth === undefined || props.canvasWidth <= 0) {
    return PANEL_MAX_WIDTH
  }
  return Math.min(PANEL_MAX_WIDTH, props.canvasWidth - MIN_CANVAS_WIDTH)
})

// Stored preference (panelFraction) is clamped only at display time — the
// model value is never mutated by canvas changes, so a narrower window
// doesn't erase the user's preferred fraction. It returns intact when the
// window grows back.
const effectiveWidth = computed(() => {
  const requested = panelFraction.value * viewportWidth.value
  return Math.max(PANEL_MIN_WIDTH, Math.min(requested, effectiveMax.value))
})

function onResizeStart(e: PointerEvent) {
  const startX = e.clientX
  const startWidthPx = panelFraction.value * viewportWidth.value
  const target = e.currentTarget as HTMLElement
  target.setPointerCapture(e.pointerId)
  resizing.value = true

  function onMove(ev: PointerEvent) {
    const delta = startX - ev.clientX
    const requestedPx = startWidthPx + delta
    const clampedPx = Math.min(effectiveMax.value, Math.max(PANEL_MIN_WIDTH, requestedPx))
    const vw = viewportWidth.value || window.innerWidth
    panelFraction.value = vw > 0 ? clampedPx / vw : panelFraction.value
    model.value = panelFraction.value
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
  display: flex;
  flex-direction: column;
  background: var(--bc-content-bg);
  border-left: 1px solid var(--bc-hairline);

  &.panel-docked--collapsed {
    width: 0 !important;
    max-width: 0;
    opacity: 0;
    pointer-events: none;
    margin-left: calc(-1 * 8px);
  }

  &__resize-handle {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 6px;
    cursor: col-resize;
    z-index: 10;

    &:hover,
    &:active {
      background: var(--bs-primary);
      opacity: 0.3;
    }
  }
}
</style>
