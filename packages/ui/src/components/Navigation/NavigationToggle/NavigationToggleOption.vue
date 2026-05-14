<template>
  <slot />
</template>

<script setup lang="ts">
import type { Component } from 'vue'

const props = defineProps<{
  value: string
  text: string
  icon?: Component
  disabled?: boolean
}>()

useChildEntry(ToggleEntriesKey, () => ({
  value: props.value,
  text: props.text,
  icon: props.icon,
  disabled: props.disabled,
}))
</script>
