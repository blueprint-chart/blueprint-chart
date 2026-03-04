<template>
  <div class="source-block">
    <span class="source-block__icon">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        width="14"
        height="14"
      ><rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2"
      /><path d="M3 9h18M9 21V9" /></svg>
    </span>
    <span>{{ label }}</span>
    <span class="source-block__meta">{{ columns }} cols · {{ rows }} rows</span>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  columns: number
  rows: number
  label?: string
}>(), {
  label: 'Raw Data',
})
</script>

<style scoped lang="scss">
.source-block {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--bs-tertiary-bg);
  border: 1px solid var(--bs-border-color);
  border-radius: var(--bs-border-radius);
  font-size: var(--bs-font-size-sm);
  font-weight: 600;
  color: var(--bs-secondary-text-emphasis);
}

.source-block__icon {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 0.25rem;
  background: var(--bs-secondary-bg);
  color: var(--bs-secondary-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.source-block__meta {
  font-weight: 400;
  color: var(--bs-secondary-color);
  margin-left: auto;
  font-size: var(--bs-font-size-xs);
}
</style>
