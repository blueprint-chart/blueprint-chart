<script setup lang="ts">
import AddButton from './ButtonAdd.vue'
</script>

<template>
  <Story title="Button/ButtonAdd">
    <Variant
      title="Default"
      :init-state="() => ({ label: 'Add' })"
    >
      <template #default="{ state }">
        <AddButton :label="state.label" />
      </template>
      <template #controls="{ state }">
        <HstText
          v-model="state.label"
          title="label"
        />
      </template>
    </Variant>
  </Story>
</template>
