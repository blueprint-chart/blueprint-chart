<template>
  <div class="d-flex flex-column h-100">
    <div
      ref="editorEl"
      class="flex-grow-1 overflow-auto"
    />
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useDslEditor } from '@/composables/useDslEditor'

const editorEl = useTemplateRef<HTMLElement>('editorEl')
useDslEditor(editorEl)
</script>
