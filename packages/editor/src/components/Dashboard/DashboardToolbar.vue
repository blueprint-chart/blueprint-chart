<script setup lang="ts">
import { ButtonIcon, FormControlDropdown, NavigationSegmentedControl } from '@blueprint-chart/ui'
import type { NavigationSegmentedControlItem, FormControlDropdownOption } from '@blueprint-chart/ui'
import LayoutPageHeader from '@/components/Layout/LayoutPageHeader.vue'
import LayoutBreadcrumb from '@/components/Layout/LayoutBreadcrumb.vue'
import IPhSquaresFour from '~icons/ph/squares-four'
import IPhRows from '~icons/ph/rows'
import IPhPlus from '~icons/ph/plus'

const props = defineProps<{
  chartCount: number
  sortValue: string
  layout: 'grid' | 'row'
}>()

defineEmits<{
  'update:sortValue': [value: string]
  'update:layout': [value: 'grid' | 'row']
  'new': []
}>()

const sortOptions: FormControlDropdownOption[] = [
  { value: 'date-desc', label: 'Last edited' },
  { value: 'date-asc', label: 'Oldest first' },
  { value: 'name-asc', label: 'Name A–Z' },
]

const layoutItems = computed<NavigationSegmentedControlItem[]>(() => [
  { key: 'grid', text: 'Grid', icon: IPhSquaresFour, active: props.layout === 'grid' },
  { key: 'row', text: 'List', icon: IPhRows, active: props.layout === 'row' },
])
</script>

<template>
  <LayoutPageHeader class="dashboard-toolbar">
    <template #start>
      <LayoutBreadcrumb />
      <span class="dashboard-toolbar__count">
        {{ chartCount }} {{ chartCount === 1 ? 'chart' : 'charts' }}
      </span>
    </template>
    <template #end>
      <NavigationSegmentedControl
        :items="layoutItems"
        aria-label="View layout"
        @select="$emit('update:layout', $event as 'grid' | 'row')"
      />
      <FormControlDropdown
        :model-value="sortValue"
        :options="sortOptions"
        @update:model-value="$emit('update:sortValue', $event)"
      />
      <ButtonIcon
        :icon-left="IPhPlus"
        label="New chart"
        variant="primary"
        @click="$emit('new')"
      />
    </template>
  </LayoutPageHeader>
</template>

<style scoped lang="scss">
.dashboard-toolbar {
  &__count {
    font-size: 0.8125rem;
    color: var(--bs-secondary-color);
  }
}
</style>
