<template>
  <div class="samples-grid">
    <div
      v-for="sample in sampleCards"
      :key="sample.id"
      class="sample-card"
      role="button"
      tabindex="0"
      @click="$emit('select', sample)"
      @keydown.enter="$emit('select', sample)"
    >
      <div class="sample-card__thumb">
        <component
          :is="sample.thumb"
          v-if="sample.thumb"
        />
      </div>
      <div class="sample-card__info">
        <div class="sample-card__info__name">
          {{ sample.title }}
        </div>
        <div class="sample-card__info__meta">
          {{ sample.typeLabel }}
          <span class="sample-card__info__meta__sep">&middot;</span>
          {{ rowCount(sample) }} rows
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { samples } from '@blueprint-chart/lib'
import type { ChartSample } from '@blueprint-chart/lib'

import BarVerticalThumb from '@/assets/chart-thumbnails/bar-vertical.bpc'
import BarHorizontalThumb from '@/assets/chart-thumbnails/bar-horizontal.bpc'
import BarMultiThumb from '@/assets/chart-thumbnails/bar-multi.bpc'
import LineThumb from '@/assets/chart-thumbnails/line.bpc'
import LineMultiThumb from '@/assets/chart-thumbnails/line-multi.bpc'
import DonutThumb from '@/assets/chart-thumbnails/donut.bpc'
import PieThumb from '@/assets/chart-thumbnails/pie.bpc'
import AreaThumb from '@/assets/chart-thumbnails/area.bpc'
import AreaStackedThumb from '@/assets/chart-thumbnails/area-stacked.bpc'
import ColumnStackedThumb from '@/assets/chart-thumbnails/column-stacked.bpc'
import BarStackedThumb from '@/assets/chart-thumbnails/bar-stacked.bpc'
import BarSplitThumb from '@/assets/chart-thumbnails/bar-split.bpc'

defineEmits<{ select: [sample: ChartSample] }>()

const THUMB_MAP: Record<string, Component> = {
  'bar-vertical': markRaw(BarVerticalThumb),
  'bar-horizontal': markRaw(BarHorizontalThumb),
  'bar-multi': markRaw(BarMultiThumb),
  'line': markRaw(LineThumb),
  'line-multi': markRaw(LineMultiThumb),
  'donut': markRaw(DonutThumb),
  'pie': markRaw(PieThumb),
  'area': markRaw(AreaThumb),
  'area-stacked': markRaw(AreaStackedThumb),
  'column-stacked': markRaw(ColumnStackedThumb),
  'bar-stacked': markRaw(BarStackedThumb),
  'bar-split': markRaw(BarSplitThumb),
}

const TYPE_LABELS: Record<string, string> = {
  'bar-vertical': 'Columns',
  'bar-horizontal': 'Bars',
  'bar-multi': 'Grouped Columns',
  'line': 'Line',
  'line-multi': 'Lines',
  'donut': 'Donut',
  'pie': 'Pie',
  'area': 'Area',
  'area-stacked': 'Stacked Area',
  'column-stacked': 'Stacked Columns',
  'bar-stacked': 'Stacked Bars',
  'bar-split': 'Split Bars',
}

interface SampleCard extends ChartSample {
  thumb: Component | undefined
  typeLabel: string
}

const sampleCards = computed<SampleCard[]>(() =>
  samples.map(s => ({
    ...s,
    thumb: THUMB_MAP[s.chartType],
    typeLabel: TYPE_LABELS[s.chartType] ?? s.chartType,
  })),
)

function rowCount(sample: ChartSample): number {
  const lines = sample.tsvData.split('\n').filter(l => l.trim().length > 0)
  return Math.max(0, lines.length - 1)
}
</script>

<style scoped lang="scss">
.samples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem;
}

.sample-card {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.625rem;
  border: 1px solid var(--bs-border-color);
  border-radius: var(--bs-border-radius);
  cursor: pointer;
  transition: all 0.15s;
  background: var(--bs-body-bg);

  &:hover {
    border-color: var(--bs-primary-border-subtle);
    background: var(--bs-primary-bg-subtle);
  }

  &__thumb {
    width: 2rem;
    height: 2rem;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.7;

    :deep(svg) {
      width: 100%;
      height: 100%;
    }

    .sample-card:hover & {
      opacity: 1;
    }
  }

  &__info {
    flex: 1;
    min-width: 0;

    &__name {
      font-size: var(--bs-font-size-sm);
      font-weight: 600;
      color: var(--bs-body-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &__meta {
      font-size: var(--bs-font-size-xs);
      color: var(--bs-secondary-color);

      &__sep {
        margin: 0 0.125rem;
      }
    }
  }
}
</style>
