<template>
  <div
    class="feedback-skeleton"
    :class="{
      'feedback-skeleton--animated': animated,
      'feedback-skeleton--circle': circle,
    }"
    :style="style"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  width?: string
  height?: string
  radius?: string
  circle?: boolean
  animated?: boolean
}>(), {
  width: '100%',
  height: '1rem',
  radius: 'var(--bc-radius-sm)',
  circle: false,
  animated: true,
})

const style = computed(() => ({
  width: props.width,
  height: props.height,
  borderRadius: props.circle ? '50%' : props.radius,
}))
</script>

<style scoped lang="scss">
.feedback-skeleton {
  display: block;
  background: var(--bc-tile-bg-elevated);
  position: relative;
  overflow: hidden;

  &--animated::after {
    content: '';
    position: absolute;
    inset: 0;
    transform: translateX(-100%);
    background: linear-gradient(
      90deg,
      transparent,
      var(--bc-hairline),
      transparent
    );
    animation: feedback-skeleton-shimmer 1.4s ease-in-out infinite;
  }
}

@keyframes feedback-skeleton-shimmer {
  100% {
    transform: translateX(100%);
  }
}

// Respect reduced-motion: drop the sweep, keep a static muted fill.
@media (prefers-reduced-motion: reduce) {
  .feedback-skeleton--animated::after {
    animation: none;
    background: none;
  }
}
</style>
