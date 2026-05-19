<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import { NavigationMarketingBar, NavigationDocsBar } from '@blueprint-chart/ui'

const { Layout } = DefaultTheme
const { frontmatter, isDark } = useData()

const isHome = computed(() => frontmatter.value.layout === 'home')

watchEffect(() => {
  if (typeof document === 'undefined') return
  document.documentElement.style.setProperty(
    '--vp-nav-height',
    isHome.value ? '60px' : '44px',
  )
})

function goEditor() {
  if (typeof window !== 'undefined') {
    window.open('https://blueprintchart.com', '_blank', 'noopener')
  }
}

function toggleTheme() {
  // useData().isDark is a writable ref in VitePress 1.x; toggling it updates
  // the .dark class on <html> and persists to localStorage.
  isDark.value = !isDark.value
}
</script>

<template>
  <NavigationMarketingBar v-if="isHome" class="docs-nav docs-nav--marketing">
    <template #brand>
      <a href="/" class="docs-brand">
        <img src="/logo.svg" alt="" class="docs-brand__logo">
        <span class="docs-brand__name">Blueprint Chart</span>
      </a>
    </template>
    <template #menu>
      <a href="/guide/getting-started">Guide</a>
      <a href="/charts/">Charts</a>
      <a href="/handbook/">Handbook</a>
      <a href="/spec/dsl">DSL Spec</a>
      <a href="/api/">API</a>
    </template>
    <template #actions>
      <a
        class="docs-btn-outline docs-github"
        href="https://github.com/blueprint-chart/blueprint-chart"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub repository"
      >
        <svg
          class="docs-btn-outline__icon"
          viewBox="0 0 16 16"
          aria-hidden="true"
        ><path
          fill="currentColor"
          d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"
        /></svg>
        GitHub
      </a>
      <button
        class="docs-btn-outline docs-btn-outline--square"
        type="button"
        :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
        @click="toggleTheme"
      >
        <svg
          v-if="isDark"
          class="docs-btn-outline__icon"
          viewBox="0 0 256 256"
          aria-hidden="true"
        ><path
          fill="currentColor"
          d="M120 40V16a8 8 0 0 1 16 0v24a8 8 0 0 1-16 0Zm72 88a64 64 0 1 1-64-64 64.07 64.07 0 0 1 64 64Zm-16 0a48 48 0 1 0-48 48 48.05 48.05 0 0 0 48-48Zm-89.66-77.66a8 8 0 0 0 11.32-11.32l-16-16a8 8 0 0 0-11.32 11.32Zm128 5.66a8 8 0 0 0 5.66-2.34l16-16a8 8 0 0 0-11.32-11.32l-16 16a8 8 0 0 0 5.66 13.66ZM40 136H16a8 8 0 0 0 0 16h24a8 8 0 0 0 0-16Zm89.66 77.66a8 8 0 0 0-11.32 11.32l16 16a8 8 0 0 0 11.32-11.32Zm133.66-37.66l-16-16a8 8 0 0 0-11.32 11.32l16 16a8 8 0 0 0 11.32-11.32ZM248 136h-24a8 8 0 0 0 0 16h24a8 8 0 0 0 0-16Zm-120 72a8 8 0 0 0-8 8v24a8 8 0 0 0 16 0v-24a8 8 0 0 0-8-8Zm98.34-30.34a8 8 0 0 0-11.32 11.32l16 16a8 8 0 0 0 11.32-11.32Z"
        /></svg>
        <svg
          v-else
          class="docs-btn-outline__icon"
          viewBox="0 0 256 256"
          aria-hidden="true"
        ><path
          fill="currentColor"
          d="M233.54 142.23a8 8 0 0 0-8-2 88.08 88.08 0 0 1-109.8-109.8 8 8 0 0 0-10-10 104.84 104.84 0 0 0-52.91 37A104 104 0 0 0 136 224a103.09 103.09 0 0 0 62.52-20.88 104.84 104.84 0 0 0 37-52.91 8 8 0 0 0-1.98-7.98Zm-44.64 48.11A88 88 0 0 1 65.66 67.11a89 89 0 0 1 31.4-26A106 106 0 0 0 96 56a104.11 104.11 0 0 0 104 104 106 106 0 0 0 14.92-1.06 89 89 0 0 1-26.02 31.4Z"
        /></svg>
      </button>
    </template>
    <template #cta-primary>
      <button class="docs-btn-primary" type="button" @click="goEditor">
        Open editor <span aria-hidden="true">↗</span>
      </button>
    </template>
  </NavigationMarketingBar>

  <NavigationDocsBar v-else class="docs-nav docs-nav--slim">
    <template #brand>
      <a href="/" class="docs-brand docs-brand--slim">
        <img src="/logo.svg" alt="" class="docs-brand__logo docs-brand__logo--slim">
        <span class="docs-brand__name">Blueprint Chart</span>
      </a>
    </template>
    <template #actions>
      <a
        class="docs-btn-outline docs-btn-outline--sm docs-github"
        href="https://github.com/blueprint-chart/blueprint-chart"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub repository"
      >
        <svg
          class="docs-btn-outline__icon"
          viewBox="0 0 16 16"
          aria-hidden="true"
        ><path
          fill="currentColor"
          d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"
        /></svg>
        GitHub
      </a>
      <button
        class="docs-btn-outline docs-btn-outline--sm docs-btn-outline--square"
        type="button"
        :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
        @click="toggleTheme"
      >
        <svg
          v-if="isDark"
          class="docs-btn-outline__icon"
          viewBox="0 0 256 256"
          aria-hidden="true"
        ><path
          fill="currentColor"
          d="M120 40V16a8 8 0 0 1 16 0v24a8 8 0 0 1-16 0Zm72 88a64 64 0 1 1-64-64 64.07 64.07 0 0 1 64 64Zm-16 0a48 48 0 1 0-48 48 48.05 48.05 0 0 0 48-48Zm-89.66-77.66a8 8 0 0 0 11.32-11.32l-16-16a8 8 0 0 0-11.32 11.32Zm128 5.66a8 8 0 0 0 5.66-2.34l16-16a8 8 0 0 0-11.32-11.32l-16 16a8 8 0 0 0 5.66 13.66ZM40 136H16a8 8 0 0 0 0 16h24a8 8 0 0 0 0-16Zm89.66 77.66a8 8 0 0 0-11.32 11.32l16 16a8 8 0 0 0 11.32-11.32Zm133.66-37.66l-16-16a8 8 0 0 0-11.32 11.32l16 16a8 8 0 0 0 11.32-11.32ZM248 136h-24a8 8 0 0 0 0 16h24a8 8 0 0 0 0-16Zm-120 72a8 8 0 0 0-8 8v24a8 8 0 0 0 16 0v-24a8 8 0 0 0-8-8Zm98.34-30.34a8 8 0 0 0-11.32 11.32l16 16a8 8 0 0 0 11.32-11.32Z"
        /></svg>
        <svg
          v-else
          class="docs-btn-outline__icon"
          viewBox="0 0 256 256"
          aria-hidden="true"
        ><path
          fill="currentColor"
          d="M233.54 142.23a8 8 0 0 0-8-2 88.08 88.08 0 0 1-109.8-109.8 8 8 0 0 0-10-10 104.84 104.84 0 0 0-52.91 37A104 104 0 0 0 136 224a103.09 103.09 0 0 0 62.52-20.88 104.84 104.84 0 0 0 37-52.91 8 8 0 0 0-1.98-7.98Zm-44.64 48.11A88 88 0 0 1 65.66 67.11a89 89 0 0 1 31.4-26A106 106 0 0 0 96 56a104.11 104.11 0 0 0 104 104 106 106 0 0 0 14.92-1.06 89 89 0 0 1-26.02 31.4Z"
        /></svg>
      </button>
    </template>
    <template #cta-primary>
      <button class="docs-btn-primary docs-btn-primary--sm" type="button" @click="goEditor">
        Open editor <span aria-hidden="true">↗</span>
      </button>
    </template>
  </NavigationDocsBar>

  <Layout />
</template>

<style>
/* Global — not scoped — so it reaches VP's own elements. */
.VPNav { display: none !important; }

/* Fixed-position nav matches VP's default behavior — page content already
 * reserves --vp-nav-height of padding-top. */
.docs-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--vp-z-index-nav, 10);
}
</style>

<style scoped>
.docs-brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--vp-c-text-1);
  text-decoration: none;
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
