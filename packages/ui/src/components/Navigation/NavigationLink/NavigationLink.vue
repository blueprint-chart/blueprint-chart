<template>
  <router-link
    :to="to"
    custom
  >
    <template #default="{ navigate, href, isActive }">
      <a
        :href="href"
        :class="rootClass(isActive)"
        :aria-current="(isActive || active) ? 'page' : undefined"
        @click="navigate"
      >
        <span class="navigation-link__label">{{ label }}</span>
        <svg
          v-if="external"
          class="navigation-link__external-icon"
          viewBox="0 0 12 12"
          aria-hidden="true"
        >
          <path
            d="M4 2 L10 2 L10 8 M10 2 L4 8"
            stroke="currentColor"
            fill="none"
            stroke-width="1.3"
          />
        </svg>
      </a>
    </template>
  </router-link>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

const props = withDefaults(defineProps<{
  to: RouteLocationRaw
  label: string
  active?: boolean
  external?: boolean
}>(), {
  active: false,
  external: false,
})

function rootClass(routerActive: boolean) {
  return {
    'navigation-link': true,
    'navigation-link--active': props.active || routerActive,
  }
}
</script>

<style scoped lang="scss">
.navigation-link {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  height: 1.875rem;
  padding: 0 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--bs-secondary-color);
  text-decoration: none;
  transition: color 0.12s ease, background-color 0.12s ease;

  &:hover {
    color: var(--bs-body-color);
    background: var(--bs-tertiary-bg);
    text-decoration: none;
  }

  &--active {
    color: var(--bs-body-color);
    background: var(--bs-tertiary-bg);
  }

  &__external-icon {
    width: 0.6875rem;
    height: 0.6875rem;
    color: var(--bs-tertiary-color);
    margin-left: 0.125rem;
  }
}
</style>
