<template>
  <div class="panel-stepper-footer">
    <ButtonIcon
      v-if="!isFirst"
      :icon-left="IPhCaretLeft"
      icon-left-size="1em"
      :label="prevLabel"
      variant="outline-secondary"
      size="sm"
      @click="back"
    />
    <ButtonIcon
      v-if="!isLast"
      :icon-right="IPhCaretRight"
      icon-right-size="1em"
      :label="nextLabel"
      variant="primary"
      size="sm"
      class="ms-auto"
      @click="next"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ButtonIcon } from '@blueprint-chart/ui'
import { useWizard } from '@/composables/useWizard'
import IPhCaretLeft from '~icons/ph/caret-left'
import IPhCaretRight from '~icons/ph/caret-right'

const { steps, currentIndex, isFirst, isLast, next, back } = useWizard()

const prevLabel = computed(() => steps[currentIndex.value - 1]?.label ?? 'Previous')
const nextLabel = computed(() => steps[currentIndex.value + 1]?.label ?? 'Next')
</script>

<style scoped lang="scss">
.panel-stepper-footer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
