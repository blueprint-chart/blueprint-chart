<template>
  <div
    class="border border-2 border-dashed rounded p-5 text-center"
    :class="classList"
    @dragover.prevent="dragging = true"
    @dragleave.prevent="dragging = false"
    @drop.prevent="onDrop"
    @click="fileInput?.click()"
  >
    <IconPhUploadSimple class="fs-1 text-muted mb-2" />
    <p class="mb-1">
      Drag & drop a CSV or TSV file here
    </p>
    <p class="text-muted small">
      or click to browse
    </p>
    <input
      ref="fileInput"
      type="file"
      accept=".csv,.tsv,.txt"
      class="d-none"
      @change="onFileSelect"
    >
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits<{ loaded: [content: string] }>()

const fileInput = ref<globalThis.HTMLInputElement | null>(null)
const dragging = ref(false)

const classList = computed(() => ({
  'border-primary bg-primary bg-opacity-10': dragging.value,
}))

function readFile(file: globalThis.File) {
  const reader = new globalThis.FileReader()
  reader.onload = () => {
    if (typeof reader.result === 'string') {
      emit('loaded', reader.result)
    }
  }
  reader.readAsText(file)
}

function onDrop(e: globalThis.DragEvent) {
  dragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file) readFile(file)
}

function onFileSelect(e: globalThis.Event) {
  const input = e.target as globalThis.HTMLInputElement
  const file = input.files?.[0]
  if (file) readFile(file)
  input.value = ''
}
</script>
