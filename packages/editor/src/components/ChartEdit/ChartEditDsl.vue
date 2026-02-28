<template>
  <div class="d-flex flex-column h-100 p-3">
    <textarea
      class="form-control font-monospace flex-grow-1"
      :value="text"
      @input="onInput"
    />
    <div
      v-if="error"
      class="text-danger small mt-1"
    >
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useDslOutput } from '@/composables/useDslOutput'
import { useDslSync } from '@/composables/useDslSync'

const { dsl } = useDslOutput()
const { applyDsl } = useDslSync()

const text = ref('')
const error = ref<string>()
const userEditing = ref(false)

function syncDslToText() {
  if (!userEditing.value) {
    text.value = dsl.value
  }
}

watchEffect(syncDslToText)

// eslint-disable-next-line no-undef
function onInput(event: Event) {
  const value = (event.target as { value: string }).value
  text.value = value
  userEditing.value = true
  const result = applyDsl(value)
  if (result.success) {
    error.value = undefined
    userEditing.value = false
  }
  else {
    error.value = result.error
  }
}
</script>
