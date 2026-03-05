<template>
  <BFormGroup
    ref="elementRef"
    class="form-control-number-format"
    :label="label"
    :label-for="id"
  >
    <BDropdown
      ref="dropdownRef"
      class="form-control-number-format__toggle"
      :class="{ 'form-control-number-format__toggle--block': block }"
      menu-class="form-control-number-format-menu"
      :text="displayValue"
      teleport-to="body"
      variant="outline-secondary"
      auto-close="outside"
      @show="matchMenuWidth"
      @shown="matchMenuWidth"
    >
      <template #button-content>
        <span
          class="form-control-number-format__trigger-text"
          :class="{ 'text-secondary': !model }"
        >{{ displayValue }}</span>
      </template>

      <div class="form-control-number-format__popover">
        <!-- Live preview -->
        <div class="form-control-number-format__preview">
          <div
            v-for="(sample, i) in previewSamples"
            :key="i"
            class="form-control-number-format__preview-cell"
          >
            <div class="form-control-number-format__preview-label">
              {{ sample.label }}
            </div>
            <div
              class="form-control-number-format__preview-value"
              :class="sample.cls"
            >
              {{ sample.formatted }}
            </div>
          </div>
        </div>

        <div class="form-control-number-format__body">
          <!-- Quick presets -->
          <div>
            <div class="form-control-number-format__section-label">
              Presets
            </div>
            <div class="form-control-number-format__chips">
              <button
                v-for="preset in PRESETS"
                :key="preset.label"
                class="form-control-number-format__chip"
                :class="{ 'form-control-number-format__chip--active': activePreset === preset.label }"
                @click="applyPreset(preset)"
              >
                {{ preset.label }}
              </button>
            </div>
          </div>

          <hr class="form-control-number-format__sep">

          <!-- Prefix / Suffix -->
          <div class="form-control-number-format__grid-2">
            <div>
              <div class="form-control-number-format__field-label">
                Prefix
              </div>
              <input
                v-model="config.prefix"
                class="form-control-number-format__input"
                placeholder="e.g. $"
                @input="syncModel"
              >
            </div>
            <div>
              <div class="form-control-number-format__field-label">
                Suffix
              </div>
              <input
                v-model="config.suffix"
                class="form-control-number-format__input"
                placeholder="e.g. %"
                @input="syncModel"
              >
            </div>
          </div>

          <!-- Decimals -->
          <div>
            <div class="form-control-number-format__section-label">
              Decimal places
            </div>
            <div class="form-control-number-format__btn-group">
              <button
                v-for="d in DECIMAL_OPTIONS"
                :key="d"
                class="form-control-number-format__btn"
                :class="{ 'form-control-number-format__btn--active': config.decimals === d }"
                @click="setDecimals(d)"
              >
                {{ d }}
              </button>
            </div>
          </div>

          <!-- Negatives -->
          <div>
            <div class="form-control-number-format__section-label">
              Negatives
            </div>
            <div class="form-control-number-format__btn-group">
              <button
                v-for="n in NEGATIVE_OPTIONS"
                :key="n.id"
                class="form-control-number-format__btn"
                :class="{ 'form-control-number-format__btn--active': config.negStyle === n.id }"
                @click="setNegStyle(n.id)"
              >
                {{ n.label }}
              </button>
            </div>
          </div>

          <!-- Thousands separator -->
          <label class="form-control-number-format__check-row">
            <input
              v-model="config.thousandsSep"
              type="checkbox"
              class="form-control-number-format__checkbox"
              @change="syncModel()"
            >
            <span>Thousands separator</span>
          </label>

          <hr class="form-control-number-format__sep">

          <!-- d3 format string -->
          <div class="form-control-number-format__d3-row">
            <span class="form-control-number-format__d3-label">d3·fmt</span>
            <span class="form-control-number-format__d3-value">{{ d3String }}</span>
          </div>
        </div>
      </div>
    </BDropdown>
  </BFormGroup>
</template>

<script setup lang="ts">
import { computed, reactive, ref, useTemplateRef, watch } from 'vue'
import { useElementBounding } from '@vueuse/core'
import {
  configToD3,
  configToModel,
  parseModelString,
  formatSample as formatSampleFn,
  DEFAULT_CONFIG,
  type NumberFormatConfig,
} from './number-format'

const model = defineModel<string>({ required: true })

withDefaults(defineProps<{
  label?: string
  id?: string
  block?: boolean
}>(), {
  label: undefined,
  id: undefined,
  block: true,
})

const DECIMAL_OPTIONS = ['0', '1', '2', '3', 'auto']
const NEGATIVE_OPTIONS = [
  { id: 'minus', label: '−1,234' },
  { id: 'paren', label: '(1,234)' },
]

const SAMPLES = [
  { value: -1234.5, label: 'neg', cls: 'form-control-number-format__preview-value--neg' },
  { value: 0, label: 'zero', cls: 'form-control-number-format__preview-value--zero' },
  { value: 9876543, label: 'pos', cls: '' },
]

interface Preset {
  label: string
  config: NumberFormatConfig
}

const PRESETS: Preset[] = [
  { label: '1,234', config: { prefix: '', suffix: '', decimals: '0', scale: 'none', negStyle: 'minus', thousandsSep: true } },
  { label: '1,234.56', config: { prefix: '', suffix: '', decimals: '2', scale: 'none', negStyle: 'minus', thousandsSep: true } },
  { label: '1234', config: { prefix: '', suffix: '', decimals: '0', scale: 'none', negStyle: 'minus', thousandsSep: false } },
  { label: '12%', config: { prefix: '', suffix: '%', decimals: '0', scale: 'none', negStyle: 'minus', thousandsSep: false } },
  { label: '$1,234', config: { prefix: '$', suffix: '', decimals: '0', scale: 'none', negStyle: 'minus', thousandsSep: true } },
  { label: '(1,234)', config: { prefix: '', suffix: '', decimals: '0', scale: 'none', negStyle: 'paren', thousandsSep: true } },
]

const config = reactive<NumberFormatConfig>({ ...DEFAULT_CONFIG })
const activePreset = ref<string | null>(null)

const elementRef = useTemplateRef<HTMLElement>('elementRef')
const elementBounding = useElementBounding(elementRef)
const dropdownRef = useTemplateRef<{ hide: () => void, $el: HTMLElement }>('dropdownRef')

function matchMenuWidth() {
  const { id: toggleId = null } = dropdownRef.value?.$el?.querySelector('.dropdown-toggle') as HTMLElement | null ?? {}
  if (!toggleId) {
    return
  }
  const menu = document.getElementById(`${toggleId}-menu`)
  if (menu) {
    menu.style.width = `${Math.max(elementBounding.width.value, 260)}px`
  }
}

watch(elementBounding.width, matchMenuWidth)

// Initialize config from model
watch(() => model.value, (newVal) => {
  if (newVal !== configToModel(config)) {
    Object.assign(config, parseModelString(newVal ?? ''))
  }
}, { immediate: true })

const d3String = computed(() => configToD3(config))

const displayValue = computed(() => model.value || 'auto')

function syncModel() {
  activePreset.value = null
  model.value = configToModel(config)
}

function setDecimals(d: string) {
  config.decimals = d
  syncModel()
}

function setNegStyle(id: string) {
  config.negStyle = id
  syncModel()
}

function applyPreset(preset: Preset) {
  Object.assign(config, { ...preset.config })
  activePreset.value = preset.label
  model.value = configToModel(config)
}

function formatSample(value: number): string {
  return formatSampleFn(value, config)
}

const previewSamples = computed(() =>
  SAMPLES.map(s => ({
    ...s,
    formatted: formatSample(s.value),
  })),
)
</script>

<style lang="scss">
/* Unscoped — teleported to body */
.form-control-number-format-menu {
  max-height: min(80vh, 800px);
  overflow-y: auto;
  z-index: 1060 !important;
  padding: 0 !important;
}
</style>

<style scoped lang="scss">
.form-control-number-format__toggle--block {
  width: 100%;

  :deep(.dropdown-toggle) {
    width: 100%;
    display: inline-flex;
    text-align: left;
    align-items: center;
    justify-content: space-between;
  }
}

.form-control-number-format__trigger-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--bs-font-monospace);
}

.form-control-number-format__popover {
  font-size: 0.8125rem;
}

.form-control-number-format__preview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-bottom: 1px solid var(--bs-border-color);
}

.form-control-number-format__preview-cell {
  padding: 0.4rem 0.375rem;
  text-align: center;
  border-right: 1px solid var(--bs-border-color);

  &:last-child {
    border-right: none;
  }
}

.form-control-number-format__preview-label {
  font-size: 0.5625rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--bs-secondary-color);
  margin-bottom: 0.125rem;
}

.form-control-number-format__preview-value {
  font-family: var(--bs-font-monospace);
  font-size: 0.8125rem;
  font-weight: 500;

  &--neg {
    color: var(--bs-danger);
  }

  &--zero {
    color: var(--bs-secondary-color);
  }
}

.form-control-number-format__body {
  padding: 0.625rem;
  display: flex;
  flex-direction: column;
  gap: 0.5625rem;
}

.form-control-number-format__section-label {
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--bs-secondary-color);
  margin-bottom: 0.25rem;
}

.form-control-number-format__field-label {
  font-size: 0.625rem;
  color: var(--bs-secondary-color);
  margin-bottom: 0.125rem;
}

.form-control-number-format__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.form-control-number-format__chip {
  font-family: var(--bs-font-monospace);
  font-size: 0.6875rem;
  padding: 0.125rem 0.5rem;
  background: var(--bs-tertiary-bg);
  border: 1px solid var(--bs-border-color);
  border-radius: 4px;
  color: var(--bs-secondary-color);
  cursor: pointer;
  transition: all 0.12s ease;
  line-height: 1.6;

  &:hover {
    border-color: var(--bs-primary);
    color: var(--bs-primary);
    background: var(--bs-primary-bg-subtle);
  }

  &--active {
    border-color: var(--bs-primary);
    color: var(--bs-primary);
    background: var(--bs-primary-bg-subtle);
    font-weight: 500;
  }
}

.form-control-number-format__sep {
  margin: 0;
  border: none;
  border-top: 1px solid var(--bs-border-color);
}

.form-control-number-format__grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.4375rem;
}

.form-control-number-format__input {
  width: 100%;
  height: 1.75rem;
  padding: 0 0.5rem;
  background: var(--bs-body-bg);
  border: 1px solid var(--bs-border-color);
  border-radius: var(--bs-border-radius);
  font-family: var(--bs-font-monospace);
  font-size: 0.75rem;
  color: var(--bs-body-color);
  outline: none;
  transition: border-color 0.12s ease, box-shadow 0.12s ease;

  &:focus {
    border-color: var(--bs-primary);
    box-shadow: 0 0 0 2px rgba(var(--bs-primary-rgb), 0.1);
  }

  &::placeholder {
    color: var(--bs-secondary-color);
    font-family: var(--bs-body-font-family);
  }
}

.form-control-number-format__btn-group {
  display: flex;
  border: 1px solid var(--bs-border-color);
  border-radius: var(--bs-border-radius);
  overflow: hidden;
  height: 1.75rem;
}

.form-control-number-format__btn {
  flex: 1;
  font-family: var(--bs-font-monospace);
  font-size: 0.625rem;
  padding: 0 0.125rem;
  background: var(--bs-body-bg);
  border: none;
  border-right: 1px solid var(--bs-border-color);
  color: var(--bs-secondary-color);
  cursor: pointer;
  transition: all 0.12s ease;
  white-space: nowrap;

  &:last-child {
    border-right: none;
  }

  &:hover {
    background: var(--bs-tertiary-bg);
    color: var(--bs-body-color);
  }

  &--active {
    background: var(--bs-primary);
    color: #fff;
    font-weight: 500;
  }
}

.form-control-number-format__check-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.8125rem;
}

.form-control-number-format__checkbox {
  accent-color: var(--bs-primary);
  width: 0.875rem;
  height: 0.875rem;
}

.form-control-number-format__d3-row {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  background: var(--bs-tertiary-bg);
  border: 1px solid var(--bs-border-color);
  border-radius: var(--bs-border-radius);
  padding: 0.25rem 0.5rem;
  height: 1.75rem;
}

.form-control-number-format__d3-label {
  font-size: 0.5625rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--bs-secondary-color);
  white-space: nowrap;
}

.form-control-number-format__d3-value {
  font-family: var(--bs-font-monospace);
  font-size: 0.75rem;
  color: var(--bs-primary);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
