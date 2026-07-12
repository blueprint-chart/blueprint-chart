<script setup lang="ts">
// FIG.06 - the particle ring. A stippled gradient stroke drawn behind a
// crisp-edged slotted child; a frame of honor, one per view. Requires
// <StippleDefs /> present once on the page for the filter to resolve.
import { useId } from 'vue'

withDefaults(defineProps<{
  tone?: 'field' | 'paper'
  // Hug inline content (a button) instead of filling the row as a block.
  inline?: boolean
}>(), {
  tone: 'field',
  inline: false,
})

// Namespace the gradient ids per instance so two rings on the same page
// (e.g. hero + a future card) never collide over #bc-ring-field/paper.
const uid = useId()
const fieldId = `bc-ring-field-${uid}`
const paperId = `bc-ring-paper-${uid}`
</script>

<template>
  <div
    class="bc-ring"
    :class="{ 'bc-ring--inline': inline }"
  >
    <svg
      class="bc-ring__stroke"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient
          :id="fieldId"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop
            offset="0"
            stop-color="#4B90CF"
          />
          <stop
            offset="0.55"
            stop-color="#4B90CF"
          />
          <stop
            offset="1"
            stop-color="#DDF247"
          />
        </linearGradient>
        <linearGradient
          :id="paperId"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop
            offset="0"
            stop-color="#163A65"
          />
          <stop
            offset="1"
            stop-color="#4B90CF"
          />
        </linearGradient>
      </defs>
      <!-- rx=14 frames a --bc-radius-lg (12px) card from just outside its corner -->
      <rect
        x="4.5"
        y="4.5"
        width="calc(100% - 9px)"
        height="calc(100% - 9px)"
        rx="14"
        fill="none"
        :stroke="`url(#${tone === 'paper' ? paperId : fieldId})`"
        stroke-width="9"
        filter="url(#bc-stipple-a)"
      />
    </svg>
    <div class="bc-ring__inner">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.bc-ring {
  // The stippled stroke sits at the outer edge; the padding is the gap that
  // lets the ring show AROUND the crisp-edged inner content (without it, the
  // inner fill covers the stroke and the ring is invisible).
  --bc-ring-gap: 8px;
  position: relative;
  display: block;
  padding: var(--bc-ring-gap);

  &--inline {
    display: inline-block;
  }

  &__stroke {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
    overflow: visible;

    // Corner radius as a CSS property (overrides the rect's rx attribute where
    // supported) so consumers can match the ring to the radius of the content
    // it frames, e.g. --bc-ring-radius: var(--bc-radius-md) around a button.
    rect {
      rx: var(--bc-ring-radius, 14px);
    }
  }

  &__inner {
    position: relative;
    z-index: 1;
  }
}
</style>
