<template>
  <div class="render-page">
    <div
      v-if="error"
      class="render-page__error"
    >
      <p class="render-page__error__message">
        {{ error }}
      </p>
      <RouterLink to="/charts">
        Go to My Charts
      </RouterLink>
    </div>
    <div
      v-else
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
        @previous="previousScene"
        @next="nextScene"
        @play="startPlayback"
        @pause="stopPlayback"
      />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { useRoute } from 'vue-router'
import {
  ScenePlayerButtons,
  ScenePlayerProgressBar,
  ScenePlayerDotStepper,
  ScenePlayerMinimalArrows,
} from '@blueprint-chart/ui'
import { useChartConfig } from '@/stores/chartConfig'
import { useScenes } from '@/stores/scenes'
import { useCloudCharts } from '@/stores/cloudCharts'
import { accountsEnabled } from '@/config/runtimeConfig'
import { decodeUrlSafeBase64 } from '@/utils/base64'

const route = useRoute()
const containerRef = useTemplateRef<HTMLElement>('containerRef')

const { applyDsl } = useDslSync()
useChartPreview(containerRef)

const { layout } = useChartConfig()
const { cardClass, cardStyle } = useCanvasCardStyle(layout, 'render-page__card')
const { scenes, activeIndex, playing, setActive, nextScene, previousScene, startPlayback, stopPlayback } = useScenes()

const playerComponentMap: Record<string, Component> = {
  'buttons': ScenePlayerButtons,
  'progress-bar': ScenePlayerProgressBar,
  'dot-stepper': ScenePlayerDotStepper,
  'minimal-arrows': ScenePlayerMinimalArrows,
}

const playerComponent = computed(() => playerComponentMap[layout.value.playerType] || ScenePlayerButtons)

const totalScenes = computed(() => scenes.value.length + 1)
const currentScene = computed(() => activeIndex.value + 2)
const showPlayer = computed(() => scenes.value.length >= 1 && layout.value.playerType !== 'none')

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

const error = ref('')

async function load() {
  error.value = ''
  const id = route.query.id as string | undefined
  if (id) {
    if (accountsEnabled()) {
      const { fetchPublished } = useCloudCharts()
      const dsl = await fetchPublished(id)
      if (dsl) {
        showDsl(dsl)
        return
      }
    }
    error.value = 'We could not find that chart. It may have been deleted, or the link may be wrong.'
    return
  }

  const bpc64 = route.query.bpc64 as string | undefined
  if (!bpc64) {
    return
  }
  const dsl = decodeUrlSafeBase64(bpc64)
  if (dsl === null) {
    error.value = 'This chart link is damaged, so there is nothing to show. It was probably truncated or re-encoded on the way here.'
    return
  }
  showDsl(dsl)
}

// The payload lives in the URL, so replacing it is a same-document navigation
// and the component is never remounted. Without this watch the page kept
// rendering the previous chart with nothing to say the new one was ignored.
watch(() => [route.query.bpc64, route.query.id], load, { immediate: true })

/**
 * A syntax error used to leave the page blank, which reads as a broken tool
 * rather than as a typo. applyDsl already reports the parser's message and
 * position; show it.
 */
function showDsl(dsl: string) {
  const result = applyDsl(dsl)
  if (result.success) {
    return
  }
  const where = result.location
    ? ` (line ${result.location.line}, column ${result.location.column})`
    : ''
  error.value = `This chart's source could not be read${where}: ${result.error ?? 'unknown error'}`
}
</script>

<style scoped lang="scss">
.render-page {
  min-height: 100vh;
  box-sizing: border-box;
  background: var(--bs-card-bg);

  &__error {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 48px 24px;
    text-align: center;

    &__message {
      margin: 0;
      color: var(--bs-secondary-color);
    }
  }

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
