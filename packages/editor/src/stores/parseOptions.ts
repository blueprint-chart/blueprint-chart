import { reactive, toRefs } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

export interface ParseOptions {
  firstRowIsHeader: boolean
  delimiter: 'auto' | ',' | '\t' | ';' | '|'
  decimalSeparator: '.' | ','
  treatEmptyAsNull: boolean
  trimWhitespace: boolean
}

const defaults: ParseOptions = {
  firstRowIsHeader: true,
  delimiter: 'auto',
  decimalSeparator: '.',
  treatEmptyAsNull: true,
  trimWhitespace: true,
}

export const useParseOptionsStore = defineStore('parseOptions', () => {
  const state = reactive<ParseOptions>({ ...defaults })

  function setOption<K extends keyof ParseOptions>(key: K, value: ParseOptions[K]) {
    state[key] = value
  }

  function reset() {
    Object.assign(state, { ...defaults })
  }

  return {
    ...toRefs(state),
    setOption,
    reset,
  }
})

export function useParseOptions() {
  const store = useParseOptionsStore()
  const {
    firstRowIsHeader,
    delimiter,
    decimalSeparator,
    treatEmptyAsNull,
    trimWhitespace,
  } = storeToRefs(store)
  return {
    firstRowIsHeader,
    delimiter,
    decimalSeparator,
    treatEmptyAsNull,
    trimWhitespace,
    setOption: store.setOption,
    reset: store.reset,
  }
}
