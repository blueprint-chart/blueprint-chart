<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import IPhArrowSquareOut from '~icons/ph/arrow-square-out'

// Exactly one of `to` (internal route) or `href` (external URL) must be set.
// An external `href` renders as a plain anchor with `target=_blank` and a
// trailing arrow-square-out indicator; an internal `to` goes through the router.
const props = withDefaults(defineProps<{
  to?: RouteLocationRaw
  href?: string
  label: string
  active?: boolean
  count?: number
}>(), {
  to: undefined,
  href: undefined,
  active: false,
  count: undefined,
})

const isExternal = computed(() => props.href !== undefined)

if (props.to === undefined && props.href === undefined) {
  throw new Error('NavigationSidebarItem requires either `to` or `href`.')
}
if (props.to !== undefined && props.href !== undefined) {
  throw new Error('NavigationSidebarItem accepts `to` or `href`, not both.')
}

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
  <a
    v-if="isExternal"
    :href="href"
    :class="rootClass(false)"
    target="_blank"
    rel="noopener noreferrer"
  >
    <span class="navigation-sidebar-item__icon">
      <slot name="icon" />
    </span>
    <span class="navigation-sidebar-item__label">{{ label }}</span>
    <span
      class="navigation-sidebar-item__external"
      aria-hidden="true"
    >
      <IPhArrowSquareOut />
    </span>
  </a>
  <router-link
    v-else
    :to="to!"
    custom
  >
    <template #default="{ navigate, href: routerHref, isActive }">
      <a
        :href="routerHref"
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
    background: var(--bc-wash-soft);
    color: var(--bs-body-color);
    text-decoration: none;
  }

  &--active {
    background: var(--bc-wash-firm);
    color: var(--bs-body-color);
    font-weight: 500;
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

  &__external {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-left: auto;
    width: 0.75rem;
    height: 0.75rem;
    color: var(--bs-tertiary-color);
    opacity: 0.65;
    transition: opacity var(--bc-duration-base) var(--bc-ease);

    .navigation-sidebar-item:hover & {
      opacity: 1;
    }
  }
}
</style>
