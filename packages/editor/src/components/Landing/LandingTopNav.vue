<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
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

// Menu links, paired with the section anchors they jump to. Order matches the
// document order of the sections so the scroll-spy below can pick the topmost
// visible section by iterating this list.
const navItems = [
  { id: 'mcp', label: 'AI' },
  { id: 'format', label: 'Format' },
  { id: 'defaults', label: 'Defaults' },
  { id: 'transforms', label: 'Transforms' },
  { id: 'scenes', label: 'Scenes' },
] as const

// Active-section highlighter (effects kit, FIG.03). The law: light condenses
// around the point of attention. Here that point is where you are in the page,
// so the section currently under the reading line gets a chartreuse swipe.
const activeId = ref<string | null>(null)
const visible = new Map<string, boolean>()
let observer: IntersectionObserver | undefined

function recomputeActive() {
  // Last section (in document order) crossing the reading band. Two sections
  // overlap the band only at the hand-off, and there the incoming (lower) one
  // should win, so scrolling down advances the mark rather than lagging behind.
  let active: string | null = null
  for (const item of navItems) {
    if (visible.get(item.id)) {
      active = item.id
    }
  }
  activeId.value = active
}

onMounted(async () => {
  // No-op where the API is missing (jsdom under test, very old browsers): the
  // menu still renders, just without the scroll-spy highlight.
  if (typeof IntersectionObserver === 'undefined') {
    return
  }

  // The nav is the first child of LandingPage, so its sibling sections are not
  // in the DOM yet at mount time. Wait a tick for the full tree to flush.
  await nextTick()

  // A reading band just below the sticky bar (top ~64px) down to mid-viewport.
  // A section is "active" while it crosses that band; scrolling advances the
  // mark from one section to the next.
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        visible.set(entry.target.id, entry.isIntersecting)
      }
      recomputeActive()
    },
    { rootMargin: '-64px 0px -66% 0px', threshold: 0 },
  )
  for (const item of navItems) {
    const el = document.getElementById(item.id)
    if (el) {
      observer.observe(el)
    }
  }
})

onBeforeUnmount(() => observer?.disconnect())

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
      <router-link
        v-for="item in navItems"
        :key="item.id"
        :to="{ hash: `#${item.id}` }"
        class="landing-topnav__link"
        :class="{ 'landing-topnav__link--active': activeId === item.id }"
        :aria-current="activeId === item.id ? 'true' : undefined"
      >
        <span class="landing-topnav__link-label">{{ item.label }}</span>
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

// Active-section highlighter (effects kit, FIG.03). Chartreuse is ground here,
// never a thin figure: the swipe sits behind the label as a highlighter band,
// the label ink stays on top. `--bc-swipe` is a full chartreuse swipe on light
// and a faint chartreuse ground on dark, so the same rule reads on both.
.landing-topnav__link {
  position: relative;
  // Own stacking context so the negative-z swipe stays behind the label but
  // never falls behind the nav bar itself.
  isolation: isolate;
  padding: 0.2rem 0.35rem;
  border-radius: var(--bc-radius-xs);

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    background: var(--bc-swipe);
    transform: scaleX(0);
    transform-origin: left center;
    opacity: 0;
    transition:
      transform var(--bc-duration-slow) var(--bc-ease),
      opacity var(--bc-duration-base) var(--bc-ease);
  }

  // Hover previews a fainter swipe (the active section shows the full mark).
  &:hover::before {
    transform: scaleX(1);
    opacity: 0.5;
  }

  &--active {
    // Navy/ink label on the chartreuse ground for contrast on light.
    color: var(--bs-body-color);

    &::before {
      transform: scaleX(1);
      opacity: 1;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .landing-topnav__link::before {
    transition: none;
  }
}
</style>
