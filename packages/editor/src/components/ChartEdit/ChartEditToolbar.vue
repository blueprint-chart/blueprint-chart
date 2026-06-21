<template>
  <div class="chart-edit-toolbar">
    <ButtonUndo
      :disabled="!canUndo"
      @click="undo"
    />
    <ButtonRedo
      :disabled="!canRedo"
      @click="redo"
    />
    <NavigationToggle
      v-model="viewModeModel"
      :options="viewModeOptions"
      size="sm"
      class="chart-edit-toolbar__view-toggle"
    />
  </div>
</template>

<script setup lang="ts">
import { ButtonUndo, ButtonRedo, NavigationToggle, useBreakpoint } from '@blueprint-chart/ui'
import { useEditorPanel } from '@/stores/editorPanel'
import { useChartHistory } from '@/stores/chartHistory'
import IconPhChartBar from '~icons/ph/chart-bar'
import IconPhColumns from '~icons/ph/columns'
import IconPhCode from '~icons/ph/code'

const editorPanel = useEditorPanel()
const { viewMode } = storeToRefs(editorPanel)
const { setViewMode } = editorPanel
const { canUndo, canRedo, undo, redo } = useChartHistory()
const { isNarrow } = useBreakpoint()

const viewModeModel = computed({
  get: () => viewMode.value,
  set: (v: string) => setViewMode(v as 'preview' | 'split' | 'dsl'),
})

// Icon-only segmented control; `title` doubles as the tooltip and the
// accessible label (the visible text label is hidden via CSS). The split
// option is hidden on narrow viewports — there is no room for a usable
// side-by-side or stacked split, so narrow offers Chart or BPC only.
const viewModeOptions = computed(() => {
  const options = [
    { value: 'preview', text: 'Chart', title: 'Chart', icon: IconPhChartBar },
    { value: 'split', text: 'Chart + BPC', title: 'Chart + BPC', icon: IconPhColumns },
    { value: 'dsl', text: 'BPC', title: 'BPC', icon: IconPhCode },
  ]
  return isNarrow.value ? options.filter(o => o.value !== 'split') : options
})
</script>

<style scoped lang="scss">
.chart-edit-toolbar {
  display: flex;
  align-items: center;
  gap: 0.25rem;

  :deep(.btn-outline-secondary) {
    border-color: transparent;
    background: transparent;

    &:hover:not(:disabled) {
      background: var(--bs-tertiary-bg);
    }
  }

  .navigation-pill {
    margin-left: auto;
  }

  // Icon-only view toggle: hide the text labels, keep the icons; the tooltip
  // (title) carries the mode name.
  &__view-toggle :deep(.navigation-segmented-control__option__label) {
    display: none;
  }
}
</style>
