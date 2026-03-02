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
import { computed, type Component } from 'vue'
import { NavigationIconRail, ButtonIcon } from '@blueprint-chart/ui'
import type { PanelMode } from '@/composables/useEditorPanel'
import IPhArrowsOutSimple from '~icons/ph/arrows-out-simple'
import IPhArrowsInSimple from '~icons/ph/arrows-in-simple'
import IPhSidebarSimple from '~icons/ph/sidebar-simple'

const props = defineProps<{
  horizontal?: boolean
  activeTab: string
  panelMode: PanelMode
  items: { value: string, icon: Component, tooltip: string }[]
}>()

defineEmits<{
  'select': [tab: string | number]
  'toggle-mode': []
}>()

const toggleIcon = computed(() => {
  if (props.panelMode === 'collapsed') {
    return IPhSidebarSimple
  }
  if (props.panelMode === 'floating') {
    return IPhArrowsInSimple
  }
  return IPhArrowsOutSimple
})

const toggleLabel = computed(() => {
  if (props.panelMode === 'collapsed') {
    return 'Open panel'
  }
  if (props.panelMode === 'floating') {
    return 'Dock panel'
  }
  return 'Detach panel'
})
</script>
