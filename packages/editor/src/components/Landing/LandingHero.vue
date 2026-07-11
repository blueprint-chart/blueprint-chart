<script setup lang="ts">
import { ButtonIcon, StippleDefs } from '@blueprint-chart/ui'
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
    <StippleDefs />
    <div
      class="landing-hero__grain"
      aria-hidden="true"
    />
    <div class="landing-hero__inner">
      <div class="landing-hero__inner__text">
        <span class="landing-hero__inner__text__eyebrow bc-eyebrow">
          <span
            class="bc-eyebrow__dot"
            aria-hidden="true"
          />
          Open source · MIT
        </span>
        <h1 class="landing-hero__inner__text__h1">
          The open chart format<br><em>AI writes.</em>
        </h1>
        <p class="landing-hero__inner__text__sub">
          An open, plain-text chart format an AI can write and any browser can render.
          Self-contained, no backend, no account required. Prefer to do it yourself? The
          editor's right here.
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
@use "@blueprint-chart/ui/styles/tokens.scss" as tok;

.landing-hero {
  position: relative;
  overflow: hidden;
  padding: 3.5rem clamp(1rem, 5vw, 3.75rem) 4rem;

  &__grain {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background:
      radial-gradient(75% 75% at 12% 10%, rgba(tok.$prussian-300, 0.55), transparent 70%),
      radial-gradient(70% 70% at 88% 92%, rgba(tok.$chartreuse-400, 0.35), transparent 70%);
    filter: url(#bc-stipple-a);
    opacity: 0;
  }

  &__inner {
    position: relative;
    z-index: 1;
    max-width: 70rem;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: center;

    &__text {
      &__eyebrow {
        margin-bottom: 1.25rem;
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
          background: var(--bc-swipe);
          padding: 0 0.1875rem;
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
      box-shadow: none;
      align-self: center;
      overflow: hidden;
    }
  }
}

[data-bs-theme="dark"] .landing-hero__inner__text__h1 :deep(em) {
  padding: 0;
  color: var(--bc-accent);
}

[data-bs-theme="dark"] .landing-hero {
  background: var(--bc-marketing-field);

  .landing-hero__grain {
    opacity: 1;
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
