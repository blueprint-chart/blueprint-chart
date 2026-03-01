import { reactive, toRefs } from 'vue'

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

const state = reactive<ParseOptions>({ ...defaults })

export function useParseOptions() {
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
}
