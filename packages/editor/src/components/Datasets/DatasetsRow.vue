<script setup lang="ts">
import { computed } from 'vue'
import { ButtonIcon, DisplayDate } from '@blueprint-chart/ui'
import type { Dataset } from '@/utils/datasets'
import DatasetsDetail from './DatasetsDetail.vue'
import IPhCaretRight from '~icons/ph/caret-right'
import IPhPlus from '~icons/ph/plus'

const props = defineProps<{ dataset: Dataset }>()
const expanded = defineModel<boolean>('expanded', { default: false })
defineEmits<{ newChart: [] }>()

const newest = computed(() => props.dataset.charts[0])
const stepCount = computed(() => `${props.dataset.steps.length} ${props.dataset.steps.length === 1 ? 'step' : 'steps'}`)
const chartCount = computed(() => `used by ${props.dataset.charts.length} ${props.dataset.charts.length === 1 ? 'chart' : 'charts'}`)
const caretClass = computed(() => ({ 'datasets-row__summary__caret--open': expanded.value }))
</script>

<template>
  <div class="datasets-row">
    <button
      type="button"
      class="datasets-row__summary"
      :aria-expanded="expanded"
      @click="expanded = !expanded"
    >
      <IPhCaretRight
        class="datasets-row__summary__caret"
        :class="caretClass"
        aria-hidden="true"
      />
      <strong class="datasets-row__summary__name">{{ newest.title || 'Untitled' }}</strong>
      <span class="datasets-row__summary__meta">
        <span class="datasets-row__summary__meta__item">{{ dataset.rowCount }} × {{ dataset.columnCount }}</span>
        <span class="datasets-row__summary__meta__item">{{ stepCount }}</span>
        <span class="datasets-row__summary__meta__item">{{ chartCount }}</span>
        <DisplayDate
          v-if="newest.savedAt"
          class="datasets-row__summary__meta__item"
          :value="newest.savedAt"
        />
      </span>
    </button>
    <ButtonIcon
      class="datasets-row__action"
      :icon-left="IPhPlus"
      label="New chart"
      variant="outline-secondary"
      size="sm"
      @click="$emit('newChart')"
    />
    <DatasetsDetail
      v-if="expanded"
      class="datasets-row__detail"
      :dataset="dataset"
    />
  </div>
</template>

<style scoped lang="scss">
.datasets-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  column-gap: 0.75rem;
  padding-right: 1rem;

  & + & {
    border-top: 1px solid var(--bs-border-color);
  }

  &__summary {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.25rem 0.75rem;
    min-width: 0;
    padding: 0.875rem 0 0.875rem 1rem;
    border: 0;
    background: none;
    color: var(--bs-body-color);
    text-align: left;

    &:focus-visible {
      outline: 2px solid var(--bs-focus-ring-color);
      outline-offset: -2px;
    }

    &__caret {
      flex-shrink: 0;
      width: 1rem;
      height: 1rem;
      color: var(--bs-secondary-color);
      transition: transform 0.15s ease;

      &--open {
        transform: rotate(90deg);
      }

      @media (prefers-reduced-motion: reduce) {
        transition: none;
      }
    }

    &__name {
      font-size: var(--bs-font-size-sm);
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      @media (max-width: 767.98px) {
        flex: 1 1 0;
        white-space: normal;
      }
    }

    &__meta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem 0.75rem;
      font-size: var(--bs-font-size-sm);
      color: var(--bs-secondary-color);

      @media (max-width: 767.98px) {
        flex-basis: 100%;
        padding-left: 1.75rem;
      }

      &__item {
        white-space: nowrap;
      }
    }
  }

  &__detail {
    grid-column: 1 / -1;
  }
}
</style>
