<template>
  <div class="pipeline">
    <!-- Source block -->
    <DataTransformSourceBlock
      :columns="columns.length"
      :rows="rows.length"
    />

    <!-- Pipeline steps -->
    <template
      v-for="(step, i) in steps"
      :key="step.id"
    >
      <DataTransformConnector />
      <DataTransformStepCard
        :step="step"
        :index="i"
        :active="selectedStepId === step.id"
        @select="selectedStepId = step.id"
        @delete="onRemoveStep(step.id)"
      >
        <DataTransformStepSort
          v-if="step.type === 'sort'"
          :step="step"
          :columns="columnsAtStep"
          :column-types="columnTypesAtStep"
        />
        <DataTransformStepFilter
          v-else-if="step.type === 'filter'"
          :step="step"
          :columns="columnsAtStep"
        />
        <DataTransformStepHideColumns
          v-else-if="step.type === 'hide-columns'"
          :step="step"
          :columns="columnsAtStep"
        />
        <div
          v-else-if="step.type === 'transpose'"
          class="pipeline__config-info"
        >
          Transpose swaps rows and columns. The first column values become headers and column headers become the first column.
        </div>
        <div
          v-else
          class="text-muted text-center py-3"
        >
          Coming soon
        </div>
      </DataTransformStepCard>
    </template>

    <!-- Connector always visible (between last step or raw data and add button) -->
    <DataTransformConnector />

    <!-- Add step button -->
    <DataTransformAddButton @add="onAddStep" />

    <!-- Connector before output -->
    <DataTransformConnector />

    <!-- Output block -->
    <DataTransformOutputBlock
      :columns="transformedCols"
      :rows="transformedRows"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDataTable } from '@/composables/useDataTable'
import { useDataTransforms, type TransformType } from '@/composables/useDataTransforms'
import DataTransformSourceBlock from './DataTransformSourceBlock.vue'
import DataTransformOutputBlock from './DataTransformOutputBlock.vue'
import DataTransformStepCard from './DataTransformStepCard.vue'
import DataTransformAddButton from './DataTransformAddButton.vue'
import DataTransformConnector from './DataTransformConnector.vue'
import DataTransformStepSort from './DataTransformStepSort.vue'
import DataTransformStepFilter from './DataTransformStepFilter.vue'
import DataTransformStepHideColumns from './DataTransformStepHideColumns.vue'

const { columns, rows, columnTypes } = useDataTable()
const { steps, addStep, removeStep, applyTransforms, getColumnsAtStep } = useDataTransforms()

const selectedStepId = ref('')

const selectedStepIndex = computed(() => steps.value.findIndex(s => s.id === selectedStepId.value))

const dataAtStep = computed(() => {
  if (selectedStepIndex.value < 0) {
    return { columns: [] as string[], columnTypes: [] as string[] }
  }
  return getColumnsAtStep(selectedStepIndex.value, columns.value, rows.value, columnTypes.value)
})

const columnsAtStep = computed(() => dataAtStep.value.columns)
const columnTypesAtStep = computed(() => dataAtStep.value.columnTypes)

const transformed = computed(() => applyTransforms(columns.value, rows.value, columnTypes.value))
const transformedCols = computed(() => transformed.value.columns.length)
const transformedRows = computed(() => transformed.value.rows.length)

function onAddStep(type: string) {
  const id = addStep(type as TransformType)
  selectedStepId.value = id
}

function onRemoveStep(id: string) {
  removeStep(id)
  if (selectedStepId.value === id) {
    selectedStepId.value = steps.value.length > 0 ? steps.value[steps.value.length - 1].id : ''
  }
}
</script>

<style scoped lang="scss">
.pipeline {
  display: flex;
  flex-direction: column;
}

.pipeline__config-info {
  font-size: 0.8125rem;
  color: var(--bs-secondary-color);
  line-height: 1.5;
}
</style>
