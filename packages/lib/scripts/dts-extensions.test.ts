// @vitest-environment node
import { fileURLToPath } from 'node:url'
import { addDtsExtensions } from './dts-extensions'

const src = fileURLToPath(new URL('../src', import.meta.url))

describe('addDtsExtensions', () => {
  it('adds .js to a specifier pointing at a file', () => {
    const content = 'export { a } from \'./enums\';'
    expect(addDtsExtensions(content, src)).toBe('export { a } from \'./enums.js\';')
  })

  it('adds .js to a nested file specifier', () => {
    const content = 'export type { B } from \'./charts/types\';'
    expect(addDtsExtensions(content, src)).toBe('export type { B } from \'./charts/types.js\';')
  })

  it('adds /index.js to a specifier pointing at a folder', () => {
    const content = 'export * from \'./runtime\';'
    expect(addDtsExtensions(content, src)).toBe('export * from \'./runtime/index.js\';')
  })

  it('keeps double quotes', () => {
    const content = 'export * from "./enums";'
    expect(addDtsExtensions(content, src)).toBe('export * from "./enums.js";')
  })

  it('rewrites import() type imports relative to the source dir', () => {
    const content = 'type T = import(\'../enums\').T;'
    const dslDir = `${src}/dsl`
    expect(addDtsExtensions(content, dslDir)).toBe('type T = import(\'../enums.js\').T;')
  })

  it('rewrites a multi-line export block', () => {
    const content = 'export { a,\n  b,\n} from \'./enums\';'
    expect(addDtsExtensions(content, src)).toBe('export { a,\n  b,\n} from \'./enums.js\';')
  })

  it('leaves a specifier that already has an extension', () => {
    const content = 'export * from \'./runtime/index.js\';'
    expect(addDtsExtensions(content, src)).toBe(content)
  })

  it('leaves a specifier that matches no source file', () => {
    const content = 'export * from \'./does-not-exist\';'
    expect(addDtsExtensions(content, src)).toBe(content)
  })

  it('leaves bare specifiers', () => {
    const content = 'import { select } from \'d3\';'
    expect(addDtsExtensions(content, src)).toBe(content)
  })

  it('leaves paths outside import positions', () => {
    const content = '/** see \'./enums\' for values */'
    expect(addDtsExtensions(content, src)).toBe(content)
  })
})
