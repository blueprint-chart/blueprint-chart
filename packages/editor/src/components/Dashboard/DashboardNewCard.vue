<template>
  <div
    class="dashboard-new-card"
    :class="cardClassList"
    role="button"
    tabindex="0"
    @click="$emit('click')"
    @keydown.enter="$emit('click')"
    @keydown.space.prevent="$emit('click')"
  >
    <IconPhPlus class="dashboard-new-card__icon" />
    <span class="dashboard-new-card__label">New Chart</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import IconPhPlus from '~icons/ph/plus'

const props = withDefaults(defineProps<{
  layout?: 'grid' | 'row'
}>(), {
  layout: 'grid',
})

defineEmits<{
  click: []
}>()

const cardClassList = computed(() => ({
  'dashboard-new-card--row': props.layout === 'row',
}))
</script>

<style scoped lang="scss">
.dashboard-new-card {
  background: var(--bc-tile-bg);
  border: 2px dashed var(--bs-border-color);
  border-radius: var(--bc-tile-radius);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 236px;
  color: var(--bs-secondary-color);
  transition: all 0.18s;
  outline: none;

  &:hover {
    border-color: var(--bs-primary);
    color: var(--bs-primary);
    background: color-mix(in srgb, var(--bs-primary) 5%, transparent);
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px var(--bs-primary);
  }
}

.dashboard-new-card--row {
  min-height: 3.5rem;
  flex-direction: row;
  gap: 0.5rem;
  padding: 0 1.25rem;
  border-radius: var(--bs-border-radius);
}

.dashboard-new-card__icon {
  width: 1.625rem;
  height: 1.625rem;

  .dashboard-new-card--row & {
    width: 1rem;
    height: 1rem;
  }
}

.dashboard-new-card__label {
  font-size: 0.8125rem;
  font-weight: 600;
}
</style>
