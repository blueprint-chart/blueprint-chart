<template>
  <div class="export-embed-block">
    <div class="export-embed-block__head">
      <span class="form-label export-embed-block__label">{{ label }}</span>
      <span
        v-if="recommended"
        class="export-embed-block__badge"
      >Recommended</span>
      <span class="export-embed-block__spacer" />
      <slot name="header-action" />
    </div>
    <p class="export-embed-block__note">
      {{ note }}
    </p>
    <pre class="export-embed-block__pre"><code>{{ snippet }}</code></pre>
    <ActionCopyButton
      :text="snippet"
      :label="copyEmbedLabel"
      :variant="emphasis === 'primary' ? 'primary' : 'outline-secondary'"
      size="sm"
    />
    <div class="export-embed-block__actions">
      <ActionCopyButton
        :text="permalink"
        label="Copy permalink"
        variant="outline-secondary"
        size="sm"
      />
      <a
        :href="permalink"
        target="_blank"
        rel="noopener"
        class="btn btn-outline-secondary btn-sm export-embed-block__open"
      >
        <AppIcon
          :name="IPhArrowSquareOut"
          size="sm"
        />
        Open in new tab
      </a>
    </div>
    <div class="export-embed-block__auto-resize">
      <div class="export-embed-block__auto-resize__text">
        <label
          :for="autoResizeId"
          class="form-label export-embed-block__auto-resize__text__title"
        >Auto-resize height</label>
        <p
          :id="autoResizeNoteId"
          class="export-embed-block__auto-resize__text__note"
        >
          Adds a small script so the frame grows to fit the chart. Turn it off if your site strips scripts.
        </p>
      </div>
      <BFormCheckbox
        :id="autoResizeId"
        v-model="autoResize"
        :aria-describedby="autoResizeNoteId"
        class="export-embed-block__auto-resize__switch"
        switch
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue'
import { ActionCopyButton, AppIcon } from '@blueprint-chart/ui'
import IPhArrowSquareOut from '~icons/ph/arrow-square-out'

const autoResize = defineModel<boolean>('autoResize', { required: true })
const autoResizeId = useId()
const autoResizeNoteId = useId()

withDefaults(defineProps<{
  label: string
  note: string
  snippet: string
  permalink: string
  copyEmbedLabel: string
  recommended?: boolean
  emphasis?: 'primary' | 'secondary'
}>(), {
  recommended: false,
  emphasis: 'secondary',
})
</script>

<style scoped lang="scss">
.export-embed-block {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &__head {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  // Appearance comes from the shared .form-label rule; just drop its bottom
  // margin so the title stays centered in the flex header.
  &__label {
    margin-bottom: 0;
  }

  &__badge {
    font-size: var(--bs-font-size-xs);
    font-weight: 700;
    letter-spacing: 0.02em;
    padding: 0.125rem 0.5rem;
    border-radius: 99px;
    background: var(--bs-primary);
    color: var(--bs-body-bg);
  }

  &__spacer {
    flex: 1;
  }

  &__note {
    margin: 0;
    font-size: var(--bs-font-size-sm);
    color: var(--bs-secondary-color);
    line-height: 1.5;
  }

  &__pre {
    margin: 0;
    padding: 0.75rem;
    line-height: 1.5;
    overflow-x: auto;
    border: 1px solid var(--bs-border-color);
    border-radius: var(--bs-border-radius);
    background: var(--bs-body-bg);
    color: var(--bs-body-color);
    white-space: pre;

    code {
      font-size: var(--bs-font-size-sm);
    }
  }

  &__actions {
    display: flex;
    gap: 0.5rem;

    > * {
      flex: 1;
    }
  }

  &__auto-resize {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-top: 0.25rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--bs-border-color);

    &__text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.375rem;

      &__title {
        margin: 0;
      }

      &__note {
        margin: 0;
        font-size: var(--bs-font-size-sm);
        color: var(--bs-secondary-color);
        line-height: 1.5;
      }
    }

    &__switch {
      margin: 0;
    }
  }

  &__open {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
  }
}
</style>
