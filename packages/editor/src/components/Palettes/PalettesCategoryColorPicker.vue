<script setup lang="ts">
import { listPalettes } from '@blueprint-chart/lib'
import { isHexColor } from '@blueprint-chart/ui'
import { useCustomPalettes } from '@/stores/customPalettes'

const model = defineModel<string>({ required: true })

defineProps<{
  label: string
}>()

const { palettes } = useCustomPalettes()
const hexId = useId()
const open = shallowRef(false)
const trigger = useTemplateRef<HTMLElement>('trigger')
const panel = useTemplateRef<HTMLElement>('panel')

watch(open, (isOpen, _, onCleanup) => {
  if (!isOpen) {
    return
  }
  const stopClickOutside = onClickOutside(panel, () => {
    open.value = false
  }, { ignore: [trigger] })
  const stopEscape = onKeyStroke('Escape', () => {
    open.value = false
    trigger.value?.focus()
  })
  onCleanup(() => {
    stopClickOutside?.()
    stopEscape()
  })
})

const groups = computed(() => [
  ...palettes.value.map(({ id, label, colors }) => ({ key: id, label, colors })),
  ...listPalettes().map(({ name, label, colors }) => ({ key: name, label, colors })),
])

function onHexInput(event: Event) {
  const value = (event.target as HTMLInputElement).value.trim()
  if (isHexColor(value)) {
    model.value = value
  }
}

function onHexChange(event: Event) {
  onHexInput(event)
  ;(event.target as HTMLInputElement).value = model.value
}

function pick(color: string) {
  model.value = color
  open.value = false
}
</script>

<template>
  <div class="palettes-category-color-picker">
    <button
      ref="trigger"
      type="button"
      class="palettes-category-color-picker__trigger"
      :aria-label="`${label}: ${model}`"
      aria-haspopup="dialog"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span
        class="palettes-category-color-picker__trigger__swatch"
        :style="{ backgroundColor: model }"
      />
      <span class="palettes-category-color-picker__trigger__hex">{{ model }}</span>
    </button>
    <BPopover
      v-model="open"
      :target="trigger"
      manual
      lazy
      placement="bottom-start"
      teleport-to="body"
      custom-class="palettes-category-color-picker__popover"
    >
      <div
        ref="panel"
        class="palettes-category-color-picker__panel"
      >
        <div class="palettes-category-color-picker__panel__input">
          <input
            type="color"
            class="palettes-category-color-picker__panel__input__native form-control form-control-color"
            :value="model.toLowerCase()"
            :aria-label="label"
            @input="onHexInput"
          >
          <input
            :id="hexId"
            class="palettes-category-color-picker__panel__input__hex form-control form-control-sm"
            :value="model"
            aria-label="Hex"
            spellcheck="false"
            @input="onHexInput"
            @change="onHexChange"
          >
        </div>
        <div
          v-for="group in groups"
          :key="group.key"
          class="palettes-category-color-picker__panel__group"
        >
          <span class="palettes-category-color-picker__panel__group__title">{{ group.label }}</span>
          <button
            v-for="(color, index) in group.colors"
            :key="index"
            type="button"
            class="palettes-category-color-picker__panel__group__swatch"
            :style="{ backgroundColor: color }"
            :aria-label="`${group.label} ${color}`"
            @click="pick(color)"
          />
        </div>
      </div>
    </BPopover>
  </div>
</template>

<style scoped lang="scss">
.palettes-category-color-picker {
  &__trigger {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.5rem 0.25rem 0.25rem;
    font-family: var(--bs-font-monospace);
    font-size: var(--bs-font-size-sm);
    color: var(--bs-body-color);
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--bc-radius-xs);
    transition: border-color var(--bc-duration-base) var(--bc-ease),
                background var(--bc-duration-base) var(--bc-ease);

    &:hover,
    &[aria-expanded='true'] {
      background: var(--bc-wash-soft);
      border-color: var(--bc-hairline);
    }

    &:focus-visible {
      outline: none;
      box-shadow: var(--bc-focus-ring);
    }

    &__swatch {
      width: 1.25rem;
      height: 1.25rem;
      border: 1px solid var(--bc-hairline-strong);
      border-radius: var(--bc-radius-xs);
    }
  }

  &__panel {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 15rem;
    max-height: 20rem;
    overflow-y: auto;

    &__input {
      display: flex;
      gap: 0.5rem;

      &__native {
        flex-shrink: 0;
        width: 2rem;
        height: 2rem;
        padding: 0.125rem;
      }

      &__hex {
        font-family: var(--bs-font-monospace);
      }
    }

    &__group {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;

      &__title {
        flex-basis: 100%;
        font-size: var(--bs-font-size-xs);
        color: var(--bs-secondary-color);
      }

      &__swatch {
        width: 1.25rem;
        height: 1.25rem;
        padding: 0;
        border: 1px solid var(--bc-hairline);
        border-radius: var(--bc-radius-xs);

        &:hover {
          border-color: var(--bs-body-color);
        }

        &:focus-visible {
          outline: none;
          box-shadow: var(--bc-focus-ring);
        }
      }
    }
  }
}
</style>
