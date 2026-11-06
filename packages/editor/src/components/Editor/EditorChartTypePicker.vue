<script setup lang="ts">
import { useChartConfig } from '@/stores/chartConfig'
import { useChartRecommendations } from '@/composables/useChartRecommendations'
import { CHART_TYPE_GROUPS, type ChartTypeChoice } from './editorChartTypeGroups'
import IPhCheck from '~icons/ph/check-bold'

const { chartType } = useChartConfig()
const { recommendations } = useChartRecommendations()

const bestMatchTypes = computed(() => {
  return recommendations.value.filter(rec => rec.fitness === 'best').map(rec => rec.chartType)
})

function isBestMatch(choice: ChartTypeChoice) {
  return bestMatchTypes.value.includes(choice.value)
}

function isSelected(choice: ChartTypeChoice) {
  return chartType.value === choice.value
}

function cardClassList(choice: ChartTypeChoice) {
  return {
    'editor-chart-type-picker__group__list__card--best': isBestMatch(choice),
  }
}
</script>

<template>
  <div class="editor-chart-type-picker">
    <fieldset
      v-for="group in CHART_TYPE_GROUPS"
      :key="group.title"
      class="editor-chart-type-picker__group"
    >
      <legend class="editor-chart-type-picker__group__title">
        {{ group.title }}
      </legend>
      <div class="editor-chart-type-picker__group__list">
        <label
          v-for="choice in group.choices"
          :key="choice.value"
          class="editor-chart-type-picker__group__list__card"
          :class="cardClassList(choice)"
        >
          <input
            v-model="chartType"
            type="radio"
            name="chart-type"
            :value="choice.value"
            class="editor-chart-type-picker__group__list__card__input visually-hidden"
          >
          <span
            class="editor-chart-type-picker__group__list__card__preview"
            aria-hidden="true"
          >
            <span
              v-if="isBestMatch(choice)"
              class="editor-chart-type-picker__group__list__card__preview__badge"
            >Best match</span>
            <span
              v-if="isSelected(choice)"
              class="editor-chart-type-picker__group__list__card__preview__check"
            >
              <IPhCheck />
            </span>
            <span class="editor-chart-type-picker__group__list__card__preview__thumb">
              <component :is="choice.visual" />
            </span>
          </span>
          <span class="editor-chart-type-picker__group__list__card__label">
            {{ choice.label }}
            <span
              v-if="isBestMatch(choice)"
              class="visually-hidden"
            >(best match)</span>
          </span>
        </label>
      </div>
    </fieldset>
  </div>
</template>

<style scoped lang="scss">
.editor-chart-type-picker {
  &__group {
    & + & {
      margin-top: 1rem;
    }

    &__title {
      font-size: var(--bs-font-size-xs);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--bs-secondary-color);
      margin-bottom: 0.5rem;
    }

    &__list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(6.5rem, 1fr));
      gap: 0.5rem;

      &__card {
        position: relative;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border: 1px solid var(--bs-border-color-translucent);
        border-radius: 0.5rem;
        background: var(--bs-body-bg);
        cursor: pointer;
        transition: border-color var(--bc-duration-base) ease;

        &:hover {
          border-color: var(--bs-secondary-color);
        }

        &:has(:checked) {
          border-color: var(--bs-emphasis-color);
        }

        &:has(:focus-visible) {
          outline: 2px solid var(--bs-focus-ring-color);
          outline-offset: 2px;
        }

        &:not(:hover, :has(:checked)) &__preview__thumb {
          filter: grayscale(1);
          opacity: 0.55;
        }

        &__preview {
          position: relative;
          display: block;
          height: 4.75rem;
          padding: 1.5rem 0.875rem 0.5rem;
          background: var(--bs-tertiary-bg);
          border-bottom: 1px solid var(--bs-border-color-translucent);
          transition: background-color var(--bc-duration-base) ease;

          .editor-chart-type-picker__group__list__card:hover & {
            background: var(--bs-secondary-bg);
          }

          &__badge {
            position: absolute;
            top: 0.375rem;
            left: 0.375rem;
            font-size: 0.625rem;
            font-weight: 600;
            line-height: 1rem;
            padding: 0 0.375rem;
            border-radius: var(--bs-border-radius-pill);
            background: var(--bs-emphasis-color);
            color: var(--bs-body-bg);
          }

          &__check {
            position: absolute;
            top: 0.375rem;
            right: 0.375rem;
            display: grid;
            place-items: center;
            width: 1rem;
            height: 1rem;
            font-size: 0.625rem;
            border-radius: 50%;
            background: var(--bs-emphasis-color);
            color: var(--bs-body-bg);
          }

          &__thumb {
            display: block;
            width: 100%;
            height: 100%;
            transition: filter var(--bc-duration-base) ease, opacity var(--bc-duration-base) ease;

            :deep(svg) {
              width: 100%;
              height: 100%;
            }
          }
        }

        &__label {
          font-size: 0.8125rem;
          font-weight: 500;
          line-height: 1.2;
          padding: 0.4375rem 0.625rem;
        }
      }
    }
  }
}
</style>
