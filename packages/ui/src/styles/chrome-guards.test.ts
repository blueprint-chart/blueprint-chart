// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../../', import.meta.url))

const SCAN_ROOTS = ['ui/src', 'editor/src', 'docs/src/.vitepress']
const EXTRA_FILES = ['editor/index.html']
const SOURCE_EXT = /\.(vue|scss|css|ts)$/
const SKIPPED_FILE = /\.(test\.ts|story\.vue)$/
const SKIPPED_PATHS = ['assets/chart-thumbnails', 'assets/images']
const SKIPPED_SEGMENTS = ['node_modules', 'dist', 'cache']

function isSkipped(path: string) {
  const rel = path.split(sep).join('/')
  return SKIPPED_PATHS.some(skipped => rel.includes(skipped))
    || rel.split('/').some(segment => SKIPPED_SEGMENTS.includes(segment))
}

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (isSkipped(path)) {
      return []
    }
    return entry.isDirectory() ? walk(path) : [path]
  })
}

function sourceFiles() {
  return SCAN_ROOTS
    .flatMap(scanRoot => walk(join(root, scanRoot)))
    .filter(path => SOURCE_EXT.test(path) && !SKIPPED_FILE.test(path))
    .map(path => relative(root, path).split(sep).join('/'))
    .concat(EXTRA_FILES)
}

function offenders(allowlist: string[], pattern: RegExp) {
  return sourceFiles()
    .filter(file => !allowlist.some(allowed => file.startsWith(allowed)))
    .filter(file => pattern.test(readFileSync(join(root, file), 'utf8')))
}

describe('walker', () => {
  it('skips build output and dependency directories', () => {
    expect(isSkipped('docs/src/.vitepress/dist/assets/app.css')).toBe(true)
    expect(isSkipped('docs/src/.vitepress/cache/deps/chunk.js')).toBe(true)
    expect(isSkipped('ui/node_modules/vue/index.js')).toBe(true)
    expect(isSkipped('ui/src/components/App/App.vue')).toBe(false)
    expect(isSkipped('ui/src/distribution/Chart.vue')).toBe(false)
    expect(isSkipped('editor/src/stores/cacheStore.ts')).toBe(false)
  })

  it('never lists a dist or cache file', () => {
    expect(sourceFiles().filter(file => /\/(dist|cache)\//.test(file))).toEqual([])
  })
})

describe('brand literals', () => {
  const allowlist = [
    'ui/src/styles/tokens.scss',
    'ui/src/styles/_effects.scss',
    'ui/src/components/Effect/BcRing/',
    'editor/src/components/Landing/LandingHero.vue',
    'editor/src/components/Landing/LandingCallout.vue',
    'docs/src/.vitepress/theme/markdown/bpc-fence.ts',
    'docs/src/.vitepress/theme/markdown/brand-default.ts',
  ]
  const forbidden = [
    '2563A0', '163A65', '102E55', '0A1E3D', '4B90CF', 'A3C9E8', 'E1EEF7', '244a7c',
    'rgba\\(37,\\s*99,\\s*160', 'rgba\\(75,\\s*144,\\s*207', 'rgba\\(163,\\s*201,\\s*232',
    '\\$prussian-',
    'E4512B', 'F2703F',
    '--bc-accent', '--bc-btn-primary-', 'btn-bc-primary', 'bc-highlight', '--bc-swipe',
  ]

  for (const literal of forbidden) {
    it(`has no ${literal} outside the allowlist`, () => {
      expect(offenders(allowlist, new RegExp(literal, 'i'))).toEqual([])
    })
  }

  for (const rel of [
    'ui/src/components/Gallery/GalleryCard/GalleryCard.vue',
    'ui/src/components/Scene/SceneTimelineItem/SceneTimelineItem.vue',
  ]) {
    it(`${rel} selected state uses --bc-selected-ring`, () => {
      expect(readFileSync(join(root, rel), 'utf8')).toContain('var(--bc-selected-ring)')
    })
  }
})

describe('type floor', () => {
  const FONT_SIZE = /font-size:\s*(\d*\.?\d+)(rem|px|em)\b/g
  const FLOOR = { rem: 0.75, em: 0.75, px: 12 }

  function tooSmall(file: string) {
    const source = readFileSync(join(root, file), 'utf8')
    return [...source.matchAll(FONT_SIZE)]
      .filter(([, value, unit]) => Number(value) < FLOOR[unit as keyof typeof FLOOR])
      .filter(({ index }) => !/\.bc-frame-[^{]*\{[^{}]*$/.test(source.slice(0, index)))
      .map(({ index }) => `${file}:${source.slice(0, index).split('\n').length}`)
  }

  it('has no font-size below 12px', () => {
    expect(sourceFiles().flatMap(tooSmall)).toEqual([])
  })
})

describe('motion', () => {
  const LITERAL_DURATION = /(?:transition|animation)(?:-duration)?:[^;{}]*\b\d*\.?\d+m?s\b/g
  const NO_PREFERENCE = /prefers-reduced-motion:\s*no-preference/

  function enclosingHeaders(source: string, index: number) {
    const headers: string[] = []
    let start = 0
    for (let i = 0; i < index; i++) {
      if (source[i] === '{') {
        headers.push(source.slice(start, i))
        start = i + 1
      }
      else if (source[i] === '}') {
        headers.pop()
        start = i + 1
      }
      else if (source[i] === ';') {
        start = i + 1
      }
    }
    return headers
  }

  function unguarded(file: string) {
    const full = readFileSync(join(root, file), 'utf8')
    const styleStart = file.endsWith('.vue') ? Math.max(full.indexOf('<style'), 0) : 0
    const source = full.slice(styleStart)
    if (file.endsWith('.ts')) {
      return []
    }
    return [...source.matchAll(LITERAL_DURATION)]
      .filter(({ index }) => !enclosingHeaders(source, index).some(header => NO_PREFERENCE.test(header)))
      .map(({ index }) => `${file}:${full.slice(0, styleStart + index).split('\n').length}`)
  }

  it('wraps literal durations in prefers-reduced-motion: no-preference', () => {
    expect(sourceFiles().flatMap(unguarded)).toEqual([])
  })
})

describe('on-primary label', () => {
  const PRIMARY_FILL = /\{[^{}]*background(?:-color)?:\s*var\(--bs-primary\)[^{}]*\}/g
  const WHITE_LABEL = /(?:^|[;{\s])color:\s*(?:#fff\b|#ffffff\b|white\b|var\(--bs-white)/i

  it('never sets a white label on a --bs-primary fill (primary is near-white in dark)', () => {
    const bad = sourceFiles().flatMap(file =>
      [...readFileSync(join(root, file), 'utf8').matchAll(PRIMARY_FILL)]
        .filter(([block]) => WHITE_LABEL.test(block))
        .map(() => file))
    expect(bad).toEqual([])
  })
})

describe('selected and focus rings', () => {
  it('PanelOpenButton hover uses the strong hover token, not a primary glow', () => {
    const source = readFileSync(join(root, 'editor/src/components/Panel/PanelOpenButton.vue'), 'utf8')
    expect(source).not.toContain('--bs-primary-rgb')
    expect(source).toContain('var(--bc-btn-strong-hover-bg)')
  })

  it('GalleryCard keeps the selected ring visible when focused', () => {
    const source = readFileSync(join(root, 'ui/src/components/Gallery/GalleryCard/GalleryCard.vue'), 'utf8')
    expect(source).not.toMatch(/var\(--bc-focus-ring\),\s*var\(--bc-selected-ring\)/)
    expect(source).toMatch(/var\(--bc-selected-ring\),\s*0 0 0 4px var\(--bs-body-bg\),\s*0 0 0 6px var\(--bs-emphasis-color\)/)
  })
})

describe('docs code and tertiary text', () => {
  const docsFile = (rel: string) => readFileSync(join(root, 'docs/src/.vitepress', rel), 'utf8')

  it('uses high-contrast Shiki themes', () => {
    const config = docsFile('config.ts')
    expect(config).toContain('light: \'github-light-high-contrast\'')
    expect(config).toContain('dark: \'github-dark-high-contrast\'')
  })

  it('bridges --vp-c-text-3 to the shared tertiary token in both themes', () => {
    const matches = docsFile('theme/style.css').match(/--vp-c-text-3:\s*var\(--bc-text-tertiary\)/g) ?? []
    expect(matches).toHaveLength(2)
  })
})
