<template>
  <NavigationIconRail
    :model-value="activeTab"
    :items="items"
    :horizontal="horizontal"
    @update:model-value="onSelect"
  >
    <template
      v-if="!horizontal"
      #footer
    >
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
  horizontal?: boolean
  activeTab: string
  items: { value: string, icon: Component, tooltip: string }[]
}>()

const emit = defineEmits<{
  'select': [tab: string | number]
  'toggle-mode': []
}>()

const { mode: panelMode, open } = usePanel()

// Selecting a rail entry while the panel is closed should re-open it. In
// drawer mode, the consumer's drawerOpen v-model is already derived from
// activeTab/dataPanelTab, so setting the tab via `select` will reopen the
// drawer naturally.
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
