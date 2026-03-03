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
import { ref } from 'vue'
import ButtonIcon from '../../Button/ButtonIcon/ButtonIcon.vue'
import IPhCopy from '~icons/ph/copy'
import IPhCheck from '~icons/ph/check'

const props = withDefaults(defineProps<{
  text: string
  label?: string
  variant?: string
  size?: string
}>(), {
  label: 'Copy',
  variant: 'outline-secondary',
  size: 'sm',
})

const copied = ref(false)
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
