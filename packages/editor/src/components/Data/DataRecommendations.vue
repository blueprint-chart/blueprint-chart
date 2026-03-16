<template>
  <div class="data-recommendations">
    <p class="data-recommendations__summary">
      Based on your data: {{ dataSummary }}
    </p>

    <div
      v-if="recommendations.length === 0"
      class="text-muted text-center py-3"
    >
      Load data to see recommendations
    </div>

    <DataRecommendationCard
      v-for="rec in recommendations"
      :key="rec.chartType"
      :chart-type="rec.chartType"
      :label="rec.label"
      :fitness="rec.fitness"
      :reason="rec.reason"
      @select="onSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { useChartRecommendations } from '@/composables/useChartRecommendations'
import { useChartConfig } from '@/stores/chartConfig'
import DataRecommendationCard from './DataRecommendationCard.vue'

const { recommendations, dataSummary } = useChartRecommendations()
const chartConfig = useChartConfig()

function onSelect(chartType: string) {
  chartConfig.chartType.value = chartType
}
</script>

<style scoped lang="scss">
.data-recommendations {
  display: flex;
  flex-direction: column;

  &__summary {
    font-size: var(--bs-font-size-sm);
    color: var(--bs-secondary-color);
    margin-bottom: 0.875rem;
  }
}
</style>
