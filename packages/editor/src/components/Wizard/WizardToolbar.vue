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
      <template v-else-if="currentStep.key === 'upload' || currentStep.key === 'check'">
        <BButton
          variant="primary"
          size="sm"
          class="fw-semibold"
          :disabled="!canAdvance"
          @click="handleAdvance"
        >
          Next
        </BButton>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { BButton } from 'bootstrap-vue-next'
import { NavigationStepper, NavigationToggle, LayoutToolbarSeparator, ButtonUndo, ButtonRedo } from '@blueprint-chart/ui'
import { useWizard } from '@/composables/useWizard'
import { useEditorPanel } from '@/composables/useEditorPanel'
import { useChartHistory } from '@/composables/useChartHistory'
import { useDataTable } from '@/composables/useDataTable'
import { useChartConfig } from '@/composables/useChartConfig'
import { useChartSession } from '@/composables/useChartSession'
import { parseDelimited } from '@/composables/useDataParser'
import IPhTable from '~icons/ph/table'
import IPhChartBar from '~icons/ph/chart-bar'
import IPhExport from '~icons/ph/export'

const router = useRouter()
const { currentIndex, currentStep, steps, next } = useWizard()
const { viewMode, setViewMode } = useEditorPanel()
const { canUndo, canRedo, undo, redo } = useChartHistory()
const dataTable = useDataTable()
const config = useChartConfig()
const { sessionId, createSession } = useChartSession()
const stepIcons: Record<string, typeof IPhTable> = {
  upload: IPhTable,
  check: IPhTable,
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

const disabledSteps = computed(() => {
  const hasData = dataTable.rawInput.value.trim().length > 0
  if (!hasData) {
    return [1, 2, 3]
  }
  const hasParsed = dataTable.rows.value.length > 0
  if (!hasParsed) {
    return [2, 3]
  }
  return []
})

const canAdvance = computed(() => {
  if (currentIndex.value === 0) {
    return dataTable.rawInput.value.trim().length > 0
  }
  if (currentIndex.value === 1) {
    return dataTable.rows.value.length > 0
  }
  return true
})

function handleAdvance() {
  if (currentIndex.value === 0) {
    const parsed = parseDelimited(dataTable.rawInput.value)
    dataTable.loadParsed(parsed)

    if (!sessionId.value) {
      const id = createSession()
      next()
      router.replace(`/edit/${id}`)
      return
    }
  }
  if (currentIndex.value === 1) {
    config.data.value = dataTable.serialize()
    if (dataTable.columns.value.length > 2 && !config.chartType.value.includes('multi')) {
      const hasDateLabels = dataTable.columnTypes.value[0] === 'date'
      config.chartType.value = hasDateLabels ? 'line-multi' : 'bar-multi'
    }
  }
  next()
}
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
