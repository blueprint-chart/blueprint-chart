<script setup lang="ts">
// Blueprint Chart — per-page feedback affordance.
//
// Rendered in the VitePress `doc-after` slot on every docs page. Offers a
// single "Was this page helpful?" prompt that opens a prefilled GitHub issue
// (title carries the page path). No analytics, no external services — the
// link is the entire mechanism, in keeping with the static-first design.

import { computed } from 'vue'
import { useData } from 'vitepress'
import IPhGithubLogo from '~icons/ph/github-logo'

defineOptions({ name: 'DocFeedback' })

const { page } = useData()

const issueUrl = computed(() => {
  const path = page.value.relativePath || ''
  const title = `docs feedback: ${path}`
  const body = [
    `Page: \`${path}\``,
    '',
    'What was unclear, missing, or wrong on this page?',
    '',
  ].join('\n')
  const params = new URLSearchParams({
    title,
    body,
    labels: 'docs',
  })
  return `https://github.com/blueprint-chart/blueprint-chart/issues/new?${params.toString()}`
})
</script>

<template>
  <div class="doc-feedback">
    <span class="doc-feedback__prompt">Was this page helpful?</span>
    <a
      class="doc-feedback__link"
      :href="issueUrl"
      target="_blank"
      rel="noopener noreferrer"
    >
      <IPhGithubLogo
        class="doc-feedback__icon"
        aria-hidden="true"
      />
      Open an issue
    </a>
  </div>
</template>

<style scoped>
.doc-feedback {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--vp-c-divider);
  font-size: var(--bs-font-size-sm, 0.875rem);
}
.doc-feedback__prompt {
  color: var(--vp-c-text-2);
}
.doc-feedback__link {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  height: 1.75rem;
  padding: 0 0.6rem;
  border-radius: 0.375rem;
  border: 1px solid var(--bc-hairline, rgba(0, 0, 0, 0.08));
  background: var(--bc-wash-soft, rgba(0, 0, 0, 0.04));
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-base);
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
  transition:
    background var(--bc-duration-base, 150ms) var(--bc-ease, ease),
    border-color var(--bc-duration-base, 150ms) var(--bc-ease, ease),
    color var(--bc-duration-base, 150ms) var(--bc-ease, ease);
}
.doc-feedback__link:hover {
  background: var(--bc-wash-firm, rgba(0, 0, 0, 0.06));
  border-color: var(--bc-hairline-strong, rgba(0, 0, 0, 0.14));
  color: var(--vp-c-text-1);
  text-decoration: none;
}
.doc-feedback__link:focus-visible {
  outline: 2px solid rgba(37, 99, 160, 0.45);
  outline-offset: 2px;
}
.doc-feedback__icon {
  width: 1rem;
  height: 1rem;
  display: block;
  flex-shrink: 0;
}
</style>
