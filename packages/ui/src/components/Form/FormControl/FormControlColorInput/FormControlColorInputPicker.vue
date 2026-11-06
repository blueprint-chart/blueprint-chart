<script setup lang="ts">
import { hexToHsv, hsvToHex, type Hsv } from '../../../../utils/hsv'
import { toHexColor } from '../../../../utils/toHexColor'
import { useHexColorField } from '../../../../composables/useHexColorField'
import FormControlColorInputSwatches from './FormControlColorInputSwatches.vue'

const KEY_STEP = 0.01
const KEY_STEP_LARGE = 0.1
const ARROW_DELTAS: Record<string, [number, number]> = Object.freeze({
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, 1],
  ArrowDown: [0, -1],
})

const model = defineModel<string>({ required: true })
const emit = defineEmits<{ pick: [color: string] }>()

const BLACK: Hsv = Object.freeze({ h: 0, s: 0, v: 0 })

const startHex = toHexColor(model.value)
const hsv = ref<Hsv>(startHex ? hexToHsv(startHex) : BLACK)
const area = useTemplateRef<HTMLElement>('area')

// Black and greys carry no hue (and black no saturation), so keep the previous
// ones instead of snapping the hue slider back to red.
function syncFromModel(value: string) {
  const hex = toHexColor(value)
  if (!hex || hsvToHex(hsv.value) === hex) {
    return
  }
  const next = hexToHsv(hex)
  const hasHue = next.s > 0 && next.v > 0
  hsv.value = {
    h: hasHue ? next.h : hsv.value.h,
    s: next.v > 0 ? next.s : hsv.value.s,
    v: next.v,
  }
}

watch(model, syncFromModel)

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value))
}

function update(changes: Partial<Hsv>) {
  hsv.value = { ...hsv.value, ...changes }
  model.value = hsvToHex(hsv.value)
}

function pickFromPointer({ clientX, clientY }: PointerEvent) {
  const { left, top, width, height } = area.value!.getBoundingClientRect()
  update({ s: clamp((clientX - left) / width), v: clamp(1 - (clientY - top) / height) })
}

function onPointerDown(event: PointerEvent) {
  area.value?.setPointerCapture(event.pointerId)
  pickFromPointer(event)
}

function onPointerMove(event: PointerEvent) {
  if (area.value?.hasPointerCapture(event.pointerId)) {
    pickFromPointer(event)
  }
}

function onKeydown(event: KeyboardEvent) {
  const delta = ARROW_DELTAS[event.key]
  if (!delta) {
    return
  }
  event.preventDefault()
  const step = event.shiftKey ? KEY_STEP_LARGE : KEY_STEP
  update({ s: clamp(hsv.value.s + delta[0] * step), v: clamp(hsv.value.v + delta[1] * step) })
}

// A grey has no hue to change, so moving the hue slider jumps to the full color.
function onHueInput(event: Event) {
  const h = Number((event.target as HTMLInputElement).value)
  const isGrey = hsv.value.s === 0 || hsv.value.v === 0
  update(isGrey ? { h, s: 1, v: 1 } : { h })
}

const { onHexInput, onHexChange } = useHexColorField(model)

function onSwatchPick(color: string) {
  model.value = color
  emit('pick', color)
}

const areaStyle = computed(() => ({ backgroundColor: hsvToHex({ h: hsv.value.h, s: 1, v: 1 }) }))
// The thumb travels a track inset by its own size so it never overflows the
// area, which would otherwise add a horizontal scrollbar to scrolling parents.
const thumbStyle = computed(() => ({
  left: `calc(${hsv.value.s} * (100% - var(--thumb-size)) + var(--thumb-size) / 2)`,
  top: `calc(${1 - hsv.value.v} * (100% - var(--thumb-size)) + var(--thumb-size) / 2)`,
  backgroundColor: model.value,
}))
const areaValueText = computed(() => {
  return `Saturation ${Math.round(hsv.value.s * 100)}%, brightness ${Math.round(hsv.value.v * 100)}%`
})
</script>

<template>
  <div class="form-control-color-input-picker">
    <div
      ref="area"
      class="form-control-color-input-picker__area"
      role="slider"
      tabindex="0"
      aria-label="Saturation and brightness"
      :aria-valuetext="areaValueText"
      :style="areaStyle"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @keydown="onKeydown"
    >
      <span
        class="form-control-color-input-picker__area__thumb"
        :style="thumbStyle"
      />
    </div>
    <input
      type="range"
      class="form-control-color-input-picker__hue"
      min="0"
      max="360"
      aria-label="Hue"
      :value="hsv.h"
      @input="onHueInput"
    >
    <input
      class="form-control-color-input-picker__hex form-control form-control-sm"
      aria-label="Hex"
      spellcheck="false"
      :value="model"
      @input="onHexInput"
      @change="onHexChange"
    >
    <FormControlColorInputSwatches @pick="onSwatchPick" />
  </div>
</template>

<style scoped lang="scss">
$thumb-size: 0.875rem;

.form-control-color-input-picker {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;

  &__area {
    --thumb-size: #{$thumb-size};

    position: relative;
    height: 9rem;
    border-radius: var(--bc-radius-xs);
    background-image: linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent);
    cursor: crosshair;
    touch-action: none;

    &:focus-visible {
      outline: none;
      box-shadow: var(--bc-focus-ring);
    }

    &__thumb {
      position: absolute;
      width: $thumb-size;
      height: $thumb-size;
      border: 2px solid #fff;
      border-radius: 50%;
      box-shadow: 0 0 0 1px rgb(0 0 0 / 40%);
      transform: translate(-50%, -50%);
      pointer-events: none;
    }
  }

  &__hue {
    width: 100%;
    height: 0.75rem;
    border-radius: var(--bc-radius-xs);
    background: linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00);
    appearance: none;
    cursor: pointer;

    &:focus-visible {
      outline: none;
      box-shadow: var(--bc-focus-ring);
    }

    &::-webkit-slider-thumb {
      width: $thumb-size;
      height: $thumb-size;
      border: 2px solid #fff;
      border-radius: 50%;
      background: transparent;
      box-shadow: 0 0 0 1px rgb(0 0 0 / 40%);
      appearance: none;
    }

    &::-moz-range-thumb {
      width: $thumb-size;
      height: $thumb-size;
      border: 2px solid #fff;
      border-radius: 50%;
      background: transparent;
      box-shadow: 0 0 0 1px rgb(0 0 0 / 40%);
    }
  }

  &__hex {
    font-family: var(--bs-font-monospace);
  }
}
</style>
