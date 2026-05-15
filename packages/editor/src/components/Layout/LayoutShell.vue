<script setup lang="ts">
import { useRoute } from 'vue-router'
import { usePlatformShortcut } from '@/composables/usePlatformShortcut'

usePanelBreakpointSync()

const route = useRoute()
const isLanding = computed(() => route.path === '/')

const paletteOpen = shallowRef(false)
const shortcut = usePlatformShortcut('k')

const rootClass = computed(() => isLanding.value ? 'min-vh-100' : 'vh-100')
const contentClass = computed(() => ({ 'overflow-auto': !isLanding.value }))

useEventListener(document, 'keydown', (event: globalThis.KeyboardEvent) => {
  if (shortcut.matches(event)) {
    event.preventDefault()
    paletteOpen.value = true
  }
})
</script>

<template>
  <div
    class="layout-shell d-flex flex-column"
    :class="rootClass"
  >
    <LayoutNavbar
      transparent
      @search-click="paletteOpen = true"
    />
    <div
      class="layout-shell__content d-flex flex-grow-1"
      :class="contentClass"
    >
      <slot />
    </div>
    <CommandPaletteModal v-model:open="paletteOpen" />
  </div>
</template>
