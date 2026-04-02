import type { Component } from 'vue'
import type { TransformType } from '@/stores/dataTransforms'
import IPhSortAscending from '~icons/ph/sort-ascending'
import IPhFunnel from '~icons/ph/funnel'
import IPhArrowsClockwise from '~icons/ph/arrows-clockwise'
import IPhEyeSlash from '~icons/ph/eye-slash'
import IPhWrench from '~icons/ph/wrench'
import IPhPencilSimple from '~icons/ph/pencil-simple'
import IPhStack from '~icons/ph/stack'

interface StepMeta {
  iconClass: string
  iconComponent?: Component
  fallback: string
  label: string
}

export const stepMeta: Record<TransformType, StepMeta> = {
  'sort': { iconClass: 'step-card__body__icon--sort', iconComponent: IPhSortAscending, fallback: 'S', label: 'Sort' },
  'filter': { iconClass: 'step-card__body__icon--filter', iconComponent: IPhFunnel, fallback: 'F', label: 'Filter' },
  'hide-columns': { iconClass: 'step-card__body__icon--hide-columns', iconComponent: IPhEyeSlash, fallback: 'H', label: 'Hide Columns' },
  'transpose': { iconClass: 'step-card__body__icon--transpose', iconComponent: IPhArrowsClockwise, fallback: 'T', label: 'Transpose' },
  'parse': { iconClass: 'step-card__body__icon--parse', iconComponent: IPhWrench, fallback: 'P', label: 'Parse' },
  'rename': { iconClass: 'step-card__body__icon--rename', iconComponent: IPhPencilSimple, fallback: 'R', label: 'Rename' },
  'group-by': { iconClass: 'step-card__body__icon--group', iconComponent: IPhStack, fallback: 'G', label: 'Group By' },
  'computed': { iconClass: 'step-card__body__icon--computed', fallback: 'C', label: 'Computed' },
}
