<template>
  <div
    class="list-item-row"
    :class="rowClassList"
    @click="$emit('click', $event)"
  >
    <slot name="leading" />
    <span class="list-item-row__label">{{ label }}</span>
    <slot name="actions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  active?: boolean
}>()

const rowClassList = computed(() => ({
  'list-item-row--active': props.active,
}))

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<style scoped lang="scss">
.list-item-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.25rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid transparent;
  border-radius: var(--bs-border-radius);
  cursor: pointer;

  &--active {
    border: 1px solid var(--bs-border-color);
    border-radius: var(--bs-border-radius);
    background: var(--bs-secondary-bg);
  }

  &__label {
    flex: 1;
    font-size: 0.8125rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
