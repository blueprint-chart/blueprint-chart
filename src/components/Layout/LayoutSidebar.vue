<template>
  <aside
    class="border-end bg-body-secondary overflow-auto"
    :style="{ width: `${width}px`, minWidth: `${width}px` }"
  >
    <slot />
  </aside>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ width?: number }>(), { width: 320 })
</script>
