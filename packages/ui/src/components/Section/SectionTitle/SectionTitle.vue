<template>
  <h6
    class="section-title"
    :class="classList"
  >
    <slot />
  </h6>
</template>

<script setup lang="ts">

const props = withDefaults(defineProps<{
  flush?: boolean
}>(), {
  flush: false,
})

const classList = computed(() => ({
  'section-title--flush': props.flush,
}))
</script>

<style scoped lang="scss">
.section-title {
  font-size: var(--bs-font-size-xs);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--bs-secondary-color);
  font-weight: 600;
  padding-top: 0.75rem;
  margin: 0;

  &--flush {
    padding-top: 0;
  }
}
</style>
