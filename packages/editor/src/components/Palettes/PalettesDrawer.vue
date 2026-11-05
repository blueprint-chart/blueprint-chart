<script setup lang="ts">
import { ButtonIcon, FormControlColorsInput } from '@blueprint-chart/ui'
import PalettesCardChips from './PalettesCardChips.vue'
import PalettesGhostButton from './PalettesGhostButton.vue'
import PalettesSwatchStrip from './PalettesSwatchStrip.vue'
import IPhTrash from '~icons/ph/trash'

const open = defineModel<boolean>('open', { required: true })
const palette = defineModel<{ label: string, colors: string[] }>({ required: true })

defineEmits<{
  remove: []
}>()

const id = useId()
const nameInput = useTemplateRef<{ focus: () => void }>('nameInput')

const label = computed({
  get: () => palette.value.label,
  set: value => palette.value = { ...palette.value, label: value },
})

const colors = computed({
  get: () => palette.value.colors,
  set: value => palette.value = { ...palette.value, colors: value },
})
</script>

<template>
  <BOffcanvas
    v-model="open"
    class="palettes-drawer"
    placement="end"
    teleport-to="#app"
    title="Edit palette"
    @shown="nameInput?.focus()"
  >
    <div class="palettes-drawer__body">
      <PalettesSwatchStrip
        class="palettes-drawer__body__strip"
        :colors="colors"
      />
      <BFormGroup
        class="palettes-drawer__body__name"
        label="Name"
        :label-for="`${id}-label`"
      >
        <BFormInput
          :id="`${id}-label`"
          ref="nameInput"
          v-model="label"
        />
      </BFormGroup>
      <FormControlColorsInput
        :id="`${id}-colors`"
        v-model="colors"
        label="Colors"
      />
      <PalettesCardChips :colors="colors" />
    </div>
    <template #footer>
      <div class="palettes-drawer__footer">
        <PalettesGhostButton
          label="Delete"
          :icon="IPhTrash"
          danger
          @click="$emit('remove')"
        />
        <ButtonIcon
          class="palettes-drawer__footer__done"
          label="Done"
          variant="primary"
          size="sm"
          @click="open = false"
        />
      </div>
    </template>
  </BOffcanvas>
</template>

<style lang="scss">
.palettes-drawer.offcanvas {
  --bs-offcanvas-width: 25rem;

  // Above the shared .offcanvas-backdrop, like the sidebar offcanvas.
  z-index: 1055;

  background: var(--bc-tile-bg);
  border-left: 1px solid var(--bc-hairline);

  .offcanvas-header {
    border-bottom: 1px solid var(--bc-hairline);
  }

  .offcanvas-title {
    font-size: var(--bs-font-size-md);
    font-weight: 600;
  }

  @media (max-width: 575.98px) {
    --bs-offcanvas-width: 100vw;

    border-left: 0;
  }
}

.palettes-drawer__body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  &__strip.palettes-swatch-strip {
    height: 6rem;
    overflow: hidden;
    border: 1px solid var(--bc-hairline);
    border-radius: var(--bc-radius-md);
  }

  &__name {
    margin: 0;
  }
}

.palettes-drawer__footer {
  display: flex;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--bc-hairline);
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
</style>
