<template>
  <div class="d-flex flex-column gap-2">
    <div class="d-flex gap-1 mb-1">
      <BButton
        variant="outline-secondary"
        size="sm"
        @click="selectAll"
      >
        All
      </BButton>
      <BButton
        variant="outline-secondary"
        size="sm"
        @click="selectNone"
      >
        None
      </BButton>
      <BButton
        variant="outline-secondary"
        size="sm"
        @click="invertSelection"
      >
        Invert
      </BButton>
    </div>
    <ListItemRow
      v-for="(name, i) in seriesNames"
      :key="name"
      :label="name"
      :active="selected.includes(name)"
      @click="toggleSelect(name)"
    >
      <template #leading>
        <DisplayColorSwatch :color="seriesColor(name, i)" />
      </template>
      <template #actions>
        <BFormCheckbox
          :model-value="!isHidden(name)"
          size="sm"
          @click.stop
          @update:model-value="(v: boolean) => $emit('toggleVisibility', name, !v)"
        />
      </template>
    </ListItemRow>
  </div>
</template>

<script setup lang="ts">
import type { SeriesOverride } from '@blueprint-chart/lib'
import { resolveSeriesColor, isSeriesHidden } from '@blueprint-chart/lib'
import { ListItemRow, DisplayColorSwatch } from '@blueprint-chart/ui'

const props = defineProps<{
  seriesNames: string[]
  selected: string[]
  colors: string[]
  overrides: SeriesOverride[]
}>()

const emit = defineEmits<{
  'update:selected': [value: string[]]
  'toggleVisibility': [name: string, hidden: boolean]
}>()

function seriesColor(name: string, index: number): string {
  return resolveSeriesColor(name, index, props.colors, props.overrides)
}

function isHidden(name: string): boolean {
  return isSeriesHidden(name, props.overrides)
}

function toggleSelect(name: string) {
  const idx = props.selected.indexOf(name)
  if (idx >= 0) {
    emit('update:selected', props.selected.filter(n => n !== name))
  }
  else {
    emit('update:selected', [...props.selected, name])
  }
}

function selectAll() {
  emit('update:selected', [...props.seriesNames])
}

function selectNone() {
  emit('update:selected', [])
}

function invertSelection() {
  const inverted = props.seriesNames.filter(n => !props.selected.includes(n))
  emit('update:selected', inverted)
}
</script>
