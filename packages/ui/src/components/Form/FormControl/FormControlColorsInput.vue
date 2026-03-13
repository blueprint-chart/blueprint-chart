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
          class="form-control-colors-input__tag__swatch-btn"
          @click="openPicker(idx, $event)"
        >
          <DisplayColorSwatch
            :color="color"
            size="sm"
          />
        </button>
        <span class="form-control-colors-input__tag__hex">{{ color }}</span>
        <button
          type="button"
          class="form-control-colors-input__tag__remove"
          :aria-label="`Remove ${color}`"
          @click="removeColor(idx)"
        >
          &times;
        </button>
      </span>
      <ButtonAdd
        :id="id"
        ref="addBtnRef"
        size="sm"
        @click="openAdder"
      />
    </div>
    <FormControlColorInputPopover
      v-model="pickerColor"
      v-model:open="pickerOpen"
      :target="editingTarget"
      manual
    />
  </BFormGroup>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef, useTemplateRef } from 'vue'
import ButtonAdd from '../../Button/ButtonAdd/ButtonAdd.vue'
import DisplayColorSwatch from '../../Display/DisplayColorSwatch/DisplayColorSwatch.vue'
import FormControlColorInputPopover from './FormControlColorInputPopover.vue'

const model = defineModel<string[]>({ required: true })

defineProps<{
  label: string
  id: string
}>()

const addBtnRef = useTemplateRef<InstanceType<typeof ButtonAdd>>('addBtnRef')
const editingColor = shallowRef('#4e79a7')
const editingIndex = shallowRef(-1)
const editingTarget = ref<HTMLElement | null>(null)
const pickerOpen = shallowRef(false)

function openPicker(idx: number, event: MouseEvent) {
  editingIndex.value = idx
  editingColor.value = model.value[idx]
  editingTarget.value = event.currentTarget as HTMLElement
  pickerOpen.value = true
}

function openAdder() {
  editingIndex.value = -1
  editingColor.value = '#4e79a7'
  editingTarget.value = (addBtnRef.value as unknown as { $el: HTMLElement })?.$el ?? null
  pickerOpen.value = true
}

function removeColor(idx: number) {
  const updated = [...model.value]
  updated.splice(idx, 1)
  model.value = updated
}

const pickerColor = computed({
  get: () => editingColor.value,
  set: (color: string) => {
    editingColor.value = color
    if (editingIndex.value >= 0 && editingIndex.value < model.value.length) {
      const updated = [...model.value]
      updated[editingIndex.value] = color
      model.value = updated
    }
    else {
      model.value = [...model.value, color]
      pickerOpen.value = false
    }
  },
})
</script>

<style scoped lang="scss">
.form-control-colors-input {
  &__tag {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    height: 26px;
    padding: 0 0.25rem 0 0.35rem;
    border-radius: 50rem;
    border: 1px solid var(--bs-border-color);
    background: var(--bs-tertiary-bg);
    line-height: 1;

    &__swatch-btn {
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      line-height: 1;
    }

    &__hex {
      font-family: var(--bs-font-monospace);
      font-size: 0.75rem;
      color: var(--bs-body-color);
    }

    &__remove {
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
  }
}
</style>
