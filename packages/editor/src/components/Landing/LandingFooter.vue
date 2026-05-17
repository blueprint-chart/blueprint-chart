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
      MIT · Made for investigative journalism
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

  &__link {
    color: var(--bs-secondary-color);
    text-decoration: none;

    &:hover {
      color: var(--bs-body-color);
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
