<template>
  <slot />
</template>

<script setup lang="ts">
import { useChildEntry } from '../../../composables/useChildEntries'
import { PaletteEntriesKey } from '../../../composables/injection-keys'

const props = defineProps<{
  value: string
  label: string
  colors: string[]
}>()

useChildEntry(PaletteEntriesKey, () => ({
  value: props.value,
  label: props.label,
  colors: props.colors,
}))
</script>
