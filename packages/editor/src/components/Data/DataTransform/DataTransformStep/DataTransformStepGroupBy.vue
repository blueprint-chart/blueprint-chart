<template>
  <div class="group-by-step">
    <div class="group-by-step__field">
      <label class="group-by-step__field__label">Group by</label>
      <div class="group-by-step__field__columns">
        <label
          v-for="col in columns"
          :key="col"
          class="group-by-step__field__columns__column"
        >
          <input
            type="checkbox"
            :checked="selectedGroupColumns.includes(col)"
            @change="toggleGroupColumn(col)"
          >
          {{ col }}
        </label>
      </div>
    </div>
    <div
      v-if="availableAggColumns.length > 0 || selectedGroupColumns.length > 0"
      class="group-by-step__field"
    >
      <label class="group-by-step__field__label">Aggregates</label>
      <div class="group-by-step__field__agg-list">
        <div class="group-by-step__field__agg-list__row">
          <label class="group-by-step__field__agg-list__row__check">
            <input
              type="checkbox"
              :checked="hasCountAgg"
              @change="toggleCountAgg"
            >
            Row count
          </label>
          <span class="group-by-step__field__agg-list__row__fn-label">count</span>
        </div>
        <div
          v-for="col in availableAggColumns"
          :key="col"
          class="group-by-step__field__agg-list__row"
        >
          <label class="group-by-step__field__agg-list__row__check">
            <input
              type="checkbox"
              :checked="isAggEnabled(col)"
              @change="toggleAgg(col)"
            >
            {{ col }}
          </label>
          <select
            v-if="isAggEnabled(col)"
            class="group-by-step__field__agg-list__row__fn"
            :value="getAggFn(col)"
            @change="setAggFn(col, ($event.target as HTMLSelectElement).value)"
          >
            <option value="sum">
              Sum
            </option>
            <option value="avg">
              Average
            </option>
            <option value="min">
              Min
            </option>
            <option value="max">
              Max
            </option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDataTransforms, type TransformStep } from '@/stores/dataTransforms'
import type { ColumnType } from '@/composables/useDataParser'

const props = defineProps<{
  step: TransformStep
  columns: string[]
  columnTypes: ColumnType[]
}>()

const { updateStep } = useDataTransforms()

const selectedGroupColumns = computed(() => {
  if (props.step.config.groupColumns) {
    return props.step.config.groupColumns.split(',').map(c => c.trim()).filter(Boolean)
  }
  return []
})

const availableAggColumns = computed(() =>
  props.columns.filter(c => !selectedGroupColumns.value.includes(c)),
)

const parsedAggregates = computed(() => {
  if (!props.step.config.aggregates) {
    return []
  }
  return props.step.config.aggregates.split(',').map(a => a.trim()).filter(Boolean).map((entry) => {
    const sep = entry.lastIndexOf(':')
    if (sep < 0) {
      return null
    }
    return { col: entry.slice(0, sep), fn: entry.slice(sep + 1) }
  }).filter((a): a is { col: string, fn: string } => a !== null)
})

const hasCountAgg = computed(() =>
  parsedAggregates.value.some(a => a.fn === 'count'),
)

function isAggEnabled(col: string): boolean {
  return parsedAggregates.value.some(a => a.col === col && a.fn !== 'count')
}

function getAggFn(col: string): string {
  const agg = parsedAggregates.value.find(a => a.col === col && a.fn !== 'count')
  return agg?.fn ?? 'sum'
}

function serializeAggregates(aggs: { col: string, fn: string }[]): string {
  return aggs.map(a => `${a.col}:${a.fn}`).join(',')
}

function emitUpdate(groupColumns: string[], aggs: { col: string, fn: string }[]) {
  const config: Record<string, string> = { ...props.step.config }
  if (groupColumns.length > 0) {
    config.groupColumns = groupColumns.join(',')
  }
  else {
    delete config.groupColumns
  }
  if (aggs.length > 0) {
    config.aggregates = serializeAggregates(aggs)
  }
  else {
    delete config.aggregates
  }
  updateStep(props.step.id, config)
}

function toggleGroupColumn(col: string) {
  const current = [...selectedGroupColumns.value]
  const idx = current.indexOf(col)
  if (idx >= 0) {
    current.splice(idx, 1)
  }
  else {
    current.push(col)
  }
  // Remove aggregates for columns that are now group columns
  const aggs = parsedAggregates.value.filter(a => a.fn === 'count' || !current.includes(a.col))
  emitUpdate(current, aggs)
}

function toggleCountAgg() {
  const aggs = [...parsedAggregates.value]
  const idx = aggs.findIndex(a => a.fn === 'count')
  if (idx >= 0) {
    aggs.splice(idx, 1)
  }
  else {
    aggs.push({ col: 'rows', fn: 'count' })
  }
  emitUpdate(selectedGroupColumns.value, aggs)
}

function toggleAgg(col: string) {
  const aggs = [...parsedAggregates.value]
  const idx = aggs.findIndex(a => a.col === col && a.fn !== 'count')
  if (idx >= 0) {
    aggs.splice(idx, 1)
  }
  else {
    aggs.push({ col, fn: 'sum' })
  }
  emitUpdate(selectedGroupColumns.value, aggs)
}

function setAggFn(col: string, fn: string) {
  const aggs = parsedAggregates.value.map(a => (a.col === col && a.fn !== 'count') ? { ...a, fn } : a)
  emitUpdate(selectedGroupColumns.value, aggs)
}
</script>

<style scoped lang="scss">
.group-by-step {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &__field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    &__label {
      font-size: var(--bs-font-size-xs);
      font-weight: 600;
      color: var(--bs-secondary-color);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    &__columns {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;

      &__column {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: var(--bs-font-size-sm);
        color: var(--bs-body-color);
        cursor: pointer;
        padding: 0.25rem 0.5rem;
        border: 1px solid var(--bs-border-color);
        border-radius: var(--bs-border-radius);
        background: var(--bs-body-bg);
        transition: all 0.15s;

        &:hover {
          border-color: var(--bs-primary);
        }

        &:has(input:checked) {
          border-color: var(--bs-primary);
          background: var(--bs-primary-bg-subtle);
          color: var(--bs-primary);
        }

        input {
          accent-color: var(--bs-primary);
        }
      }
    }

    &__agg-list {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      &__row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--bs-font-size-sm);

        &__check {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          cursor: pointer;
          flex: 1;
          min-width: 0;

          input {
            accent-color: var(--bs-primary);
          }
        }

        &__fn {
          font-size: var(--bs-font-size-sm);
          padding: 0.125rem 0.375rem;
          border: 1px solid var(--bs-border-color);
          border-radius: var(--bs-border-radius);
          background: var(--bs-body-bg);
          color: var(--bs-body-color);
        }

        &__fn-label {
          font-size: var(--bs-font-size-sm);
          color: var(--bs-secondary-color);
          font-style: italic;
        }
      }
    }
  }
}
</style>
