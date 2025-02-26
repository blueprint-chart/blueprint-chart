<template>
  <BButton
    v-bind="buttonProps"
    :id="buttonId"
    ref="element"
    class="button-icon"
    :class="classList"
    :aria-label="tooltipText"
    @mouseenter="currentHover = true"
    @mouseleave="currentHover = false"
  >
    <slot name="start" />
    <AppIcon
      v-if="iconLeft || (!iconLeft && !iconRight && loading)"
      :name="iconLeftOrSpinner"
      :size="iconLeftSize"
      :spin="loading"
      :spin-duration="loadingDuration"
      :variant="iconLeftVariant"
      :hover-variant="iconLeftHoverVariant"
      :hover="currentHover"
      class="button-icon__icon-left"
    />
    <span
      v-if="!hideLabel"
      class="button-icon__label"
    >
      <slot v-bind="{ labelOrLoadingText }">{{ labelOrLoadingText }}</slot>
    </span>
    <AppIcon
      v-if="iconRight"
      :name="iconRightOrSpinner"
      :size="iconRightSize"
      :spin="loading"
      :spin-duration="loadingDuration"
      :variant="iconRightVariant"
      :hover-variant="iconRightHoverVariant"
      :hover="currentHover"
      class="button-icon__icon-right"
      @click="click('icon-right')"
    />
    <ButtonIconCounter
      v-if="counter !== null"
      :counter="counter"
      :variant="counterVariant"
      :style="counterStyle"
    />
    <slot name="end" />
    <BTooltip
      v-if="hasTooltip"
      teleport-to="body"
      :delay="tooltipDelay"
      :boundary-padding="20"
      :placement="tooltipPlacement"
      :target="elementRef"
      :title="tooltipText"
    />
  </BButton>
</template>

<script setup lang="ts">
import { computed, ref, inject, useTemplateRef, type Component } from 'vue'
import type { TextColorVariant, ButtonVariant, PopoverPlacement, Size } from 'bootstrap-vue-next'
import IPhCircleNotch from '~icons/ph/circle-notch'
import AppIcon from '../../App/AppIcon/AppIcon.vue'
import ButtonIconCounter from '../ButtonIconCounter/ButtonIconCounter.vue'

let _uid = 0

const injectedVariant = inject('variant', 'action')
const injectedSize = inject('size', 'md')
const elementRef = useTemplateRef<HTMLElement>('element')

export interface ButtonIconProps {
  id?: string
  iconLeft?: string | Component
  iconLeftVariant?: TextColorVariant
  iconLeftHoverVariant?: TextColorVariant
  iconLeftSize?: string
  iconRight?: string | Component
  iconRightVariant?: TextColorVariant
  iconRightHoverVariant?: TextColorVariant
  iconRightSize?: string
  iconSpinner?: string | Component
  hideLabel?: boolean
  hideTooltip?: boolean
  label?: string
  square?: boolean
  variant?: ButtonVariant
  size?: Size
  block?: boolean
  pill?: boolean
  pressed?: boolean
  tag?: string
  type?: string
  loading?: boolean
  loadingDuration?: string
  loadingText?: string
  tooltipLabel?: string
  tooltipPlacement?: PopoverPlacement
  tooltipDelay?: { show: number; hide: number }
  showTooltipForce?: boolean
  hover?: boolean
  truncate?: boolean
  counter?: number | null
  counterVariant?: TextColorVariant
  counterStyle?: string | object
}

const props = withDefaults(defineProps<Omit<ButtonIconProps, 'pressed'>>(), {
  square: false,
  iconLeftSize: '1.25em',
  iconRightSize: '1.25em',
  iconSpinner: () => IPhCircleNotch as Component,
  hideLabel: false,
  hideTooltip: false,
  tag: 'button',
  type: 'button',
  loadingDuration: '1s',
  tooltipPlacement: 'top',
  tooltipDelay: () => ({ show: 0, hide: 0 }),
  counter: null,
})

const emit = defineEmits(['click:icon-right'])

function click(name: 'icon-right') {
  emit(`click:${name}`)
}

const currentHover = ref(false)

const buttonId = computed(() => props.id ?? `button-icon-${++_uid}`)

const classList = computed(() => {
  return {
    'button-icon--square': props.square,
    'button-icon--loading': props.loading,
    'button-icon--truncate': props.truncate,
    'button-icon--hover': currentHover.value,
    'button-icon--use-injected-variant': !props.variant,
    'button-icon--use-injected-size': !props.size,
  }
})

const iconLeftOrSpinner = computed(() => {
  return props.loading ? props.iconSpinner : props.iconLeft
})

const iconRightOrSpinner = computed(() => {
  return props.loading ? props.iconSpinner : props.iconRight
})

const labelOrLoadingText = computed(() => {
  return props.loading && props.loadingText ? props.loadingText : props.label
})

const tooltipText = computed(() => {
  return props.tooltipLabel ?? props.label
})

const hasTooltip = computed(() => {
  return !!tooltipText.value && !props.hideTooltip && (props.showTooltipForce || props.hideLabel)
})

const buttonProps = computed(() => ({
  block: props.block,
  pill: props.pill,
  pressed: props.pressed,
  size: props.size ?? injectedSize,
  tag: props.tag,
  type: props.type,
  variant: props.variant ?? injectedVariant,
}))
</script>

<style lang="scss" scoped>
@use '../../../styles/variables' as *;

.button-icon {
  &:deep(.app-icon) {
    font-size: 1.25em;
  }

  &.btn {
    display: inline-flex;
    justify-content: center;
    flex-shrink: 0;
    align-items: center;
    min-width: 0;
    

    .button-icon-counter {
      margin: -0.5em 0 -0.5em $spacer-xs;
    }
  }

  --button-icon-square-size: calc(
    var(--bs-btn-line-height) * var(--bs-btn-font-size) + var(--bs-btn-padding-y) * 2 + var(--bs-btn-border-width) * 2
  );

  &--truncate.btn {
    max-width: 100%;

    .button-icon__label {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1 0 0;
    }
  }

  &--square.btn {
    padding: 0;
    align-items: center;
    justify-content: center;
    width: var(--button-icon-square-size);
    height: var(--button-icon-square-size);
    position: relative;
    flex-shrink: 0;

    .button-icon-counter {
      margin: 0;
      position: absolute;
      bottom: auto;
      left: auto;
      right: 0;
      top: 0;
      transform: translate(50%, -50%);
    }
  }

  &__icon-left ~ &__label,
  &__label ~ &__icon-right {
    margin-left: $spacer-xs;
  }

  &__label {
    text-align: inherit;
  }
}
</style>
