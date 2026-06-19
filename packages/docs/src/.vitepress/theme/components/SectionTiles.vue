<script setup lang="ts">
// Blueprint Chart — docs section tiles.
//
// A responsive grid of navigation tiles surfaced at the top of the
// Getting Started page (which is also the docs landing — `/` redirects
// here). Mirrors the top-nav sections plus an outbound link to the
// hosted editor. Styling leans on the shared --bc-tile-* / --vp-c-brand-*
// tokens so it tracks light/dark and the Prussian-Blue brand automatically.

import IPhChartBar from '~icons/ph/chart-bar'
import IPhBookBookmark from '~icons/ph/book-bookmark'
import IPhBracketsCurly from '~icons/ph/brackets-curly'
import IPhPencilSimpleLine from '~icons/ph/pencil-simple-line'
import IPhArrowRight from '~icons/ph/arrow-right'
import IPhArrowUpRight from '~icons/ph/arrow-up-right'

interface Tile {
  icon: typeof IPhChartBar
  title: string
  details: string
  link: string
  external?: boolean
}

const tiles: Tile[] = [
  {
    icon: IPhChartBar,
    title: 'Charts',
    details: 'The catalogue of 13 chart types across the bar, line, area, and part-to-whole families.',
    link: '/charts/',
  },
  {
    icon: IPhBookBookmark,
    title: 'Handbook',
    details: 'The opinionated dataviz field guide — design principles, anti-patterns, and visual language.',
    link: '/handbook/',
  },
  {
    icon: IPhBracketsCurly,
    title: 'Reference',
    details: 'The BPC DSL specification and the full @blueprint-chart/lib API surface.',
    link: '/reference/',
  },
  {
    icon: IPhPencilSimpleLine,
    title: 'Open the editor',
    details: 'Author a chart live at blueprintchart.com — no account, runs entirely in your browser.',
    link: 'https://blueprintchart.com',
    external: true,
  },
]
</script>

<template>
  <nav
    class="section-tiles"
    aria-label="Documentation sections"
  >
    <a
      v-for="tile in tiles"
      :key="tile.title"
      class="section-tile"
      :href="tile.link"
      :target="tile.external ? '_blank' : undefined"
      :rel="tile.external ? 'noopener noreferrer' : undefined"
    >
      <span class="section-tile__icon">
        <component
          :is="tile.icon"
          aria-hidden="true"
        />
      </span>
      <span class="section-tile__title">
        {{ tile.title }}
        <component
          :is="tile.external ? IPhArrowUpRight : IPhArrowRight"
          class="section-tile__arrow"
          aria-hidden="true"
        />
      </span>
      <span class="section-tile__details">{{ tile.details }}</span>
    </a>
  </nav>
</template>

<style scoped>
.section-tiles {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: var(--bc-tile-gap, 0.75rem);
  margin: 1.5rem 0 2.5rem;
}

.section-tile {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.1rem 1.2rem 1.25rem;
  border-radius: var(--bc-tile-radius, 12px);
  border: 1px solid var(--bc-tile-border, var(--vp-c-divider));
  background: var(--bc-tile-bg, var(--vp-c-bg-soft));
  color: var(--vp-c-text-1);
  text-decoration: none;
  overflow: hidden;
  transition:
    border-color var(--bc-duration-base, 150ms) var(--bc-ease, ease),
    transform var(--bc-duration-base, 150ms) var(--bc-ease, ease),
    box-shadow var(--bc-duration-base, 150ms) var(--bc-ease, ease),
    background var(--bc-duration-base, 150ms) var(--bc-ease, ease);
}

.section-tile:hover {
  border-color: var(--vp-c-brand-1);
  background: var(--bc-tile-bg-elevated, var(--vp-c-bg-elv));
  box-shadow: var(--bc-tile-shadow, 0 6px 24px rgba(0, 0, 0, 0.08));
  transform: translateY(-2px);
  text-decoration: none;
  color: var(--vp-c-text-1);
}

.section-tile__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: var(--bc-tile-radius-xs, 6px);
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-size: 1.25rem;
}

.section-tile:hover .section-tile__icon {
  background: var(--vp-c-brand-1);
  color: #fff;
}

.section-tile__title {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-family: var(--vp-font-family-base);
  font-weight: 600;
  font-size: var(--bs-font-size-md, 1rem);
  line-height: 1.2;
}

.section-tile__arrow {
  font-size: 0.95rem;
  opacity: 0;
  transform: translateX(-0.25rem);
  transition:
    opacity var(--bc-duration-base, 150ms) var(--bc-ease, ease),
    transform var(--bc-duration-base, 150ms) var(--bc-ease, ease);
  color: var(--vp-c-brand-1);
}

.section-tile:hover .section-tile__arrow {
  opacity: 1;
  transform: translateX(0);
}

.section-tile__details {
  font-size: var(--bs-font-size-sm, 0.875rem);
  line-height: 1.5;
  color: var(--vp-c-text-2);
}

@media (max-width: 640px) {
  .section-tiles {
    grid-template-columns: 1fr;
  }
}
</style>
