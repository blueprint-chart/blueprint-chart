import type { ChartNode, SceneNode, PropertyNode, AnnotationNode, TransformNode } from './types'
import type { ChartOptionDef } from '../charts/types'
import { getChartOptions, listCharts } from '../charts/registry'
import { listThemes } from '../charts/themes'
import { ChartOptionType, AnnotationKind, ANNOTATION_KIND_KEYWORD } from '../enums'
import { propertyMap } from './converter'
import { TRANSFORM_TYPES } from '../transforms'

/**
 * A single validation finding. `code` is a stable machine-readable identifier,
 * `path` locates the offending node (dotted, scene-prefixed where relevant),
 * `message` is human-readable, and `suggestion` is an optional nearest-match
 * hint ("did you mean …").
 */
export interface ValidationIssue {
  code: string
  path: string
  message: string
  suggestion?: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
}

/**
 * Property keys that are read by the frame/render/layout code rather than by a
 * chart-type option def, so they are always allowed on a chart (and on scenes).
 * Built by grepping the property reads in src/render and src/charts/frame:
 *   - frame (ast-to-definition buildFrame): title, description, byline, note,
 *     source, sourceUrl, padding, transparentBackground
 *   - chart-level render fields (ast-to-definition): type, sort, sortMode, theme
 *   - layout-constraints: heightMode, aspectRatio, fixedHeight
 *   - editor layout/player fields (written by useDslOutput, read back by
 *     useDslSync): sizing, fixedWidth, maxWidth, player, playerPosition
 */
const FRAME_KEYS = new Set<string>([
  'title',
  'description',
  'byline',
  'note',
  'source',
  'sourceUrl',
  'padding',
  'transparentBackground',
  'type',
  'sort',
  'sortMode',
  'theme',
  'heightMode',
  'aspectRatio',
  'fixedHeight',
  'sizing',
  'fixedWidth',
  'maxWidth',
  'player',
  'playerPosition',
])

/**
 * Frame keys that only accept a fixed set of values. Theme names come from the
 * theme registry: a name with no stylesheet renders unstyled. The player values
 * are the ones the editor's ChartLayout accepts and useDslSync reads back;
 * anything else is silently dropped there.
 */
const FRAME_CHOICES = new Map<string, string[]>([
  ['theme', listThemes().map(t => t.name)],
  ['player', ['buttons', 'progress-bar', 'dot-stepper', 'minimal-arrows', 'none']],
  ['playerPosition', ['left', 'center', 'right']],
])

/**
 * Keys whose value is a length in pixels. A negative one never means what it
 * says: renderLineSymbols falls back to the default radius, and
 * applyLayoutConstraints emits a `height: -400px` the browser drops.
 */
const NON_NEGATIVE_KEYS = new Set<string>([
  'lineSymbolSize',
  'fixedHeight',
  'fixedWidth',
  'maxWidth',
])

/**
 * Known transform types: the set the pipeline executes, so the validator cannot
 * report a step the renderer honours (see transforms/index.ts).
 */
const KNOWN_TRANSFORM_TYPES = TRANSFORM_TYPES

/**
 * Per-kind allowlists for annotation body property keys, derived from the keys
 * convertAnnotations() in converter.ts actually reads for each kind. Anything
 * not listed is silently ignored by the converter, so we flag it. This is what
 * catches the `fromX`/`toX`-on-a-range bug.
 */
export const POINT_ANNOTATION_KEYS = new Set<string>([
  'text',
  'repeat',
  'textColor',
  'maxWidth',
  'textOutline',
  'showLine',
  'anchorDirection',
  'textOffsetX',
  'textOffsetY',
  'lineStyle',
  'lineWeight',
  'showArrow',
  'lineTargetDistance',
  'showCircle',
  'circleSize',
  'circleStyle',
  'circleColor',
])
export const RANGE_ANNOTATION_KEYS = new Set<string>([
  'start',
  'end',
  'repeat',
  'orientation',
  'startAnchor',
  'endAnchor',
  'bgColor',
  'bgOpacity',
  'direction',
  'text',
  'textColor',
])
export const FREE_ANNOTATION_KEYS = new Set<string>([
  'text',
  'x',
  'y',
  'repeat',
  'textColor',
  'maxWidth',
  'textOutline',
])

/** Levenshtein edit distance between two strings. */
function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  if (m === 0) {
    return n
  }
  if (n === 0) {
    return m
  }
  let prev = Array.from({ length: n + 1 }, (_, i) => i)
  let curr = new Array<number>(n + 1)
  for (let i = 1; i <= m; i++) {
    curr[0] = i
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost)
    }
    [prev, curr] = [curr, prev]
  }
  return prev[n]
}

/**
 * Pick the nearest candidate to `value` by edit distance. Returns undefined
 * when nothing is close enough (distance must be < half the value length, and
 * at most 3 edits) to avoid noisy suggestions.
 */
function nearest(value: string, candidates: Iterable<string>): string | undefined {
  let best: string | undefined
  let bestDist = Infinity
  for (const c of candidates) {
    const d = levenshtein(value.toLowerCase(), c.toLowerCase())
    if (d < bestDist) {
      bestDist = d
      best = c
    }
  }
  if (best === undefined) {
    return undefined
  }
  const threshold = Math.max(1, Math.min(3, Math.floor(value.length / 2)))
  return bestDist <= threshold ? best : undefined
}

function findDef(defs: ChartOptionDef[], key: string): ChartOptionDef | undefined {
  return defs.find(d => d.key === key)
}

function pushInvalidChoice(
  key: string,
  raw: unknown,
  allowed: string[],
  path: string,
  errors: ValidationIssue[],
): void {
  errors.push({
    code: 'invalid-choice',
    path,
    message: `${key} must be one of: ${allowed.map(v => `"${v}"`).join(', ')}; got "${raw}".`,
    suggestion: nearest(String(raw), allowed.filter(v => v !== '')),
  })
}

/** Reject a negative length on the keys that cannot carry one. */
function validateNonNegative(prop: PropertyNode, path: string, errors: ValidationIssue[]): void {
  if (!NON_NEGATIVE_KEYS.has(prop.key)) {
    return
  }
  const num = parseFloat(String(prop.value))
  if (Number.isFinite(num) && num < 0) {
    errors.push({
      code: 'invalid-number',
      path,
      message: `${prop.key} must not be negative; got "${prop.value}".`,
    })
  }
}

/**
 * Validate a single property against a chart-type option def: boolean values
 * and choice membership. Pushes onto `errors`.
 */
function validateOptionValue(
  def: ChartOptionDef,
  prop: PropertyNode,
  path: string,
  errors: ValidationIssue[],
): void {
  const raw = prop.value
  const str = String(raw).toLowerCase()

  if (def.type === ChartOptionType.Boolean) {
    // Preserve the converter's special case: valueLabels also accepts percent.
    if (def.key === 'valueLabels' && str === 'percent') {
      return
    }
    // PropertyNode.value is string | number; real booleans (from callers that
    // pre-coerce) and the string spellings are both accepted.
    if (raw as unknown === true || raw as unknown === false || str === 'true' || str === 'false') {
      return
    }
    errors.push({
      code: 'invalid-boolean',
      path,
      message: `${def.key} expects true or false, got "${raw}".`,
      suggestion: str === 'no' || str === '0' || str === 'off' ? 'false' : 'true',
    })
    return
  }

  if (def.choices && def.choices.length > 0) {
    const allowed = def.choices.map(c => c.value)
    if (allowed.includes(String(raw))) {
      return
    }
    // Empty-string choice means "unset" is valid; an explicitly empty value is fine.
    if (String(raw) === '' && allowed.includes('')) {
      return
    }
    pushInvalidChoice(def.key, raw, allowed, path, errors)
  }
}

/**
 * Validate property keys + values for a chart or scene against the effective
 * chart type's option defs and the FRAME_KEYS allowlist.
 */
function validateProperties(
  chartType: string,
  properties: PropertyNode[],
  basePath: string,
  errors: ValidationIssue[],
): void {
  const defs = getChartOptions(chartType)
  const knownKeys = new Set<string>([...defs.map(d => d.key), ...FRAME_KEYS])

  for (const prop of properties) {
    const path = `${basePath}.${prop.key}`
    validateNonNegative(prop, path, errors)
    const frameChoices = FRAME_CHOICES.get(prop.key)
    // An empty value means "unset" here too: the frame drops an empty theme and
    // the editor ignores an empty player, exactly as if the key were absent.
    if (frameChoices && String(prop.value) !== '' && !frameChoices.includes(String(prop.value))) {
      pushInvalidChoice(prop.key, prop.value, frameChoices, path, errors)
    }
    if (FRAME_KEYS.has(prop.key)) {
      continue
    }
    const def = findDef(defs, prop.key)
    if (!def) {
      errors.push({
        code: 'unknown-property',
        path,
        message: `Unknown property "${prop.key}" for chart type "${chartType}".`,
        suggestion: nearest(prop.key, knownKeys),
      })
      continue
    }
    validateOptionValue(def, prop, path, errors)
  }
}

function annotationKeysFor(kind: AnnotationKind): Set<string> {
  if (kind === AnnotationKind.Range) {
    return RANGE_ANNOTATION_KEYS
  }
  if (kind === AnnotationKind.Free) {
    return FREE_ANNOTATION_KEYS
  }
  return POINT_ANNOTATION_KEYS
}

function annotationLabel(kind: AnnotationKind): string {
  return ANNOTATION_KIND_KEYWORD[kind]
}

/** Validate annotation/range/note body keys against the converter's allowlists. */
function validateAnnotations(
  annotations: AnnotationNode[],
  basePath: string,
  errors: ValidationIssue[],
): void {
  annotations.forEach((a, i) => {
    const kind = a.kind ?? AnnotationKind.Point
    const allowed = annotationKeysFor(kind)
    const label = annotationLabel(kind)
    for (const prop of a.properties) {
      if (allowed.has(prop.key)) {
        continue
      }
      errors.push({
        code: 'unknown-annotation-property',
        path: `${basePath}.${label}[${i}].${prop.key}`,
        message: `Unknown ${label} property "${prop.key}"; it will be silently ignored.`,
        suggestion: nearest(prop.key, allowed),
      })
    }
    const repeatRaw = propertyMap(a.properties).get('repeat')
    if (repeatRaw !== undefined) {
      const repeatWord = String(repeatRaw).toLowerCase()
      const ok = repeatWord === 'true' || repeatWord === 'false'
        || (typeof repeatRaw === 'number' && Number.isInteger(repeatRaw) && repeatRaw >= 1)
      if (!ok) {
        errors.push({
          code: 'invalid-annotation-repeat',
          message: `repeat must be false, true, or a positive integer (got ${String(repeatRaw)})`,
          path: `${basePath}.${label}[${i}].repeat`,
        })
      }
    }
  })
}

/** Validate transform types against the known set. */
function validateTransforms(
  transforms: TransformNode[],
  basePath: string,
  errors: ValidationIssue[],
): void {
  transforms.forEach((t, i) => {
    if (KNOWN_TRANSFORM_TYPES.has(t.transformType)) {
      return
    }
    errors.push({
      code: 'unknown-transform',
      path: `${basePath}.transform[${i}]`,
      message: `Unknown transform type "${t.transformType}". Known types: ${[...KNOWN_TRANSFORM_TYPES].map(v => `"${v}"`).join(', ')}.`,
      suggestion: nearest(t.transformType, KNOWN_TRANSFORM_TYPES),
    })
  })
}

/**
 * Category and series names a highlight or colorize target can resolve to.
 * Scene data is folded in because a chart-level target applies to every scene,
 * so a name that only exists in one scene is still resolved.
 */
function targetUniverse(ast: ChartNode): Set<string> {
  const names = new Set<string>()
  for (const block of [ast.data, ...ast.scenes.map(s => s.data)]) {
    for (const entry of block?.entries ?? []) {
      if (entry.key === 'series' && !entry.quotedKey) {
        for (const v of entry.values ?? [entry.value]) {
          names.add(String(v))
        }
        continue
      }
      names.add(entry.key)
    }
  }
  return names
}

/**
 * Warn on a highlight or colorize naming something the data does not contain:
 * the renderer resolves the target against category and series names, so a
 * renamed category leaves the directive with nothing to act on.
 */
function validateTargets(ast: ChartNode, warnings: ValidationIssue[]): void {
  const names = targetUniverse(ast)
  if (names.size === 0) {
    return
  }
  const blocks: Array<{ basePath: string, keyword: string, nodes: { target: string }[] }> = [
    { basePath: 'chart', keyword: 'highlight', nodes: ast.highlights },
    { basePath: 'chart', keyword: 'colorize', nodes: ast.colorizes },
    ...ast.scenes.flatMap((s, i) => [
      { basePath: `scene[${i}]`, keyword: 'highlight', nodes: s.highlights },
      { basePath: `scene[${i}]`, keyword: 'colorize', nodes: s.colorizes },
    ]),
  ]
  for (const { basePath, keyword, nodes } of blocks) {
    nodes.forEach((node, i) => {
      if (names.has(node.target)) {
        return
      }
      warnings.push({
        code: 'unresolved-target',
        path: `${basePath}.${keyword}[${i}]`,
        message: `${keyword} "${node.target}" matches no category or series; it has no effect.`,
        suggestion: nearest(node.target, names),
      })
    })
  }
}

/**
 * Validate a chart AST for value-level semantic problems that the renderer
 * would otherwise swallow with silent fallbacks (devex-review finding 6).
 *
 * Returns errors (things that change or drop the user's intent) and warnings
 * (currently none; reserved for softer signals). `valid` is true iff there are
 * no errors.
 */
export function validateChart(ast: ChartNode): ValidationResult {
  const errors: ValidationIssue[] = []
  const warnings: ValidationIssue[] = []

  // 1. Chart type.
  const charts = listCharts()
  const typeKnown = charts.includes(ast.chartType)
  if (!typeKnown) {
    errors.push({
      code: 'unknown-chart-type',
      path: 'chartType',
      message: `Unknown chart type "${ast.chartType}".`,
      suggestion: nearest(ast.chartType, charts),
    })
  }

  // Only validate properties/options against defs when the type is known,
  // otherwise getChartOptions returns [] and every property looks unknown.
  if (typeKnown) {
    validateProperties(ast.chartType, ast.properties, 'chart', errors)
  }

  // 5. Transforms (chart level).
  validateTransforms(ast.transforms, 'chart', errors)

  // 6. Annotation body keys (chart level).
  validateAnnotations(ast.annotations, 'chart', errors)

  // 7. Data presence (chart level, unless scenes carry their own data).
  const hasChartData = !!ast.data && ast.data.entries.length > 0
  const anySceneData = ast.scenes.some(s => !!s.data && s.data.entries.length > 0)
  if (!hasChartData && !anySceneData) {
    errors.push({
      code: 'missing-data',
      path: 'data',
      message: ast.data && ast.data.entries.length === 0
        ? 'Data block is empty.'
        : 'Chart has no data.',
    })
  }

  // 8. Series meta-row pitfalls (soft signals — the parse is legal either way).
  if (ast.data) {
    validateSeriesMetaRow(ast.data.entries, warnings)
  }

  // 9. Highlight / colorize targets that resolve to nothing (soft signal).
  validateTargets(ast, warnings)

  // Scenes: each scene's effective chart type is its `type` override or the
  // chart's type (mirrors extractSceneOverrides).
  ast.scenes.forEach((scene, i) => {
    validateScene(scene, ast.chartType, i, errors)
  })

  return { valid: errors.length === 0, errors, warnings }
}

/**
 * Soft warnings around the reserved `series` meta-row in data blocks:
 * - an unquoted `series` row whose values are all numbers almost certainly
 *   meant a data category, but parses as the column header (silent data loss);
 * - a meta-row that is not the first entry is ignored by the string-format
 *   parsers, silently collapsing the chart to single-series.
 */
function validateSeriesMetaRow(entries: PropertyNode[], warnings: ValidationIssue[]): void {
  const metaIndex = entries.findIndex(e => e.key === 'series' && !e.quotedKey)
  if (metaIndex === -1) {
    return
  }
  const meta = entries[metaIndex]
  const metaValues = meta.values ?? [meta.value]
  if (metaValues.every(v => typeof v === 'number')) {
    warnings.push({
      code: 'numeric-series-meta-row',
      path: 'data.series',
      message: 'The unquoted `series` row names the chart columns, but its values are all numbers. If you meant a data category named series, quote the label.',
      suggestion: `"series" = ${metaValues.join(',')}`,
    })
  }
  if (metaIndex !== 0) {
    warnings.push({
      code: 'misplaced-series-meta-row',
      path: 'data.series',
      message: 'The `series` meta-row must be the first entry in the data block; later rows are ignored and the chart falls back to a single series.',
      suggestion: 'Move the series row to the top of the data block.',
    })
  }
}

function validateScene(
  scene: SceneNode,
  chartType: string,
  index: number,
  errors: ValidationIssue[],
): void {
  const basePath = `scene[${index}]`
  const typeOverride = scene.properties.find(p => p.key === 'type')?.value
  const effectiveType = typeOverride != null ? String(typeOverride) : chartType

  // A scene type override that names an unknown chart type is itself an error.
  if (typeOverride != null && !listCharts().includes(effectiveType)) {
    errors.push({
      code: 'unknown-chart-type',
      path: `${basePath}.type`,
      message: `Unknown chart type "${effectiveType}".`,
      suggestion: nearest(effectiveType, listCharts()),
    })
  }
  else {
    validateProperties(effectiveType, scene.properties, basePath, errors)
  }

  validateTransforms(scene.transforms, basePath, errors)
  validateAnnotations(scene.annotations, basePath, errors)
}
