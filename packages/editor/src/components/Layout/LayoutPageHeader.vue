<template>
  <div class="layout-page-header">
    <div class="layout-page-header__start">
      <slot name="start" />
    </div>
    <div class="layout-page-header__center">
      <slot name="center" />
    </div>
    <div class="layout-page-header__end">
      <slot name="end" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.layout-page-header {
  // Three named grid areas so the center slot is anchored to the header's
  // horizontal midpoint while start/end stay locked to their own columns
  // even when the center slot is empty and hidden.
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  grid-template-areas: 'start center end';
  gap: 0.75rem;
  min-height: 3.5rem;
  padding: 0 1.25rem;
  background: transparent;
  border-bottom: 1px solid var(--bc-hairline);
  flex-shrink: 0;
  // Stay clickable above the bottom-drawer backdrop (z-index 1040).
  position: relative;
  z-index: 1045;

  &__start {
    grid-area: start;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 0;
  }

  &__center {
    grid-area: center;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 0;

    &:empty {
      display: none;
    }
  }

  &__end {
    grid-area: end;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    min-width: 0;
  }

  // Stack the three slots vertically on tablets and below where there is
  // not enough horizontal room for centered content next to the title.
  @media (max-width: 991.98px) {
    grid-template-columns: 1fr;
    grid-template-areas:
      'start'
      'center'
      'end';
    padding: 0;

    &__start,
    &__center,
    &__end {
      width: 100%;
      padding: 0 1rem;
      min-height: 3rem;
    }

    &__start {
      padding-top: 0.5rem;
    }

    &__center {
      border-top: 1px solid var(--bc-hairline);
      justify-content: center;
    }

    &__end {
      padding-bottom: 0;
      border-top: 1px solid var(--bc-hairline);

      &:empty {
        display: none;
      }
    }
  }
}
</style>
