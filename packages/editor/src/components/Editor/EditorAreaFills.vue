<template>
  <div class="d-flex flex-column gap-2">
    <EditorAreaFillItem
      v-for="(fill, i) in fills"
      :id="i"
      :key="i"
      :fill="fill"
      :series-names="seriesNames"
      @update:fill="(v) => updateAt(i, v)"
      @remove="remove(i)"
    />
  </div>
  <ButtonAdd
    label="Add"
    @click="add"
  />
</template>

<script setup lang="ts">
import type { AreaFillConfig, SeriesOverride } from '@blueprint-chart/lib'
import { resolveSeriesInterpolation } from '@blueprint-chart/lib'
import { ButtonAdd } from '@blueprint-chart/ui'

const props = defineProps<{
  seriesNames: string[]
  seriesOverrides: SeriesOverride[]
  globalInterpolation: string
}>()

const model = defineModel<AreaFillConfig[]>({ required: true })

const fills = computed(() => model.value)

function updateAt(index: number, value: AreaFillConfig) {
  const copy = [...fills.value]
  copy[index] = value
  model.value = copy
}

function add() {
  const from = props.seriesNames[0] ?? ''
  const to = props.seriesNames[1] ?? props.seriesNames[0] ?? ''
  const interpolation = resolveSeriesInterpolation(from, props.globalInterpolation, props.seriesOverrides)
  model.value = [
    ...fills.value,
    { from, to, color: '#cccccc', opacity: 30, interpolation },
  ]
}

function remove(index: number) {
  const copy = [...fills.value]
  copy.splice(index, 1)
  model.value = copy
}
</script>
