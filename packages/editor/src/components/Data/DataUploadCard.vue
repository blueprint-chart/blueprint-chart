<template>
  <div class="upload-card">
    <h2 class="upload-card__title">
      Add your data
    </h2>
    <p class="upload-card__subtitle">
      Drop a file, paste from a spreadsheet, or pick a sample dataset
    </p>
    <NavigationToggle
      v-model="activeTab"
      :options="tabOptions"
      class="mb-3"
    />
    <DataUploadFileDrop
      v-if="activeTab === 'file'"
      @loaded="$emit('loaded', $event)"
      @bpc="$emit('bpc', $event)"
    />
    <div
      v-else-if="activeTab === 'paste'"
      class="upload-card__paste"
    >
      <div class="upload-card__paste-wrap">
        <div
          v-if="!pasteInput"
          class="upload-card__paste-placeholder"
        >
          category&#9;Gold&#9;Silver&#9;Bronze<br>
          USA&#9;40&#9;44&#9;42<br>
          China&#9;38&#9;32&#9;19
        </div>
        <textarea
          ref="pasteArea"
          v-model="pasteInput"
          class="upload-card__paste-area"
          spellcheck="false"
          @paste="onPaste"
        />
      </div>
      <div class="upload-card__paste-footer">
        <div class="upload-card__paste-hint">
          <span class="upload-card__kbd">⌘</span><span class="upload-card__kbd">V</span> paste from spreadsheet
        </div>
        <button
          class="upload-card__paste-btn"
          :disabled="!pasteInput.trim()"
          @click="$emit('loaded', pasteInput)"
        >
          Load data
        </button>
      </div>
    </div>
    <DataUploadSamples
      v-else-if="activeTab === 'samples'"
      @select="$emit('loaded', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { NavigationToggle } from '@blueprint-chart/ui'
import { useDataTable } from '@/composables/useDataTable'
import DataUploadFileDrop from './DataUploadFileDrop.vue'
import DataUploadSamples from './DataUploadSamples.vue'

defineEmits<{ loaded: [content: string], bpc: [content: string] }>()

const { rawInput } = useDataTable()

const activeTab = ref('paste')
const pasteInput = ref(rawInput.value)
const pasteArea = ref<HTMLTextAreaElement | null>(null)

function onPaste(e: globalThis.ClipboardEvent) {
  const text = e.clipboardData?.getData('text/plain')
  if (text) {
    e.preventDefault()
    pasteInput.value = text
    nextTick(() => {
      if (pasteArea.value) {
        pasteArea.value.focus()
      }
    })
  }
}

const tabOptions = [
  { value: 'paste', text: 'Paste' },
  { value: 'file', text: 'File' },
  { value: 'samples', text: 'Samples' },
]
</script>

<style scoped lang="scss">
.upload-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200px);
  max-width: 640px;
  margin: 0 auto;
}

.upload-card__title {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--bs-body-color);
  margin-bottom: 0.25rem;
  text-align: center;
}

.upload-card__subtitle {
  font-size: 0.875rem;
  color: var(--bs-secondary-color);
  text-align: center;
  margin-bottom: 1.75rem;
}

.upload-card__paste {
  width: 100%;
}

.upload-card__paste-wrap {
  position: relative;
  border: 1px solid var(--bs-border-color);
  border-radius: var(--bs-border-radius);
  overflow: hidden;
}

.upload-card__paste-placeholder {
  position: absolute;
  inset: 0;
  padding: 0.875rem 1rem;
  font-family: var(--bs-font-monospace);
  font-size: 0.75rem;
  color: var(--bs-secondary-color);
  opacity: 0.5;
  pointer-events: none;
  white-space: pre;
  line-height: 1.6;
}

.upload-card__paste-area {
  width: 100%;
  min-height: 180px;
  border: none;
  padding: 0.875rem 1rem;
  font-family: var(--bs-font-monospace);
  font-size: 0.75rem;
  resize: vertical;
  outline: none;
  color: var(--bs-body-color);
  line-height: 1.6;
  background: var(--bs-body-bg);

  &::placeholder {
    color: var(--bs-secondary-color);
    opacity: 0.5;
  }
}

.upload-card__paste-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  border-top: 1px solid var(--bs-border-color);
  background: var(--bs-tertiary-bg);
  border-radius: 0 0 var(--bs-border-radius) var(--bs-border-radius);
}

.upload-card__paste-hint {
  font-size: 0.6875rem;
  color: var(--bs-secondary-color);
  display: flex;
  align-items: center;
  gap: 0.125rem;
}

.upload-card__kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 0.25rem;
  background: var(--bs-body-bg);
  border: 1px solid var(--bs-border-color);
  border-radius: 0.1875rem;
  font-size: 0.625rem;
  font-weight: 600;
  color: var(--bs-secondary-color);
  margin: 0 0.0625rem;
}

.upload-card__paste-btn {
  padding: 0.3125rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #fff;
  background: var(--bs-primary);
  border: none;
  border-radius: var(--bs-border-radius);
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;

  &:hover:not(:disabled) {
    filter: brightness(0.9);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
