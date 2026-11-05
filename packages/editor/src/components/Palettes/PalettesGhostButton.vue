<script setup lang="ts">
import type { Component } from 'vue'
import { ButtonIcon } from '@blueprint-chart/ui'
import { useLazyTooltip } from '@/composables/useLazyTooltip'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  label: string
  icon: Component
  danger?: boolean
}>()

const classList = computed(() => ({
  'palettes-ghost-button--danger': props.danger,
}))

const button = useTemplateRef<InstanceType<typeof ButtonIcon>>('button')
const tooltip = useLazyTooltip()
</script>

<template>
  <ButtonIcon
    v-bind="$attrs"
    ref="button"
    class="palettes-ghost-button"
    :class="classList"
    :label="label"
    :icon-left="icon"
    hide-label
    hide-tooltip
    square
    variant="link"
    size="sm"
    @mouseenter="tooltip.arm"
    @focus="tooltip.arm"
  />
  <BTooltip
    v-if="tooltip.mounted.value"
    v-model="tooltip.shown.value"
    teleport-to="body"
    :target="button?.$el"
    :title="label"
    placement="top"
  />
</template>

<style scoped lang="scss">
.palettes-ghost-button.btn {
  --bs-btn-color: var(--bs-secondary-color);
  --bs-btn-hover-color: var(--bs-body-color);
  --bs-btn-active-color: var(--bs-body-color);
  --bs-btn-focus-box-shadow: var(--bc-focus-ring);

  border: 0;
  border-radius: var(--bc-radius-xs);
  text-decoration: none;
  transition: color var(--bc-duration-base) var(--bc-ease),
              background var(--bc-duration-base) var(--bc-ease);

  &:hover {
    background: var(--bc-wash-firm);
  }

  &:focus-visible {
    box-shadow: var(--bc-focus-ring);
  }
}

.palettes-ghost-button--danger.btn {
  --bs-btn-hover-color: var(--bs-danger-text-emphasis);
  --bs-btn-active-color: var(--bs-danger-text-emphasis);
}
</style>
