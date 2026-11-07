<script setup lang="ts">
import { computed } from 'vue'
import { FeedbackSkeleton } from '@blueprint-chart/ui'

const props = withDefaults(defineProps<{ bare?: boolean }>(), { bare: false })

const rootClass = computed(() => ({ 'export-article--bare': props.bare }))

const headerBars = [
  { width: '18%', height: '0.5rem' },
  { width: '92%', height: '1.25rem' },
  { width: '70%', height: '1.25rem' },
  { width: '85%', height: '0.625rem' },
  { width: '30%', height: '0.5rem' },
]
const paragraphLines = ['100%', '100%', '75%']
</script>

<template>
  <div
    class="export-article"
    :class="rootClass"
  >
    <div
      v-if="!bare"
      class="export-article__header"
    >
      <FeedbackSkeleton
        v-for="(bar, i) in headerBars"
        :key="i"
        :width="bar.width"
        :height="bar.height"
        :animated="false"
      />
    </div>
    <template v-if="!bare">
      <div
        v-for="n in 2"
        :key="`before-${n}`"
        class="export-article__paragraph"
      >
        <FeedbackSkeleton
          v-for="(w, i) in paragraphLines"
          :key="i"
          :width="w"
          height="0.625rem"
          :animated="false"
        />
      </div>
    </template>
    <slot />
    <div
      v-if="!bare"
      class="export-article__paragraph"
    >
      <FeedbackSkeleton
        v-for="(w, i) in paragraphLines"
        :key="i"
        :width="w"
        height="0.625rem"
        :animated="false"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.export-article {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 680px;
  margin: 0 auto;

  &--bare {
    display: contents;
  }

  &__header,
  &__paragraph {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
