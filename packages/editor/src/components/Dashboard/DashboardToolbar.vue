<template>
  <div class="dashboard-toolbar">
    <div>
      <h4 class="dashboard-toolbar__title">
        Your Charts
      </h4>
      <div class="dashboard-toolbar__count">
        {{ chartCount }} {{ chartCount === 1 ? 'chart' : 'charts' }}
      </div>
    </div>
    <div class="dashboard-toolbar__right">
      <FormControlDropdown
        :model-value="sortValue"
        :options="sortOptions"
        size="sm"
        @update:model-value="$emit('update:sortValue', $event)"
      />
      <NavigationPillBase
        :items="layoutItems"
        aria-label="View layout"
        @select="$emit('update:layout', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { FormControlDropdown, NavigationPillBase } from '@blueprint-chart/ui'
import type { NavigationPillItem, FormControlDropdownOption } from '@blueprint-chart/ui'
import IPhSquaresFour from '~icons/ph/squares-four'
import IPhRows from '~icons/ph/rows'

const props = defineProps<{
  chartCount: number
  sortValue: string
  layout: 'grid' | 'row'
}>()

defineEmits<{
  'update:sortValue': [value: string]
  'update:layout': [value: 'grid' | 'row']
}>()

const sortOptions: FormControlDropdownOption[] = [
  { value: 'date-desc', label: 'Last edited' },
  { value: 'date-asc', label: 'Oldest first' },
  { value: 'name-asc', label: 'Name A\u2013Z' },
]

const layoutItems = computed<NavigationPillItem[]>(() => [
  { key: 'grid', text: 'Grid', icon: IPhSquaresFour, active: props.layout === 'grid' },
  { key: 'row', text: 'List', icon: IPhRows, active: props.layout === 'row' },
])
</script>

<style scoped lang="scss">
.dashboard-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;

  &__title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--bs-body-color);
    margin-bottom: 0;
  }

  &__count {
    font-size: 0.75rem;
    color: var(--bs-secondary-color);
    margin-top: 0.125rem;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
}
</style>
