<template>
  <LandingSection id="features">
    <div class="philosophy__grid">
      <div class="philosophy__chart-tile">
        <LandingChartPreview :bpc="temperatureBpc" />
      </div>
      <div>
        <LandingSectionHeader label="Design philosophy">
          A simple chart<br><em>sends a big message.</em>
          <template #lead>
            Clutter is the enemy of insight. Blueprint Chart's defaults are opinionated by design —
            guided by decades of data visualization research so your readers focus on the story, not the noise.
          </template>
        </LandingSectionHeader>
        <div class="philosophy__points">
          <LandingBulletPoint
            v-for="point in points"
            :key="point.title"
            :title="point.title"
            :description="point.description"
          />
        </div>
      </div>
    </div>
  </LandingSection>
</template>

<script setup lang="ts">
import { samples } from '@blueprint-chart/lib'
import LandingSection from './LandingSection.vue'
import LandingSectionHeader from './LandingSectionHeader.vue'
import LandingBulletPoint from './LandingBulletPoint.vue'
import LandingChartPreview from './LandingChartPreview.vue'

const temperatureBpc = samples.find(s => s.id === 'temperature-anomaly')!.dsl
  .replace(/\{/, '{\n  theme = "blueprint-framed"')

const points = [
  {
    title: 'Direct labels by default',
    description: 'Labels sit next to data, never in a disconnected legend box. Readers\' eyes never have to travel.',
  },
  {
    title: 'No chart junk',
    description: 'Gridlines, borders and decorations are suppressed unless they carry information. Based on Tufte\'s data-ink ratio.',
  },
  {
    title: 'Colorblind-safe palettes',
    description: 'Every default palette is tested against deuteranopia, protanopia, and tritanopia. Accessible by default.',
  },
]
</script>

<style scoped>
.philosophy__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.5rem;
  align-items: start;
  overflow: hidden;
}

.philosophy__points {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.philosophy__chart-tile {
  background: var(--bc-tile-bg);
  border: var(--bc-tile-border);
  border-radius: var(--bc-tile-radius);
  box-shadow: var(--bc-tile-shadow);
  align-self: start;
}

@media (max-width: 51.25rem) {
  .philosophy__grid {
    grid-template-columns: 1fr;
  }
}
</style>
