<script setup lang="ts">
import { ButtonIcon, NavigationSegmentedControl } from '@blueprint-chart/ui'
import type { NavigationSegmentedControlItem } from '@blueprint-chart/ui'
import LayoutPageHeader from '@/components/Layout/LayoutPageHeader.vue'
import LayoutBreadcrumb from '@/components/Layout/LayoutBreadcrumb.vue'
import IPhPalette from '~icons/ph/palette'
import IPhPlus from '~icons/ph/plus'
import IPhTag from '~icons/ph/tag'

export type PalettesTab = 'palettes' | 'categories'

const tab = defineModel<PalettesTab>('tab', { required: true })

defineProps<{
  count: string
}>()

defineEmits<{
  action: []
}>()

const tabItems = computed<NavigationSegmentedControlItem[]>(() => [
  { key: 'palettes', text: 'Palettes', icon: IPhPalette, active: tab.value === 'palettes' },
  { key: 'categories', text: 'Category colors', icon: IPhTag, active: tab.value === 'categories' },
])

const actionLabel = computed(() => tab.value === 'palettes' ? 'New palette' : 'Add color')
</script>

<template>
  <LayoutPageHeader class="palettes-toolbar">
    <template #start>
      <LayoutBreadcrumb />
      <span class="palettes-toolbar__count">{{ count }}</span>
    </template>
    <template #end>
      <NavigationSegmentedControl
        :items="tabItems"
        aria-label="Palettes sections"
        @select="tab = $event as PalettesTab"
      />
      <ButtonIcon
        class="palettes-toolbar__action"
        :icon-left="IPhPlus"
        :label="actionLabel"
        variant="primary"
        @click="$emit('action')"
      />
    </template>
  </LayoutPageHeader>
</template>

<style scoped lang="scss">
.palettes-toolbar {
  &__count {
    font-size: 0.8125rem;
    color: var(--bs-secondary-color);
  }
}
</style>
