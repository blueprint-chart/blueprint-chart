<template>
  <BFormGroup
    class="form-control-slider-input"
    :label="label"
    :label-for="id"
  >
    <div class="form-control-slider-input__row">
      <BFormInput
        :id="id"
        type="range"
        :model-value="model"
        :min="min"
        :max="max"
        :step="step"
        class="form-control-slider-input__range"
        @update:model-value="model = $event"
      />
      <BFormInput
        :model-value="model"
        class="form-control-slider-input__number"
        size="sm"
        @update:model-value="model = $event"
      />
      <slot name="suffix">
        <small
          v-if="suffix"
          class="form-control-slider-input__suffix"
        >{{ suffix }}</small>
      </slot>
    </div>
  </BFormGroup>
</template>

<script setup lang="ts">
const model = defineModel<string>({ required: true })

withDefaults(defineProps<{
  label: string
  id: string
  min?: string
  max?: string
  step?: string
  suffix?: string
}>(), {
  min: '0',
  max: '100',
  step: '1',
  suffix: undefined,
})
</script>

<style scoped lang="scss">
.form-control-slider-input__row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-control-slider-input__range {
  flex-grow: 1;
}

.form-control-slider-input__number {
  width: 4em;
}

.form-control-slider-input__suffix {
  white-space: nowrap;
}
</style>
