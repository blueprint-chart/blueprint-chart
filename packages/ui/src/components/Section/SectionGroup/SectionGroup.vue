<template>
  <section class="section-group">
    <SectionTitle :flush="flush">
      {{ title }}
    </SectionTitle>
    <div class="section-group__body">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">

withDefaults(defineProps<{
  title: string
  flush?: boolean
}>(), {
  flush: false,
})
</script>

<style scoped lang="scss">
.section-group {
  &__body {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding-top: 0.5rem;
  }
}
</style>
