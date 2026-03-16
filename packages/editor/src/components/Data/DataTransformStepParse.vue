<template>
  <div class="data-transform-step-parse">
    <FormControlDropdown
      :model-value="step.config.column ?? ''"
      label="Column"
      placeholder="Select a column"
      :options="columnOptions"
      block
      @update:model-value="onUpdate('column', $event)"
    />
    <FormControlDropdown
      :model-value="selectedCategory"
      label="Category"
      :options="categoryOptions"
      block
      @update:model-value="onCategoryChange"
    />
    <FormControlDropdown
      :model-value="step.config.operation ?? ''"
      label="Operation"
      placeholder="Select an operation"
      :options="operationOptions"
      block
      @update:model-value="onUpdate('operation', $event)"
    />
    <template v-if="currentParams.length > 0">
      <FormControlTextInput
        v-for="param in currentParams"
        :id="`parse-${param}`"
        :key="param"
        :model-value="step.config[param] ?? ''"
        :label="paramLabel(param)"
        :placeholder="paramPlaceholder(param)"
        @update:model-value="onUpdate(param, $event)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import { FormControlDropdown, FormControlTextInput } from '@blueprint-chart/ui'
import { useDataTransforms, type TransformStep, parseOperations } from '@/stores/dataTransforms'

const props = defineProps<{
  step: TransformStep
  columns: string[]
}>()

const { updateStep } = useDataTransforms()

const columnOptions = computed(() =>
  props.columns.map(c => ({ value: c, label: c })),
)

const categoryOptions = [
  { value: 'type', label: 'Type Conversions' },
  { value: 'string', label: 'String' },
  { value: 'numeric', label: 'Numeric' },
  { value: 'date', label: 'Date/Time' },
]

const currentOp = computed(() =>
  parseOperations.find(o => o.id === props.step.config.operation),
)

const selectedCategory = shallowRef(currentOp.value?.category ?? 'type')

watch(() => props.step.config.operation, (op) => {
  if (op) {
    const found = parseOperations.find(o => o.id === op)
    if (found) {
      selectedCategory.value = found.category
    }
  }
})

const operationOptions = computed(() =>
  parseOperations
    .filter(o => o.category === selectedCategory.value)
    .map(o => ({ value: o.id, label: o.label, description: o.description })),
)

const currentParams = computed(() => currentOp.value?.params ?? [])

const paramLabels: Record<string, string> = {
  decimals: 'Decimal places',
  pattern: 'Regex pattern',
  replacement: 'Replacement',
  start: 'Start index',
  end: 'End index',
  length: 'Length',
  char: 'Pad character',
  separator: 'Separator',
  limit: 'Limit',
  min: 'Minimum',
  max: 'Maximum',
  size: 'Bucket size',
  key: 'JSON key',
  amount: 'Amount',
  unit: 'Unit',
  period: 'Period',
  reference: 'Reference date',
}

const paramPlaceholders: Record<string, string> = {
  decimals: '0',
  pattern: '\\d+',
  replacement: '',
  start: '0',
  end: '',
  length: '10',
  char: ' ',
  separator: ',',
  limit: '',
  min: '0',
  max: '100',
  size: '10',
  key: '',
  amount: '1',
  unit: 'days',
  period: 'month',
  reference: 'YYYY-MM-DD',
}

function paramLabel(param: string): string {
  return paramLabels[param] ?? param
}

function paramPlaceholder(param: string): string {
  return paramPlaceholders[param] ?? ''
}

function onCategoryChange(value: string) {
  selectedCategory.value = value
  // Clear operation when category changes
  const next = { ...props.step.config }
  delete next.operation
  updateStep(props.step.id, next)
}

function onUpdate(key: string, value: string) {
  updateStep(props.step.id, { ...props.step.config, [key]: value })
}
</script>

<style scoped lang="scss">
.data-transform-step-parse {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
