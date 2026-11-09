<template>
  <BFormGroup class="form-control-checkbox">
    <BFormCheckbox
      :model-value="model"
      class="form-control-checkbox__input"
      switch
      @update:model-value="model = $event as boolean"
    >
      <slot>{{ label }}</slot>
      <small
        v-if="description"
        class="form-control-checkbox__input__description"
      >{{ description }}</small>
    </BFormCheckbox>
    <slot
      v-if="model"
      name="section"
    />
  </BFormGroup>
</template>

<script setup lang="ts">
const model = defineModel<boolean>({ required: true })

defineProps<{
  label?: string
  description?: string
}>()
</script>

<style lang="scss" scoped>
.form-control-checkbox {
  &__input {
    &__description {
      display: block;
      margin-top: 0.125rem;
      color: var(--bs-secondary-color);
      font-size: 0.875em;
      line-height: 1.4;
    }
  }
}
</style>
