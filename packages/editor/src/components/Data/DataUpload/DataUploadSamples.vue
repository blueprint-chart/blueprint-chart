<script setup lang="ts">
import { ChartType, samples } from '@blueprint-chart/lib'
import type { ChartSample } from '@blueprint-chart/lib'
import { renderThumbnailFromDsl, svgToDataUrl } from '@/composables/useChartThumbnail'

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
}

function rowCount(tsvData: string): number {
  const lines = tsvData.split('\n').filter(l => l.trim().length > 0)
  return Math.max(0, lines.length - 1)
}

interface SampleCard extends ChartSample {
  typeLabel: string
  rowCount: number
  thumbSrc: string | undefined
}

const thumbDataUrls = reactive(new Map<string, string>())

const sampleCards = computed<SampleCard[]>(() =>
  samples.map(s => ({
    ...s,
    typeLabel: TYPE_LABELS[s.chartType] ?? s.chartType,
    rowCount: rowCount(s.tsvData),
    thumbSrc: thumbDataUrls.get(s.id),
  })),
)

onMounted(() => {
  for (const sample of samples) {
    if (sample.dsl) {
      const svg = renderThumbnailFromDsl(sample.dsl)
      if (svg) {
        thumbDataUrls.set(sample.id, svgToDataUrl(svg))
      }
    }
  }
})
</script>

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
        <img
          v-if="sample.thumbSrc"
          class="sample-card__thumb__img"
          :src="sample.thumbSrc"
          :alt="sample.title"
        >
      </div>
      <div class="sample-card__info">
        <div class="sample-card__info__name">
          {{ sample.title }}
        </div>
        <div class="sample-card__info__meta">
          {{ sample.typeLabel }}
          <span class="sample-card__info__meta__sep">&middot;</span>
          {{ sample.rowCount }} rows
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.samples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem;
}

.sample-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--bs-border-color);
  border-radius: var(--bs-border-radius);
  cursor: pointer;
  transition: all 0.15s;
  background: var(--bs-body-bg);
  overflow: hidden;

  &:hover {
    border-color: var(--bs-primary-border-subtle);
    background: var(--bs-primary-bg-subtle);
  }

  &__thumb {
    aspect-ratio: 3 / 2;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    background: var(--bs-tertiary-bg);

    &__img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  &__info {
    padding: 0.375rem 0.5rem;

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
