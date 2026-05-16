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
  width: 13.75rem;                // 220px
  background: var(--bc-chrome-bg);
  border-right: 1px solid var(--bc-hairline);
  padding: 0.75rem 0.375rem;       // 12px / 6px
  gap: 0.875rem;                    // 14px between groups
  overflow-y: auto;
}

.navigation-sidebar__header {
  padding: 0.25rem 0.5rem 0.375rem;
}

.navigation-sidebar__body {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}
</style>
