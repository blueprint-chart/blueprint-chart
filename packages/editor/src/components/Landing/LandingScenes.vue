<script setup lang="ts">
import type { Component } from 'vue'
import { AppIcon, ScenePlayerButtons } from '@blueprint-chart/ui'
import { samples } from '@blueprint-chart/lib'
import IPhFilmSlate from '~icons/ph/film-slate'
import IPhSparkle from '~icons/ph/sparkle'
import IPhCode from '~icons/ph/code'
import { useTheme } from '@/stores/theme'

const sample = samples.find(s => s.id === 'farm-compass')
if (!sample) {
  throw new Error('Missing farm-compass sample — see LandingScenes.vue')
}
const bpc = sample.dsl
const sceneCount = parseDslSceneCount(bpc)

const containerRef = useTemplateRef<HTMLElement>('containerRef')
const playerTarget = ref<HTMLElement | null>(null)
const activeIndex = shallowRef(-1)
const playing = shallowRef(false)
const isSceneTransition = shallowRef(false)
let playbackTimer: ReturnType<typeof globalThis.setInterval> | null = null

const currentScene = shallowRef(activeIndex.value + 2)
watch(activeIndex, (i) => {
  currentScene.value = i + 2
})

const { theme } = useTheme()

function render() {
  if (!containerRef.value) {
    return
  }
  renderDsl(containerRef.value, bpc, {
    stripColors: true,
    sceneIndex: activeIndex.value >= 0 ? activeIndex.value : undefined,
    transition: isSceneTransition.value,
  })
  isSceneTransition.value = false
}

const throttledRender = useThrottleFn(render, 150)
watch([containerRef, activeIndex, theme], render, { immediate: true })
useResizeObserver(containerRef, throttledRender)

// Find .bc-frame for teleport target
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

function onSceneChange(scene: number) {
  isSceneTransition.value = true
  activeIndex.value = scene - 2
}

function onPrevious() {
  if (activeIndex.value > -1) {
    isSceneTransition.value = true
    activeIndex.value = activeIndex.value - 1
  }
}

function onNext() {
  if (activeIndex.value < sceneCount - 1) {
    isSceneTransition.value = true
    activeIndex.value = activeIndex.value + 1
  }
}

function startPlayback() {
  if (playing.value) {
    return
  }
  playing.value = true
  isSceneTransition.value = true
  activeIndex.value = -1
  playbackTimer = globalThis.setInterval(() => {
    if (activeIndex.value < sceneCount - 1) {
      isSceneTransition.value = true
      activeIndex.value++
    }
    else {
      stopPlayback()
    }
  }, 3000)
}

function stopPlayback() {
  playing.value = false
  if (playbackTimer) {
    globalThis.clearInterval(playbackTimer)
    playbackTimer = null
  }
}

onBeforeUnmount(() => {
  stopPlayback()
  if (observer) {
    observer.disconnect()
    observer = null
  }
})

const features: { icon: Component, title: string, description: string }[] = [
  {
    icon: IPhFilmSlate,
    title: 'Sequential scenes',
    description: 'Each scene mutates the chart — highlight, filter, zoom, reorder, or change type entirely.',
  },
  {
    icon: IPhSparkle,
    title: 'Smooth animated transitions',
    description: 'D3-powered morphing between states — bars grow, lines redraw, highlights pulse.',
  },
  {
    icon: IPhCode,
    title: 'Embed anywhere',
    description: 'One iframe embed. Works in WordPress, Ghost, any CMS.',
  },
]
</script>

<template>
  <LandingSection
    id="scenes"
    surface="content"
  >
    <LandingSectionHeader label="05 / Scenes & storytelling">
      Guide your reader<br><em>through the data.</em>
      <template #lead>
        Create a sequence of scenes — each one a step in your narrative.
        The same chart morphs from overview to focus, from cause to consequence. Press play, or step through.
      </template>
    </LandingSectionHeader>
    <div class="scenes__grid">
      <div class="scenes__grid__features">
        <div
          v-for="feat in features"
          :key="feat.title"
          class="scenes-feature"
        >
          <span class="scenes-feature__icon">
            <AppIcon
              :name="feat.icon"
              size="sm"
              variant="primary"
            />
          </span>
          <div>
            <strong class="scenes-feature__title">{{ feat.title }}</strong>
            <p class="scenes-feature__desc">
              {{ feat.description }}
            </p>
          </div>
        </div>
      </div>
      <div class="scenes-demo">
        <div
          ref="containerRef"
          class="scenes-demo__chart"
        />
        <Teleport
          v-if="playerTarget && sceneCount > 0"
          :to="playerTarget"
        >
          <ScenePlayerButtons
            :total="sceneCount + 1"
            :current="currentScene"
            :playing="playing"
            position="left"
            @update:current="onSceneChange"
            @previous="onPrevious"
            @next="onNext"
            @play="startPlayback"
            @pause="stopPlayback"
          />
        </Teleport>
      </div>
    </div>
  </LandingSection>
</template>

<style scoped lang="scss">
.scenes__grid {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 2.5rem;
  align-items: start;
}

.scenes__grid__features {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.scenes-feature {
  display: flex;
  gap: 0.625rem;
  align-items: flex-start;
  padding: 0.75rem 1rem;
  background: var(--bc-tile-bg);
  border: 1px solid var(--bc-hairline);
  border-radius: calc(var(--bc-radius-md) - 2px);

  &__icon {
    margin-top: 1px;
  }

  &__title {
    font-size: var(--bs-font-size-sm);
  }

  &__desc {
    font-size: var(--bs-font-size-sm);
    color: var(--bs-secondary-color);
    margin-top: 0.125rem;
    line-height: 1.5;
  }
}

.scenes-demo {
  background: var(--bc-tile-bg);
  border: 1px solid var(--bc-hairline);
  border-radius: var(--bc-radius-md);
  overflow: hidden;
}

@media (max-width: 51.25rem) {
  // Mobile: chart sits above features (features get order:1; chart stays at default order 0)
  .scenes__grid {
    grid-template-columns: 1fr;

    &__features {
      order: 1;
    }
  }
}
</style>
