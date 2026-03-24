<template>
  <div class="render-page">
    <div
      ref="containerRef"
      class="render-page__card"
      :class="cardClass"
      :style="cardStyle"
    />
    <Teleport
      v-if="playerTarget && showPlayer"
      :to="playerTarget"
    >
      <component
        :is="playerComponent"
        :total="totalScenes"
        :current="currentScene"
        :playing="playing"
        :position="layout.playerPosition"
        @update:current="onSceneChange"
        @play="startPlayback"
        @pause="stopPlayback"
      />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, type Component } from 'vue'
import { useRoute } from 'vue-router'
import {
  ScenePlayerButtons,
  ScenePlayerProgressBar,
  ScenePlayerDotStepper,
  ScenePlayerMinimalArrows,
} from '@blueprint-chart/ui'
import { useDslSync } from '@/composables/useDslSync'
import { useChartPreview } from '@/composables/useChartPreview'
import { useChartConfig } from '@/stores/chartConfig'
import { useCanvasCardStyle } from '@/composables/useCanvasCardStyle'
import { useScenes } from '@/stores/scenes'

const route = useRoute()
const containerRef = ref<HTMLElement | null>(null)

const { applyDsl } = useDslSync()
useChartPreview(containerRef)

const { layout } = useChartConfig()
const { cardClass, cardStyle } = useCanvasCardStyle(layout, 'render-page__card')
const { scenes, activeIndex, playing, setActive, startPlayback, stopPlayback } = useScenes()

const playerComponentMap: Record<string, Component> = {
  'buttons': ScenePlayerButtons,
  'progress-bar': ScenePlayerProgressBar,
  'dot-stepper': ScenePlayerDotStepper,
  'minimal-arrows': ScenePlayerMinimalArrows,
}

const playerComponent = computed(() => playerComponentMap[layout.value.playerType] || ScenePlayerButtons)

const totalScenes = computed(() => scenes.value.length + 1)
const currentScene = computed(() => activeIndex.value + 2)
const showPlayer = computed(() => scenes.value.length >= 1)

function onSceneChange(scene: number) {
  setActive(scene - 2)
}

const playerTarget = ref<HTMLElement | null>(null)

function findFrame() {
  return containerRef.value?.querySelector<HTMLElement>('.bc-frame-footer') ?? null
}

let observer: MutationObserver | null = null

watch(containerRef, (el) => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
  if (!el) {
    playerTarget.value = null
    return
  }
  playerTarget.value = findFrame()
  observer = new MutationObserver(() => {
    playerTarget.value = findFrame()
  })
  observer.observe(el, { childList: true, subtree: true })
}, { immediate: true })

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})

onMounted(() => {
  const bpc64 = route.query.bpc64 as string | undefined
  if (!bpc64) {
    return
  }
  try {
    const binary = globalThis.atob(bpc64)
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0))
    const dsl = new TextDecoder().decode(bytes)
    applyDsl(dsl)
  }
  catch {
    // silently fail for invalid input
  }
})
</script>

<style scoped lang="scss">
.render-page {
  min-height: 100vh;
  box-sizing: border-box;
  background: var(--bs-card-bg);

  &__card {
    width: 100%;
    box-sizing: border-box;

    &--fixed {
      flex: none;
      margin: 0 auto;
    }

    &--max-width {
      margin: 0 auto;
    }

    &--transparent {
      background: transparent;
    }

    &--constrained-height {
      flex: none;
      display: flex;
      flex-direction: column;
    }
  }
}
</style>
