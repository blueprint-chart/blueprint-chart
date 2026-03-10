<template>
  <nav :class="navbarClass">
    <router-link
      to="/"
      class="navbar-brand text-decoration-none mb-0 d-flex align-items-center gap-2"
    >
      <img
        :src="logoSrc"
        alt="Blueprint Chart"
        class="shell-navbar__logo"
      >
      <span class="bc-brand-gradient fw-bold">Blueprint Chart</span>
    </router-link>

    <div class="shell-navbar__center">
      <slot name="center" />
    </div>

    <div class="shell-navbar__right">
      <slot name="right" />
      <ButtonIcon
        :icon-left="themeIcon"
        label="Toggle theme"
        hide-label
        square
        variant="outline-secondary"
        size="sm"
        @click="cycleTheme"
      />
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ButtonIcon } from '@blueprint-chart/ui'
import { useTheme } from '@/composables/useTheme'
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

const { theme, cycleTheme } = useTheme()

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

const navbarClass = computed(() => ({
  'shell-navbar': true,
  'shell-navbar--opaque': !props.transparent,
}))
</script>

<style scoped lang="scss">
.shell-navbar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0.375rem 1rem;
  min-height: 3.5rem;
  background: transparent;
  border: none;
  box-shadow: none;
  flex-shrink: 0;
  gap: 1rem;
  position: relative;
  z-index: 1060;
}

.shell-navbar--opaque {
  background: var(--bc-tile-bg);
  border-bottom: var(--bc-tile-border);
  box-shadow: var(--bc-tile-shadow);
}

.shell-navbar__logo {
  height: 1.5rem;
  width: auto;
}

.shell-navbar__center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.shell-navbar__right {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
}
</style>
