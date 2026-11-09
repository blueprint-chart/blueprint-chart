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
        @click.stop="$emit('previous')"
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
        @click.stop="$emit('next')"
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
import { useScenePlayerStyles } from '../../../composables/useScenePlayerStyles'

const current = defineModel<number>('current', { required: true })

withDefaults(defineProps<{
  total: number
  playing?: boolean
  position?: 'left' | 'center' | 'right'
}>(), {
  playing: false,
  position: 'left',
})

defineEmits<{
  play: []
  pause: []
  previous: []
  next: []
}>()

useScenePlayerStyles()
</script>
