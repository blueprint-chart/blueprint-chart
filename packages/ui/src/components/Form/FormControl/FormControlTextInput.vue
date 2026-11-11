<template>
  <BFormGroup
    class="form-control-text-input"
    :label="label"
    :label-for="id"
    :state="state"
    :invalid-feedback="error"
  >
    <div class="form-control-text-input__row">
      <BFormInput
        :id="id"
        :model-value="model"
        :placeholder="placeholder"
        :state="state"
        class="form-control-text-input__row__input"
        @update:model-value="model = String($event)"
      />
      <small
        v-if="suffix"
        class="form-control-text-input__row__suffix"
      >{{ suffix }}</small>
    </div>
  </BFormGroup>
</template>

<script setup lang="ts">
const model = defineModel<string>({ required: true })

const props = withDefaults(defineProps<{
  label: string
  id: string
  placeholder?: string
  suffix?: string
  error?: string
}>(), {
  placeholder: undefined,
  suffix: undefined,
  error: undefined,
})

const state = computed(() => props.error ? false : null)
</script>

<style scoped lang="scss">
.form-control-text-input {
  &__row {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &__suffix {
      white-space: nowrap;
      color: var(--bs-secondary-color);
      font-size: var(--bs-font-size-sm);
    }
  }
}
</style>
