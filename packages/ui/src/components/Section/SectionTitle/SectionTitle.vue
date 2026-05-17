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
  font-family: "DM Serif Display", Georgia, "Times New Roman", serif;
  font-size: var(--bs-font-size-lg);
  font-weight: 400;
  letter-spacing: -0.005em;
  line-height: 1.15;
  color: var(--bs-body-color);
  padding-top: 0.75rem;
  margin: 0;

  &--flush {
    padding-top: 0;
  }
}
</style>
