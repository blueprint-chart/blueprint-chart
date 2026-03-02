<template>
  <div class="data-column-pills">
    <button
      v-for="(col, ci) in columns"
      :key="ci"
      class="data-column-pill"
      :class="[chipClass(columnTypes[ci]), { 'data-column-pill--selected': selected === ci }]"
      @click="$emit('select', ci)"
    >
      <span
        class="data-column-pill__dot"
        :class="dotClass(columnTypes[ci])"
      />
      {{ col }}
      <span class="data-column-pill__type">&middot; {{ columnTypes[ci] || 'string' }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { ColumnType } from '@/composables/useDataParser'

defineProps<{
  columns: string[]
  columnTypes: ColumnType[]
  selected?: number
}>()

defineEmits<{ select: [index: number] }>()

function chipClass(ct: ColumnType | undefined): string {
  if (ct === 'number') {
    return 'data-column-pill--number'
  }
  if (ct === 'date') {
    return 'data-column-pill--date'
  }
  return 'data-column-pill--string'
}

function dotClass(ct: ColumnType | undefined): string {
  if (ct === 'number') {
    return 'data-column-pill__dot--number'
  }
  if (ct === 'date') {
    return 'data-column-pill__dot--date'
  }
  return 'data-column-pill__dot--string'
}
</script>

<style scoped lang="scss">
.data-column-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.data-column-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.3125rem;
  padding: 0.25rem 0.625rem;
  border-radius: 0.25rem;
  border: 1px solid transparent;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: filter 0.15s, border-color 0.15s, box-shadow 0.15s;

  &:hover {
    filter: brightness(0.95);
  }

  &--selected {
    border-color: var(--bs-body-color);
    box-shadow: 0 0 0 1px var(--bs-body-color);
  }

  &--string {
    background: var(--bs-secondary-bg);
    color: var(--bs-secondary-text-emphasis);
  }

  &--number {
    background: var(--bs-primary-bg-subtle);
    color: var(--bs-primary-text-emphasis);
  }

  &--date {
    background: var(--bs-success-bg-subtle);
    color: var(--bs-success-text-emphasis);
  }
}

.data-column-pill__type {
  font-weight: 400;
  opacity: 0.6;
}

.data-column-pill__dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  flex-shrink: 0;

  &--number {
    background: var(--bs-primary);
  }

  &--date {
    background: var(--bs-success);
  }

  &--string {
    background: var(--bs-secondary-color);
  }
}
</style>
