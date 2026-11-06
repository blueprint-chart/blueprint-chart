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
          class="form-control-colors-input__tag__edit"
          :aria-label="`Edit ${color}`"
          @click="openPicker(idx, $event)"
        >
          <DisplayColorSwatch
            :color="color"
            size="sm"
          />
          <span class="form-control-colors-input__tag__edit__hex">{{ color }}</span>
        </button>
        <button
          type="button"
          class="form-control-colors-input__tag__remove"
          :aria-label="`Remove ${color}`"
          :disabled="atMin"
          @click="removeColor(idx)"
        >
          &times;
        </button>
      </span>
      <ButtonAdd
        :id="id"
        ref="addBtnRef"
        size="sm"
        :disabled="atMax"
        @click="openAdder"
      />
    </div>
    <FormControlColorInputPopover
      v-model:open="pickerOpen"
      :model-value="editingColor"
      :target="editingTarget"
      :ignore="editingTrigger"
      :placement="editingPlacement"
      manual
      @update:model-value="onPickerColorChange"
    />
  </BFormGroup>
</template>

<script setup lang="ts">
import ButtonAdd from '../../Button/ButtonAdd/ButtonAdd.vue'

const model = defineModel<string[]>({ required: true })

const props = defineProps<{
  label: string
  id: string
  min?: number
  max?: number
}>()

const atMin = computed(() => props.min !== undefined && model.value.length <= props.min)
const atMax = computed(() => props.max !== undefined && model.value.length >= props.max)

const addBtnRef = useTemplateRef<InstanceType<typeof ButtonAdd>>('addBtnRef')
const editingColor = shallowRef('#4e79a7')
const editingIndex = shallowRef(-1)
const editingTrigger = ref<HTMLElement | null>(null)
const editingTarget = ref<HTMLElement | null>(null)
const pickerOpen = shallowRef(false)

const editingPlacement = computed(() => editingIndex.value >= 0 ? 'bottom-start' : 'bottom')

watch(() => model.value[editingIndex.value], (color) => {
  if (editingIndex.value >= 0 && color !== editingColor.value) {
    pickerOpen.value = false
  }
})

function openPicker(idx: number, event: MouseEvent) {
  editingIndex.value = idx
  editingColor.value = model.value[idx]
  editingTrigger.value = event.currentTarget as HTMLElement
  editingTarget.value = editingTrigger.value.closest<HTMLElement>('.form-control-colors-input__tag')
  pickerOpen.value = true
}

function openAdder() {
  editingIndex.value = -1
  editingColor.value = '#4e79a7'
  editingTrigger.value = (addBtnRef.value as unknown as { $el: HTMLElement })?.$el ?? null
  editingTarget.value = editingTrigger.value
  pickerOpen.value = true
}

function removeColor(idx: number) {
  const updated = [...model.value]
  updated.splice(idx, 1)
  model.value = updated
}

function onPickerColorChange(color: string) {
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
}
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

    &__edit {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      line-height: 1;

      &__hex {
        font-family: var(--bs-font-monospace);
        font-size: var(--bs-font-size-sm);
        color: var(--bs-body-color);
      }

      &:hover &__hex {
        text-decoration: underline;
      }
    }

    &__remove {
      background: none;
      border: none;
      padding: 0;
      line-height: 1;
      font-size: var(--bs-font-size-md);
      color: var(--bs-secondary-color);
      cursor: pointer;
      opacity: 0.6;

      &:hover:not(:disabled) {
        opacity: 1;
        color: var(--bs-danger);
      }

      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
    }
  }
}
</style>
