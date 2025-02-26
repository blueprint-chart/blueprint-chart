<template>
  <BFormGroup
    class="form-control-color-input"
    :label="label"
    :label-for="id"
  >
    <div class="form-control-color-input__wrapper">
      <button
        ref="swatchRef"
        type="button"
        class="form-control-color-input__swatch"
        :style="{ backgroundColor: model }"
      />
      <input
        :id="id"
        class="form-control form-control-color-input__field"
        :value="model"
        @input="onInput"
        @change="onChange"
      >
    </div>
    <FormControlColorInputPopover
      v-model="model"
      :target="swatchRef"
    />
  </BFormGroup>
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue'
import FormControlColorInputPopover from './FormControlColorInputPopover.vue'

const model = defineModel<string>({ required: true })

defineProps<{
  label: string
  id: string
}>()

const swatchRef = useTemplateRef<HTMLElement>('swatchRef')

function onInput(e: Event) {
  const value = (e.target as HTMLInputElement).value.trim()
  if (/^#[0-9a-fA-F]{6}$/.test(value)) {
    model.value = value
  }
}

function onChange(e: Event) {
  const value = (e.target as HTMLInputElement).value.trim()
  if (/^#[0-9a-fA-F]{6}$/.test(value)) {
    model.value = value
  } else {
    (e.target as HTMLInputElement).value = model.value
  }
}
</script>

<style scoped lang="scss">
.form-control-color-input__wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-control-color-input__swatch {
  position: absolute;
  left: 6px;
  width: 22px;
  height: 22px;
  border-radius: 3px;
  border: 1px solid var(--bs-border-color-translucent);
  cursor: pointer;
  padding: 0;
  z-index: 1;
}

.form-control-color-input__field {
  padding-left: 36px;
  font-family: var(--bs-font-monospace);
  font-size: 0.875rem;
}
</style>
