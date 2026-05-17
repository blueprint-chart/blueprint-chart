<template>
  <div class="oss">
    <LandingSection
      id="open-source"
      full
    >
      <div class="oss__grid">
        <div>
          <LandingSectionHeader label="Open source">
            Free forever.<br><em>No strings attached.</em>
            <template #lead>
              Blueprint Chart is MIT-licensed and community-driven.
              No paywalls, no watermarks, no data lock-in. You own your charts.
            </template>
          </LandingSectionHeader>
          <p class="oss__detail">
            Built by journalists, for journalists. Every feature is driven by real newsroom needs —
            from data desks to local reporters working alone.
          </p>
          <div class="oss__badges">
            <span class="oss-badge oss-badge--green">
              <AppIcon
                :name="IPhScales"
                size="xs"
              />
              MIT License
            </span>
            <span class="oss-badge oss-badge--dark">
              <AppIcon
                :name="IPhGithubLogo"
                size="xs"
              />
              View on GitHub
            </span>
          </div>
        </div>
        <div class="oss__stats">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="oss-stat"
          >
            <div class="oss-stat__num">
              {{ stat.value }}
            </div>
            <div class="oss-stat__label">
              {{ stat.label }}
            </div>
          </div>
        </div>
      </div>
    </LandingSection>
  </div>
</template>

<script setup lang="ts">
import { AppIcon } from '@blueprint-chart/ui'
import IPhScales from '~icons/ph/scales'
import IPhGithubLogo from '~icons/ph/github-logo'

const stats = [
  { value: 'MIT', label: 'Open source license' },
  { value: '0\u20AC', label: 'Cost to use, forever' },
  { value: 'D3', label: 'Rendering engine' },
  { value: '\u221E', label: 'Charts you can create' },
]
</script>

<style scoped lang="scss">
.oss {
  background: var(--bc-content-bg);
  border-top: 1px solid var(--bs-border-color);
  border-bottom: 1px solid var(--bs-border-color);

  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3.75rem;
    align-items: center;
  }

  &__detail {
    font-size: var(--bs-font-size-md);
    color: var(--bs-secondary-color);
    line-height: 1.7;
    max-width: 30rem;
  }

  &__badges {
    display: flex;
    gap: 0.625rem;
    margin-top: 1.5rem;
    flex-wrap: wrap;
  }

  &__stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
}

.oss-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.875rem;
  border-radius: var(--bc-radius-md);
  font-size: var(--bs-font-size-sm);
  font-weight: 700;

  &--green {
    background: var(--bs-success);
    color: #fff;
  }

  &--dark {
    background: var(--bs-dark);
    color: #fff;
  }
}

.oss-stat {
  background: var(--bc-tile-bg);
  border: 1px solid var(--bc-hairline);
  border-radius: var(--bc-radius-md);
  padding: 1.25rem;

  &__num {
    font-family: 'DM Serif Display', serif;
    font-size: 2.25rem;
    font-weight: 400;
    color: var(--bs-body-color);
    line-height: 1;
    margin-bottom: 0.25rem;
  }

  &__label {
    font-size: var(--bs-font-size-sm);
    color: var(--bs-secondary-color);
  }
}

@media (max-width: 51.25rem) {
  .oss {
    &__grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
