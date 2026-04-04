<template>
  <svg
    v-if="cardRect"
    class="canvas-dimensions"
    :style="svgStyle"
  >
    <g transform="translate(0.5, 0.5)">
      <!-- Width dimension (bottom) -->
      <g class="canvas-dimensions__line">
        <!-- Main line -->
        <line
          :x1="widthMain.x1"
          :y1="width.y"
          :x2="widthMain.x2"
          :y2="width.y"
        />
        <!-- Left tick -->
        <line
          :x1="widthMain.x1"
          :y1="width.y - SERIF"
          :x2="widthMain.x1"
          :y2="width.y + SERIF"
        />
        <!-- Right tick -->
        <line
          :x1="widthMain.x2"
          :y1="width.y - SERIF"
          :x2="widthMain.x2"
          :y2="width.y + SERIF"
        />
        <!-- Label -->
        <text
          :x="(width.x1 + width.x2) / 2"
          :y="width.y + SERIF + 12"
          text-anchor="middle"
        >
          {{ widthLabel }}
        </text>
      </g>

      <!-- Height dimension (left) -->
      <g class="canvas-dimensions__line">
        <!-- Main line -->
        <line
          :x1="height.x"
          :y1="heightMain.y1"
          :x2="height.x"
          :y2="heightMain.y2"
        />
        <!-- Top tick -->
        <line
          :x1="height.x - SERIF"
          :y1="heightMain.y1"
          :x2="height.x + SERIF"
          :y2="heightMain.y1"
        />
        <!-- Bottom tick -->
        <line
          :x1="height.x - SERIF"
          :y1="heightMain.y2"
          :x2="height.x + SERIF"
          :y2="heightMain.y2"
        />
        <!-- Label -->
        <text
          :x="height.x - 5"
          :y="(height.y1 + height.y2) / 2"
          text-anchor="end"
          dominant-baseline="central"
        >
          {{ heightLabel }}
        </text>
      </g>

      <!-- Padding segments on bottom dimension line -->
      <template v-if="hasPadding">
        <g class="canvas-dimensions__line canvas-dimensions__line--padding">
          <!-- Left padding segment -->
          <line
            :x1="width.x1"
            :y1="hasDefinedWidth ? bottomPadY : width.y"
            :x2="width.x1 + layout.padding"
            :y2="hasDefinedWidth ? bottomPadY : width.y"
          />
          <!-- Left padding outer tick -->
          <line
            :x1="width.x1"
            :y1="(hasDefinedWidth ? bottomPadY : width.y) - SERIF"
            :x2="width.x1"
            :y2="(hasDefinedWidth ? bottomPadY : width.y) + SERIF"
          />
          <!-- Left padding inner tick -->
          <line
            :x1="width.x1 + layout.padding"
            :y1="(hasDefinedWidth ? bottomPadY : width.y) - SERIF"
            :x2="width.x1 + layout.padding"
            :y2="(hasDefinedWidth ? bottomPadY : width.y) + SERIF"
          />
          <!-- Left padding label -->
          <text
            :x="width.x1 + layout.padding / 2"
            :y="(hasDefinedWidth ? bottomPadY : width.y) + SERIF + 12"
            text-anchor="middle"
          >
            {{ paddingLabel }}
          </text>

          <!-- Right padding segment -->
          <line
            :x1="width.x2 - layout.padding"
            :y1="hasDefinedWidth ? bottomPadY : width.y"
            :x2="width.x2"
            :y2="hasDefinedWidth ? bottomPadY : width.y"
          />
          <!-- Right padding inner tick -->
          <line
            :x1="width.x2 - layout.padding"
            :y1="(hasDefinedWidth ? bottomPadY : width.y) - SERIF"
            :x2="width.x2 - layout.padding"
            :y2="(hasDefinedWidth ? bottomPadY : width.y) + SERIF"
          />
          <!-- Right padding outer tick -->
          <line
            :x1="width.x2"
            :y1="(hasDefinedWidth ? bottomPadY : width.y) - SERIF"
            :x2="width.x2"
            :y2="(hasDefinedWidth ? bottomPadY : width.y) + SERIF"
          />
          <!-- Right padding label -->
          <text
            :x="width.x2 - layout.padding / 2"
            :y="(hasDefinedWidth ? bottomPadY : width.y) + SERIF + 12"
            text-anchor="middle"
          >
            {{ paddingLabel }}
          </text>
        </g>

        <!-- Padding segments on left dimension line -->
        <g class="canvas-dimensions__line canvas-dimensions__line--padding">
          <!-- Top padding segment -->
          <line
            :x1="hasDefinedHeight ? leftPadX : height.x"
            :y1="height.y1"
            :x2="hasDefinedHeight ? leftPadX : height.x"
            :y2="height.y1 + layout.padding"
          />
          <!-- Top padding outer tick -->
          <line
            :x1="(hasDefinedHeight ? leftPadX : height.x) - SERIF"
            :y1="height.y1"
            :x2="(hasDefinedHeight ? leftPadX : height.x) + SERIF"
            :y2="height.y1"
          />
          <!-- Top padding inner tick -->
          <line
            :x1="(hasDefinedHeight ? leftPadX : height.x) - SERIF"
            :y1="height.y1 + layout.padding"
            :x2="(hasDefinedHeight ? leftPadX : height.x) + SERIF"
            :y2="height.y1 + layout.padding"
          />
          <!-- Top padding label -->
          <text
            :x="(hasDefinedHeight ? leftPadX : height.x) - SERIF - 4"
            :y="height.y1 + layout.padding / 2"
            text-anchor="end"
            dominant-baseline="central"
          >
            {{ paddingLabel }}
          </text>

          <!-- Bottom padding segment -->
          <line
            :x1="hasDefinedHeight ? leftPadX : height.x"
            :y1="height.y2 - layout.padding"
            :x2="hasDefinedHeight ? leftPadX : height.x"
            :y2="height.y2"
          />
          <!-- Bottom padding inner tick -->
          <line
            :x1="(hasDefinedHeight ? leftPadX : height.x) - SERIF"
            :y1="height.y2 - layout.padding"
            :x2="(hasDefinedHeight ? leftPadX : height.x) + SERIF"
            :y2="height.y2 - layout.padding"
          />
          <!-- Bottom padding outer tick -->
          <line
            :x1="(hasDefinedHeight ? leftPadX : height.x) - SERIF"
            :y1="height.y2"
            :x2="(hasDefinedHeight ? leftPadX : height.x) + SERIF"
            :y2="height.y2"
          />
          <!-- Bottom padding label -->
          <text
            :x="(hasDefinedHeight ? leftPadX : height.x) - SERIF - 4"
            :y="height.y2 - layout.padding / 2"
            text-anchor="end"
            dominant-baseline="central"
          >
            {{ paddingLabel }}
          </text>
        </g>
      </template>
    </g>
  </svg>
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { ChartLayout } from '@/stores/chartConfig'

const OFFSET = 20
const SERIF = 3
const GAP = 4
const ROW_SPACING = 20

const props = defineProps<{
  cardRef: HTMLElement | null
  canvasRef: HTMLElement | null
  layout: ChartLayout
}>()

const cardRect = ref<{ left: number, top: number, width: number, height: number } | null>(null)

function update() {
  const el = props.cardRef
  if (!el) {
    cardRect.value = null
    return
  }
  cardRect.value = {
    left: el.offsetLeft,
    top: el.offsetTop,
    width: el.offsetWidth,
    height: el.offsetHeight,
  }
}

useResizeObserver(() => props.canvasRef, update)
useResizeObserver(() => props.cardRef, update)

const svgStyle = computed<CSSProperties>(() => ({
  position: 'absolute',
  inset: '0',
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  overflow: 'visible',
}))

const width = computed(() => {
  const r = cardRect.value!
  return {
    x1: r.left,
    x2: r.left + r.width,
    y: r.top + r.height + OFFSET,
  }
})

const height = computed(() => {
  const r = cardRect.value!
  return {
    x: r.left - OFFSET,
    y1: r.top,
    y2: r.top + r.height,
  }
})

const widthMain = computed(() => {
  const w = width.value
  const p = props.layout.padding
  return p > 0 && !hasDefinedWidth.value
    ? { x1: w.x1 + p + GAP, x2: w.x2 - p - GAP }
    : { x1: w.x1, x2: w.x2 }
})

const heightMain = computed(() => {
  const h = height.value
  const p = props.layout.padding
  return p > 0 && !hasDefinedHeight.value
    ? { y1: h.y1 + p + GAP, y2: h.y2 - p - GAP }
    : { y1: h.y1, y2: h.y2 }
})

const hasDefinedWidth = computed(() => props.layout.sizing !== 'responsive')
const hasDefinedHeight = computed(() => props.layout.heightMode !== 'auto')
const hasPadding = computed(() => props.layout.padding > 0)
const paddingLabel = computed(() => `${props.layout.padding}px`)
const bottomPadY = computed(() => width.value.y + ROW_SPACING)
const leftPadX = computed(() => height.value.x - ROW_SPACING)

const widthLabel = computed(() => {
  const l = props.layout
  if (l.sizing === 'fixed') {
    return `${l.fixedWidth}px`
  }
  if (l.sizing === 'max-width') {
    return `max ${l.maxWidth}px`
  }
  return 'auto'
})

const heightLabel = computed(() => {
  const l = props.layout
  if (l.heightMode === 'fixed') {
    return `${l.fixedHeight}px`
  }
  if (l.heightMode === 'aspect-ratio') {
    return l.aspectRatio
  }
  return 'auto'
})
</script>

<style scoped lang="scss">
.canvas-dimensions {
  z-index: 2;

  &__line {
    line {
      stroke: var(--bc-canvas-dimension-color);
      stroke-width: 1;
      shape-rendering: crispEdges;
    }

    text {
      fill: var(--bc-canvas-dimension-color);
      font-size: var(--bs-font-size-xs);
      font-family: inherit;
    }
  }
}
</style>
