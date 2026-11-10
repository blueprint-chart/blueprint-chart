<template>
  <div class="editor-overlay-item">
    <div class="editor-overlay-item__header">
      <small class="editor-overlay-item__header__title">{{ heading }}</small>
      <div class="editor-overlay-item__header__actions">
        <ButtonIcon
          :icon-left="visibilityIcon"
          :label="visibilityLabel"
          variant="link"
          size="sm"
          hide-label
          @click="toggleHidden"
        />
        <ButtonIcon
          :icon-left="IPhTrash"
          label="Delete overlay"
          variant="link"
          size="sm"
          hide-label
          @click="$emit('remove')"
        />
      </div>
    </div>

    <div class="editor-overlay-item__body">
      <FormControlButtonGroup
        v-model="kind"
        label="Type"
        :options="kindOptions"
        block
      />

      <FormControlDropdown
        v-for="(slot, i) in columnSlots"
        :id="`overlay-column-${id}-${i}`"
        :key="slot.label"
        :model-value="overlay.columns[i]"
        :label="slot.label"
        :options="columnOptions"
        block
        @update:model-value="(v) => setColumn(i, v)"
      />

      <FormControlTextInput
        :id="`overlay-title-${id}`"
        v-model="title"
        label="Title"
        :placeholder="defaultTitle"
      />

      <FormControlColorInput
        :id="`overlay-color-${id}`"
        v-model="color"
        label="Color"
      />

      <FormControlSliderInput
        :id="`overlay-opacity-${id}`"
        v-model="opacity"
        label="Opacity"
        suffix="%"
      />

      <FormControlButtonGroup
        v-if="isRange"
        v-model="pattern"
        label="Pattern"
        :options="patternOptions"
        block
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OverlayConfig } from '@blueprint-chart/lib'
import {
  ButtonIcon,
  FormControlButtonGroup,
  FormControlColorInput,
  FormControlDropdown,
  FormControlSliderInput,
  FormControlTextInput,
} from '@blueprint-chart/ui'
import { nextOverlayColumn } from '@/utils/chart/overlayColumns'
import IPhEye from '~icons/ph/eye'
import IPhEyeSlash from '~icons/ph/eye-slash'
import IPhTrash from '~icons/ph/trash'

const DEFAULT_COLOR = '#6c757d'
const DEFAULT_VALUE_OPACITY = 100
const DEFAULT_RANGE_OPACITY = 30

const props = defineProps<{
  id: number
  columns: string[]
  claimed?: string[]
}>()

defineEmits<{
  remove: []
}>()

const overlay = defineModel<OverlayConfig>('overlay', { required: true })

const kindOptions = [
  { value: 'value', text: 'Value' },
  { value: 'range', text: 'Range' },
]

const patternOptions = [
  { value: 'solid', text: 'Solid' },
  { value: 'stripes', text: 'Stripes' },
]

const isRange = computed(() => overlay.value.columns.length === 2)
const defaultOpacity = computed(() => isRange.value ? DEFAULT_RANGE_OPACITY : DEFAULT_VALUE_OPACITY)
const defaultTitle = computed(() => overlay.value.columns.join(isRange.value ? ' to ' : ''))
const heading = computed(() => overlay.value.title ?? defaultTitle.value)
const columnOptions = computed(() => props.columns.map(name => ({ value: name, label: name })))
const columnSlots = computed(() => isRange.value ? [{ label: 'From' }, { label: 'To' }] : [{ label: 'Column' }])
const visibilityIcon = computed(() => overlay.value.hidden ? IPhEyeSlash : IPhEye)
const visibilityLabel = computed(() => overlay.value.hidden ? 'Show overlay' : 'Hide overlay')

function update(key: keyof OverlayConfig, value: unknown) {
  const copy: Record<string, unknown> = { ...overlay.value }
  if (value === undefined) {
    delete copy[key]
  }
  else {
    copy[key] = value
  }
  overlay.value = copy as unknown as OverlayConfig
}

function setColumn(index: number, name: string) {
  const next = [...overlay.value.columns]
  next[index] = name
  update('columns', next)
}

function switchKind(next: string) {
  const [first] = overlay.value.columns
  if (next === 'value') {
    const { pattern: _pattern, ...rest } = overlay.value
    overlay.value = { ...rest, columns: [first] }
    return
  }
  const claimed = [...(props.claimed ?? []), ...overlay.value.columns]
  const unused = nextOverlayColumn(props.columns, claimed)
  if (unused) {
    update('columns', [first, unused])
  }
}

function toggleHidden() {
  update('hidden', overlay.value.hidden ? undefined : true)
}

const kind = computed({
  get: () => isRange.value ? 'range' : 'value',
  set: switchKind,
})

const title = computed({
  get: () => overlay.value.title ?? '',
  set: v => update('title', v || undefined),
})

const color = computed({
  get: () => overlay.value.color ?? DEFAULT_COLOR,
  set: v => update('color', v),
})

const opacity = computed({
  get: () => overlay.value.opacity ?? defaultOpacity.value,
  set: v => update('opacity', Number(v)),
})

const pattern = computed({
  get: () => overlay.value.pattern ?? 'solid',
  set: v => update('pattern', v),
})
</script>

<style scoped lang="scss">
.editor-overlay-item {
  display: flex;
  flex-direction: column;
  border: var(--bs-border-width) solid var(--bs-border-color);
  border-radius: var(--bs-border-radius);
  background-color: var(--bs-tertiary-bg);
  overflow: hidden;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.25rem 0.5rem;
    border-bottom: var(--bs-border-width) solid var(--bs-border-color);

    &__title {
      font-weight: var(--bs-font-weight-medium, 500);
    }

    &__actions {
      display: flex;
      align-items: center;
    }
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem;
  }
}
</style>
