<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import { NavigationMarketingBar, NavigationDocsBar } from '@blueprint-chart/ui'

const { Layout } = DefaultTheme
const { frontmatter } = useData()

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
          class="docs-icon-btn"
          href="https://github.com/blueprint-chart/blueprint-chart"
          target="_blank"
          rel="noopener"
          aria-label="GitHub"
        >⌂</a>
      </template>
      <template #cta-primary>
        <button class="btn btn-primary docs-cta" @click="goEditor">
          Open editor ↗
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
          class="docs-icon-btn"
          href="https://github.com/blueprint-chart/blueprint-chart"
          target="_blank"
          rel="noopener"
          aria-label="GitHub"
        >⌂</a>
      </template>
      <template #cta>
        <button class="btn btn-primary btn-sm docs-cta" @click="goEditor">
          Open editor ↗
        </button>
      </template>
    </NavigationDocsBar>

  <Layout />
</template>

<style>
/* Global — not scoped — so it reaches VP's own elements. */
.VPNav { display: none !important; }

.docs-nav {
  position: sticky;
  top: 0;
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
.docs-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  text-decoration: none;
}
.docs-cta {
  font-size: var(--bs-font-size-sm);
}
</style>
