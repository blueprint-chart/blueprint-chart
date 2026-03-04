<template>
  <div
    ref="panelRef"
    class="panel-floating"
    :style="positionStyle"
  >
    <div
      ref="headerRef"
      class="panel-floating__header"
    >
      <div class="panel-floating__title">
        <ButtonDrag />
        {{ title }}
      </div>
      <div class="panel-floating__actions">
        <ButtonDock @click="$emit('dock')" />
        <ButtonClose @click="$emit('close')" />
      </div>
    </div>
    <slot name="tabs" />
    <div class="panel-floating__body">
      <slot />
    </div>
    <div
      v-if="$slots.footer"
      class="panel-floating__footer"
    >
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, toRef } from 'vue'
import { ButtonDock, ButtonDrag, ButtonClose } from '@blueprint-chart/ui'
import { usePanelDrag, type DragPosition } from '@/composables/usePanelDrag'

const props = defineProps<{
  containerRef: HTMLElement | null
  title: string
  position: DragPosition
}>()

defineEmits<{
  dock: []
  close: []
}>()

const headerRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const containerRefLocal = computed(() => props.containerRef)

// Position is a shared reactive object from useEditorPanel module state.
// usePanelDrag mutates position.x/.y directly — this is intentional.
const position = toRef(props, 'position')

onMounted(() => {
  if (position.value.x < 0 && props.containerRef) {
    const panelWidth = panelRef.value?.offsetWidth ?? 340
    const margin = 16
    position.value.x = props.containerRef.clientWidth - panelWidth - margin
    position.value.y = Math.max(margin, position.value.y)
  }
})

usePanelDrag(
  headerRef,
  containerRefLocal,
  position.value,
)

const positionStyle = computed(() => ({
  left: `${position.value.x}px`,
  top: `${position.value.y}px`,
}))
</script>

<style scoped lang="scss">
.panel-floating {
  position: absolute;
  width: 340px;
  min-width: 260px;
  background: var(--bs-body-bg);
  border-radius: var(--bs-border-radius-sm);
  box-shadow: var(--bs-box-shadow);
  display: flex;
  flex-direction: column;
  max-height: calc(100% - 40px);
  overflow: hidden;
  z-index: 200;
  resize: both;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.625rem 0.875rem;
    border-bottom: 1px solid var(--bs-border-color-translucent);
    cursor: grab;
    user-select: none;
    background: var(--bs-tertiary-bg);
    border-radius: inherit;

    &:active {
      cursor: grabbing;
    }
  }

  &__title {
    font-size: var(--bs-font-size-sm);
    font-weight: 600;
    color: var(--bs-body-color);
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  &__actions {
    display: flex;
    gap: 0.25rem;
  }

  &__body {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem 0.875rem 0.875rem;
  }

  &__footer {
    flex-shrink: 0;
    border-top: 1px solid var(--bs-border-color-translucent);
    padding: 0.625rem 0.875rem;
  }
}
</style>
