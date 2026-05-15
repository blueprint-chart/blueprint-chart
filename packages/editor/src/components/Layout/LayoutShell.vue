<script setup lang="ts">
import { useRoute } from 'vue-router'
import { usePlatformShortcut } from '@/composables/usePlatformShortcut'

usePanelBreakpointSync()

const route = useRoute()
const isLanding = computed(() => route.path === '/')

const paletteOpen = shallowRef(false)
const shortcut = usePlatformShortcut('k')

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
    :class="isLanding ? 'min-vh-100' : 'vh-100'"
  >
    <LayoutNavbar
      transparent
      @search-click="paletteOpen = true"
    />
    <div
      class="layout-shell__content d-flex flex-grow-1"
      :class="{ 'overflow-auto': !isLanding }"
    >
      <slot />
    </div>
    <CommandPaletteModal v-model:open="paletteOpen" />
  </div>
</template>
