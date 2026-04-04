<template>
  <slot />
</template>

<script setup lang="ts">
import type { Component } from 'vue'

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
