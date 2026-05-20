<script setup lang="ts">
withDefaults(defineProps<{
  ariaLabel?: string
}>(), {
  ariaLabel: 'Sidebar',
})
</script>

<template>
  <nav
    class="navigation-sidebar"
    :aria-label="ariaLabel"
  >
    <div
      v-if="$slots.header"
      class="navigation-sidebar__header"
    >
      <slot name="header" />
    </div>
    <div class="navigation-sidebar__body">
      <slot />
    </div>
  </nav>
</template>

<style scoped lang="scss">
.navigation-sidebar {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  background: var(--bc-chrome-bg);
  border-right: 1px solid var(--bc-hairline);
  padding: 0.5rem 0.375rem 0.75rem; // 8px top, 6px sides, 12px bottom
  gap: 0.875rem;                    // 14px between groups
  overflow-y: auto;
}

.navigation-sidebar__header {
  padding: 0 0.5rem 0.375rem;       // top 0 so the workspace switcher
                                    // aligns vertically with the navbar row
}

.navigation-sidebar__body {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}
</style>
