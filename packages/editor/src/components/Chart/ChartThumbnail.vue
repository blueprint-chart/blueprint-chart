<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { renderChart } from '@blueprint-chart/lib'
import { useTheme } from '@/composables/useTheme'
import { parseChartState } from '@/utils/chart/chartState'
import { buildChartRender, snapshotFromState } from '@/utils/chart/chartRender'
import ChartCard from './ChartCard.vue'
import { fitCard, thumbnailWidth } from './chartThumbnailFit'

const PADDING = 12

const props = defineProps<{ dsl?: string | null }>()

const { resolvedTheme } = useTheme()

const root = useTemplateRef<HTMLElement>('root')
const card = useTemplateRef<InstanceType<typeof ChartCard>>('card')
const container = useTemplateRef<HTMLElement>('container')
const cardEl = computed(() => card.value?.el)

const state = computed(() => {
  if (!props.dsl) {
    return null
  }
  try {
    return parseChartState(props.dsl)
  }
  catch {
    return null
  }
})

const chartRender = computed(() => state.value && buildChartRender(snapshotFromState(state.value)))
const forceLight = computed(() => chartRender.value?.kind === 'chart' && !chartRender.value.allowDarkMode)

const visible = shallowRef(false)
const { stop } = useIntersectionObserver(root, ([entry]) => {
  if (entry?.isIntersecting) {
    visible.value = true
    stop()
  }
})

const fit = shallowRef({ scale: 0, x: 0, y: 0 })

function measure() {
  if (!root.value || !cardEl.value) {
    return
  }
  fit.value = fitCard(
    { width: root.value.clientWidth, height: root.value.clientHeight },
    { width: cardEl.value.offsetWidth, height: cardEl.value.offsetHeight },
    PADDING,
  )
}

useResizeObserver([root, cardEl], measure)

const stageStyle = computed<CSSProperties>(() => ({
  width: `${thumbnailWidth(state.value!.layout)}px`,
  transform: `translate(${fit.value.x}px, ${fit.value.y}px) scale(${fit.value.scale})`,
}))

function draw() {
  const r = chartRender.value
  if (!visible.value || !container.value || r?.kind !== 'chart') {
    return
  }
  renderChart(container.value, r.definition, { transition: false, ignoreLayout: true })
}

watch([chartRender, resolvedTheme, container, visible], draw, { flush: 'post' })
</script>

<template>
  <div
    ref="root"
    class="chart-thumbnail"
    inert
  >
    <div
      v-if="state"
      class="chart-thumbnail__stage"
      :style="stageStyle"
    >
      <ChartCard
        ref="card"
        class="chart-thumbnail__stage__card"
        :layout="state.layout"
        :data-bs-theme="forceLight ? 'light' : undefined"
      >
        <div
          v-if="chartRender?.kind === 'chart'"
          ref="container"
          class="w-100 h-100"
        />
      </ChartCard>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chart-thumbnail {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--bc-canvas-bg);
  pointer-events: none;

  &__stage {
    position: absolute;
    top: 0;
    left: 0;
    transform-origin: 0 0;
  }
}
</style>
