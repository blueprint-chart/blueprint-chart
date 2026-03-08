<template>
  <div class="render-page">
    <div
      ref="containerRef"
      class="render-page__card"
    />
    <Teleport
      v-if="playerTarget && showPlayer"
      :to="playerTarget"
    >
      <ScenePlayerMinimalArrows
        :total="totalScenes"
        :current="currentScene"
        :playing="playing"
        position="center"
        @update:current="onSceneChange"
        @play="startPlayback"
        @pause="stopPlayback"
      />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { ScenePlayerMinimalArrows } from '@blueprint-chart/ui'
import { useDslSync } from '@/composables/useDslSync'
import { useChartPreview } from '@/composables/useChartPreview'
import { useScenes } from '@/composables/useScenes'

const route = useRoute()
const containerRef = ref<HTMLElement | null>(null)

const { applyDsl } = useDslSync()
useChartPreview(containerRef)

const { scenes, activeIndex, playing, setActive, startPlayback, stopPlayback } = useScenes()

const totalScenes = computed(() => scenes.value.length + 1)
const currentScene = computed(() => activeIndex.value + 2)
const showPlayer = computed(() => scenes.value.length >= 1)

function onSceneChange(scene: number) {
  setActive(scene - 2)
}

const playerTarget = ref<HTMLElement | null>(null)

function findFrame() {
  return containerRef.value?.querySelector<HTMLElement>('.bc-frame') ?? null
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
    const dsl = globalThis.atob(bpc64)
    applyDsl(dsl)
  }
  catch {
    // silently fail for invalid input
  }
})
</script>

<style scoped>
.render-page {
  min-height: 100vh;
  box-sizing: border-box;
}

.render-page__card {
  width: 100%;
  padding: 24px;
  box-sizing: border-box;
}
</style>
