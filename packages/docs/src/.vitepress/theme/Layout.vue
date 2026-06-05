<script setup lang="ts">
import { computed, ref, onMounted, watchEffect } from 'vue'
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import {
  NavigationMarketingBar,
  NavigationDocsBar,
  NavigationCommandBar,
  NavigationSectionDropdown,
} from '@blueprint-chart/ui'
import { useCurrentSection } from './use-current-section'
import { useDocsTheme, type DocsThemeMode } from './use-docs-theme'
import DocFeedback from './components/DocFeedback.vue'
import IPhSun from '~icons/ph/sun'
import IPhMoon from '~icons/ph/moon'
import IPhCircleHalf from '~icons/ph/circle-half'
import IPhGithubLogo from '~icons/ph/github-logo'
import IPhList from '~icons/ph/list'
import { useMediaQuery } from '@vueuse/core'

defineOptions({ name: 'DocsLayout' })

const { Layout } = DefaultTheme
const { frontmatter } = useData()
const { theme, resolvedTheme, cycleTheme } = useDocsTheme()

const isHome = computed(() => frontmatter.value.layout === 'home')

watchEffect(() => {
  if (typeof document === 'undefined') {
    return
  }
  document.documentElement.style.setProperty(
    '--vp-nav-height',
    isHome.value ? '60px' : '44px',
  )
})

const iconByTheme: Record<DocsThemeMode, typeof IPhSun> = {
  light: IPhSun,
  dark: IPhMoon,
  auto: IPhCircleHalf,
}
const themeIcon = computed(() => iconByTheme[theme.value])

const themeLabel = computed(() => {
  if (theme.value === 'light') {
    return 'Switch to dark theme'
  }
  if (theme.value === 'dark') {
    return 'Switch to auto theme'
  }
  return 'Switch to light theme'
})

const logoSrc = computed(() =>
  resolvedTheme.value === 'dark' ? '/logo-dark.svg' : '/logo.svg',
)

function goEditor() {
  if (typeof window !== 'undefined') {
    window.open('https://blueprintchart.com', '_blank', 'noopener')
  }
}

const shortcutLabel = ref('⌘ K')
onMounted(() => {
  if (typeof navigator === 'undefined') {
    return
  }
  const isMac = /Mac|iPhone|iPod|iPad/i.test(navigator.platform)
  shortcutLabel.value = isMac ? '⌘ K' : 'Ctrl K'
})

function openSearch() {
  if (typeof document === 'undefined') {
    return
  }
  // VPNavBarSearch renders `#local-search > button`; clicking it sets
  // `showSearch = true` directly — no keyboard-event indirection.
  document.querySelector<HTMLElement>('#local-search button')?.click()
}

const isNarrow = useMediaQuery('(max-width: 959.98px)')
const { sections, current } = useCurrentSection()

function openSidebar() {
  if (typeof document === 'undefined') {
    return
  }
  // VPLocalNav renders a `.menu` button whose click handler ultimately flips
  // VP's `isSidebarOpen` ref (shared with VPSidebar). VPLocalNav is hidden
  // visually by our Layout overrides; the click event still fires on a
  // `display: none` element, which is enough to toggle the sidebar.
  const menuBtn = document.querySelector<HTMLElement>('.VPLocalNav .menu')
  menuBtn?.click()
}
</script>

<template>
  <NavigationMarketingBar
    v-if="isHome"
    class="docs-nav docs-nav--marketing"
  >
    <template #brand>
      <a
        href="/"
        class="docs-brand"
      >
        <img
          :src="logoSrc"
          alt=""
          class="docs-brand__logo"
        >
        <span class="docs-brand__name">Blueprint Chart</span>
      </a>
    </template>
    <template #menu>
      <a href="/guide/getting-started">Guide</a>
      <a href="/charts/">Charts</a>
      <a href="/handbook/">Handbook</a>
      <a href="/reference/">Reference</a>
    </template>
    <template #actions>
      <NavigationCommandBar
        class="docs-search"
        placeholder="Search docs…"
        :shortcut-label="shortcutLabel"
        :collapsed="isNarrow"
        @click="openSearch"
      />
      <a
        class="docs-btn-outline docs-github"
        href="https://github.com/blueprint-chart/blueprint-chart"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub repository"
      >
        <IPhGithubLogo
          class="docs-btn-outline__icon"
          aria-hidden="true"
        />
        GitHub
      </a>
      <button
        class="docs-btn-outline docs-btn-outline--square"
        type="button"
        :aria-label="themeLabel"
        @click="cycleTheme"
      >
        <component
          :is="themeIcon"
          class="docs-btn-outline__icon"
          aria-hidden="true"
        />
      </button>
    </template>
  </NavigationMarketingBar>

  <NavigationDocsBar
    v-else
    class="docs-nav docs-nav--slim"
  >
    <template
      v-if="isNarrow"
      #brand
    >
      <button
        class="docs-btn-outline docs-btn-outline--sm docs-btn-outline--square"
        type="button"
        aria-label="Open navigation"
        @click="openSidebar"
      >
        <IPhList
          class="docs-btn-outline__icon"
          aria-hidden="true"
        />
      </button>
      <a
        href="/"
        class="docs-brand docs-brand--slim"
      >
        <img
          :src="logoSrc"
          alt=""
          class="docs-brand__logo docs-brand__logo--slim"
        >
        <span class="docs-brand__name">Blueprint Chart</span>
      </a>
    </template>
    <template #actions>
      <NavigationCommandBar
        class="docs-search docs-search--slim"
        placeholder="Search docs…"
        :shortcut-label="shortcutLabel"
        :collapsed="isNarrow"
        @click="openSearch"
      />
    </template>
    <template #cta-primary>
      <button
        class="docs-btn-primary docs-btn-primary--sm"
        type="button"
        @click="goEditor"
      >
        Open editor <span aria-hidden="true">↗</span>
      </button>
    </template>
    <template #cta-secondary>
      <a
        class="docs-btn-outline docs-btn-outline--sm docs-github"
        href="https://github.com/blueprint-chart/blueprint-chart"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub repository"
      >
        <IPhGithubLogo
          class="docs-btn-outline__icon"
          aria-hidden="true"
        />
        GitHub
      </a>
      <button
        class="docs-btn-outline docs-btn-outline--sm docs-btn-outline--square"
        type="button"
        :aria-label="themeLabel"
        @click="cycleTheme"
      >
        <component
          :is="themeIcon"
          class="docs-btn-outline__icon"
          aria-hidden="true"
        />
      </button>
    </template>
  </NavigationDocsBar>

  <Layout>
    <template
      v-if="!isHome"
      #sidebar-nav-before
    >
      <a
        href="/"
        class="docs-sidebar-brand"
        aria-label="Blueprint Chart home"
      >
        <img
          :src="logoSrc"
          alt=""
          class="docs-sidebar-brand__logo"
        >
        <span class="docs-sidebar-brand__name">Blueprint Chart</span>
      </a>
      <NavigationSectionDropdown
        class="docs-sidebar-switcher"
        :sections="sections"
        :active-link="current?.link"
        trigger-label="Switch section"
      />
    </template>

    <template
      v-if="!isHome"
      #doc-after
    >
      <DocFeedback />
    </template>
  </Layout>
</template>

<style>
/* Global — not scoped — so it reaches VP's own elements.
 * VPNav and VPLocalNav are both hidden visually; our own NavigationDocsBar
 * is the only visible top chrome. VPLocalNav's `.menu` button stays in the
 * DOM so we can dispatch a synthetic click to open the sidebar. */
.VPNav,
.VPLocalNav { display: none !important; }

/* Fixed-position nav matches VP's default behavior — page content already
 * reserves --vp-nav-height of padding-top. */
.docs-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--vp-z-index-nav, 10);
}

/* At wide viewports the inner slim nav starts where the sidebar ends. */
@media (min-width: 960px) {
  .docs-nav--slim { left: var(--vp-sidebar-width, 272px); }
}

/* Reserve space for the fixed nav on narrow viewports. VPContent only adds
 * padding-top at >=960px (its own scoped rule); below that it would slide
 * under our fixed docs-nav. We restore the offset so the nav stays sticky
 * at the top without obscuring page content. */
@media (max-width: 959.98px) {
  .VPContent { padding-top: var(--vp-nav-height); }
}

/* Narrow viewports: search jumps after the spacer but BEFORE the cta slots —
 * lands on the right of the navbar, immediately followed by Open editor +
 * GitHub + theme. Wide viewports keep the natural DOM order (search on the
 * left). Specificity 0,3,0 beats NavigationDocsBar's scoped (0,2,0). */
@media (max-width: 959.98px) {
  .docs-nav.docs-nav--slim .navigation-docs-bar__actions { order: 1; }
  .docs-nav.docs-nav--slim .navigation-docs-bar__cta-primary { order: 2; }
  .docs-nav.docs-nav--slim .navigation-docs-bar__cta-secondary { order: 3; }

  /* GitHub link drops out at narrow widths to make room for search + theme.
   * Chain `.docs-btn-outline.docs-github` (0,3,0) so we beat the scoped
   * `.docs-btn-outline[data-v-...] { display: inline-flex }` (0,2,0). */
  .docs-nav .docs-btn-outline.docs-github { display: none; }
}

/* Brand block injected at the top of the VitePress sidebar. */
.docs-sidebar-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1.5rem 1rem;
  color: var(--bs-body-color);
  text-decoration: none;
  font-weight: 600;
  font-size: var(--bs-font-size-sm);
  white-space: nowrap;
}
.docs-sidebar-brand:hover { color: var(--bs-body-color); text-decoration: none; }
.docs-sidebar-brand__logo {
  height: 1.125rem;
  width: auto;
  display: block;
}

/* Section switcher — matches sidebar item width (no horizontal margin so it
 * spans the same column as VPSidebarItem pills, sized by .VPSidebar's
 * `padding-left/right: 0.375rem`). More breathing room above the brand,
 * tight to the first group below. */
.docs-sidebar-switcher {
  margin: 1rem 0 0.25rem;
}
</style>

<style scoped>
.docs-brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--vp-c-text-1);
  text-decoration: none;
  white-space: nowrap;
}
.docs-brand__logo {
  height: 1.5rem;
  width: auto;
  display: block;
}
.docs-brand__logo--slim {
  height: 1.125rem;
}
.docs-brand__name {
  font-family: var(--vp-font-family-base);
  font-weight: 600;
  font-size: var(--bs-font-size-md);
}
.docs-brand--slim .docs-brand__name {
  font-size: var(--bs-font-size-sm);
}

/* Outline button — mirrors editor's .btn-outline-secondary chrome:
 * subtle wash + hairline border + hairline hover. */
.docs-btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  height: 2rem;
  padding: 0 0.6rem;
  border-radius: 0.375rem;
  border: 1px solid var(--bc-hairline, rgba(0, 0, 0, 0.08));
  background: var(--bc-wash-soft, rgba(0, 0, 0, 0.04));
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-base);
  font-size: var(--bs-font-size-sm);
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background var(--bc-duration-base, 150ms) var(--bc-ease, ease),
    border-color var(--bc-duration-base, 150ms) var(--bc-ease, ease),
    color var(--bc-duration-base, 150ms) var(--bc-ease, ease);
}
.docs-btn-outline:hover {
  background: var(--bc-wash-firm, rgba(0, 0, 0, 0.06));
  border-color: var(--bc-hairline-strong, rgba(0, 0, 0, 0.14));
  color: var(--vp-c-text-1);
  text-decoration: none;
}
.docs-btn-outline--sm {
  height: 1.75rem;
  padding: 0 0.5rem;
}
.docs-btn-outline--square {
  width: 2rem;
  padding: 0;
  justify-content: center;
}
.docs-btn-outline--sm.docs-btn-outline--square {
  width: 1.75rem;
}
.docs-btn-outline__icon {
  width: 1rem;
  height: 1rem;
  display: block;
  flex-shrink: 0;
}

/* Primary button — Prussian-500 filled, white text, matches editor's
 * .btn-primary. */
.docs-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  height: 2rem;
  padding: 0 0.85rem;
  border-radius: 0.375rem;
  border: 1px solid var(--vp-c-brand-1);
  background: var(--vp-c-brand-1);
  color: #fff;
  font-family: var(--vp-font-family-base);
  font-size: var(--bs-font-size-sm);
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  text-decoration: none;
  transition:
    background var(--bc-duration-base, 150ms) var(--bc-ease, ease),
    border-color var(--bc-duration-base, 150ms) var(--bc-ease, ease);
}
.docs-btn-primary:hover {
  background: var(--vp-c-brand-2);
  border-color: var(--vp-c-brand-2);
}
.docs-btn-primary--sm {
  height: 1.75rem;
  padding: 0 0.7rem;
}
</style>
