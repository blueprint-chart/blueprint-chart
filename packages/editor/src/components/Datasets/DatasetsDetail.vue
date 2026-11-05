<script setup lang="ts">
import { computed } from 'vue'
import { applyTransformSteps, parseBpcData } from '@blueprint-chart/lib'
import type { TransformStep } from '@blueprint-chart/lib'
import type { Dataset } from '@/utils/datasets'
import { describeStep } from '@/components/Data/DataTransform/describeStep'
import { stepMeta } from '@/components/Data/DataTransform/transformStepIcons'

const props = defineProps<{ dataset: Dataset }>()

const table = computed(() => {
  const { columns, rows, columnTypes } = parseBpcData(props.dataset.data)
  return applyTransformSteps(props.dataset.steps as TransformStep[], columns, rows, columnTypes)
})

const previewRows = computed(() => table.value.rows.slice(0, 5))

const steps = computed(() => props.dataset.steps.map((step, index) => ({
  index,
  label: stepMeta[step.type as TransformStep['type']].label,
  description: describeStep(step),
})))
</script>

<template>
  <div class="datasets-detail">
    <section class="datasets-detail__preview">
      <h2 class="datasets-detail__preview__heading">
        Preview
      </h2>
      <div class="datasets-detail__preview__scroll">
        <table class="datasets-detail__preview__scroll__table table table-sm mb-0">
          <thead>
            <tr>
              <th
                v-for="(column, ci) in table.columns"
                :key="ci"
                class="datasets-detail__preview__scroll__table__column"
              >
                {{ column }}
                <span class="datasets-detail__preview__scroll__table__column__type">{{ table.columnTypes[ci] }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, ri) in previewRows"
              :key="ri"
              class="datasets-detail__preview__scroll__table__row"
            >
              <td
                v-for="(cell, ci) in row"
                :key="ci"
                class="datasets-detail__preview__scroll__table__row__cell"
              >
                {{ cell }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
    <section
      v-if="steps.length"
      class="datasets-detail__steps"
    >
      <h2 class="datasets-detail__steps__heading">
        Steps
      </h2>
      <ol class="datasets-detail__steps__list">
        <li
          v-for="step in steps"
          :key="step.index"
          class="datasets-detail__steps__item"
        >
          <span class="datasets-detail__steps__item__label">{{ step.label }}</span>
          <span class="datasets-detail__steps__item__description">{{ step.description }}</span>
        </li>
      </ol>
    </section>
    <section class="datasets-detail__charts">
      <h2 class="datasets-detail__charts__heading">
        Charts
      </h2>
      <ul class="datasets-detail__charts__list">
        <li
          v-for="chart in dataset.charts"
          :key="chart.id"
          class="datasets-detail__charts__list__item"
        >
          <RouterLink
            :to="`/edit/${chart.id}`"
            class="datasets-detail__charts__list__item__link"
          >
            {{ chart.title || 'Untitled' }}
          </RouterLink>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped lang="scss">
.datasets-detail {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.25rem;
  padding: 0.25rem 1rem 1.25rem;

  @media (min-width: 768px) {
    padding-left: 2.75rem;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);

    &__preview {
      grid-column: 1 / -1;
    }
  }

  &__preview,
  &__steps,
  &__charts {
    &__heading {
      margin: 0 0 0.5rem;
      font-size: var(--bs-font-size-xs);
      font-weight: 600;
      color: var(--bs-secondary-color);
    }
  }

  &__preview {
    &__scroll {
      overflow-x: auto;
      border: 1px solid var(--bs-border-color);
      border-radius: var(--bs-border-radius);

      &__table {
        --bs-table-bg: transparent;
        --bs-table-border-color: var(--bs-border-color);

        font-size: var(--bs-font-size-sm);

        &__row:last-child &__row__cell {
          border-bottom: 0;
        }

        &__column {
          font-weight: 600;
          white-space: nowrap;

          &__type {
            display: block;
            font-size: var(--bs-font-size-xs);
            font-weight: 400;
            color: var(--bs-secondary-color);
          }
        }

        &__row__cell {
          white-space: nowrap;
        }
      }
    }
  }

  &__steps {
    &__list {
      margin: 0;
      padding-left: 1.25rem;
      font-size: var(--bs-font-size-sm);
    }

    &__item {
      padding: 0.125rem 0;

      &__label {
        font-weight: 600;
        margin-right: 0.5rem;
      }

      &__description {
        color: var(--bs-secondary-color);
      }
    }
  }

  &__charts {
    &__list {
      margin: 0;
      padding: 0;
      list-style: none;
      font-size: var(--bs-font-size-sm);

      &__item {
        padding: 0.125rem 0;

        &__link {
          color: var(--bs-body-color);
          text-decoration: underline;
          text-decoration-color: var(--bs-border-color);
          text-underline-offset: 0.2em;

          &:hover {
            text-decoration-color: currentColor;
          }
        }
      }
    }
  }
}
</style>
