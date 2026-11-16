// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { addDtsExtensions } from './dts-extensions'

const FIXTURE_FILES = [
  'enums.ts',
  'charts/types.ts',
  'runtime/index.ts',
  'dsl/grammar.js',
  'dsl/grammar.d.ts',
]

let src: string

beforeAll(() => {
  src = mkdtempSync(join(tmpdir(), 'dts-extensions-'))
  for (const file of FIXTURE_FILES) {
    const path = join(src, file)
    const dir = join(path, '..')
    mkdirSync(dir, { recursive: true })
    writeFileSync(path, '')
  }
})

afterAll(() => {
  rmSync(src, { recursive: true, force: true })
})

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

  it('adds /index.js to a folder specifier with a trailing slash', () => {
    const content = 'export * from \'./runtime/\';'
    expect(addDtsExtensions(content, src)).toBe('export * from \'./runtime/index.js\';')
  })

  it('adds .js to a specifier pointing at a .js module with a .d.ts', () => {
    const content = 'export type { Grammar } from \'./grammar\';'
    const dslDir = join(src, 'dsl')
    expect(addDtsExtensions(content, dslDir)).toBe('export type { Grammar } from \'./grammar.js\';')
  })

  it('keeps double quotes', () => {
    const content = 'export * from "./enums";'
    expect(addDtsExtensions(content, src)).toBe('export * from "./enums.js";')
  })

  it('rewrites import() type imports relative to the source dir', () => {
    const content = 'type T = import(\'../enums\').T;'
    const dslDir = join(src, 'dsl')
    expect(addDtsExtensions(content, dslDir)).toBe('type T = import(\'../enums.js\').T;')
  })

  it('rewrites side-effect imports', () => {
    const content = 'import \'./enums\';'
    expect(addDtsExtensions(content, src)).toBe('import \'./enums.js\';')
  })

  it('rewrites module augmentations', () => {
    const content = 'declare module \'./charts/types\' {\n}'
    expect(addDtsExtensions(content, src)).toBe('declare module \'./charts/types.js\' {\n}')
  })

  it('rewrites a multi-line export block', () => {
    const content = 'export { a,\n  b,\n} from \'./enums\';'
    expect(addDtsExtensions(content, src)).toBe('export { a,\n  b,\n} from \'./enums.js\';')
  })

  it('leaves a specifier that already has an extension', () => {
    const content = 'export * from \'./runtime/index.js\';'
    expect(addDtsExtensions(content, src)).toBe(content)
  })

  it('throws on a specifier that matches no source module', () => {
    const content = 'export * from \'./does-not-exist\';'
    expect(() => addDtsExtensions(content, src)).toThrow('./does-not-exist')
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
