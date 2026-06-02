<script setup lang="ts">
import type { Component } from 'vue'
import IPhFunction from '~icons/ph/function'
import IPhWrench from '~icons/ph/wrench'
import IPhPencilSimple from '~icons/ph/pencil-simple'
import IPhArrowsClockwise from '~icons/ph/arrows-clockwise'
import LandingDefaultCard from './LandingDefaultCard.vue'

const activeStep = shallowRef(0)

interface Card {
  icon: Component
  tag: string
  title: string
  description: string
}

const cards: Card[] = [
  {
    icon: IPhFunction,
    tag: 'SORT · FILTER · GROUP',
    title: 'Core operations',
    description: 'Multi-column sort, conditional filter, group-with-aggregate (sum / avg / min / max / count).',
  },
  {
    icon: IPhWrench,
    tag: '29 OPERATIONS',
    title: 'Parse & reshape',
    description: 'Type conversions, string transforms, date extraction, numeric normalisation.',
  },
  {
    icon: IPhPencilSimple,
    tag: 'RENAME · HIDE',
    title: 'Chart-ready labels',
    description: 'Clean column names for axis labels. Hide columns without deleting your data.',
  },
  {
    icon: IPhArrowsClockwise,
    tag: 'TRANSPOSE',
    title: 'Pivot',
    description: 'Swap rows and columns. First-column values become headers.',
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
    note: 'Sorted by CO₂ descending, highest emitter first. Ready for the chart.',
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

<template>
  <LandingSection
    id="transforms"
    surface="content"
  >
    <LandingSectionHeader label="04 / Data pipeline">
      Reshape your data<br><em>before you chart it.</em>
      <template #lead>
        Raw data rarely fits a chart out of the box. Blueprint's pipeline lets you sort, filter, group, parse and reshape, all without leaving the editor, all replayable from your BPC source.
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

    <div class="landing-transforms__cards">
      <LandingDefaultCard
        v-for="card in cards"
        :key="card.tag"
        :icon="card.icon"
        :tag="card.tag"
        :title="card.title"
        :description="card.description"
      />
    </div>
  </LandingSection>
</template>

<style scoped lang="scss">
.transforms-demo {
  background: var(--bc-tile-bg);
  border: 1px solid var(--bc-hairline);
  border-radius: var(--bc-radius-md);
  overflow: hidden;

  &__steps {
    display: flex;
    overflow-x: auto;
    border-bottom: 1px solid var(--bc-hairline);
  }

  &__step {
    flex: 1;
    min-width: 0;
    padding: 0.625rem 1rem;
    border: none;
    border-right: 1px solid var(--bc-hairline);
    background: var(--bc-content-bg);
    cursor: pointer;
    transition: background 0.15s;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:last-child {
      border-right: none;
    }

    &:hover {
      background: var(--bc-wash-soft);
    }

    &--active {
      background: var(--bc-wash-firm);
    }

    &__num {
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 50%;
      background: var(--bc-hairline);
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
      border: 1px solid var(--bc-hairline);
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
        background: var(--bc-content-bg);
        color: var(--bs-secondary-color);
        border-bottom: 1px solid var(--bc-hairline);
      }

      &__td {
        padding: 0.25rem 0.625rem;
        border-bottom: 1px solid var(--bc-hairline);
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
        stroke: var(--bc-hairline);
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
        background: var(--bc-hairline);
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

.landing-transforms {
  &__cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.875rem;
    margin-top: 1.75rem;
  }
}

@media (max-width: 51.25rem) {
  .transforms-demo {
    /* let the tabs keep their natural width and scroll the row, rather than
       cramming all four into equal slivers that clip their labels */
    &__step {
      flex: 0 0 auto;
    }

    &__body {
      grid-template-columns: 1fr;
      /* panels drop their vertical margins below, so the body supplies the
         top/bottom breathing room the panel margins gave on desktop */
      padding: 1.25rem;

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

  .landing-transforms {
    &__cards {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}

@media (max-width: 33.75rem) {
  .landing-transforms {
    &__cards {
      grid-template-columns: 1fr;
    }
  }
}
</style>
