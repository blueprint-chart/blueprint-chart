<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

const props = withDefaults(defineProps<{
  to: RouteLocationRaw
  label: string
  active?: boolean
  count?: number
}>(), {
  active: false,
})

// Combine explicit active prop with router's own active detection so that
// both programmatic highlighting and route matching drive the modifier class.
function rootClass(routerActive: boolean) {
  return {
    'navigation-sidebar-item': true,
    'navigation-sidebar-item--active': props.active || routerActive,
  }
}
</script>

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
        <!-- Optional icon slot rendered at a fixed size to keep rows aligned -->
        <span class="navigation-sidebar-item__icon">
          <slot name="icon" />
        </span>

        <span class="navigation-sidebar-item__label">{{ label }}</span>

        <!-- Badge showing unread / pending count — only rendered when provided -->
        <span
          v-if="count !== undefined"
          class="navigation-sidebar-item__count"
        >{{ count }}</span>
      </a>
    </template>
  </router-link>
</template>

<style scoped lang="scss">
.navigation-sidebar-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3125rem 0.5rem;
  border-radius: var(--bc-radius-sm);
  color: var(--bs-secondary-color);
  font-size: var(--bs-font-size-sm, 0.875rem);
  font-weight: 400;
  text-decoration: none;
  cursor: pointer;
  transition: background var(--bc-duration-base) var(--bc-ease),
              color var(--bc-duration-base) var(--bc-ease);

  &:hover {
    background: rgba(255, 255, 255, 0.03);
    color: var(--bs-body-color);
    text-decoration: none;

    [data-bs-theme="light"] & {
      background: rgba(0, 0, 0, 0.04);
    }
  }

  &--active {
    background: rgba(255, 255, 255, 0.07);
    color: var(--bs-body-color);
    font-weight: 500;

    [data-bs-theme="light"] & {
      background: rgba(0, 0, 0, 0.06);
    }
  }

  &__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 0.875rem;
    height: 0.875rem;
    opacity: 0.75;

    .navigation-sidebar-item--active & {
      opacity: 1;
      color: var(--bs-info);
    }
  }

  &__label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__count {
    font-family: var(--bs-font-monospace, ui-monospace, monospace);
    font-size: var(--bs-font-size-xs, 0.75rem);
    color: var(--bs-secondary-color);
    margin-left: auto;
  }
}
</style>
