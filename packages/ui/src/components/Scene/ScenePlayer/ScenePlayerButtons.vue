<template>
  <div
    class="bc-scene-player bc-scene-player--buttons"
    :class="`bc-scene-player--${position}`"
    data-scene-player
  >
    <div class="bc-scene-player__btn-group">
      <button
        type="button"
        class="bc-scene-player__btn-group__btn"
        :class="{ 'bc-scene-player__btn-group__btn--disabled': current <= 1 }"
        :disabled="current <= 1"
        aria-label="Previous scene"
        @click="$emit('update:current', current - 1)"
      >
        <!-- eslint-disable-next-line vue/max-attributes-per-line -->
        <svg width="8" height="12" viewBox="0 0 8 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 1.5L1.5 6l4 4.5" /></svg>
        Back
      </button>
      <button
        type="button"
        class="bc-scene-player__btn-group__btn bc-scene-player__btn-group__btn--next"
        :class="{ 'bc-scene-player__btn-group__btn--disabled': current >= total }"
        :disabled="current >= total"
        aria-label="Next scene"
        @click="$emit('update:current', current + 1)"
      >
        Next
        <!-- eslint-disable-next-line vue/max-attributes-per-line -->
        <svg width="8" height="12" viewBox="0 0 8 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 1.5L6.5 6l-4 4.5" /></svg>
      </button>
    </div>
    <span class="bc-scene-player__counter">{{ current }} / {{ total }}</span>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  total: number
  current: number
  playing?: boolean
  position?: 'left' | 'center' | 'right'
}>(), {
  playing: false,
  position: 'left',
})

defineEmits<{
  'update:current': [index: number]
  'play': []
  'pause': []
}>()
</script>

<style scoped lang="scss">
.bc-scene-player {
  &--buttons {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 0.25rem 0 0;
    width: 100%;

    &.bc-scene-player--left {
      justify-content: flex-start;
      gap: 16px;

      .bc-scene-player__counter {
        margin-left: auto;
      }
    }

    &.bc-scene-player--center {
      justify-content: center;
      gap: 16px;
    }

    &.bc-scene-player--right {
      justify-content: flex-end;
      gap: 16px;
    }
  }

  &__btn-group {
    display: flex;
    gap: 6px;

    &__btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 6px 14px;
      border-radius: 6px;
      border: 1px solid var(--bc-scene-player-border, currentColor);
      background: none;
      color: var(--bc-scene-player-muted);
      font-size: 0.8125rem;
      font-weight: 500;
      cursor: pointer;
      transition: border-color 0.15s, color 0.15s;
      line-height: 1.4;

      &:hover:not(:disabled) {
        border-color: var(--bc-scene-player-border-hover);
        background: var(--bc-scene-player-background-hover, rgba(0, 0, 0, 0.04));
        color: var(--bc-scene-player-text);
      }

      &--next {
        color: var(--bc-scene-player-text);
        font-weight: 600;
      }

      &--disabled {
        opacity: 0.35;
        cursor: default;
      }
    }
  }

  &__counter {
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--bc-scene-player-muted, #9b9893);
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }
}
</style>
