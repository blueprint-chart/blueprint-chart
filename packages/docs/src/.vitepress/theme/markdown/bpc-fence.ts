// Blueprint Chart markdown-it fence override for ```bpc blocks.
//
// Rewraps the default Shiki-highlighted output in a <BpcBlock> wrapper that
// provides a Code/Preview tab switcher in the rendered site. The raw BPC
// source is forwarded as a base64-encoded attribute so multi-line content
// with quotes round-trips safely through HTML.
//
// Docs also default the brand look (blueprint-bold theme + BlueprintBold
// palette) onto samples that do not pick their own, by rewriting the fence
// source before highlighting so the shown code matches the live preview.
// A fence opts out with `bpc plain`; a page opts out with `bpcBrandDefault:
// false` in its frontmatter; a fence that already sets theme/colorPalette is
// left untouched.

import type MarkdownIt from 'markdown-it'
import { declaresPaletteOrTheme, injectBrandDefault } from './brand-default'

export function installBpcFence(md: MarkdownIt): void {
  const defaultFence = md.renderer.rules.fence
  if (!defaultFence) {
    return
  }

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const info = (token.info || '').trim()
    const parts = info.split(/\s+/)
    const lang = parts[0]

    if (lang !== 'bpc') {
      return defaultFence(tokens, idx, options, env, self)
    }

    const pageOptOut = (env as { frontmatter?: Record<string, unknown> })?.frontmatter?.bpcBrandDefault === false
    const fenceOptOut = parts.slice(1).includes('plain')

    if (!pageOptOut && !fenceOptOut && !declaresPaletteOrTheme(token.content)) {
      // Rewrite the token content so BOTH the highlighted code and the
      // forwarded preview source reflect the injected brand default.
      token.content = injectBrandDefault(token.content)
    }

    const highlighted = defaultFence(tokens, idx, options, env, self)
    const sourceB64 = Buffer.from(token.content, 'utf-8').toString('base64')
    return `<BpcBlock source-b64="${sourceB64}">${highlighted}</BpcBlock>`
  }
}
