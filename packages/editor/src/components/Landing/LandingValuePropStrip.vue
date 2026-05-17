<script setup lang="ts">
const cells = [
  { label: '01 / No backend', value: 'Runs in the browser' },
  { label: '02 / Self-contained', value: 'One portable iframe' },
  { label: '03 / Data sovereignty', value: 'Nothing ever uploaded' },
  { label: '04 / MIT', value: 'Free, open source, forever' },
] as const
</script>

<template>
  <div
    class="landing-value-prop-strip"
    aria-label="Why Blueprint Chart"
  >
    <div
      v-for="cell in cells"
      :key="cell.label"
      class="landing-value-prop-strip__cell"
    >
      <span class="landing-value-prop-strip__cell__label">{{ cell.label }}</span>
      <span class="landing-value-prop-strip__cell__value">{{ cell.value }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.landing-value-prop-strip {
  background: var(--bc-content-bg);
  border-top: 1px solid var(--bc-hairline);
  border-bottom: 1px solid var(--bc-hairline);
  display: grid;
  grid-template-columns: repeat(4, 1fr);

  &__cell {
    padding: 1rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    border-right: 1px solid var(--bc-hairline);

    &:last-child {
      border-right: none;
    }

    &__label {
      font-family: "Geist Mono", ui-monospace, monospace;
      font-size: 0.6875rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--bs-tertiary-color);
    }

    &__value {
      font-size: var(--bs-font-size-md);
      font-weight: 500;
      color: var(--bs-body-color);
    }
  }
}

@media (max-width: 51.25rem) {
  .landing-value-prop-strip {
    grid-template-columns: repeat(2, 1fr);

    &__cell {
      padding: 0.875rem 1rem;

      // Cells 1 + 2 now sit above 3 + 4 → add a horizontal hairline under 1 and 2.
      &:nth-child(1),
      &:nth-child(2) {
        border-bottom: 1px solid var(--bc-hairline);
      }
      // Vertical hairline between columns: keep on cells 1 + 3, drop on 2 + 4.
      &:nth-child(2),
      &:nth-child(4) {
        border-right: none;
      }
      &:nth-child(1),
      &:nth-child(3) {
        border-right: 1px solid var(--bc-hairline);
      }
    }
  }
}

@media (max-width: 33.75rem) {
  .landing-value-prop-strip {
    grid-template-columns: 1fr;

    &__cell {
      border-right: none !important;
      border-bottom: 1px solid var(--bc-hairline);

      &:last-child {
        border-bottom: none;
      }
    }
  }
}
</style>
