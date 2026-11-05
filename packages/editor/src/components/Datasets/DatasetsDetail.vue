<script setup lang="ts">
import { computed } from 'vue'
import { ButtonIcon } from '@blueprint-chart/ui'
import { applyTransformSteps, parseBpcData } from '@blueprint-chart/lib'
import type { TransformStep } from '@blueprint-chart/lib'
import type { Dataset, DatasetGroup } from '@/utils/datasets'
import { describeStep } from '@/components/Data/DataTransform/describeStep'
import { stepMeta } from '@/components/Data/DataTransform/transformStepIcons'
import DashboardMetaChip from '@/components/Dashboard/DashboardMetaChip.vue'
import IPhPlus from '~icons/ph/plus'
import DatasetsPipeline from './DatasetsPipeline.vue'

const props = defineProps<{ group: DatasetGroup, thumbnails: Record<string, string> }>()
const pipeline = defineModel<string>('pipeline', { required: true })
defineEmits<{ newChart: [variant: Dataset] }>()

const dataset = computed(() => props.group.variants.find(v => v.key === pipeline.value) ?? props.group.variants[0])

function pipelineClass(key: string) {
  return { 'datasets-detail__pipelines__list__item__button--active': key === dataset.value.key }
}

const table = computed(() => {
  const { columns, rows, columnTypes } = parseBpcData(dataset.value.data)
  return applyTransformSteps(dataset.value.steps as TransformStep[], columns, rows, columnTypes)
})

const previewRows = computed(() => table.value.rows.slice(0, 5))
const caption = computed(() => {
  const total = `${table.value.rows.length} ${table.value.rows.length === 1 ? 'row' : 'rows'}`
  return previewRows.value.length < table.value.rows.length ? `First ${previewRows.value.length} of ${total}` : total
})

const steps = computed(() => dataset.value.steps.map((step, index) => ({
  index,
  label: stepMeta[step.type as TransformStep['type']].label,
  description: describeStep(step, ''),
})))

const chips = computed(() => [
  { label: 'Rows', value: String(table.value.rows.length) },
  { label: 'Columns', value: String(table.value.columns.length) },
  { label: 'Steps', value: String(dataset.value.steps.length) },
  { label: 'Charts', value: String(dataset.value.charts.length) },
])

function columnClass(ci: number) {
  return { 'datasets-detail__table__scroll__table__column--numeric': table.value.columnTypes[ci] === 'number' }
}

function cellClass(ci: number) {
  return { 'datasets-detail__table__scroll__table__row__cell--numeric': table.value.columnTypes[ci] === 'number' }
}
</script>

<template>
  <div class="datasets-detail">
    <section
      v-if="group.variants.length > 1"
      class="datasets-detail__pipelines"
    >
      <h2 class="datasets-detail__pipelines__heading">
        Pipelines
      </h2>
      <ul class="datasets-detail__pipelines__list">
        <li
          v-for="variant in group.variants"
          :key="variant.key"
          class="datasets-detail__pipelines__list__item"
        >
          <button
            type="button"
            class="datasets-detail__pipelines__list__item__button"
            :class="pipelineClass(variant.key)"
            :aria-pressed="variant.key === dataset.key"
            @click="pipeline = variant.key"
          >
            <DatasetsPipeline
              :steps="variant.steps"
              :max="1"
            />
          </button>
        </li>
      </ul>
    </section>
    <ButtonIcon
      class="datasets-detail__action"
      :icon-left="IPhPlus"
      label="Reuse in new chart"
      variant="strong"
      block
      @click="$emit('newChart', dataset)"
    />
    <div class="datasets-detail__chips">
      <DashboardMetaChip
        v-for="chip in chips"
        :key="chip.label"
        :label="chip.label"
        :value="chip.value"
      />
    </div>
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
          class="datasets-detail__steps__list__item"
        >
          <span class="datasets-detail__steps__list__item__index">{{ step.index + 1 }}</span>
          <span class="datasets-detail__steps__list__item__label">{{ step.label }}</span>
          <span
            v-if="step.description"
            class="datasets-detail__steps__list__item__description"
          >{{ step.description }}</span>
        </li>
      </ol>
    </section>
    <section class="datasets-detail__table">
      <h2 class="datasets-detail__table__heading">
        Data
      </h2>
      <p class="datasets-detail__table__caption">
        {{ caption }}
      </p>
      <div class="datasets-detail__table__scroll">
        <table class="datasets-detail__table__scroll__table table table-sm mb-0">
          <thead>
            <tr>
              <th
                v-for="(column, ci) in table.columns"
                :key="ci"
                class="datasets-detail__table__scroll__table__column"
                :class="columnClass(ci)"
              >
                {{ column }}
                <span class="datasets-detail__table__scroll__table__column__type">{{ table.columnTypes[ci] }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, ri) in previewRows"
              :key="ri"
              class="datasets-detail__table__scroll__table__row"
            >
              <td
                v-for="(cell, ci) in row"
                :key="ci"
                class="datasets-detail__table__scroll__table__row__cell"
                :class="cellClass(ci)"
              >
                {{ cell }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
    <section class="datasets-detail__charts">
      <h2 class="datasets-detail__charts__heading">
        Used by
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
            <span class="datasets-detail__charts__list__item__link__thumb">
              <img
                v-if="thumbnails[chart.id]"
                :src="thumbnails[chart.id]"
                alt=""
                class="datasets-detail__charts__list__item__link__thumb__img"
              >
            </span>
            <span class="datasets-detail__charts__list__item__link__title">{{ chart.title || 'Untitled' }}</span>
          </RouterLink>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped lang="scss">
.datasets-detail {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  &__chips {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  &__pipelines {
    &__list {
      display: flex;
      flex-direction: column;
      margin: 0;
      padding: 0;
      list-style: none;
      border: 1px solid var(--bc-hairline);
      border-radius: var(--bc-radius-xs);
      overflow: hidden;

      &__item {
        & + & {
          border-top: 1px solid var(--bc-hairline);
        }

        &__button {
          display: block;
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 0;
          background: none;
          color: var(--bs-body-color);
          text-align: left;
          transition: background-color 0.15s ease-out;

          @media (hover: hover) {
            &:hover {
              background-color: var(--bs-tertiary-bg);
            }
          }

          &:focus-visible {
            outline: 2px solid var(--bs-focus-ring-color);
            outline-offset: -2px;
          }

          &--active {
            background-color: var(--bs-tertiary-bg);
            box-shadow: inset 2px 0 0 var(--bs-emphasis-color);
          }
        }
      }
    }
  }

  &__pipelines,
  &__steps,
  &__table,
  &__charts {
    &__heading {
      margin: 0 0 0.625rem;
      font-size: var(--bs-font-size-xs);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--bs-secondary-color);
    }
  }

  &__steps {
    &__list {
      display: flex;
      flex-direction: column;
      margin: 0;
      padding: 0;
      list-style: none;
      font-size: var(--bs-font-size-sm);
      border: 1px solid var(--bc-hairline);
      border-radius: var(--bc-radius-xs);

      &__item {
        display: flex;
        align-items: baseline;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;

        & + & {
          border-top: 1px solid var(--bc-hairline);
        }

        &__index {
          min-width: 1rem;
          font-size: var(--bs-font-size-xs);
          font-variant-numeric: tabular-nums;
          color: var(--bs-secondary-color);
        }

        &__label {
          font-weight: 600;
        }

        &__description {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: var(--bs-secondary-color);
        }
      }
    }
  }

  &__table {
    &__caption {
      margin: -0.375rem 0 0.5rem;
      font-size: var(--bs-font-size-xs);
      color: var(--bs-secondary-color);
      font-variant-numeric: tabular-nums;
    }

    &__scroll {
      overflow-x: auto;
      border: 1px solid var(--bc-hairline);
      border-radius: var(--bc-radius-xs);

      &__table {
        --bs-table-bg: transparent;
        --bs-table-border-color: var(--bc-hairline);

        font-size: var(--bs-font-size-sm);

        &__row:last-child &__row__cell {
          border-bottom: 0;
        }

        &__column {
          font-weight: 600;
          white-space: nowrap;

          &--numeric {
            text-align: end;
          }

          &__type {
            display: block;
            font-size: var(--bs-font-size-xs);
            font-weight: 400;
            color: var(--bs-secondary-color);
          }
        }

        &__row__cell {
          white-space: nowrap;

          &--numeric {
            text-align: end;
            font-variant-numeric: tabular-nums;
          }
        }
      }
    }
  }

  &__charts {
    &__list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(7rem, 1fr));
      gap: 0.5rem;
      margin: 0;
      padding: 0;
      list-style: none;

      &__item {
        min-width: 0;

        &__link {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
          color: var(--bs-body-color);
          text-decoration: none;

          &__thumb {
            display: block;
            aspect-ratio: 4 / 3;
            padding: 0.375rem;
            border: 1px solid var(--bc-hairline);
            border-radius: var(--bc-radius-xs);
            background: var(--bc-tile-bg);
            transition: border-color 0.15s ease-out;

            &__img {
              display: block;
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
          }

          &__title {
            font-size: var(--bs-font-size-xs);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          @media (hover: hover) {
            &:hover &__thumb {
              border-color: var(--bc-hairline-strong);
            }
          }

          &:focus-visible {
            outline: none;
          }

          &:focus-visible &__thumb {
            box-shadow: var(--bc-focus-ring);
          }
        }
      }
    }
  }
}
</style>
