<template>
  <div class="samples-grid">
    <div
      v-for="sample in sampleCards"
      :key="sample.id"
      class="sample-card"
      role="button"
      tabindex="0"
      @click="$emit('select', sample.tsvData)"
      @keydown.enter="$emit('select', sample.tsvData)"
    >
      <div
        class="sample-card__icon"
        :style="{ background: sample.iconBg }"
      >
        <component
          :is="sample.icon"
          width="16"
          height="16"
        />
      </div>
      <div class="sample-card__info">
        <div class="sample-card__name">
          {{ sample.title }}
        </div>
        <div class="sample-card__meta">
          {{ rowCount(sample) }} rows · {{ colCount(sample) }} cols
          <span
            v-if="sample.tag"
            class="sample-card__tag"
            :style="{ background: sample.tagBg, color: sample.tagColor }"
          >{{ sample.tag }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Component, computed, markRaw } from 'vue'
import { samples } from '@blueprint-chart/lib'
import type { ChartSample } from '@blueprint-chart/lib'
import IPhFileText from '~icons/ph/file-text'
import IPhTrophy from '~icons/ph/trophy'
import IPhChartLineUp from '~icons/ph/chart-line-up'
import IPhUsers from '~icons/ph/users'
import IPhChartBar from '~icons/ph/chart-bar'

defineEmits<{ select: [tsvData: string] }>()

interface SampleCard extends ChartSample {
  icon: Component
  iconBg: string
  tag?: string
  tagBg?: string
  tagColor?: string
}

const SAMPLE_META: Record<string, { icon: Component, iconBg: string, tag?: string, tagBg?: string, tagColor?: string }> = {
  'olympic-medals': { icon: markRaw(IPhTrophy), iconBg: 'var(--bs-warning-bg-subtle)', tag: 'Categorical', tagBg: 'var(--bs-primary-bg-subtle)', tagColor: 'var(--bs-primary)' },
  'monthly-revenue': { icon: markRaw(IPhChartLineUp), iconBg: 'var(--bs-success-bg-subtle)', tag: 'Time series', tagBg: 'var(--bs-info-bg-subtle)', tagColor: 'var(--bs-info-text-emphasis)' },
  'population': { icon: markRaw(IPhUsers), iconBg: 'var(--bs-info-bg-subtle)', tag: 'Comparison', tagBg: 'var(--bs-success-bg-subtle)', tagColor: 'var(--bs-success-text-emphasis)' },
  'survey-results': { icon: markRaw(IPhChartBar), iconBg: 'var(--bs-danger-bg-subtle)', tag: 'Categorical', tagBg: 'var(--bs-primary-bg-subtle)', tagColor: 'var(--bs-primary)' },
}

const DEFAULT_META = { icon: markRaw(IPhFileText), iconBg: 'var(--bs-tertiary-bg)' }

const sampleCards = computed<SampleCard[]>(() =>
  samples.map(s => ({
    ...s,
    ...(SAMPLE_META[s.id] ?? DEFAULT_META),
  })),
)

function rowCount(sample: ChartSample): number {
  const lines = sample.tsvData.split('\n').filter(l => l.trim().length > 0)
  return Math.max(0, lines.length - 1)
}

function colCount(sample: ChartSample): number {
  const firstLine = sample.tsvData.split('\n')[0] ?? ''
  return firstLine.split('\t').length
}
</script>

<style scoped lang="scss">
.samples-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem;
}

.sample-card {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--bs-border-color);
  border-radius: var(--bs-border-radius);
  cursor: pointer;
  transition: all 0.15s;
  background: var(--bs-body-bg);

  &:hover {
    border-color: var(--bs-primary-border-subtle);
    background: var(--bs-primary-bg-subtle);
  }
}

.sample-card__icon {
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--bs-font-size-md);
  flex-shrink: 0;
}

.sample-card__info {
  flex: 1;
  min-width: 0;
}

.sample-card__name {
  font-size: var(--bs-font-size-sm);
  font-weight: 600;
  color: var(--bs-body-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sample-card__meta {
  font-size: var(--bs-font-size-xs);
  color: var(--bs-secondary-color);
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.sample-card__tag {
  font-size: var(--bs-font-size-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.0625rem 0.3125rem;
  border-radius: 0.1875rem;
}
</style>
