<script setup lang="ts">
import EmptyState from './FeedbackEmptyState.vue'
</script>

<template>
  <Story title="Feedback/FeedbackEmptyState">
    <Variant
      title="Default"
      :init-state="() => ({ message: 'No items found' })"
    >
      <template #default="{ state }">
        <EmptyState :message="state.message" />
      </template>
      <template #controls="{ state }">
        <HstText
          v-model="state.message"
          title="message"
        />
      </template>
    </Variant>
  </Story>
</template>
