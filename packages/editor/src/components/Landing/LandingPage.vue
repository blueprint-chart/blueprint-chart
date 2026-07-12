<script setup lang="ts">
import { StippleDefs } from '@blueprint-chart/ui'
import LandingTopNav from './LandingTopNav.vue'
import LandingHero from './LandingHero.vue'
import LandingValuePropStrip from './LandingValuePropStrip.vue'
import LandingMcp from './LandingMcp.vue'
import LandingFormat from './LandingFormat.vue'
import LandingDefaults from './LandingDefaults.vue'
import LandingTransforms from './LandingTransforms.vue'
import LandingScenes from './LandingScenes.vue'
import LandingCallout from './LandingCallout.vue'
import LandingFooter from './LandingFooter.vue'
</script>

<template>
  <div class="landing-page">
    <!-- The stipple filters are declared once per page; the hero/callout grain
         and any BcRing reference them by id. -->
    <StippleDefs />
    <LandingTopNav />
    <div class="landing-page__frame">
      <LandingHero />
      <LandingValuePropStrip />
      <LandingMcp />
      <LandingFormat />
      <LandingDefaults />
      <LandingTransforms />
      <LandingScenes />
      <LandingCallout />
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
  /* Contain the frame's bottom margin so the ground paints the full height.
     Without this the margin collapses out and a strip of the body background
     shows below the page (the "double background"). */
  display: flow-root;
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

/* On mobile the framed "card" reads as detached: a gap under the nav plus
   rounded top corners. Go full-bleed so the hero butts straight against the
   navbar (its bottom hairline is the only separator). */
@media (max-width: 51.25rem) {
  .landing-page__frame {
    margin: 0;
    border: none;
    border-radius: 0;
  }
}
</style>
