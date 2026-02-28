<template>
  <BFormGroup
    ref="elementRef"
    class="form-control-dropdown"
    :class="classList"
    :label="label"
    :label-for="id"
  >
    <slot />
    <BDropdown
      ref="dropdownRef"
      class="form-control-dropdown__toggle"
      menu-class="form-control-dropdown-menu"
      :class="dropdownClassList"
      :text="selectedOption?.label ?? ''"
      teleport-to="body"
      variant="outline-secondary"
      @show="matchMenuWidth"
      @shown="matchMenuWidth"
    >
      <template
        v-if="selectedOption?.icon"
        #button-content
      >
        <span class="form-control-dropdown__toggle-content">
          <component
            :is="selectedOption.icon"
            class="form-control-dropdown__toggle-icon"
          />
          {{ selectedOption.label }}
        </span>
      </template>
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
import { type Component, computed, useTemplateRef, watch } from 'vue'
import { useElementBounding } from '@vueuse/core'
import FormControlDropdownItem from './FormControlDropdownItem.vue'
import { useChildEntriesProvider } from '../../../composables/useChildEntries'
import { DropdownEntriesKey } from '../../../composables/injection-keys'

export interface FormControlDropdownOption {
  value: string
  label: string
  description?: string
  visual?: string | Component
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

const elementRef = useTemplateRef<HTMLElement>('elementRef')
const elementBounding = useElementBounding(elementRef)
const dropdownRef = useTemplateRef<{ hide: () => void, $el: HTMLElement }>('dropdownRef')

function matchMenuWidth() {
  const { id = null } = dropdownRef.value?.$el?.querySelector('.dropdown-toggle') as HTMLElement | null ?? {}
  // The toggle's id is required to retrieve the corresponding menu element,
  // which is rendered by Bootstrap's dropdown component with a generated id.
  if (!id) {
    return
  }
  // Find the menu element by its id using a "-menu" suffix (added by Bootstrap's dropdown component)
  const menu = document.getElementById(`${id}-menu`)
  // Set the menu's width to match the toggle's width
  if (menu) {
    menu.style.width = `${elementBounding.width.value}px`
  }
}

watch(elementBounding.width, matchMenuWidth)

const classList = computed(() => ({
  'form-control-dropdown--light-label': props.lightLabel,
}))

const dropdownClassList = computed(() => ({
  'form-control-dropdown__toggle--block': props.block,
}))

const selectedOption = computed(() =>
  resolvedOptions.value.find(o => o.value === model.value),
)

function selectOption(value: string) {
  model.value = value
  dropdownRef.value?.hide()
}
</script>

<style lang="scss">
/* Global (unscoped) — needed because the menu is teleported to body */
.form-control-dropdown-menu {
  max-height: min(60vh, 800px);
  overflow-y: auto;
  z-index: 1060 !important;
}
</style>

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

.form-control-dropdown__toggle-content {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin-right: auto;
}

.form-control-dropdown__toggle-icon {
  width: 1.25em;
  height: 1.25em;
  flex-shrink: 0;
}
</style>
