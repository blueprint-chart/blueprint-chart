<script setup lang="ts">
import LandingTopNav from './LandingTopNav.vue'
import LandingHero from './LandingHero.vue'
import LandingValuePropStrip from './LandingValuePropStrip.vue'
import LandingMcp from './LandingMcp.vue'
import LandingFormat from './LandingFormat.vue'
import LandingDefaults from './LandingDefaults.vue'
import LandingTransforms from './LandingTransforms.vue'
import LandingScenes from './LandingScenes.vue'
import LandingFooter from './LandingFooter.vue'
</script>

<template>
  <div class="landing-page">
    <LandingTopNav />
    <div class="landing-page__frame">
      <LandingHero />
      <LandingValuePropStrip />
      <LandingMcp />
      <LandingFormat />
      <LandingDefaults />
      <LandingTransforms />
      <LandingScenes />
      <LandingFooter />
    </div>
  </div>
</template>

<style scoped>
.landing-page {
  background: var(--bc-content-bg);
  min-height: 100vh;
  width: 100%;
}

.landing-page__frame {
  max-width: 75rem;
  margin: 0 auto 3rem;
  background: var(--bc-chrome-bg);
  border: 1px solid var(--bc-frame-border);
  border-radius: var(--bc-frame-radius);
  overflow: hidden;
}
</style>
