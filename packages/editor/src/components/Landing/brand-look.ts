// Applies the Blueprint Bold brand look to a sample's BPC source for the
// landing/marketing previews. It drops any author-declared palette so the
// brand palette is the only one, then injects the brand theme + palette +
// a transparent background as the first properties of the chart block.
// Rendered with colors NOT stripped so the brand palette actually reaches
// the chart. transparentBackground lets every landing chart sit directly on
// its section surface (dark island or light page) instead of a chart card;
// the blueprint-bold theme still tunes grid/axis/text per light/dark.

const BRAND_INJECT = '{\n  theme = "blueprint-bold"\n  colorPalette = "BlueprintBold"\n  transparentBackground = true'

export function applyBrandLook(dsl: string): string {
  const withoutColors = dsl.replace(/^[ \t]*(colorPalette|colors)[ \t]*=.*\r?\n?/gm, '')
  return withoutColors.replace('{', BRAND_INJECT)
}
