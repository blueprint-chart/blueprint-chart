<template>
  <slot />
</template>

<script setup lang="ts">

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
