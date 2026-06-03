<script setup lang="ts">
import FeedbackSkeleton from './FeedbackSkeleton.vue'
</script>

<template>
  <Story title="Feedback/FeedbackSkeleton">
    <Variant title="Line">
      <FeedbackSkeleton
        width="240px"
        height="1rem"
      />
    </Variant>
    <Variant title="Card placeholder">
      <div style="width: 220px; display: flex; flex-direction: column; gap: 0.5rem;">
        <FeedbackSkeleton
          width="100%"
          height="152px"
          radius="var(--bc-radius-md)"
        />
        <FeedbackSkeleton
          width="70%"
          height="0.9rem"
        />
        <FeedbackSkeleton
          width="45%"
          height="0.7rem"
        />
      </div>
    </Variant>
    <Variant title="Static (no animation)">
      <FeedbackSkeleton
        width="240px"
        height="1rem"
        :animated="false"
      />
    </Variant>
  </Story>
</template>
