<template>
  <ButtonIcon
    :icon-left="copied ? IPhCheck : IPhCopy"
    :label="copied ? 'Copied!' : label"
    :variant="copied ? 'success' : variant"
    :size="size"
    @click="onCopy"
  />
</template>

<script setup lang="ts">
import IPhCopy from '~icons/ph/copy'
import IPhCheck from '~icons/ph/check'
import type { ButtonVariant, Size } from 'bootstrap-vue-next'

const props = withDefaults(defineProps<{
  text: string
  label?: string
  variant?: ButtonVariant
  size?: Size
}>(), {
  label: 'Copy',
  variant: 'outline-secondary',
  size: 'sm',
})

const copied = shallowRef(false)
let timer: ReturnType<typeof setTimeout> | undefined

async function onCopy() {
  try {
    await globalThis.navigator.clipboard.writeText(props.text)
    copied.value = true
    clearTimeout(timer)
    timer = setTimeout(() => {
      copied.value = false
    }, 1500)
  }
  catch {
    // Clipboard API may fail in insecure contexts
  }
}
</script>
