<template>
  <div
    class="bc-scene-player bc-scene-player--minimal-arrows"
    :class="`bc-scene-player--${position}`"
    data-scene-player
  >
    <!-- eslint-disable-next-line vue/max-attributes-per-line -->
    <span v-if="showCounter && order === 'counter-first'" class="bc-scene-player__counter">{{ current }}/{{ total }}</span>
    <button
      type="button"
      class="bc-scene-player__nav-btn"
      :disabled="!wrap && current <= 1"
      aria-label="Previous scene"
      data-action="previous"
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
      <svg v-if="playing" width="9" height="9" viewBox="0 0 12 12" fill="currentColor"><rect x="1.5" y="1" width="3" height="10" rx="0.8" /><rect x="7.5" y="1" width="3" height="10" rx="0.8" /></svg>
      <!-- eslint-disable-next-line vue/max-attributes-per-line -->
      <svg v-else width="9" height="9" viewBox="0 0 12 12" fill="currentColor"><path d="M2.5 1v10l8-5z" /></svg>
    </button>
    <button
      type="button"
      class="bc-scene-player__nav-btn"
      :disabled="!wrap && current >= total"
      aria-label="Next scene"
      data-action="next"
      @click="$emit('next')"
    >
      <!-- eslint-disable-next-line vue/max-attributes-per-line -->
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 2L6.5 5l-3 3" /></svg>
    </button>
    <!-- eslint-disable-next-line vue/max-attributes-per-line -->
    <span v-if="showCounter && order === 'controls-first'" class="bc-scene-player__counter bc-scene-player__counter--end">{{ current }}/{{ total }}</span>
  </div>
</template>

<script setup lang="ts">
import '@blueprint-chart/lib/player.css'

const current = defineModel<number>('current', { required: true })

withDefaults(defineProps<{
  total: number
  playing?: boolean
  position?: 'left' | 'center' | 'right'
  wrap?: boolean
  showCounter?: boolean
  order?: 'counter-first' | 'controls-first'
}>(), {
  playing: false,
  position: 'center',
  wrap: false,
  showCounter: true,
  order: 'counter-first',
})

defineEmits<{
  play: []
  pause: []
  previous: []
  next: []
}>()

</script>
