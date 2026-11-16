// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { findUntypedDependencies } from './dts-dependencies'

const MANIFESTS: Record<string, object> = {
  'package.json': {
    dependencies: { 'typed': '1', 'untyped': '1', '@scope/typed': '1', 'covered': '1', '@types/covered': '1' },
    optionalDependencies: { 'optional-typed': '1' },
    devDependencies: { 'dev-only': '1' },
  },
  'node_modules/typed/package.json': { types: './index.d.ts' },
  'node_modules/@scope/typed/package.json': { typings: './index.d.ts' },
  'node_modules/optional-typed/package.json': {},
  'node_modules/untyped/package.json': {},
  'node_modules/covered/package.json': {},
  'node_modules/dev-only/package.json': { types: './index.d.ts' },
}

let packageDir: string

beforeAll(() => {
  packageDir = mkdtempSync(join(tmpdir(), 'dts-dependencies-'))
  for (const [file, manifest] of Object.entries(MANIFESTS)) {
    const path = join(packageDir, file)
    const dir = join(path, '..')
    mkdirSync(dir, { recursive: true })
    writeFileSync(path, JSON.stringify(manifest))
  }
  writeFileSync(join(packageDir, 'node_modules/optional-typed/index.d.ts'), '')
})

afterAll(() => {
  rmSync(packageDir, { recursive: true, force: true })
})

describe('findUntypedDependencies', () => {
  it('accepts a dependency that ships its own types', () => {
    const contents = ['import { a } from \'typed\';']
    expect(findUntypedDependencies(contents, packageDir)).toEqual([])
  })

  it('accepts a scoped dependency imported through a subpath', () => {
    const contents = ['import { a } from \'@scope/typed/sub\';']
    expect(findUntypedDependencies(contents, packageDir)).toEqual([])
  })

  it('accepts an optional dependency with an index.d.ts', () => {
    const contents = ['type T = import(\'optional-typed\').T;']
    expect(findUntypedDependencies(contents, packageDir)).toEqual([])
  })

  it('accepts an untyped dependency whose @types package is a dependency', () => {
    const contents = ['import { a } from \'covered\';']
    expect(findUntypedDependencies(contents, packageDir)).toEqual([])
  })

  it('reports an untyped dependency without its @types package', () => {
    const contents = ['import { a } from \'untyped\';']
    expect(findUntypedDependencies(contents, packageDir)).toEqual(['untyped ships no types and @types/untyped is not a dependency'])
  })

  it('reports a package that is only a dev dependency', () => {
    const contents = ['import { a } from \'dev-only\';']
    expect(findUntypedDependencies(contents, packageDir)).toEqual(['dev-only is imported by the published types but is not a dependency'])
  })

  it('ignores relative imports', () => {
    const contents = ['export * from \'./enums.js\';']
    expect(findUntypedDependencies(contents, packageDir)).toEqual([])
  })

  it('reports each package once', () => {
    const contents = ['import { a } from \'untyped\';', 'import { b } from \'untyped\';']
    expect(findUntypedDependencies(contents, packageDir)).toHaveLength(1)
  })
})
