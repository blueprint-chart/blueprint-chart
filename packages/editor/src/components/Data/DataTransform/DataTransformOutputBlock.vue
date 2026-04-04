<template>
  <div class="output-block">
    <span class="output-block__icon">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        width="14"
        height="14"
      ><path d="M20 6L9 17l-5-5" /></svg>
    </span>
    <span>Output</span>
    <span class="output-block__meta">{{ columns }} cols · {{ rows }} rows</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  columns: number
  rows: number
}>()
</script>

<style scoped lang="scss">
.output-block {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--bs-success-bg-subtle);
  border: 1px dashed var(--bs-success);
  border-radius: var(--bs-border-radius);
  font-size: var(--bs-font-size-sm);
  font-weight: 600;
  color: var(--bs-success-text-emphasis);

  &__icon {
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 0.25rem;
    background: var(--bs-success-bg-subtle);
    color: var(--bs-success);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__meta {
    font-weight: 400;
    color: var(--bs-success-text-emphasis);
    margin-left: auto;
    font-size: var(--bs-font-size-xs);
  }
}
</style>
