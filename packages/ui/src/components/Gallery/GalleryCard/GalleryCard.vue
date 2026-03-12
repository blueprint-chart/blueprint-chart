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
        class="gallery-card__thumb-img"
      >
    </div>
    <div class="gallery-card__meta">
      <div class="gallery-card__title">
        {{ title }}
      </div>
      <div
        v-if="subtitle"
        class="gallery-card__subtitle"
      >
        {{ subtitle }}
      </div>
      <div
        v-if="$slots.footer"
        class="gallery-card__footer"
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
}

.gallery-card--selected {
  border-color: var(--bs-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--bs-primary) 15%, transparent), 0 4px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.gallery-card__thumb {
  height: 152px;
  background: var(--bs-tertiary-bg);
  border-bottom: 1px solid var(--bs-border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.875rem;
  overflow: hidden;
}

.gallery-card__thumb-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.gallery-card__meta {
  padding: 0.8125rem 0.9375rem 0.9375rem;
}

.gallery-card__title {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--bs-body-color);
  line-height: 1.4;
  margin-bottom: 0.1875rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.gallery-card__subtitle {
  font-size: 0.6875rem;
  color: var(--bs-secondary-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.5625rem;
}

.gallery-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

// ─── Row layout ───
.gallery-card--row {
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
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .gallery-card__title {
    font-size: 0.8125rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-line-clamp: unset;
    -webkit-box-orient: unset;
    display: block;
    flex: 1;
    min-width: 0;
    margin-bottom: 0;
  }

  .gallery-card__subtitle {
    flex: 1;
    min-width: 0;
    margin-bottom: 0;
  }

  .gallery-card__footer {
    flex-shrink: 0;
    gap: 0.625rem;
  }
}
</style>
