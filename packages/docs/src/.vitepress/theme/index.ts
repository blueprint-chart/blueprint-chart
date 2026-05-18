// Blueprint Chart — VitePress theme entry.
//
// Extends VitePress's default theme and layers the BC brand: Prussian-Blue
// scale, Geist sans/mono for UI + code, DM Serif Display for hero/display
// headings. CSS variable overrides live in `./style.css`.

import DefaultTheme from 'vitepress/theme'

// Self-hosted webfaces (mirrors editor's `_fonts.scss`).
import '@fontsource-variable/geist/index.css'
import '@fontsource-variable/geist-mono/index.css'
import '@fontsource/dm-serif-display/400.css'

import './style.css'

export default {
  extends: DefaultTheme,
}
