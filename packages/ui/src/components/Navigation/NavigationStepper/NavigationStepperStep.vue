<template>
  <slot />
</template>

<script setup lang="ts">

const props = defineProps<{
  label: string
}>()

useChildEntry(StepperEntriesKey, () => ({
  label: props.label,
}))
</script>
