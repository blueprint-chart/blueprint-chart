<template>
  <div
    class="gallery-grid"
    :class="gridClassList"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">

const props = withDefaults(defineProps<{
  layout?: 'grid' | 'row'
}>(), {
  layout: 'grid',
})

const gridClassList = computed(() => ({
  'gallery-grid--row': props.layout === 'row',
}))
</script>

<style scoped lang="scss">
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;

  &--row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
}
</style>
