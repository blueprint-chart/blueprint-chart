<script setup lang="ts">
import { computed, shallowRef, useSlots } from 'vue'
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

const slots = useSlots()
const hasTimeline = computed(() => !!slots.timeline)

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

  <!-- All other (non-bare) routes use the unified app shell. -->
  <div
    v-else
    class="layout-shell layout-shell--app"
    :class="{ 'layout-shell--with-timeline': hasTimeline }"
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
    <div
      v-if="hasTimeline"
      class="layout-shell__timeline"
    >
      <slot name="timeline" />
    </div>
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

.layout-shell--app.layout-shell--with-timeline {
  grid-template-rows: 2.5rem 1fr 3.125rem;
  grid-template-areas:
    'sidebar topbar'
    'sidebar main'
    'sidebar timeline';
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

.layout-shell__timeline {
  grid-area: timeline;
  min-width: 0;
}
</style>
