<template>
  <LandingSection>
    <LandingSectionHeader
      label="Visualization best practices"
      center
    >
      The right defaults,<br><em>every time.</em>
      <template #lead>
        Blueprint Chart ships with baked-in expertise from Tufte, Cairo, Schwabish
        and the broader dataviz research community.
      </template>
    </LandingSectionHeader>
    <div class="practices__grid">
      <LandingPracticeCard
        v-for="card in cards"
        :key="card.title"
        :icon="card.icon"
        :title="card.title"
        :description="card.description"
        :badge="card.badge"
      />
    </div>
  </LandingSection>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import IPhArrowLineDown from '~icons/ph/arrow-line-down'
import IPhPalette from '~icons/ph/palette'
import IPhDevices from '~icons/ph/devices'
import IPhTextAa from '~icons/ph/text-aa'
import IPhQuotes from '~icons/ph/quotes'
import IPhChartBar from '~icons/ph/chart-bar'

const cards: { icon: Component, title: string, description: string, badge: string }[] = [
  {
    icon: IPhArrowLineDown,
    title: 'Start axes at zero',
    description: 'Bar charts always start at zero by default. Misleading truncated axes require an explicit override.',
    badge: 'Enforced',
  },
  {
    icon: IPhPalette,
    title: 'Semantic color only',
    description: 'Color encodes data — never decoration. Sequential, diverging and categorical palettes follow best practices.',
    badge: 'By default',
  },
  {
    icon: IPhDevices,
    title: 'Mobile-first layout',
    description: 'Every chart is responsive. Labels reflow, tick counts reduce, and layouts adapt from desktop down to 320px.',
    badge: 'Always',
  },
  {
    icon: IPhTextAa,
    title: 'WCAG-compliant contrast',
    description: 'Text on chart backgrounds is checked against WCAG AA contrast ratios. Accessibility is not optional.',
    badge: 'Verified',
  },
  {
    icon: IPhQuotes,
    title: 'Source attribution',
    description: 'The BPC format includes a source field displayed on every chart, promoting citation culture in journalism.',
    badge: 'Built in',
  },
  {
    icon: IPhChartBar,
    title: 'Chart type guidance',
    description: 'Blueprint applies type-specific defaults — line interpolation, value label placement, legend positioning — so each chart type looks right out of the box.',
    badge: 'Smart defaults',
  },
]
</script>

<style scoped>
.practices__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

@media (max-width: 51.25rem) {
  .practices__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 33.75rem) {
  .practices__grid {
    grid-template-columns: 1fr;
  }
}
</style>
