<script setup lang="ts">
import { ChartType, samples } from '@blueprint-chart/lib'
import type { ChartSample } from '@blueprint-chart/lib'
import ChartThumbnail from '@/components/Chart/ChartThumbnail.vue'

defineEmits<{ select: [sample: ChartSample] }>()

const TYPE_LABELS: Record<string, string> = {
  [ChartType.BarVertical]: 'Columns',
  [ChartType.BarHorizontal]: 'Bars',
  [ChartType.BarMulti]: 'Grouped Columns',
  [ChartType.Line]: 'Line',
  [ChartType.LineMulti]: 'Lines',
  [ChartType.Donut]: 'Donut',
  [ChartType.Pie]: 'Pie',
  [ChartType.Area]: 'Area',
  [ChartType.AreaStacked]: 'Stacked Area',
  [ChartType.ColumnStacked]: 'Stacked Columns',
  [ChartType.BarStacked]: 'Stacked Bars',
  [ChartType.BarSplit]: 'Split Bars',
  [ChartType.BarGrouped]: 'Grouped Bars',
  [ChartType.Scatter]: 'Scatter',
  [ChartType.DotPlot]: 'Dot plot',
}

function rowCount(tsvData: string): number {
  const lines = tsvData.split('\n').filter(l => l.trim().length > 0)
  return Math.max(0, lines.length - 1)
}

interface SampleCard extends ChartSample {
  typeLabel: string
  rowCount: number
}

const sampleCards = computed<SampleCard[]>(() =>
  samples.map(s => ({
    ...s,
    typeLabel: TYPE_LABELS[s.chartType] ?? s.chartType,
    rowCount: rowCount(s.tsvData),
  })),
)
</script>

<template>
  <div class="data-upload-samples">
    <button
      v-for="sample in sampleCards"
      :key="sample.id"
      type="button"
      class="data-upload-samples__card"
      @click="$emit('select', sample)"
    >
      <span
        class="data-upload-samples__card__preview"
        aria-hidden="true"
      >
        <ChartThumbnail
          :dsl="sample.dsl"
          class="data-upload-samples__card__preview__thumb"
        />
      </span>
      <span class="data-upload-samples__card__title">
        {{ sample.title }}
      </span>
      <span class="data-upload-samples__card__meta">
        {{ sample.typeLabel }} &middot; {{ sample.rowCount }} rows
      </span>
    </button>
  </div>
</template>

<style scoped lang="scss">
.data-upload-samples {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
  gap: 0.75rem;
  width: 100%;

  &__card {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 0;
    color: inherit;
    text-align: start;
    background: var(--bs-body-bg);
    border: 1px solid var(--bs-border-color-translucent);
    border-radius: 0.5rem;
    cursor: pointer;
    transition: border-color var(--bc-duration-base) ease;

    &:hover {
      border-color: var(--bs-secondary-color);
    }

    &:focus-visible {
      outline: 2px solid var(--bs-focus-ring-color);
      outline-offset: 2px;
    }

    &:not(:hover, :focus-visible) &__preview__thumb {
      filter: grayscale(1);
      opacity: 0.55;
    }

    &__preview {
      display: block;
      aspect-ratio: 3 / 2;
      background: var(--bs-tertiary-bg);
      border-bottom: 1px solid var(--bs-border-color-translucent);
      transition: background-color var(--bc-duration-base) ease;

      .data-upload-samples__card:hover & {
        background: var(--bs-secondary-bg);
      }

      &__thumb {
        transition: filter var(--bc-duration-base) ease, opacity var(--bc-duration-base) ease;
      }
    }

    &__title {
      display: -webkit-box;
      overflow: hidden;
      padding: 0.5rem 0.625rem 0.125rem;
      font-size: 0.8125rem;
      font-weight: 500;
      line-height: 1.3;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    &__meta {
      padding: 0 0.625rem 0.5rem;
      font-size: var(--bs-font-size-xs);
      color: var(--bs-secondary-color);
    }
  }
}
</style>
