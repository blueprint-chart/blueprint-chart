import * as d3 from 'd3'

export function makeChartStub(g: SVGGElement) {
  return { base: d3.select(g) } as unknown
}
