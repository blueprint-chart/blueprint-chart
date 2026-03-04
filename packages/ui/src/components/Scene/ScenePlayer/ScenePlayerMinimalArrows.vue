<template>
  <div
    class="bc-scene-player bc-scene-player--minimal-arrows"
    :class="`bc-scene-player--${position}`"
    data-scene-player
  >
    <span class="bc-scene-player__counter">{{ current }}/{{ total }}</span>
    <button
      type="button"
      class="bc-scene-player__nav-btn"
      :disabled="current <= 1"
      aria-label="Previous scene"
      @click="$emit('update:current', current - 1)"
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
      <svg v-if="playing" width="9" height="9" viewBox="0 0 12 12" fill="currentColor"><rect x="1.5" y="1" width="3" height="10" rx="0.8" /><rect x="7.5" y="1" width="3" height="10" rx="0.8" /></svg>
      <!-- eslint-disable-next-line vue/max-attributes-per-line -->
      <svg v-else width="9" height="9" viewBox="0 0 12 12" fill="currentColor"><path d="M2.5 1v10l8-5z" /></svg>
    </button>
    <button
      type="button"
      class="bc-scene-player__nav-btn"
      :disabled="current >= total"
      aria-label="Next scene"
      @click="$emit('update:current', current + 1)"
    >
      <!-- eslint-disable-next-line vue/max-attributes-per-line -->
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 2L6.5 5l-3 3" /></svg>
    </button>
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
.bc-scene-player--minimal-arrows {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0.5rem var(--bc-frame-padding, 1.5rem) 0.625rem;

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

.bc-scene-player__nav-btn {
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

.bc-scene-player__play-btn {
  width: 26px;
  height: 26px;
  border-radius: 7px;
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

.bc-scene-player__counter {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--bc-scene-player-muted, #9b9893);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  margin-right: 4px;
}
</style>
