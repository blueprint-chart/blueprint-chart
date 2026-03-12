<template>
  <div class="export-embed-panel">
    <div class="export-embed-panel__code-block">
      <div class="export-embed-panel__header">
        <span class="export-embed-panel__label">Embed code</span>
        <ActionCopyButton
          :text="iframeSnippet"
          label="Copy"
          variant="outline-secondary"
          size="sm"
        />
      </div>
      <pre class="export-embed-panel__pre"><code>{{ iframeSnippet }}</code></pre>
    </div>
    <div class="export-embed-panel__info">
      Paste this iframe into your HTML page. The chart renders automatically.
    </div>
    <ActionCopyButton
      :text="iframeSnippet"
      label="Copy embed code"
      variant="primary"
      size="sm"
    />
    <a
      :href="renderUrl"
      target="_blank"
      rel="noopener"
      class="export-embed-panel__link"
    >
      Preview in new tab
    </a>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ActionCopyButton } from '@blueprint-chart/ui'
import { useDslOutput } from '@/composables/useDslOutput'
import { useChartConfig } from '@/composables/useChartConfig'

const { dsl } = useDslOutput()
const { layout } = useChartConfig()

const renderUrl = computed(() => {
  const bpc64 = globalThis.btoa(dsl.value)
  return `${window.location.origin}${window.location.pathname}#/render?bpc64=${encodeURIComponent(bpc64)}`
})

const iframeSnippet = computed(() => {
  const l = layout.value
  const height = l.heightMode === 'fixed' ? l.fixedHeight : 400
  const parts: string[] = []

  if (l.sizing === 'responsive') {
    parts.push(`width="100%" height="${height}"`)
  }
  else if (l.sizing === 'max-width') {
    parts.push(`style="width:100%;max-width:${l.maxWidth}px" height="${height}"`)
  }
  else {
    parts.push(`width="${l.fixedWidth}" height="${height}"`)
  }

  return `<iframe src="${renderUrl.value}" ${parts.join(' ')} frameborder="0"></iframe>`
})
</script>

<style scoped lang="scss">
.export-embed-panel {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  &__info {
    font-size: var(--bs-font-size-sm);
    color: var(--bs-secondary-color);
    line-height: 1.5;
  }

  &__code-block {
    border: 1px solid var(--bs-border-color);
    border-radius: var(--bs-border-radius);
    overflow: hidden;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: var(--bs-tertiary-bg);
    border-bottom: 1px solid var(--bs-border-color);
  }

  &__label {
    flex: 1;
    font-size: var(--bs-body-font-size);
    font-weight: 600;
    color: var(--bs-body-color);
  }

  &__pre {
    margin: 0;
    padding: 0.75rem;
    line-height: 1.5;
    overflow-x: auto;
    background: var(--bs-body-bg);
    color: var(--bs-body-color);
    white-space: pre;

    code {
      font-size: var(--bs-body-font-size-sm);
    }
  }

  &__link {
    font-size: var(--bs-font-size-sm);
    color: var(--bs-link-color);
    text-decoration: underline;
    text-align: center;
  }
}
</style>
