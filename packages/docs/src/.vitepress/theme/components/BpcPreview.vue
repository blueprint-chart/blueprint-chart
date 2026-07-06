<script setup lang="ts">
// Blueprint Chart — docs preview for a BPC fragment.
//
// Renders inside a sandboxed iframe using the SAME self-contained srcdoc the
// production embed uses (`buildSrcdoc`). The chart runtime runs inside the
// iframe's own realm, so the chart is fully isolated from the VitePress page
// CSS and every interactive feature (tooltips, scenes) is correctly scoped.

// Safe to import statically at the top level (skipped during SSR) only because
// BpcBlock.vue always renders this component inside <ClientOnly>.
import { buildSrcdoc } from '@blueprint-chart/lib'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
// Resolved to a fingerprinted asset URL by Vite; loaded INSIDE the iframe.
import runtimeUrl from '@blueprint-chart/lib/embed-runtime.js?url'

const props = defineProps<{
  source: string
}>()

const frame = ref<HTMLIFrameElement | null>(null)
const height = ref(0)

const srcdoc = computed(() => {
  if (!props.source) {
    return ''
  }
  // Resolve to an absolute URL so the srcdoc iframe (opaque origin) can load it.
  const absoluteUrl = new URL(runtimeUrl, globalThis.location.href).href
  return buildSrcdoc(props.source, absoluteUrl)
})

function onMessage(e: MessageEvent) {
  if (!frame.value || e.source !== frame.value.contentWindow) {
    return
  }
  if (e.data?.type === 'blueprint-chart-resize' && typeof e.data.height === 'number') {
    height.value = e.data.height
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
  </div>
</template>
