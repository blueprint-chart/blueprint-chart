<script setup lang="ts">
import type { Component } from 'vue'
import { SceneTimelineCompact } from '@blueprint-chart/ui'
import PanelOpenButton from '@/components/Panel/PanelOpenButton.vue'

interface SceneEntry {
  name: string | null
  index: number
  removable?: boolean
  thumbnail?: string | null
}

withDefaults(defineProps<{
  showTimeline: boolean
  scenes: SceneEntry[]
  activeIndex: number
  playing: boolean
  panelLabel: string
  panelIcon?: Component
  panelDisabled?: boolean
  scenesSheetOpen?: boolean
}>(), {
  panelIcon: undefined,
  panelDisabled: false,
  scenesSheetOpen: false,
})

const emit = defineEmits<{
  'update:activeIndex': [n: number]
  'play': []
  'pause': []
  'expand-timeline': []
  'open-panel': []
}>()

function onActiveIndexUpdate(n: number) {
  emit('update:activeIndex', n)
}
</script>

<template>
  <div
    class="layout-narrow-dock"
    role="toolbar"
    aria-label="Wizard controls"
  >
    <div class="layout-narrow-dock__timeline">
      <SceneTimelineCompact
        v-if="showTimeline"
        :scenes="scenes"
        :active-index="activeIndex"
        :playing="playing"
        :expanded="scenesSheetOpen"
        @update:active-index="onActiveIndexUpdate"
        @play="emit('play')"
        @pause="emit('pause')"
        @expand="emit('expand-timeline')"
      />
    </div>
    <div class="layout-narrow-dock__action">
      <PanelOpenButton
        :label="panelLabel"
        :icon="panelIcon"
        :disabled="panelDisabled"
        @open="emit('open-panel')"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.layout-narrow-dock {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 44px;
  padding: 0 0.75rem;
  background: var(--bc-chrome-bg);
  border-top: 1px solid var(--bc-hairline);
  flex-shrink: 0;

  &__timeline {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    align-items: center;
  }

  &__action {
    flex-shrink: 0;
  }
}
</style>
