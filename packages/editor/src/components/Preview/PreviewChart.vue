<template>
  <div
    ref="containerRef"
    class="w-100 h-100"
    :style="cvdFilterStyle"
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
  <svg
    v-if="cvdMode"
    class="position-absolute"
    width="0"
    height="0"
    aria-hidden="true"
  >
    <defs ref="cvdDefsRef" />
  </svg>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount, useTemplateRef, type Component } from 'vue'
import { storeToRefs } from 'pinia'
import { useChartPreview } from '@/composables/useChartPreview'
import { useCvdMode } from '@/stores/cvdMode'
import { usePreviewContainer } from '@/stores/previewContainer'
import { useEditorPanel } from '@/stores/editorPanel'
import { useChartConfig } from '@/stores/chartConfig'
import { useScenes } from '@/stores/scenes'
import { getCvdFilterId, createCvdSvgFilter, type CvdType } from '@blueprint-chart/lib'
import {
  ScenePlayerButtons,
  ScenePlayerProgressBar,
  ScenePlayerDotStepper,
  ScenePlayerMinimalArrows,
} from '@blueprint-chart/ui'

const containerRef = useTemplateRef<HTMLElement>('containerRef')
useChartPreview(containerRef)

const { containerRef: sharedContainerRef } = usePreviewContainer()
watch(containerRef, (el) => {
  sharedContainerRef.value = el
}, { immediate: true })

const { selectAnnotation } = useEditorPanel()

function onDblClick(e: MouseEvent) {
  const target = e.target as Element
  const annG = target.closest('g[data-annotation-index]')
  if (!annG) {
    return
  }
  e.preventDefault()
  window.getSelection()?.removeAllRanges()
  // Prefer annotation id (stable across hidden-annotation filtering)
  const annId = annG.getAttribute('data-annotation-id')
  if (annId) {
    selectAnnotation(annId)
    return
  }
  const index = parseInt(annG.getAttribute('data-annotation-index') || '', 10)
  if (!isNaN(index)) {
    selectAnnotation(index)
  }
}

onMounted(() => {
  (containerRef.value as HTMLElement | null)?.addEventListener('dblclick', onDblClick)
})
onBeforeUnmount(() => {
  (containerRef.value as HTMLElement | null)?.removeEventListener('dblclick', onDblClick)
})

const { cvdMode } = storeToRefs(useCvdMode())
const cvdDefsRef = useTemplateRef<SVGElement>('cvdDefsRef')

watch([cvdMode, cvdDefsRef], ([mode, defs]) => {
  if (!defs) {
    return
  }
  while (defs.firstChild) {
    defs.removeChild(defs.firstChild)
  }
  if (mode) {
    defs.appendChild(createCvdSvgFilter(mode as CvdType))
  }
}, { immediate: true })

const cvdFilterStyle = computed(() => {
  if (!cvdMode.value) {
    return undefined
  }
  return { filter: `url(#${getCvdFilterId(cvdMode.value as CvdType)})` }
})

// Scene player
const { layout } = useChartConfig()
const { scenes, activeIndex, playing, setActive, startPlayback, stopPlayback } = useScenes()

const playerTarget = ref<HTMLElement | null>(null)

const playerComponentMap: Record<string, Component> = {
  'buttons': ScenePlayerButtons,
  'progress-bar': ScenePlayerProgressBar,
  'dot-stepper': ScenePlayerDotStepper,
  'minimal-arrows': ScenePlayerMinimalArrows,
}

const playerComponent = computed(() => playerComponentMap[layout.value.playerType])

const totalScenes = computed(() => scenes.value.length + 1)

const currentScene = computed(() => activeIndex.value + 2)

const showPlayer = computed(() =>
  scenes.value.length >= 1 && layout.value.playerType !== 'none',
)

function onSceneChange(scene: number) {
  // scene is 1-based: 1 = base, 2 = first override, etc.
  setActive(scene - 2)
}

// Observe the container for .bc-frame appearing
let observer: MutationObserver | null = null

function findFrame() {
  const el = containerRef.value as HTMLElement | null
  if (!el) {
    return null
  }
  return el.querySelector<HTMLElement>('.bc-frame-footer')
}

watch(containerRef, (el) => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
  if (!el) {
    playerTarget.value = null
    return
  }
  // Check immediately
  playerTarget.value = findFrame()
  // Observe for changes
  observer = new MutationObserver(() => {
    playerTarget.value = findFrame()
  })
  observer.observe(el as unknown as Element, { childList: true, subtree: true })
}, { immediate: true })

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})
</script>
