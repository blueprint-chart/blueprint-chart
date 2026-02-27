import type { Component, InjectionKey } from 'vue'
import type { ChildEntriesContext } from './useChildEntries'
import type { FormControlDropdownOption } from '../components/Form/FormControl/FormControlDropdown.vue'

export const ButtonGroupEntriesKey: InjectionKey<
  ChildEntriesContext<{ value: string, text: string, iconLeft?: Component, description?: string, visual?: string | Component, icon?: Component }>
> = Symbol('ButtonGroupEntries')

export const DropdownEntriesKey: InjectionKey<
  ChildEntriesContext<FormControlDropdownOption>
> = Symbol('DropdownEntries')

export const PaletteEntriesKey: InjectionKey<
  ChildEntriesContext<{ value: string, label: string, colors: string[] }>
> = Symbol('PaletteEntries')

export const IconRailEntriesKey: InjectionKey<
  ChildEntriesContext<{ value: string, icon: Component, tooltip: string }>
> = Symbol('IconRailEntries')

export const StepperEntriesKey: InjectionKey<
  ChildEntriesContext<{ label: string }>
> = Symbol('StepperEntries')
