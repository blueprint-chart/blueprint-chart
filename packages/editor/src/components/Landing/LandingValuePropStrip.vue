<script setup lang="ts">
import { AppIcon } from '@blueprint-chart/ui'
import IPhGithubLogo from '~icons/ph/github-logo'

interface ValueCell {
  index: string
  name: string
  value: string
  href?: string
}

const cells: ValueCell[] = [
  { index: '01', name: 'Plain text', value: 'A format AI can write' },
  { index: '02', name: 'No backend', value: 'Renders in the browser' },
  { index: '03', name: 'Data sovereignty', value: 'Nothing ever uploaded' },
  { index: '04', name: 'MIT', value: 'Open source, forever', href: 'https://github.com/blueprint-chart/blueprint-chart' },
]
</script>

<template>
  <section
    class="landing-value-prop-strip"
    aria-label="Why Blueprint Chart"
  >
    <dl
      v-for="cell in cells"
      :key="cell.index"
      class="landing-value-prop-strip__cell"
    >
      <dt class="landing-value-prop-strip__cell__label">
        <span class="landing-value-prop-strip__cell__index">{{ cell.index }}</span> / {{ cell.name }}
      </dt>
      <dd class="landing-value-prop-strip__cell__value">
        <a
          v-if="cell.href"
          :href="cell.href"
          target="_blank"
          rel="noopener noreferrer"
          class="landing-value-prop-strip__cell__link"
        >
          <AppIcon
            :name="IPhGithubLogo"
            size="xs"
          />
          {{ cell.value }}
        </a>
        <template v-else>
          {{ cell.value }}
        </template>
      </dd>
    </dl>
  </section>
</template>

<style scoped lang="scss">
.landing-value-prop-strip {
  border-top: 1px solid var(--bc-hairline);
  // No bottom border: the bordered LandingSection directly below contributes
  // its own top hairline, so a border-bottom here would render as a 2px double.
  display: grid;
  grid-template-columns: repeat(4, 1fr);

  &__cell {
    margin: 0;
    padding: 1rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    border-right: 1px solid var(--bc-hairline);

    &:last-child {
      border-right: none;
    }

    &__label {
      font-family: "Geist Mono", ui-monospace, monospace;
      font-size: var(--bs-font-size-xs);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--bs-tertiary-color);
    }

    // Highlighter index tab (effects kit, FIG.03). The cell number sits on a
    // chartreuse swipe — ground, never a thin figure: the digits stay ink and
    // ride on top. `--bc-swipe` is a full chartreuse block on light and a faint
    // chartreuse ground on dark, echoing the top nav's active mark.
    &__index {
      position: relative;
      // Own stacking context so the negative-z swipe stays behind the digits.
      isolation: isolate;
      padding: 0 0.25rem;
      color: var(--bs-body-color);

      &::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: -1;
        background: var(--bc-swipe);
        opacity: 0.85;
        transition: opacity var(--bc-duration-base) var(--bc-ease);
      }
    }

    &:hover &__index::before {
      opacity: 1;
    }

    &__value {
      margin-inline-start: 0;
      font-size: var(--bs-font-size-md);
      font-weight: 500;
      color: var(--bs-body-color);
    }

    &__link {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      color: inherit;
      text-decoration: none;
      transition: color var(--bc-duration-base) var(--bc-ease);

      &:hover {
        color: var(--bs-primary);
        text-decoration: underline;
      }

      &:focus-visible {
        outline: none;
        box-shadow: var(--bc-focus-ring);
        border-radius: 2px;
      }
    }
  }
}

@media (max-width: 51.25rem) {
  .landing-value-prop-strip {
    grid-template-columns: repeat(2, 1fr);

    &__cell {
      padding: 0.875rem 1rem;

      // Cells 1 + 2 now sit above 3 + 4 → add a horizontal hairline under 1 and 2.
      &:nth-child(1),
      &:nth-child(2) {
        border-bottom: 1px solid var(--bc-hairline);
      }
      // Vertical hairline between columns: keep on cells 1 + 3, drop on 2 + 4.
      &:nth-child(2),
      &:nth-child(4) {
        border-right: none;
      }
      &:nth-child(1),
      &:nth-child(3) {
        border-right: 1px solid var(--bc-hairline);
      }
    }
  }
}

@media (max-width: 33.75rem) {
  .landing-value-prop-strip {
    grid-template-columns: 1fr;

    &__cell {
      border-right: none !important;
      border-bottom: 1px solid var(--bc-hairline);

      &:last-child {
        border-bottom: none;
      }
    }
  }
}
</style>
