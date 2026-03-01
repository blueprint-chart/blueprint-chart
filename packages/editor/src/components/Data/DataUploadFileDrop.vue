<template>
  <div
    class="file-drop"
    :class="{ 'file-drop--active': dragging }"
    @dragover.prevent="dragging = true"
    @dragleave.prevent="dragging = false"
    @drop.prevent="onDrop"
    @click="fileInput?.click()"
  >
    <svg
      class="file-drop__icon"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
    ><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
    <div class="file-drop__title">
      Drag &amp; drop your file here
    </div>
    <div class="file-drop__hint">
      CSV, TSV, or BPC
    </div>
    <button
      class="file-drop__btn"
      @click.stop="fileInput?.click()"
    >
      Browse files
    </button>
    <input
      ref="fileInput"
      type="file"
      accept=".csv,.tsv,.txt,.bpc"
      class="file-drop__input"
      @change="onFileSelect"
    >
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{ loaded: [content: string], bpc: [content: string] }>()

const fileInput = ref<globalThis.HTMLInputElement | null>(null)
const dragging = ref(false)

function isBpcFile(file: globalThis.File): boolean {
  return file.name.toLowerCase().endsWith('.bpc')
}

function readFile(file: globalThis.File) {
  const reader = new globalThis.FileReader()
  reader.onload = () => {
    if (typeof reader.result === 'string') {
      emit(isBpcFile(file) ? 'bpc' : 'loaded', reader.result)
    }
  }
  reader.readAsText(file)
}

function onDrop(e: globalThis.DragEvent) {
  dragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file) {
    readFile(file)
  }
}

function onFileSelect(e: globalThis.Event) {
  const input = e.target as globalThis.HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    readFile(file)
  }
  input.value = ''
}
</script>

<style scoped lang="scss">
.file-drop {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 2.5rem 1.5rem;
  border: 2px dashed var(--bs-border-color);
  border-radius: var(--bs-border-radius-lg);
  cursor: pointer;
  transition: all 0.15s;
  background: var(--bs-body-bg);
  width: 100%;

  &:hover,
  &--active {
    border-color: var(--bs-primary);
    background: var(--bs-primary-bg-subtle);
  }
}

.file-drop__icon {
  color: var(--bs-secondary-color);
  margin-bottom: 0.25rem;
}

.file-drop__title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--bs-body-color);
}

.file-drop__hint {
  font-size: 0.75rem;
  color: var(--bs-secondary-color);
}

.file-drop__btn {
  margin-top: 0.5rem;
  padding: 0.3125rem 0.875rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--bs-body-color);
  background: var(--bs-body-bg);
  border: 1px solid var(--bs-border-color);
  border-radius: var(--bs-border-radius);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;

  &:hover {
    border-color: var(--bs-primary);
    color: var(--bs-primary);
  }
}

.file-drop__input {
  display: none;
}
</style>
