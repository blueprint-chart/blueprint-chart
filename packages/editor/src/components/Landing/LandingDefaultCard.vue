<script setup lang="ts">
import type { Component } from 'vue'
import { AppIcon } from '@blueprint-chart/ui'

defineProps<{
  icon: Component
  tag: string
  title: string
  description: string
}>()
</script>

<template>
  <div class="landing-default-card">
    <!-- Pooled hover: the drafting grid gathers on the card you point at, then
         fades. CSS-only reveal (fixed anchor), matching .btn-bc-primary. -->
    <span
      class="bc-pool"
      aria-hidden="true"
    />
    <div class="landing-default-card__head">
      <span class="landing-default-card__head__icon">
        <AppIcon
          :name="icon"
          size="sm"
        />
      </span>
      <span class="landing-default-card__head__tag">{{ tag }}</span>
    </div>
    <h4 class="landing-default-card__title">
      {{ title }}
    </h4>
    <p class="landing-default-card__desc">
      {{ description }}
    </p>
  </div>
</template>

<style scoped lang="scss">
.landing-default-card {
  position: relative;
  // Clip the pooled-hover grid to the card's rounded rect.
  overflow: hidden;
  background: var(--bc-tile-bg);
  border: 1px solid var(--bc-hairline);
  border-radius: var(--bc-radius-md);
  padding: 1rem 1rem 0.875rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  // Grid-pool hover (see _effects.scss). Anchored near the top where the icon
  // and tag sit; revealed on hover and faded, never cursor-tracked.
  .bc-pool {
    --bc-pool-r: 80px;
    --bc-pool-x: 50%;
    --bc-pool-y: 25%;
    z-index: 0;
    opacity: 0;
    transition: opacity var(--bc-duration-base) var(--bc-ease);
  }

  &:hover .bc-pool {
    opacity: 1;
  }

  // Keep the content above the pool.
  &__head,
  &__title,
  &__desc {
    position: relative;
    z-index: 1;
  }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.375rem;

    &__icon {
      width: 1.375rem;
      height: 1.375rem;
      border-radius: var(--bc-radius-sm);
      background: var(--bs-info-bg-subtle);
      color: var(--bs-info);
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    &__tag {
      font-family: "Geist Mono", ui-monospace, monospace;
      font-size: 0.6875rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      // Brand-mark ink: Prussian on light, chartreuse on dark (see --bc-mark).
      color: var(--bc-mark);
      text-transform: uppercase;
    }
  }

  &__title {
    font-size: var(--bs-font-size-md);
    font-weight: 600;
    color: var(--bs-body-color);
    margin: 0;
  }

  &__desc {
    font-size: var(--bs-font-size-sm);
    color: var(--bs-secondary-color);
    line-height: 1.55;
    margin: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .landing-default-card .bc-pool {
    transition: none;
  }
}
</style>
