<template>
  <span
    class="app-icon"
    :class="classList"
    :style="style"
    @mouseenter="currentHover = true"
    @mouseleave="currentHover = hover ?? false"
  >
    <component
      :is="name"
      v-if="name"
    />
    <slot v-else />
  </span>
</template>

<script setup lang="ts">
import { computed, ref, watch, type Component } from 'vue'
import type { TextColorVariant } from 'bootstrap-vue-next'
import type { IconSize } from '../../../types'

export interface AppIconProps {
  name?: string | Component
  size?: IconSize | string
  scale?: number
  variant?: TextColorVariant
  hoverVariant?: TextColorVariant
  beat?: boolean
  beatDuration?: string
  fade?: boolean
  fadeDuration?: string
  spin?: boolean
  spinReverse?: boolean
  spinDuration?: string
  hover?: boolean
}

const props = withDefaults(defineProps<AppIconProps>(), {
  scale: 1,
  beatDuration: '1s',
  fadeDuration: '1s',
  spinDuration: '1s',
})

const currentHover = ref(false)

function syncHoverProp() {
  currentHover.value = props.hover
}

watch(() => props.hover, syncHoverProp, { immediate: true })

const color = computed(() => {
  let colorVariant = 'currentColor'

  if (props.variant) {
    colorVariant = `var(--bs-${props.variant}, currentColor)`
  }

  if (currentHover.value && props.hoverVariant) {
    colorVariant = `var(--bs-${props.hoverVariant}, ${colorVariant})`
  }

  return colorVariant
})

const isPercentSize = computed(() => {
  return typeof props.size === 'string' && props.size.endsWith('%')
})

const isRawSize = computed(() => {
  return !['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', undefined].includes(props.size) && !isPercentSize.value
})

const hasSize = computed(() => {
  return ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'].includes(props.size ?? '')
})

const style = computed(() => {
  return {
    '--app-icon-color': color.value,
    '--app-icon-raw-size': isRawSize.value ? props.size : undefined,
    '--app-icon-percent-size': isPercentSize.value ? props.size : undefined,
    '--app-icon-size': hasSize.value ? props.size : undefined,
    '--app-icon-scale': props.scale ?? 1,
    '--app-icon-spin-duration': props.spinDuration,
    '--app-icon-beat-duration': props.beatDuration,
    '--app-icon-fade-duration': props.fadeDuration,
  }
})

const classList = computed(() => {
  return {
    [`app-icon--size-${props.size}`]: hasSize.value,
    [`app-icon--has-size`]: hasSize.value,
    [`app-icon--raw-size`]: isRawSize.value,
    [`app-icon--percent-size`]: isPercentSize.value,
    [`app-icon--hover`]: currentHover.value,
    [`app-icon--spin`]: props.spin,
    [`app-icon--spin-reverse`]: props.spinReverse,
    [`app-icon--beat`]: props.beat,
    [`app-icon--fade`]: props.fade,
  }
})
</script>

<style lang="scss" scoped>
@use '../../../styles/mixins' as *;
@use '../../../styles/variables' as *;

@keyframes app-icon-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes app-icon-spin-reverse {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}

@keyframes app-icon-beat {
  0%, 100% { transform: scale(0.8); }
  50% { transform: scale(1.2); }
}

@keyframes app-icon-fade {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.app-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--app-icon-color, currentColor);
  @include app-icon-size($app-icon-size-scale-base, var(--app-icon-scale, 1));

  @each $size, $value in $app-icon-sizes {
    &--size-#{$size} {
      @include app-icon-size($value, var(--app-icon-scale));
    }
  }

  &--raw-size {
    font-size: var(--app-icon-raw-size);
  }

  &--percent-size {
    width: var(--app-icon-percent-size);
    height: auto;

    :deep(svg) {
      width: 100%;
      height: auto;
    }
  }

  &--spin :deep(svg) {
    animation: app-icon-spin var(--app-icon-spin-duration, 1s) linear infinite;
  }

  &--spin-reverse :deep(svg) {
    animation: app-icon-spin-reverse var(--app-icon-spin-duration, 1s) linear infinite;
  }

  &--beat :deep(svg) {
    animation: app-icon-beat var(--app-icon-beat-duration, 1s) ease-in-out infinite;
  }

  &--fade :deep(svg) {
    animation: app-icon-fade var(--app-icon-fade-duration, 1s) ease-in-out infinite;
  }
}
</style>
