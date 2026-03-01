<template>
  <div
    ref="panelRef"
    class="chart-edit-floating-panel"
    :style="positionStyle"
  >
    <div
      ref="headerRef"
      class="chart-edit-floating-panel__header"
    >
      <div class="chart-edit-floating-panel__title">
        <ButtonDrag />
        {{ panelTitle }}
      </div>
      <div class="chart-edit-floating-panel__actions">
        <ButtonDock @click="dock" />
        <ButtonClose @click="collapse" />
      </div>
    </div>
    <div
      ref="tabsRef"
      class="chart-edit-floating-panel__tabs"
    >
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :ref="el => { if (tab.key === activeTab) activeTabEl = el as HTMLElement | null }"
        class="chart-edit-floating-panel__tab"
        :class="tabClassList(tab.key)"
        @click="selectTab(tab.key)"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="chart-edit-floating-panel__body">
      <EditorChartTypePicker v-if="activeTab === 'type'" />
      <EditorPropertyForm v-else-if="activeTab === 'text'" />
      <EditorAppearanceTab v-else-if="activeTab === 'appearance'" />
      <EditorLayoutTab v-else-if="activeTab === 'layout'" />
      <EditorSeriesPanel v-else-if="activeTab === 'series'" />
      <EditorAxisOptions v-else-if="activeTab === 'axes'" />
      <EditorAnnotateTab v-else-if="activeTab === 'annotate'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { ButtonDock, ButtonDrag, ButtonClose } from '@blueprint-chart/ui'
import { useEditorPanel } from '@/composables/useEditorPanel'
import { useChartConfig } from '@/composables/useChartConfig'
import { useChartTypeOptions } from '@/composables/useChartTypeOptions'
import { usePanelDrag } from '@/composables/usePanelDrag'
import EditorChartTypePicker from '@/components/Editor/EditorChartTypePicker.vue'
import EditorPropertyForm from '@/components/Editor/EditorPropertyForm.vue'
import EditorAppearanceTab from '@/components/Editor/EditorAppearanceTab.vue'
import EditorLayoutTab from '@/components/Editor/EditorLayoutTab.vue'
import EditorSeriesPanel from '@/components/Editor/EditorSeriesPanel.vue'
import EditorAxisOptions from '@/components/Editor/EditorAxisOptions.vue'
import EditorAnnotateTab from '@/components/Editor/EditorAnnotateTab.vue'

const AXIS_KEYS = ['showVerticalAxis', 'verticalAxisDirection', 'showVerticalTicks', 'verticalLabelPosition', 'verticalGridStyle', 'verticalNumberFormat', 'verticalScaleType', 'verticalRangeMin', 'verticalRangeMax', 'showHorizontalAxis', 'showHorizontalTicks', 'horizontalLabelPosition', 'horizontalGridStyle', 'horizontalNumberFormat', 'horizontalScaleType', 'horizontalRangeMin', 'horizontalRangeMax']

const { activeTab, floatingPosition, dock, collapse, selectTab } = useEditorPanel()
const { chartType } = useChartConfig()
const { availableOptionKeys } = useChartTypeOptions()

const hasAxisOptions = computed(() => availableOptionKeys.value.some(k => AXIS_KEYS.includes(k)))

const props = defineProps<{
  containerRef: HTMLElement | null
}>()

const headerRef = ref<HTMLElement | null>(null)
const tabsRef = ref<HTMLElement | null>(null)
let activeTabEl: HTMLElement | null = null
const containerRefLocal = computed(() => props.containerRef)

function scrollActiveTabIntoView() {
  nextTick(() => {
    if (activeTabEl?.scrollIntoView && tabsRef.value) {
      activeTabEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  })
}

watch(() => activeTab.value, scrollActiveTabIntoView)

const panelRef = ref<HTMLElement | null>(null)

onMounted(() => {
  if (floatingPosition.value.x < 0 && props.containerRef) {
    const panelWidth = panelRef.value?.offsetWidth ?? 340
    floatingPosition.value.x = props.containerRef.clientWidth - panelWidth - 16
  }
})

usePanelDrag(
  headerRef,
  containerRefLocal,
  floatingPosition.value,
)

const tabs = computed(() => {
  const base: { key: string, label: string }[] = [
    { key: 'type', label: 'Type' },
    { key: 'text', label: 'Text' },
    { key: 'appearance', label: 'Appearance' },
    { key: 'layout', label: 'Layout' },
  ]
  if (['line-multi', 'bar-multi'].includes(chartType.value)) {
    base.push({ key: 'series', label: 'Series' })
  }
  if (hasAxisOptions.value) {
    base.push({ key: 'axes', label: 'Axes' })
  }
  base.push({ key: 'annotate', label: 'Annotate' })
  return base
})

const TAB_LABELS: Record<string, string> = {
  type: 'Chart Type',
  text: 'Text',
  appearance: 'Appearance',
  layout: 'Layout',
  series: 'Series',
  axes: 'Axes',
  annotate: 'Annotate',
}

const panelTitle = computed(() => TAB_LABELS[activeTab.value] ?? 'Panel')

function tabClassList(key: string) {
  return { 'chart-edit-floating-panel__tab--active': activeTab.value === key }
}

const positionStyle = computed(() => ({
  left: `${floatingPosition.value.x}px`,
  top: `${floatingPosition.value.y}px`,
}))
</script>

<style scoped lang="scss">
.chart-edit-floating-panel {
  position: absolute;
  width: 340px;
  min-width: 260px;
  background: var(--bs-body-bg);
  border-radius: var(--bs-border-radius-sm);
  box-shadow: var(--bs-box-shadow);
  display: flex;
  flex-direction: column;
  max-height: calc(100% - 40px);
  overflow: hidden;
  z-index: 50;
  resize: both;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.625rem 0.875rem;
    border-bottom: 1px solid var(--bs-border-color-translucent);
    cursor: grab;
    user-select: none;
    background: var(--bs-tertiary-bg);
    border-radius: inherit;

    &:active {
      cursor: grabbing;
    }
  }

  &__title {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--bs-body-color);
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  &__actions {
    display: flex;
    gap: 0.25rem;
  }

  &__tabs {
    display: flex;
    gap: 0;
    padding: 0 0.875rem;
    border-bottom: 1px solid var(--bs-border-color-translucent);
    overflow-x: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  &__tab {
    font-family: inherit;
    font-size: 0.75rem;
    font-weight: 500;
    padding: 0.5rem 0.75rem;
    white-space: nowrap;
    flex-shrink: 0;
    border: none;
    cursor: pointer;
    background: transparent;
    color: var(--bs-secondary-color);
    border-bottom: 2px solid transparent;
    transition: all 0.15s;

    &:hover {
      color: var(--bs-body-color);
    }

    &--active {
      color: var(--bs-primary);
      border-bottom-color: var(--bs-primary);
    }
  }

  &__body {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem 0.875rem 0.875rem;
  }
}
</style>
