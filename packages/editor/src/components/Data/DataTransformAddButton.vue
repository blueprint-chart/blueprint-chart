<template>
  <div class="add-wrap">
    <ButtonAdd
      label="Add"
      @click="showMenu = !showMenu"
    />
    <div
      v-if="showMenu"
      class="add-wrap__dropdown"
    >
      <button
        v-for="opt in options"
        :key="opt.value"
        class="add-wrap__dropdown-item"
        :disabled="opt.disabled"
        @click="onSelect(opt.value)"
      >
        <span
          class="add-wrap__dropdown-icon"
          :class="iconClass(opt.value)"
        >{{ iconFallback(opt.value) }}</span>
        <div class="add-wrap__dropdown-text">
          <div class="add-wrap__dropdown-name">
            {{ opt.label }}
          </div>
          <div class="add-wrap__dropdown-desc">
            {{ opt.desc }}
          </div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ButtonAdd } from '@blueprint-chart/ui'

const emit = defineEmits<{
  add: [type: string]
}>()

const showMenu = ref(false)

const options = [
  { value: 'sort', label: 'Sort', desc: 'Reorder rows by column values', disabled: false },
  { value: 'filter', label: 'Filter', desc: 'Keep or exclude rows by condition', disabled: false },
  { value: 'hide-columns', label: 'Hide Columns', desc: 'Remove columns from output', disabled: false },
  { value: 'transpose', label: 'Transpose', desc: 'Swap rows and columns', disabled: false },
  { value: 'parse', label: 'Parse', desc: 'Transform column values', disabled: false },
  { value: 'rename', label: 'Rename Column', desc: 'Change a column name', disabled: false },
  { value: 'group-by', label: 'Group By', desc: 'Aggregate rows (coming soon)', disabled: true },
  { value: 'computed', label: 'Computed Column', desc: 'Derive new column (coming soon)', disabled: true },
  { value: 'pivot', label: 'Pivot', desc: 'Reshape wide/long (coming soon)', disabled: true },
]

function iconClass(type: string): string {
  const map: Record<string, string> = {
    'sort': 'add-wrap__dropdown-icon--sort',
    'filter': 'add-wrap__dropdown-icon--filter',
    'hide-columns': 'add-wrap__dropdown-icon--hide-columns',
    'transpose': 'add-wrap__dropdown-icon--transpose',
    'parse': 'add-wrap__dropdown-icon--parse',
    'rename': 'add-wrap__dropdown-icon--rename',
    'group-by': 'add-wrap__dropdown-icon--group',
    'computed': 'add-wrap__dropdown-icon--computed',
    'pivot': 'add-wrap__dropdown-icon--pivot',
  }
  return map[type] ?? ''
}

function iconFallback(type: string): string {
  const map: Record<string, string> = {
    'sort': 'S',
    'filter': 'F',
    'hide-columns': 'H',
    'transpose': 'T',
    'parse': 'P',
    'rename': 'R',
    'group-by': 'G',
    'computed': 'C',
    'pivot': 'P',
  }
  return map[type] ?? '?'
}

function onSelect(type: string) {
  emit('add', type)
  showMenu.value = false
}
</script>

<style scoped lang="scss">
.add-wrap {
  position: relative;
}

.add-wrap__dropdown {
  position: absolute;
  left: 0;
  right: 0;
  top: 100%;
  background: var(--bs-body-bg);
  border: 1px solid var(--bs-border-color);
  border-radius: var(--bs-border-radius);
  box-shadow: var(--bs-box-shadow);
  z-index: 50;
  margin-top: 0.25rem;
}

.add-wrap__dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  font-size: 0.75rem;
  transition: background 0.1s;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  color: var(--bs-body-color);
  font-family: inherit;

  &:hover:not(:disabled) {
    background: var(--bs-tertiary-bg);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.add-wrap__dropdown-icon {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;

  &--sort {
    background: var(--bs-warning-bg-subtle);
    color: var(--bs-warning-text-emphasis);
  }

  &--filter {
    background: var(--bs-danger-bg-subtle);
    color: var(--bs-danger-text-emphasis);
  }

  &--hide-columns {
    background: var(--bs-secondary-bg);
    color: var(--bs-secondary-text-emphasis);
  }

  &--transpose {
    background: var(--bs-info-bg-subtle);
    color: var(--bs-info-text-emphasis);
  }

  &--parse {
    background: var(--bs-success-bg-subtle);
    color: var(--bs-success-text-emphasis);
  }

  &--rename {
    background: var(--bs-warning-bg-subtle);
    color: var(--bs-warning-text-emphasis);
  }

  &--group {
    background: hsl(270 90% 95%);
    color: hsl(270 70% 50%);
  }

  &--computed {
    background: var(--bs-info-bg-subtle);
    color: var(--bs-info-text-emphasis);
  }

  &--pivot {
    background: hsl(30 100% 93%);
    color: hsl(25 90% 48%);
  }
}

.add-wrap__dropdown-text {
  flex: 1;
}

.add-wrap__dropdown-name {
  font-weight: 600;
  color: var(--bs-body-color);
}

.add-wrap__dropdown-desc {
  font-size: 0.6875rem;
  color: var(--bs-secondary-color);
}
</style>
