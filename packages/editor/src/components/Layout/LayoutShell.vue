<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useEventListener } from '@vueuse/core'
import { useBreakpoint } from '@blueprint-chart/ui'
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

const { isNarrow } = useBreakpoint('md')
const sidebarOpen = ref(false)

// Auto-close offcanvas on navigation.
watch(() => route.fullPath, () => {
  sidebarOpen.value = false
})

// Reset offcanvas state when transitioning to wide (offcanvas unmounts there).
watch(isNarrow, (narrow) => {
  if (!narrow) {
    sidebarOpen.value = false
  }
})

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
  >
    <aside class="layout-shell__sidebar">
      <LayoutSidebar />
    </aside>
    <div class="layout-shell__topbar">
      <LayoutNavbar
        :sidebar-open="sidebarOpen"
        @search-click="paletteOpen = true"
        @toggle-sidebar="sidebarOpen = !sidebarOpen"
      />
    </div>
    <main class="layout-shell__main">
      <slot />
    </main>

    <BOffcanvas
      v-if="isNarrow"
      id="layout-sidebar-offcanvas"
      v-model="sidebarOpen"
      placement="start"
      no-header
      aria-label="Workspace navigation"
      class="layout-shell__sidebar-offcanvas"
    >
      <LayoutSidebar />
    </BOffcanvas>

    <CommandPaletteModal v-model:open="paletteOpen" />
  </div>
</template>

<style scoped lang="scss">
@use "bootstrap/scss/mixins/breakpoints" as bsbp;

// Bootstrap 5.3's _variables.scss has @import-style internal dependencies that
// don't resolve cleanly under @use, so we declare $grid-breakpoints locally.
// Values mirror node_modules/bootstrap/scss/_variables.scss (and the JS-side
// BOOTSTRAP_BREAKPOINTS in @blueprint-chart/ui — keep these aligned).
$grid-breakpoints: (
  xs: 0,
  sm: 576px,
  md: 768px,
  lg: 992px,
  xl: 1200px,
  xxl: 1400px,
);

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
  grid-template-rows: 2.75rem 1fr;
  grid-template-areas:
    'sidebar topbar'
    'sidebar main';
  height: 100vh;
  overflow: hidden;

  // Narrow viewports: collapse to single column, hide sidebar.
  // The sidebar is reachable via the offcanvas (LayoutNavbar hamburger).
  @include bsbp.media-breakpoint-down(md, $grid-breakpoints) {
    grid-template-columns: 1fr;
    grid-template-areas:
      'topbar'
      'main';
  }
}

.layout-shell__sidebar {
  grid-area: sidebar;
  min-height: 0;
  min-width: 0;
  overflow: hidden;

  @include bsbp.media-breakpoint-down(md, $grid-breakpoints) {
    display: none;
  }
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
