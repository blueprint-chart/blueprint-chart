<script setup lang="ts">
import { ButtonIcon, FormControlColorInput } from '@blueprint-chart/ui'
import { normalizeCategory, useCategoryColors } from '@/stores/categoryColors'
import PalettesCategoryColorPicker from './PalettesCategoryColorPicker.vue'
import IPhPlus from '~icons/ph/plus'
import IPhTrash from '~icons/ph/trash'

const { categoryColors, add, update, remove } = useCategoryColors()

const name = shallowRef('')
const color = shallowRef('#dd5129')
const error = shallowRef('')

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
</script>

<template>
  <div class="palettes-category-table">
    <p
      v-if="!categoryColors.length"
      class="palettes-category-table__empty text-body-secondary"
    >
      Give a name a fixed color. Charts with that name can apply it from the Colors section.
    </p>
    <ul class="palettes-category-table__list list-unstyled">
      <li
        v-for="category in categoryColors"
        :key="category.name"
        class="palettes-category-table__row"
      >
        <span class="palettes-category-table__row__name">{{ category.name }}</span>
        <FormControlColorInput
          :id="`category-color-${category.name}`"
          :model-value="category.color"
          :label="`Color for ${category.name}`"
          class="palettes-category-table__row__color"
          @update:model-value="update(category.name, $event)"
        />
        <ButtonIcon
          class="palettes-category-table__row__delete"
          :label="`Delete ${category.name}`"
          :icon-left="IPhTrash"
          variant="outline-danger"
          size="sm"
          @click="remove(category.name)"
        />
      </li>
    </ul>
    <div class="palettes-category-table__form">
      <BFormInput
        v-model="name"
        class="palettes-category-table__form__name"
        placeholder="Category name"
        aria-label="Category name"
        @keydown.enter="submit"
      />
      <PalettesCategoryColorPicker
        v-model="color"
        class="palettes-category-table__form__color"
      />
      <ButtonIcon
        class="palettes-category-table__form__add"
        label="Add"
        :icon-left="IPhPlus"
        variant="outline-primary"
        @click="submit"
      />
      <p
        v-if="error"
        class="palettes-category-table__form__error text-danger small"
        role="alert"
      >
        {{ error }}
      </p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.palettes-category-table {
  &__row {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--bs-border-color);

    &__name {
      flex: 1;
    }
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 28rem;
    margin-top: 1rem;
  }
}
</style>
