<template>
  <div class="wizard-toolbar">
    <div class="wizard-toolbar__left">
      <NavigationStepper
        v-model:current-step="currentIndex"
        :steps="stepLabels"
        :disabled-steps="disabledSteps"
      />
    </div>
    <div class="wizard-toolbar__right">
      <template v-if="currentStep.key === 'edit'">
        <ButtonUndo
          :disabled="!canUndo"
          @click="undo"
        />
        <ButtonRedo
          :disabled="!canRedo"
          @click="redo"
        />
        <LayoutToolbarSeparator />
        <NavigationToggle
          v-model="viewModeModel"
          :options="viewModeOptions"
        />
      </template>
      <template v-else-if="currentStep.key === 'export'">
        <NavigationToggle
          v-model="viewModeModel"
          :options="viewModeOptions"
        />
      </template>
      <template v-else-if="currentStep.key === 'data'">
        <NavigationToggle
          v-model="dataViewModel"
          :options="dataViewOptions"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { NavigationStepper, NavigationToggle, LayoutToolbarSeparator, ButtonUndo, ButtonRedo } from '@blueprint-chart/ui'
import { useWizard } from '@/composables/useWizard'
import { useEditorPanel } from '@/composables/useEditorPanel'
import { useChartHistory } from '@/composables/useChartHistory'
import { useDataTable } from '@/composables/useDataTable'
import { useChartConfig } from '@/composables/useChartConfig'
import { useChartSession } from '@/composables/useChartSession'
import IPhTable from '~icons/ph/table'
import IPhChartBar from '~icons/ph/chart-bar'
import IPhExport from '~icons/ph/export'

const router = useRouter()
const { currentIndex, currentStep, steps } = useWizard()
const { viewMode, setViewMode, dataView, setDataView } = useEditorPanel()
const { canUndo, canRedo, undo, redo } = useChartHistory()
const dataTable = useDataTable()
const config = useChartConfig()
const { sessionId, createSession } = useChartSession()
const stepIcons: Record<string, typeof IPhTable> = {
  data: IPhTable,
  edit: IPhChartBar,
  export: IPhExport,
}
const stepLabels = steps.map(s => ({ label: s.label, icon: stepIcons[s.key] }))

const viewModeModel = computed({
  get: () => viewMode.value,
  set: (v: string) => setViewMode(v as 'preview' | 'dsl'),
})

const viewModeOptions = [
  { value: 'preview', text: 'Preview' },
  { value: 'dsl', text: 'DSL' },
]

const dataViewModel = computed({
  get: () => dataView.value,
  set: (v: string) => setDataView(v as 'upload' | 'structure'),
})

const hasData = computed(() => dataTable.columns.value.length > 0)

const dataViewOptions = computed(() => [
  { value: 'upload', text: 'Upload' },
  { value: 'structure', text: 'Structure', disabled: !hasData.value },
])

const disabledSteps = computed(() => {
  const hasParsed = dataTable.rows.value.length > 0
  if (!hasParsed) {
    return [1, 2]
  }
  return []
})

// Serialize data when navigating from data step to edit step
watch(currentIndex, (newIndex, oldIndex) => {
  if (oldIndex === 0 && newIndex === 1) {
    config.data.value = dataTable.serialize()
    if (dataTable.columns.value.length > 2 && !config.chartType.value.includes('multi')) {
      const hasDateLabels = dataTable.columnTypes.value[0] === 'date'
      config.chartType.value = hasDateLabels ? 'line-multi' : 'bar-multi'
    }
    if (!sessionId.value) {
      const id = createSession()
      router.replace(`/edit/${id}`)
    }
  }
})
</script>

<style scoped lang="scss">
.wizard-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background: var(--bs-navbar-bg);
  border-bottom: 1px solid var(--bs-border-color);
  flex-shrink: 0;
  min-height: 3rem;
}

.wizard-toolbar__left {
  display: flex;
  align-items: center;
}

.wizard-toolbar__right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
