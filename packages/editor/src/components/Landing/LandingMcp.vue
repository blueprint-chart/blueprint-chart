<script setup lang="ts">
import { samples } from '@blueprint-chart/lib'
import IPhSparkle from '~icons/ph/sparkle'
import IPhArrowRight from '~icons/ph/arrow-right'
import { AppIcon } from '@blueprint-chart/ui'
import LandingSection from './LandingSection.vue'
import LandingSectionHeader from './LandingSectionHeader.vue'
import LandingChartPreview from './LandingChartPreview.vue'

const sample = samples.find(s => s.id === 'letter-frequency')
if (!sample) {
  throw new Error('Missing letter-frequency sample — see LandingMcp.vue')
}
const bpc = sample.dsl

const userPrompt = 'Make a bar chart of English letter frequencies — highlight E.'
const installCmd = 'claude mcp add blueprint-chart -- npx -y @blueprint-chart/mcp'
const steps = ['read handbook', 'write .bpc', 'validate', 'render', 'iterate']
</script>

<template>
  <LandingSection id="mcp">
    <LandingSectionHeader label="05 / Author with AI">
      Describe the chart.<br><em>Let your assistant build it.</em>
      <template #lead>
        Connect the Blueprint&nbsp;Chart MCP to Claude, Claude&nbsp;Code, or any MCP client.
        It reads the dataviz handbook, writes the <code>.bpc</code>, validates it, and renders
        it — so you get a real chart from a sentence.
      </template>
    </LandingSectionHeader>

    <div class="landing-mcp__grid">
      <div class="landing-mcp__chat">
        <div class="landing-mcp__chat__bubble landing-mcp__chat__bubble--user">
          {{ userPrompt }}
        </div>
        <div class="landing-mcp__chat__bubble landing-mcp__chat__bubble--assistant">
          Here's the chart ↓
        </div>
        <div class="landing-mcp__chat__chart">
          <span class="visually-hidden">Generated letter-frequency chart preview</span>
          <LandingChartPreview :bpc="bpc" />
        </div>
      </div>

      <div class="landing-mcp__proof">
        <div class="landing-mcp__proof__label">
          How it works
        </div>
        <ol class="landing-mcp__pipeline">
          <li
            v-for="(step, i) in steps"
            :key="step"
            class="landing-mcp__pipeline__step"
          >
            <span class="landing-mcp__pipeline__chip">{{ step }}</span>
            <AppIcon
              v-if="i < steps.length - 1"
              :name="IPhArrowRight"
              size="xs"
              class="landing-mcp__pipeline__arrow"
            />
          </li>
        </ol>

        <div
          class="landing-mcp__install"
          data-bs-theme="dark"
        >
          <div class="landing-mcp__install__head">
            <span class="landing-mcp__install__head__dots">
              <span /><span /><span />
            </span>
            terminal
          </div>
          <code class="landing-mcp__install__cmd">{{ installCmd }}</code>
        </div>

        <a
          class="landing-mcp__cta"
          href="https://github.com/blueprint-chart/mcp"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Get the Blueprint Chart MCP"
        >
          <AppIcon
            :name="IPhSparkle"
            size="xs"
            aria-hidden="true"
          />
          Get the MCP
          <AppIcon
            :name="IPhArrowRight"
            size="xs"
            aria-hidden="true"
          />
        </a>
      </div>
    </div>
  </LandingSection>
</template>

<style scoped lang="scss">
.landing-mcp {
  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    align-items: stretch;
  }

  &__chat {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    padding: 1rem;
    border: 1px solid var(--bc-hairline);
    border-radius: var(--bc-radius-md);
    background: var(--bc-content-bg);

    &__bubble {
      font-size: var(--bs-font-size-sm);
      line-height: 1.5;
      padding: 0.5rem 0.75rem;
      border-radius: var(--bc-radius-md);
      max-width: 85%;

      &--user {
        align-self: flex-end;
        background: var(--bs-primary);
        color: #fff;
        border-bottom-right-radius: var(--bc-radius-xs);
      }

      &--assistant {
        align-self: flex-start;
        background: var(--bc-tile-bg);
        color: var(--bs-body-color);
        border-bottom-left-radius: var(--bc-radius-xs);
      }
    }

    &__chart {
      margin-top: 0.25rem;
      border: 1px solid var(--bc-hairline);
      border-radius: var(--bc-radius-md);
      overflow: hidden;
      min-height: 14rem;
      background: #fff;
    }
  }

  &__proof {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    justify-content: center;

    &__label {
      font-family: "Geist Mono", ui-monospace, monospace;
      font-size: var(--bs-font-size-xs);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--bs-tertiary-color);
    }
  }

  &__pipeline {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.375rem;

    &__step {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
    }

    &__chip {
      font-size: var(--bs-font-size-sm);
      padding: 0.25rem 0.625rem;
      border: 1px solid var(--bc-hairline);
      border-radius: var(--bc-radius-pill);
      color: var(--bs-secondary-color);
      white-space: nowrap;
    }

    &__arrow {
      color: var(--bs-tertiary-color);
    }
  }

  &__install {
    border: 1px solid var(--bc-hairline);
    border-radius: var(--bc-radius-md);
    overflow: hidden;

    &__head {
      padding: 0.5rem 0.875rem;
      background: var(--bc-chrome-bg);
      border-bottom: 1px solid var(--bc-hairline);
      font-family: "Geist Mono", ui-monospace, monospace;
      font-size: var(--bs-font-size-xs);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--bs-tertiary-color);
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

    &__cmd {
      display: block;
      padding: 0.875rem 1.125rem;
      font-family: "Geist Mono", ui-monospace, monospace;
      font-size: var(--bs-font-size-sm);
      color: var(--bs-body-color);
      white-space: pre-wrap;
      word-break: break-all;
    }
  }

  &__cta {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: var(--bc-radius-md);
    background: var(--bs-primary);
    color: #fff;
    font-size: var(--bs-font-size-sm);
    font-weight: 600;
    text-decoration: none;
    transition: opacity var(--bc-duration-fast) var(--bc-ease);

    &:hover,
    &:focus-visible {
      opacity: 0.9;
    }

    &:focus-visible {
      outline: none;
      box-shadow: var(--bc-focus-ring);
    }
  }
}

@media (max-width: 51.25rem) {
  .landing-mcp__grid {
    grid-template-columns: 1fr;
  }
}
</style>
