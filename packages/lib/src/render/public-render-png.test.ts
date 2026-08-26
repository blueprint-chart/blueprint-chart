// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { render } from './public-render'

const FRAMED_BPC = `chart bar-vertical {
  title = "Headline here"
  description = "Subtitle here"
  source = "ACME"
  data { "a" = 1 "b" = 2 }
}`

const PNG_SIGNATURE = '89504e470d0a1a0a'

function ihdr(png: Uint8Array): { width: number, height: number } {
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength)
  return { width: view.getUint32(16), height: view.getUint32(20) }
}

function signature(png: Uint8Array): string {
  return Buffer.from(png.subarray(0, 8)).toString('hex')
}

describe('toPng() output (Node env)', () => {
  it('rasterises the frame at the requested size (#7, #9)', async () => {
    const png = await (await render(FRAMED_BPC)).toPng({ width: 800, height: 500 })
    expect(signature(png)).toBe(PNG_SIGNATURE)
    expect(ihdr(png)).toEqual({ width: 800, height: 500 })
  })

  it('a dark render is not byte-identical to a light one (#65)', async () => {
    const light = await (await render(FRAMED_BPC)).toPng({ width: 800, height: 500 })
    const dark = await (await render(FRAMED_BPC, { theme: 'dark' })).toPng({ width: 800, height: 500 })
    expect(signature(dark)).toBe(PNG_SIGNATURE)
    expect(Buffer.compare(Buffer.from(light), Buffer.from(dark))).not.toBe(0)
  })
})
