<template>
  <BFormGroup
    class="form-control-dropdown"
    :class="classList"
    :label="label"
    :label-for="id"
  >
    <slot />
    <BDropdown
      ref="dropdownRef"
      class="form-control-dropdown__toggle"
      :class="dropdownClassList"
      :menu-class="menuClassList"
      :text="selectedOption?.label ?? ''"
      variant="outline-secondary"
    >
      <FormControlDropdownItem
        v-for="option in resolvedOptions"
        :key="option.value"
        :label="option.label"
        :description="option.description"
        :visual="option.visual"
        :icon="option.icon"
        :active="option.value === model"
        :light-label="lightLabel"
        @select="selectOption(option.value)"
      />
    </BDropdown>
  </BFormGroup>
</template>

<script setup lang="ts">
import { type Component, computed, useTemplateRef } from 'vue'
import FormControlDropdownItem from './FormControlDropdownItem.vue'
import { useChildEntriesProvider } from '../../../composables/useChildEntries'
import { DropdownEntriesKey } from '../../../composables/injection-keys'

export interface FormControlDropdownOption {
  value: string
  label: string
  description?: string
  visual?: string
  icon?: Component
}

const model = defineModel<string>({ required: true })

const props = withDefaults(defineProps<{
  label?: string
  id?: string
  options?: FormControlDropdownOption[]
  block?: boolean
  lightLabel?: boolean
}>(), {
  options: () => [],
  block: false,
  lightLabel: false,
})

const { entries } = useChildEntriesProvider(DropdownEntriesKey)
const resolvedOptions = computed(() =>
  entries.value.length > 0 ? entries.value : props.options,
)

const dropdownRef = useTemplateRef<{ hide: () => void }>('dropdownRef')

const classList = computed(() => ({
  'form-control-dropdown--light-label': props.lightLabel,
}))

const dropdownClassList = computed(() => ({
  'form-control-dropdown__toggle--block': props.block,
}))

const menuClassList = computed(() => ({
  'w-100': props.block,
}))

const selectedOption = computed(() =>
  resolvedOptions.value.find(o => o.value === model.value),
)

function selectOption(value: string) {
  model.value = value
  dropdownRef.value?.hide()
}
</script>

<style scoped lang="scss">
.form-control-dropdown__toggle--block {
  width: 100%;

  :deep(.dropdown-toggle) {
    width: 100%;
    display: inline-flex;
    text-align: left;
    align-items: center;
    justify-content: space-between;
  }
}

.form-control-dropdown--light-label :deep(label) {
  font-weight: normal;
}
</style>
