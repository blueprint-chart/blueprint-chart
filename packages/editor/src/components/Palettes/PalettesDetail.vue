<script setup lang="ts">
import { ButtonIcon, FormControlColorsInput } from '@blueprint-chart/ui'
import PalettesCardChips from './PalettesCardChips.vue'
import PalettesSwatchStrip from './PalettesSwatchStrip.vue'
import IPhCopy from '~icons/ph/copy'
import IPhTrash from '~icons/ph/trash'

const palette = defineModel<{ label: string, colors: readonly string[] }>({ required: true })

defineProps<{
  editable: boolean
}>()

defineEmits<{
  duplicate: []
  remove: []
}>()

const id = useId()

const label = computed({
  get: () => palette.value.label,
  set: value => palette.value = { ...palette.value, label: value },
})

const colors = computed({
  get: () => [...palette.value.colors],
  set: value => palette.value = { ...palette.value, colors: value },
})
</script>

<template>
  <div class="palettes-detail">
    <div class="palettes-detail__body">
      <PalettesSwatchStrip
        class="palettes-detail__body__strip"
        :colors="colors"
      />
      <template v-if="editable">
        <BFormGroup
          class="palettes-detail__body__name"
          label="Name"
          :label-for="`${id}-label`"
        >
          <BFormInput
            :id="`${id}-label`"
            v-model="label"
          />
        </BFormGroup>
        <FormControlColorsInput
          :id="`${id}-colors`"
          v-model="colors"
          label="Colors"
        />
      </template>
      <p
        v-else
        class="palettes-detail__body__summary"
      >
        Built-in, {{ colors.length }} colors. Duplicate it to make your own version.
      </p>
      <PalettesCardChips :colors="colors" />
    </div>
    <div class="palettes-detail__actions">
      <ButtonIcon
        label="Duplicate"
        :icon-left="IPhCopy"
        variant="outline-secondary"
        size="sm"
        @click="$emit('duplicate')"
      />
      <ButtonIcon
        v-if="editable"
        label="Delete"
        :icon-left="IPhTrash"
        variant="outline-danger"
        size="sm"
        @click="$emit('remove')"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.palettes-detail {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  &__body {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;

    &__strip {
      height: 6rem;
      overflow: hidden;
      border: 1px solid var(--bc-hairline);
      border-radius: var(--bc-radius-md);
    }

    &__name {
      margin: 0;
    }

    &__summary {
      margin: 0;
      font-size: var(--bs-font-size-sm);
      color: var(--bs-secondary-color);
    }
  }

  &__actions {
    display: flex;
    gap: 0.5rem;
    padding-top: 1rem;
    border-top: 1px solid var(--bc-hairline);
  }
}
</style>
