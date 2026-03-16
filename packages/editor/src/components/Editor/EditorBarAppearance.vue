<template>
  <div class="d-flex flex-column gap-3">
    <FormControlColorInput
      id="bar-base-color"
      label="Base color"
      :model-value="baseColor"
      @update:model-value="$emit('update:baseColor', $event)"
    />

    <FormControlCheckbox
      :model-value="customizeEnabled"
      label="Customize colors"
      @update:model-value="onToggleCustomize"
    />

    <template v-if="customizeEnabled">
      <ListSelectPanel
        :items="labels"
        :selected="selectedArray"
        :on-item-click="onItemClick"
        @update:selected="selectedArray = $event"
      >
        <template #item-leading="{ item }">
          <DisplayColorSwatch :color="colorForLabel(item)" />
        </template>
      </ListSelectPanel>

      <SectionCard
        v-if="selectedArray.length > 0"
        :label="'Editing ' + selectedArray.length + ' ' + (selectedArray.length === 1 ? 'label' : 'labels')"
      >
        <FormControlColorInput
          id="bar-highlight-color"
          label="Color for selected"
          :model-value="pickerColor"
          @update:model-value="applyColor"
        />
        <BButton
          v-if="highlights.length > 0"
          variant="outline-danger"
          size="sm"
          @click="resetAll"
        >
          Reset all changes
        </BButton>
      </SectionCard>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed } from 'vue'
import type { ChartHighlight } from '@/stores/chartConfig'
import { BButton } from 'bootstrap-vue-next'
import { FormControlColorInput, FormControlCheckbox, ListSelectPanel, DisplayColorSwatch, SectionCard } from '@blueprint-chart/ui'

const props = defineProps<{
  labels: string[]
  highlights: ChartHighlight[]
  baseColor: string
}>()

const emit = defineEmits<{
  'update:highlights': [value: ChartHighlight[]]
  'update:baseColor': [value: string]
}>()

const selectedArray = ref<string[]>([])
const customizeEnabled = shallowRef(props.highlights.length > 0)

const highlightMap = computed(() => {
  const map = new Map<string, string>()
  for (const h of props.highlights) {
    map.set(h.target, h.color)
  }
  return map
})

function colorForLabel(label: string): string {
  return highlightMap.value.get(label) ?? props.baseColor
}

const pickerColor = computed(() => {
  if (selectedArray.value.length === 0) {
    return props.baseColor
  }
  return highlightMap.value.get(selectedArray.value[0]) ?? props.baseColor
})

function onItemClick(label: string, _index: number, event: MouseEvent) {
  if (event.ctrlKey || event.metaKey) {
    const idx = selectedArray.value.indexOf(label)
    if (idx >= 0) {
      selectedArray.value = selectedArray.value.filter(l => l !== label)
    }
    else {
      selectedArray.value = [...selectedArray.value, label]
    }
  }
  else if (selectedArray.value.length === 1 && selectedArray.value[0] === label) {
    selectedArray.value = []
  }
  else {
    selectedArray.value = [label]
  }
}

function applyColor(color: string) {
  const current = new Map(props.highlights.map(h => [h.target, h]))
  for (const label of selectedArray.value) {
    current.set(label, { target: label, color, label: '' })
  }
  emit('update:highlights', [...current.values()])
}

function resetAll() {
  emit('update:highlights', [])
  selectedArray.value = []
}

function onToggleCustomize(val: boolean) {
  customizeEnabled.value = val
  if (!val) {
    emit('update:highlights', [])
    selectedArray.value = []
  }
}
</script>
