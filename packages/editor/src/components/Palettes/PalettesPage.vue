<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { listPalettes } from '@blueprint-chart/lib'
import { useCustomPalettes } from '@/stores/customPalettes'
import { useCategoryColors } from '@/stores/categoryColors'
import PalettesCategoryTable from './PalettesCategoryTable.vue'
import PalettesGrid from './PalettesGrid.vue'
import PalettesToolbar from './PalettesToolbar.vue'
import type { PalettesTab } from './PalettesToolbar.vue'

const route = useRoute()
const router = useRouter()

const tab = computed<PalettesTab>({
  get: () => route.query.tab === 'categories' ? 'categories' : 'palettes',
  set: (value) => {
    router.replace({ query: { ...route.query, tab: value } })
  },
})

const { palettes } = useCustomPalettes()
const { categoryColors } = useCategoryColors()
const builtInCount = listPalettes().length

function plural(count: number, noun: string) {
  return `${count} ${count === 1 ? noun : `${noun}s`}`
}

const count = computed(() => tab.value === 'palettes'
  ? plural(palettes.value.length + builtInCount, 'palette')
  : plural(categoryColors.value.length, 'color'))

const grid = useTemplateRef<InstanceType<typeof PalettesGrid>>('grid')
const table = useTemplateRef<InstanceType<typeof PalettesCategoryTable>>('table')

function onAction() {
  if (tab.value === 'palettes') {
    grid.value?.addNew()
  }
  else {
    table.value?.focusName()
  }
}
</script>

<template>
  <div class="palettes-page">
    <PalettesToolbar
      v-model:tab="tab"
      :count="count"
      @action="onAction"
    />
    <div class="palettes-page__content">
      <PalettesGrid
        v-if="tab === 'palettes'"
        ref="grid"
      />
      <PalettesCategoryTable
        v-else
        ref="table"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.palettes-page {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-height: 0;
  height: 100%;

  &__content {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 1.75rem;

    @media (max-width: 575.98px) {
      padding: 1rem;
    }
  }
}
</style>
