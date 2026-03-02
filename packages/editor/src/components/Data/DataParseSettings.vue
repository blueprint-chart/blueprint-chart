<template>
  <div class="data-parse-settings">
    <BFormCheckbox
      v-model="headerRow"
      switch
    >
      First row is header
    </BFormCheckbox>

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

    <BFormCheckbox
      v-model="emptyAsNull"
      switch
    >
      Treat empty as null
    </BFormCheckbox>

    <BFormCheckbox
      v-model="trimWs"
      switch
    >
      Trim whitespace
    </BFormCheckbox>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BFormCheckbox } from 'bootstrap-vue-next'
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

</style>
