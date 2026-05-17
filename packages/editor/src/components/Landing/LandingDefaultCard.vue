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
  background: var(--bc-content-bg);
  border: 1px solid var(--bc-hairline);
  border-radius: var(--bc-radius-md);
  padding: 1rem 1rem 0.875rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.375rem;

    &__icon {
      width: 1.375rem;
      height: 1.375rem;
      border-radius: var(--bc-radius-sm);
      background: rgba(75, 144, 207, 0.16);
      color: var(--bs-info);
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    &__tag {
      font-family: "Geist Mono", ui-monospace, monospace;
      font-size: 0.6875rem;
      letter-spacing: 0.06em;
      color: var(--bs-tertiary-color);
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
</style>
