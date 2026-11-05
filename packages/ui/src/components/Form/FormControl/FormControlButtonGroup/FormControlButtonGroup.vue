<template>
  <BFormGroup
    class="form-control-button-group"
    :label="label"
  >
    <FormControlDropdown
      v-if="overflowed"
      v-model="model"
      :options="dropdownOptions"
      block
      light-label
      class="form-control-button-group__dropdown"
    />
    <div
      ref="containerRef"
      class="form-control-button-group__container"
      :class="containerClassList"
    >
      <BButtonGroup
        class="form-control-button-group__container__buttons"
        :class="buttonsClassList"
      >
        <ButtonIcon
          v-for="opt in resolvedOptions"
          :key="opt.value"
          :icon-left="opt.icon ?? opt.iconLeft"
          :label="opt.text"
          :hide-label="!opt.icon && !!opt.iconLeft"
          :hide-tooltip="!opt.description"
          :tooltip-label="opt.description"
          :show-tooltip-force="!!opt.description"
          variant="primary"
          :class="optionClassList(opt.value)"
          :aria-pressed="model === opt.value"
          :tabindex="overflowed ? -1 : undefined"
          @click="model = opt.value"
        >
          <template
            v-if="opt.visual"
            #start
          >
            <div class="form-control-button-group__container__buttons__visual bg-body rounded-1">
              <component
                :is="opt.visual"
                v-if="typeof opt.visual !== 'string'"
                class="form-control-button-group__container__buttons__visual__content"
              />
              <img
                v-else
                :src="opt.visual"
                alt=""
                class="form-control-button-group__container__buttons__visual__content"
              >
            </div>
          </template>
        </ButtonIcon>
      </BButtonGroup>
    </div>
    <slot />
    <slot :name="`section:${model}`" />
  </BFormGroup>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

const model = defineModel<string>({ required: true })

const props = withDefaults(defineProps<{
  label: string
  options?: { value: string, text: string, iconLeft?: Component, description?: string, visual?: string | Component, icon?: Component }[]
  block?: boolean
}>(), {
  options: () => [],
  block: false,
})

const { entries } = useChildEntriesProvider(ButtonGroupEntriesKey)
const resolvedOptions = computed(() =>
  entries.value.length > 0 ? entries.value : props.options,
)

const containerRef = useTemplateRef<HTMLElement>('containerRef')
const overflowed = shallowRef(false)

const containerClassList = computed(() => ({
  'form-control-button-group__container--block': props.block,
  'form-control-button-group__container--collapsed': overflowed.value,
}))

const buttonsClassList = computed(() => ({
  'form-control-button-group__container__buttons--block': props.block,
}))

function optionClassList(value: string) {
  return { 'form-control-button-group__container__buttons__option--active': model.value === value }
}

const dropdownOptions = computed(() =>
  resolvedOptions.value.map(o => ({
    value: o.value,
    label: o.text,
    description: o.description,
    icon: o.icon,
    visual: o.visual,
  })),
)

function checkOverflow() {
  const container = containerRef.value
  if (!container) {
    return
  }
  const buttons = container.querySelectorAll('.btn')
  const anyTruncated = Array.from(buttons).some(b => b.scrollWidth > b.clientWidth + 1)
  overflowed.value = anyTruncated || container.scrollWidth > container.clientWidth + 1
}

useResizeObserver(containerRef, checkOverflow)
</script>

<style scoped lang="scss">
.form-control-button-group {
  &__container {
    overflow: hidden;

    &--block {
      width: 100%;
    }

    &--collapsed {
      height: 0;
    }

    &__buttons {
      gap: 2px;
      padding: 2px;
      background: var(--bs-secondary-bg);
      border: 1px solid var(--bs-border-color);
      border-radius: var(--bc-radius-sm);

      &:deep(.btn) {
        --bs-btn-bg: transparent;
        --bs-btn-border-color: transparent;
        --bs-btn-color: var(--bs-secondary-color);
        --bs-btn-hover-bg: transparent;
        --bs-btn-hover-border-color: transparent;
        --bs-btn-hover-color: var(--bs-body-color);
        --bs-btn-active-bg: var(--bs-tertiary-bg);
        --bs-btn-active-border-color: transparent;
        --bs-btn-active-color: var(--bs-emphasis-color);
      }

      // Tripled class outranks Bootstrap's .btn-group corner-squaring rules
      &:deep(.btn.btn.btn) {
        margin-left: 0;
        border-radius: var(--bc-radius-xs);
      }

      &:deep(.form-control-button-group__container__buttons__option--active) {
        --bs-btn-bg: var(--bs-tertiary-bg);
        --bs-btn-color: var(--bs-emphasis-color);
        --bs-btn-hover-bg: var(--bs-tertiary-bg);
        --bs-btn-hover-color: var(--bs-emphasis-color);

        font-weight: 500;
      }

      &--block {
        width: 100%;

        :deep(.btn) {
          flex: 1;
          justify-content: center;
        }
      }

      &:deep(.btn) {
        justify-content: center;
        white-space: nowrap;

        &:has(.form-control-button-group__container__buttons__visual) {
          flex-direction: column;
          gap: 0.25rem;
          padding-block: 0.35rem;
        }
      }

      &__visual {
        width: 40px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        &__content {
          max-height: 100%;
          max-width: 100%;
          object-fit: contain;
        }
      }
    }
  }
}
</style>
