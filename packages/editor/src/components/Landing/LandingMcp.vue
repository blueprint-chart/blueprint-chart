<script setup lang="ts">
import IPhSparkle from '~icons/ph/sparkle'
import IPhUser from '~icons/ph/user'
import { AppIcon } from '@blueprint-chart/ui'
import LandingSection from './LandingSection.vue'
import LandingSectionHeader from './LandingSectionHeader.vue'
import chartImage from '@/assets/images/mcp-letter-frequency.svg'

const userPrompt = 'Make a bar chart of English letter frequencies with an highlight on "E".'
const installCmd = 'claude mcp add blueprint-chart -- npx -y @blueprint-chart/mcp'

interface ChatMessage {
  role: 'user' | 'asst'
  name: string
  text: string
  chart?: boolean
  link?: string
}

// URL-safe base64 of packages/lib/src/samples/letter-frequency.bpc — decoded by the /copy route
const exportLink = 'https://blueprintchart.com/#/copy?bpc64=Y2hhcnQgYmFyLXZlcnRpY2FsIHsKICB0aXRsZSA9ICJFIGlzIHRoZSBtb3N0IGZyZXF1ZW50IGxldHRlciBpbiBFbmdsaXNoIgogIGRlc2NyaXB0aW9uID0gIkhvdyBvZnRlbiBlYWNoIGxldHRlciBhcHBlYXJzIGluIHR5cGljYWwgRW5nbGlzaCB0ZXh0IgogIGJ5bGluZSA9ICJQaWVycmUgUm9tZXJhIgogIHNvdXJjZSA9ICJMZXdhbmQsIENyeXB0b2xvZ2ljYWwgTWF0aGVtYXRpY3MiCiAgc291cmNlVXJsID0gImh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0xldHRlcl9mcmVxdWVuY3kiCiAgbm90ZSA9ICJCYXNlZCBvbiBhbmFseXNpcyBvZiA0MCwwMDAgd29yZHMgZnJvbSBFbmdsaXNoIHByb3NlIgogIGNvbG9yUGFsZXR0ZSA9ICJMb25kb24iCiAgc29ydCA9IGRlc2NlbmRpbmcKCiAgaGlnaGxpZ2h0ICJFIgoKICBkYXRhIHsKICAgICJFIiA9IDEyLjcwCiAgICAiVCIgPSA5LjA2CiAgICAiQSIgPSA4LjE3CiAgICAiTyIgPSA3LjUxCiAgICAiSSIgPSA2Ljk3CiAgICAiTiIgPSA2Ljc1CiAgICAiUyIgPSA2LjMzCiAgICAiSCIgPSA2LjA5CiAgICAiUiIgPSA1Ljk5CiAgICAiRCIgPSA0LjI1CiAgfQp9Cg'

const messages: ChatMessage[] = [
  { role: 'user', name: 'You', text: userPrompt },
  { role: 'asst', name: 'Blueprint Chart', text: 'Reading the dataviz handbook for letter-frequency conventions…' },
  { role: 'asst', name: 'Blueprint Chart', text: 'Drafting the .bpc, sorting by frequency and accenting "E".' },
  { role: 'asst', name: 'Blueprint Chart', text: 'Validated, no parse errors. Here\'s the chart 👇', chart: true },
  { role: 'user', name: 'You', text: 'Love it. Can you export it to a shareable link?' },
  { role: 'asst', name: 'Blueprint Chart', text: 'Exported. Anyone can open this to view and copy the chart.', link: exportLink },
]

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
    <LandingSectionHeader label="01 / Author with AI">
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
          <div
            v-for="(msg, i) in messages"
            :key="i"
            class="landing-mcp__msg"
            :class="{
              'landing-mcp__msg--user': msg.role === 'user',
              'landing-mcp__msg--grouped': messages[i - 1]?.role === msg.role,
            }"
          >
            <span
              v-if="messages[i - 1]?.role !== msg.role"
              class="landing-mcp__avatar"
              :class="`landing-mcp__avatar--${msg.role}`"
            >
              <AppIcon
                :name="msg.role === 'user' ? IPhUser : IPhSparkle"
                size="xs"
                aria-hidden="true"
              />
            </span>
            <span
              v-else
              class="landing-mcp__avatar landing-mcp__avatar--ghost"
              aria-hidden="true"
            />
            <div class="landing-mcp__msg__col">
              <span
                v-if="messages[i - 1]?.role !== msg.role"
                class="landing-mcp__msg__name"
              >{{ msg.name }}</span>
              <div
                class="landing-mcp__bubble"
                :class="`landing-mcp__bubble--${msg.role}`"
              >
                {{ msg.text }}
                <a
                  v-if="msg.link"
                  class="landing-mcp__link"
                  :href="msg.link"
                  target="_blank"
                  rel="noopener noreferrer"
                >{{ msg.link }}</a>
              </div>
              <div
                v-if="msg.chart"
                class="landing-mcp__chart"
              >
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
    min-width: 0; /* allow the grid track to shrink below content width on mobile */

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
    min-width: 0;

    &--user {
      flex-direction: row-reverse;
    }

    /* consecutive messages from the same sender hug the one above */
    &--grouped {
      margin-top: -0.625rem;
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
    min-width: 0;

    &--asst {
      background: var(--bc-tile-bg);
      color: var(--bs-body-color);
      border-radius: 0 var(--bc-radius-md) var(--bc-radius-md) var(--bc-radius-md);
    }

    &--user {
      background: var(--bs-primary-bg-subtle);
      color: var(--bs-primary-text-emphasis);
      border: 1px solid var(--bs-primary-border-subtle);
      border-radius: var(--bc-radius-md) 0 var(--bc-radius-md) var(--bc-radius-md);
      text-wrap: balance;
      text-wrap: pretty;
      max-width: min(20rem, 100%);
    }
  }

  &__link {
    display: block;
    max-width: min(15rem, 100%);
    margin-top: 0.375rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: "Geist Mono", ui-monospace, monospace;
    font-size: var(--bs-font-size-xs);
    color: var(--bs-primary);
    text-decoration: none;

    &:hover,
    &:focus-visible {
      text-decoration: underline;
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
    background: var(--bc-tile-bg);
    padding: 1.125rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-width: 0; /* allow the grid track to shrink below the nowrap install command */

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
      // Brand-mark ink for the step index: Prussian on light (chartreuse can't
      // be a thin figure on white), chartreuse on dark. Matches the eyebrow.
      border: 1.5px solid var(--bc-mark);
      background: var(--bc-tile-bg);
      color: var(--bc-mark);
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
    min-width: 0; /* contain the nowrap command so it scrolls instead of widening the column */
    /* Wrapper is data-bs-theme="dark": give it a dark body so the light
       command text stays readable on the light page. */
    background: var(--bs-body-bg);

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

[data-bs-theme="dark"] .landing-mcp__chat__body {
  background-image: radial-gradient(circle at 0.75rem 0.75rem, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
}

@media (max-width: 51.25rem) {
  .landing-mcp__grid {
    grid-template-columns: 1fr;
  }
}
</style>
