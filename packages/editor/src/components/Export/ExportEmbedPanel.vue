<template>
  <div class="export-embed-panel">
    <div class="export-embed-panel__code-block">
      <div class="export-embed-panel__code-block__header">
        <span class="export-embed-panel__code-block__label">Embed code</span>
        <ActionCopyButton
          :text="iframeSnippet"
          label="Copy"
          variant="outline-secondary"
          size="sm"
        />
      </div>
      <pre class="export-embed-panel__code-block__pre"><code>{{ iframeSnippet }}</code></pre>
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
import { ActionCopyButton } from '@blueprint-chart/ui'
import { useChartConfig } from '@/stores/chartConfig'

const { dsl, generateDsl } = useDslOutput()
const { layout } = useChartConfig()

// btoa only handles Latin-1 (code points 0–255). Encode as UTF-8 bytes first
// so multi-byte characters (e.g. em-dash U+2014) don't throw InvalidCharacterError.
function toBase64(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return globalThis.btoa(binary)
}

const renderUrl = computed(() => {
  const bpc64 = toBase64(dsl.value || generateDsl())
  return `${window.location.origin}${window.location.pathname}#/render?bpc64=${encodeURIComponent(bpc64)}`
})

const iframeSnippet = computed(() => {
  const l = toRaw(layout.value)
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

    &__header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      background: var(--bc-tile-bg-elevated);
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
  }

  &__link {
    font-size: var(--bs-font-size-sm);
    color: var(--bs-link-color);
    text-decoration: underline;
    text-align: center;
  }
}
</style>
