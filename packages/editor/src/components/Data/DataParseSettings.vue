<template>
  <div class="data-parse-settings">
    <div class="data-parse-settings__toggle-row">
      <label>First row is header</label>
      <button
        class="data-parse-settings__toggle"
        :class="{ 'data-parse-settings__toggle--on': headerRow }"
        role="switch"
        :aria-checked="headerRow"
        @click="headerRow = !headerRow"
      />
    </div>

    <div class="data-parse-settings__field">
      <div class="data-parse-settings__label">
        Delimiter
      </div>
      <FormControlDropdown
        v-model="delimiter"
        label=""
        :options="delimiterOptions"
        :disabled="delimiterDisabled"
        block
      />
    </div>

    <div class="data-parse-settings__field">
      <div class="data-parse-settings__label">
        Decimal Separator
      </div>
      <FormControlDropdown
        v-model="decimalSep"
        label=""
        :options="decimalOptions"
        block
      />
    </div>

    <div class="data-parse-settings__toggle-row">
      <label>Treat empty as null</label>
      <button
        class="data-parse-settings__toggle"
        :class="{ 'data-parse-settings__toggle--on': emptyAsNull }"
        role="switch"
        :aria-checked="emptyAsNull"
        @click="emptyAsNull = !emptyAsNull"
      />
    </div>

    <div class="data-parse-settings__toggle-row">
      <label>Trim whitespace</label>
      <button
        class="data-parse-settings__toggle"
        :class="{ 'data-parse-settings__toggle--on': trimWs }"
        role="switch"
        :aria-checked="trimWs"
        @click="trimWs = !trimWs"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { FormControlDropdown } from '@blueprint-chart/ui'
import { useParseOptions } from '@/composables/useParseOptions'
import { useDataTable } from '@/composables/useDataTable'

const { firstRowIsHeader, delimiter: delimiterRef, decimalSeparator, treatEmptyAsNull, trimWhitespace, setOption } = useParseOptions()
const { sourceFormat } = useDataTable()
const delimiterDisabled = computed(() => sourceFormat.value !== 'delimited')

const headerRow = computed({
  get: () => firstRowIsHeader.value,
  set: (v: boolean) => setOption('firstRowIsHeader', v),
})

const delimiter = computed({
  get: () => delimiterRef.value,
  set: (v: string) => setOption('delimiter', v as 'auto' | ',' | '\t' | ';' | '|'),
})

const decimalSep = computed({
  get: () => decimalSeparator.value,
  set: (v: string) => setOption('decimalSeparator', v as '.' | ','),
})

const emptyAsNull = computed({
  get: () => treatEmptyAsNull.value,
  set: (v: boolean) => setOption('treatEmptyAsNull', v),
})

const trimWs = computed({
  get: () => trimWhitespace.value,
  set: (v: boolean) => setOption('trimWhitespace', v),
})

const delimiterOptions = [
  { value: 'auto', label: 'Auto-detect' },
  { value: ',', label: 'Comma (,)' },
  { value: '\t', label: 'Tab' },
  { value: ';', label: 'Semicolon (;)' },
  { value: '|', label: 'Pipe (|)' },
]

const decimalOptions = [
  { value: '.', label: 'Period (.)' },
  { value: ',', label: 'Comma (,)' },
]
</script>

<style scoped lang="scss">
.data-parse-settings {
  display: flex;
  flex-direction: column;
  gap: 0;

  :deep(.dropdown-toggle) {
    font-weight: 400;
  }
}

.data-parse-settings__field {
  margin-bottom: 0.875rem;
}

.data-parse-settings__label {
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--bs-secondary-color);
  margin-bottom: 0.25rem;
}

.data-parse-settings__toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;

  label {
    font-size: 0.8125rem;
    color: var(--bs-body-color);
    font-weight: 500;
  }
}

.data-parse-settings__toggle {
  width: 2.25rem;
  height: 1.25rem;
  background: var(--bs-secondary-bg);
  border-radius: 0.625rem;
  position: relative;
  cursor: pointer;
  transition: background 0.2s;
  border: none;
  padding: 0;
  flex-shrink: 0;

  &::after {
    content: '';
    position: absolute;
    top: 0.125rem;
    left: 0.125rem;
    width: 1rem;
    height: 1rem;
    background: #fff;
    border-radius: 50%;
    transition: transform 0.2s;
    box-shadow: 0 1px 2px rgb(0 0 0 / 5%);
  }

  &--on {
    background: var(--bs-primary);

    &::after {
      transform: translateX(1rem);
    }
  }
}
</style>
