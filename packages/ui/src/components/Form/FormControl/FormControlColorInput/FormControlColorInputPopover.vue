<template>
  <BPopover
    v-model="open"
    :target="target"
    placement="bottom"
    teleport-to="body"
    strategy="fixed"
    :click="!manual"
    :manual="manual"
    class="color-picker-popover"
  >
    <div
      ref="contentRef"
      class="form-control-color-input-popover"
    >
      <FormControlColorInputPicker v-model="model" />
    </div>
  </BPopover>
</template>

<script setup lang="ts">
import type { OnClickOutsideOptions } from '@vueuse/core'
import { BPopover } from 'bootstrap-vue-next'
import FormControlColorInputPicker from './FormControlColorInputPicker.vue'

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
</script>

<style scoped lang="scss">
:global(.popover.color-picker-popover) {
  --bs-popover-max-width: none;
}

.form-control-color-input-popover {
  width: 15rem;
}
</style>
