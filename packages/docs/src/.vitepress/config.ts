import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Blueprint Chart',
  description:
    'DSL-driven interactive charting library and Vue 3 editor for newsroom storytelling.',
  cleanUrls: true,
  lastUpdated: true,

  markdown: {
    languageAlias: {
      bpc: 'kotlin',
    },
  },

  head: [
    ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
    ['meta', { name: 'theme-color', content: '#2563A0' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:url', content: 'https://docs.blueprintchart.com/' }],
    ['meta', { property: 'og:title', content: 'Blueprint Chart Docs' }],
    [
      'meta',
      {
        property: 'og:description',
        content:
          'Guides, BPC DSL spec, and lib API reference for Blueprint Chart.',
      },
    ],
  ],

  themeConfig: {
    logo: {
      light: '/logo.svg',
      dark: '/logo-dark.svg',
      alt: 'Blueprint Chart',
    },

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'DSL Spec', link: '/spec/dsl' },
      { text: 'API', link: '/api/' },
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
          text: 'Guide',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Embedding Charts', link: '/guide/embed' },
          ],
        },
      ],
      '/spec/': [
        {
          text: 'BPC DSL',
          items: [{ text: 'Language Specification', link: '/spec/dsl' }],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [{ text: 'Overview', link: '/api/' }],
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
      message: 'Released under the MIT License.',
      copyright: '© 2026 Blueprint Chart',
    },

    search: {
      provider: 'local',
    },
  },
})
