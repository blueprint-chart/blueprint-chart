<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  AppIcon,
  ButtonIcon,
  NavigationMarketingBar,
} from '@blueprint-chart/ui'
import { useTheme, type ThemeMode } from '@/stores/theme'
import logoLight from '@/assets/images/blueprint-chart-logo.svg'
import logoDark from '@/assets/images/blueprint-chart-logo-dark.svg'
import IPhPlus from '~icons/ph/plus'
import IPhGithubLogo from '~icons/ph/github-logo'
import IPhSun from '~icons/ph/sun'
import IPhMoon from '~icons/ph/moon'
import IPhCircleHalf from '~icons/ph/circle-half'

const router = useRouter()
const { theme, resolvedTheme, cycleTheme } = useTheme()
const logoSrc = computed(() => resolvedTheme.value === 'dark' ? logoDark : logoLight)

const iconByTheme: Record<ThemeMode, typeof IPhSun> = {
  light: IPhSun,
  dark: IPhMoon,
  auto: IPhCircleHalf,
}
const themeIcon = computed(() => iconByTheme[theme.value])

function goCharts() {
  router.push('/charts')
}

function goNew() {
  router.push('/new')
}
</script>

<template>
  <NavigationMarketingBar>
    <template #brand>
      <router-link to="/" class="landing-topnav__brand" aria-label="Blueprint Chart home">
        <img :src="logoSrc" alt="" class="landing-topnav__brand-logo">
        <span class="landing-topnav__brand-name">Blueprint Chart</span>
      </router-link>
    </template>

    <template #menu>
      <router-link :to="{ hash: '#defaults' }">Defaults</router-link>
      <router-link :to="{ hash: '#transforms' }">Transforms</router-link>
      <router-link :to="{ hash: '#format' }">Format</router-link>
      <router-link :to="{ hash: '#scenes' }">Scenes</router-link>
    </template>

    <template #actions>
      <a
        class="btn btn-sm btn-outline-secondary landing-topnav__github"
        href="https://github.com/blueprint-chart/blueprint-chart"
        target="_blank"
        rel="noopener noreferrer"
      >
        <AppIcon :name="IPhGithubLogo" size="xs" />
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
      <ButtonIcon
        label="My charts"
        variant="outline-secondary"
        size="sm"
        @click="goCharts"
      />
    </template>

    <template #cta-primary>
      <ButtonIcon
        label="New chart"
        variant="primary"
        size="sm"
        :icon-left="IPhPlus"
        @click="goNew"
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
