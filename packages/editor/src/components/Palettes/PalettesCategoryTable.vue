<script setup lang="ts">
import { ButtonIcon } from '@blueprint-chart/ui'
import { normalizeCategory, useCategoryColors } from '@/stores/categoryColors'
import PalettesCategoryColorPicker from './PalettesCategoryColorPicker.vue'
import PalettesGhostButton from './PalettesGhostButton.vue'
import IPhPlus from '~icons/ph/plus'
import IPhTag from '~icons/ph/tag'
import IPhTrash from '~icons/ph/trash'

const { categoryColors, add, update, remove } = useCategoryColors()

const name = shallowRef('')
const color = shallowRef('#dd5129')
const error = shallowRef('')
const nameInput = useTemplateRef<{ focus: () => void }>('nameInput')

const hasDuplicate = computed(() => categoryColors.value.some(c => normalizeCategory(c.name) === normalizeCategory(name.value)))

function submit() {
  if (add(name.value, color.value)) {
    name.value = ''
    error.value = ''
  }
  else {
    error.value = hasDuplicate.value ? 'This name already has a color.' : 'Enter a name and a valid color.'
  }
}

function focusName() {
  nameInput.value?.focus()
}

defineExpose({ focusName })
</script>

<template>
  <div class="palettes-category-table">
    <div
      v-if="categoryColors.length"
      class="palettes-category-table__head"
      aria-hidden="true"
    >
      <span class="palettes-category-table__head__name">Name</span>
      <span class="palettes-category-table__head__color">Color</span>
    </div>
    <div
      v-for="category in categoryColors"
      :key="category.name"
      class="palettes-category-table__row"
    >
      <span class="palettes-category-table__row__name">{{ category.name }}</span>
      <PalettesCategoryColorPicker
        class="palettes-category-table__row__color"
        :model-value="category.color"
        :label="`Color for ${category.name}`"
        @update:model-value="update(category.name, $event)"
      />
      <PalettesGhostButton
        class="palettes-category-table__row__delete"
        :label="`Delete ${category.name}`"
        :icon="IPhTrash"
        danger
        @click="remove(category.name)"
      />
    </div>
    <div
      v-if="!categoryColors.length"
      class="palettes-category-table__empty"
    >
      <IPhTag class="palettes-category-table__empty__icon" />
      <p class="palettes-category-table__empty__text">
        Give a name a fixed color. Charts with that name can apply it from the Colors section.
      </p>
    </div>
    <div class="palettes-category-table__form">
      <BFormInput
        ref="nameInput"
        v-model="name"
        class="palettes-category-table__form__name"
        size="sm"
        placeholder="Category name"
        aria-label="Category name"
        @keydown.enter="submit"
      />
      <PalettesCategoryColorPicker
        v-model="color"
        class="palettes-category-table__form__color"
        label="Color"
      />
      <ButtonIcon
        class="palettes-category-table__form__add"
        label="Add"
        :icon-left="IPhPlus"
        variant="outline-secondary"
        size="sm"
        @click="submit"
      />
      <p
        v-if="error"
        class="palettes-category-table__form__error"
        role="alert"
      >
        {{ error }}
      </p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.palettes-category-table {
  --palettes-category-table-columns: minmax(0, 1fr) 10rem 2.5rem;

  max-width: 48rem;
  overflow: hidden;
  background: var(--bc-tile-bg);
  border: 1px solid var(--bc-hairline);
  border-radius: var(--bc-radius-md);

  &__head,
  &__row {
    display: grid;
    grid-template-columns: var(--palettes-category-table-columns);
    align-items: center;
    gap: 1rem;
    padding: 0 0.75rem 0 1rem;
    border-bottom: 1px solid var(--bc-hairline);
  }

  &__head {
    min-height: 2.25rem;
    font-size: var(--bs-font-size-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--bs-secondary-color);
    background: var(--bc-wash-soft);
  }

  &__row {
    min-height: 3rem;
    transition: background var(--bc-duration-base) var(--bc-ease);

    &:hover {
      background: var(--bc-wash-soft);
    }

    &__name {
      overflow: hidden;
      font-size: var(--bs-font-size-sm);
      font-weight: 500;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__color {
      margin-left: -0.25rem;
    }

    &__delete {
      justify-self: end;
    }
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 2.5rem 1rem;
    text-align: center;
    border-bottom: 1px solid var(--bc-hairline);

    &__icon {
      width: 2rem;
      height: 2rem;
      color: var(--bs-secondary-color);
      opacity: 0.5;
    }

    &__text {
      max-width: 24rem;
      margin: 0;
      font-size: var(--bs-font-size-sm);
      color: var(--bs-secondary-color);
    }
  }

  &__form {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 10rem auto;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 0.75rem 0.75rem 1rem;
    background: var(--bc-wash-soft);

    &__color {
      margin-left: -0.25rem;
    }

    &__error {
      grid-column: 1 / -1;
      margin: 0;
      font-size: var(--bs-font-size-sm);
      color: var(--bs-danger-text-emphasis);
    }

    @media (max-width: 575.98px) {
      grid-template-columns: minmax(0, 1fr) auto;

      &__name {
        grid-column: 1 / -1;
      }
    }
  }

  @media (max-width: 575.98px) {
    --palettes-category-table-columns: minmax(0, 1fr) auto 2rem;
  }
}
</style>
