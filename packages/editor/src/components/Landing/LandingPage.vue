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
  /* White in light theme, deep neutral in dark. */
  background: var(--bc-chrome-bg);
  min-height: 100vh;
  width: 100%;
}

.landing-page__frame {
  max-width: 75rem;
  /* Gap between the sticky top nav and the framed content. */
  margin: 1.5rem auto 3rem;
  /* Transparent so the frame always shares the body ground; the hairline */
  /* border does the framing, inner tiles carry the contrast. */
  background: transparent;
  border: 1px solid var(--bc-frame-border);
  border-radius: var(--bc-frame-radius);
  overflow: hidden;
}
</style>
