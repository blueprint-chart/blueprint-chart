<template>
  <div class="d-flex flex-column gap-4">
    <EditorLayoutSection />

    <SettingsSection
      v-if="hasLegend"
      title="Legend"
      :icon="IPhListBullets"
    >
      <EditorLegendSection />
    </SettingsSection>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SettingsSection } from '@blueprint-chart/ui'
import { useChartTypeOptions } from '@/stores/chartTypeOptions'
import IPhListBullets from '~icons/ph/list-bullets'
import EditorLayoutSection from './EditorLayoutSection.vue'
import EditorLegendSection from './EditorLegendSection.vue'

const { availableOptionKeys } = useChartTypeOptions()
const hasLegend = computed(() => availableOptionKeys.value.includes('legend'))
</script>
