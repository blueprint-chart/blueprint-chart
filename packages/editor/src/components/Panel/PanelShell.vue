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
    :canvas-width="canvasWidth"
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
import { usePanelStore, CRAMPED_THRESHOLD } from '@/stores/panel'
import { usePanelCanvasSync } from '@/composables/usePanelCanvasSync'

const props = withDefaults(defineProps<{
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

const containerRefLocal = computed(() => props.containerRef)
const { canvasWidth } = usePanelCanvasSync(containerRefLocal)

// Intercept the cramped transition while floating: dock first so that
// syncCramped (called by usePanelCanvasSync's internal watcher) sees
// mode='docked' and captures lastDesktopMode='docked', producing the chain
// floating → docked → closed. flush:'sync' ensures this runs before the
// queued syncCramped watcher in the composable.
watch(canvasWidth, (w) => {
  if (w > 0 && w < CRAMPED_THRESHOLD && mode.value === 'floating') {
    dock()
  }
}, { flush: 'sync' })

function onClose() {
  close()
  emit('close')
}
</script>
