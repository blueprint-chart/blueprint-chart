<template>
  <slot />
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { useChildEntry } from '../../../composables/useChildEntries'
import { IconRailEntriesKey } from '../../../composables/injection-keys'

const props = defineProps<{
  value: string
  icon: Component
  tooltip: string
}>()

useChildEntry(IconRailEntriesKey, () => ({
  value: props.value,
  icon: props.icon,
  tooltip: props.tooltip,
}))
</script>
