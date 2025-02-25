<template>
  <div class="d-flex flex-column gap-3">
    <h6 class="fw-bold mb-0">
      Appearance
    </h6>

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
      <div
        class="bc-label-list border rounded overflow-auto"
        style="max-height: 220px"
      >
        <div
          v-for="label in labels"
          :key="label"
          class="bc-label-row d-flex align-items-center gap-2 px-2 py-1 border-bottom"
          :class="labelRowClassList(label)"
          role="button"
          @click="toggleSelect(label, $event)"
        >
          <span
            class="bc-color-dot rounded-circle flex-shrink-0"
            :style="{ backgroundColor: colorForLabel(label), width: '14px', height: '14px', display: 'inline-block' }"
          />
          <span class="text-truncate small">{{ label }}</span>
        </div>
      </div>

      <div class="d-flex gap-2 small">
        <a
          href="#"
          class="link-primary"
          @click.prevent="selectAll"
        >all</a>
        <a
          href="#"
          class="link-primary"
          @click.prevent="selectNone"
        >none</a>
        <a
          href="#"
          class="link-primary"
          @click.prevent="selectInvert"
        >invert</a>
      </div>

      <BFormGroup
        v-if="selected.size > 0"
        label="Color for selected"
        label-for="bar-highlight-color"
      >
        <BFormInput
          id="bar-highlight-color"
          type="color"
          :model-value="pickerColor"
          @update:model-value="applyColor"
        />
      </BFormGroup>

      <BButton
        v-if="highlights.length > 0"
        variant="outline-secondary"
        size="sm"
        @click="resetAll"
      >
        Reset all changes
      </BButton>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ChartHighlight } from '@/composables/useChartConfig'
import { FormControlColorInput, FormControlCheckbox } from '@blueprint-chart/ui'

const props = defineProps<{
  labels: string[]
  highlights: ChartHighlight[]
  baseColor: string
}>()

const emit = defineEmits<{
  'update:highlights': [value: ChartHighlight[]]
  'update:baseColor': [value: string]
}>()

const selected = ref<Set<string>>(new Set())
const customizeEnabled = ref(props.highlights.length > 0)

function labelRowClassList(label: string) {
  return { 'bg-primary-subtle': selected.value.has(label) }
}

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
  const sel = [...selected.value]
  if (sel.length === 0) return props.baseColor
  return highlightMap.value.get(sel[0]) ?? props.baseColor
})

function toggleSelect(label: string, event: globalThis.MouseEvent) {
  const next = new Set(selected.value)
  if (event.ctrlKey || event.metaKey) {
    if (next.has(label)) {
      next.delete(label)
    }
    else {
      next.add(label)
    }
  }
  else if (next.size === 1 && next.has(label)) {
    next.clear()
  }
  else {
    next.clear()
    next.add(label)
  }
  selected.value = next
}

function selectAll() {
  selected.value = new Set(props.labels)
}

function selectNone() {
  selected.value = new Set()
}

function selectInvert() {
  const next = new Set<string>()
  for (const l of props.labels) {
    if (!selected.value.has(l)) next.add(l)
  }
  selected.value = next
}

function applyColor(color: string) {
  const current = new Map(props.highlights.map(h => [h.target, h]))
  for (const label of selected.value) {
    current.set(label, { target: label, color, label: '' })
  }
  emit('update:highlights', [...current.values()])
}

function resetAll() {
  emit('update:highlights', [])
  selected.value = new Set()
}

function onToggleCustomize(val: boolean) {
  customizeEnabled.value = val
  if (!val) {
    emit('update:highlights', [])
    selected.value = new Set()
  }
}
</script>
