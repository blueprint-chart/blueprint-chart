<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { useRoute } from 'vue-router'
import { useEventListener } from '@vueuse/core'
import LayoutNavbar from '@/components/Layout/LayoutNavbar.vue'
import LayoutSidebar from '@/components/Layout/LayoutSidebar.vue'
import CommandPaletteModal from '@/components/CommandPalette/CommandPaletteModal.vue'
import { usePlatformShortcut } from '@/composables/usePlatformShortcut'
import { usePanelBreakpointSync } from '@/composables/usePanelBreakpointSync'

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
  <!-- Landing renders only the slot — landing supplies its own chrome. -->
  <div
    v-if="isLanding"
    class="layout-shell layout-shell--landing"
  >
    <slot />
    <CommandPaletteModal v-model:open="paletteOpen" />
  </div>

  <!-- All other (non-bare) routes use the unified app shell. The scene
       timeline, when present, lives inside the route's main content
       (e.g. WizardShell), wrapped in LayoutSceneTimeline. -->
  <div
    v-else
    class="layout-shell layout-shell--app"
  >
    <aside class="layout-shell__sidebar">
      <LayoutSidebar />
    </aside>
    <div class="layout-shell__topbar">
      <LayoutNavbar @search-click="paletteOpen = true" />
    </div>
    <main class="layout-shell__main">
      <slot />
    </main>
    <CommandPaletteModal v-model:open="paletteOpen" />
  </div>
</template>

<style scoped lang="scss">
.layout-shell {
  background: var(--bc-content-bg);
}

.layout-shell--landing {
  min-height: 100vh;
  background: var(--bc-chrome-bg);
}

.layout-shell--app {
  display: grid;
  grid-template-columns: 13.75rem 1fr;
  grid-template-rows: 2.5rem 1fr;
  grid-template-areas:
    'sidebar topbar'
    'sidebar main';
  height: 100vh;
  overflow: hidden;
}

.layout-shell__sidebar {
  grid-area: sidebar;
  min-height: 0;
}

.layout-shell__topbar {
  grid-area: topbar;
  min-width: 0;
}

.layout-shell__main {
  grid-area: main;
  background: var(--bc-content-bg);
  background-image: var(--bc-canvas-glow, none);
  overflow: hidden;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
</style>
