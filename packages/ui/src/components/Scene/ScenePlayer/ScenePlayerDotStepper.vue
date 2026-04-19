<template>
  <div
    class="bc-scene-player bc-scene-player--dot-stepper"
    :class="`bc-scene-player--${position}`"
    data-scene-player
  >
    <button
      type="button"
      class="bc-scene-player__nav-btn"
      :disabled="current <= 1"
      aria-label="Previous scene"
      @click="$emit('previous')"
    >
      <!-- eslint-disable-next-line vue/max-attributes-per-line -->
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 2L3.5 5l3 3" /></svg>
    </button>
    <button
      type="button"
      class="bc-scene-player__play-btn"
      :aria-label="playing ? 'Pause' : 'Play'"
      @click="playing ? $emit('pause') : $emit('play')"
    >
      <!-- eslint-disable-next-line vue/max-attributes-per-line -->
      <svg v-if="playing" width="11" height="11" viewBox="0 0 12 12" fill="currentColor"><rect x="1.5" y="1" width="3" height="10" rx="0.8" /><rect x="7.5" y="1" width="3" height="10" rx="0.8" /></svg>
      <!-- eslint-disable-next-line vue/max-attributes-per-line -->
      <svg v-else width="11" height="11" viewBox="0 0 12 12" fill="currentColor"><path d="M2.5 1v10l8-5z" /></svg>
    </button>
    <div class="bc-scene-player__dots">
      <button
        v-for="i in total"
        :key="i"
        type="button"
        class="bc-scene-player__dots__dot"
        :class="{
          'bc-scene-player__dots__dot--active': i === current,
          'bc-scene-player__dots__dot--completed': i < current,
        }"
        :aria-label="`Scene ${i} of ${total}`"
        :aria-current="i === current ? 'step' : undefined"
        @click="current = i"
      />
    </div>
    <button
      type="button"
      class="bc-scene-player__nav-btn"
      :disabled="current >= total"
      aria-label="Next scene"
      @click="$emit('next')"
    >
      <!-- eslint-disable-next-line vue/max-attributes-per-line -->
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 2L6.5 5l-3 3" /></svg>
    </button>
  </div>
</template>

<script setup lang="ts">
const current = defineModel<number>('current', { required: true })

withDefaults(defineProps<{
  total: number
  playing?: boolean
  position?: 'left' | 'center' | 'right'
}>(), {
  playing: false,
  position: 'center',
})

defineEmits<{
  play: []
  pause: []
  previous: []
  next: []
}>()
</script>

<style scoped lang="scss">
.bc-scene-player {
  &--dot-stepper {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.25rem 0 0;
    width: 100%;

    &.bc-scene-player--left {
      justify-content: flex-start;
    }

    &.bc-scene-player--center {
      justify-content: center;
    }

    &.bc-scene-player--right {
      justify-content: flex-end;
    }
  }

  &__nav-btn {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: 1px solid var(--bc-scene-player-border, #e2e0db);
    color: var(--bc-scene-player-muted, #9b9893);
    cursor: pointer;
    flex-shrink: 0;
    padding: 0;

    &:hover:not(:disabled) {
      border-color: var(--bc-scene-player-border-hover, #6b6966);
      color: var(--bc-scene-player-text, #1a1a1a);
    }

    &:disabled {
      opacity: 0.3;
      cursor: default;
    }
  }

  &__play-btn {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bc-scene-player-accent, #2c5aa0);
    border: none;
    color: #fff;
    cursor: pointer;
    flex-shrink: 0;
    padding: 0;
    transition: background 0.15s ease;

    &:hover {
      background: var(--bc-scene-player-accent-hover, #1e4888);
    }
  }

  &__dots {
    display: flex;
    gap: 6px;
    align-items: center;

    &__dot {
      width: 8px;
      height: 8px;
      border-radius: 4px;
      border: none;
      padding: 0;
      cursor: pointer;
      background: var(--bc-scene-player-track, #e2e0db);
      opacity: 0.4;
      transition: width 0.2s ease, background 0.2s ease, opacity 0.2s ease;

      &--completed {
        background: var(--bc-scene-player-accent, #2c5aa0);
        opacity: 1;
      }

      &--active {
        width: 20px;
        background: var(--bc-scene-player-accent, #2c5aa0);
        opacity: 1;
      }

      &:hover {
        opacity: 0.8;
      }
    }
  }
}
</style>
