<script setup lang="ts">
import { computed } from 'vue'
import type { TransformStep } from '@blueprint-chart/lib'
import type { DatasetStep } from '@/utils/datasets'
import { stepMeta } from '@/components/Data/DataTransform/transformStepIcons'
import IPhArrowRight from '~icons/ph/arrow-right'

const props = withDefaults(defineProps<{ steps: DatasetStep[], max?: number }>(), { max: Infinity })

const labels = computed(() => props.steps.map((step, index) => ({
  index,
  label: stepMeta[step.type as TransformStep['type']].label,
})))
const hidden = computed(() => labels.value.slice(0, Math.max(0, labels.value.length - props.max)))
const shown = computed(() => labels.value.slice(hidden.value.length))
const hiddenTitle = computed(() => hidden.value.map(step => step.label).join(' → '))
</script>

<template>
  <ol
    class="datasets-pipeline"
    aria-label="Pipeline"
  >
    <li class="datasets-pipeline__step datasets-pipeline__step--source">
      Raw data
    </li>
    <li
      v-if="hidden.length"
      class="datasets-pipeline__step"
      :title="hiddenTitle"
      :aria-label="hiddenTitle"
    >
      <IPhArrowRight
        class="datasets-pipeline__step__arrow"
        aria-hidden="true"
      />
      <span class="datasets-pipeline__step__label datasets-pipeline__step__label--more">+{{ hidden.length }}</span>
    </li>
    <li
      v-for="step in shown"
      :key="step.index"
      class="datasets-pipeline__step"
    >
      <IPhArrowRight
        class="datasets-pipeline__step__arrow"
        aria-hidden="true"
      />
      <span class="datasets-pipeline__step__label">{{ step.label }}</span>
    </li>
  </ol>
</template>

<style scoped lang="scss">
.datasets-pipeline {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  min-width: 0;
  overflow: hidden;
  margin: 0;
  padding: 0;
  list-style: none;

  &__step {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    gap: 0.25rem;
    font-size: var(--bs-font-size-xs);
    white-space: nowrap;

    &__arrow {
      flex-shrink: 0;
      color: var(--bs-secondary-color);
    }

    &__label,
    &--source {
      padding: 0.125rem 0.5rem;
      border: 1px solid var(--bc-hairline);
      border-radius: var(--bs-border-radius-pill);
      background: var(--bc-tile-bg-elevated);
    }

    &--source {
      color: var(--bs-secondary-color);
      background: none;
    }

    &__label--more {
      color: var(--bs-secondary-color);
      font-variant-numeric: tabular-nums;
    }
  }
}
</style>
