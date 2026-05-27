<script setup lang="ts">
import IPhSparkle from '~icons/ph/sparkle'
import { AppIcon } from '@blueprint-chart/ui'
import LandingSection from './LandingSection.vue'
import LandingSectionHeader from './LandingSectionHeader.vue'
import chartImage from '@/assets/images/mcp-letter-frequency.svg'

const userPrompt = 'Make a bar chart of English letter frequencies with an highlight on "E".'
const installCmd = 'claude mcp add blueprint-chart -- npx -y @blueprint-chart/mcp'

interface McpStep {
  n: string
  title: string
  sub: string
}

const steps: McpStep[] = [
  { n: '01', title: 'Read the handbook', sub: 'grounded in real dataviz pedagogy' },
  { n: '02', title: 'Write the .bpc', sub: 'compact, declarative chart source' },
  { n: '03', title: 'Validate', sub: 'structured parse errors and fixes' },
  { n: '04', title: 'Render', sub: 'SVG or PNG, deterministic' },
  { n: '05', title: 'Iterate', sub: 'a tight loop instead of guessing' },
]
</script>

<template>
  <LandingSection id="mcp">
    <LandingSectionHeader label="05 / Author with AI">
      Describe the chart.<br><em>Let your assistant build it.</em>
      <template #lead>
        Connect the Blueprint&nbsp;Chart MCP to Claude, Claude&nbsp;Code, Cursor, or any MCP client.
        It reads the dataviz handbook, writes the <code>.bpc</code>, validates it, and renders
        it — so you get a real chart from a sentence.
      </template>
    </LandingSectionHeader>

    <div class="landing-mcp__grid">
      <!-- Left: the conversation -->
      <div class="landing-mcp__chat">
        <div class="landing-mcp__chat__head">
          <span class="landing-mcp__chat__head__logo">B</span>
          Blueprint Chart · Assistant
        </div>
        <div class="landing-mcp__chat__body">
          <div class="landing-mcp__msg landing-mcp__msg--user">
            <span
              class="landing-mcp__avatar landing-mcp__avatar--user"
              aria-hidden="true"
            >You</span>
            <div class="landing-mcp__msg__col">
              <span class="landing-mcp__msg__name">You</span>
              <div class="landing-mcp__bubble landing-mcp__bubble--user">
                {{ userPrompt }}
              </div>
            </div>
          </div>

          <div class="landing-mcp__msg">
            <span class="landing-mcp__avatar landing-mcp__avatar--asst">
              <AppIcon
                :name="IPhSparkle"
                size="xs"
                aria-hidden="true"
              />
            </span>
            <div class="landing-mcp__msg__col">
              <span class="landing-mcp__msg__name">Blueprint Chart</span>
              <div class="landing-mcp__bubble landing-mcp__bubble--asst">
                Here's the chart ↓
              </div>
              <div class="landing-mcp__chart">
                <img
                  class="landing-mcp__chart__img"
                  :src="chartImage"
                  alt="Bar chart: E is the most frequent letter in English at 12.7%, followed by T, A, O, I, N, S, H, R and D"
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: how it works -->
      <div class="landing-mcp__proof">
        <div class="landing-mcp__proof__label">
          How it works
        </div>

        <ol class="landing-mcp__steps">
          <li
            v-for="step in steps"
            :key="step.n"
            class="landing-mcp__steps__item"
          >
            <span class="landing-mcp__steps__n">{{ step.n }}</span>
            <span class="landing-mcp__steps__t">
              {{ step.title }}
              <small>{{ step.sub }}</small>
            </span>
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
          href="https://docs.blueprintchart.com/guide/mcp"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Read the Blueprint Chart MCP documentation"
        >
          <AppIcon
            :name="IPhSparkle"
            size="xs"
            aria-hidden="true"
          />
          Read the docs
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
    align-items: start;
  }

  /* ---- Left: chat window ---- */
  &__chat {
    border: 1px solid var(--bc-hairline);
    border-radius: var(--bc-radius-md);
    background: var(--bc-content-bg);
    overflow: hidden;
    display: flex;
    flex-direction: column;

    &__head {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 0.875rem;
      background: var(--bc-chrome-bg);
      border-bottom: 1px solid var(--bc-hairline);
      font-size: var(--bs-font-size-sm);
      color: var(--bs-secondary-color);

      &__logo {
        width: 1.125rem;
        height: 1.125rem;
        border-radius: var(--bc-radius-xs);
        background: var(--bs-primary);
        color: #fff;
        font-size: 0.6875rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    &__body {
      padding: 1rem 0.875rem;
      display: flex;
      flex-direction: column;
      gap: 0.875rem;
      background-image: radial-gradient(circle at 0.75rem 0.75rem, rgba(20, 24, 29, 0.035) 1px, transparent 1px);
      background-size: 1.375rem 1.375rem;
    }
  }

  &__msg {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;

    &--user {
      flex-direction: row-reverse;
    }

    &__col {
      display: flex;
      flex-direction: column;
      gap: 0.1875rem;
      max-width: 92%;
      min-width: 0;
    }

    &--user &__col {
      align-items: flex-end;
    }

    &__name {
      font-size: 0.65rem;
      color: var(--bs-tertiary-color);
      padding: 0 0.1875rem;
    }
  }

  &__avatar {
    flex: none;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.6875rem;
    font-weight: 600;

    &--asst {
      background: var(--bs-primary);
      color: #fff;
    }

    &--user {
      background: var(--bc-tile-bg);
      color: var(--bs-secondary-color);
    }
  }

  &__bubble {
    font-size: var(--bs-font-size-sm);
    line-height: 1.5;
    padding: 0.5rem 0.6875rem;
    width: fit-content;
    max-width: 100%;

    &--asst {
      background: var(--bc-tile-bg);
      color: var(--bs-body-color);
      border-radius: var(--bc-radius-xs) var(--bc-radius-md) var(--bc-radius-md) var(--bc-radius-md);
    }

    &--user {
      background: #e6eff8;
      color: #1d4f86;
      border: 1px solid #cfe0f1;
      border-radius: var(--bc-radius-md) var(--bc-radius-xs) var(--bc-radius-md) var(--bc-radius-md);
    }
  }

  &__chart {
    margin-top: 0.25rem;
    border: 1px solid var(--bc-hairline);
    border-radius: var(--bc-radius-md);
    overflow: hidden;
    padding: 0.75rem;
    background: #fff; /* chart is light-designed; keep a light surface even in dark mode */

    &__img {
      display: block;
      width: 100%;
      height: auto;
    }
  }

  /* ---- Right: how it works ---- */
  &__proof {
    border: 1px solid var(--bc-hairline);
    border-radius: var(--bc-radius-md);
    background: var(--bc-content-bg);
    padding: 1.125rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;

    &__label {
      font-family: "Geist Mono", ui-monospace, monospace;
      font-size: var(--bs-font-size-xs);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--bs-tertiary-color);
    }
  }

  &__steps {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;

    &__item {
      position: relative;
      display: flex;
      align-items: flex-start;
      gap: 0.6875rem;
      padding-bottom: 0.875rem;

      &:not(:last-child)::before {
        content: "";
        position: absolute;
        left: 0.6875rem;
        top: 1.5rem;
        bottom: 0;
        width: 2px;
        background: var(--bc-hairline);
      }
    }

    &__item:last-child {
      padding-bottom: 0;
    }

    &__n {
      flex: none;
      width: 1.4375rem;
      height: 1.4375rem;
      border-radius: 50%;
      border: 1.5px solid var(--bs-primary);
      background: var(--bc-content-bg);
      color: var(--bs-primary);
      font-family: "Geist Mono", ui-monospace, monospace;
      font-size: var(--bs-font-size-xs);
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1;
    }

    &__t {
      font-size: var(--bs-font-size-sm);
      color: var(--bs-body-color);
      padding-top: 0.125rem;

      small {
        display: block;
        color: var(--bs-tertiary-color);
        font-size: var(--bs-font-size-xs);
      }
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
      white-space: nowrap;
      overflow-x: auto;
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

[data-bs-theme="dark"] .landing-mcp__bubble--user {
  background: rgba(37, 99, 160, 0.22);
  color: #dce8f4;
  border-color: rgba(37, 99, 160, 0.45);
}

[data-bs-theme="dark"] .landing-mcp__chat__body {
  background-image: radial-gradient(circle at 0.75rem 0.75rem, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
}

@media (max-width: 51.25rem) {
  .landing-mcp__grid {
    grid-template-columns: 1fr;
  }
}
</style>
