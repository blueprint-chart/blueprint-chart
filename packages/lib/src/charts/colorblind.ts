/**
 * Color Vision Deficiency (CVD) simulation using Brettel/Viénot matrices.
 * Creates SVG `<filter>` elements with `<feColorMatrix>` for live preview.
 */

export type CvdType = 'protanopia' | 'deuteranopia' | 'tritanopia'

/** Viénot simulation matrices (linearized sRGB). */
const CVD_MATRICES: Record<CvdType, number[]> = {
  protanopia: [
    0.152286, 1.052583, -0.204868, 0, 0,
    0.114503, 0.786281, 0.099216, 0, 0,
    -0.003882, -0.048116, 1.051998, 0, 0,
    0, 0, 0, 1, 0,
  ],
  deuteranopia: [
    0.367322, 0.860646, -0.227968, 0, 0,
    0.280085, 0.672501, 0.047413, 0, 0,
    -0.011820, 0.042940, 0.968881, 0, 0,
    0, 0, 0, 1, 0,
  ],
  tritanopia: [
    1.255528, -0.076749, -0.178779, 0, 0,
    -0.078411, 0.930809, 0.147602, 0, 0,
    0.004733, 0.691367, 0.303900, 0, 0,
    0, 0, 0, 1, 0,
  ],
}

/**
 * Returns the SVG filter element ID for a given CVD type.
 */
export function getCvdFilterId(type: CvdType): string {
  return `bc-cvd-${type}`
}

/**
 * Creates an SVG `<filter>` element with an `<feColorMatrix>` for the given CVD type.
 * The filter can be applied via CSS `filter: url(#<id>)`.
 */
export function createCvdSvgFilter(type: CvdType): SVGFilterElement {
  const ns = 'http://www.w3.org/2000/svg'
  const filter = document.createElementNS(ns, 'filter')
  filter.setAttribute('id', getCvdFilterId(type))
  filter.setAttribute('color-interpolation-filters', 'linearRGB')

  const matrix = document.createElementNS(ns, 'feColorMatrix')
  matrix.setAttribute('type', 'matrix')
  matrix.setAttribute('values', CVD_MATRICES[type].join(' '))
  filter.appendChild(matrix)

  return filter
}
