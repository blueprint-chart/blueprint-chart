<template>
  <section class="landing-hero">
    <div class="landing-hero__inner">
      <div class="landing-hero__inner__text">
        <div class="landing-hero__inner__text__eyebrow">
          Data visualization for the editorial web
        </div>
        <h1 class="landing-hero__inner__text__h1">
          Turn data into<br><em>compelling stories.</em>
        </h1>
        <p class="landing-hero__inner__text__sub">
          Blueprint Chart is a free, open-source tool for journalists, researchers and analysts.
          Build beautiful, accessible charts with best practices built in — no design degree required.
        </p>
        <div class="landing-hero__inner__text__actions">
          <ButtonIcon
            to="/charts"
            label="My Charts"
            variant="outline-primary"
          />
          <ButtonIcon
            to="/new"
            label="New chart"
            variant="primary"
            :icon-left="IPhPlus"
          />
        </div>
        <div class="landing-hero__inner__text__meta">
          <LandingBadge
            v-for="badge in badges"
            :key="badge"
            :label="badge"
          />
        </div>
      </div>
      <div class="landing-hero__inner__chart">
        <LandingChartPreview :bpc="heroBpc" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ButtonIcon } from '@blueprint-chart/ui'
import IPhPlus from '~icons/ph/plus'
import { samples } from '@blueprint-chart/lib'
import LandingBadge from './LandingBadge.vue'
import LandingChartPreview from './LandingChartPreview.vue'

const badges = ['Free forever', 'No account required', 'MIT licensed']
const heroBpc = samples.find(s => s.id === 'co2-emissions')!.dsl
  .replace(/\{/, '{\n  theme = "blueprint-framed"')
</script>

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
        font-size: var(--bs-font-size-xs);
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--bs-primary);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1rem;

        &::before {
          content: '';
          display: block;
          width: 1.5rem;
          height: 2px;
          background: var(--bs-primary);
        }
      }

      &__h1 {
        font-family: 'DM Serif Display', serif;
        font-size: clamp(2.25rem, 4.5vw, 3.5rem);
        font-weight: 400;
        line-height: 1.08;
        letter-spacing: -0.01em;
        color: var(--bs-body-color);
        margin-bottom: 1.5rem;

        :deep(em) {
          font-style: italic;
          color: var(--bs-primary);
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

      &__meta {
        display: flex;
        align-items: center;
        gap: 1.25rem;
        margin-top: 1.5rem;
        flex-wrap: wrap;
      }
    }

    &__chart {
      background: var(--bc-tile-bg);
      border: var(--bc-tile-border);
      border-radius: var(--bc-tile-radius);
      box-shadow: var(--bc-tile-shadow);
      align-self: center;
      overflow: hidden;
    }
  }
}

@media (max-width: 51.25rem) {
  .landing-hero {
    &__inner {
      grid-template-columns: 1fr;

      &__chart {
        display: none;
      }
    }
  }
}
</style>
