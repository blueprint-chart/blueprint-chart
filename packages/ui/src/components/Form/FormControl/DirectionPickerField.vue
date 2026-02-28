<template>
  <div class="direction-picker-field">
    <div
      class="direction-picker-field__crosshair-h"
      :style="{ top: crosshairY }"
    />
    <div
      class="direction-picker-field__crosshair-v"
      :style="{ left: crosshairX }"
    />
    <div
      class="direction-picker-field__rect"
      :style="rectStyle"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  x: number
  y: number
}>()

const crosshairX = computed(() => `${props.x * 100}%`)
const crosshairY = computed(() => `${props.y * 100}%`)

const rectStyle = computed(() => {
  let left: string
  let top: string

  if (props.x === 0) {
    left = '-1px'
  }
  else if (props.x === 1) {
    left = 'calc(100% - var(--rect-w) + 1px)'
  }
  else {
    left = `calc(var(--rect-pad) + ${props.x} * (100% - 2 * var(--rect-pad) - var(--rect-w)))`
  }

  if (props.y === 0) {
    top = '-1px'
  }
  else if (props.y === 1) {
    top = 'calc(100% - var(--rect-h) + 1px)'
  }
  else {
    top = `calc(var(--rect-pad) + ${props.y} * (100% - 2 * var(--rect-pad) - var(--rect-h)))`
  }

  return { left, top }
})
</script>

<style scoped lang="scss">
.direction-picker-field {
  background: var(--bs-tertiary-bg);
  border: 1px solid var(--bs-border-color);
  border-radius: 6px;
  position: relative;
  overflow: visible;
}

.direction-picker-field__crosshair-h,
.direction-picker-field__crosshair-v {
  position: absolute;
  z-index: 1;
  pointer-events: none;
  background: var(--bs-primary);
  opacity: 0.35;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.direction-picker-field__crosshair-h {
  height: 1px;
  left: 0;
  width: 100%;
}

.direction-picker-field__crosshair-v {
  width: 1px;
  top: 0;
  height: 100%;
}

.direction-picker-field__rect {
  position: absolute;
  z-index: 2;
  pointer-events: none;
  background: transparent;
  border: var(--rect-border) solid var(--bs-primary);
  border-radius: var(--rect-radius);
  width: var(--rect-w);
  height: var(--rect-h);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
</style>
