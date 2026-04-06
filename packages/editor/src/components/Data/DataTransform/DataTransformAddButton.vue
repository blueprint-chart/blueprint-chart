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
        class="add-wrap__dropdown__item"
        :disabled="opt.disabled"
        @click="onSelect(opt.value)"
      >
        <span
          class="add-wrap__dropdown__item__icon"
          :class="iconClass(opt.value)"
        >{{ iconFallback(opt.value) }}</span>
        <div class="add-wrap__dropdown__item__text">
          <div class="add-wrap__dropdown__item__text__name">
            {{ opt.label }}
          </div>
          <div class="add-wrap__dropdown__item__text__desc">
            {{ opt.desc }}
          </div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ButtonAdd } from '@blueprint-chart/ui'
import { TransformType } from '@/enums'

const emit = defineEmits<{
  add: [type: string]
}>()

const showMenu = shallowRef(false)

const options = [
  { value: TransformType.Sort, label: 'Sort', desc: 'Reorder rows by column values', disabled: false },
  { value: TransformType.Filter, label: 'Filter', desc: 'Keep or exclude rows by condition', disabled: false },
  { value: TransformType.HideColumns, label: 'Hide Columns', desc: 'Remove columns from output', disabled: false },
  { value: TransformType.Transpose, label: 'Transpose', desc: 'Swap rows and columns', disabled: false },
  { value: TransformType.Parse, label: 'Parse', desc: 'Transform column values', disabled: false },
  { value: TransformType.Rename, label: 'Rename Column', desc: 'Change a column name', disabled: false },
  { value: TransformType.GroupBy, label: 'Group By', desc: 'Aggregate rows by column values', disabled: false },
  { value: TransformType.Computed, label: 'Computed Column', desc: 'Derive new column (coming soon)', disabled: true },
]

function iconClass(type: string): string {
  const map: Record<string, string> = {
    [TransformType.Sort]: 'add-wrap__dropdown__item__icon--sort',
    [TransformType.Filter]: 'add-wrap__dropdown__item__icon--filter',
    [TransformType.HideColumns]: 'add-wrap__dropdown__item__icon--hide-columns',
    [TransformType.Transpose]: 'add-wrap__dropdown__item__icon--transpose',
    [TransformType.Parse]: 'add-wrap__dropdown__item__icon--parse',
    [TransformType.Rename]: 'add-wrap__dropdown__item__icon--rename',
    [TransformType.GroupBy]: 'add-wrap__dropdown__item__icon--group',
    [TransformType.Computed]: 'add-wrap__dropdown__item__icon--computed',
  }
  return map[type] ?? ''
}

function iconFallback(type: string): string {
  const map: Record<string, string> = {
    [TransformType.Sort]: 'S',
    [TransformType.Filter]: 'F',
    [TransformType.HideColumns]: 'H',
    [TransformType.Transpose]: 'T',
    [TransformType.Parse]: 'P',
    [TransformType.Rename]: 'R',
    [TransformType.GroupBy]: 'G',
    [TransformType.Computed]: 'C',
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

  &__dropdown {
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

    &__item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      cursor: pointer;
      font-size: var(--bs-font-size-sm);
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

      &__icon {
        width: 1.5rem;
        height: 1.5rem;
        border-radius: 0.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--bs-font-size-sm);
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
          background: var(--bs-primary-bg-subtle);
          color: var(--bs-primary-text-emphasis);
        }

        &--group {
          background: hsl(270 90% 95%);
          color: hsl(270 70% 50%);
        }

        &--computed {
          background: var(--bs-info-bg-subtle);
          color: var(--bs-info-text-emphasis);
        }
      }

      &__text {
        flex: 1;

        &__name {
          font-weight: 600;
          color: var(--bs-body-color);
        }

        &__desc {
          font-size: var(--bs-font-size-xs);
          color: var(--bs-secondary-color);
        }
      }
    }
  }
}
</style>
