<template>
  <footer class="landing-footer">
    <div class="landing-footer__brand">
      <img
        :src="logoSrc"
        alt="Blueprint Chart"
        class="landing-footer__brand__logo"
      >
      Blueprint Chart
    </div>
    <div class="landing-footer__links__links">
      Made for investigative journalism
      <span class="landing-footer__links__links__sep">&middot;</span>
      <router-link
        to="/new"
        class="landing-footer__links__link"
      >
        Editor
      </router-link>
      <span class="landing-footer__links__links__sep">&middot;</span>
      <a
        href="#open-source"
        class="landing-footer__links__link"
        @click.prevent="scrollTo('open-source')"
      >Open Source</a>
    </div>
    <div>MIT License &middot; Free forever</div>
  </footer>
</template>

<script setup lang="ts">
import { useTheme } from '@/stores/theme'
import logoLight from '@/assets/images/blueprint-chart-logo.svg'
import logoDark from '@/assets/images/blueprint-chart-logo-dark.svg'

const { theme } = useTheme()
const logoSrc = computed(() => theme.value === 'dark' ? logoDark : logoLight)

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped lang="scss">
.landing-footer {
  background: var(--bs-dark);
  color: rgba(255, 255, 255, 0.5);
  padding: 2.5rem clamp(1rem, 5vw, 3.75rem);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--bs-font-size-sm);
  flex-wrap: wrap;
  gap: 1rem;

  &__brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.9);

    &__logo {
      height: 1.25rem;
      width: auto;
      opacity: 0.8;
    }
  }

  &__links {
    &__link {
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;

      &:hover {
        color: #fff;
      }
    }

    &__sep {
      margin: 0 0.25rem;
    }
  }
}
</style>
