<script setup lang="ts">
import { ButtonIcon } from '@blueprint-chart/ui'
import IPhPlus from '~icons/ph/plus'
import { samples } from '@blueprint-chart/lib'

const sample = samples.find(s => s.id === 'coffee-production')
if (!sample) {
  throw new Error('Missing coffee-production sample — see LandingHero.vue')
}
const heroBpc = sample.dsl.replace(/\{/, '{\n  theme = "blueprint-framed"')
</script>

<template>
  <section class="landing-hero">
    <div class="landing-hero__inner">
      <div class="landing-hero__inner__text">
        <div class="landing-hero__inner__text__eyebrow">
          <span
            class="landing-hero__inner__text__eyebrow__dot"
            aria-hidden="true"
          />
          Built in the newsroom
        </div>
        <h1 class="landing-hero__inner__text__h1">
          Great stories,<br><em>great data viz.</em>
        </h1>
        <p class="landing-hero__inner__text__sub">
          A modern data viz platform for editorial work. Author your chart in a compact DSL,
          sequence it across named scenes that play back like a narrative, and let opinionated
          defaults handle the craft.
        </p>
        <div class="landing-hero__inner__text__actions">
          <ButtonIcon
            to="/charts"
            label="My charts"
            variant="outline-secondary"
          />
          <ButtonIcon
            to="/new"
            label="New chart"
            variant="primary"
            :icon-left="IPhPlus"
          />
        </div>
      </div>
      <div class="landing-hero__inner__chart">
        <LandingChartPreview :bpc="heroBpc" />
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.landing-hero {
  padding: 3.5rem clamp(1rem, 5vw, 3.75rem) 4rem;

  &__inner {
    max-width: 70rem;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: center;

    &__text {
      &__eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.25rem 0.75rem 0.25rem 0.5rem;
        background: rgba(37, 99, 160, 0.12);
        border: 1px solid rgba(37, 99, 160, 0.25);
        border-radius: var(--bc-radius-pill);
        font-size: var(--bs-font-size-xs);
        font-weight: 600;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--bs-info);
        margin-bottom: 1.25rem;

        &__dot {
          width: 0.4375rem;
          height: 0.4375rem;
          border-radius: 50%;
          background: var(--bs-info);
          box-shadow: 0 0 0 4px rgba(122, 176, 226, 0.18);
        }
      }

      &__h1 {
        font-size: clamp(2.25rem, 4.5vw, 4rem);
        font-weight: 400;
        line-height: 1.05;
        letter-spacing: -0.015em;
        color: var(--bs-body-color);
        margin-bottom: 1.5rem;
        font-family: "DM Serif Display", Georgia, "Times New Roman", serif;

        :deep(em) {
          font-style: italic;
          color: var(--bs-info);
        }
      }

      &__sub {
        font-size: 1rem;
        color: var(--bs-secondary-color);
        line-height: 1.65;
        max-width: 28.75rem;
        margin-bottom: 2.25rem;
      }

      &__actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }
    }

    &__chart {
      background: var(--bc-tile-bg);
      border: 1px solid var(--bc-hairline);
      border-radius: var(--bc-radius-lg);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      align-self: center;
      overflow: hidden;
    }
  }
}

@media (max-width: 51.25rem) {
  .landing-hero {
    padding: 2.5rem 1rem 3rem;

    &__inner {
      grid-template-columns: 1fr;
      gap: 2.25rem;

      &__chart {
        // Reversed from previous: show the chart on mobile, stacked below text.
        display: block;
        max-height: 60vh;
        overflow: hidden;
      }
    }
  }
}
</style>
