<template>
  <th class="p-0">
    <BFormInput
      :model-value="name"
      size="sm"
      class="border-0 rounded-0 fw-semibold"
      @update:model-value="$emit('rename', $event as string)"
    />
  </th>
</template>

<script setup lang="ts">
defineProps<{ name: string }>()
defineEmits<{ rename: [value: string] }>()
</script>
