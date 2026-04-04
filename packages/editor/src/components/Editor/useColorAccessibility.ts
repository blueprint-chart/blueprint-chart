import type { MaybeRefOrGetter } from 'vue'
import { wcagContrastRatio, wcagLevel, adjustColorsForBackground, checkCvdColors } from '@blueprint-chart/lib'
import type { CvdType } from '@blueprint-chart/lib'

const LIGHT_BG = '#ffffff'
const DARK_BG = '#1a1a1a'

const CVD_SHORT_LABELS: Record<CvdType, string> = {
  protanopia: 'Protan',
  deuteranopia: 'Deutan',
  tritanopia: 'Tritan',
}

function computeContrast(colors: string[], bg: string, autoContrast: boolean) {
  const adjusted = autoContrast ? adjustColorsForBackground(colors, bg) : colors
  const ratios = adjusted.map(c => wcagContrastRatio(c, bg))
  const minRatio = Math.min(...ratios)
  return { level: wcagLevel(minRatio), ratio: `${minRatio.toFixed(1)}:1` }
}

export function useColorAccessibility(
  activeColors: MaybeRefOrGetter<string[]>,
  autoContrast: MaybeRefOrGetter<boolean>,
  allowDarkMode: MaybeRefOrGetter<boolean>,
) {
  const lightContrastInfo = computed(() => {
    const raw = toValue(activeColors)
    if (raw.length === 0) {
      return null
    }
    return computeContrast(raw, LIGHT_BG, toValue(autoContrast))
  })

  const darkContrastInfo = computed(() => {
    const raw = toValue(activeColors)
    if (raw.length === 0) {
      return null
    }
    if (!toValue(allowDarkMode)) {
      return null
    }
    return computeContrast(raw, DARK_BG, toValue(autoContrast))
  })

  const cvdInfo = computed(() => {
    const colors = toValue(activeColors)
    if (colors.length === 0) {
      return null
    }
    const issues = colors.length >= 2 ? checkCvdColors(colors) : []
    if (issues.length === 0) {
      return { safe: true as const, issues: [] as { type: CvdType, shortLabel: string, tooltip: string }[] }
    }
    return {
      safe: false as const,
      issues: issues.map(i => ({
        type: i.type,
        shortLabel: CVD_SHORT_LABELS[i.type],
        tooltip: `${i.label}: ${i.pairs.length} color ${i.pairs.length === 1 ? 'pair' : 'pairs'} may be hard to distinguish.`,
      })),
    }
  })

  return { lightContrastInfo, darkContrastInfo, cvdInfo }
}
