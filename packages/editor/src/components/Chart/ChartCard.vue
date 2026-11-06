<template>
  <div
    ref="el"
    class="chart-card"
    :class="cardClass"
    :style="cardStyle"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { ChartLayout } from '@/composables/useChartConfig'
import { useCanvasCardStyle } from '@/composables/useCanvasCardStyle'

const props = defineProps<{ layout: ChartLayout }>()

const el = useTemplateRef<HTMLElement>('el')
const { cardClass, cardStyle } = useCanvasCardStyle(toRef(props, 'layout'), 'chart-card')

defineExpose({ el })
</script>

<style lang="scss" scoped>
.chart-card {
  position: relative;
  z-index: 1;
  // Keep the card at its natural height so the CANVAS scrolls (with the
  // floating timeline pinned), rather than the card scrolling internally.
  // --fixed / --constrained-height override with `flex: none` as needed.
  flex-shrink: 0;
  background: var(--bs-body-bg);
  border: 1px solid var(--bc-frame-border);
  border-radius: var(--bc-frame-radius);
  overflow: auto;

  &--fixed {
    flex: none;
    margin: 0 auto;
  }

  &--max-width {
    margin: 0 auto;
    width: 100%;
  }

  &--transparent {
    background: transparent;
  }

  &--constrained-height {
    flex: none;
    display: flex;
    flex-direction: column;

    :deep(.w-100.h-100) {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }
  }
}
</style>
