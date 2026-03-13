<template>
  <div class="practice-card">
    <div class="practice-card__icon">
      <AppIcon
        :name="icon"
        size="sm"
        variant="primary"
      />
    </div>
    <h3 class="practice-card__title">
      {{ title }}
    </h3>
    <p class="practice-card__desc">
      {{ description }}
    </p>
    <span class="practice-card__badge">{{ badge }}</span>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { AppIcon } from '@blueprint-chart/ui'

defineProps<{
  icon: Component
  title: string
  description: string
  badge: string
}>()
</script>

<style scoped lang="scss">
.practice-card {
  background: var(--bc-tile-bg);
  border: var(--bc-tile-border);
  border-radius: var(--bc-tile-radius);
  box-shadow: var(--bc-tile-shadow);
  padding: 1.25rem;
  transition: box-shadow 0.2s, transform 0.2s;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }

  &__icon {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: calc(var(--bc-tile-radius) - 4px);
    background: var(--bs-primary-bg-subtle);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.75rem;
  }

  &__title {
    font-size: var(--bs-font-size-md);
    font-weight: 700;
    color: var(--bs-body-color);
    margin-bottom: 0.375rem;
  }

  &__desc {
    font-size: var(--bs-font-size-sm);
    color: var(--bs-secondary-color);
    line-height: 1.6;
    margin: 0;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    margin-top: 0.625rem;
    padding: 0.25rem 0.5rem;
    background: var(--bs-primary-bg-subtle);
    color: var(--bs-primary);
    border-radius: 0.25rem;
    font-size: var(--bs-font-size-xs);
    font-weight: 700;
  }
}
</style>
