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
        class="bc-scene-player__segments__segment"
        :class="{
          'bc-scene-player__segments__segment--active': i === current,
          'bc-scene-player__segments__segment--completed': i < current,
        }"
        :aria-label="`Scene ${i} of ${total}`"
        :aria-current="i === current ? 'step' : undefined"
        @click="current = i"
      />
    </div>
    <span class="bc-scene-player__counter">{{ current }}/{{ total }}</span>
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
}>()

useScenePlayerStyles()
</script>
