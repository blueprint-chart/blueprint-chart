<template>
  <BPopover
    v-model="open"
    :target="target"
    placement="bottom"
    teleport-to="body"
    strategy="fixed"
    :click="!manual"
    :manual="manual"
    custom-class="color-picker-popover"
  >
    <div ref="contentRef">
      <TwitterPicker
        v-model="model"
        triangle="hide"
        class="mb-3"
      />
      <HueSlider
        :model-value="hue"
        class="color-picker-popover__hue"
        @update:model-value="onHueChange"
      />
    </div>
  </BPopover>
</template>

<script setup lang="ts">
import type { OnClickOutsideOptions } from '@vueuse/core'
import { BPopover } from 'bootstrap-vue-next'
import { TwitterPicker, HueSlider, tinycolor } from 'vue-color'
import 'vue-color/style.css'

const model = defineModel<string>({ required: true })

const props = withDefaults(defineProps<{
  target: HTMLElement | null
  manual?: boolean
}>(), {
  manual: false,
})

const open = defineModel<boolean>('open', { default: false })
const contentRef = useTemplateRef<HTMLElement>('contentRef')

const clickOutsideOptions: OnClickOutsideOptions = {
  detectIframe: true,
  ignore: () => [props.target],
}
onClickOutside(contentRef, () => {
  if (props.manual) {
    open.value = false
  }
}, clickOutsideOptions)

const hue = computed(() => {
  const tc = tinycolor(model.value)
  return tc.toHsv().h
})

function onHueChange(h: number) {
  const hex = tinycolor({ h, s: 1, v: 1 }).toHexString()
  model.value = hex
}
</script>

<style lang="scss">
.color-picker-popover {
  max-width: none;

  .vc-twitter-picker {
    width: 252px !important;
    margin-right: -6px;
    box-shadow: none !important;
    border: none !important;
    background: transparent !important;

    .vc-editable-input {
      float: right;
    }

    .body {
      padding: 0;
    }
  }

  &__hue {
    max-width: 100%;
  }
}
</style>
