<template>
  <ListSelectPanel
    :items="seriesNames"
    :selected="selected"
    @update:selected="$emit('update:selected', $event)"
  >
    <template #item-leading="{ item, index }">
      <DisplayColorSwatch :color="seriesColor(item, index)" />
    </template>
    <template #item-actions="{ item }">
      <BFormCheckbox
        :model-value="!isHidden(item)"
        switch
        size="sm"
        @click.stop
        @update:model-value="(v: boolean) => $emit('toggleVisibility', item, !v)"
      />
    </template>
  </ListSelectPanel>
</template>

<script setup lang="ts">
import type { SeriesOverride } from '@blueprint-chart/lib'
import { resolveSeriesColor, isSeriesHidden } from '@blueprint-chart/lib'
import { ListSelectPanel, DisplayColorSwatch } from '@blueprint-chart/ui'

const props = defineProps<{
  seriesNames: string[]
  selected: string[]
  colors: string[]
  overrides: SeriesOverride[]
}>()

defineEmits<{
  'update:selected': [value: string[]]
  'toggleVisibility': [name: string, hidden: boolean]
}>()

function seriesColor(name: string, index: number): string {
  return resolveSeriesColor(name, index, props.colors, props.overrides)
}

function isHidden(name: string): boolean {
  return isSeriesHidden(name, props.overrides)
}
</script>
