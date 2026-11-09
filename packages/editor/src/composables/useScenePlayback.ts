import type { Ref } from 'vue'
import type { PlaybackSettings } from '@blueprint-chart/lib'
import { onceVisible, prefersReducedMotion } from '@blueprint-chart/lib'
import { useChartConfig } from '@/stores/chartConfig'
import { useScenes } from '@/stores/scenes'

export function useScenePlayback() {
  const { layout } = useChartConfig()
  const { startPlayback } = useScenes()

  function settings(): PlaybackSettings {
    const { autoplay, sceneDuration, loop, playerType } = layout.value
    const hasPlayer = playerType !== 'none'
    return { autoplay, sceneDuration, loop: loop && hasPlayer }
  }

  function play() {
    startPlayback(settings)
  }

  return { play }
}

export function useScenesAutoplay(options: { whenVisible?: Readonly<Ref<HTMLElement | null>> } = {}) {
  const { layout } = useChartConfig()
  const { scenes, playing, activeIndex } = useScenes()
  const { play } = useScenePlayback()
  const shouldAutoplay = computed(() => layout.value.autoplay && scenes.value.length > 0)

  function playWhenVisible(element: HTMLElement, onCleanup: (fn: () => void) => void) {
    const disconnect = onceVisible(element, play)
    const stopWatching = watch([playing, activeIndex], disconnect)
    onCleanup(() => {
      disconnect()
      stopWatching()
    })
  }

  watch(
    [shouldAutoplay, () => options.whenVisible?.value],
    ([autoplay, element], _, onCleanup) => {
      if (!autoplay || prefersReducedMotion()) {
        return
      }
      if (!options.whenVisible) {
        play()
        return
      }
      if (element) {
        playWhenVisible(element, onCleanup)
      }
    },
    { immediate: true },
  )
}
