<script setup lang="ts">
defineSlots<{
  brand?: () => unknown
  menu?: () => unknown
  actions?: () => unknown
  'cta-secondary'?: () => unknown
  'cta-primary'?: () => unknown
}>()
</script>

<template>
  <header
    class="navigation-marketing-bar"
    aria-label="Marketing navigation"
  >
    <div class="navigation-marketing-bar__inner">
      <div class="navigation-marketing-bar__brand">
        <slot name="brand" />
      </div>

      <nav
        v-if="$slots.menu"
        class="navigation-marketing-bar__menu"
        aria-label="Sections"
      >
        <slot name="menu" />
      </nav>

      <div class="navigation-marketing-bar__spacer" />

      <div
        v-if="$slots.actions"
        class="navigation-marketing-bar__actions"
      >
        <slot name="actions" />
      </div>

      <div
        v-if="$slots['cta-secondary']"
        class="navigation-marketing-bar__cta-secondary"
      >
        <slot name="cta-secondary" />
      </div>

      <div
        v-if="$slots['cta-primary']"
        class="navigation-marketing-bar__cta-primary"
      >
        <slot name="cta-primary" />
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
.navigation-marketing-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: color-mix(in srgb, var(--bc-chrome-bg) 85%, transparent);
  backdrop-filter: saturate(150%) blur(10px);
  -webkit-backdrop-filter: saturate(150%) blur(10px);
  border-bottom: 1px solid var(--bc-hairline);
  padding: 0 clamp(1rem, 5vw, 3.75rem);
}

.navigation-marketing-bar__inner {
  max-width: 70rem;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  height: 3.75rem; // 60px
}

.navigation-marketing-bar__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: var(--bs-font-size-md);
  color: var(--bs-body-color);
}

.navigation-marketing-bar__menu {
  display: inline-flex;
  align-items: center;
  gap: 1.25rem;
  margin-left: 0.25rem;
  font-size: var(--bs-font-size-md);

  :slotted(a) {
    color: var(--bs-secondary-color);
    text-decoration: none;
    transition: color var(--bc-duration-base) var(--bc-ease);
  }

  :slotted(a:hover) {
    color: var(--bs-body-color);
  }
}

.navigation-marketing-bar__spacer {
  flex: 1;
}

.navigation-marketing-bar__actions,
.navigation-marketing-bar__cta-secondary,
.navigation-marketing-bar__cta-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

@media (max-width: 51.25rem) {
  .navigation-marketing-bar__menu { display: none; }
}

@media (max-width: 37.5rem) {
  .navigation-marketing-bar__cta-secondary { display: none; }
}
</style>
