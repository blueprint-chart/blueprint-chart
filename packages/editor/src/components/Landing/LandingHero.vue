<script setup lang="ts">
import { BcRing } from '@blueprint-chart/ui'
import { samples } from '@blueprint-chart/lib'

const sample = samples.find(s => s.id === 'coffee-production')
if (!sample) {
  throw new Error('Missing coffee-production sample — see LandingHero.vue')
}
const heroBpc = sample.dsl.replace(/\{/, '{\n  theme = "blueprint-framed"')
</script>

<template>
  <section
    class="landing-hero"
    data-bs-theme="dark"
  >
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
          <router-link
            to="/charts"
            class="landing-hero__ghost"
          >
            My charts
          </router-link>
          <router-link
            to="/new"
            class="btn-bc-primary"
          >
            <span
              class="bc-pool"
              aria-hidden="true"
            />
            <span class="btn-bc-primary__label">New chart</span>
          </router-link>
        </div>
      </div>
      <div class="landing-hero__inner__chart">
        <BcRing tone="field">
          <div class="landing-hero__inner__chart__card">
            <LandingChartPreview :bpc="heroBpc" />
          </div>
        </BcRing>
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
  background: var(--bc-marketing-field);

  &__grain {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background:
      radial-gradient(80% 80% at 12% 8%, rgba(tok.$prussian-300, 0.75), transparent 68%),
      radial-gradient(72% 72% at 90% 94%, rgba(tok.$chartreuse-400, 0.5), transparent 68%);
    filter: url(#bc-stipple-a);
    opacity: 1;
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
        color: var(--bc-marketing-ink);
        margin-bottom: 1.5rem;
        font-family: "DM Serif Display", Georgia, "Times New Roman", serif;

        :deep(em) {
          font-style: italic;
          color: var(--bc-accent);
        }
      }

      &__sub {
        font-size: 1rem;
        color: var(--bc-marketing-ink-dim);
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
      align-self: center;

      &__card {
        background: var(--bc-marketing-card);
        border-radius: var(--bc-radius-lg);
        overflow: hidden;
      }
    }
  }

  &__ghost {
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 1.1rem;
    border-radius: var(--bc-radius-md);
    border: 1px solid rgba(tok.$chartreuse-400, 0.5);
    color: var(--bc-marketing-ink);
    font-family: var(--bs-font-monospace, "Geist Mono", ui-monospace, monospace);
    font-size: var(--bs-font-size-sm);
    text-decoration: none;
  }
}

.btn-bc-primary__label {
  position: relative;
  z-index: 1;
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
