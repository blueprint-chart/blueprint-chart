<script setup lang="ts">
import FormControlColorblindPicker from './FormControlColorblindPicker.vue'
</script>

<template>
  <Story title="Form/FormControlColorblindPicker">
    <Variant
      title="Default"
      :init-state="() => ({ mode: '' })"
    >
      <template #default="{ state }">
        <FormControlColorblindPicker
          v-model="state.mode"
          label="Colorblind simulation"
        />
        <p class="mt-2">
          Selected: {{ state.mode || 'None' }}
        </p>
      </template>
    </Variant>
  </Story>
</template>
