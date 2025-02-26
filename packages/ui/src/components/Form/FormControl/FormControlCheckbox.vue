<template>
  <BFormGroup class="form-control-checkbox">
    <BFormCheckbox
      :model-value="model"
      class="form-control-checkbox__input"
      @update:model-value="model = $event"
    >
      <slot>{{ label }}</slot>
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
}>()
</script>
