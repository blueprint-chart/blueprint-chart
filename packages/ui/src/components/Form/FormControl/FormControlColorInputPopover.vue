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
        :model-value="modelValue"
        triangle="hide"
        class="mb-3"
        @update:model-value="$emit('update:modelValue', $event)"
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
import { computed, useTemplateRef, onMounted, onBeforeUnmount, watch } from 'vue'
import { BPopover } from 'bootstrap-vue-next'
import { TwitterPicker, HueSlider, tinycolor } from 'vue-color'
import 'vue-color/style.css'

const props = withDefaults(defineProps<{
  modelValue: string
  target: HTMLElement | null
  manual?: boolean
}>(), {
  manual: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const open = defineModel<boolean>('open', { default: false })
const contentRef = useTemplateRef<HTMLElement>('contentRef')

function onDocumentClick(event: MouseEvent) {
  const target = event.target as Node
  const popoverEl = contentRef.value?.closest('.popover')
  if (popoverEl?.contains(target)) return
  if (props.target?.contains(target)) return
  open.value = false
}

watch(open, (isOpen) => {
  if (!props.manual) return
  if (isOpen) {
    document.addEventListener('mousedown', onDocumentClick, true)
  }
  else {
    document.removeEventListener('mousedown', onDocumentClick, true)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocumentClick, true)
})

const hue = computed(() => {
  const tc = tinycolor(props.modelValue)
  return tc.toHsv().h
})

function onHueChange(h: number) {
  const hex = tinycolor({ h, s: 1, v: 1 }).toHexString()
  emit('update:modelValue', hex)
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
}

.color-picker-popover__hue {
  max-width: 100%;
}
</style>
