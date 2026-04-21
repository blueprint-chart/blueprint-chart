<script setup lang="ts">
import { defineComponent, h, ref, onMounted, watch, type PropType } from 'vue'
import { getChart, buildChartOptions, ChartType } from '@blueprint-chart/lib'
import type { ChartData, ColorizeConfig } from '@blueprint-chart/lib'

const monoData: ChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  values: [20, 45, 35, 50, 30, 60],
}

const gapData: ChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  values: [20, 45, Number.NaN, 50, 30, 60],
}

const gradientColorizes: ColorizeConfig[] = [
  { target: 'Jan', color: '#4e79a7' },
  { target: 'Feb', color: '#6a8fc7' },
  { target: 'Mar', color: '#9dabd7' },
  { target: 'Apr', color: '#d9826a' },
  { target: 'May', color: '#e15759' },
  { target: 'Jun', color: '#b23b3c' },
]

function pctToDecimal(pct: number): string {
  const clamped = Math.max(0, Math.min(100, pct))
  return String(clamped / 100)
}

const ChartPreview = defineComponent({
  name: 'ChartPreview',
  props: {
    chartType: { type: String, required: true },
    data: { type: Object as PropType<ChartData>, required: true },
    connectedColumns: { type: Boolean, default: false },
    connectionsOpacity: { type: String, default: '0.15' },
    colorizes: { type: Array as PropType<ColorizeConfig[]>, default: () => [] },
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
        connectedColumns: props.connectedColumns,
        connectionsOpacity: props.connectionsOpacity,
      })
      el.replaceChildren()
      renderer(el, props.data, {
        ...typeOpts,
        colorizes: props.colorizes.length > 0 ? props.colorizes : undefined,
      })
    }

    onMounted(renderChart)
    watch(
      () => [
        props.chartType,
        props.data,
        props.connectedColumns,
        props.connectionsOpacity,
        props.colorizes,
      ],
      renderChart,
      { deep: true },
    )

    return () => h('div', {
      ref: (el) => {
        containerRef.value = el as HTMLElement | null
      },
      class: 'bar-connected-columns-story__canvas',
      style: `height: ${props.height}px;`,
    })
  },
})
</script>

<template>
  <Story title="Chart/BarConnectedColumns">
    <Variant title="Off">
      <template #default>
        <ChartPreview
          :chart-type="ChartType.BarVertical"
          :data="monoData"
          :connected-columns="false"
        />
      </template>
    </Variant>

    <Variant
      title="On — same colors"
      :init-state="() => ({ opacityPct: 15 })"
    >
      <template #default="{ state }">
        <ChartPreview
          :chart-type="ChartType.BarVertical"
          :data="monoData"
          :connected-columns="true"
          :connections-opacity="pctToDecimal(state.opacityPct)"
        />
      </template>
      <template #controls="{ state }">
        <HstSlider
          v-model="state.opacityPct"
          title="Opacity %"
          :min="0"
          :max="100"
        />
      </template>
    </Variant>

    <Variant
      title="On — different colors (gradient)"
      :init-state="() => ({ opacityPct: 25 })"
    >
      <template #default="{ state }">
        <ChartPreview
          :chart-type="ChartType.BarVertical"
          :data="monoData"
          :connected-columns="true"
          :connections-opacity="pctToDecimal(state.opacityPct)"
          :colorizes="gradientColorizes"
        />
      </template>
      <template #controls="{ state }">
        <HstSlider
          v-model="state.opacityPct"
          title="Opacity %"
          :min="0"
          :max="100"
        />
      </template>
    </Variant>

    <Variant
      title="Vertical"
      :init-state="() => ({ opacityPct: 20 })"
    >
      <template #default="{ state }">
        <ChartPreview
          :chart-type="ChartType.BarVertical"
          :data="monoData"
          :connected-columns="true"
          :connections-opacity="pctToDecimal(state.opacityPct)"
          :colorizes="gradientColorizes"
        />
      </template>
      <template #controls="{ state }">
        <HstSlider
          v-model="state.opacityPct"
          title="Opacity %"
          :min="0"
          :max="100"
        />
      </template>
    </Variant>

    <Variant
      title="Horizontal"
      :init-state="() => ({ opacityPct: 20 })"
    >
      <template #default="{ state }">
        <ChartPreview
          :chart-type="ChartType.BarHorizontal"
          :data="monoData"
          :connected-columns="true"
          :connections-opacity="pctToDecimal(state.opacityPct)"
          :colorizes="gradientColorizes"
          :height="360"
        />
      </template>
      <template #controls="{ state }">
        <HstSlider
          v-model="state.opacityPct"
          title="Opacity %"
          :min="0"
          :max="100"
        />
      </template>
    </Variant>

    <Variant
      title="Null gap"
      :init-state="() => ({ opacityPct: 20 })"
    >
      <template #default="{ state }">
        <ChartPreview
          :chart-type="ChartType.BarVertical"
          :data="gapData"
          :connected-columns="true"
          :connections-opacity="pctToDecimal(state.opacityPct)"
          :colorizes="gradientColorizes"
        />
      </template>
      <template #controls="{ state }">
        <HstSlider
          v-model="state.opacityPct"
          title="Opacity %"
          :min="0"
          :max="100"
        />
      </template>
    </Variant>
  </Story>
</template>

<style lang="scss">
.bar-connected-columns-story__canvas {
  width: 100%;
  padding: 1rem;
  background: #fff;
}
</style>
