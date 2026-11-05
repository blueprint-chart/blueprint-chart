<script setup lang="ts">
import PalettesCardChips from './PalettesCardChips.vue'
import PalettesGhostButton from './PalettesGhostButton.vue'
import PalettesSwatchStrip from './PalettesSwatchStrip.vue'
import IPhCopy from '~icons/ph/copy'
import IPhPencilSimple from '~icons/ph/pencil-simple'
import IPhTrash from '~icons/ph/trash'

defineProps<{
  label: string
  colors: readonly string[]
  editable: boolean
}>()

defineEmits<{
  duplicate: []
  edit: []
  remove: []
}>()

const nameId = useId()
</script>

<template>
  <article
    class="palettes-card"
    :aria-labelledby="nameId"
  >
    <PalettesSwatchStrip :colors="colors" />
    <div class="palettes-card__header">
      <div class="palettes-card__header__text">
        <h3
          :id="nameId"
          class="palettes-card__header__text__name"
        >
          {{ label }}
        </h3>
        <span class="palettes-card__header__text__count">{{ colors.length }} colors</span>
      </div>
      <div class="palettes-card__header__actions">
        <PalettesGhostButton
          v-if="editable"
          label="Edit"
          :icon="IPhPencilSimple"
          @click="$emit('edit')"
        />
        <PalettesGhostButton
          label="Duplicate"
          :icon="IPhCopy"
          @click="$emit('duplicate')"
        />
        <PalettesGhostButton
          v-if="editable"
          label="Delete"
          :icon="IPhTrash"
          danger
          @click="$emit('remove')"
        />
      </div>
    </div>
    <PalettesCardChips
      class="palettes-card__chips"
      :colors="colors"
    />
  </article>
</template>

<style scoped lang="scss">
.palettes-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bc-tile-bg);
  border: 1px solid var(--bc-hairline);
  border-radius: var(--bc-radius-md);
  transition: border-color var(--bc-duration-base) var(--bc-ease);

  &:hover,
  &:focus-within {
    border-color: var(--bc-hairline-strong);
  }

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.75rem 0.75rem 0 1rem;

    &__text {
      display: flex;
      flex-direction: column;
      min-width: 0;
      padding-top: 0.125rem;

      &__name {
        margin: 0;
        overflow: hidden;
        font-size: var(--bs-font-size-sm);
        font-weight: 600;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--bs-body-color);
      }

      &__count {
        font-size: var(--bs-font-size-xs);
        color: var(--bs-secondary-color);
      }
    }

    &__actions {
      display: flex;
      flex-shrink: 0;
      gap: 0.125rem;
      opacity: 0;
      transition: opacity var(--bc-duration-base) var(--bc-ease);

      .palettes-card:hover &,
      .palettes-card:focus-within & {
        opacity: 1;
      }

      @media (hover: none) {
        opacity: 1;
      }
    }
  }

  &__chips {
    padding: 0.75rem 1rem 1rem;
  }
}
</style>
