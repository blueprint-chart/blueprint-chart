// Blueprint Chart - brand-default injection for docs ```bpc previews.
//
// Docs default the brand look (blueprint-bold theme + BlueprintBold palette)
// onto fenced samples that do not choose their own, rewriting the fence source
// so the displayed code and the live preview stay identical. Samples that
// teach a specific palette/theme (they declare one) are left untouched.

export const BRAND_THEME = 'blueprint-bold'
export const BRAND_PALETTE = 'BlueprintBold'

/** True when the BPC source already sets a `theme` or `colorPalette` property. */
export function declaresPaletteOrTheme(source: string): boolean {
  // Match a property assignment at the start of a (trimmed) line only, so a
  // data key like "theme park" cannot trigger a false positive.
  return /^[ \t]*(theme|colorPalette)[ \t]*=/m.test(source)
}

/**
 * Insert the brand theme + palette as the first two properties inside the
 * top-level `chart ... {` block. Replaces only the first `{` (the chart opener).
 * The theme renders on a black canvas where the raw brand palette already
 * clears contrast, so no autoContrast is needed.
 */
export function injectBrandDefault(source: string): string {
  return source.replace(
    /\{/,
    `{\n  theme = "${BRAND_THEME}"\n  colorPalette = "${BRAND_PALETTE}"`,
  )
}
