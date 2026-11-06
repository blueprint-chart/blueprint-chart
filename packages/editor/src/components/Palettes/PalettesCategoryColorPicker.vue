<script setup lang="ts">
import { listPalettes } from '@blueprint-chart/lib'
import { ColorSwatchGroupsKey, FormControlColorInputPicker, type ColorSwatchGroup } from '@blueprint-chart/ui'
import { useCustomPalettes } from '@/stores/customPalettes'

const model = defineModel<string>({ required: true })

defineProps<{
  label: string
}>()

const { palettes } = useCustomPalettes()
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

function toSwatchGroup({ label, colors }: { label: string, colors: readonly string[] }): ColorSwatchGroup {
  return { label, swatches: colors.map(color => ({ name: label, color })) }
}

// Overrides the app-wide category colors: they are the values being edited here.
provide(ColorSwatchGroupsKey, computed(() => [...palettes.value, ...listPalettes()].map(toSwatchGroup)))
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
      class="palettes-category-color-picker__popover"
    >
      <div
        ref="panel"
        class="palettes-category-color-picker__panel"
      >
        <FormControlColorInputPicker
          v-model="model"
          @pick="open = false"
        />
      </div>
    </BPopover>
  </div>
</template>

<style scoped lang="scss">
:global(.popover.palettes-category-color-picker__popover) {
  --bs-popover-max-width: none;

  width: 21rem;
}

:global(.popover.palettes-category-color-picker__popover .b-floating-size) {
  max-height: min(var(--bv-floating-max-height, 22rem), 22rem);
}

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
}
</style>
