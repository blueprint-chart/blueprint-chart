<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '@/stores/theme'
import logoLight from '@/assets/images/blueprint-chart-logo.svg'
import logoDark from '@/assets/images/blueprint-chart-logo-dark.svg'

const { theme } = useTheme()
const logoSrc = computed(() => theme.value === 'dark' ? logoDark : logoLight)
</script>

<template>
  <footer class="landing-footer">
    <div class="landing-footer__brand">
      <img
        :src="logoSrc"
        alt="Blueprint Chart"
        class="landing-footer__brand__logo"
      >
      <span class="landing-footer__brand__name">Blueprint Chart</span>
    </div>
    <span
      class="landing-footer__sep"
      aria-hidden="true"
    >·</span>
    <router-link
      to="/new"
      class="landing-footer__link"
    >
      Editor
    </router-link>
    <span
      class="landing-footer__sep"
      aria-hidden="true"
    >·</span>
    <a
      class="landing-footer__link"
      href="https://github.com/blueprint-chart/blueprint-chart"
      target="_blank"
      rel="noopener noreferrer"
    >
      GitHub
    </a>
    <span class="landing-footer__spacer" />
    <span class="landing-footer__tagline">
      MIT · Open source charting
    </span>
  </footer>
</template>

<style scoped lang="scss">
.landing-footer {
  background: var(--bc-chrome-bg);
  border-top: 1px solid var(--bc-hairline);
  padding: 1.5rem clamp(1rem, 5vw, 3.75rem);
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: var(--bs-font-size-sm);
  color: var(--bs-secondary-color);
  flex-wrap: wrap;

  &__brand {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--bs-body-color);
    font-weight: 600;

    &__logo {
      height: 1.125rem;
      width: auto;
    }
  }

  &__sep {
    color: var(--bs-tertiary-color);
  }

  // Link-hover highlighter (effects kit, FIG.03), bookending the top nav: the
  // link rides a chartreuse swipe (ground) on hover, ink stays on top. Full
  // swipe on light, faint chartreuse ground on dark (see --bc-swipe).
  &__link {
    position: relative;
    isolation: isolate;
    padding: 0.1rem 0.3rem;
    border-radius: var(--bc-radius-xs);
    color: var(--bs-secondary-color);
    text-decoration: none;

    &::before {
      content: "";
      position: absolute;
      inset: 0;
      z-index: -1;
      background: var(--bc-swipe);
      transform: scaleX(0);
      transform-origin: left center;
      opacity: 0;
      transition:
        transform var(--bc-duration-slow) var(--bc-ease),
        opacity var(--bc-duration-base) var(--bc-ease);
    }

    &:hover {
      color: var(--bs-body-color);

      &::before {
        transform: scaleX(1);
        opacity: 1;
      }
    }
  }

  &__spacer {
    flex: 1;
  }

  &__tagline {
    font-family: "Geist Mono", ui-monospace, monospace;
    font-size: var(--bs-font-size-xs);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--bs-tertiary-color);
  }
}

@media (prefers-reduced-motion: reduce) {
  .landing-footer__link::before {
    transition: none;
  }
}

@media (max-width: 33.75rem) {
  .landing-footer {
    padding: 1.25rem 1rem;

    &__tagline {
      width: 100%;
    }

    &__spacer {
      display: none;
    }
  }
}
</style>
