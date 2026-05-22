<template>
  <NavigationIconRail
    :model-value="activeTab"
    :items="items"
    @update:model-value="onSelect"
  >
    <template #footer>
      <ButtonIcon
        :icon-left="IPhSidebarSimple"
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
import IPhSidebarSimple from '~icons/ph/sidebar-simple'

defineProps<{
  activeTab: string
  items: { value: string, icon: Component, tooltip: string }[]
}>()

const emit = defineEmits<{
  'select': [tab: string | number]
  'toggle-mode': []
}>()

const { mode: panelMode, open } = usePanel()

function onSelect(tab: string | number) {
  if (panelMode.value === 'closed') {
    open()
  }
  emit('select', tab)
}

const toggleLabel = computed(() =>
  panelMode.value === 'closed' ? 'Open panel' : 'Close panel',
)
</script>
