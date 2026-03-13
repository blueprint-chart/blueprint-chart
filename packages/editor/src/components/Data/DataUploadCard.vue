<template>
  <div class="upload-card">
    <h2 class="upload-card__title">
      Add your data
    </h2>
    <p class="upload-card__subtitle">
      Drop a file, paste from a spreadsheet, or pick a sample dataset
    </p>
    <div
      class="input-card"
      :class="{ 'input-card--drag-over': isDragOver }"
    >
      <div class="input-card__tabs">
        <button
          v-for="tab in tabOptions"
          :key="tab.value"
          class="input-card__tabs__tab"
          :class="{ 'input-card__tabs__tab--active': activeTab === tab.value }"
          @click="activeTab = tab.value"
        >
          <svg
            v-if="tab.value === 'file'"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          ><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
          <svg
            v-else-if="tab.value === 'paste'"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          ><rect
            x="8"
            y="2"
            width="8"
            height="4"
            rx="1"
          /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /></svg>
          <svg
            v-else
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          ><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
          {{ tab.text }}
        </button>
      </div>
      <DataUploadFileDrop
        v-if="activeTab === 'file'"
        @loaded="(content, filename) => $emit('loaded', content, filename)"
        @bpc="(content, filename) => $emit('bpc', content, filename)"
        @drag-state="isDragOver = $event"
      />
      <div
        v-else-if="activeTab === 'paste'"
        class="upload-card__paste"
      >
        <div class="upload-card__paste__wrap">
          <div
            v-if="!pasteInput"
            class="upload-card__paste__wrap__placeholder"
          >
            category&#9;Gold&#9;Silver&#9;Bronze<br>
            USA&#9;40&#9;44&#9;42<br>
            China&#9;38&#9;32&#9;19
          </div>
          <textarea
            ref="pasteArea"
            v-model="pasteInput"
            class="upload-card__paste__wrap__area"
            spellcheck="false"
            @paste="onPaste"
          />
        </div>
        <div class="upload-card__paste__footer">
          <div class="upload-card__paste__footer__hint">
            <span class="upload-card__paste__footer__hint__kbd">⌘</span><span class="upload-card__paste__footer__hint__kbd">V</span> paste from spreadsheet
          </div>
          <button
            class="upload-card__paste__footer__btn"
            :disabled="!pasteInput.trim()"
            @click="$emit('loaded', pasteInput, 'Pasted')"
          >
            Load data
          </button>
        </div>
      </div>
      <DataUploadSamples
        v-else-if="activeTab === 'samples'"
        @select="$emit('sample', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, nextTick } from 'vue'
import { useDataTable } from '@/composables/useDataTable'
import { serializeDelimited } from '@/composables/useDataParser'
import DataUploadFileDrop from './DataUploadFileDrop.vue'
import DataUploadSamples from './DataUploadSamples.vue'

defineEmits<{
  loaded: [content: string, sourceLabel: string]
  bpc: [content: string, sourceLabel: string]
  sample: [sample: import('@blueprint-chart/lib').ChartSample]
}>()

const { rawInput, sourceFormat, columns, rows } = useDataTable()

function getInitialPasteInput(): string {
  if (sourceFormat?.value === 'bpc' && columns.value.length > 0) {
    return serializeDelimited(columns.value, rows.value)
  }
  return rawInput.value
}

const activeTab = shallowRef('paste')
const pasteInput = shallowRef(getInitialPasteInput())
const pasteArea = ref<HTMLTextAreaElement | null>(null)
const isDragOver = shallowRef(false)

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
  { value: 'file', text: 'File' },
  { value: 'paste', text: 'Paste' },
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
  padding: 2rem 0;

  &__title {
    font-size: var(--bs-font-size-lg);
    font-weight: 700;
    color: var(--bs-body-color);
    margin-bottom: 0.25rem;
    text-align: center;
  }

  &__subtitle {
    font-size: var(--bs-font-size-md);
    color: var(--bs-secondary-color);
    text-align: center;
    margin-bottom: 1.75rem;
  }

  &__paste {
    width: 100%;

    &__wrap {
      position: relative;

      &__placeholder {
        position: absolute;
        inset: 0;
        padding: 0.875rem 1rem;
        font-family: var(--bs-font-monospace);
        font-size: var(--bs-font-size-sm);
        color: var(--bs-secondary-color);
        opacity: 0.5;
        pointer-events: none;
        white-space: pre;
        line-height: 1.6;
      }

      &__area {
        width: 100%;
        min-height: 180px;
        border: none;
        padding: 0.875rem 1rem;
        font-family: var(--bs-font-monospace);
        font-size: var(--bs-font-size-sm);
        resize: vertical;
        outline: none;
        color: var(--bs-body-color);
        line-height: 1.6;
        background: transparent;

        &::placeholder {
          color: var(--bs-secondary-color);
          opacity: 0.5;
        }
      }
    }

    &__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.375rem 0.75rem;
      border-top: 1px solid var(--bs-border-color);
      background: var(--bs-tertiary-bg);

      &__hint {
        font-size: var(--bs-font-size-xs);
        color: var(--bs-secondary-color);
        display: flex;
        align-items: center;
        gap: 0.125rem;

        &__kbd {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 1.25rem;
          height: 1.25rem;
          padding: 0 0.25rem;
          background: var(--bs-body-bg);
          border: 1px solid var(--bs-border-color);
          border-radius: 0.25rem;
          font-size: var(--bs-font-size-xs);
          font-weight: 600;
          color: var(--bs-secondary-color);
          margin: 0 1px;
        }
      }

      &__btn {
        padding: 0.25rem 0.75rem;
        font-size: var(--bs-font-size-sm);
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
    }
  }
}

// --- Input card container ---

.input-card {
  width: 100%;
  border: 1px solid var(--bs-border-color);
  border-radius: 0.625rem;
  overflow: hidden;
  background: var(--bs-body-bg);
  box-shadow: var(--bs-card-box-shadow, 0 1px 3px rgba(0, 0, 0, 0.1));
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus-within {
    border-color: var(--bs-primary);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--bs-primary) 15%, transparent),
      var(--bs-card-box-shadow, 0 1px 3px rgba(0, 0, 0, 0.1));
  }

  &--drag-over {
    border-color: var(--bs-primary);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--bs-primary) 25%, transparent),
      0 4px 6px -1px rgba(0, 0, 0, 0.1);
    background: var(--bs-primary-bg-subtle);
  }

  &__tabs {
    display: flex;
    border-bottom: 1px solid var(--bs-border-color);
    background: var(--bs-tertiary-bg);

    &__tab {
      flex: 1;
      padding: 0.625rem 1rem;
      font-family: inherit;
      font-size: var(--bs-font-size-sm);
      font-weight: 600;
      color: var(--bs-secondary-color);
      border: none;
      background: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.375rem;
      transition: all 0.15s;
      position: relative;

      &:hover {
        color: var(--bs-body-color);
        background: var(--bs-secondary-bg);
      }

      &:not(:last-child) {
        border-right: 1px solid var(--bs-border-color);
      }

      &--active {
        color: var(--bs-primary);
        background: var(--bs-body-bg);

        &::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0.75rem;
          right: 0.75rem;
          height: 2px;
          background: var(--bs-primary);
          border-radius: 1px;
        }
      }

      svg {
        width: 1rem;
        height: 1rem;
      }
    }
  }
}
</style>
