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
      :menu-class="menuClass ?? 'form-control-dropdown-menu'"
      :class="dropdownClassList"
      :text="selectedOption?.label ?? placeholder ?? ''"
      :disabled="disabled"
      teleport-to="body"
      variant="outline-secondary"
      :auto-close="autoClose"
      @show="matchMenuWidth"
      @shown="matchMenuWidth"
    >
      <template #button-content>
        <slot name="button-content">
          <span
            v-if="selectedOption?.icon"
            class="form-control-dropdown__toggle-content"
          >
            <component
              :is="selectedOption.icon"
              class="form-control-dropdown__toggle-icon"
            />
            {{ selectedOption.label }}
          </span>
          <template v-else>
            {{ selectedOption?.label ?? placeholder ?? '' }}
          </template>
        </slot>
      </template>
      <slot
        name="menu"
        :hide="() => dropdownRef?.hide()"
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
      </slot>
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
  disabled?: boolean
  placeholder?: string
  autoClose?: boolean | 'inside' | 'outside'
  menuClass?: string
  minMenuWidth?: number
}>(), {
  label: undefined,
  id: undefined,
  options: () => [],
  block: false,
  lightLabel: false,
  disabled: false,
  placeholder: undefined,
  autoClose: true,
  menuClass: undefined,
  minMenuWidth: 0,
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
  // Set the menu's width to match the toggle's width (or minMenuWidth if larger)
  if (menu) {
    menu.style.width = `${Math.max(elementBounding.width.value, props.minMenuWidth)}px`
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
.form-control-dropdown {
  &__toggle {
    &--block {
      width: 100%;

      :deep(.dropdown-toggle) {
        width: 100%;
        display: inline-flex;
        text-align: left;
        align-items: center;
        justify-content: space-between;

        --bs-btn-border-color: var(--bs-border-color);
        --bs-btn-color: var(--bs-body-color);
        --bs-btn-bg: var(--bs-secondary-bg);

        --bs-btn-hover-color: var(--bs-btn-color);
        --bs-btn-hover-bg: var(--bs-btn-bg);
        --bs-btn-hover-border-color: var(--bs-btn-border-color);

        --bs-btn-active-color: var(--bs-btn-color);
        --bs-btn-active-bg: var(--bs-btn-bg);
        --bs-btn-active-border-color: #4B90CF; // $prussian-300

        &.active, &:active, &.show {
          box-shadow: 0 0 0 0.25rem rgba(#2563a0, 0.25); // $prussian-500
        }
      }
    }

    &-content {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      margin-right: auto;
    }

    &-icon {
      width: 1.25em;
      height: 1.25em;
      flex-shrink: 0;
    }
  }

  &--light-label :deep(label) {
    font-weight: normal;
  }
}
</style>
