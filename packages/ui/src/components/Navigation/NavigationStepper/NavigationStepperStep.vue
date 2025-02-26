<template>
  <slot />
</template>

<script setup lang="ts">
import { useChildEntry } from '../../../composables/useChildEntries'
import { StepperEntriesKey } from '../../../composables/injection-keys'

const props = defineProps<{
  label: string
}>()

useChildEntry(StepperEntriesKey, () => ({
  label: props.label,
}))
</script>
