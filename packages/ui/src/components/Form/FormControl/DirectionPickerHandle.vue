<template>
  <button
    type="button"
    class="direction-picker-handle"
    :class="[shapeClass, { 'direction-picker-handle--active': active }]"
    :data-d="pos"
    :title="label"
    @click.stop.prevent="$emit('select')"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  pos: string
  label: string
  shape: 'corner' | 'edge-h' | 'edge-v' | 'center'
  active: boolean
}>()

defineEmits<{
  select: []
}>()

const shapeClass = computed(() => `direction-picker-handle--${props.shape}`)
</script>

<style scoped lang="scss">
.direction-picker-handle {
  position: absolute;
  border: 1.5px solid var(--bs-border-color);
  background: var(--bs-body-bg);
  cursor: pointer;
  z-index: 4;
  padding: 0;
  transform: translate(-50%, -50%);
  transition: all 0.12s;

  &:hover {
    border-color: var(--bs-primary);
    background: var(--bs-primary-bg-subtle);
  }

  &--active {
    border-color: var(--bs-primary);
    background: var(--bs-primary);
  }

  &:focus-visible {
    outline: 2px solid var(--bs-primary-bg-subtle);
    outline-offset: 2px;
  }
}

// Shapes
.direction-picker-handle--corner,
.direction-picker-handle--center {
  border-radius: 50%;
  width: var(--handle-circle);
  height: var(--handle-circle);
}

.direction-picker-handle--edge-h {
  border-radius: 4px;
  width: var(--handle-pill-long);
  height: var(--handle-pill-short);
}

.direction-picker-handle--edge-v {
  border-radius: 4px;
  width: var(--handle-pill-short);
  height: var(--handle-pill-long);
}

// Positions
.direction-picker-handle[data-d="nw"] { top: 0; left: 0; }
.direction-picker-handle[data-d="n"]  { top: 0; left: 50%; }
.direction-picker-handle[data-d="ne"] { top: 0; left: 100%; }
.direction-picker-handle[data-d="w"]  { top: 50%; left: 0; }
.direction-picker-handle[data-d="c"]  { top: 50%; left: 50%; }
.direction-picker-handle[data-d="e"]  { top: 50%; left: 100%; }
.direction-picker-handle[data-d="sw"] { top: 100%; left: 0; }
.direction-picker-handle[data-d="s"]  { top: 100%; left: 50%; }
.direction-picker-handle[data-d="se"] { top: 100%; left: 100%; }
</style>
