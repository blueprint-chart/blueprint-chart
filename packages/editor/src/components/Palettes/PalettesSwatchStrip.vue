<script setup lang="ts">
defineProps<{
  colors: readonly string[]
}>()
</script>

<template>
  <div
    class="palettes-swatch-strip"
    role="img"
    :aria-label="colors.join(', ')"
  >
    <span
      v-for="(color, index) in colors"
      :key="index"
      class="palettes-swatch-strip__segment"
      :style="{ backgroundColor: color }"
    />
  </div>
</template>

<style scoped lang="scss">
.palettes-swatch-strip {
  display: flex;
  height: 3rem;
  border-bottom: 1px solid var(--bc-hairline);

  &__segment {
    flex: 1;
  }
}
</style>
