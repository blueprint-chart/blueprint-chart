<template>
  <div
    class="gallery-card"
    :class="cardClassList"
    :aria-hidden="loading ? 'true' : undefined"
  >
    <div
      class="gallery-card__thumb"
      :data-bs-theme="forceLightThumb ? 'light' : undefined"
    >
      <FeedbackSkeleton
        v-if="loading || (thumbLoading && !thumbSrc)"
        class="gallery-card__thumb__skeleton"
        width="100%"
        height="100%"
        radius="0"
      />
      <img
        v-else-if="thumbSrc"
        :src="thumbSrc"
        alt=""
        class="gallery-card__thumb__img"
      >
      <div
        v-if="$slots.status && !loading"
        class="gallery-card__thumb__status"
      >
        <slot name="status" />
      </div>
      <div
        v-if="$slots.actions && !loading"
        class="gallery-card__thumb__actions"
      >
        <slot name="actions" />
      </div>
    </div>
    <div class="gallery-card__meta">
      <template v-if="loading">
        <FeedbackSkeleton
          class="gallery-card__skeleton-line"
          width="70%"
          height="0.9rem"
        />
        <FeedbackSkeleton
          class="gallery-card__skeleton-line"
          width="45%"
          height="0.7rem"
        />
        <div class="gallery-card__meta__footer">
          <FeedbackSkeleton
            width="30%"
            height="0.7rem"
          />
        </div>
      </template>
      <template v-else>
        <button
          type="button"
          class="gallery-card__meta__title"
          @click="emit('click')"
        >
          {{ title }}
        </button>
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
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import FeedbackSkeleton from '../../Feedback/FeedbackSkeleton/FeedbackSkeleton.vue'

const props = defineProps<{
  title: string
  subtitle?: string
  thumbSrc?: string
  selected?: boolean
  layout?: 'grid' | 'row'
  forceLightThumb?: boolean
  /** Whole-card placeholder: thumb + meta render as skeletons, content ignored. */
  loading?: boolean
  /** Card is real, but the thumb area shimmers until `thumbSrc` arrives. */
  thumbLoading?: boolean
}>()

const emit = defineEmits<{
  click: []
}>()

const cardClassList = computed(() => ({
  'gallery-card--selected': props.selected,
  'gallery-card--row': props.layout === 'row',
  'gallery-card--loading': props.loading,
}))
</script>

<style scoped lang="scss">
.gallery-card {
  background: var(--bc-tile-bg);
  border: 1px solid var(--bc-hairline);
  border-radius: var(--bc-radius-md);
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: border-color var(--bc-duration-base) var(--bc-ease),
              transform var(--bc-duration-base) var(--bc-ease);

  &:hover {
    border-color: var(--bc-hairline-strong);
    transform: translateY(-1px);
  }

  &:has(.gallery-card__meta__title:focus-visible) {
    box-shadow: var(--bc-focus-ring);
  }

  &--selected {
    border-color: var(--bs-emphasis-color);
    box-shadow: var(--bc-selected-ring);

    &:has(.gallery-card__meta__title:focus-visible) {
      box-shadow: var(--bc-selected-ring), 0 0 0 4px var(--bs-body-bg), 0 0 0 6px var(--bs-emphasis-color);
    }
  }

  &--loading {
    cursor: default;
    pointer-events: none;

    &:hover {
      border-color: var(--bc-hairline);
      transform: none;
    }
  }

  &__thumb {
    height: 152px;
    background: var(--bc-tile-bg-elevated);
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

    &__skeleton {
      position: absolute;
      inset: 0;
    }

    &__actions {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      display: flex;
      gap: 0.25rem;
      opacity: 0;
      transition: opacity var(--bc-duration-base) ease;
      z-index: 1;

      .gallery-card:hover &,
      .gallery-card:focus-within & {
        opacity: 1;
      }
    }

    &__status {
      position: absolute;
      top: 0.5rem;
      left: 0.5rem;
      display: flex;
      gap: 0.25rem;
      z-index: 1;
    }
  }

  &__meta {
    padding: 0.75rem 1rem 1rem;
    display: flex;
    flex-direction: column;
    flex: 1;

    &__title {
      padding: 0;
      border: 0;
      background: none;
      text-align: left;
      font-size: var(--bs-font-size-sm);
      font-weight: 700;
      color: var(--bs-body-color);
      line-height: 1.4;
      margin-bottom: 0.25rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      outline: none;

      &::after {
        content: "";
        position: absolute;
        inset: 0;
      }
    }

    // Serif title variant: DM Serif Display ships a 400 face only, so the
    // scoped 700 above forces synthetic bold that renders like a Times
    // fallback. Let the display face use its native weight, one size up to
    // keep optical parity with the bold sans variant.
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

  &__skeleton-line {
    margin-bottom: 0.5rem;
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

    // While loading, the meta holds skeleton lines (not the grid-positioned
    // title/subtitle/footer), so fall back to a simple stacked layout.
    &.gallery-card--loading .gallery-card__meta {
      display: flex;
      flex-direction: column;
      justify-content: center;
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
