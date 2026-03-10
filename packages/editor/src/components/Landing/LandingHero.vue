<template>
  <section class="landing-hero">
    <div class="landing-hero__inner">
      <div class="landing-hero__text">
        <div class="landing-hero__eyebrow">
          Data visualization for the editorial web
        </div>
        <h1 class="landing-hero__h1">
          Turn data into<br><em>compelling stories.</em>
        </h1>
        <p class="landing-hero__sub">
          Blueprint Chart is a free, open-source tool for journalists, researchers and analysts.
          Build beautiful, accessible charts with best practices built in — no design degree required.
        </p>
        <div class="landing-hero__actions">
          <router-link
            to="/charts"
            class="landing-hero__btn landing-hero__btn--ghost"
          >
            My Charts
          </router-link>
          <router-link
            to="/new"
            class="landing-hero__btn landing-hero__btn--primary"
          >
            New
            <AppIcon
              :name="IPhArrowRight"
              size="sm"
            />
          </router-link>
        </div>
        <div class="landing-hero__meta">
          <LandingBadge
            v-for="badge in badges"
            :key="badge"
            :label="badge"
          />
        </div>
      </div>
      <div class="landing-hero__chart">
        <LandingChartPreview :bpc="heroBpc" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { AppIcon } from '@blueprint-chart/ui'
import IPhArrowRight from '~icons/ph/arrow-right'
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
}

.landing-hero__inner {
  max-width: 70rem;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.landing-hero__eyebrow {
  font-size: 0.6875rem;
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

.landing-hero__h1 {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(2.25rem, 4.5vw, 3.5rem);
  font-weight: 400;
  line-height: 1.08;
  letter-spacing: -0.01em;
  color: var(--bs-body-color);
  margin-bottom: 1.5rem;

  em {
    font-style: italic;
    color: var(--bs-primary);
  }
}

.landing-hero__sub {
  font-size: 1.0625rem;
  color: var(--bs-secondary-color);
  line-height: 1.65;
  max-width: 28.75rem;
  margin-bottom: 2.25rem;
}

.landing-hero__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.landing-hero__btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6875rem 1.625rem;
  border-radius: var(--bc-tile-radius);
  font-size: 0.875rem;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.15s;
}

.landing-hero__btn--primary {
  background: var(--bs-primary);
  color: #fff;

  &:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
    color: #fff;
  }
}

.landing-hero__btn--ghost {
  background: transparent;
  color: var(--bs-secondary-color);
  border: var(--bc-tile-border);

  &:hover {
    border-color: var(--bs-body-color);
    color: var(--bs-body-color);
  }
}

.landing-hero__meta {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.landing-hero__chart {
  background: var(--bc-tile-bg);
  border: var(--bc-tile-border);
  border-radius: var(--bc-tile-radius);
  box-shadow: var(--bc-tile-shadow);
  align-self: center;
}

@media (max-width: 51.25rem) {
  .landing-hero__inner {
    grid-template-columns: 1fr;
  }

  .landing-hero__chart {
    display: none;
  }
}
</style>
