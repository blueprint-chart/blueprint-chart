<script setup lang="ts">
import LandingTopNav from './LandingTopNav.vue'
import LandingHero from './LandingHero.vue'
import LandingValuePropStrip from './LandingValuePropStrip.vue'
import LandingDefaults from './LandingDefaults.vue'
import LandingTransforms from './LandingTransforms.vue'
import LandingFormat from './LandingFormat.vue'
import LandingScenes from './LandingScenes.vue'
import LandingFooter from './LandingFooter.vue'
</script>

<template>
  <div class="landing-page">
    <LandingTopNav />
    <LandingHero />
    <LandingValuePropStrip />
    <LandingDefaults />
    <LandingTransforms />
    <LandingFormat />
    <LandingScenes />
    <LandingFooter />
  </div>
</template>

<style scoped>
.landing-page {
  background: var(--bc-chrome-bg);
  min-height: 100vh;
  width: 100%;
  background-image: radial-gradient(
    ellipse 900px 600px at 18% 8%,
    rgba(37, 99, 160, 0.10),
    transparent 60%
  );
}
</style>
