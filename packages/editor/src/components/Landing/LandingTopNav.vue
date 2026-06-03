<script setup lang="ts">
import { computed } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import {
  ButtonIcon,
  NavigationCommandBar,
  NavigationMarketingBar,
} from '@blueprint-chart/ui'
import { useTheme, type ThemeMode } from '@/stores/theme'
import { usePlatformShortcut } from '@/composables/usePlatformShortcut'
import AccountMenu from '@/components/Account/AccountMenu.vue'
import { accountsEnabled } from '@/config/runtimeConfig'
import logoLight from '@/assets/images/blueprint-chart-logo.svg'
import logoDark from '@/assets/images/blueprint-chart-logo-dark.svg'
import IPhSun from '~icons/ph/sun'
import IPhMoon from '~icons/ph/moon'
import IPhCircleHalf from '~icons/ph/circle-half'

const { theme, resolvedTheme, cycleTheme } = useTheme()
const shortcut = usePlatformShortcut('k')
const logoSrc = computed(() => resolvedTheme.value === 'dark' ? logoDark : logoLight)
const showAccount = accountsEnabled()

// Collapses the search bar on narrow viewports (matches the 37.5rem breakpoint
// used by NavigationMarketingBar for its own narrow layout).
const isNarrow = useMediaQuery('(max-width: 37.5rem)')

const iconByTheme: Record<ThemeMode, typeof IPhSun> = {
  light: IPhSun,
  dark: IPhMoon,
  auto: IPhCircleHalf,
}
const themeIcon = computed(() => iconByTheme[theme.value])

function openSearch() {
  // LayoutShell registers a global ⌘/Ctrl+K listener that opens the command
  // palette. Replay the platform-correct keystroke so the click path matches
  // the shortcut path exactly.
  shortcut.trigger()
}
</script>

<template>
  <NavigationMarketingBar>
    <template #brand>
      <router-link
        to="/"
        class="landing-topnav__brand"
        aria-label="Blueprint Chart home"
      >
        <img
          :src="logoSrc"
          alt=""
          class="landing-topnav__brand-logo"
        >
        <span class="landing-topnav__brand-name">Blueprint Chart</span>
      </router-link>
    </template>

    <template #menu>
      <router-link :to="{ hash: '#mcp' }">
        AI
      </router-link>
      <router-link :to="{ hash: '#format' }">
        Format
      </router-link>
      <router-link :to="{ hash: '#defaults' }">
        Defaults
      </router-link>
      <router-link :to="{ hash: '#transforms' }">
        Transforms
      </router-link>
      <router-link :to="{ hash: '#scenes' }">
        Scenes
      </router-link>
    </template>

    <template #actions>
      <NavigationCommandBar
        placeholder="Search or jump to…"
        :shortcut-label="shortcut.keyLabel"
        :collapsed="isNarrow"
        @click="openSearch"
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
      <AccountMenu v-if="showAccount" />
    </template>
  </NavigationMarketingBar>
</template>

<style scoped lang="scss">
.landing-topnav__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--bs-body-color);
  text-decoration: none;
  white-space: nowrap;

  &:hover { color: var(--bs-body-color); }
}

.landing-topnav__brand-logo {
  height: 1.5rem;
  width: auto;
  display: block;
}

.landing-topnav__brand-name {
  line-height: 1;
}
</style>
