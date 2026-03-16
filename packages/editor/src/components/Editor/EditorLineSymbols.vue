<template>
  <div class="d-flex flex-column gap-3">
    <FormControlCheckbox
      :model-value="currentOptions.lineSymbols ?? false"
      label="Show line symbols"
      @update:model-value="(v: boolean) => setOption('lineSymbols', v)"
    />

    <EditorSymbolOptions
      v-if="currentOptions.lineSymbols"
      id-prefix="opt-line-symbol"
      :shape="currentOptions.lineSymbolShape ?? 'circle'"
      :show-on="currentOptions.lineSymbolShowOn ?? 'firstLast'"
      :style="currentOptions.lineSymbolStyle ?? 'filled'"
      :size="currentOptions.lineSymbolSize ?? '3.5'"
      :opacity="currentOptions.lineSymbolOpacity ?? '1'"
      @update:shape="(v) => setOption('lineSymbolShape', v)"
      @update:show-on="(v) => setOption('lineSymbolShowOn', v)"
      @update:style="(v) => setOption('lineSymbolStyle', v)"
      @update:size="(v) => setOption('lineSymbolSize', v)"
      @update:opacity="(v) => setOption('lineSymbolOpacity', v)"
    />
  </div>
</template>

<script setup lang="ts">
import { useChartTypeOptions } from '@/stores/chartTypeOptions'
import { FormControlCheckbox } from '@blueprint-chart/ui'
import EditorSymbolOptions from './EditorSymbolOptions.vue'

const { currentOptions, setOption } = useChartTypeOptions()
</script>
