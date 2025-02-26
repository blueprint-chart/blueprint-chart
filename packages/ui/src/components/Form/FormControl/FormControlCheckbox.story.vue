<script setup lang="ts">
import FormControlCheckbox from './FormControlCheckbox.vue'
</script>

<template>
  <Story title="Form/FormControl/FormControlCheckbox">
    <Variant
      title="Default"
      :init-state="() => ({ checked: false, label: 'Enable option' })"
    >
      <template #default="{ state }">
        <FormControlCheckbox
          v-model="state.checked"
          :label="state.label"
        />
      </template>
      <template #controls="{ state }">
        <HstCheckbox
          v-model="state.checked"
          title="modelValue"
        />
        <HstText
          v-model="state.label"
          title="label"
        />
      </template>
    </Variant>

    <Variant
      title="With section"
      :init-state="() => ({ checked: false, label: 'Enable option' })"
    >
      <template #default="{ state }">
        <FormControlCheckbox
          v-model="state.checked"
          :label="state.label"
        >
          <template #section>
            <div class="d-flex flex-column gap-2 mt-2">
              Additional settings shown when checked
            </div>
          </template>
        </FormControlCheckbox>
      </template>
      <template #controls="{ state }">
        <HstCheckbox
          v-model="state.checked"
          title="modelValue"
        />
      </template>
    </Variant>
  </Story>
</template>
