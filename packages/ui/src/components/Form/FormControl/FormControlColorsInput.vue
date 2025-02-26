<template>
  <BFormGroup
    class="form-control-colors-input"
    :label="label"
    :label-for="id"
  >
    <div class="d-flex flex-wrap gap-1">
      <span
        v-for="(color, idx) in model"
        :key="idx"
        class="form-control-colors-input__tag"
      >
        <button
          type="button"
          class="form-control-colors-input__swatch-btn"
          @click="openPicker(idx, $event)"
        >
          <DisplayColorSwatch :color="color" size="sm" />
        </button>
        <span class="form-control-colors-input__hex">{{ color }}</span>
        <button
          type="button"
          class="form-control-colors-input__remove"
          :aria-label="`Remove ${color}`"
          @click="removeColor(idx)"
        >
          &times;
        </button>
      </span>
      <button
        :id="id"
        ref="addBtnRef"
        type="button"
        class="form-control-colors-input__add-btn"
        @click="openAdder"
      >
        + Add
      </button>
    </div>
    <FormControlColorInputPopover
      v-model:open="pickerOpen"
      :model-value="editingColor"
      :target="editingTarget"
      manual
      @update:model-value="onPickerChange"
    />
  </BFormGroup>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import DisplayColorSwatch from '../../Display/DisplayColorSwatch/DisplayColorSwatch.vue'
import FormControlColorInputPopover from './FormControlColorInputPopover.vue'

const model = defineModel<string[]>({ required: true })

defineProps<{
  label: string
  id: string
}>()

const addBtnRef = useTemplateRef<HTMLElement>('addBtnRef')
const editingColor = ref('#4e79a7')
const editingIndex = ref(-1)
const editingTarget = ref<HTMLElement | null>(null)
const pickerOpen = ref(false)

function openPicker(idx: number, event: MouseEvent) {
  editingIndex.value = idx
  editingColor.value = model.value[idx]
  editingTarget.value = event.currentTarget as HTMLElement
  pickerOpen.value = true
}

function openAdder() {
  editingIndex.value = -1
  editingColor.value = '#4e79a7'
  editingTarget.value = addBtnRef.value ?? null
  pickerOpen.value = true
}

function removeColor(idx: number) {
  const updated = [...model.value]
  updated.splice(idx, 1)
  model.value = updated
}

function onPickerChange(color: string) {
  editingColor.value = color
  if (editingIndex.value >= 0 && editingIndex.value < model.value.length) {
    const updated = [...model.value]
    updated[editingIndex.value] = color
    model.value = updated
  } else {
    model.value = [...model.value, color]
    pickerOpen.value = false
  }
}
</script>

<style scoped lang="scss">
.form-control-colors-input__tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  height: 26px;
  padding: 0 0.25rem 0 0.35rem;
  border-radius: 50rem;
  border: 1px solid var(--bs-border-color);
  background: var(--bs-tertiary-bg);
  line-height: 1;
}

.form-control-colors-input__swatch-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  line-height: 1;
}

.form-control-colors-input__hex {
  font-family: var(--bs-font-monospace);
  font-size: 0.75rem;
  color: var(--bs-body-color);
}

.form-control-colors-input__remove {
  background: none;
  border: none;
  padding: 0;
  line-height: 1;
  font-size: 0.875rem;
  color: var(--bs-secondary-color);
  cursor: pointer;
  opacity: 0.6;

  &:hover {
    opacity: 1;
    color: var(--bs-danger);
  }
}

.form-control-colors-input__add-btn {
  background: none;
  border: 1px dashed var(--bs-border-color);
  border-radius: 50rem;
  height: 26px;
  padding: 0 0.6rem;
  font-size: 0.75rem;
  color: var(--bs-secondary-color);
  cursor: pointer;

  &:hover {
    border-color: var(--bs-primary);
    color: var(--bs-primary);
  }
}
</style>
