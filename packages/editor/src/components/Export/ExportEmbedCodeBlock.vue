<template>
  <div class="code-block">
    <div class="code-block__header">
      <span class="code-block__step">{{ step }}</span>
      <span class="code-block__label">{{ label }}</span>
      <ActionCopyButton
        :text="code"
        label="Copy"
        variant="outline-secondary"
        size="sm"
      />
    </div>
    <pre class="code-block__pre"><code
v-if="highlightedHtml"
                                       v-html="highlightedHtml"
    /><code v-else>{{ code }}</code></pre>
  </div>
</template>

<script setup lang="ts">
import { ActionCopyButton } from '@blueprint-chart/ui'
import '@/dsl-lang/highlight.scss'

defineProps<{
  step: number
  label: string
  code: string
  highlightedHtml?: string
}>()
</script>

<style scoped lang="scss">
.code-block {
  border: 1px solid var(--bs-border-color);
  border-radius: var(--bs-border-radius);
  overflow: hidden;
}

.code-block__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--bs-tertiary-bg);
  border-bottom: 1px solid var(--bs-border-color);
}

.code-block__step {
  width: 1.375rem;
  height: 1.375rem;
  border-radius: 50%;
  background: var(--bs-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--bs-font-size-xs);
  font-weight: 700;
  flex-shrink: 0;
}

.code-block__label {
  flex: 1;
  font-size: var(--bs-body-font-size);
  font-weight: 600;
  color: var(--bs-body-color);
}

.code-block__pre {
  margin: 0;
  padding: 0.75rem;
  font-size: var(--bs-body-font-size);
  line-height: 1.5;
  overflow-x: auto;
  background: var(--bs-body-bg);
  color: var(--bs-body-color);

  code {
    white-space: pre-wrap;
    word-break: break-all;
  }
}
</style>
