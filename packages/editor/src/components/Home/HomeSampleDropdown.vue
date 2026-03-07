<template>
  <button
    class="new-chart-btn"
    @click="emit('blank')"
  >
    New Chart
  </button>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  blank: []
}>()
</script>

<style scoped>
.new-chart-btn {
  background: var(--bs-primary);
  color: #fff;
  border: none;
  border-radius: var(--bc-tile-radius);
  padding: 0.5rem 1.25rem;
  font-weight: 600;
  box-shadow: var(--bc-tile-shadow);
  transition: background 0.15s ease, box-shadow 0.15s ease;
  cursor: pointer;
}

.new-chart-btn:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  filter: brightness(1.1);
}
</style>
