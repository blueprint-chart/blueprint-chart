<template>
  <slot />
</template>

<script setup lang="ts">
import { type Component, defineComponent, markRaw, useSlots } from 'vue'
import { useChildEntry } from '../../../composables/useChildEntries'
import { DropdownEntriesKey } from '../../../composables/injection-keys'

const props = defineProps<{
  value: string
  label: string
  description?: string
  visual?: string | Component
  icon?: Component
}>()

const slots = useSlots()
const slotIcon = slots['icon']
  ? markRaw(defineComponent({ render: () => slots['icon']!() }))
  : undefined

useChildEntry(DropdownEntriesKey, () => ({
  value: props.value,
  label: props.label,
  description: props.description,
  visual: props.visual,
  icon: props.icon ?? slotIcon,
}))
</script>
