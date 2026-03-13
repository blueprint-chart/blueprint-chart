<template>
  <div
    class="gallery-card"
    :class="cardClassList"
    role="button"
    tabindex="0"
    @click="$emit('click')"
    @keydown.enter="$emit('click')"
    @keydown.space.prevent="$emit('click')"
  >
    <div
      class="gallery-card__thumb"
      :data-bs-theme="forceLightThumb ? 'light' : undefined"
    >
      <img
        v-if="thumbSrc"
        :src="thumbSrc"
        alt=""
        class="gallery-card__thumb__img"
      >
      <div
        v-if="$slots.actions"
        class="gallery-card__thumb__actions"
        @click.stop
      >
        <slot name="actions" />
      </div>
    </div>
    <div class="gallery-card__meta">
      <div class="gallery-card__meta__title">
        {{ title }}
      </div>
      <div
        v-if="subtitle"
        class="gallery-card__meta__subtitle"
      >
        {{ subtitle }}
      </div>
      <div
        v-if="$slots.footer"
        class="gallery-card__meta__footer"
      >
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title: string
  subtitle?: string
  thumbSrc?: string
  selected?: boolean
  layout?: 'grid' | 'row'
  forceLightThumb?: boolean
}>()

defineEmits<{
  click: []
}>()

const cardClassList = computed(() => ({
  'gallery-card--selected': props.selected,
  'gallery-card--row': props.layout === 'row',
}))
</script>

<style scoped lang="scss">
.gallery-card {
  background: var(--bc-tile-bg);
  border: var(--bc-tile-border);
  border-radius: var(--bc-tile-radius);
  box-shadow: var(--bc-tile-shadow);
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: background 0.15s ease, box-shadow 0.2s ease, transform 0.2s ease, border-color 0.15s ease;
  outline: none;

  &:hover {
    background: var(--bc-tile-bg-elevated);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px var(--bs-primary);
  }

  &--selected {
    border-color: var(--bs-primary);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--bs-primary) 15%, transparent), 0 4px 16px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }

  &__thumb {
    height: 152px;
    background: var(--bs-tertiary-bg);
    border-bottom: 1px solid var(--bs-border-color);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.875rem;
    overflow: hidden;
    position: relative;

    &__img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }

    &__actions {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      display: flex;
      gap: 0.25rem;
      opacity: 0;
      transition: opacity 0.15s ease;

      .gallery-card:hover &,
      .gallery-card:focus-within & {
        opacity: 1;
      }
    }
  }

  &__meta {
    padding: 0.75rem 1rem 1rem;
    display: flex;
    flex-direction: column;
    flex: 1;

    &__title {
      font-size: var(--bs-font-size-sm);
      font-weight: 700;
      color: var(--bs-body-color);
      line-height: 1.4;
      margin-bottom: 0.25rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    &__subtitle {
      font-size: var(--bs-font-size-xs);
      color: var(--bs-secondary-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 0.5rem;
    }

    &__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: auto;
    }
  }

  // ─── Row layout ───
  &--row {
    display: grid;
    grid-template-columns: 96px 1fr;
    border-radius: var(--bs-border-radius);

    &:hover,
    &.gallery-card--selected {
      transform: none;
    }

    .gallery-card__thumb {
      height: 72px;
      border-bottom: none;
      border-right: 1px solid var(--bs-border-color);
      padding: 0.625rem;
      flex-shrink: 0;
    }

    .gallery-card__meta {
      padding: 0.625rem 0.875rem;
      display: grid;
      grid-template-columns: 1fr auto;
      grid-template-rows: auto auto;
      align-content: center;
      column-gap: 1rem;
      min-width: 0;
    }

    .gallery-card__meta__title {
      grid-column: 1;
      grid-row: 1;
      font-size: var(--bs-font-size-sm);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      -webkit-line-clamp: unset;
      -webkit-box-orient: unset;
      display: block;
      min-width: 0;
      margin-bottom: 0;
    }

    .gallery-card__meta__subtitle {
      grid-column: 1;
      grid-row: 2;
      min-width: 0;
      margin-bottom: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .gallery-card__meta__footer {
      grid-column: 2;
      grid-row: 1 / -1;
      align-self: center;
      flex-shrink: 0;
      gap: 0.625rem;
    }
  }
}
</style>
