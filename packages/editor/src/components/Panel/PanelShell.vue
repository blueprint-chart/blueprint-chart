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
</template>

<script setup lang="ts">
import { usePanelStore } from '@/stores/panel'
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
const { mode, dockedWidth } = storeToRefs(panelStore)
const { close } = panelStore

// Observe the parent of the canvas (the stable flex container), not the
// canvas itself — observing the shrinking canvas creates a reactive feedback
// loop (panel opens → canvas shrinks → cramped → panel closes → loop).
const sizingTarget = computed(() => props.containerRef?.parentElement ?? null)
const { canvasWidth } = usePanelCanvasSync(sizingTarget)

function onClose() {
  close()
  emit('close')
}
</script>
