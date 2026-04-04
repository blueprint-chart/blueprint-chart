<template>
  <button
    class="reco-card"
    :class="{ 'reco-card--best': fitness === 'best' }"
    @click="$emit('select', chartType)"
  >
    <div class="reco-card__preview">
      <component
        :is="thumbComponent"
        v-if="thumbComponent"
        class="reco-card__preview__thumb-svg"
      />
    </div>
    <div class="reco-card__body">
      <div class="reco-card__body__title">
        {{ label }}
        <span
          class="reco-card__body__title__badge"
          :class="badgeClass"
        >{{ fitnessLabel }}</span>
      </div>
      <div class="reco-card__body__reason">
        {{ reason }}
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import BarVerticalThumb from '@/assets/chart-thumbnails/bar-vertical.bpc'
import BarHorizontalThumb from '@/assets/chart-thumbnails/bar-horizontal.bpc'
import BarMultiThumb from '@/assets/chart-thumbnails/bar-multi.bpc'
import LineThumb from '@/assets/chart-thumbnails/line.bpc'
import LineMultiThumb from '@/assets/chart-thumbnails/line-multi.bpc'
import DonutThumb from '@/assets/chart-thumbnails/donut.bpc'
import PieThumb from '@/assets/chart-thumbnails/pie.bpc'

const THUMB_MAP: Record<string, Component> = {
  'bar-vertical': markRaw(BarVerticalThumb),
  'bar-horizontal': markRaw(BarHorizontalThumb),
  'bar-multi': markRaw(BarMultiThumb),
  'line': markRaw(LineThumb),
  'line-multi': markRaw(LineMultiThumb),
  'donut': markRaw(DonutThumb),
  'pie': markRaw(PieThumb),
}

const props = defineProps<{
  chartType: string
  label: string
  fitness: 'best' | 'good' | 'alternative'
  reason: string
}>()

defineEmits<{ select: [chartType: string] }>()

const thumbComponent = computed(() => THUMB_MAP[props.chartType])

const badgeClass = computed(() => {
  if (props.fitness === 'best') {
    return 'reco-card__body__title__badge--best'
  }
  if (props.fitness === 'good') {
    return 'reco-card__body__title__badge--good'
  }
  return 'reco-card__body__title__badge--alt'
})

const fitnessLabel = computed(() => {
  if (props.fitness === 'best') {
    return 'Best match'
  }
  if (props.fitness === 'good') {
    return 'Good fit'
  }
  return 'Alternative'
})
</script>

<style scoped lang="scss">
.reco-card {
  display: block;
  width: 100%;
  border: 1px solid var(--bs-border-color);
  border-radius: var(--bs-border-radius);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.15s;
  background: var(--bs-body-bg);
  color: var(--bs-body-color);
  text-align: left;
  padding: 0;

  &:hover {
    border-color: var(--bs-primary-border-subtle);
    box-shadow: 0 0 0 2px var(--bs-primary-bg-subtle);
  }

  &--best {
    border-color: var(--bs-success);
  }

  & + & {
    margin-top: 0.625rem;
  }

  &__preview {
    height: 6rem;
    background: var(--bs-tertiary-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid var(--bs-border-color);
    overflow: hidden;

    .reco-card--best & {
      background: var(--bs-success-bg-subtle);
      border-bottom-color: var(--bs-success-bg-subtle);
    }

    &__thumb-svg {
      width: 100%;
      height: 100%;
      padding: 0.5rem;
      opacity: 0.8;

      :deep(svg) {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }
  }

  &__body {
    padding: 0.5rem 0.625rem;

    &__title {
      font-size: var(--bs-font-size-sm);
      font-weight: 700;
      color: var(--bs-body-color);
      display: flex;
      align-items: center;
      gap: 0.375rem;

      &__badge {
        font-size: var(--bs-font-size-xs);
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 1px 0.25rem;
        border-radius: 0.25rem;

        &--best {
          background: var(--bs-success-bg-subtle);
          color: var(--bs-success-text-emphasis);
        }

        &--good {
          background: var(--bs-primary-bg-subtle);
          color: var(--bs-primary-text-emphasis);
        }

        &--alt {
          background: var(--bs-secondary-bg);
          color: var(--bs-secondary-color);
        }
      }
    }

    &__reason {
      font-size: var(--bs-font-size-xs);
      color: var(--bs-secondary-color);
      margin-top: 0.125rem;
    }
  }
}
</style>
