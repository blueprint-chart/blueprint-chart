<script setup lang="ts">
export interface NavigationSectionTabsSection {
  text: string
  link: string
}

withDefaults(defineProps<{
  sections: ReadonlyArray<NavigationSectionTabsSection>
  activeLink?: string
  ariaLabel?: string
}>(), {
  activeLink: undefined,
  ariaLabel: 'Documentation sections',
})
</script>

<template>
  <nav
    class="navigation-section-tabs"
    :aria-label="ariaLabel"
  >
    <a
      v-for="s in sections"
      :key="s.link"
      :href="s.link"
      class="navigation-section-tabs__tab"
      :class="{ 'navigation-section-tabs__tab--active': s.link === activeLink }"
      :aria-current="s.link === activeLink ? 'page' : undefined"
    >{{ s.text }}</a>
  </nav>
</template>

<style scoped lang="scss">
.navigation-section-tabs {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.navigation-section-tabs__tab {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.6rem;
  border-radius: var(--bc-tile-radius-xs);
  font-size: var(--bs-font-size-sm);
  font-weight: 500;
  color: rgba(var(--bs-body-color-rgb), 0.65);
  text-decoration: none;
  white-space: nowrap;
  transition: background var(--bc-duration-base) var(--bc-ease),
              color var(--bc-duration-base) var(--bc-ease);

  &:hover {
    background: var(--bc-wash-soft);
    color: var(--bs-body-color);
    text-decoration: none;
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--bc-focus-ring);
  }

  &--active {
    background: var(--bc-tile-bg-elevated);
    color: var(--bs-body-color);
    font-weight: 600;
  }
}
</style>
