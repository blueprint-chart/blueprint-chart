// packages/lib/src/render/select-backend.test.ts
import { describe, it, expect, afterEach } from 'vitest'
import { selectBackend } from './public-render'

describe('selectBackend()', () => {
  const realDoc = globalThis.document

  afterEach(() => {
    Object.defineProperty(globalThis, 'document', { value: realDoc, configurable: true, writable: true })
  })

  it('returns the dom backend when a document exists', async () => {
    const backend = await selectBackend()
    expect(backend.kind).toBe('dom')
  })

  it('returns the node backend when no document exists', async () => {
    Object.defineProperty(globalThis, 'document', { value: undefined, configurable: true, writable: true })
    const backend = await selectBackend()
    expect(backend.kind).toBe('node')
  })
})
