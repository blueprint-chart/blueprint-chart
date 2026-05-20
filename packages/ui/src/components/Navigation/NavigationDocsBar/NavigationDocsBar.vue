<script setup lang="ts">
defineSlots<{
  brand?: () => unknown
  actions?: () => unknown
  'cta-primary'?: () => unknown
  'cta-secondary'?: () => unknown
}>()
</script>

<template>
  <header class="navigation-docs-bar" aria-label="Docs navigation">
    <div
      v-if="$slots.brand"
      class="navigation-docs-bar__brand"
    >
      <slot name="brand" />
    </div>
    <div
      v-if="$slots.actions"
      class="navigation-docs-bar__actions"
    >
      <slot name="actions" />
    </div>
    <div class="navigation-docs-bar__spacer" />
    <div
      v-if="$slots['cta-primary']"
      class="navigation-docs-bar__cta-primary"
    >
      <slot name="cta-primary" />
    </div>
    <div
      v-if="$slots['cta-secondary']"
      class="navigation-docs-bar__cta-secondary"
    >
      <slot name="cta-secondary" />
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
  background: color-mix(in srgb, var(--bc-chrome-bg) 85%, transparent);
  backdrop-filter: saturate(150%) blur(10px);
  -webkit-backdrop-filter: saturate(150%) blur(10px);
  border-bottom: 1px solid var(--bc-hairline);
  flex-shrink: 0;
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
.navigation-docs-bar__cta-primary,
.navigation-docs-bar__cta-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
