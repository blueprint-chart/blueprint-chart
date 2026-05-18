import { defineConfig } from 'vitepress'
import { installBpcFence } from './theme/markdown/bpc-fence'

export default defineConfig({
  title: 'Blueprint Chart',
  titleTemplate: ':title — Blueprint Chart',
  description:
    'DSL-driven interactive charting library and Vue 3 editor for newsroom storytelling.',
  cleanUrls: true,
  lastUpdated: true,
  appearance: 'dark',

  markdown: {
    languageAlias: {
      bpc: 'kotlin',
    },
    config(md) {
      installBpcFence(md)
    },
  },

  head: [
    // Favicons
    ['link', { rel: 'icon', href: '/favicon.ico', sizes: '48x48' }],
    ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
    ['link', { rel: 'icon', href: '/favicon-16.png', type: 'image/png', sizes: '16x16' }],
    ['link', { rel: 'icon', href: '/favicon-32.png', type: 'image/png', sizes: '32x32' }],
    ['link', { rel: 'icon', href: '/favicon-48.png', type: 'image/png', sizes: '48x48' }],
    ['link', { rel: 'icon', href: '/favicon-64.png', type: 'image/png', sizes: '64x64' }],
    ['link', { rel: 'icon', href: '/favicon-128.png', type: 'image/png', sizes: '128x128' }],
    ['link', { rel: 'icon', href: '/favicon-192.png', type: 'image/png', sizes: '192x192' }],
    ['link', { rel: 'icon', href: '/favicon-256.png', type: 'image/png', sizes: '256x256' }],
    ['link', { rel: 'icon', href: '/favicon-512.png', type: 'image/png', sizes: '512x512' }],
    ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }],
    ['link', { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#2563A0' }],
    ['link', { rel: 'icon', href: '/android-chrome-192x192.png', type: 'image/png', sizes: '192x192' }],
    ['link', { rel: 'icon', href: '/android-chrome-512x512.png', type: 'image/png', sizes: '512x512' }],
    ['meta', { name: 'msapplication-TileImage', content: '/mstile-150x150.png' }],
    ['meta', { name: 'msapplication-TileColor', content: '#2563A0' }],
    ['meta', { name: 'theme-color', content: '#2563A0' }],

    // Canonical + OG
    ['link', { rel: 'canonical', href: 'https://docs.blueprintchart.com/' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:url', content: 'https://docs.blueprintchart.com/' }],
    ['meta', { property: 'og:title', content: 'Blueprint Chart Docs' }],
    [
      'meta',
      {
        property: 'og:description',
        content:
          'Guides, BPC DSL spec, dataviz handbook, and lib API reference for Blueprint Chart.',
      },
    ],
    ['meta', { property: 'og:image', content: 'https://docs.blueprintchart.com/og-image.png' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:image', content: 'https://docs.blueprintchart.com/og-image.png' }],
  ],

  themeConfig: {
    logo: {
      light: '/logo.svg',
      dark: '/logo-dark.svg',
      alt: 'Blueprint Chart',
    },

    siteTitle: 'Blueprint Chart',

    nav: [
      { text: 'Guide', link: '/guide/getting-started', activeMatch: '^/guide/' },
      { text: 'Charts', link: '/charts/', activeMatch: '^/charts/' },
      { text: 'Handbook', link: '/handbook/', activeMatch: '^/handbook/' },
      { text: 'DSL Spec', link: '/spec/dsl', activeMatch: '^/spec/' },
      { text: 'API', link: '/api/', activeMatch: '^/api/' },
      {
        text: 'Editor',
        link: 'https://blueprintchart.com',
        target: '_blank',
        rel: 'noopener',
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Get started',
          collapsed: false,
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Embedding Charts', link: '/guide/embed' },
          ],
        },
        {
          text: 'Features',
          collapsed: false,
          items: [
            { text: 'Scenes', link: '/guide/scenes' },
            { text: 'Palettes', link: '/guide/palettes' },
            { text: 'Accessibility', link: '/guide/accessibility' },
            { text: 'Data transforms', link: '/guide/data-transforms' },
            { text: 'DSL editor', link: '/guide/dsl-editor' },
          ],
        },
      ],

      '/charts/': [
        {
          text: 'Overview',
          items: [{ text: 'All chart types', link: '/charts/' }],
        },
        {
          text: 'Bar',
          collapsed: false,
          items: [
            { text: 'Bar (vertical)', link: '/charts/bar-vertical' },
            { text: 'Bar (horizontal)', link: '/charts/bar-horizontal' },
            { text: 'Bar (grouped)', link: '/charts/bar-grouped' },
            { text: 'Bar (multi-series)', link: '/charts/bar-multi' },
            { text: 'Bar (split / diverging)', link: '/charts/bar-split' },
            { text: 'Bar (stacked)', link: '/charts/bar-stacked' },
            { text: 'Column (stacked)', link: '/charts/column-stacked' },
          ],
        },
        {
          text: 'Line',
          collapsed: false,
          items: [
            { text: 'Line', link: '/charts/line' },
            { text: 'Line (multi-series)', link: '/charts/line-multi' },
          ],
        },
        {
          text: 'Area',
          collapsed: false,
          items: [
            { text: 'Area', link: '/charts/area' },
            { text: 'Area (stacked)', link: '/charts/area-stacked' },
          ],
        },
        {
          text: 'Part-to-whole',
          collapsed: false,
          items: [
            { text: 'Pie', link: '/charts/pie' },
            { text: 'Donut', link: '/charts/donut' },
          ],
        },
      ],

      '/handbook/': [
        {
          text: 'Dataviz Handbook',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/handbook/' },
            { text: 'Choosing the right chart', link: '/handbook/choosing' },
            { text: 'Design principles', link: '/handbook/design-principles' },
            { text: 'Anti-patterns', link: '/handbook/anti-patterns' },
          ],
        },
        {
          text: 'Frame & layout',
          collapsed: false,
          items: [
            { text: 'Frame elements', link: '/handbook/frame-elements' },
            { text: 'Axes & gridlines', link: '/handbook/axes' },
            { text: 'Labels & legends', link: '/handbook/labels' },
            { text: 'Annotations', link: '/handbook/annotations' },
            { text: 'Tooltips & interaction', link: '/handbook/tooltips' },
          ],
        },
        {
          text: 'Visual language',
          collapsed: false,
          items: [
            { text: 'Typography', link: '/handbook/typography' },
            { text: 'Color & palettes', link: '/handbook/color' },
            { text: 'Accessibility', link: '/handbook/accessibility' },
          ],
        },
      ],

      '/spec/': [
        {
          text: 'BPC DSL',
          items: [
            { text: 'Language Specification', link: '/spec/dsl' },
          ],
        },
      ],

      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/blueprint-chart/blueprint-chart' },
      { icon: 'npm', link: 'https://www.npmjs.com/org/blueprint-chart' },
    ],

    editLink: {
      pattern:
        'https://github.com/blueprint-chart/blueprint-chart/edit/main/packages/docs/src/:path',
      text: 'Edit this page on GitHub',
    },

    footer: {
      message:
        'Released under the MIT License. Built static-first — your data never leaves the page.',
      copyright: '© 2026 Blueprint Chart',
    },

    search: {
      provider: 'local',
      options: {
        detailedView: true,
      },
    },

    outline: {
      level: [2, 3],
      label: 'On this page',
    },

    docFooter: {
      prev: 'Previous',
      next: 'Next',
    },

    lastUpdated: {
      text: 'Last updated',
      formatOptions: {
        dateStyle: 'medium',
      },
    },
  },
})
