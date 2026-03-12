<template>
  <div class="dashboard-chart-preview">
    <div class="dashboard-chart-preview__frame bc-theme-blueprint-framed">
      <div class="bc-frame">
        <div class="bc-frame-header">
          <h3 class="bc-frame-title">
            {{ title }}
          </h3>
          <p
            v-if="subtitle"
            class="bc-frame-description"
          >
            {{ subtitle }}
          </p>
        </div>
        <div
          class="bc-frame-body"
          v-html="thumbnailHtml"
        />
        <div class="bc-frame-footer">
          <div class="bc-frame-footer-left" />
          <div class="bc-frame-footer-right">
            <span class="bc-frame-credit">Blueprint Chart</span>
          </div>
        </div>
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

.dashboard-chart-preview__frame {
  background: var(--bc-tile-bg);
  border-radius: var(--bs-border-radius-sm);
  border: 1px solid var(--bs-border-color);
  overflow: hidden;
}

.dashboard-chart-preview__frame :deep(.bc-frame) {
  --bc-frame-padding: 0.875rem;
  --bc-frame-title-font-size: 0.8125rem;
  --bc-frame-description-font-size: 0.6875rem;
  --bc-frame-meta-font-size: 0.5625rem;
  --bc-frame-credit-font-size: 0.5625rem;
}

.dashboard-chart-preview__frame :deep(svg) {
  width: 100%;
  height: auto;
  display: block;
}
</style>
