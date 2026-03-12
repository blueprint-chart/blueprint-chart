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
        @update:model-value="model = String($event)"
      />
      <BFormInput
        :model-value="model"
        class="form-control-slider-input__number"
        size="sm"
        @update:model-value="model = String($event)"
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
.form-control-slider-input {
  &__row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__range {
    flex-grow: 1;

    &::-webkit-slider-runnable-track {
      background: var(--bs-border-color);
    }

    &::-moz-range-track {
      background: var(--bs-border-color);
    }
  }

  &__number {
    width: 4em;
  }

  &__suffix {
    white-space: nowrap;
  }
}
</style>
