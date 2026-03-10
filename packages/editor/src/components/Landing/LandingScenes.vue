<template>
  <LandingSection id="stories">
    <div class="scenes-grid">
      <div class="scenes-demo">
        <div
          ref="containerRef"
          class="scenes-demo__chart"
        />
        <Teleport
          v-if="playerTarget && sceneCount > 0"
          :to="playerTarget"
        >
          <ScenePlayerMinimalArrows
            :total="sceneCount + 1"
            :current="currentScene"
            :playing="playing"
            position="center"
            @update:current="onSceneChange"
            @play="startPlayback"
            @pause="stopPlayback"
          />
        </Teleport>
      </div>
      <div>
        <LandingSectionHeader label="Scenes & storytelling">
          Guide your reader<br><em>through the data.</em>
          <template #lead>
            Create a sequence of scenes — each a step in your narrative.
            The same chart morphs from overview to focus, from cause to consequence.
          </template>
        </LandingSectionHeader>
        <div class="scenes-features">
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
      </div>
    </div>
  </LandingSection>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount, type Component } from 'vue'
import { useResizeObserver, useThrottleFn } from '@vueuse/core'
import { AppIcon, ScenePlayerMinimalArrows } from '@blueprint-chart/ui'
import { samples } from '@blueprint-chart/lib'
import IPhFilmSlate from '~icons/ph/film-slate'
import IPhSparkle from '~icons/ph/sparkle'
import IPhCode from '~icons/ph/code'
import LandingSection from './LandingSection.vue'
import LandingSectionHeader from './LandingSectionHeader.vue'
import { renderDsl, parseDslSceneCount } from '@/composables/useChartFromDsl'
import { useTheme } from '@/composables/useTheme'

const bpc = samples.find(s => s.id === 'co2-emissions-story')!.dsl
  .replace(/\{/, '{\n  theme = "blueprint-framed"')
const sceneCount = parseDslSceneCount(bpc)

const containerRef = ref<HTMLElement | null>(null)
const playerTarget = ref<HTMLElement | null>(null)
const activeIndex = ref(-1)
const playing = ref(false)
let playbackTimer: ReturnType<typeof globalThis.setInterval> | null = null

const currentScene = ref(activeIndex.value + 2)
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
  })
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
  activeIndex.value = scene - 2
}

function startPlayback() {
  if (playing.value) {
    return
  }
  playing.value = true
  activeIndex.value = -1
  playbackTimer = globalThis.setInterval(() => {
    if (activeIndex.value < sceneCount - 1) {
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

<style scoped lang="scss">
.scenes-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.5rem;
  align-items: start;
}

.scenes-features {
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
  border: var(--bc-tile-border);
  border-radius: calc(var(--bc-tile-radius) - 2px);
}

.scenes-feature__icon {
  margin-top: 0.0625rem;
}

.scenes-feature__title {
  font-size: 0.8125rem;
}

.scenes-feature__desc {
  font-size: 0.75rem;
  color: var(--bs-secondary-color);
  margin-top: 0.125rem;
  line-height: 1.5;
}

.scenes-demo {
  background: var(--bc-tile-bg);
  border: var(--bc-tile-border);
  border-radius: var(--bc-tile-radius);
  box-shadow: var(--bc-tile-shadow);
  overflow: hidden;
  min-height: 20rem;
}

.scenes-demo__chart {
  min-height: 20rem;
  width: 100%;
  height: 100%;
}

@media (max-width: 51.25rem) {
  .scenes-grid {
    grid-template-columns: 1fr;
  }
}
</style>
