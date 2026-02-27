<template>
  <Transition name="drawer">
    <div
      v-if="open"
      class="layout-bottom-drawer"
      :style="drawerStyle"
    >
      <div
        class="layout-bottom-drawer__handle"
        @click="open = false"
      >
        <div class="layout-bottom-drawer__bar" />
      </div>
      <div
        v-if="title"
        class="layout-bottom-drawer__header"
      >
        <h2 class="layout-bottom-drawer__title">
          {{ title }}
        </h2>
      </div>
      <div class="layout-bottom-drawer__body">
        <slot />
      </div>
    </div>
  </Transition>
  <div
    v-if="open"
    class="layout-bottom-drawer__backdrop"
    @click="open = false"
  />
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'

const open = defineModel<boolean>({ required: true })

const props = withDefaults(defineProps<{
  title?: string
  maxHeight?: string
}>(), {
  title: undefined,
  maxHeight: '70vh',
})

const drawerStyle = computed<CSSProperties>(() => ({
  maxHeight: props.maxHeight,
}))
</script>

<style scoped lang="scss">
.layout-bottom-drawer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1050;
  display: flex;
  flex-direction: column;
  background: var(--bs-body-bg);
  border-top: 1px solid var(--bs-border-color);
  border-radius: var(--bs-border-radius-lg) var(--bs-border-radius-lg) 0 0;
  box-shadow: 0 -0.25rem 1rem rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.layout-bottom-drawer__backdrop {
  position: fixed;
  inset: 0;
  z-index: 1040;
  background: rgba(0, 0, 0, 0.3);
}

.layout-bottom-drawer__handle {
  display: flex;
  justify-content: center;
  padding: 0.5rem;
  cursor: pointer;
  flex-shrink: 0;
}

.layout-bottom-drawer__bar {
  width: 2rem;
  height: 0.25rem;
  border-radius: var(--bs-border-radius-pill);
  background: var(--bs-secondary-color);
  opacity: 0.4;
}

.layout-bottom-drawer__header {
  display: flex;
  align-items: center;
  padding: 0 1rem 0.5rem;
  flex-shrink: 0;
}

.layout-bottom-drawer__title {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0;
  color: var(--bs-body-color);
}

.layout-bottom-drawer__body {
  flex: 1;
  overflow-y: auto;
  padding: 0 1rem 1rem;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.25s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  transform: translateY(100%);
}
</style>
