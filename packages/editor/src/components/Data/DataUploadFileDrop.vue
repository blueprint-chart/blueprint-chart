<template>
  <div
    class="file-drop"
    :class="{ 'file-drop--active': dragging }"
    @dragover.prevent="onDragEnter"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
    @click="fileInput?.click()"
  >
    <div class="file-drop__icon">
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      ><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
    </div>
    <div class="file-drop__title">
      Drag &amp; drop your file here
    </div>
    <div class="file-drop__or">
      or
    </div>
    <button
      class="file-drop__btn"
      @click.stop="fileInput?.click()"
    >
      Browse files
    </button>
    <div class="file-drop__formats">
      <span class="file-drop__formats__tag">.csv</span>
      <span class="file-drop__formats__tag">.tsv</span>
      <span class="file-drop__formats__tag">.bpc</span>
    </div>
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
import { ref, shallowRef } from 'vue'

const emit = defineEmits<{
  loaded: [content: string, filename: string]
  bpc: [content: string, filename: string]
  dragState: [active: boolean]
}>()

const fileInput = ref<globalThis.HTMLInputElement | null>(null)
const dragging = shallowRef(false)

function setDragState(active: boolean) {
  dragging.value = active
  emit('dragState', active)
}

function onDragEnter() {
  setDragState(true)
}

function onDragLeave() {
  setDragState(false)
}

function isBpcFile(file: globalThis.File): boolean {
  return file.name.toLowerCase().endsWith('.bpc')
}

function readFile(file: globalThis.File) {
  const reader = new globalThis.FileReader()
  reader.onload = () => {
    if (typeof reader.result === 'string') {
      emit(isBpcFile(file) ? 'bpc' : 'loaded', reader.result, file.name)
    }
  }
  reader.readAsText(file)
}

function onDrop(e: globalThis.DragEvent) {
  setDragState(false)
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
  padding: 2rem 1.5rem;
  cursor: pointer;
  transition: background 0.15s;
  min-height: 180px;

  &:hover {
    background: var(--bs-tertiary-bg);
  }

  &__icon {
    width: 3rem;
    height: 3rem;
    border-radius: 0.75rem;
    background: var(--bs-primary-bg-subtle);
    color: var(--bs-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.75rem;
  }

  &__title {
    font-size: var(--bs-font-size-md);
    font-weight: 600;
    color: var(--bs-body-color);
    margin-bottom: 0.125rem;
  }

  &__or {
    font-size: var(--bs-font-size-sm);
    color: var(--bs-secondary-color);
    margin-bottom: 0.875rem;
  }

  &__btn {
    padding: 0.4375rem 1.25rem;
    font-size: var(--bs-font-size-sm);
    font-weight: 600;
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
      background: var(--bs-primary-bg-subtle);
    }
  }

  &__formats {
    display: flex;
    gap: 0.375rem;
    margin-top: 0.875rem;

    &__tag {
      font-size: var(--bs-font-size-xs);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.125rem 0.4375rem;
      border-radius: 0.1875rem;
      background: var(--bs-tertiary-bg);
      color: var(--bs-secondary-color);
    }
  }

  &__input {
    display: none;
  }
}
</style>
