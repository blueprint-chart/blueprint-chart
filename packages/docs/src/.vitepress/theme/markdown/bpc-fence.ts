// Blueprint Chart — markdown-it fence override for ```bpc blocks.
//
// Rewraps the default Shiki-highlighted output in a <BpcBlock> wrapper that
// provides a Code/Preview tab switcher in the rendered site. The raw BPC
// source is forwarded as a base64-encoded attribute so multi-line content
// with quotes round-trips safely through HTML.
//
// The shipped highlighted HTML stays untouched and is passed as the default
// slot, so VitePress's syntax-highlighting (via the `bpc` → `kotlin`
// language alias) is preserved verbatim.

import type MarkdownIt from 'markdown-it'

export function installBpcFence(md: MarkdownIt): void {
  const defaultFence = md.renderer.rules.fence
  if (!defaultFence) {
    return
  }

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const info = (token.info || '').trim()
    const highlighted = defaultFence(tokens, idx, options, env, self)

    if (info !== 'bpc') {
      return highlighted
    }

    const source = token.content
    const sourceB64 = Buffer.from(source, 'utf-8').toString('base64')
    return `<BpcBlock source-b64="${sourceB64}">${highlighted}</BpcBlock>`
  }
}
