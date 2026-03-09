<template>
  <div class="landing-page">
    <LandingHero />
    <LandingDivider />
    <LandingPhilosophy />
    <LandingDivider />
    <LandingTransforms />
    <LandingDivider />
    <LandingFormat />
    <LandingScenes />
    <LandingDivider />
    <LandingPractices />
    <LandingOpenSource />
    <LandingFooter />
  </div>
</template>

<script setup lang="ts">
import LandingHero from './LandingHero.vue'
import LandingDivider from './LandingDivider.vue'
import LandingPhilosophy from './LandingPhilosophy.vue'
import LandingTransforms from './LandingTransforms.vue'
import LandingFormat from './LandingFormat.vue'
import LandingScenes from './LandingScenes.vue'
import LandingPractices from './LandingPractices.vue'
import LandingOpenSource from './LandingOpenSource.vue'
import LandingFooter from './LandingFooter.vue'
</script>

<style scoped>
.landing-page {
  background: var(--bc-void-bg);
  min-height: 100vh;
  width: 100%;
}
</style>
