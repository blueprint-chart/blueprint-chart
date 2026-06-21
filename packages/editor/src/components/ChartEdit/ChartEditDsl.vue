<template>
  <div class="chart-edit-dsl d-flex flex-column h-100 position-relative">
    <div
      ref="editorEl"
      class="flex-grow-1 overflow-auto"
    />
    <ButtonIcon
      :icon-left="IPhBroom"
      label="Purge defaults"
      tooltip-label="Remove options already at their default value"
      hide-label
      square
      variant="outline-secondary"
      size="sm"
      class="chart-edit-dsl__purge"
      :disabled="!canPurge"
      @click="purge"
    />
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { ButtonIcon } from '@blueprint-chart/ui'
import IPhBroom from '~icons/ph/broom'
import { useDslEditor } from '@/composables/useDslEditor'

const editorEl = useTemplateRef<HTMLElement>('editorEl')
const { purge, canPurge } = useDslEditor(editorEl)
</script>

<style scoped lang="scss">
.chart-edit-dsl__purge {
  position: absolute;
  right: 0.75rem;
  bottom: 0.75rem;
  z-index: 2;
}
</style>
