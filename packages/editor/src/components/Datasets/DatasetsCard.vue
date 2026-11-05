<script setup lang="ts">
import { computed } from 'vue'
import { ButtonIcon } from '@blueprint-chart/ui'
import type { Dataset, DatasetGroup } from '@/utils/datasets'
import DatasetsPipeline from './DatasetsPipeline.vue'
import IPhTable from '~icons/ph/table'
import IPhPlus from '~icons/ph/plus'

const props = defineProps<{ group: DatasetGroup, selected: boolean }>()
defineEmits<{ select: [], newChart: [variant: Dataset] }>()

function plural(count: number, word: string) {
  return `${count} ${count === 1 ? word : `${word}s`}`
}

const newest = computed(() => props.group.variants[0])
const newestChart = computed(() => newest.value.charts[0])
const size = computed(() => `${plural(newest.value.rowCount, 'row')} · ${plural(newest.value.columns.length, 'column')}`)
const columns = computed(() => newest.value.columns.join(', '))
const usage = computed(() => {
  const charts = props.group.variants.reduce((total, variant) => total + variant.charts.length, 0)
  return `${plural(props.group.variants.length, 'pipeline')} · ${plural(charts, 'chart')}`
})
const savedAtDate = computed<Date | ''>(() => newestChart.value.savedAt ? new Date(newestChart.value.savedAt) : '')
const lastUsed = useTimeAgo(savedAtDate)
const cardClass = computed(() => ({ 'datasets-card--selected': props.selected }))
</script>

<template>
  <article
    class="datasets-card"
    :class="cardClass"
  >
    <header class="datasets-card__header">
      <span class="datasets-card__header__icon">
        <IPhTable aria-hidden="true" />
      </span>
      <div class="datasets-card__header__text">
        <button
          type="button"
          class="datasets-card__header__text__name"
          :aria-pressed="selected"
          @click="$emit('select')"
        >
          {{ newestChart.title || 'Untitled' }}
        </button>
        <span class="datasets-card__header__text__size">{{ size }}</span>
      </div>
    </header>
    <p
      class="datasets-card__columns"
      :title="columns"
    >
      {{ columns }}
    </p>
    <ul class="datasets-card__pipelines">
      <li
        v-for="variant in group.variants"
        :key="variant.key"
        class="datasets-card__pipelines__item"
      >
        <DatasetsPipeline
          :steps="variant.steps"
          :max="1"
        />
        <ButtonIcon
          class="datasets-card__pipelines__item__action"
          :icon-left="IPhPlus"
          label="Reuse in new chart"
          hide-label
          square
          variant="outline-secondary"
          size="sm"
          @click="$emit('newChart', variant)"
        />
      </li>
    </ul>
    <footer class="datasets-card__footer">
      {{ usage }}<template v-if="newestChart.savedAt">
        · {{ lastUsed }}
      </template>
    </footer>
  </article>
</template>

<style scoped lang="scss">
.datasets-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  padding: 1rem;
  background: var(--bc-tile-bg);
  border: 1px solid var(--bc-hairline);
  border-radius: var(--bc-radius-md);
  cursor: pointer;
  transition: border-color 0.15s ease-out;

  @media (hover: hover) {
    &:hover {
      border-color: var(--bc-hairline-strong);
    }
  }

  &:has(.datasets-card__header__text__name:focus-visible) {
    box-shadow: var(--bc-focus-ring);
  }

  &--selected {
    border-color: var(--bs-emphasis-color);
    box-shadow: var(--bc-selected-ring);
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    &__icon {
      display: grid;
      place-items: center;
      flex-shrink: 0;
      width: 2rem;
      height: 2rem;
      border: 1px solid var(--bc-hairline);
      border-radius: 50%;
      color: var(--bs-secondary-color);
      font-size: 1rem;
    }

    &__text {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;

      &__name {
        padding: 0;
        border: 0;
        background: none;
        color: var(--bs-body-color);
        font-size: var(--bs-font-size-sm);
        font-weight: 600;
        text-align: left;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        outline: none;

        &::after {
          content: "";
          position: absolute;
          inset: 0;
        }
      }

      &__size {
        font-size: var(--bs-font-size-xs);
        color: var(--bs-secondary-color);
        font-variant-numeric: tabular-nums;
      }
    }
  }

  &__columns {
    margin: 0;
    font-family: var(--bs-font-monospace);
    font-size: var(--bs-font-size-xs);
    color: var(--bs-secondary-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__pipelines {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin: 0;
    padding: 0;
    list-style: none;

    &__item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;

      &__action {
        position: relative;
        z-index: 1;
        flex-shrink: 0;
      }
    }
  }

  &__footer {
    margin-top: auto;
    padding-top: 0.75rem;
    border-top: 1px solid var(--bc-hairline);
    font-size: var(--bs-font-size-xs);
    color: var(--bs-secondary-color);
    font-variant-numeric: tabular-nums;
  }
}
</style>
