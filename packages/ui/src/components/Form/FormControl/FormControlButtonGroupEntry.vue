<template>
  <slot />
</template>

<script setup lang="ts">
import { type Component, defineComponent, markRaw, useSlots } from 'vue'
import { useChildEntry } from '../../../composables/useChildEntries'
import { ButtonGroupEntriesKey } from '../../../composables/injection-keys'

const props = defineProps<{
  value: string
  text: string
  iconLeft?: Component
}>()

const slots = useSlots()
const slotIconLeft = slots['icon-left']
  ? markRaw(defineComponent({ render: () => slots['icon-left']!() }))
  : undefined

useChildEntry(ButtonGroupEntriesKey, () => ({
  value: props.value,
  text: props.text,
  iconLeft: props.iconLeft ?? slotIconLeft,
}))
</script>
