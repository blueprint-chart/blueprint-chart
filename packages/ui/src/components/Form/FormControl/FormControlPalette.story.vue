<script setup lang="ts">
import FormControlPalette from './FormControlPalette.vue'
import FormControlPaletteEntry from './FormControlPaletteEntry.vue'
</script>

<template>
  <Story title="Form/FormControl/FormControlPalette">
    <Variant
      title="Default"
      :init-state="() => ({ value: 'default' })"
    >
      <template #default="{ state }">
        <FormControlPalette
          id="story-palette"
          v-model="state.value"
          label="Color palette"
        >
          <FormControlPaletteEntry value="default" label="Default" :colors="['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f']" />
          <FormControlPaletteEntry value="warm" label="Warm" :colors="['#e74c3c', '#e67e22', '#f1c40f', '#d35400', '#c0392b']" />
          <FormControlPaletteEntry value="cool" label="Cool" :colors="['#3498db', '#2ecc71', '#1abc9c', '#2980b9', '#27ae60']" />
        </FormControlPalette>
      </template>
      <template #controls="{ state }">
        <HstText
          v-model="state.value"
          title="modelValue"
        />
      </template>
    </Variant>
  </Story>
</template>
