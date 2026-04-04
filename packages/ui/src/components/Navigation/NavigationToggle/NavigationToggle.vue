<template>
  <NavigationPillBase
    :items="pillItems"
    @select="onSelect"
  >
    <slot />
  </NavigationPillBase>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

const model = defineModel<string>({ required: true })

const props = withDefaults(defineProps<{
  options?: { value: string, text: string, icon?: Component, disabled?: boolean }[]
}>(), {
  options: () => [],
})

const { entries } = useChildEntriesProvider(ToggleEntriesKey)
const resolvedOptions = computed(() =>
  entries.value.length > 0 ? entries.value : props.options,
)

const pillItems = computed(() =>
  resolvedOptions.value.map(opt => ({
    key: opt.value,
    text: opt.text,
    icon: opt.icon,
    active: opt.value === model.value,
    disabled: opt.disabled,
  })),
)

function onSelect(key: string) {
  model.value = key
}
</script>
