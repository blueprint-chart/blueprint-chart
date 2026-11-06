<template>
  <div class="panel-actions">
    <div class="panel-actions__title">
      Actions
    </div>
    <div class="panel-actions__list">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.panel-actions {
  &__title {
    font-size: var(--bs-font-size-xs);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--bs-secondary-color);
    margin-bottom: 0.625rem;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }
}
</style>
