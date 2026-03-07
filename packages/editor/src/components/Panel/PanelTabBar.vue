<template>
  <div
    ref="tabsRef"
    class="panel-tab-bar"
    :class="{ 'panel-tab-bar--sticky': sticky }"
  >
    <button
      v-for="tab in tabs"
      :key="tab.key"
      :ref="el => { if (tab.key === modelValue) activeTabEl = el as HTMLElement | null }"
      class="panel-tab-bar__tab"
      :class="{ 'panel-tab-bar__tab--active': modelValue === tab.key }"
      @click="$emit('update:modelValue', tab.key)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

export interface PanelTab {
  key: string
  label: string
}

withDefaults(defineProps<{
  tabs: PanelTab[]
  modelValue: string
  sticky?: boolean
}>(), {
  sticky: false,
})

defineEmits<{
  'update:modelValue': [tab: string]
}>()

const tabsRef = ref<HTMLElement | null>(null)
let activeTabEl: HTMLElement | null = null

function scrollActiveTabIntoView() {
  nextTick(() => {
    if (activeTabEl?.scrollIntoView && tabsRef.value) {
      activeTabEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  })
}

watch(() => activeTabEl, scrollActiveTabIntoView)
</script>

<style scoped lang="scss">
.panel-tab-bar {
  display: flex;
  gap: 0;
  padding: 0 0.875rem;
  border-bottom: 1px solid var(--bs-border-color-translucent);
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  &--sticky {
    position: sticky;
    top: 0;
    z-index: 1;
    background: var(--bc-tile-bg);
  }
}

.panel-tab-bar__tab {
  font-family: inherit;
  font-size: var(--bs-font-size-sm);
  font-weight: 500;
  padding: 0.5rem 0.75rem;
  white-space: nowrap;
  flex-shrink: 0;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--bs-secondary-color);
  border-bottom: 2px solid transparent;
  transition: all 0.15s;

  &:hover {
    color: var(--bs-body-color);
  }

  &--active {
    color: var(--bs-primary);
    border-bottom-color: var(--bs-primary);
  }
}
</style>
