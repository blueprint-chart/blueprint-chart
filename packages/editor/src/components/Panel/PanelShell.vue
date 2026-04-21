<template>
  <PanelDrawer
    v-if="mode === 'drawer'"
    v-model="drawerOpen"
    :title="title"
  >
    <template
      v-if="$slots.tabs || $slots.header"
      #header
    >
      <slot name="tabs" />
      <slot name="header" />
    </template>
    <slot />
  </PanelDrawer>
  <PanelDocked
    v-else-if="mode === 'docked'"
    v-model="dockedWidth"
    :collapsed="false"
    :title="title"
    :show-close="showClose"
    @float="float"
    @close="onClose"
  >
    <template
      v-if="$slots.header"
      #toolbar
    >
      <slot name="header" />
    </template>
    <slot />
    <template
      v-if="$slots.footer"
      #footer
    >
      <slot name="footer" />
    </template>
  </PanelDocked>
  <Teleport
    v-else-if="mode === 'floating' && containerRef"
    :to="containerRef"
  >
    <PanelFloating
      :container-ref="containerRef"
      :title="title"
      :position="floatingPosition"
      :show-close="showClose"
      @dock="dock"
      @close="onClose"
    >
      <template
        v-if="$slots.tabs"
        #tabs
      >
        <slot name="tabs" />
      </template>
      <template
        v-if="$slots.header"
        #toolbar
      >
        <slot name="header" />
      </template>
      <slot />
      <template
        v-if="$slots.footer"
        #footer
      >
        <slot name="footer" />
      </template>
    </PanelFloating>
  </Teleport>
</template>

<script setup lang="ts">
import { usePanelStore } from '@/stores/panel'

withDefaults(defineProps<{
  title: string
  containerRef?: HTMLElement | null
  showClose?: boolean
}>(), {
  containerRef: null,
  showClose: true,
})

const emit = defineEmits<{
  close: []
}>()

const drawerOpen = defineModel<boolean>('drawerOpen', { default: false })

const panelStore = usePanelStore()
const { mode, dockedWidth, floatingPosition } = storeToRefs(panelStore)
const { dock, float, close } = panelStore

function onClose() {
  close()
  emit('close')
}
</script>
