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
import { useScenePlayerStyles } from '../../../composables/useScenePlayerStyles'

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

useScenePlayerStyles()
</script>
