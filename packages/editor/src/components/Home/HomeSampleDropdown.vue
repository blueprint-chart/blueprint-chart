<template>
  <div
    ref="containerRef"
    class="home-sample-dropdown"
  >
    <button
      class="btn btn-primary"
      @click="open = !open"
    >
      New Chart
      <svg
        class="home-sample-dropdown__caret"
        width="10"
        height="6"
        viewBox="0 0 10 6"
        fill="currentColor"
      >
        <path d="M0 0l5 6 5-6z" />
      </svg>
    </button>

    <div
      v-if="open"
      class="home-sample-dropdown__menu"
    >
      <button
        class="home-sample-dropdown__entry"
        @click="onBlank"
      >
        <div class="home-sample-dropdown__thumb home-sample-dropdown__thumb--blank">
          <component :is="IPhPlusCircle" />
        </div>
        <div class="home-sample-dropdown__text">
          <span class="fw-bold">Blank chart</span>
          <small class="text-body-secondary">Start from scratch with your own data</small>
        </div>
      </button>

      <hr class="my-1">

      <button
        v-for="sample in samples"
        :key="sample.id"
        class="home-sample-dropdown__entry"
        @click="onSelect(sample)"
      >
        <div class="home-sample-dropdown__thumb">
          <component
            :is="sampleThumbnails[sample.id]"
            v-if="sampleThumbnails[sample.id]"
          />
        </div>
        <div class="home-sample-dropdown__text">
          <span class="fw-bold">{{ sample.title }}</span>
          <small class="text-body-secondary">{{ sample.description }}</small>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, markRaw } from 'vue'
import { onClickOutside } from '@vueuse/core'
import type { Component } from 'vue'
import { samples } from '@blueprint-chart/lib'
import type { ChartSample } from '@blueprint-chart/lib'
import IPhPlusCircle from '~icons/ph/plus-circle'

const emit = defineEmits<{
  blank: []
  select: [sample: ChartSample]
}>()

// Import all sample .bpc files as Vue components via the bpc-svg plugin.
// The glob uses a relative path to the lib package's samples directory.
const bpcModules = import.meta.glob<{ default: Component }>(
  '../../../../lib/src/samples/*.bpc',
  { eager: true },
)

// Build a map from sample id (e.g. "letter-frequency") to component
const sampleThumbnails: Record<string, Component> = {}
for (const [path, mod] of Object.entries(bpcModules)) {
  const filename = path.split('/').pop()?.replace('.bpc', '')
  if (filename && mod.default) {
    sampleThumbnails[filename] = markRaw(mod.default)
  }
}

const open = ref(false)
const containerRef = ref<HTMLElement | null>(null)

onClickOutside(containerRef, () => {
  open.value = false
})

function onBlank() {
  open.value = false
  emit('blank')
}

function onSelect(sample: ChartSample) {
  open.value = false
  emit('select', sample)
}
</script>

<style scoped lang="scss">
.home-sample-dropdown {
  position: relative;
}

.home-sample-dropdown__caret {
  margin-left: 0.375rem;
  vertical-align: middle;
}

.home-sample-dropdown__menu {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 100;
  width: 360px;
  max-height: 480px;
  overflow-y: auto;
  background: var(--bs-navbar-bg);
  border: 1px solid var(--bs-border-color);
  border-radius: 0.375rem;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.15);
  margin-top: 0.25rem;
  padding: 0.25rem 0;
}

.home-sample-dropdown__entry {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  color: inherit;

  &:hover {
    background: var(--bs-tertiary-bg);
  }
}

.home-sample-dropdown__thumb {
  flex-shrink: 0;
  width: 56px;
  height: 40px;
  border-radius: 0.25rem;
  overflow: hidden;
  background: var(--bs-tertiary-bg);
  display: flex;
  align-items: center;
  justify-content: center;

  :deep(svg) {
    width: 100%;
    height: 100%;
    display: block;
  }

  &--blank {
    color: var(--bs-secondary-color);
    font-size: 1.25rem;
  }
}

.home-sample-dropdown__text {
  display: flex;
  flex-direction: column;
  min-width: 0;

  span, small {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  small {
    font-size: 0.75rem;
  }
}
</style>
