// Blueprint Chart — VitePress theme entry.
//
// Extends VitePress's default theme and layers the BC brand: Prussian-Blue
// scale, Geist sans/mono for UI + code, DM Serif Display for hero/display
// headings. CSS variable overrides live in `./style.css`.
//
// Also registers <BpcBlock> globally so the markdown-it fence rule can
// emit the Code/Preview switcher without any per-page imports.

import type { App } from 'vue'
import DefaultTheme from 'vitepress/theme'

// Self-hosted webfaces (mirrors editor's `_fonts.scss`).
import '@fontsource-variable/geist/index.css'
import '@fontsource-variable/geist-mono/index.css'
import '@fontsource/dm-serif-display/400.css'

// Shared design tokens (--bs-* / --bc-* CSS custom properties).
// Must load before `./style.css` so the VP-token aliases bridge cleanly.
import '@blueprint-chart/ui/styles/tokens.css'

import './style.css'

// Standalone chart CSS shipped by @blueprint-chart/lib — class names match
// the DOM produced by the chart renderers (.bc-frame, .bc-frame-body, …).
import '@blueprint-chart/lib/charts.scss'

import Layout from './Layout.vue'
import BpcBlock from './components/BpcBlock.vue'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }: { app: App }) {
    app.component('BpcBlock', BpcBlock)
  },
}
