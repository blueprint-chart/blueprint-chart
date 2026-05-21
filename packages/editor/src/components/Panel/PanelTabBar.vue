<template>
  <div
    ref="tabsRef"
    class="panel-tab-bar"
    :class="{ 'panel-tab-bar--sticky': sticky }"
  >
    <button
      v-for="tab in tabs"
      :key="tab.key"
      :ref="el => { if (tab.key === model) activeTabEl = el as HTMLElement | null }"
      class="panel-tab-bar__tab"
      :class="{ 'panel-tab-bar__tab--active': model === tab.key }"
      @click="model = tab.key"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<script setup lang="ts">

export interface PanelTab {
  key: string
  label: string
}

withDefaults(defineProps<{
  tabs: PanelTab[]
  sticky?: boolean
}>(), {
  sticky: false,
})

const model = defineModel<string>({ required: true })

const tabsRef = useTemplateRef<HTMLElement>('tabsRef')
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
  gap: 0.125rem;
  padding: 0.375rem 0.625rem;
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

  &__tab {
    font-family: inherit;
    font-size: var(--bs-font-size-sm);
    font-weight: 500;
    padding: 0.375rem 0.625rem;
    white-space: nowrap;
    flex-shrink: 0;
    border: none;
    cursor: pointer;
    background: transparent;
    color: var(--bs-secondary-color);
    border-radius: var(--bc-radius-xs);
    transition: background-color 0.15s, color 0.15s, font-weight 0.15s;

    &:hover {
      color: var(--bs-body-color);
      background: var(--bc-tile-bg-elevated);
    }

    &--active,
    &--active:hover,
    &--active:focus-visible {
      background: var(--bs-primary);
      color: var(--bs-white, #fff);
      font-weight: 600;
    }
  }
}
</style>
