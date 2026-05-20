<script setup lang="ts">
import { computed } from 'vue'
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
  if (typeof document === 'undefined') { return }
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
}

@media (max-width: 37.5rem) {
  .landing-topnav__brand-name { display: none; }
  .landing-topnav__github { display: none; }
}
</style>
