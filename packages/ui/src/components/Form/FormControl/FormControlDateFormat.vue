<template>
  <FormControlDropdown
    :id="id"
    v-model="model"
    :label="label"
    :block="block"
    :placeholder="'(automatic)'"
    auto-close="outside"
    menu-class="form-control-date-format-menu"
    :min-menu-width="260"
  >
    <template #button-content>
      <span
        class="form-control-date-format__trigger-text"
        :class="{ 'text-secondary': !model }"
      >{{ displayValue }}</span>
    </template>

    <template #menu="{ hide }">
      <div class="form-control-date-format__popover">
        <div class="form-control-date-format__popover__list">
          <div
            v-for="preset in PRESETS"
            :key="preset.fmt"
            class="form-control-date-format__popover__list__item"
            :class="{ 'form-control-date-format__popover__list__item--active': selectedPreset === preset.fmt }"
            @click="selectPreset(preset.fmt, hide)"
          >
            <div class="form-control-date-format__popover__list__item__body">
              <div class="form-control-date-format__popover__list__item__body__label">
                {{ preset.label }}
              </div>
              <div
                v-if="tickPreview(preset.fmt)"
                class="form-control-date-format__popover__list__item__body__ticks"
              >
                {{ tickPreview(preset.fmt) }}
              </div>
            </div>
            <span
              v-if="selectedPreset === preset.fmt"
              class="form-control-date-format__popover__list__item__check"
            >&#10003;</span>
          </div>
        </div>

        <div
          v-if="selectedPreset === '(custom)'"
          class="form-control-date-format__popover__custom"
        >
          <div class="form-control-date-format__popover__custom__section-label">
            Custom d3-time-format string
          </div>
          <input
            v-model="customStr"
            class="form-control-date-format__popover__custom__input"
            placeholder="e.g. %b %d, %Y"
            @input="onCustomInput"
          >
          <div class="form-control-date-format__popover__custom__preview">
            Preview:
            <span class="form-control-date-format__popover__custom__preview__value">
              {{ customStr ? customPreview : '—' }}
            </span>
          </div>
        </div>
      </div>
    </template>
  </FormControlDropdown>
</template>

<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import { timeFormat } from 'd3-time-format'
import FormControlDropdown from './FormControlDropdown.vue'

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

const SAMPLE_DATES = [
  new Date(2015, 0, 1),
  new Date(2016, 0, 1),
  new Date(2017, 0, 1),
]

interface DatePreset {
  label: string
  fmt: string
  d3?: string
}

const PRESETS: DatePreset[] = [
  { label: '(automatic)', fmt: '(automatic)' },
  { label: 'Year only', fmt: 'YYYY', d3: '%Y' },
  { label: 'Short year', fmt: '\'YY', d3: '\'%y' },
  { label: 'Quarter', fmt: 'Q', d3: '%Y Q%q' },
  { label: 'Month abbr.', fmt: 'MMM', d3: '%b' },
  { label: 'Month + year', fmt: 'MMM \'YY', d3: '%b \'%y' },
  { label: 'Full month', fmt: 'MMMM', d3: '%B' },
  { label: 'Month + day', fmt: 'MMMM D', d3: '%B %-d' },
  { label: 'Full date', fmt: 'MMMM D, YYYY', d3: '%B %-d, %Y' },
  { label: 'MM/DD/YYYY', fmt: 'MM/DD/YYYY', d3: '%m/%d/%Y' },
  { label: 'DD/MM/YYYY', fmt: 'DD/MM/YYYY', d3: '%d/%m/%Y' },
  { label: 'ISO 8601', fmt: 'YYYY-MM-DD', d3: '%Y-%m-%d' },
  { label: '(custom)', fmt: '(custom)' },
]

const selectedPreset = shallowRef('(automatic)')
const customStr = shallowRef('')

function formatWithD3(d3Str: string, date: Date): string {
  // Handle quarter placeholder (not native to d3-time-format)
  if (d3Str.includes('%q')) {
    const q = Math.floor(date.getMonth() / 3) + 1
    return timeFormat(d3Str.replace('%q', String(q)))(date)
  }
  return timeFormat(d3Str)(date)
}

function tickPreview(fmt: string): string | null {
  if (fmt === '(automatic)') {
    return 'auto — adapts to data'
  }
  if (fmt === '(custom)') {
    return null
  }
  const preset = PRESETS.find(p => p.fmt === fmt)
  if (!preset?.d3) {
    return null
  }
  return SAMPLE_DATES.map(d => formatWithD3(preset.d3!, d)).join('  \u00b7  ')
}

const customPreview = computed(() => {
  if (!customStr.value) {
    return ''
  }
  try {
    return SAMPLE_DATES.map(d => formatWithD3(customStr.value, d)).join('  \u00b7  ')
  }
  catch {
    return '(invalid format)'
  }
})

const displayValue = computed(() => {
  if (!model.value) {
    return '(automatic)'
  }
  if (selectedPreset.value === '(custom)') {
    return customStr.value || '(custom)'
  }
  const preset = PRESETS.find(p => p.d3 === model.value)
  return preset?.label ?? model.value
})

function presetToD3(fmt: string): string {
  if (fmt === '(automatic)') {
    return ''
  }
  const preset = PRESETS.find(p => p.fmt === fmt)
  return preset?.d3 ?? ''
}

function selectPreset(fmt: string, hide: () => void) {
  selectedPreset.value = fmt
  if (fmt === '(custom)') {
    // Keep dropdown open for custom input
    return
  }
  model.value = presetToD3(fmt)
  hide()
}

function onCustomInput() {
  model.value = customStr.value
}

// Initialize from model value
watch(() => model.value, (val) => {
  if (!val) {
    selectedPreset.value = '(automatic)'
    customStr.value = ''
    return
  }
  const preset = PRESETS.find(p => p.d3 === val)
  if (preset) {
    selectedPreset.value = preset.fmt
    customStr.value = ''
  }
  else {
    selectedPreset.value = '(custom)'
    customStr.value = val
  }
}, { immediate: true })
</script>

<style lang="scss">
/* Unscoped — teleported to body */
.form-control-date-format-menu {
  max-height: min(80vh, 800px);
  overflow-y: auto;
  z-index: 1060 !important;
  padding: 0 !important;
}
</style>

<style scoped lang="scss">
.form-control-date-format {
  &__trigger-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__popover {
    font-size: var(--bs-font-size-sm);

    &__list {
      display: flex;
      flex-direction: column;

      &__item {
        display: flex;
        align-items: center;
        padding: 0.375rem 0.625rem;
        cursor: pointer;
        transition: background 0.1s ease;
        gap: 0.5rem;

        &:hover {
          background: var(--bs-tertiary-bg);
        }

        &--active {
          background: var(--bs-primary-bg-subtle);

          .form-control-date-format__popover__list__item__body__label {
            color: var(--bs-primary);
          }

          .form-control-date-format__popover__list__item__body__ticks {
            color: var(--bs-primary);
          }
        }

        &__body {
          flex: 1;
          min-width: 0;

          &__label {
            font-size: var(--bs-font-size-xs);
            font-weight: 600;
            color: var(--bs-body-color);
          }

          &__ticks {
            font-family: var(--bs-font-monospace);
            font-size: var(--bs-font-size-xs);
            color: var(--bs-secondary-color);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-top: 1px;
          }
        }

        &__check {
          color: var(--bs-primary);
          font-size: var(--bs-font-size-sm);
          flex-shrink: 0;
        }
      }
    }

    &__custom {
      padding: 0.625rem;
      border-top: 1px solid var(--bs-border-color);

      &__section-label {
        font-size: var(--bs-font-size-xs);
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--bs-secondary-color);
        margin-bottom: 0.375rem;
      }

      &__input {
        width: 100%;
        height: 1.75rem;
        padding: 0 0.5rem;
        background: var(--bs-body-bg);
        border: 1px solid var(--bs-border-color);
        border-radius: var(--bs-border-radius);
        font-family: var(--bs-font-monospace);
        font-size: var(--bs-font-size-sm);
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

      &__preview {
        margin-top: 0.375rem;
        font-size: var(--bs-font-size-xs);
        color: var(--bs-secondary-color);

        &__value {
          font-family: var(--bs-font-monospace);
          color: var(--bs-body-color);
        }
      }
    }
  }
}
</style>
