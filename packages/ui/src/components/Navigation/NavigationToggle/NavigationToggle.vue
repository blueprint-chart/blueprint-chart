<template>
  <NavigationSegmentedControl
    :items="segmentedItems"
    :size="size"
    :icon-only="iconOnly"
    @select="onSelect"
  >
    <slot />
  </NavigationSegmentedControl>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import NavigationSegmentedControl from '../NavigationSegmentedControl/NavigationSegmentedControl.vue'
import type { NavigationSegmentedControlItem } from '../NavigationSegmentedControl/NavigationSegmentedControl.vue'

const model = defineModel<string>({ required: true })

const props = withDefaults(defineProps<{
  options?: { value: string, text: string, icon?: Component, title?: string, disabled?: boolean }[]
  size?: 'sm' | 'md'
  iconOnly?: boolean
}>(), {
  options: () => [],
  size: 'md',
  iconOnly: false,
})

const { entries } = useChildEntriesProvider(ToggleEntriesKey)
const resolvedOptions = computed(() =>
  entries.value.length > 0 ? entries.value : props.options,
)

const segmentedItems = computed<NavigationSegmentedControlItem[]>(() =>
  resolvedOptions.value.map(opt => ({
    key: opt.value,
    text: opt.text,
    icon: opt.icon,
    title: opt.title,
    active: opt.value === model.value,
    disabled: opt.disabled,
  })),
)

function onSelect(key: string) {
  model.value = key
}
</script>
