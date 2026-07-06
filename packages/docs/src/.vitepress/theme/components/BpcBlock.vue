<script setup lang="ts">
// Blueprint Chart — Code/Preview tab wrapper for ```bpc fences.
//
// The markdown-it `bpc-fence` rule injects this component around the
// default Shiki-highlighted code block. We expose two tabs:
//
//   - Code     : the original highlighted HTML (passed via default slot)
//   - Preview  : a client-only live render of the BPC fragment
//
// We probe the source at mount with `parse()` to decide whether the
// Preview tab and "Open in editor" affordance should be shown — partial
// or syntactically-invalid fragments stay code-only.

import { computed, ref, onMounted, defineAsyncComponent } from 'vue'

const props = defineProps<{
  /** URL-safe base64-encoded BPC source (injected by the fence rule). */
  sourceB64: string
  /** Optional caption shown in the footer (e.g. a source path). */
  caption?: string
}>()

const BpcPreview = defineAsyncComponent(() => import('./BpcPreview.vue'))

const activeTab = ref<'code' | 'preview'>('code')
const canPreview = ref(false)
const parseChecked = ref(false)

/** Decode the base64 attribute in both browser (atob) and SSR (Buffer) environments. */
function decodeB64(b64: string): string {
  if (typeof globalThis !== 'undefined' && typeof (globalThis as { Buffer?: unknown }).Buffer !== 'undefined') {
    // Node / SSR
    const BufferRef = (globalThis as { Buffer: { from: (s: string, enc: string) => { toString: (enc: string) => string } } }).Buffer
    return BufferRef.from(b64, 'base64').toString('utf-8')
  }
  // Browser
  const binary = globalThis.atob(b64)
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

const source = computed(() => {
  try {
    return decodeB64(props.sourceB64)
  }
  catch {
    return ''
  }
})

/** RFC 4648 URL-safe base64 (no padding) for the editor round-trip. */
function toUrlSafeB64(input: string): string {
  let std: string
  if (typeof globalThis !== 'undefined' && typeof (globalThis as { Buffer?: unknown }).Buffer !== 'undefined') {
    const BufferRef = (globalThis as { Buffer: { from: (s: string, enc: string) => { toString: (enc: string) => string } } }).Buffer
    std = BufferRef.from(input, 'utf-8').toString('base64')
  }
  else {
    const bytes = new TextEncoder().encode(input)
    let binary = ''
    for (const b of bytes) {
      binary += String.fromCharCode(b)
    }
    std = globalThis.btoa(binary)
  }
  return std.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const editorUrl = computed(() => {
  if (!source.value) {
    return ''
  }
  return `https://blueprintchart.com/#/copy?bpc64=${encodeURIComponent(toUrlSafeB64(source.value))}`
})

onMounted(async () => {
  // Probe parseability on the client only — `parse` ships ESM with side
  // effects from the chart registry, which doesn't SSR cleanly. If the
  // source fails to parse (e.g. a snippet showing just a `data` block),
  // we keep the Preview tab hidden.
  try {
    const { parse } = await import('@blueprint-chart/lib')
    parse(source.value)
    canPreview.value = true
  }
  catch {
    canPreview.value = false
  }
  finally {
    parseChecked.value = true
  }
})

function activate(tab: 'code' | 'preview') {
  if (tab === 'preview' && !canPreview.value) {
    return
  }
  activeTab.value = tab
}
</script>

<template>
  <div
    class="bpc-block"
    :class="{ 'bpc-block--code-only': parseChecked && !canPreview }"
  >
    <div
      v-if="canPreview"
      class="bpc-block__tabs"
      role="tablist"
      aria-label="View mode"
    >
      <button
        type="button"
        role="tab"
        class="bpc-block__tab"
        :class="{ 'is-active': activeTab === 'code' }"
        :aria-selected="activeTab === 'code'"
        @click="activate('code')"
      >
        Code
      </button>
      <button
        type="button"
        role="tab"
        class="bpc-block__tab"
        :class="{ 'is-active': activeTab === 'preview' }"
        :aria-selected="activeTab === 'preview'"
        :disabled="!canPreview"
        @click="activate('preview')"
      >
        Preview
      </button>
    </div>

    <div class="bpc-block__body">
      <div
        v-show="activeTab === 'code'"
        class="bpc-block__code"
      >
        <slot />
      </div>

      <div
        v-if="canPreview"
        v-show="activeTab === 'preview'"
        class="bpc-block__preview"
      >
        <ClientOnly>
          <BpcPreview
            :source="source"
            :active="activeTab === 'preview'"
          />
        </ClientOnly>
      </div>
    </div>

    <div
      v-if="canPreview || caption"
      class="bpc-block__footer"
    >
      <span
        v-if="caption"
        class="bpc-block__caption"
      >{{ caption }}</span>
      <a
        v-if="canPreview"
        class="bpc-block__editor-link"
        :href="editorUrl"
        target="_blank"
        rel="noopener noreferrer"
      >
        Open in editor
        <span
          aria-hidden="true"
          class="bpc-block__editor-link__glyph"
        >→</span>
      </a>
    </div>
  </div>
</template>
