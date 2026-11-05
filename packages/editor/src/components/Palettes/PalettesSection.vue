<script setup lang="ts">
defineProps<{
  title: string
  count: number
}>()

const titleId = useId()
</script>

<template>
  <section
    class="palettes-section"
    :aria-labelledby="titleId"
  >
    <header class="palettes-section__header">
      <h2
        :id="titleId"
        class="palettes-section__header__title"
      >
        {{ title }}
      </h2>
      <span class="palettes-section__header__count">{{ count }}</span>
    </header>
    <div class="palettes-section__grid">
      <slot />
    </div>
  </section>
</template>

<style scoped lang="scss">
.palettes-section {
  &__header {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    margin-bottom: 0.75rem;

    &__title {
      margin: 0;
      font-size: var(--bs-font-size-xs);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--bs-secondary-color);
    }

    &__count {
      font-size: var(--bs-font-size-xs);
      font-variant-numeric: tabular-nums;
      color: var(--bs-tertiary-color);
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
    gap: 1rem;
  }
}
</style>
