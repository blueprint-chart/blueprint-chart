<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { AppIcon, ButtonIcon } from '@blueprint-chart/ui'
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
  <header
    class="landing-topnav"
    aria-label="Marketing navigation"
  >
    <div class="landing-topnav__inner">
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

      <nav
        class="landing-topnav__links"
        aria-label="Sections"
      >
        <a
          href="#defaults"
          class="landing-topnav__link"
        >Defaults</a>
        <a
          href="#transforms"
          class="landing-topnav__link"
        >Transforms</a>
        <a
          href="#format"
          class="landing-topnav__link"
        >Format</a>
        <a
          href="#scenes"
          class="landing-topnav__link"
        >Scenes</a>
      </nav>

      <div class="landing-topnav__spacer" />

      <div class="landing-topnav__actions">
        <ButtonIcon
          :icon-left="themeIcon"
          label="Toggle theme"
          hide-label
          square
          variant="outline-secondary"
          size="sm"
          @click="cycleTheme"
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
        <span class="landing-topnav__cta-secondary">
          <ButtonIcon
            label="My charts"
            variant="outline-secondary"
            size="sm"
            @click="goCharts"
          />
        </span>
        <ButtonIcon
          label="New chart"
          variant="primary"
          size="sm"
          :icon-left="IPhPlus"
          @click="goNew"
        />
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
.landing-topnav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: color-mix(in srgb, var(--bc-chrome-bg) 85%, transparent);
  backdrop-filter: saturate(150%) blur(10px);
  border-bottom: 1px solid var(--bc-hairline);
  padding: 0.75rem clamp(1rem, 5vw, 3.75rem);
}

.landing-topnav__inner {
  max-width: 70rem;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.landing-topnav__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--bs-body-color);
  text-decoration: none;
  font-weight: 600;
  font-size: var(--bs-font-size-md);

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

.landing-topnav__links {
  display: inline-flex;
  align-items: center;
  gap: 1.25rem;
  margin-left: 0.5rem;
}

.landing-topnav__link {
  font-size: var(--bs-font-size-sm);
  color: var(--bs-secondary-color);
  text-decoration: none;
  transition: color var(--bc-duration-base) var(--bc-ease);

  &:hover {
    color: var(--bs-body-color);
  }
}

.landing-topnav__spacer {
  flex: 1;
}

.landing-topnav__actions {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.landing-topnav__github {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}

@media (max-width: 51.25rem) {
  .landing-topnav__links { display: none; }
}

@media (max-width: 37.5rem) {
  .landing-topnav__brand-name { display: none; }
  .landing-topnav__github { display: none; }
  .landing-topnav__cta-secondary { display: none; }
}
</style>
