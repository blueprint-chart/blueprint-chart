<script setup lang="ts">
import { samples } from '@blueprint-chart/lib'
import type { ChartSample } from '@blueprint-chart/lib'
import ChartThumbnail from '@/components/Chart/ChartThumbnail.vue'
import { getChartTypeLabel } from '@blueprint-chart/ui'
import { CHART_TYPE_GROUPS } from '@/components/Editor/editorChartTypeGroups'

defineEmits<{ select: [sample: ChartSample] }>()

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
    typeLabel: getChartTypeLabel(s.chartType),
    rowCount: rowCount(s.tsvData),
  })),
)

const ALL_SAMPLES = 'all'

const activeFilter = shallowRef(ALL_SAMPLES)

const GROUP_BY_CHART_TYPE = new Map(
  CHART_TYPE_GROUPS.flatMap(group => group.choices.map(choice => [choice.value, group.title])),
)

const SAMPLE_GROUPS = new Set(samples.map(sample => GROUP_BY_CHART_TYPE.get(sample.chartType)))

const filters = [
  { key: ALL_SAMPLES, label: `All ${samples.length}` },
  ...CHART_TYPE_GROUPS.filter(group => SAMPLE_GROUPS.has(group.title)).map(group => ({ key: group.title, label: group.title })),
]

const visibleSampleCards = computed<SampleCard[]>(() => {
  if (activeFilter.value === ALL_SAMPLES) {
    return sampleCards.value
  }
  return sampleCards.value.filter(card => GROUP_BY_CHART_TYPE.get(card.chartType) === activeFilter.value)
})
</script>

<template>
  <div class="data-upload-samples">
    <div
      class="data-upload-samples__filters"
      role="group"
      aria-label="Filter samples by chart family"
    >
      <button
        v-for="filter in filters"
        :key="filter.key"
        type="button"
        class="data-upload-samples__filters__filter"
        :aria-pressed="filter.key === activeFilter"
        @click="activeFilter = filter.key"
      >
        {{ filter.label }}
      </button>
    </div>
    <button
      v-for="sample in visibleSampleCards"
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

  &__filters {
    display: flex;
    flex-wrap: wrap;
    grid-column: 1 / -1;
    gap: 0.375rem;

    &__filter {
      padding: 0.1875rem 0.625rem;
      font-size: 0.8125rem;
      font-weight: 500;
      line-height: 1.25rem;
      color: var(--bs-secondary-color);
      background: var(--bs-body-bg);
      border: 1px solid var(--bs-border-color-translucent);
      border-radius: var(--bs-border-radius-pill);
      cursor: pointer;
      transition: border-color var(--bc-duration-base) ease, color var(--bc-duration-base) ease;

      &:hover {
        color: var(--bs-body-color);
        border-color: var(--bs-secondary-color);
      }

      &:focus-visible {
        outline: 2px solid var(--bs-focus-ring-color);
        outline-offset: 2px;
      }

      &[aria-pressed="true"] {
        color: var(--bs-body-bg);
        background: var(--bs-emphasis-color);
        border-color: var(--bs-emphasis-color);
      }
    }
  }

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
