<script setup lang="ts">
// Blueprint Chart — client-only renderer for a BPC fragment.
// Delegates to `renderBpc` from the lib; dynamic import keeps SSR side-effects out.

import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps<{
  source: string
}>()

const container = ref<HTMLElement | null>(null)
const errored = ref(false)
let cancelled = false

async function render() {
  if (!container.value || !props.source) {
    return
  }
  errored.value = false
  container.value.replaceChildren()
  try {
    const { renderBpc } = await import('@blueprint-chart/lib')
    if (cancelled || !container.value) {
      return
    }
    renderBpc(container.value, props.source)
    if (!container.value.querySelector('svg')) {
      errored.value = true
    }
  }
  catch {
    errored.value = true
  }
}

onMounted(render)
watch(() => props.source, render)
onBeforeUnmount(() => {
  cancelled = true
})
</script>

<template>
  <div class="bpc-preview">
    <div
      ref="container"
      class="bpc-preview__container"
    />
    <div
      v-if="errored"
      class="bpc-preview__error"
    >
      Could not render this fragment — view the source instead.
    </div>
  </div>
</template>
