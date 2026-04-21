<template>
  <NavigationIconRail
    :model-value="activeTab"
    :items="items"
    :horizontal="horizontal"
    @update:model-value="$emit('select', $event)"
  >
    <template
      v-if="!horizontal"
      #footer
    >
      <ButtonIcon
        :icon-left="toggleIcon"
        :label="toggleLabel"
        hide-label
        square
        variant="link"
        size="sm"
        @click="$emit('toggle-mode')"
      />
    </template>
  </NavigationIconRail>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { NavigationIconRail, ButtonIcon } from '@blueprint-chart/ui'
import { usePanel } from '@/stores/panel'
import IPhArrowsOutSimple from '~icons/ph/arrows-out-simple'
import IPhArrowsInSimple from '~icons/ph/arrows-in-simple'
import IPhSidebarSimple from '~icons/ph/sidebar-simple'

defineProps<{
  horizontal?: boolean
  activeTab: string
  items: { value: string, icon: Component, tooltip: string }[]
}>()

defineEmits<{
  'select': [tab: string | number]
  'toggle-mode': []
}>()

const { mode: panelMode } = usePanel()

const toggleIcon = computed(() => {
  if (panelMode.value === 'closed') {
    return IPhSidebarSimple
  }
  if (panelMode.value === 'floating') {
    return IPhArrowsInSimple
  }
  return IPhArrowsOutSimple
})

const toggleLabel = computed(() => {
  if (panelMode.value === 'closed') {
    return 'Open panel'
  }
  if (panelMode.value === 'floating') {
    return 'Dock panel'
  }
  return 'Detach panel'
})
</script>
