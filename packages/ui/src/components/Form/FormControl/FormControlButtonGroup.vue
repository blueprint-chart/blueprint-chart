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
        size="sm"
        class="form-control-button-group__buttons"
        :class="buttonsClassList"
      >
        <ButtonIcon
          v-for="opt in resolvedOptions"
          :key="opt.value"
          :icon-left="opt.iconLeft"
          :label="opt.text"
          :hide-label="!!opt.iconLeft"
          hide-tooltip
          :variant="model === opt.value ? 'primary' : 'outline-secondary'"
          :tabindex="overflowed ? -1 : undefined"
          @click="model = opt.value"
        />
      </BButtonGroup>
    </div>
    <slot />
    <slot :name="`section:${model}`" />
  </BFormGroup>
</template>

<script setup lang="ts">
import { type Component, computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import ButtonIcon from '../../Button/ButtonIcon/ButtonIcon.vue'
import FormControlDropdown from './FormControlDropdown.vue'
import { useChildEntriesProvider } from '../../../composables/useChildEntries'
import { ButtonGroupEntriesKey } from '../../../composables/injection-keys'

const model = defineModel<string>({ required: true })

const props = withDefaults(defineProps<{
  label: string
  options?: { value: string, text: string, iconLeft?: Component }[]
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
const overflowed = ref(false)

const containerClassList = computed(() => ({
  'form-control-button-group__container--block': props.block,
  'form-control-button-group__container--collapsed': overflowed.value,
}))

const buttonsClassList = computed(() => ({
  'form-control-button-group__buttons--block': props.block,
}))

const dropdownOptions = computed(() =>
  resolvedOptions.value.map(o => ({ value: o.value, label: o.text })),
)

let observer: ResizeObserver | null = null

function checkOverflow() {
  const container = containerRef.value
  if (!container) return
  const buttons = container.querySelectorAll('.btn')
  const anyTruncated = Array.from(buttons).some(b => b.scrollWidth > b.clientWidth + 1)
  overflowed.value = anyTruncated || container.scrollWidth > container.clientWidth + 1
}

onMounted(() => {
  if (!containerRef.value) return
  observer = new ResizeObserver(checkOverflow)
  observer.observe(containerRef.value)
  checkOverflow()
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
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
  }

  &__buttons {
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
    }
  }
}
</style>
