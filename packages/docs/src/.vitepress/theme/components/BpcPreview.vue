<script setup lang="ts">
// Blueprint Chart docs preview for a BPC fragment.
//
// Renders inside a sandboxed iframe using the same self-contained srcdoc the
// production embed uses (buildSrcdoc). The chart runtime runs inside the
// iframe's own realm, so the chart is fully isolated from the VitePress page
// CSS and every interactive feature (tooltips, scenes) is correctly scoped.
//
// We only force the chart's own light/dark theme to match the docs; the chart
// owns the actual colors (no docs colors are passed in).

// The narrow `embed` entry exposes only the srcdoc builder + message contract,
// so the docs bundle does not pull the chart engine (that runs in the iframe).
// Safe to import statically at the top level (skipped during SSR) only because
// BpcBlock.vue always renders this component inside <ClientOnly>.
import { buildSrcdoc, readResizeHeight, isErrorMessage } from '@blueprint-chart/lib/embed'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useData } from 'vitepress'
// Resolved to a fingerprinted asset URL by Vite; loaded INSIDE the iframe.
import runtimeUrl from '@blueprint-chart/lib/embed-runtime.js?url'

const props = defineProps<{
  source: string
  // True when the preview tab is active. BpcBlock owns this fact; the iframe
  // only builds its srcdoc once active so its first height measurement happens
  // while it has layout (a preview built while hidden measures at zero and the
  // resize observer never re-fires on a display:none -> block transition).
  active?: boolean
}>()

const { isDark } = useData()

const frame = ref<HTMLIFrameElement | null>(null)
const height = ref(0)
const errored = ref(false)

const srcdoc = computed(() => {
  if (!props.active || !props.source) {
    return ''
  }
  // Resolve to an absolute URL so the srcdoc iframe (opaque origin) can load it.
  const absoluteUrl = new URL(runtimeUrl, globalThis.location.href).href
  // Force only the theme; the chart supplies its own light/dark colors.
  return buildSrcdoc(props.source, absoluteUrl, isDark.value ? 'dark' : 'light')
})

function onMessage(e: MessageEvent) {
  if (!frame.value || e.source !== frame.value.contentWindow) {
    return
  }
  const measured = readResizeHeight(e.data)
  if (measured !== null) {
    errored.value = false
    height.value = measured
    return
  }
  if (isErrorMessage(e.data)) {
    errored.value = true
  }
}

onMounted(() => {
  globalThis.addEventListener('message', onMessage)
})
onBeforeUnmount(() => {
  globalThis.removeEventListener('message', onMessage)
})
</script>

<template>
  <div class="bpc-preview">
    <iframe
      ref="frame"
      class="bpc-preview__frame"
      title="Blueprint Chart preview"
      sandbox="allow-scripts"
      :srcdoc="srcdoc"
      :style="height ? { height: `${height}px` } : undefined"
    />
    <div
      v-if="errored"
      class="bpc-preview__error"
    >
      Could not render this preview. View the source instead.
    </div>
  </div>
</template>
