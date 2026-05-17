<script setup lang="ts">
import type { Component } from 'vue'
import { samples } from '@blueprint-chart/lib'
import IPhLock from '~icons/ph/lock'
import IPhLightning from '~icons/ph/lightning'
import IPhCloudSlash from '~icons/ph/cloud-slash'
import IPhDatabase from '~icons/ph/database'
import IPhArrowsOut from '~icons/ph/arrows-out'
import { AppIcon } from '@blueprint-chart/ui'
import { highlightDsl } from '@/dsl-lang'
import '@/dsl-lang/highlight.scss'
import LandingSection from './LandingSection.vue'
import LandingSectionHeader from './LandingSectionHeader.vue'
import LandingChartPreview from './LandingChartPreview.vue'
import LandingDefaultCard from './LandingDefaultCard.vue'

const sample = samples.find(s => s.id === 'temperature-anomaly')
if (!sample) {
  throw new Error('Missing temperature-anomaly sample — see LandingFormat.vue')
}
const bpc = sample.dsl.replace(/\{/, '{\n  theme = "blueprint-framed"')
const highlighted = highlightDsl(bpc)

const base64FragmentLong = 'eyJ0eXBlIjoibGluZSIsImRhdGEiOlt7IngiOiIxOTgwIix7InkiOj'
const base64FragmentShort = 'eyJ0...'

interface PortabilityCard {
  icon: Component
  tag: 'A' | 'B' | 'C'
  title: string
  description: string
}

const portabilityCards: PortabilityCard[] = [
  {
    icon: IPhCloudSlash,
    tag: 'A',
    title: 'No backend',
    description: 'The renderer runs in the browser. Self-host the editor anywhere — including a USB stick.',
  },
  {
    icon: IPhDatabase,
    tag: 'B',
    title: 'Data stays local',
    description: 'Your CSV never touches a server. The base64 payload is the data — it travels with the iframe.',
  },
  {
    icon: IPhArrowsOut,
    tag: 'C',
    title: 'One string ships',
    description: 'The entire chart fits in a URL fragment. One copy-paste embeds it on any CMS.',
  },
]
</script>

<template>
  <LandingSection id="format">
    <LandingSectionHeader label="04 / One portable file">
      BPC — a chart you<br><em>can hold in your hand.</em>
      <template #lead>
        Blueprint charts are plain-text in, self-contained iframe out. No backend renders them.
        Your data never leaves the browser. One file is the chart, the data, and the embed —
        together.
      </template>
    </LandingSectionHeader>

    <div class="landing-format__grid">
      <div
        class="landing-format__pane"
        data-bs-theme="dark"
      >
        <div class="landing-format__pane__head">
          <span class="landing-format__pane__head__dots">
            <span /><span /><span />
          </span>
          chart.bpc
        </div>
        <pre
          class="landing-format__pane__code"
          v-html="highlighted"
        />
      </div>

      <div class="landing-format__browser">
        <span class="visually-hidden">Example embed URL</span>
        <div
          class="landing-format__browser__url"
          aria-hidden="true"
        >
          <span class="landing-format__browser__url__dots"><span /><span /><span /></span>
          <span class="landing-format__browser__url__bar">
            <AppIcon
              :name="IPhLock"
              size="xs"
              variant="success"
            />
            <span class="landing-format__browser__url__bar__host">blueprint.chart/embed</span>
            <span class="landing-format__browser__url__bar__fragment landing-format__browser__url__bar__fragment--long">#{{ base64FragmentLong }}</span>
            <span class="landing-format__browser__url__bar__fragment landing-format__browser__url__bar__fragment--short">#{{ base64FragmentShort }}</span>
          </span>
        </div>
        <div class="landing-format__browser__chart">
          <LandingChartPreview :bpc="bpc" />
        </div>
      </div>
    </div>

    <div class="landing-format__cards">
      <LandingDefaultCard
        v-for="card in portabilityCards"
        :key="card.tag"
        :icon="card.icon"
        :tag="card.tag"
        :title="card.title"
        :description="card.description"
      />
    </div>

    <p class="landing-format__footnote">
      <span class="landing-format__footnote__label">FYI</span>
      <AppIcon
        :name="IPhLightning"
        size="xs"
        variant="warning"
      />
      Plain-text BPC is also an excellent target for LLMs — a model can generate valid BPC
      from a description and you can paste it straight into the editor.
    </p>
  </LandingSection>
</template>

<style scoped lang="scss">
.landing-format {
  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    align-items: stretch;
  }

  &__pane {
    background: var(--bc-content-bg);
    border: 1px solid var(--bc-hairline);
    border-radius: var(--bc-radius-md);
    overflow: hidden;
    display: flex;
    flex-direction: column;

    &__head {
      padding: 0.5rem 0.875rem;
      background: var(--bc-chrome-bg);
      border-bottom: 1px solid var(--bc-hairline);
      font-family: "Geist Mono", ui-monospace, monospace;
      font-size: var(--bs-font-size-xs);
      letter-spacing: 0.06em;
      color: var(--bs-tertiary-color);
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      &__dots {
        display: inline-flex;
        gap: 0.1875rem;

        span {
          width: 0.4375rem;
          height: 0.4375rem;
          border-radius: 50%;
          background: var(--bs-tertiary-color);
          opacity: 0.35;
        }
      }
    }

    &__code {
      flex: 1;
      padding: 1rem 1.125rem;
      font-family: "Geist Mono", ui-monospace, monospace;
      font-size: var(--bs-font-size-sm);
      line-height: 1.75;
      color: var(--bs-body-color);
      margin: 0;
      overflow: auto;
      scrollbar-width: none;
      white-space: pre;

      &:hover,
      &:active {
        scrollbar-width: thin;
      }
    }
  }

  &__browser {
    border: 1px solid var(--bc-hairline);
    border-radius: var(--bc-radius-md);
    overflow: hidden;
    display: flex;
    flex-direction: column;

    &__url {
      padding: 0.5rem 0.75rem;
      background: var(--bc-content-bg);
      border-bottom: 1px solid var(--bc-hairline);
      display: flex;
      align-items: center;
      gap: 0.5rem;

      &__dots {
        display: inline-flex;
        gap: 0.25rem;

        span {
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 50%;
          background: var(--bs-tertiary-color);
          opacity: 0.4;
        }
      }

      &__bar {
        flex: 1;
        padding: 0.1875rem 0.625rem;
        background: var(--bc-tile-bg);
        border: 1px solid var(--bc-hairline);
        border-radius: var(--bc-radius-xs);
        font-family: "Geist Mono", ui-monospace, monospace;
        font-size: var(--bs-font-size-xs);
        color: var(--bs-secondary-color);
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        min-width: 0;

        &__host { color: var(--bs-body-color); }
        &__fragment {
          color: var(--bs-tertiary-color);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;

          &--short { display: none; }
        }
      }
    }

    &__chart {
      flex: 1;
      min-height: 0;
    }
  }

  &__cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.625rem;
    margin-top: 1.5rem;
  }

  &__footnote {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1.25rem;
    padding: 0.5rem 0.875rem;
    border: 1px solid var(--bc-hairline);
    border-radius: var(--bc-radius-pill);
    font-size: var(--bs-font-size-sm);
    color: var(--bs-secondary-color);

    &__label {
      font-family: "Geist Mono", ui-monospace, monospace;
      font-size: var(--bs-font-size-xs);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--bs-tertiary-color);
    }
  }
}

@media (max-width: 51.25rem) {
  .landing-format {
    &__grid {
      grid-template-columns: 1fr;
    }

    &__pane {
      &__code {
        max-height: 18rem;
      }
    }

    &__cards {
      grid-template-columns: 1fr;
    }
  }
}

@media (max-width: 33.75rem) {
  .landing-format {
    &__browser {
      &__url {
        &__bar {
          &__fragment {
            &--long { display: none; }
            &--short { display: inline; }
          }
        }
      }
    }
  }
}
</style>
