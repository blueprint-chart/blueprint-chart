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

const MIN_COLORS = 2
const MAX_COLORS = 12

const label = shallowRef(palette.value.label)
const labelValid = computed(() => label.value.trim().length > 0)

watch(label, (value) => {
  if (labelValid.value) {
    palette.value = { ...palette.value, label: value }
  }
})

const colors = computed({
  get: () => [...palette.value.colors],
  set: value => palette.value = { ...palette.value, colors: value },
})

const atColorLimit = computed(() => colors.value.length <= MIN_COLORS || colors.value.length >= MAX_COLORS)
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
          :state="labelValid ? null : false"
          invalid-feedback="Name can't be empty."
        >
          <BFormInput
            :id="`${id}-label`"
            v-model="label"
            :state="labelValid ? null : false"
          />
        </BFormGroup>
        <div class="palettes-detail__body__colors">
          <FormControlColorsInput
            :id="`${id}-colors`"
            v-model="colors"
            label="Colors"
            :min="MIN_COLORS"
            :max="MAX_COLORS"
          />
          <p
            v-if="atColorLimit"
            class="palettes-detail__body__colors__limit"
          >
            A palette needs 2 to 12 colors.
          </p>
        </div>
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
        variant="primary"
        size="sm"
        @click="$emit('duplicate')"
      />
      <ButtonIcon
        v-if="editable"
        label="Delete"
        :icon-left="IPhTrash"
        variant="danger"
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

    &__colors {
      &__limit {
        margin: 0.25rem 0 0;
        font-size: var(--bs-font-size-sm);
        color: var(--bs-secondary-color);
      }
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
