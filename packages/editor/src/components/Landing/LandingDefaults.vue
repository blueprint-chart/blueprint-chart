<script setup lang="ts">
import type { Component } from 'vue'
import { samples } from '@blueprint-chart/lib'
import IPhArrowLineDown from '~icons/ph/arrow-line-down'
import IPhTextAa from '~icons/ph/text-aa'
import IPhEraser from '~icons/ph/eraser'
import IPhPalette from '~icons/ph/palette'
import IPhDevices from '~icons/ph/devices'
import IPhQuotes from '~icons/ph/quotes'
import LandingSection from './LandingSection.vue'
import LandingSectionHeader from './LandingSectionHeader.vue'
import LandingChartPreview from './LandingChartPreview.vue'
import LandingDefaultCard from './LandingDefaultCard.vue'

const sample = samples.find(s => s.id === 'temperature-anomaly')
if (!sample) {
  throw new Error('Missing temperature-anomaly sample — see LandingDefaults.vue')
}
const bpc = sample.dsl.replace(/\{/, '{\n  theme = "blueprint-framed"')

interface Card {
  icon: Component
  tag: string
  title: string
  description: string
}

const cards: Card[] = [
  {
    icon: IPhArrowLineDown,
    tag: '01',
    title: 'Axes start at zero',
    description: 'Bars never lie. Truncated axes require an explicit override.',
  },
  {
    icon: IPhTextAa,
    tag: '02',
    title: 'Direct labels',
    description: 'Labels sit next to data. Readers\' eyes never travel to a legend box.',
  },
  {
    icon: IPhEraser,
    tag: '03',
    title: 'No chart junk',
    description: 'Gridlines and borders are suppressed unless they carry information.',
  },
  {
    icon: IPhPalette,
    tag: '04',
    title: 'CVD-safe palettes',
    description: 'Every palette tested against deuteranopia, protanopia, tritanopia.',
  },
  {
    icon: IPhDevices,
    tag: '05',
    title: 'Mobile-first',
    description: 'Labels reflow, ticks reduce, layouts adapt from desktop down to 320 px.',
  },
  {
    icon: IPhQuotes,
    tag: '06',
    title: 'Source attribution',
    description: 'The BPC format includes a source field displayed on every chart.',
  },
]
</script>

<template>
  <LandingSection id="defaults">
    <LandingSectionHeader label="03 / Defaults">
      A simple chart<br><em>sends a big message.</em>
      <template #lead>
        Clutter is the enemy of insight. Blueprint Chart's defaults are opinionated by design, guided by decades of dataviz research from Tufte, Cairo and Schwabish — the same rigor newsrooms rely on — so your readers focus on the story, not the noise.
      </template>
    </LandingSectionHeader>
    <div class="landing-defaults__grid">
      <div class="landing-defaults__grid__chart">
        <LandingChartPreview :bpc="bpc" />
      </div>
      <div class="landing-defaults__grid__cards">
        <LandingDefaultCard
          v-for="card in cards"
          :key="card.tag"
          :icon="card.icon"
          :tag="card.tag"
          :title="card.title"
          :description="card.description"
        />
      </div>
    </div>
  </LandingSection>
</template>

<style scoped lang="scss">
.landing-defaults {
  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2.5rem;
    align-items: stretch;

    &__chart {
      background: var(--bc-tile-bg);
      border: 1px solid var(--bc-hairline);
      border-radius: var(--bc-radius-lg);
      overflow: hidden;
      align-self: stretch;
    }

    &__cards {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.625rem;
    }
  }
}

@media (max-width: 51.25rem) {
  .landing-defaults {
    &__grid {
      grid-template-columns: 1fr;

      &__chart {
        order: -1;
      }
    }
  }
}

@media (max-width: 33.75rem) {
  .landing-defaults {
    &__grid {
      &__cards {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style>
