<template>
  <div class="p-3 d-flex flex-column gap-4">
    <EditorChartTypePicker />
    <EditorPropertyForm />
    <EditorDataInput />
  </div>
</template>

<script setup lang="ts">
import EditorChartTypePicker from './EditorChartTypePicker.vue'
import EditorPropertyForm from './EditorPropertyForm.vue'
import EditorDataInput from './EditorDataInput.vue'
</script>
