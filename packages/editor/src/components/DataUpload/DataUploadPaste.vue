<template>
  <BFormGroup label="Or paste your data">
    <BFormTextarea
      :model-value="modelValue"
      rows="10"
      placeholder="Label,Value&#10;Apples,42&#10;Bananas,58"
      class="font-monospace"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </BFormGroup>
</template>

<script setup lang="ts">
defineProps<{ modelValue: string }>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>
