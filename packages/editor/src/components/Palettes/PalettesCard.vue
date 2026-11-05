<script setup lang="ts">
import PalettesCardChips from './PalettesCardChips.vue'
import PalettesGhostButton from './PalettesGhostButton.vue'
import PalettesSwatchStrip from './PalettesSwatchStrip.vue'
import IPhCopy from '~icons/ph/copy'
import IPhTrash from '~icons/ph/trash'

const props = defineProps<{
  label: string
  colors: readonly string[]
  editable: boolean
  selected: boolean
}>()

defineEmits<{
  duplicate: []
  select: []
  remove: []
}>()

const nameId = useId()

const cardClass = computed(() => ({
  'palettes-card--selected': props.selected,
}))
</script>

<template>
  <article
    class="palettes-card"
    :class="cardClass"
    :aria-labelledby="nameId"
  >
    <PalettesSwatchStrip :colors="colors" />
    <div class="palettes-card__header">
      <div class="palettes-card__header__text">
        <h3
          :id="nameId"
          class="palettes-card__header__text__name"
        >
          <button
            type="button"
            class="palettes-card__header__text__name__button"
            :aria-pressed="selected"
            @click="$emit('select')"
          >
            {{ label }}
          </button>
        </h3>
        <span class="palettes-card__header__text__count">{{ colors.length }} colors</span>
      </div>
      <div class="palettes-card__header__actions">
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
  position: relative;
  border-radius: var(--bc-radius-md);
  cursor: pointer;
  transition: border-color var(--bc-duration-base) var(--bc-ease);

  @media (hover: hover) {
    &:hover {
      border-color: var(--bc-hairline-strong);
    }
  }

  &:has(.palettes-card__header__text__name__button:focus-visible) {
    box-shadow: var(--bc-focus-ring);
  }

  &--selected {
    border-color: var(--bs-emphasis-color);
    box-shadow: var(--bc-selected-ring);
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

        &__button {
          max-width: 100%;
          padding: 0;
          overflow: hidden;
          font: inherit;
          color: inherit;
          text-align: left;
          text-overflow: ellipsis;
          background: none;
          border: 0;
          outline: none;

          &::after {
            position: absolute;
            inset: 0;
            content: "";
          }
        }
      }

      &__count {
        font-size: var(--bs-font-size-xs);
        color: var(--bs-secondary-color);
      }
    }

    &__actions {
      position: relative;
      z-index: 1;
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
