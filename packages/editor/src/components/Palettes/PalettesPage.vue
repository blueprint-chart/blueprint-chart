<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import PalettesGrid from './PalettesGrid.vue'

const route = useRoute()
const router = useRouter()

const tabIndex = computed({
  get: () => route.query.tab === 'categories' ? 1 : 0,
  set: (index: number) => {
    router.replace({ query: { ...route.query, tab: index === 1 ? 'categories' : 'palettes' } })
  },
})
</script>

<template>
  <div class="palettes-page container py-4">
    <BTabs v-model:index="tabIndex">
      <BTab title="Palettes">
        <PalettesGrid class="palettes-page__grid" />
      </BTab>
      <BTab title="Category colors" />
    </BTabs>
  </div>
</template>
