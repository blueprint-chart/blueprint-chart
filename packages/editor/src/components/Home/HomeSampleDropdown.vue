<template>
  <button
    class="btn btn-primary"
    @click="emit('blank')"
  >
    New Chart
  </button>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  blank: []
}>()
</script>
