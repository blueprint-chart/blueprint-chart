<template>
  <LandingSection id="transforms">
    <LandingSectionHeader label="Data pipeline">
      Transform your data<br><em>before you chart it.</em>
      <template #lead>
        Raw data rarely fits a chart out of the box. Blueprint Chart's built-in pipeline
        lets you sort, filter, group and reshape — all without leaving the editor.
      </template>
    </LandingSectionHeader>

    <div class="transforms-demo">
      <div class="transforms-demo__steps">
        <button
          v-for="(step, i) in steps"
          :key="i"
          class="transforms-demo__step"
          :class="{ 'transforms-demo__step--active': activeStep === i }"
          @click="activeStep = i"
        >
          <span class="transforms-demo__step__num">{{ i + 1 }}</span>
          <span class="transforms-demo__step__label">{{ step.label }}</span>
        </button>
      </div>
      <div class="transforms-demo__body">
        <div class="transforms-demo__body__panel">
          <div class="transforms-demo__body__panel__title">
            {{ steps[activeStep].inputTitle }}
          </div>
          <table class="transforms-demo__body__panel__table">
            <thead>
              <tr>
                <th
                  v-for="col in steps[activeStep].input[0]"
                  :key="col"
                  class="transforms-demo__body__panel__th"
                >
                  {{ col }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, ri) in steps[activeStep].input.slice(1)"
                :key="ri"
              >
                <td
                  v-for="(cell, ci) in row"
                  :key="ci"
                  class="transforms-demo__body__panel__td"
                  :class="{ 'transforms-demo__body__panel__td--highlight': steps[activeStep].highlightCol === steps[activeStep].input[0][ci] }"
                >
                  {{ cell }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="transforms-demo__body__flow">
          <svg
            viewBox="0 0 80 10"
            preserveAspectRatio="none"
            class="transforms-demo__body__flow__svg"
          >
            <path
              d="M0,5 C30,5 50,5 80,5"
              class="transforms-demo__body__flow__wire"
              vector-effect="non-scaling-stroke"
            />
          </svg>
          <div class="transforms-demo__body__flow__dot transforms-demo__body__flow__dot--left" />
          <div class="transforms-demo__body__flow__dot transforms-demo__body__flow__dot--right" />
        </div>
        <div class="transforms-demo__body__panel">
          <div class="transforms-demo__body__panel__title">
            {{ steps[activeStep].outputTitle }}
          </div>
          <table class="transforms-demo__body__panel__table">
            <thead>
              <tr>
                <th
                  v-for="col in steps[activeStep].output[0]"
                  :key="col"
                  class="transforms-demo__body__panel__th"
                >
                  {{ col }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, ri) in steps[activeStep].output.slice(1)"
                :key="ri"
              >
                <td
                  v-for="(cell, ci) in row"
                  :key="ci"
                  class="transforms-demo__body__panel__td"
                  :class="{ 'transforms-demo__body__panel__td--highlight': steps[activeStep].outputHighlightCol === steps[activeStep].output[0][ci] }"
                >
                  {{ cell }}
                </td>
              </tr>
            </tbody>
          </table>
          <p class="transforms-demo__body__panel__note">
            {{ steps[activeStep].note }}
          </p>
        </div>
      </div>
    </div>

    <div class="transforms__cards">
      <div
        v-for="card in cards"
        :key="card.title"
        class="transforms-card"
      >
        <span
          class="transforms-card__icon"
          :class="card.colorClass"
        >
          <AppIcon
            :name="card.icon"
            size="sm"
          />
        </span>
        <div>
          <strong class="transforms-card__title">{{ card.title }}</strong>
          <p class="transforms-card__desc">
            {{ card.description }}
          </p>
        </div>
      </div>
    </div>
  </LandingSection>
</template>

<script setup lang="ts">
import { shallowRef, type Component } from 'vue'
import { AppIcon } from '@blueprint-chart/ui'
import IPhSortAscending from '~icons/ph/sort-ascending'
import IPhFunnel from '~icons/ph/funnel'
import IPhStack from '~icons/ph/stack'
import IPhWrench from '~icons/ph/wrench'
import IPhPencilSimple from '~icons/ph/pencil-simple'
import IPhEyeSlash from '~icons/ph/eye-slash'
import IPhArrowsClockwise from '~icons/ph/arrows-clockwise'
import LandingSection from './LandingSection.vue'
import LandingSectionHeader from './LandingSectionHeader.vue'

const activeStep = shallowRef(0)

const cards: { icon: Component, title: string, description: string, colorClass: string }[] = [
  {
    icon: IPhSortAscending,
    title: 'Sort',
    description: 'Multi-column sort with direction control. Ascending, descending, or by aggregation.',
    colorClass: 'transforms-card__icon--sort',
  },
  {
    icon: IPhFunnel,
    title: 'Filter',
    description: 'Keep or remove rows by condition — equals, not-equals, contains, greater-than, less-than.',
    colorClass: 'transforms-card__icon--filter',
  },
  {
    icon: IPhStack,
    title: 'Group & aggregate',
    description: 'Group rows by any column, then aggregate with SUM, AVG, MIN, MAX or COUNT.',
    colorClass: 'transforms-card__icon--group',
  },
  {
    icon: IPhWrench,
    title: 'Parse',
    description: '29 operations — type conversions, string transforms, date extraction, numeric normalization.',
    colorClass: 'transforms-card__icon--parse',
  },
  {
    icon: IPhPencilSimple,
    title: 'Rename',
    description: 'Clean up column names for readable axis labels and chart titles.',
    colorClass: 'transforms-card__icon--rename',
  },
  {
    icon: IPhEyeSlash,
    title: 'Hide columns',
    description: 'Remove columns from the chart without deleting them from your data.',
    colorClass: 'transforms-card__icon--hide',
  },
  {
    icon: IPhArrowsClockwise,
    title: 'Transpose',
    description: 'Swap rows and columns. First column values become headers.',
    colorClass: 'transforms-card__icon--transpose',
  },
]

interface Step {
  label: string
  inputTitle: string
  outputTitle: string
  input: string[][]
  output: string[][]
  highlightCol?: string
  outputHighlightCol?: string
  note: string
}

const steps: Step[] = [
  {
    label: 'Raw CSV',
    inputTitle: 'Uploaded data',
    outputTitle: 'Detected types',
    input: [
      ['country', 'year', 'co2'],
      ['France', '2019', '4.6'],
      ['France', '2020', '4.1'],
      ['Germany', '2019', '8.5'],
      ['Germany', '2020', '7.7'],
      ['USA', '2019', '15.2'],
      ['USA', '2020', '13.9'],
    ],
    output: [
      ['column', 'type', 'values'],
      ['country', 'string', '3 unique'],
      ['year', 'number', '2019 – 2020'],
      ['co2', 'number', '4.1 – 15.2'],
    ],
    note: 'Blueprint auto-detects column types from your CSV, paste or sample data.',
  },
  {
    label: 'Group by',
    inputTitle: 'Input rows',
    outputTitle: 'After grouping',
    input: [
      ['country', 'year', 'co2'],
      ['France', '2019', '4.6'],
      ['France', '2020', '4.1'],
      ['Germany', '2019', '8.5'],
      ['Germany', '2020', '7.7'],
      ['USA', '2019', '15.2'],
      ['USA', '2020', '13.9'],
    ],
    output: [
      ['country', 'co2 (avg)'],
      ['France', '4.35'],
      ['Germany', '8.10'],
      ['USA', '14.55'],
    ],
    highlightCol: 'country',
    outputHighlightCol: 'co2 (avg)',
    note: 'Rows with the same country are grouped. CO₂ values aggregated with AVG.',
  },
  {
    label: 'Sort',
    inputTitle: 'Grouped data',
    outputTitle: 'Sorted descending',
    input: [
      ['country', 'co2 (avg)'],
      ['France', '4.35'],
      ['Germany', '8.10'],
      ['USA', '14.55'],
    ],
    output: [
      ['country', 'co2 (avg)'],
      ['USA', '14.55'],
      ['Germany', '8.10'],
      ['France', '4.35'],
    ],
    outputHighlightCol: 'co2 (avg)',
    note: 'Sorted by CO₂ descending — highest emitter first. Ready for the chart.',
  },
  {
    label: 'Rename',
    inputTitle: 'Before rename',
    outputTitle: 'Chart-ready',
    input: [
      ['country', 'co2 (avg)'],
      ['USA', '14.55'],
      ['Germany', '8.10'],
      ['France', '4.35'],
    ],
    output: [
      ['Country', 'Avg CO₂ (tonnes)'],
      ['USA', '14.55'],
      ['Germany', '8.10'],
      ['France', '4.35'],
    ],
    outputHighlightCol: 'Avg CO₂ (tonnes)',
    note: 'Clean column names for readable axis labels. Data flows straight to the chart.',
  },
]
</script>

<style scoped lang="scss">
.transforms-demo {
  background: var(--bc-tile-bg);
  border: var(--bc-tile-border);
  border-radius: var(--bc-tile-radius);
  box-shadow: var(--bc-tile-shadow);
  overflow: hidden;

  &__steps {
    display: flex;
    overflow-x: auto;
    border-bottom: 1px solid var(--bs-border-color);
  }

  &__step {
    flex: 1;
    min-width: 0;
    padding: 0.625rem 1rem;
    border: none;
    border-right: 1px solid var(--bs-border-color);
    background: var(--bc-void-bg);
    cursor: pointer;
    transition: background 0.15s;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:last-child {
      border-right: none;
    }

    &:hover {
      background: var(--bs-tertiary-bg);
    }

    &--active {
      background: var(--bs-primary-bg-subtle);
    }

    &__num {
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 50%;
      background: var(--bs-border-color);
      color: var(--bs-secondary-color);
      font-size: var(--bs-font-size-xs);
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.15s;

      .transforms-demo__step--active & {
        background: var(--bs-primary);
        color: #fff;
      }
    }

    &__label {
      font-size: var(--bs-font-size-sm);
      font-weight: 600;
      color: var(--bs-secondary-color);
      white-space: nowrap;

      .transforms-demo__step--active & {
        color: var(--bs-primary);
      }
    }
  }

  &__body {
    display: grid;
    grid-template-columns: 1fr 4rem 1fr;
    align-items: center;
    padding: 0 1.25rem;

    &__panel {
      padding: 1rem 1.25rem;
      border: 1px solid var(--bs-border-color);
      border-radius: 0.5rem;
      margin: 1rem 0;

      &__title {
        font-size: var(--bs-font-size-xs);
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.07em;
        color: var(--bs-tertiary-color);
        margin-bottom: 0.75rem;
      }

      &__table {
        width: 100%;
        border-collapse: collapse;
        font-size: var(--bs-font-size-sm);
      }

      &__th {
        padding: 0.25rem 0.625rem;
        text-align: left;
        font-weight: 600;
        font-size: var(--bs-font-size-xs);
        background: var(--bc-void-bg);
        color: var(--bs-secondary-color);
        border-bottom: 1px solid var(--bs-border-color);
      }

      &__td {
        padding: 0.25rem 0.625rem;
        border-bottom: 1px solid var(--bs-border-color);
        color: var(--bs-secondary-color);

        tr:last-child > & {
          border-bottom: none;
        }

        &--highlight {
          color: var(--bs-primary);
          font-weight: 600;
        }
      }

      &__note {
        font-size: var(--bs-font-size-xs);
        color: var(--bs-tertiary-color);
        line-height: 1.6;
        margin-top: 0.75rem;
        margin-bottom: 0;
      }
    }

    &__flow {
      position: relative;
      display: flex;
      align-items: center;

      &__svg {
        width: 100%;
        height: 2px;
      }

      &__wire {
        fill: none;
        stroke: var(--bs-border-color);
        stroke-width: 1.5;
        stroke-dasharray: 5 4;
        stroke-linecap: round;
        animation: wire-flow 1s linear infinite;
      }

      &__dot {
        position: absolute;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--bs-border-color);
        top: 50%;
        transform: translateY(-50%);

        &--left { left: -4px; }
        &--right { right: -4px; }
      }
    }
  }
}

@keyframes wire-flow {
  to {
    stroke-dashoffset: -9;
  }
}

/* ─── Feature cards ─── */
.transforms__cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.875rem;
  margin-top: 1.75rem;
}

.transforms-card {
  display: flex;
  gap: 0.625rem;
  align-items: flex-start;
  padding: 0.875rem 1rem;
  background: var(--bc-tile-bg);
  border: var(--bc-tile-border);
  border-radius: calc(var(--bc-tile-radius) - 2px);

  &__icon {
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 1px;

    &--sort {
      background: var(--bs-warning-bg-subtle);
      color: var(--bs-warning-text-emphasis);
    }

    &--filter {
      background: var(--bs-danger-bg-subtle);
      color: var(--bs-danger-text-emphasis);
    }

    &--group {
      background: hsl(270 90% 95%);
      color: hsl(270 70% 50%);
    }

    &--parse {
      background: var(--bs-success-bg-subtle);
      color: var(--bs-success-text-emphasis);
    }

    &--rename {
      background: var(--bs-primary-bg-subtle);
      color: var(--bs-primary-text-emphasis);
    }

    &--hide {
      background: var(--bs-secondary-bg);
      color: var(--bs-secondary-text-emphasis);
    }

    &--transpose {
      background: var(--bs-info-bg-subtle);
      color: var(--bs-info-text-emphasis);
    }
  }

  &__title {
    font-size: var(--bs-font-size-sm);
    display: block;
  }

  &__desc {
    font-size: var(--bs-font-size-xs);
    color: var(--bs-secondary-color);
    margin-top: 0.125rem;
    line-height: 1.5;
  }
}

@media (max-width: 51.25rem) {
  .transforms-demo {
    &__body {
      grid-template-columns: 1fr;

      &__panel {
        margin: 0;
      }

      &__flow {
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 2rem;
        margin: -4px 0;
        position: relative;
        z-index: 1;
        overflow: hidden;

        &__svg {
          width: auto;
          height: auto;
          flex: 1;
          transform: rotate(90deg);
        }

        &__dot {
          position: static;
          transform: none;
          flex-shrink: 0;

          &--left { order: -1; }
          &--right { order: 1; }
        }
      }
    }
  }

  .transforms__cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 33.75rem) {
  .transforms__cards {
    grid-template-columns: 1fr;
  }
}
</style>
