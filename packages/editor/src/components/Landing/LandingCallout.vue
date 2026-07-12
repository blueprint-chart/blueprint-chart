<script setup lang="ts">
import { BcRing } from '@blueprint-chart/ui'
</script>

<template>
  <section
    class="landing-callout"
    data-bs-theme="dark"
  >
    <div
      class="landing-callout__grain"
      aria-hidden="true"
    />
    <div class="landing-callout__inner">
      <p class="landing-callout__eyebrow bc-eyebrow">
        <span
          class="bc-eyebrow__dot"
          aria-hidden="true"
        />
        Start now
      </p>
      <h2 class="landing-callout__title">
        Draft your first chart <em>in a sentence.</em>
      </h2>
      <!-- The closing ceremonial CTA, ringed to match the hero: the two rings
           (hero + closing) bookend the page on its dark marketing islands. -->
      <BcRing
        tone="field"
        inline
        class="landing-callout__cta-ring"
      >
        <router-link
          to="/new"
          class="btn-bc-primary"
        >
          <span
            class="bc-pool"
            aria-hidden="true"
          />
          <span class="landing-callout__cta-label">New chart</span>
        </router-link>
      </BcRing>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use "@blueprint-chart/ui/styles/tokens.scss" as tok;

.landing-callout {
  position: relative;
  overflow: hidden;
  background: var(--bc-content-bg);
  padding: 4rem clamp(1rem, 5vw, 3.75rem);

  &__grain {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background:
      radial-gradient(70% 70% at 85% 15%, rgba(tok.$chartreuse-400, 0.5), transparent 68%),
      radial-gradient(75% 75% at 10% 90%, rgba(tok.$prussian-300, 0.7), transparent 68%);
    filter: url(#bc-stipple-a);
  }

  &__inner {
    position: relative;
    z-index: 1;
    max-width: 70rem;
    margin: 0 auto;
    text-align: center;
  }

  &__title {
    font-family: "DM Serif Display", Georgia, serif;
    font-weight: 400;
    font-size: clamp(1.75rem, 3.5vw, 2.75rem);
    color: var(--bc-marketing-ink);
    margin: 0.75rem 0 1.75rem;

    :deep(em) {
      font-style: italic;
      color: var(--bc-accent);
    }
  }

  &__cta-label {
    position: relative;
    z-index: 1;
  }

  // Ring corner matches the button radius so they read as one control (same as
  // the hero's ringed CTA).
  &__cta-ring {
    --bc-ring-gap: 4px;
    --bc-ring-radius: var(--bc-radius-md);
    vertical-align: middle;
  }
}
</style>
