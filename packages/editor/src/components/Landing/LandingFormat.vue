<template>
  <LandingSection
    id="bpc"
    dark
    full
  >
    <LandingSectionHeader label="BPC — Blueprint Chart Format">
      Designed for humans<br><em>and LLMs alike.</em>
      <template #lead>
        BPC is a minimal, plain-text format to describe charts. It's readable at a glance,
        trivially diffable, and perfectly structured for AI-assisted chart generation.
      </template>
    </LandingSectionHeader>
    <div class="format__grid">
      <div class="format__grid__pane-cell">
        <div
          class="format-pane"
          data-bs-theme="dark"
        >
          <div class="format-pane__header">
            <span class="format-dot format-dot--red" />
            <span class="format-dot format-dot--yellow" />
            <span class="format-dot format-dot--green" />
            &nbsp; chart.bpc
          </div>
          <pre
            class="format-pane__code"
            v-html="highlightedBpc"
          />
        </div>
      </div>
      <div>
        <div class="format__grid__chart-tile">
          <LandingChartPreview :bpc="bpcCode" />
        </div>
        <div class="format-ai-note">
          <div class="format-ai-note__header">
            <AppIcon
              :name="IPhLightning"
              size="sm"
              variant="warning"
            />
            <span class="format-ai-note__header__title">LLM-friendly by design</span>
          </div>
          <p class="format-ai-note__text">
            BPC uses a simple block syntax. A language model can generate valid BPC
            from a plain description — and you can paste it straight into Blueprint Chart.
          </p>
        </div>
      </div>
    </div>
  </LandingSection>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AppIcon } from '@blueprint-chart/ui'
import IPhLightning from '~icons/ph/lightning'
import { samples } from '@blueprint-chart/lib'
import { highlightDsl } from '@/dsl-lang'
import '@/dsl-lang/highlight.scss'
import LandingSection from './LandingSection.vue'
import LandingSectionHeader from './LandingSectionHeader.vue'
import LandingChartPreview from './LandingChartPreview.vue'

const rawBpc = samples.find(s => s.id === 'coffee-production')!.dsl
  .replace(/\{/, '{\n  theme = "blueprint-framed"')
const bpcCode = rawBpc
  .split('\n')
  .filter(line => !/^\s*(colors|colorPalette)\s*=/.test(line))
  .join('\n')

const highlightedBpc = computed(() => highlightDsl(bpcCode))
</script>

<style scoped lang="scss">
.format {
  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-top: 0.75rem;

    &__pane-cell {
      position: relative;
      min-height: 0;
    }

    &__chart-tile {
      background: transparent;
      border-radius: var(--bc-tile-radius);
      border: 1px solid rgba(255, 255, 255, 0.1);
      overflow: hidden;
    }
  }
}

.format-pane {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--bc-tile-radius);
  overflow: hidden;
  display: flex;
  flex-direction: column;

  &__header {
    padding: 0.625rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    font-size: 0.6875rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.4);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  &__code {
    padding: 1.25rem 1rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem;
    line-height: 1.8;
    color: #e2e8f0;
    overflow: auto;
    scrollbar-width: none;

    &:hover,
    &:active {
      scrollbar-width: thin;
    }
    white-space: pre;
    margin: 0;
    flex-grow: 1;
  }
}

.format-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  display: inline-block;

  &--red { background: #ef4444; }
  &--yellow { background: #f59e0b; }
  &--green { background: #22c55e; }
}

.format-ai-note {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--bc-tile-radius);

  &__header {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    margin-bottom: 0.5rem;

    &__title {
      font-size: 0.75rem;
      color: #7aa7d4;
      font-weight: 700;
    }
  }

  &__text {
    font-size: 0.75rem;
    color: #9ca3af;
    line-height: 1.7;
    margin: 0;
  }
}

@media (max-width: 51.25rem) {
  .format {
    &__grid {
      grid-template-columns: 1fr;

      &__pane-cell {
        min-height: 24rem;
      }
    }
  }
}
</style>
