<script setup lang="ts">
import { defineComponent, h, ref, onMounted, watch, type PropType } from 'vue'
import { getChart, buildChartOptions, ChartType, DEFAULT_BAR_GAP } from '@blueprint-chart/lib'
import type { ChartData } from '@blueprint-chart/lib'

const monoData: ChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  values: [20, 45, 35, 50, 30, 60],
}

const ChartPreview = defineComponent({
  name: 'ChartPreview',
  props: {
    chartType: { type: String, required: true },
    data: { type: Object as PropType<ChartData>, required: true },
    barGap: { type: Number, default: DEFAULT_BAR_GAP },
    height: { type: Number, default: 320 },
  },
  setup(props) {
    const containerRef = ref<HTMLElement | null>(null)

    const renderChart = () => {
      const el = containerRef.value
      if (!el) {
        return
      }
      const renderer = getChart(props.chartType)
      if (!renderer) {
        return
      }
      const typeOpts = buildChartOptions({
        barGap: String(props.barGap),
      })
      el.replaceChildren()
      renderer(el, props.data, typeOpts)
    }

    onMounted(renderChart)
    watch(
      () => [props.chartType, props.data, props.barGap],
      renderChart,
      { deep: true },
    )

    return () => h('div', {
      ref: (el) => {
        containerRef.value = el as HTMLElement | null
      },
      class: 'bar-gap-story__canvas',
      style: `height: ${props.height}px;`,
    })
  },
})
</script>

<template>
  <Story title="Chart/BarGap">
    <Variant title="Vertical — 0%">
      <ChartPreview
        :chart-type="ChartType.BarVertical"
        :data="monoData"
        :bar-gap="0"
      />
    </Variant>

    <Variant title="Vertical — 60% (default)">
      <ChartPreview
        :chart-type="ChartType.BarVertical"
        :data="monoData"
        :bar-gap="60"
      />
    </Variant>

    <Variant title="Vertical — 50%">
      <ChartPreview
        :chart-type="ChartType.BarVertical"
        :data="monoData"
        :bar-gap="50"
      />
    </Variant>

    <Variant title="Vertical — 100%">
      <ChartPreview
        :chart-type="ChartType.BarVertical"
        :data="monoData"
        :bar-gap="100"
      />
    </Variant>

    <Variant
      title="Vertical — Interactive"
      :init-state="() => ({ barGap: 60 })"
    >
      <template #default="{ state }">
        <ChartPreview
          :chart-type="ChartType.BarVertical"
          :data="monoData"
          :bar-gap="state.barGap"
        />
      </template>
      <template #controls="{ state }">
        <HstSlider
          v-model="state.barGap"
          title="Bar gap %"
          :min="0"
          :max="100"
        />
      </template>
    </Variant>

    <Variant title="Horizontal — 0%">
      <ChartPreview
        :chart-type="ChartType.BarHorizontal"
        :data="monoData"
        :bar-gap="0"
        :height="360"
      />
    </Variant>

    <Variant title="Horizontal — 60% (default)">
      <ChartPreview
        :chart-type="ChartType.BarHorizontal"
        :data="monoData"
        :bar-gap="60"
        :height="360"
      />
    </Variant>

    <Variant title="Horizontal — 50%">
      <ChartPreview
        :chart-type="ChartType.BarHorizontal"
        :data="monoData"
        :bar-gap="50"
        :height="360"
      />
    </Variant>

    <Variant title="Horizontal — 100%">
      <ChartPreview
        :chart-type="ChartType.BarHorizontal"
        :data="monoData"
        :bar-gap="100"
        :height="360"
      />
    </Variant>

    <Variant
      title="Horizontal — Interactive"
      :init-state="() => ({ barGap: 60 })"
    >
      <template #default="{ state }">
        <ChartPreview
          :chart-type="ChartType.BarHorizontal"
          :data="monoData"
          :bar-gap="state.barGap"
          :height="360"
        />
      </template>
      <template #controls="{ state }">
        <HstSlider
          v-model="state.barGap"
          title="Bar gap %"
          :min="0"
          :max="100"
        />
      </template>
    </Variant>
  </Story>
</template>

<style lang="scss">
.bar-gap-story__canvas {
  width: 100%;
  padding: 1rem;
  background: #fff;
}
</style>
