<script setup lang="ts">
defineSlots<{
  brand?: () => unknown
  actions?: () => unknown
  cta?: () => unknown
}>()
</script>

<template>
  <header class="navigation-docs-bar" aria-label="Docs navigation">
    <div class="navigation-docs-bar__brand">
      <slot name="brand" />
    </div>
    <div class="navigation-docs-bar__spacer" />
    <div
      v-if="$slots.actions"
      class="navigation-docs-bar__actions"
    >
      <slot name="actions" />
    </div>
    <div
      v-if="$slots.cta"
      class="navigation-docs-bar__cta"
    >
      <slot name="cta" />
    </div>
  </header>
</template>

<style scoped lang="scss">
.navigation-docs-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 2.75rem; // 44px
  padding: 0 1.25rem;
  background: var(--bc-chrome-bg);
  border-bottom: 1px solid var(--bc-hairline);
  flex-shrink: 0;
  z-index: 1040;
  font-size: var(--bs-font-size-sm);
}

.navigation-docs-bar__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
  font-size: var(--bs-font-size-sm);
  color: var(--bs-body-color);
}

.navigation-docs-bar__spacer { flex: 1; }

.navigation-docs-bar__actions,
.navigation-docs-bar__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
