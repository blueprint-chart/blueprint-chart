<script setup lang="ts">
// FIG.06 - the particle ring. A stippled gradient stroke drawn behind a
// crisp-edged slotted child; a frame of honor, one per view. Requires
// <StippleDefs /> present once on the page for the filter to resolve.
withDefaults(defineProps<{
  tone?: 'field' | 'paper'
  radius?: string
}>(), {
  tone: 'field',
  radius: 'var(--bc-radius-lg)',
})
</script>

<template>
  <div
    class="bc-ring"
    :style="{ borderRadius: radius }"
  >
    <svg
      class="bc-ring__stroke"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient
          id="bc-ring-field"
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
          id="bc-ring-paper"
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
      <rect
        x="4.5"
        y="4.5"
        width="calc(100% - 9px)"
        height="calc(100% - 9px)"
        rx="14"
        fill="none"
        :stroke="`url(#bc-ring-${tone})`"
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
  position: relative;
  display: block;

  &__stroke {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
    overflow: visible;
  }

  &__inner {
    position: relative;
    z-index: 1;
  }
}
</style>
