// Applies the Blueprint Bold brand look to a sample's BPC source for the
// landing/marketing previews. It drops any author-declared palette so the
// brand palette is the only one, then injects the brand theme + palette as
// the first properties of the chart block. Rendered with colors NOT stripped
// so the brand palette actually reaches the chart.

const BRAND_INJECT = '{\n  theme = "blueprint-bold"\n  colorPalette = "BlueprintBold"'

export function applyBrandLook(dsl: string): string {
  const withoutColors = dsl.replace(/^[ \t]*(colorPalette|colors)[ \t]*=.*\r?\n?/gm, '')
  return withoutColors.replace('{', BRAND_INJECT)
}
