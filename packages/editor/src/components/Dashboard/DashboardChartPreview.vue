<template>
  <div class="dashboard-chart-preview">
    <div class="dashboard-chart-preview__card">
      <div class="dashboard-chart-preview__header">
        <div class="dashboard-chart-preview__title">
          {{ title }}
        </div>
        <div
          v-if="subtitle"
          class="dashboard-chart-preview__subtitle"
        >
          {{ subtitle }}
        </div>
      </div>
      <div
        class="dashboard-chart-preview__body"
        v-html="thumbnailHtml"
      />
      <div class="dashboard-chart-preview__footer">
        <span>Blueprint Chart</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  thumbnailHtml?: string
}>()
</script>

<style scoped lang="scss">
.dashboard-chart-preview {
  background: var(--bs-tertiary-bg);
  border: 1px solid var(--bs-border-color);
  border-radius: var(--bs-border-radius);
  padding: 0.875rem;
  overflow: hidden;
}

.dashboard-chart-preview__card {
  background: var(--bc-tile-bg);
  border-radius: var(--bs-border-radius-sm);
  border: 1px solid var(--bs-border-color);
  overflow: hidden;
}

.dashboard-chart-preview__header {
  padding: 0.6875rem 0.875rem 0.5rem;
  border-bottom: 1px solid var(--bs-border-color);
}

.dashboard-chart-preview__title {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--bs-body-color);
}

.dashboard-chart-preview__subtitle {
  font-size: 0.625rem;
  color: var(--bs-secondary-color);
  margin-top: 0.125rem;
}

.dashboard-chart-preview__body {
  padding: 0.625rem 0.875rem;

  :deep(svg) {
    width: 100%;
    height: auto;
    display: block;
  }
}

.dashboard-chart-preview__footer {
  display: flex;
  justify-content: flex-end;
  padding: 0.375rem 0.875rem;
  border-top: 1px solid var(--bs-border-color);
  font-size: 0.5625rem;
  color: var(--bs-secondary-color);
  background: var(--bs-tertiary-bg);
}
</style>
