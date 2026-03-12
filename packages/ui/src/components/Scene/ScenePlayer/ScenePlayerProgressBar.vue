<template>
  <div
    class="bc-scene-player bc-scene-player--progress-bar"
    data-scene-player
  >
    <button
      type="button"
      class="bc-scene-player__play-btn"
      :aria-label="playing ? 'Pause' : 'Play'"
      @click="playing ? $emit('pause') : $emit('play')"
    >
      <!-- eslint-disable-next-line vue/max-attributes-per-line -->
      <svg v-if="playing" width="10" height="10" viewBox="0 0 12 12" fill="currentColor"><rect x="1.5" y="1" width="3" height="10" rx="0.8" /><rect x="7.5" y="1" width="3" height="10" rx="0.8" /></svg>
      <!-- eslint-disable-next-line vue/max-attributes-per-line -->
      <svg v-else width="10" height="10" viewBox="0 0 12 12" fill="currentColor"><path d="M2.5 1v10l8-5z" /></svg>
    </button>
    <div class="bc-scene-player__segments">
      <button
        v-for="i in total"
        :key="i"
        type="button"
        class="bc-scene-player__segment"
        :class="{
          'bc-scene-player__segment--active': i === current,
          'bc-scene-player__segment--completed': i < current,
        }"
        :aria-label="`Scene ${i} of ${total}`"
        :aria-current="i === current ? 'step' : undefined"
        @click="$emit('update:current', i)"
      />
    </div>
    <span class="bc-scene-player__counter">{{ current }}/{{ total }}</span>
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
  position: 'center',
})

defineEmits<{
  'update:current': [index: number]
  'play': []
  'pause': []
}>()
</script>

<style scoped lang="scss">
.bc-scene-player {
  &--progress-bar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0 0;
    width: 100%;
  }

  &__play-btn {
    width: 28px;
    height: 28px;
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

  &__segments {
    flex: 1;
    display: flex;
    gap: 3px;
    align-items: center;
  }

  &__segment {
    flex: 1;
    height: 4px;
    border-radius: 2px;
    border: none;
    padding: 0;
    cursor: pointer;
    background: var(--bc-scene-player-track, #e2e0db);
    opacity: 0.45;
    transition: height 0.2s ease, background 0.2s ease, opacity 0.2s ease;

    &--completed {
      background: var(--bc-scene-player-accent, #2c5aa0);
      opacity: 1;
    }

    &--active {
      height: 6px;
      background: var(--bc-scene-player-accent, #2c5aa0);
      opacity: 1;
    }

    &:hover {
      opacity: 0.8;
    }
  }

  &__counter {
    font-size: 0.6875rem;
    font-weight: 500;
    color: var(--bc-scene-player-muted, #9b9893);
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
    flex-shrink: 0;
  }
}
</style>
