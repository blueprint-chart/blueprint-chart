<script setup lang="ts">
import { computed } from 'vue'
import { FeedbackSkeleton } from '@blueprint-chart/ui'

const props = withDefaults(defineProps<{ bare?: boolean }>(), { bare: false })

const rootClass = computed(() => ({ 'export-article--bare': props.bare }))

const MASTHEAD_LINK_WIDTHS = ['2.5rem', '3rem', '2.25rem']

const BODY_PARAGRAPHS = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus, posuere velit aliquet. Donec ullamcorper nulla non metus auctor fringilla, vestibulum id ligula porta felis euismod semper.',
  'Maecenas sed diam eget risus varius blandit sit amet non magna. Cras mattis consectetur purus sit amet fermentum, nullam quis risus eget urna mollis ornare vel eu leo.',
]
</script>

<template>
  <div
    class="export-article"
    :class="rootClass"
  >
    <div
      v-if="!bare"
      class="export-article__masthead"
      aria-hidden="true"
    >
      <FeedbackSkeleton
        width="6rem"
        height="0.875rem"
        :animated="false"
      />
      <div class="export-article__masthead__links">
        <FeedbackSkeleton
          v-for="(width, index) in MASTHEAD_LINK_WIDTHS"
          :key="index"
          :width="width"
          height="0.5rem"
          :animated="false"
        />
      </div>
    </div>
    <div class="export-article__column">
      <div
        v-if="!bare"
        class="export-article__column__header"
        aria-hidden="true"
      >
        <p class="export-article__column__header__kicker">
          World
        </p>
        <p class="export-article__column__header__headline">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit
        </p>
        <p class="export-article__column__header__standfirst">
          Sed posuere consectetur est at lobortis, aenean eu leo quam pellentesque ornare sem lacinia quam venenatis.
        </p>
        <p class="export-article__column__header__byline">
          By Jane Doe · 6 min read
        </p>
      </div>
      <slot />
      <template v-if="!bare">
        <p
          v-for="(paragraph, index) in BODY_PARAGRAPHS"
          :key="index"
          class="export-article__column__paragraph"
          aria-hidden="true"
        >
          {{ paragraph }}
        </p>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
$export-article-serif: Georgia, "Times New Roman", serif;

.export-article {
  width: 100%;
  min-width: min-content;
  max-width: 960px;
  margin: 0 auto;
  padding-bottom: 2.5rem;
  background: var(--bs-body-bg);
  border-radius: var(--bc-frame-radius);
  box-shadow: var(--bs-box-shadow-sm);

  &--bare {
    display: contents;
  }

  &__masthead,
  &__column__header,
  &__column__paragraph {
    color: color-mix(in srgb, var(--bs-body-color) 50%, transparent);
    user-select: none;
  }

  &__masthead {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid color-mix(in srgb, var(--bs-body-color) 9%, transparent);

    &__links {
      display: flex;
      gap: 1rem;
    }
  }

  &__column {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    box-sizing: content-box;
    min-width: min-content;
    max-width: 680px;
    margin: 0 auto;
    padding: 2rem 1.5rem 0;

    .export-article--bare & {
      display: contents;
    }

    &__header {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      &__kicker {
        margin: 0;
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      &__headline {
        margin: 0;
        font-family: $export-article-serif;
        font-size: clamp(1.5rem, 4vw, 2.125rem);
        font-weight: 700;
        line-height: 1.15;
        text-wrap: balance;
      }

      &__standfirst {
        margin: 0;
        font-family: $export-article-serif;
        font-size: 1.125rem;
        line-height: 1.45;
      }

      &__byline {
        margin: 0;
        font-size: 0.8125rem;
      }
    }

    &__paragraph {
      margin: 0;
      font-family: $export-article-serif;
      font-size: 1rem;
      line-height: 1.65;
    }
  }
}
</style>
