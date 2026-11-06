<script setup lang="ts">
import { ChartType } from '@blueprint-chart/lib'
import { useChartConfig } from '@/stores/chartConfig'
import { useChartRecommendations } from '@/composables/useChartRecommendations'
import { CHART_TYPE_GROUPS, type ChartTypeChoice } from './editorChartTypeGroups'
import IPhCheck from '~icons/ph/check'

const ALIASES: Record<string, string> = {
  [ChartType.VerticalBar]: ChartType.BarVertical,
  [ChartType.HorizontalBar]: ChartType.BarHorizontal,
}

const { chartType } = useChartConfig()
const { recommendations } = useChartRecommendations()

const currentType = computed(() => ALIASES[chartType.value] ?? chartType.value)

const bestMatchTypes = computed(() => {
  return recommendations.value.filter(rec => rec.fitness === 'best').map(rec => rec.chartType)
})

function isBestMatch(choice: ChartTypeChoice) {
  return bestMatchTypes.value.includes(choice.value)
}

function isSelected(choice: ChartTypeChoice) {
  return currentType.value === choice.value
}

function pick(choice: ChartTypeChoice) {
  if (!isSelected(choice)) {
    chartType.value = choice.value
  }
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
        <button
          v-for="choice in group.choices"
          :key="choice.value"
          type="button"
          :value="choice.value"
          :aria-pressed="isSelected(choice)"
          class="editor-chart-type-picker__group__list__card"
          :class="cardClassList(choice)"
          @click="pick(choice)"
        >
          <span
            class="editor-chart-type-picker__group__list__card__preview"
            aria-hidden="true"
          >
            <span
              v-if="isBestMatch(choice)"
              class="editor-chart-type-picker__group__list__card__preview__badge"
            >Best match</span>
            <span class="editor-chart-type-picker__group__list__card__preview__check">
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
        </button>
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
        padding: 0;
        text-align: start;
        color: inherit;
        border: 1px solid var(--bs-border-color-translucent);
        border-radius: 0.5rem;
        background: var(--bs-body-bg);
        cursor: pointer;
        transition: border-color var(--bc-duration-base) ease;

        &:hover {
          border-color: var(--bs-secondary-color);
        }

        &[aria-pressed="true"] {
          border-color: var(--bs-emphasis-color);
        }

        &:focus-visible {
          outline: 2px solid var(--bs-focus-ring-color);
          outline-offset: 2px;
        }

        &:not(:hover, [aria-pressed="true"]) &__preview__thumb {
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
            font-size: 0.75rem;
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
            display: none;
            place-items: center;
            width: 1rem;
            height: 1rem;
            font-size: 0.75rem;
            border-radius: 50%;
            background: var(--bs-emphasis-color);
            color: var(--bs-body-bg);
          }

          .editor-chart-type-picker__group__list__card[aria-pressed="true"] &__check {
            display: grid;
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
