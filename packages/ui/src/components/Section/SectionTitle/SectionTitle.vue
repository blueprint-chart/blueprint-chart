<template>
  <div
    v-if="eyebrow"
    class="section-title-block"
  >
    <div class="section-title__eyebrow bc-eyebrow">
      <span
        class="bc-eyebrow__hash"
        aria-hidden="true"
      >#</span>
      {{ eyebrow }}
    </div>
    <h6
      class="section-title"
      :class="classList"
    >
      <slot />
    </h6>
  </div>
  <h6
    v-else
    class="section-title"
    :class="classList"
  >
    <slot />
  </h6>
</template>

<script setup lang="ts">

const props = withDefaults(defineProps<{
  flush?: boolean
  eyebrow?: string
}>(), {
  flush: false,
  eyebrow: undefined,
})

const classList = computed(() => ({
  'section-title--flush': props.flush,
}))
</script>

<style scoped lang="scss">
.section-title__eyebrow {
  margin-bottom: 0.625rem;
}

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
