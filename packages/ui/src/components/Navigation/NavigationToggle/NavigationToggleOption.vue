<template>
  <slot />
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { useChildEntry } from '../../../composables/useChildEntries'
import { ToggleEntriesKey } from '../../../composables/injection-keys'

const props = defineProps<{
  value: string
  text: string
  icon?: Component
}>()

useChildEntry(ToggleEntriesKey, () => ({
  value: props.value,
  text: props.text,
  icon: props.icon,
}))
</script>
