<template>
  <NavigationPillBase
    :items="pillItems"
    @select="onSelect"
  >
    <slot />
  </NavigationPillBase>
</template>

<script setup lang="ts">
import { type Component, computed } from 'vue'
import { useChildEntriesProvider } from '../../../composables/useChildEntries'
import { ToggleEntriesKey } from '../../../composables/injection-keys'
import NavigationPillBase from '../NavigationPillBase/NavigationPillBase.vue'

const props = withDefaults(defineProps<{
  modelValue: string
  options?: { value: string, text: string, icon?: Component }[]
}>(), {
  options: () => [],
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { entries } = useChildEntriesProvider(ToggleEntriesKey)
const resolvedOptions = computed(() =>
  entries.value.length > 0 ? entries.value : props.options,
)

const pillItems = computed(() =>
  resolvedOptions.value.map(opt => ({
    key: opt.value,
    text: opt.text,
    icon: opt.icon,
    active: opt.value === props.modelValue,
  })),
)

function onSelect(key: string) {
  emit('update:modelValue', key)
}
</script>
