<template>
  <div class="export-embed-panel">
    <!-- Live link leads once the chart can use it -->
    <template v-if="state === 'published'">
      <ExportEmbedBlock
        label="Live link"
        recommended
        emphasis="primary"
        :note="LIVE_NOTE_PUBLISHED"
        :snippet="liveSnippet"
        :permalink="liveRenderUrl"
        copy-embed-label="Copy live embed"
      >
        <template #header-action>
          <button
            type="button"
            class="btn btn-sm export-embed-panel__unpublish"
            :disabled="publishing"
            @click="onTogglePublish"
          >
            {{ publishing ? '…' : 'Unpublish' }}
          </button>
        </template>
      </ExportEmbedBlock>
      <hr>
      <ExportEmbedBlock
        label="Or use a self-contained copy"
        :note="SELF_NOTE_SECONDARY"
        :snippet="selfSnippet"
        :permalink="selfRenderUrl"
        copy-embed-label="Copy self-contained embed"
      />
    </template>

    <template v-else-if="state === 'not-published'">
      <div class="export-embed-panel__publish">
        <div class="export-embed-panel__publish-head">
          <span class="export-embed-panel__label">Live link</span>
          <span class="export-embed-panel__badge">Recommended</span>
        </div>
        <p class="export-embed-panel__note">
          {{ LIVE_NOTE_PUBLISH }}
        </p>
        <button
          type="button"
          class="btn btn-primary btn-sm"
          :disabled="publishing"
          @click="onTogglePublish"
        >
          {{ publishing ? '…' : 'Publish live link' }}
        </button>
      </div>
      <hr>
      <ExportEmbedBlock
        label="Or use a self-contained copy"
        :note="SELF_NOTE_SECONDARY"
        :snippet="selfSnippet"
        :permalink="selfRenderUrl"
        copy-embed-label="Copy self-contained embed"
      />
    </template>

    <!-- Self-contained leads when the live link is unavailable -->
    <template v-else>
      <ExportEmbedBlock
        label="Embed code"
        emphasis="primary"
        :note="SELF_NOTE_LEAD"
        :snippet="selfSnippet"
        :permalink="selfRenderUrl"
        copy-embed-label="Copy embed code"
      />
      <p class="export-embed-panel__hint">
        <template v-if="state === 'signed-out'">
          Want an embed that updates when you edit it?
          <a
            href="#"
            @click.prevent="openSignInModal"
          >Sign in</a>
          to publish a live link.
        </template>
        <template v-else>
          Want an embed that updates when you edit it?
          <a
            href="#"
            @click.prevent="onSave"
          >{{ saving ? 'Saving…' : 'Save this chart' }}</a>
          to publish a live link.
        </template>
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import ExportEmbedBlock from './ExportEmbedBlock.vue'
import { useChartConfig } from '@/stores/chartConfig'
import { useAccount } from '@/stores/account'
import { useCloudCharts } from '@/stores/cloudCharts'
import { useChartSession } from '@/stores/chartSession'
import { useCloudSave } from '@/composables/useCloudSave'
import { accountsEnabled } from '@/config/runtimeConfig'

const SELF_NOTE_LEAD = 'Whole chart baked into the URL. Works anywhere, no account needed.'
const SELF_NOTE_SECONDARY = 'Whole chart baked into the URL. Works anywhere with no account, but frozen, so later edits will not reach it.'
const LIVE_NOTE_PUBLISHED = 'Hosted at a short id. Edits you make later update this embed everywhere it is pasted.'
const LIVE_NOTE_PUBLISH = 'Publish to host this chart at a short id. The embed then updates everywhere whenever you edit.'

const { dsl, generateDsl } = useDslOutput()
const { layout } = useChartConfig()
const { isSignedIn, openSignInModal } = useAccount()
const { sessionId } = useChartSession()
const { publish, isCloudBacked, isPublished } = useCloudCharts()
const { saving, saveToCloud } = useCloudSave()

// isCloudBacked() reads localStorage and is NOT reactive, so we seed a local
// ref at mount and flip it ourselves after a successful save. published is
// likewise seeded from the server on mount.
const eligible = computed(() => accountsEnabled() && isSignedIn.value)
const cloudBacked = ref(false)
const published = ref(false)
const publishing = ref(false)

const state = computed<'signed-out' | 'not-saved' | 'not-published' | 'published'>(() => {
  if (!eligible.value) {
    return 'signed-out'
  }
  if (!cloudBacked.value) {
    return 'not-saved'
  }
  if (!published.value) {
    return 'not-published'
  }
  return 'published'
})

watch(
  [eligible, sessionId],
  async ([elig, id]) => {
    const backed = elig && isCloudBacked(id)
    cloudBacked.value = backed
    if (backed) {
      published.value = await isPublished(id)
    }
    else {
      published.value = false
    }
  },
  { immediate: true },
)

const baseUrl = computed(() => `${window.location.origin}${window.location.pathname}`)

// Iframe sizing attributes from the chart layout, shared by both snippets.
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

// btoa only handles Latin-1, so encode UTF-8 bytes first (em-dash etc. would
// otherwise throw InvalidCharacterError).
function toBase64(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return globalThis.btoa(binary)
}

const selfRenderUrl = computed(() => {
  const bpc64 = toBase64(dsl.value || generateDsl())
  return `${baseUrl.value}#/render?bpc64=${encodeURIComponent(bpc64)}`
})
const selfSnippet = computed(() =>
  `<iframe src="${selfRenderUrl.value}" ${sizeAttrs.value} frameborder="0"></iframe>`,
)

const liveRenderUrl = computed(() => `${baseUrl.value}#/render?id=${sessionId.value}`)
const liveSnippet = computed(() =>
  `<iframe src="${liveRenderUrl.value}" ${sizeAttrs.value} frameborder="0"></iframe>`,
)

async function onTogglePublish() {
  publishing.value = true
  const ok = await publish(sessionId.value, !published.value)
  if (ok) {
    published.value = !published.value
  }
  publishing.value = false
}

async function onSave() {
  const ok = await saveToCloud()
  if (ok) {
    cloudBacked.value = true
    published.value = false
  }
}
</script>

<style scoped lang="scss">
.export-embed-panel {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  hr {
    margin: 0.25rem 0;
    border-color: var(--bs-border-color);
  }

  &__publish {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__publish-head {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__label {
    font-size: var(--bs-font-size-md);
    font-weight: 600;
    color: var(--bs-body-color);
  }

  &__badge {
    font-size: var(--bs-font-size-xs);
    font-weight: 700;
    letter-spacing: 0.02em;
    padding: 0.125rem 0.5rem;
    border-radius: 99px;
    background: var(--bs-primary);
    color: var(--bs-white, #fff);
  }

  &__note {
    margin: 0;
    font-size: var(--bs-font-size-sm);
    color: var(--bs-secondary-color);
    line-height: 1.5;
  }

  &__unpublish {
    color: var(--bs-danger);
    border: 1px solid var(--bs-danger-border-subtle, var(--bs-border-color));
    background: var(--bs-danger-bg-subtle, transparent);

    &:hover {
      color: var(--bs-danger);
      background: var(--bs-danger-bg-subtle, transparent);
    }
  }

  &__hint {
    margin: 0;
    padding: 0.75rem;
    border: 1px dashed var(--bs-border-color);
    border-radius: var(--bs-border-radius);
    font-size: var(--bs-font-size-sm);
    color: var(--bs-secondary-color);
    line-height: 1.5;

    a {
      color: var(--bs-link-color);
      font-weight: 600;
    }
  }
}
</style>
