<script setup lang="ts">
import SeriesRow from './ListSeriesRow.vue'
</script>

<template>
  <Story title="List/ListSeriesRow">
    <Variant
      title="Default"
      :init-state="() => ({ enabled: true })"
    >
      <template #default="{ state }">
        <div class="series-row-story__wrapper">
          <SeriesRow
            v-model="state.enabled"
            color="#4e79a7"
            name="Revenue"
          />
          <SeriesRow
            :model-value="true"
            color="#f28e2b"
            name="Expenses"
          />
          <SeriesRow
            :model-value="false"
            color="#e15759"
            name="Profit"
          />
        </div>
      </template>
      <template #controls="{ state }">
        <HstCheckbox
          v-model="state.enabled"
          title="enabled (first row)"
        />
      </template>
    </Variant>
  </Story>
</template>

<style scoped>
.series-row-story__wrapper {
  max-width: 280px;
}
</style>
