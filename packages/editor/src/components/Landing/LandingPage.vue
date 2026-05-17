<template>
  <div class="landing-page">
    <LandingHero />
    <LandingDivider />
    <LandingPhilosophy />
    <LandingDivider />
    <LandingTransforms />
    <LandingFormat />
    <LandingScenes />
    <LandingDivider />
    <LandingPractices />
    <LandingOpenSource />
    <LandingFooter />
  </div>
</template>

<script setup lang="ts">
</script>

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
