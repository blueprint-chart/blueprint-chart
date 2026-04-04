<template>
  <slot />
</template>

<script setup lang="ts">
import type { Component } from 'vue'

const props = defineProps<{
  value: string
  text: string
  iconLeft?: Component
  description?: string
  visual?: string | Component
  icon?: Component
}>()

const slots = useSlots()
const slotIconLeft = slots['icon-left']
  ? markRaw(defineComponent({ render: () => slots['icon-left']!() }))
  : undefined

useChildEntry(ButtonGroupEntriesKey, () => ({
  value: props.value,
  text: props.text,
  iconLeft: props.iconLeft ?? slotIconLeft,
  description: props.description,
  visual: props.visual,
  icon: props.icon,
}))
</script>
