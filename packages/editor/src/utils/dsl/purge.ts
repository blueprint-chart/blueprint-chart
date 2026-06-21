import { parse, serialize, compactSerializeDeep } from '@blueprint-chart/lib'

export interface PurgeResult {
  /** True iff the text parses AND at least one default-valued option exists. */
  canPurge: boolean
  /** The minimized DSL, or null when the text does not parse. */
  text: string | null
}

// Pure: decide whether purging would remove anything, and produce the
// minimized text. The redundancy test compares the FULL serialization against
// the deep-compact one so it is independent of the user's raw formatting —
// only the presence of default-valued options makes them differ.
export function computePurge(docText: string): PurgeResult {
  try {
    const ast = parse(docText)
    const text = compactSerializeDeep(ast)
    return { canPurge: serialize(ast) !== text, text }
  }
  catch {
    return { canPurge: false, text: null }
  }
}
