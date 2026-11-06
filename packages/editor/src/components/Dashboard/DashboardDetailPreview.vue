<template>
  <div
    v-if="dsl"
    class="dashboard-detail-preview"
  >
    <ChartThumbnail :dsl="dsl" />
  </div>
  <div
    v-else-if="loading"
    class="dashboard-detail-preview"
  >
    <FeedbackSkeleton
      width="100%"
      height="100%"
      radius="var(--bc-radius-xs)"
    />
  </div>
</template>

<script setup lang="ts">
import { FeedbackSkeleton } from '@blueprint-chart/ui'

defineProps<{
  dsl?: string
  loading?: boolean
}>()
</script>

<style scoped lang="scss">
.dashboard-detail-preview {
  border-radius: var(--bc-radius-sm);
  overflow: hidden;
  margin-top: 1rem;
  margin-bottom: 1rem;
  height: min(300px, 30vh);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
