<template>
  <div class="d-flex flex-column gap-3">
    <h6 class="fw-bold mb-0">
      Fill areas
    </h6>

    <BButton
      variant="outline-primary"
      size="sm"
      @click="add"
    >
      Add area fill
    </BButton>

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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AreaFillConfig } from '@blueprint-chart/lib'
import EditorAreaFillItem from './EditorAreaFillItem.vue'

const props = defineProps<{
  seriesNames: string[]
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
  model.value = [
    ...fills.value,
    { from, to, color: '#cccccc', opacity: 30, interpolation: 'linear' },
  ]
}

function remove(index: number) {
  const copy = [...fills.value]
  copy.splice(index, 1)
  model.value = copy
}
</script>
