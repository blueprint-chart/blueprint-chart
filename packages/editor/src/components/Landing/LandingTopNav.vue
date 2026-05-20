<script setup lang="ts">
import { computed } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import {
  AppIcon,
  ButtonIcon,
  NavigationCommandBar,
  NavigationMarketingBar,
} from '@blueprint-chart/ui'
import { useTheme, type ThemeMode } from '@/stores/theme'
import { usePlatformShortcut } from '@/composables/usePlatformShortcut'
import logoLight from '@/assets/images/blueprint-chart-logo.svg'
import logoDark from '@/assets/images/blueprint-chart-logo-dark.svg'
import IPhGithubLogo from '~icons/ph/github-logo'
import IPhSun from '~icons/ph/sun'
import IPhMoon from '~icons/ph/moon'
import IPhCircleHalf from '~icons/ph/circle-half'

const { theme, resolvedTheme, cycleTheme } = useTheme()
const shortcut = usePlatformShortcut('k')
const logoSrc = computed(() => resolvedTheme.value === 'dark' ? logoDark : logoLight)

// Matches the existing `@media (max-width: 37.5rem)` CSS threshold below so
// the JS-driven `:collapsed` switches at the same width as the CSS hides.
const isNarrow = useMediaQuery('(max-width: 37.5rem)')

const iconByTheme: Record<ThemeMode, typeof IPhSun> = {
  light: IPhSun,
  dark: IPhMoon,
  auto: IPhCircleHalf,
}
const themeIcon = computed(() => iconByTheme[theme.value])

function openSearch() {
  // LayoutShell registers a global ⌘/Ctrl+K listener that opens the command
  // palette. Synthesize the same keystroke so the click path matches the
  // shortcut path exactly.
  if (typeof document === 'undefined') {
    return
  }
  document.dispatchEvent(new KeyboardEvent('keydown', {
    key: 'k',
    code: 'KeyK',
    metaKey: true,
    ctrlKey: true,
    bubbles: true,
  }))
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
      <router-link :to="{ hash: '#defaults' }">
        Defaults
      </router-link>
      <router-link :to="{ hash: '#transforms' }">
        Transforms
      </router-link>
      <router-link :to="{ hash: '#format' }">
        Format
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
      <a
        class="btn btn-sm btn-outline-secondary landing-topnav__github"
        href="https://github.com/blueprint-chart/blueprint-chart"
        target="_blank"
        rel="noopener noreferrer"
      >
        <AppIcon
          :name="IPhGithubLogo"
          size="xs"
        />
        GitHub
      </a>
      <ButtonIcon
        :icon-left="themeIcon"
        label="Toggle theme"
        hide-label
        square
        variant="outline-secondary"
        size="sm"
        @click="cycleTheme"
      />
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

.landing-topnav__github {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  white-space: nowrap;
}

// Brand wordmark stays visible at every width (the search collapses + GitHub
// drops out instead, matching LayoutNavbar's narrow behavior).
@media (max-width: 37.5rem) {
  .landing-topnav__github { display: none; }
}
</style>
