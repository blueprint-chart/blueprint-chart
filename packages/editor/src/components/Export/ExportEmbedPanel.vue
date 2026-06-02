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
    <div
      v-if="canPublish"
      class="export-embed-panel__publish"
    >
      <hr>
      <div class="export-embed-panel__publish-head">
        <span class="export-embed-panel__code-block__label">Publish a live link</span>
        <button
          type="button"
          class="btn btn-sm"
          :class="published ? 'btn-outline-danger' : 'btn-primary'"
          :disabled="publishing"
          @click="onTogglePublish"
        >
          {{ publishing ? '…' : published ? 'Unpublish' : 'Publish' }}
        </button>
      </div>
      <p class="export-embed-panel__info">
        Publishing hosts this chart at a short id. Edits you make later update the embed everywhere. Base64 links above stay self-contained and are unaffected.
      </p>
      <template v-if="published">
        <div class="export-embed-panel__code-block">
          <div class="export-embed-panel__code-block__header">
            <span class="export-embed-panel__code-block__label">Live embed</span>
            <ActionCopyButton
              :text="idEmbedSnippet"
              label="Copy"
              variant="outline-secondary"
              size="sm"
            />
          </div>
          <pre class="export-embed-panel__code-block__pre"><code>{{ idEmbedSnippet }}</code></pre>
        </div>
        <ActionCopyButton
          :text="editablePermalink"
          label="Copy editable permalink"
          variant="outline-secondary"
          size="sm"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ActionCopyButton } from '@blueprint-chart/ui'
import { useChartConfig } from '@/stores/chartConfig'
import { useAccount } from '@/stores/account'
import { useCloudCharts } from '@/stores/cloudCharts'
import { useChartSession } from '@/stores/chartSession'
import { accountsEnabled } from '@/config/runtimeConfig'

const { dsl, generateDsl } = useDslOutput()
const { layout } = useChartConfig()

const { isSignedIn } = useAccount()
const { sessionId } = useChartSession()
const { publish, isCloudBacked, isPublished } = useCloudCharts()

// Only a chart that actually has a cloud row can be published — otherwise the
// UPDATE matches zero rows and we'd surface a dead ?id= permalink.
const canPublish = computed(() => accountsEnabled() && isSignedIn.value && isCloudBacked(sessionId.value))
const published = ref(false)
const publishing = ref(false)

// Seed the toggle from the server so an already-published chart shows Unpublish
// and its live embed, rather than defaulting to the unpublished state.
onMounted(async () => {
  if (canPublish.value) {
    published.value = await isPublished(sessionId.value)
  }
})

const baseUrl = computed(() => `${window.location.origin}${window.location.pathname}`)

// Iframe sizing attributes derived from the chart layout — shared by the base64
// and id-based embed snippets so the two stay in lockstep.
const sizeAttrs = computed(() => {
  const l = toRaw(layout.value)
  const height = l.heightMode === 'fixed' ? l.fixedHeight : 400
  if (l.sizing === 'responsive') {
    return `width="100%" height="${height}"`
  }
  if (l.sizing === 'max-width') {
    return `style="width:100%;max-width:${l.maxWidth}px" height="${height}"`
  }
  return `width="${l.fixedWidth}" height="${height}"`
})

const idEmbedSnippet = computed(() =>
  `<iframe src="${baseUrl.value}#/render?id=${sessionId.value}" ${sizeAttrs.value} frameborder="0"></iframe>`,
)
const editablePermalink = computed(() => `${baseUrl.value}#/edit/${sessionId.value}`)

async function onTogglePublish() {
  publishing.value = true
  const ok = await publish(sessionId.value, !published.value)
  if (ok) {
    published.value = !published.value
  }
  publishing.value = false
}

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
  return `${baseUrl.value}#/render?bpc64=${encodeURIComponent(bpc64)}`
})

const iframeSnippet = computed(() =>
  `<iframe src="${renderUrl.value}" ${sizeAttrs.value} frameborder="0"></iframe>`,
)
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
