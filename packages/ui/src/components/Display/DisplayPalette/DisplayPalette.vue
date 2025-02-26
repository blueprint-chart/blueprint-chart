<template>
  <span class="display-palette">
    <DisplayColorSwatch
      v-for="(color, i) in colors"
      :key="i"
      :color="color"
      :bordered="bordered"
      size="sm"
    />
  </span>
</template>

<script setup lang="ts">
import DisplayColorSwatch from '../DisplayColorSwatch/DisplayColorSwatch.vue'

defineProps<{
  colors: string[],
  bordered?: boolean,
}>()
</script>

<style scoped lang="scss">
.display-palette {
  display: inline-flex;
  gap: 2px;
  vertical-align: middle;
}
</style>
