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
  const { scenes, autoplayArmed, disarmAutoplay } = useScenes()
  const { play } = useScenePlayback()

  function canAutoplay() {
    const hasScenes = scenes.value.length > 0
    return layout.value.autoplay && hasScenes && !prefersReducedMotion()
  }

  watch(
    [autoplayArmed, () => options.whenVisible?.value],
    ([armed, element], _, onCleanup) => {
      if (!armed) {
        return
      }
      if (!canAutoplay()) {
        disarmAutoplay()
        return
      }
      if (!options.whenVisible) {
        play()
        return
      }
      if (element) {
        const disconnect = onceVisible(element, play)
        onCleanup(disconnect)
      }
    },
    { immediate: true },
  )

  if (options.whenVisible) {
    return
  }

  // A replaced layout object means a load, a DSL edit or an undo, not a tick.
  watch(
    () => [layout.value, layout.value.autoplay] as const,
    ([current, autoplay], [previous, wasAutoplay]) => {
      const ticked = current === previous && autoplay && !wasAutoplay
      if (ticked && canAutoplay()) {
        play()
      }
    },
  )
}
