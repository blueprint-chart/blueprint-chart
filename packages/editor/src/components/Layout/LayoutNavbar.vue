<script setup lang="ts">
import { computed } from 'vue'
import { ButtonIcon, NavigationLink, NavigationSearchPill, useBreakpoint } from '@blueprint-chart/ui'
import { useTheme } from '@/stores/theme'
import { usePlatformShortcut } from '@/composables/usePlatformShortcut'
import logoLight from '@/assets/images/blueprint-chart-logo.svg'
import logoDark from '@/assets/images/blueprint-chart-logo-dark.svg'
import IPhSun from '~icons/ph/sun'
import IPhMoon from '~icons/ph/moon'
import IPhCircleHalf from '~icons/ph/circle-half'

const props = withDefaults(defineProps<{
  transparent?: boolean
}>(), {
  transparent: true,
})

defineEmits<{ searchClick: [] }>()

const { theme, cycleTheme } = useTheme()
const { isNarrow } = useBreakpoint()
const shortcut = usePlatformShortcut('k')

const logoSrc = computed(() => theme.value === 'dark' ? logoDark : logoLight)

const themeIcon = computed(() => {
  if (theme.value === 'light') {
    return IPhSun
  }
  if (theme.value === 'dark') {
    return IPhMoon
  }
  return IPhCircleHalf
})

const searchPlaceholder = computed(() => isNarrow.value ? 'Search…' : 'Search charts…')

const navbarClass = computed(() => ({
  'layout-navbar': true,
  'layout-navbar--opaque': !props.transparent,
}))
</script>

<template>
  <nav :class="navbarClass">
    <router-link
      to="/"
      class="layout-navbar__brand"
    >
      <img
        :src="logoSrc"
        alt="Blueprint Chart"
        class="layout-navbar__brand__logo"
      >
      <span class="layout-navbar__brand__name bc-brand-gradient">Blueprint Chart</span>
    </router-link>

    <div class="layout-navbar__nav">
      <NavigationLink
        to="/"
        label="Home"
      />
      <NavigationLink
        to="/charts"
        label="My Charts"
      />
    </div>

    <div class="layout-navbar__spacer" />

    <NavigationSearchPill
      :placeholder="searchPlaceholder"
      :shortcut-label="shortcut.keyLabel"
      :shortcut-keys="shortcut.keys"
      :compact="isNarrow"
      aria-label="Open chart search"
      class="layout-navbar__search"
      @click="$emit('searchClick')"
    />

    <ButtonIcon
      :icon-left="themeIcon"
      label="Toggle theme"
      hide-label
      square
      variant="outline-secondary"
      size="sm"
      @click="cycleTheme"
    />
  </nav>
</template>

<style scoped lang="scss">
.layout-navbar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.375rem 1rem;
  min-height: 3.5rem;
  background: transparent;
  border: none;
  position: relative;
  z-index: 1060;
  flex-shrink: 0;

  &--opaque {
    background: var(--bc-tile-bg);
    border-bottom: var(--bc-tile-border);
    box-shadow: var(--bc-tile-shadow);
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    color: var(--bs-body-color);

    &__logo {
      height: 1.5rem;
      width: auto;
    }

    &__name {
      font-weight: 600;
      font-size: 0.9375rem;
      letter-spacing: -0.005em;
      display: none;

      @media (min-width: 576px) {
        display: inline;
      }
    }
  }

  &__nav {
    display: none;
    align-items: center;
    gap: 0.125rem;
    padding-left: 0.5rem;
    border-left: 1px solid var(--bs-border-color);
    margin-left: 0.25rem;

    @media (min-width: 576px) {
      display: flex;
    }
  }

  &__spacer {
    flex: 1;
  }

  &__search {
    flex-shrink: 0;
  }
}
</style>
