<script setup lang="ts">
import DisplayPalette from './DisplayPalette.vue'
</script>

<template>
  <Story title="Display/DisplayPalette">
    <Variant title="Few colors">
      <DisplayPalette :colors="['#e74c3c', '#3498db', '#2ecc71']" />
    </Variant>
    <Variant title="Many colors">
      <DisplayPalette
        :colors="['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51', '#606c38', '#283618', '#dda15e']"
      />
    </Variant>
    <Variant title="Single color">
      <DisplayPalette :colors="['#5B5FD6']" />
    </Variant>
  </Story>
</template>
