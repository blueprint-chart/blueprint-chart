<script setup lang="ts">
import { useRoute } from 'vue-router'
import { usePlatformShortcut } from '@/composables/usePlatformShortcut'

usePanelBreakpointSync()

const route = useRoute()
const isLanding = computed(() => route.path === '/')

const paletteOpen = shallowRef(false)
const shortcut = usePlatformShortcut('k')

const rootClass = computed(() => [
  isLanding.value ? 'min-vh-100' : 'vh-100',
  { 'layout-shell--tiled': !isLanding.value },
])
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
    <LayoutNavbar @search-click="paletteOpen = true" />
    <div
      class="layout-shell__content d-flex flex-grow-1"
      :class="contentClass"
    >
      <slot />
    </div>
    <CommandPaletteModal v-model:open="paletteOpen" />
  </div>
</template>

<style scoped lang="scss">
.layout-shell {
  background: var(--bc-void-bg);
  padding: var(--bc-tile-gap) var(--bc-tile-gap) 0;
  gap: var(--bc-tile-gap);

  // When a contextual page-header sits below the navbar, the two
  // visually read as one composite tile: navbar squares its bottom,
  // page-header (in its own component) squares its top and rounds
  // its bottom to match. Zero flex-gap so they touch directly.
  &--tiled {
    padding-bottom: var(--bc-tile-gap);
    gap: 0;
    --bc-navbar-bottom-radius: 0;
  }

  // Landing keeps full-bleed content under the floating navbar
  &:not(.layout-shell--tiled) > .layout-shell__content {
    margin: 0 calc(-1 * var(--bc-tile-gap)) 0;
  }
}
</style>
